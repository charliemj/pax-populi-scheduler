var mongoose = require("mongoose");
var validators = require("mongoose-validators");
var User = require('../models/user.js');


var ObjectId = mongoose.Schema.Types.ObjectId;

var genders = ["Male","Female","Other", "NoPref"]; 

// times are objects like
      // { '0': [ [ '23:00', '24:00' ] ], //Sunday from 11pm-12:00am
      // '1': [],
      // '2': [],
      // '3': [],
      // '4': [],
      // '5': [],
      // '6': [[ '06:00', '08:30' ] } //Saturday from 6 am to 8:30am

var registrationSchema = mongoose.Schema({
    user: {type: ObjectId, ref:"User", required:true},
    times: {type: mongoose.Schema.Types.Mixed, required:true}, 
    genderPref: {type: String, enum: genders, required:true},
    course: {type: String, required:true},
    isMatched:{type: Boolean, default: false}
});


/*
 * Creates a registration object for a user. 
 * @param {String} username - The username of the query user. 
 * @param {String} genderPref - The new gender preference of the tutor/student the user has. 
 * @param {Array} times - An array of times the user is available to meet (in their local times).
 * @param {Function} callback - The function to execute after the registration is created. 
 */
registrationSchema.statics.createRegistration = function(username,gender_pref, times, callback){
    
    User.getUserByUsername(username, function(err,user,times){
        
        if (err) {res.send(err);}
        
        else{
            Registration.create({times: times, user: user, genderPref: genderPref, course: course}, 
            function(err, registration){
                if (err){
                    res.send({
                    success: false,
                    message: err
                  }); 
                }//end if
                else{
                    res.status(200); //everything worked! 
                }//end else
            });//end create
        }
    });
};

/*
 * Updates registration info for a user. 
 * @param {String} username - The username of the query user. 
 * @param {String} genderPref - The new gender preference of the tutor/student the user has. 
 * @param {Array} times - An array of times the user is available to meet.
 * @param {Function} callback - The function to execute after the registration is updated. 
 */

registrationSchema.statics.updateRegistration = function(username, genderPref, times, callback){
    Registration.update({}, 
    function(err, registration){
        if (err){
            res.send(err);
        }//end if
        else{
            //do something
        }//end else
    });//end update
};

//keep at bottom of file
var Registration = mongoose.model("Registration", registrationSchema);
module.exports = Registration;