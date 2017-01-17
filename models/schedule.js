var mongoose = require("mongoose");
var validators = require("mongoose-validators");
var User = require("./models/user.js"); 
var ObjectId = mongoose.Schema.Types.ObjectId;

//TODO check isTutor for tutor/student objects
var scheduleSchema = mongoose.Schema({
    student: {type: ObjectId, ref:"User", required:true},
    tutor: {type: ObjectId, ref:"User", required:true},
    studentClassSchedule: {type: [String], required:true},
    tutorClassSchedule: {type: [String], required:true},
    UTCClassSchedule: {type: [String], required:true},
    adminApproved: {type: Boolean, required: true, default: false},
    tutorApproved: {type: Boolean, required: true, default: false},
    studentApproved: {type: Boolean, required: true, default: false},
    firstDay: {type: String, required:true},
    lastDay: {type: String, required: true},
    classOn : {type: Boolean, required: true, default:false}, //this might be tricky
});


//how to run processes in the background like once a day at some time


//keep at bottom of file
var Schedule = mongoose.model("Schedule", scheduleSchema);
module.exports = Schedule;