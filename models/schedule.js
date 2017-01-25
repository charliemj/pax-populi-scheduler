var mongoose = require("mongoose");
var validators = require("mongoose-validators");
var ObjectId = mongoose.Schema.Types.ObjectId;
var User = require("../models/user.js"); 
var utils = require("../javascripts/utils.js");
var Registration = require("../models/registration.js"); 
var PythonShell = require('python-shell');



var scheduleSchema = mongoose.Schema({
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
    firstDateTimeUTC: {type: Date, required:true}, 
    lastDateTimeUTC: {type: Date, required: true}, //so we know when to delete the schedule from the DB
    studentPossibleSchedules: {type:mongoose.Schema.Types.Mixed},
    tutorPossibleSchedules: {type:mongoose.Schema.Types.Mixed},
    UTCPossibleSchedules: {type:mongoose.Schema.Types.Mixed},
    course: {type: String},
    studentReg: {type: ObjectId, ref:"Registration", required:true},
    tutorReg: {type: ObjectId, ref:"Registration", required:true}
});


scheduleSchema.statics.getSchedules = function (user, callback) {
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


scheduleSchema.statics.getMatches = function (callback){

    Registration.getUnmatchedRegistrations(function (err, registrations) {
        console.log('unmatched registrations', registrations);

        var options = {
            mode: 'json',
            scriptPath: './scheduler/',
            args: [JSON.stringify(registrations)]
        };

        PythonShell.run('main.py', options, function (err, matches) {
          if (err) {
            throw err;
          }
          // matches is an array consisting of messages collected during execution
          console.log('matches:', typeof matches, matches);
          // process the JSON objs and write to db
        });
    });
};


//keep at bottom of file
var Schedule = mongoose.model("Schedule", scheduleSchema);
module.exports = Schedule;