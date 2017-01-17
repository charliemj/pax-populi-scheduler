var mongoose = require("mongoose");
var validators = require("mongoose-validators");
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed= mongoose.Schema.Types.Mixed;

var locationSchema= mongoose.schema({

	currentCapacity:{type:mongoose.Schema.Types.mixed, require:true}, //a dict of times:slotsFilled 
	locationName:{type: String, required: true},
    maxCapacity: {type: Number, default: 1000}, //infinity variable?
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

//find a location object with a certain location name
locationSchema.statics.findLocation = function (locationName, callback){
    this.findOne({locationName: locationName}, function(err, location){
        if(err){
            callback(new Error("This location doesn't exist."));
        }

        else{
            callback(null, location);
        }

    });
};

//change the max capacity to a different value
locationSchema.statics.updateMaxCapacity = function(locationName, currentMaxCapacity, callback){
  //use findLocation function to get the location witht he specified name and then change its max capacity var
};
//keep at bottom of file
var Location = mongoose.model("Location", locationSchema);
module.exports = Location;

