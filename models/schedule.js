var mongoose = require("mongoose");
var validators = require("mongoose-validators");
var ObjectId = mongoose.Schema.Types.ObjectId;
var User = require("../models/user.js"); 
var utils = require("../javascripts/utils.js");


var scheduleSchema = mongoose.Schema({
    student: {type: ObjectId, ref:"User", required:true},
    tutor: {type: ObjectId, ref:"User", required:true},
    studentClassSchedule: {type: [String], required:true},
    tutorClassSchedule: {type: [String], required:true},
    UTCClassSchedule: {type: [String], required:true}, // for Admins
    adminApproved: {type: Boolean, required: true, default: false},
    tutorApproved: {type: Boolean, required: true, default: false},
    studentApproved: {type: Boolean, required: true, default: false},
    firstDay: {type: String, required:true}, 
    lastDay: {type: String, required: true} //so we know when to delete the schedule from the DB
});


scheduleSchema.statics.getSchedules = function (user, callback) {
    if (utils.notAdmin(user)) {
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



//keep at bottom of file
var Schedule = mongoose.model("Schedule", scheduleSchema);
module.exports = Schedule;