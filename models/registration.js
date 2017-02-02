var mongoose = require("mongoose");
var validators = require("mongoose-validators");
var ObjectId = mongoose.Schema.Types.ObjectId;
var async = require('async');
var User = require('../models/user.js');
var email = require('../javascripts/email.js');
var genderPrefs = ["MALE","FEMALE", "NONE"];

// availability are objects like
      // { '0': [ [ '23:00', '24:00' ] ], //Sunday from 11pm-12:00am
      // '1': [],
      // '2': [],
      // '3': [],
      // '4': [],
      // '5': [],
      // '6': [[ '06:00', '08:30' ] } //Saturday from 6 am to 8:30am


var RegistrationSchema = mongoose.Schema({
    user: {type: ObjectId, ref:"User", required:true},
    availability: {type: mongoose.Schema.Types.Mixed, required: true}, 
    genderPref: {type: String, enum: genderPrefs, required: true},
    courses: {type: [String], required: true},
    earliestStartTime: {type: Date, required: true},
    isMatched:{type: Boolean, required: true,  default: false},
    dateAdded:{type: Date, default: Date.now}
});

//sets a registration to "matched" so that it is taken out of the scheduling pool
RegistrationSchema.methods.matched = function (callback) {
    this.isMatched = true;
    this.save(callback);
};

/**
 * Creates a registration object for a user. 
 * @param {User Object} user - The user object of the user. 
 * @param {String} genderPref - The new gender preference of the tutor/student the user has. 
 * @param {Array} availability - An array of times the user is available to meet (in their local times).
 * @param {Array} courses - An array of courses that the user wants to sign up for
 * @param {Date} earliestStartTime - The earliest possible date a user can start a class. 
 * @param {Function} callback - The function to execute after the registration is created. 
 */
RegistrationSchema.statics.createRegistration = function(user, genderPref, availability, courses, earliestStartTime, callback){
    
    Registration.getUnmatchedRegistrationsForUser(user, function(err, registrations){

        if (err){
            console.log("Problem getting user for registration");
            callback(err); 
        }
        else if (registrations.length === 0){
            Registration.create({availability: availability, user: user, genderPref: genderPref, courses: courses, earliestStartTime: earliestStartTime}, 
            function(err, registration){
                if (err){
                    console.log("Problem creating registration");
                    callback(err); 
                }
                else{
                    callback(null, registration); 
                }
            });
        }
        else{
            console.log("You already have a registration submitted, and you may only have one. ");
            callback(new Error("You already have a registration submitted, and you may only have one."));
        }

    });
};


/*
 * Gets all unmatched registrations for a particular user
 * Will be used to grab all of the standing registrations for a user and display them on the user's dashboard
 * @param {User Object} user - A user object of the current user
 * @param {Function} callback - The function to execute after the unmatched registrations for the user are found.  
 */
RegistrationSchema.statics.getUnmatchedRegistrationsForUser = function (user, callback) {
    Registration.find({isMatched: false, user: user }).populate('user').exec(function (err, registrations) {
        if (err) {
            callback({success: false, message: err.message});
        } else {
            callback(err, registrations);
        }
    });
};

/*
 * Gets registration info about a particular registration for a user. 
 * @param {String} regId - the registration id number of the particular registration
 * @param {User Object} user - The user object of the logged in user 
 * @param {Function} callback - The function to execute after the registration found. 
 */
RegistrationSchema.statics.findRegistration = function (regId, user, callback){

    Registration.findOne({user: user, _id: regId}, function (err, registration){

        if(err){
            callback(err);
        }
        else{
            if (registration === null){
                callback(new Error("This registration doesn't belong this logged in user."));
            }
            else{
                callback(null, registration);
            }
        }
    });
};


/*
 * Deletes a particular registration for a user. 
 * @param {String} regId - the registration id number of the particular registration.
 * @param {User Object} user - The user object of the logged in user 
 * @param {Function} callback - The function to execute after the registration deleted. 
 */
RegistrationSchema.statics.deleteRegistration = function(regId, user, callback){
    Registration.remove({user: user, _id:regId}, function(err){
        if (err){
            console.log("problem deleting registration");
            callback(err);
        }
        else{
        console.log("sucessfully deleted registration");
        callback(null);}
        
    });
};

/*
 * Updates registration info for a user. 
 * @param {User Object} user - The user object of the logged in user. 
 * @param {String} regId - ID number (assigned by MongoDB) for the registration object. 
 * @param {String} genderPref - The new gender preference of the tutor/student the user has. 
 * @param {Array} availabilty - An array of times the user is available to meet.
 * @param {Array} courses - Array of courses (strings) that a student/take wants to take/teach.
 * @param {Date} earliestStartTime - The earliest possible date a user can start a class. 
 * @param {Function} callback - The function to execute after the registration is updated. 
 */
RegistrationSchema.statics.updateRegistration = function (user, regId, genderPref, availability, courses, earliestStartTime, callback){

    Registration.findOneAndUpdate({user: user, _id: regId},{availability: availability, genderPref: genderPref, earliestStartTime: earliestStartTime, dateAdded:Date.now(), courses: courses}, 
    function(err, updatedRegistration){
        if (err){
            callback(err);
        }
        else{
            console.log("sucessfully updated registration");
            callback(null, updatedRegistration); 
        }
    });
};

/*
 * Takes a series of registration IDs and marks them as matched
 * @param {Array} registrationIds -  the ids for each registration object.
 * @param {Function} callback - The function to execute after the registrations are marked as matched.
 */
RegistrationSchema.statics.markAsMatched = function (registrationIds, callback) {
    var count = 0;
    registrationIds.forEach(function (regId) {
        Registration.findOne({_id: regId}).populate('user').exec(function (err, registration) {
            if (err) {
                console.log(err);
                callback({success: false, message: err.message});
            } else {
                registration.matched(function (err, registration) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Marked as matched');
                    }
                });
                count++;
                if (count === registrationIds.length) {
                    callback(null, registrationIds);
                }
            }
        });
    });
}

/*
 * Takes a series of registration IDs and marks them as unmatched
 * @param {Array} registrationIds -  the IDs for each registration object.
 * @param {Function} callback - The function to execute after the registrations are marked as matched.
 */
RegistrationSchema.statics.markAsUnmatched = function (registrationIds, callback) {
    var count = 0;
    registrationIds.forEach(function (regId) {
        Registration.findOneAndUpdate({_id: regId}, {isMatched: false}, function(err, updateRegistration) {
            if (err) {
                console.log(err);
            } else {
                console.log('marked as unmatched');
                count++;
                if (count === registrationIds.length) {
                    callback(null, registrationIds);
                }
            }
        });
    });
}

/*
 * Gets all unmatched registrations in the whole system
 * @param {Function} callback - The function to execute after the unmatched registrations are found.
 */
RegistrationSchema.statics.getUnmatchedRegistrations = function (callback) {
    Registration.find({isMatched: false, earliestStartTime: {"$gte": new Date()}}).populate('user').exec(function (err, registrations) {
        if (err) {
            callback({success: false, message: err.message});
        } else {
            callback(err, registrations);
        }
    });
};

var Registration = mongoose.model("Registration", RegistrationSchema);
module.exports = Registration;
