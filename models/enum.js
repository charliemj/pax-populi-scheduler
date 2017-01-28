var mongoose = require("mongoose");
var validators = require("mongoose-validators");
var enums = require('../javascripts/enums.js');

var EnumSchema = mongoose.Schema({
	numTokenDigits: {type: Number, default: enums.numTokenDigits()},
	minUsernameLength: {type: Number, default: enums.minUsernameLength()},
	maxUsernameLength: {type: Number, default: enums.maxUsernameLength()},
	userTypes: [{type: String, default: enums.userTypes()}],
	genders: [{type: String, default: enums.genders()}],
	confirmation: [{type: String, default: enums.confirmation()}],
	studentSchools: [{type: String, default: enums.studentSchools()}],
	tutorSchools: [{type: String, default: enums.tutorSchools()}],
	studentEducationLevels: [{type: String, default: enums.studentEducationLevels()}],
	tutorEducationLevels: [{type: String, default: enums.tutorSchools()}],
	majors: [{type: String, default: enums.majors()}],
	interests: [{type: String, default: enums.interests()}],
	courses: [{type: String, default: enums.courses()}]
});

EnumSchema.methods.updateEnum = function (data, callback) {
	var id = this._id;
	var that = EnumModel;
    that.update(data, function (err, enums) {
    	if (err) {
    		callback({success: false, message: err.message});
    	} else {
    		that.findOne({_id: id}, function (err, enums) {
    			if (err) {
    				callback({success: false, message: err.message});
    			} else {
    				callback(null, enums);
    			}
    		});
    	}
    });
};

EnumSchema.pre("save", function (next) {
  	if (this.userTypes.length == 0)
    	Array.prototype.push.apply(this.userTypes, enums.userTypes());
  	next();
});

EnumSchema.pre("save", function (next) {
  	if (this.genders.length == 0)
    	Array.prototype.push.apply(this.genders, enums.genders());
  	next();
});

EnumSchema.pre("save", function (next) {
  	if (this.confirmation.length == 0)
    	Array.prototype.push.apply(this.confirmation, enums.confirmation());
  	next();
});

EnumSchema.pre("save", function (next) {
  	if (this.studentSchools.length == 0)
    	Array.prototype.push.apply(this.studentSchools, enums.studentSchools());
  	next();
});

EnumSchema.pre("save", function (next) {
  	if (this.tutorSchools.length == 0)
    	Array.prototype.push.apply(this.tutorSchools, enums.tutorSchools());
  	next();
});

EnumSchema.pre("save", function (next) {
  	if (this.studentEducationLevels.length == 0)
    	Array.prototype.push.apply(this.studentEducationLevels, enums.studentEducationLevels());
  	next();
});

EnumSchema.pre("save", function (next) {
  	if (this.tutorEducationLevels.length == 0)
    	Array.prototype.push.apply(this.tutorEducationLevels, enums.tutorEducationLevels());
  	next();
});

EnumSchema.pre("save", function (next) {
  	if (this.majors.length == 0)
    	Array.prototype.push.apply(this.majors, enums.majors());
  	next();
});

EnumSchema.pre("save", function (next) {
  	if (this.interests.length == 0)
    	Array.prototype.push.apply(this.interests, enums.interests());
  	next();
});

EnumSchema.pre("save", function (next) {
  	if (this.courses.length == 0)
    	Array.prototype.push.apply(this.courses, enums.courses());
  	next();
});

EnumSchema.statics.initialize = function (callback) {
	var that = this;
	that.findOne({}, function (err, enums) {
    if (err) {
       	callback({success: false, message: err.message});
    } else if (!enums) {
        that.create({}, function (err, enums) {
            callback(null, enums);
        });
    } else {
        callback(null, enums);
    }
});
};

var EnumModel = mongoose.model("Enum", EnumSchema);

module.exports = EnumModel;
