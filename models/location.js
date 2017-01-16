var mongoose = require("mongoose");
var validators = require("mongoose-validators");
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed= mongoose.Schema.Types.Mixed;
var User = require("../models/user.js"); 
var Location = require("../models/location.js");

var locationSchema= mongoose.schema({
	currentUse:{type:Mixed, required:true }, //dictionary of times to current number of students there
	locationName:{type: String, required: true} //country, region, city
	maxCapacity:{type: Number, default: 1000} //make 1000 into infinity
});

locationSchema.statics.findLocation = function(locationName, callback){
	this.findOne({locationName: locationName}, function(err, location){
		if(err){
			 callback(new Error("This location does not exist in our database"));
		}
		else{
			callback(null, location);
		}
	}
};


//keep at bottom of file
var Location = mongoose.model("location", scheduleSchema);
module.exports = Location;
