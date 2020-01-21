const mongoose = require("mongoose");
const validators = require("mongoose-validators");
const enums = require('../javascripts/enums.js');

// this enum object is intend to have only instance because its use is to
// store the defaults for the signup forms
const EnumSchema = mongoose.Schema({
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

EnumSchema.pre("save", function (next) {
  	if (this.userTypes.length === 0)
    	Array.prototype.push.apply(this.userTypes, enums.userTypes());
  	next();
});

EnumSchema.pre("save", function (next) {
  	if (this.genders.length === 0)
    	Array.prototype.push.apply(this.genders, enums.genders());
  	next();
});

EnumSchema.pre("save", function (next) {
  	if (this.confirmation.length === 0)
    	Array.prototype.push.apply(this.confirmation, enums.confirmation());
  	next();
});

EnumSchema.pre("save", function (next) {
  	if (this.studentSchools.length === 0)
    	Array.prototype.push.apply(this.studentSchools, enums.studentSchools());
  	next();
});

EnumSchema.pre("save", function (next) {
  	if (this.tutorSchools.length === 0)
    	Array.prototype.push.apply(this.tutorSchools, enums.tutorSchools());
  	next();
});

EnumSchema.pre("save", function (next) {
  	if (this.studentEducationLevels.length === 0)
    	Array.prototype.push.apply(this.studentEducationLevels, enums.studentEducationLevels());
  	next();
});

EnumSchema.pre("save", function (next) {
  	if (this.tutorEducationLevels.length === 0)
    	Array.prototype.push.apply(this.tutorEducationLevels, enums.tutorEducationLevels());
  	next();
});

EnumSchema.pre("save", function (next) {
  	if (this.majors.length === 0)
    	Array.prototype.push.apply(this.majors, enums.majors());
  	next();
});

EnumSchema.pre("save", function (next) {
  	if (this.interests.length === 0)
    	Array.prototype.push.apply(this.interests, enums.interests());
  	next();
});

EnumSchema.pre("save", function (next) {
  	if (this.courses.length === 0)
    	Array.prototype.push.apply(this.courses, enums.courses());
  	next();
});

/**
* Searches for an existing enum object in the database. If there is not one, initializes one
* using all the defaults in javascripts/enums.js
* @param {Function} callback - the function that gets called after the schedules are fetched
*/
EnumSchema.statics.initialize = function (callback) {
	const that = this;
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

/**
* Updates the existing enum object using the given data
* @param {Object} data - the mongoose schedule object of the data
* @param {Function} callback - the function that gets called after the schedules are fetched
*/
EnumSchema.methods.updateEnum = function (data, callback) {
    const id = this._id;
    const that = EnumModel;
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

const EnumModel = mongoose.model("Enum", EnumSchema);

module.exports = EnumModel;
