var mongoose = require("mongoose");
var validators = require("mongoose-validators");
var ObjectId = mongoose.Schema.Types.ObjectId;
// var User = require("");  //user model file hookup

//TODO need validators
var scheduleSchema = mongoose.Schema({
    student: {type: ObjectId, ref:"User"},
    tutor: {type: ObjectId, ref:"User"},
    schedule: [{type: Date, validate: [validators.isDate()]}], //list of dates
});


//SCHEDULER ALGORITHM 

//keep at bottom of file
var Schedule = mongoose.model("Schedule", scheduleSchema);
module.exports = Schedule;