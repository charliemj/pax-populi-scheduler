var mongoose = require("mongoose");
var validators = require("mongoose-validators");

var User = require("");  //user model file hookup

var ObjectId = mongoose.Schema.Types.ObjectId;

//TODO check is tutor
var scheduleSchema = mongoose.Schema({
    student: {type: ObjectId, ref:"User", require: true},
    tutor: {type: ObjectId, ref:"User", require:true},
    student_class_schedule:{type: [String], require: true}  //list of dates
   	tutor_class_schedule:{type: [String], require: true}
   	utc_class_schedule:{type: [String], require: true}
   	adminApproved: {type:Boolean, default: false}
   	tutorApproved: {type:Boolean, default: false}
   	studentApproved: {type: Boolean, default: false}
});


//SCHEDULER ALGORITHM 

//keep at bottom of file
var Schedule = mongoose.model("Schedule", scheduleSchema);
module.exports = Schedule;