var mongoose = require("mongoose");
var validators = require("mongoose-validators");
var ObjectId = mongoose.Schema.Types.ObjectId;
var User = require("../models/user.js"); 
var utils = require("../javascripts/utils.js");
var Registration = require("../models/registration.js"); 
var PythonShell = require('python-shell');
var CronJob = require('cron').CronJob;
var dateFormat = require('dateformat');

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
    studentClassSchedule: {type: [Date]},
    tutorClassSchedule: {type: [Date]},
    UTCClassSchedule: {type: [Date]}, // for Admins
    firstDateTimeUTC: {type: Date}, 
    lastDateTimeUTC: {type: Date}, //so we know when to delete the schedule from the DB
    studentCoord :{type: ObjectId, ref:"User"},
    tutorCoord :{type: ObjectId, ref:"User"}   
});

ScheduleSchema.path("course").validate(function(course) {
    return course.trim().length > 0;
}, "No empty course name.");

// more validation
ScheduleSchema.statics.getSchedules = function (user, callback) {
    if (utils.isRegularUser(user.role)) {
        // get personal scheudles
        Schedule.find( {$or: [{student: user._id}, {tutor: user._id}]}, function (err, schedules) {
            if (err) {
                callback({success: false, message: err.message});
            } else {
                callback(null, schedules);
            }
        });
    } else {
        // get schedules for that school/country/region
        User.getUser(user.username, function (err, user) {
            if (err) {
                callback({success: false, message: err.message});
            } else {
                //these need to be updated the the country/region/school that the coordinator is in charge of
                Schedule.find( {$or: [{country: user.country}, {region: user.region}, {school: user.school}]}, function (err, schedules) {
                    if (err) {
                        callback({success: false, message: err.message});
                    } else {
                        callback(null, schedules);
                    }
                });
            }
        })
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

                Schedule.create(scheduleJSON, function (err, match) {
                    if (err) {
                        console.log(err);
                        callback({success: false, message: err.message});
                    }
                });
            }
        });
    });
    callback(null, matches);
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
                    console.log('Successfully ran weekly matches!');
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