var mongoose = require("mongoose");
var validators = require("mongoose-validators");

var User = require("");  //user model file hookup

var ObjectId = mongoose.Schema.Types.ObjectId;

var availableSchema = mongoose.Schema({
    isMatched: Boolean,
    user: {type: ObjectId, ref:"User"},
    times: [{type: Date, validate: [validators.isDate()]}]
});


//keep at bottom of file
var Available = mongoose.model("Available", availableSchema);
module.exports = Available;