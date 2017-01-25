var mongoose = require("mongoose");
var validators = require("mongoose-validators");
var ObjectId = mongoose.Schema.Types.ObjectId;
var User = require("../models/user.js"); 
var utils = require("../javascripts/utils.js");
var Registration = require("../models/registration.js"); 
var PythonShell = require('python-shell');
var CronJob = require('cron').CronJob;


var ScheduleSchema = mongoose.Schema({
    student: {type: ObjectId, ref:"User", required:true},
    tutor: {type: ObjectId, ref:"User", required:true},
    possibleCourses: {type:[String], required:true},
    studentCoord :{type: ObjectId, ref:"User"},
    tutorCoord :{type: ObjectId, ref:"User"},
    studentClassSchedule: {type: [Date], required:true},
    tutorClassSchedule: {type: [Date], required:true},
    UTCClassSchedule: {type: [Date], required:true}, // for Admins
    adminApproved: {type: Boolean, required: true, default: false},
    tutorApproved: {type: Boolean, required: true, default: false},
    studentApproved: {type: Boolean, required: true, default: false},
    firstDateTime: {type: Date, required:true}, 
    lastDateTime: {type: Date, required: true}, //so we know when to delete the schedule from the DB
    studentPossibleSchedules: {type:mongoose.Schema.Types.Mixed},
    tutorPossibleSchedules: {type:mongoose.Schema.Types.Mixed},
    UTCPossibleSchedules: {type:mongoose.Schema.Types.Mixed},
    course: {type: String},
    studentReg: {type: ObjectId, ref:"Registration", required:true},
    tutorReg: {type: ObjectId, ref:"Registration", required:true}
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


ScheduleSchema.statics.getMatches = function (callback){

    Registration.getUnmatchedRegistrations(function (err, registrations) {
        // Inputs to Simon's script, hardcoding for now.
        var registrations = [{'user': '1111', 'availability': {'0': ['11:00 - 13:00'], '3': ['2:00 - 5:00']},
                            'genderPref': ['Male', 'Female'], 'course': 'Intermediate English',
                            'isMatched': false},
                          {'user': '1112', 'availability': {'1': ['10:00 - 12:00'], '5': ['1:00 - 5:00']},
                            'genderPref': ['Female'], 'course': 'Intermediate English',
                            'isMatched': false}
                        ];

        var city_capacity = {'Boston': 10, 'Cambridge': 5, 'Bangkok': 3};

        var options = {
            mode: 'json',
            scriptPath: './scheduler/',
            args: [JSON.stringify(registrations), JSON.stringify(city_capacity)]
        };

        PythonShell.run('match.py', options, function (err, matches) {
          if (err) {
            throw err;
          }
          // matches is an array consisting of messages collected during execution
          console.log('matches:', typeof matches, matches);
          // process the JSON objs and write to db
          callback(null, matches);
        });
    });
};

ScheduleSchema.statics.automateMatch = function () {

    var schedulerJob = new CronJob({
        cronTime: '00 00 17 * * 7',
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