var mongoose = require("mongoose");
var validators = require("mongoose-validators");
var ObjectId = mongoose.Schema.Types.ObjectId;
var async = require('async');
var PythonShell = require('python-shell');
var CronJob = require('cron').CronJob;
var dateFormat = require('dateformat');
var User = require("../models/user.js"); 
var utils = require("../javascripts/utils.js");
var email = require('../javascripts/email.js');
var Registration = require("../models/registration.js"); 


var ScheduleSchema = mongoose.Schema({
    student: {type: ObjectId, ref:"User", required:true},
    tutor: {type: ObjectId, ref:"User", required:true},
    possibleCourses: {type:[String], required:true},
    studentPossibleSchedules: {type:mongoose.Schema.Types.Mixed, required:true},
    tutorPossibleSchedules: {type:mongoose.Schema.Types.Mixed, required:true},
    UTCPossibleSchedules: {type:mongoose.Schema.Types.Mixed, required:true},
    studentReg: {type: ObjectId, ref:"Registration", required:true},
    tutorReg: {type: ObjectId, ref:"Registration", required:true},
    adminApproved: {type: Boolean, required: true, default: false},
    course: {type: String},
    studentClassSchedule: {type: [[String]]},
    tutorClassSchedule: {type: [[String]]},
    UTCClassSchedule: {type: [[String]]},
    firstDateTimeUTC: {type: [[String]]}, 
    lastDateTimeUTC: {type: [[String]]},
    studentCoord :{type: ObjectId, ref:"User"},
    tutorCoord :{type: ObjectId, ref:"User"}   
});

ScheduleSchema.path("course").validate(function(course) {
    return course.trim().length > 0;
}, "No empty course name.");

/**
* Gets the schedules for displaying the user's dashboard
* @param {Object} user - the user object of the user
* @param {Function} callback - the function that gets called after the schedules are fetched
*/
ScheduleSchema.statics.getSchedules = function (user, callback) {
    if (utils.isRegularUser(user.role)) {
        // get personal schedules
        Schedule.find( {$and: [{adminApproved: true}, {$or: [{student: user._id}, {tutor: user._id}]}]}).populate('student').populate('tutor').populate('studentCoord').populate('tutorCoord').exec(function (err, schedules) {
            if (err) {
                callback({success: false, message: err.message});
            } else {
                callback(null, schedules);
            }
        });
    } else if (utils.isCoordinator(user.role)) {
        // get schedules for that the user is a coordinator of
        User.getUser(user.username, function (err, user) {
            if (err) {
                callback({success: false, message: err.message});
            } else {
                Schedule.find( {$and: [{adminApproved: true}, {$or: [{studentCoord: user._id}, {tutorCoord: user._id}]}]}).populate('student').populate('tutor').populate('studentCoord').populate('tutorCoord').exec(function (err, schedules) {
                    if (err) {
                        callback({success: false, message: err.message});
                    } else {
                        callback(null, schedules);
                    }
                });
            }
        })
    } else {
        // must be an admin, get all schedules
        Schedule.find({}).populate('student').populate('tutor').populate('studentCoord').populate('tutorCoord').exec(function (err, schedules) {
            if (err) {
                callback({success: false, message: err.message});
            } else {
                callback(null, schedules);
            }
        });
    }
};

/**
* Gets unmatched registrations, runs python matching script, and save the recommended matches
* @param {Function} callback - the function that gets called after the schedules are fetched
*/
ScheduleSchema.statics.getMatches = function (callback) {

    Registration.getUnmatchedRegistrations(function (err, registrations) {
        console.log('unmatched registrations', registrations.length);
        registrations = registrations.map(function (registration) {
            registration = registration.toJSON();
            registration['earliestStartTime'] = dateFormat(registration.earliestStartTime, "yyyy-mm-dd");
            return registration;
        });

        var options = {
            mode: 'json',
            pythonPath: '.env/bin/python2.7',
            scriptPath: './scheduler/',
            args: [JSON.stringify(registrations)]
        };

        PythonShell.run('main.py', options, function (err, outputs) {
            if (err) {
                throw err;
            }
            console.log('got matches');
            var matches = outputs[0];
            if (matches.length == 0) {
                callback(null, []);
            } else {
                Schedule.saveSchedules(matches, function (err, schedules) {
                    console.log('saving schedules...');
                    if (err) {
                        callback({success: false, message: err.message});
                    } else {
                        callback(null, schedules);
                    }
                });
            }
        });
    });
};

/*
* Initializes a tutor matching cron job that runs every Sunday at 5pm (ET),
* notify the admins if there are the new matches
*/
ScheduleSchema.statics.automateMatch = function () {
    var schedulerJob = new CronJob({
        cronTime: '00 00 17 * * 6',
        onTick: function() {
            // runs every Sunday at 5pm
            Schedule.getMatches(function (err, matches) {
                if (err) {
                    console.log('An error has occured', err.message);
                } else {
                    var numMatches = matches.length;
                    var message = 'Successfully generated ' +  numMatches + ' new ';
                    message += numMatches > 1 ? 'matches!': 'match!'
                    console.log(message);
                    // only notify admins after finishing saving all matches
                    Schedule.notifyAdmins(matches.length, function (err) {
                        if (err) {
                            console.log(err);
                        } else { 
                            console.log('Successfully notified admins about weekly matches');
                        }
                    });
                }
            });
        },
        start: false,
        timeZone: 'America/New_York'
    });
    global.schedulerJob = schedulerJob;
    global.schedulerJob.start();
};

/*
* For each match, mark the matched registrations as matched, saves the schedule to the database
* and schedule a cron job that will remove the pending schedule if it does not get approved
* by the first possible start date. After finish saving, notify admins if there are the new matches 
* @param {Array} matches - an array of match objects output by the python matching script
* @param  {Function} callback - the function that takes in an object and is
*                               called once this function is done
*/
ScheduleSchema.statics.saveSchedules = function (matches, callback) {
    var count = 0;
    console.log('number of matches', matches.length);
    matches.forEach(function (match) {
        // mark the matched registrations as unmatched
        console.log('count', count)
        Registration.markAsMatched([match.studentRegID, match.tutorRegID], function (err, registration) {
            console.log('marking registrations as matched...');
            if (err) {
                console.log(err);
                callback({success: false, message: err.message});
            } else {
                // make scheduler JSON for creating a schedule object
                console.log('done marking registrations, creating the schedule...')
                Schedule.createScheduleJSON(match, function (err, scheduleJSON) {
                    Schedule.create(scheduleJSON, function (err, schedule) {
                        if (err) {
                            callback({success: false, message: err.message});
                        } else {
                            Schedule.scheduleExpiredRemove(schedule, function (err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log('scheduled a expired check')
                                }
                            });
                            count++;
                            if (count === matches.length) {
                                // only notify admins after finishing saving all matches
                                console.log('done saving the schedules!')
                                Schedule.notifyAdmins(matches.length, function (err) {
                                if (err) {
                                    callback({success: false, message: err.message});
                                } else { 
                                        callback(null, matches);
                                    }
                                });
                            };
                        }
                    });
                });
            }
        });
    });
}

/*
* Creates a JSON for creating schedule object using the data provided
* @param {Object} match - the object which contains information about the schedule
* @param  {Function} callback - the function that takes in an object and is
*                               called once this function is done
*/
ScheduleSchema.statics.createScheduleJSON = function (match, callback) {
    var scheduleJSON = {student: match.studentID,
                        tutor: match.tutorID,
                        studentReg: match.studentRegID,
                        tutorReg: match.tutorRegID,
                        possibleCourses: match.possibleCourses};
    scheduleJSON.studentPossibleSchedules = utils.formatDates(match.studentPossibleSchedules);
    scheduleJSON.tutorPossibleSchedules = utils.formatDates(match.tutorPossibleSchedules);
    scheduleJSON.UTCPossibleSchedules = utils.formatDates(match.UTCPossibleSchedules);
    User.findCoordinator(scheduleJSON.student, function (err, studentCoord) {
        if (err) {
            callback({success: false, message: err.message});
        } else {
            scheduleJSON.studentCoord = studentCoord ? studentCoord._id: null;
            User.findCoordinator(scheduleJSON.tutor, function (err, tutorCoord) {
                if (err) {
                    callback({success: false, message: err.message});
                } else {
                    scheduleJSON.tutorCoord = tutorCoord ? tutorCoord._id: null;
                    callback(null, scheduleJSON);
                }
            });
        }
    });
}

/*
* Creates the schedule using the scheduleJSON provided
* @param {Object} scheduleJSON - the json object which contains information about the schedule
* @param  {Function} callback - the function that takes in an object and is
*                               called once this function is done
*/        
ScheduleSchema.statics.createSchedule = function (scheduleJSON, callback) {
    Schedule.create(scheduleJSON, function (err, schedule) {
        if (err) {
            console.log(err);
            callback({success: false, message: err.message});
        } else {
            callback(null, schedule);
        }
    }); 
}

/*
* Creates and starts a cron job that will run on the first possible class meeting day
* that checks whether the schedule has been approved. If not, remove the schedule object
* @param {Object} schedule - the mongoose schedule object of the schedule
* @param  {Function} callback - the function that takes in an object and is
*                               called once this function is done
*/
ScheduleSchema.statics.scheduleExpiredRemove = function (schedule, callback) {
    var job = new CronJob(new Date(schedule.UTCPossibleSchedules[0][0][0]), function() {
        Schedule.find({_id: schedule._id}, function (err, schedule) {
            if (err) {
                callback({success: false, message: err.message});
            } else {
                if (!schedule.adminApproved) {
                    Schedule.rejectSchedule(schedule._id, function (err) {
                        if (err) {
                            callback({success: false, message: err.message});
                        } else {
                            console.log('deleted an outdated pending schedule');
                        }
                    });  
                }
            }
        });
    }, function () {
        /* This function is executed when the job stops */
    },
      true, /* Start the job right now */
      'America/New_York' /* Time zone of this job. */
    );
}       
 
/*
* Finds admins and send emails to inform them about the new matches
* @param {Number} numMatches - the number of matches
* @param  {Function} callback - the function that takes in an object and is
*                               called once this function is done
*/
ScheduleSchema.statics.notifyAdmins = function (numMatches, callback) {               
    if (numMatches > 0) {
        User.find({role: 'Administrator', approved: true, verified: true, archived: false}, function (err, admins) {
            console.log('admins', admins.length);
            if (err) {
                callback({success: false, message: err.message});
            } else {
                email.notifyAdmins(numMatches, admins, callback); 
            }
        });
    } else {
        console.log('no new matches, admins not notified');
        callback(null);
    }
}

/*
* Approves the schedule with the given id and inform the student and tutor about the
* final schedule and schedules a cron job that send out weekly reminder to the student
* and tutor to confirm whether they can make the meeting that checks whether the schedule
* has been approved. If not, remove the schedule object
* @param {String} scheduleId - the ID of the mongoose schedule object of the schedule
* @param {Number} scheduleIndex - the index of the selected schedule
* @param {String} course - the name of the selected course
* @param  {Function} callback - the function that takes in an object and is
*                               called once this function is done
*/
ScheduleSchema.statics.approveSchedule = function (scheduleId, scheduleIndex, course, callback) {
    console.log('in approveSchedule');
    if (scheduleIndex === -1) {
        callback({success: false, message: 'Please select a schedule from the list of possible schedules'});
    } else {
        Schedule.findOne({ _id: scheduleId}).populate('student').populate('tutor').exec(function (err, schedule) {
            if (err) {
                callback({success: false, message: err.message});
            } else {
                schedule.adminApproved = true;
                schedule.course = course;
                schedule.studentClassSchedule = schedule.studentPossibleSchedules[scheduleIndex];
                schedule.tutorClassSchedule = schedule.tutorPossibleSchedules[scheduleIndex];
                schedule.UTCClassSchedule = schedule.UTCPossibleSchedules[scheduleIndex];
                schedule.firstDateTimeUTC = schedule.UTCClassSchedule[0];
                schedule.lastDateTimeUTC = schedule.UTCClassSchedule.slice(-1)[0];
                schedule.save(function (err, updatedSchedule) {
                    // inform the student and tutor
                    email.sendScheduleEmails(schedule.student, function (err) {
                        if (err) {
                            callback({sucess: false, message: err.message});
                        } else {
                            email.sendScheduleEmails(schedule.tutor, function (err) {
                                if (err) {
                                    callback({sucess: false, message: err.message});
                                } else {
                                    Schedule.scheduleWeeklyReminder(schedule, function (err) {
                                        if (err) {
                                            console.log(err);
                                        }
                                    })
                                    callback(null, updatedSchedule);
                                }
                            });
                        }
                        
                    });
                });
            }
        });
    }
}

/*
* Creates and starts a cron job that will send out emails to student and tutor
* about the meeting time that week
* @param {Object} schedule - the mongoose schedule object of the schedule
* @param  {Function} callback - the function that takes in an object and is
*                               called once this function is done
*/
ScheduleSchema.statics.scheduleWeeklyReminder = function (schedule, callback) {
    // send weekly emails three days ahead of meeting day
    var dayOfWeek = new Date(schedule.firstDateTimeUTC[0]).getDay() - 3;
    dayOfWeek = dayOfWeek < 0 ? dayOfWeek + 7: dayOfWeek;
    var emailJob = new CronJob({
        cronTime: '00 00 17 * * ' + dayOfWeek,
        onTick: function() {
            // runs every week at 5pm
            email.sendReminderEmail(schedule.student, schedule.studentClassSchedule, function (err) {
                if (err) {
                    console.log('Failed to send reminder email to the student');
                }
            });
            email.sendReminderEmail(schedule.tutor, schedule.tutorClassSchedule, function (err) {
                if (err) {
                    console.log('Failed to send reminder email to the tutor');
                } 
            });
        },
        start: true,
        timeZone: 'America/New_York'
    });
}  

/*
* Rejects the schedule with the given id by removing the schedule from the database
* @param {String} scheduleId - the ID of the mongoose schedule object of the schedule
* @param  {Function} callback - the function that takes in an object and is
*                               called once this function is done
*/
ScheduleSchema.statics.rejectSchedule = function (scheduleId, callback) {
    Schedule.findOne({ _id: scheduleId}, function(err, schedule) {
        var studentRegId = schedule.studentReg;
        var tutorRegId = schedule.tutorReg;
        if (err){
            callback({success: false, message: err.message});
        }
        else {
            Registration.markAsUnmatched([studentRegId, tutorRegId], function (err, registrationIds) {
                if (err) {
                    callback({success: false, message: err.message});
                } else {
                    schedule.remove(function (err) {
                        if (err) {
                            callback({success: false, message: err.message});
                        } else {
                            callback(null);
                        }
                    });
                } 
            }); 
        }
    });
}

var Schedule = mongoose.model("Schedule", ScheduleSchema);
module.exports = Schedule;