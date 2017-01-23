var mongoose = require("mongoose");
var validators = require("mongoose-validators");
var User = require('../models/user.js');
var ObjectId = mongoose.Schema.Types.ObjectId;
var genderPrefs = ["MALE","FEMALE", "NONE"]; 

// availability are objects like
      // { '0': [ [ '23:00', '24:00' ] ], //Sunday from 11pm-12:00am
      // '1': [],
      // '2': [],
      // '3': [],
      // '4': [],
      // '5': [],
      // '6': [[ '06:00', '08:30' ] } //Saturday from 6 am to 8:30am

var registrationSchema = mongoose.Schema({
    user: {type: ObjectId, ref:"User", required:true},
    availability: {type: mongoose.Schema.Types.Mixed, required: true}, 
    genderPref: {type: String, enum: genderPrefs, required: true},
    courses: {type: [String], required: true},
    earliestStartTime: {type: Date, required: true},
    isMatched:{type: Boolean, required: true,  default: false},
    dateAdded:{type: Date, default: Date.now}
});


/*
 * Creates a registration object for a user. 
 * @param {String} username - The username of the query user. 
 * @param {String} genderPref - The new gender preference of the tutor/student the user has. 
 * @param {Array} availability - An array of times the user is available to meet (in their local times).
 * @param {Array} courses - An array of courses that the user wants to sign up for
 * @param {Date} earliestStartTime - The earliest possible date a user can start a class. 
 * @param {Function} callback - The function to execute after the registration is created. 
 */
registrationSchema.statics.createRegistration = function(username, genderPref, availability, courses, earliestStartTime, callback){
    
    User.getUser(username, function(err,user){
        if (err) {res.send(err + "Problem with getting user");}
        
        else{
            Registration.create({availability: availability, user: user, genderPref: genderPref, courses: courses, earliestStartTime:earliestStartTime}, 
            function(err, registration){
                if (err){
                    console.log("Problem creating registration");
                    callback(err); 
                }//end if
                else{
                    callback(null, registration); //everything worked! 
                }//end else
            });//end create
        }
    });
};

/*
 * Gets all unmatched registrations for a particular user
 * Will be used to grab all of the standing registrations for a user and display them on the user's dashboard
 * @param {User} user - A user object of the current user
 * @param {Function} callback - The function to execute after the unmatched registrations for the user are found.  
 */
registrationSchema.statics.getUnmatchedRegistrationsForUser = function (user, callback) {
    Registration.find({isMatched: false, user: user }, function (err, registrations) {
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
 * @param {String} user - The user object of the logged in user 
 * @param {Function} callback - The function to execute after the registration found. 
 */

registrationSchema.statics.findRegistration = function (regId, user, callback){

    Registration.findOne({user: user, _id: regId}, function (err, registration){

        if(err){
            callback(new Error("This registration doesn't belong this logged in user."));
        }
        else{

            callback(null, registration);
        }
    });//end findOne
};//end findRegistration


/*
 * Deletes a particular registration for a user. 
 * @param {String} regId - the registration id number of the particular registration
 * @param {String} user - The user object of the logged in user 
 * @param {Function} callback - The function to execute after the registration deleted. 
 */
registrationSchema.statics.deleteRegistration = function(regId, user, callback){
    Registration.remove({_id:regId, user:user}, function(err){
        if (err){
            callback(err);
        }
        //otherwise, sucessfully removed!
    });
};

/*
 * Updates registration info for a user. 
 * @param {String} user - The user object of the logged in user 
 * @param {String} regId - ID number (assigned by MongoDB) for the registration object. 
 * @param {String} genderPref - The new gender preference of the tutor/student the user has. 
 * @param {Array} availabilty - An array of times the user is available to meet.
 * @param {Array} courses - Array of courses (strings) that a student/take wants to take/teach.
 * @param {Date} earliestStartTime - The earliest possible date a user can start a class. 
 * @param {Function} callback - The function to execute after the registration is updated. 
 */

registrationSchema.statics.updateRegistration = function (user, regId, genderPref, availability, courses, earliestStartTime, callback){
    
    Registration.findOneAndUpdate({user: user, _id: regId},{availability: availability, genderPref: genderPref, earliestStartTime: earliestStartTime, dateAdded:Date.now(), courses: courses}, 
    function(err, updatedRegistration){
        if (err){
            callback(err);
        }//end if
        else{
           callback(null, updatedRegistration); //everything worked! 
        }//end else
    });//end update
};


/*
 * Gets all unmatched registrations in the whole system
 * @param {Function} callback - The function to execute after the unmatched registrations are found.
 */
registrationSchema.statics.getUnmatchedRegistrations = function (callback) {
    Registration.find({isMatched: false }, function (err, registrations) {
        if (err) {
            callback({success: false, message: err.message});
        } else {
            callback(err, registrations);
        }
    });
};

//keep at bottom of file
var Registration = mongoose.model("Registration", registrationSchema);
module.exports = Registration;
