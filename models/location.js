var mongoose = require("mongoose");
var validators = require("mongoose-validators");
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed= mongoose.Schema.Types.Mixed;
var User = require("../models/user.js"); 
var Location = require("../models/location.js");

var locationSchema= mongoose.schema({
	capacity:{type:mongoose.Schema.Types.mixed,  }
	locationName:{type: String, required: true}
})




