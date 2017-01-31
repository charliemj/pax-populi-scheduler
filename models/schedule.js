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
    tutorApproved: {type: Boolean, required: true, default: false},
    studentApproved: {type: Boolean, required: true, default: false},
    course: {type: String},
    studentClassSchedule: {type: [[String]]},
    tutorClassSchedule: {type: [[String]]},
    UTCClassSchedule: {type: [[String]]}, // for Admins
    firstDateTimeUTC: {type: [[String]]}, 
    lastDateTimeUTC: {type: [[String]]}, //so we know when to delete the schedule from the DB
    studentCoord :{type: ObjectId, ref:"User"},
    tutorCoord :{type: ObjectId, ref:"User"}   
});

ScheduleSchema.path("course").validate(function(course) {
    return course.trim().length > 0;
}, "No empty course name.");

// more validation
ScheduleSchema.statics.getSchedules = function (user, callback) {
    if (utils.isRegularUser(user.role)) {
        // get personal schedules
        Schedule.find( {$or: [{student: user._id}, {tutor: user._id}]} ).populate('student').populate('tutor').populate('studentCoord').populate('tutorCoord').exec(function (err, schedules) {
            if (err) {
                callback({success: false, message: err.message});
            } else {
                callback(null, schedules);
            }
        });
    } else if (utils.isCoordinator(user.role)) {
        // get schedules for that school/country/region
        User.getUser(user.username, function (err, user) {
            if (err) {
                callback({success: false, message: err.message});
            } else {
                Schedule.find( {$or: [{studentCoord: user._id}, {tutorCoord: user._id}]}).populate('student').populate('tutor').populate('studentCoord').populate('tutorCoord').exec(function (err, schedules) {
                    if (err) {
                        callback({success: false, message: err.message});
                    } else {
                        callback(null, schedules);
                    }
                });
            }
        })
    } else {
        // must be an admin
        Schedule.find({}).populate('student').populate('tutor').populate('studentCoord').populate('tutorCoord').exec(function (err, schedules) {
            if (err) {
                callback({success: false, message: err.message});
            } else {
                callback(null, schedules);
            }
        });
    }
}

ScheduleSchema.statics.saveSchedules = function (matches, callback) {
    matches.forEach(function (match) {
        var scheduleJSON = {
            student: match.studentID,
            tutor: match.tutorID,
            studentReg: match.studentRegID,
            tutorReg: match.tutorRegID,
            possibleCourses: match.possibleCourses
        }
        Registration.markAsMatched([scheduleJSON.tutorReg, scheduleJSON.studentReg], function (err, registration) {
            if (err) {
                console.log(err);
                callback({success: false, message: err.message});
            } else {
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
                                Schedule.create(scheduleJSON, function (err, match) {
                                    if (err) {
                                        console.log(err);
                                        callback({success: false, message: err.message});
                                    }
                                });    
                            }
                        });
                    }
                })    
            }
        });
    });
    if (matches.length > 0) {
        email.notifyAdmins(matches.length, function (err) {
            callback(null, matches);
        });  
    } else {
        callback(null, matches);
    }
}



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
            console.log('matches:', JSON.stringify(outputs));
            var matches = outputs[0];
            Schedule.saveSchedules(matches, function (err, schedules) {
                if (err) {
                    callback({success: false, message: err.message});
                } else {
                    callback(null, schedules);
                }
            })
        });
    });
};

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
                }
            });
        },
        start: false,
        timeZone: 'America/New_York'
    });
    global.schedulerJob = schedulerJob;
    global.schedulerJob.start();
}



//keep at bottom of file
var Schedule = mongoose.model("Schedule", ScheduleSchema);
module.exports = Schedule;