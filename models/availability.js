var mongoose = require("mongoose");
var validators = require("mongoose-validators");

// var User = require("");  //user model file hookup

var ObjectId = mongoose.Schema.Types.ObjectId;

var availableSchema = mongoose.Schema({
    user: {type: ObjectId, ref:"User"},
    times: [] //this is a list of lists object,
});


//keep at bottom of file
var Availability = mongoose.model("Availability", availableSchema);
module.exports = Availability;