var mongoose = require("mongoose");
var bcrypt = require('bcrypt');
var ObjectId = mongoose.Schema.Types.ObjectId;
var utils = require("../javascripts/utils.js");
var email = require('../javascripts/email.js');
var authentication = require('../javascripts/authentication.js');

var UserSchema = mongoose.Schema({
    username: {type: String, required: true, index: true},
    password: {type: String, required: true}, // should be just the hash
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true},
    verified: {type:Boolean, default: false},
    tutor: {type: Boolean, default: false},
    verificationToken: {type:String, default: null}
});


UserSchema.path("username").validate(function(username) {
    return username.trim().length > 0;
}, "No empty username.");

UserSchema.path("password").validate(function(password) {
    return password.trim().length > 0;
}, "No empty passwords");

UserSchema.path("firstName").validate(function(firstName) {
    return firstName.trim().length > 0;
}, "No empty first names.");

UserSchema.path("lastName").validate(function(lastName) {
    return lastName.trim().length > 0;
}, "No empty last names.");

UserSchema.path("verificationToken").validate(function(verificationToken) {
    if (!this.verificationToken) {
        return true
    }
    return this.verificationToken.length == utils.numTokenDigits();
}, "Verification token must have the correct number of digits");


/**
* Sets a verification token for the user
* @param {String} token - the 32-digit verification token
* @param {Function} callback - the function that gets called after the token is set
*/
UserSchema.methods.setVerificationToken = function (token, callback) {
    this.verificationToken = token;
    this.save(callback);
}

/**
* Sets verified to true
* @param {Function} callback - the function that gets called after
*/
UserSchema.methods.verify = function (callback) {
    this.verified = true;
    this.save(callback);
}

/**
* Verifies the account so that user can start using it
* @param {String} username - username of the account to verify
* @param {String} token - the 32-digit verification token
* @param {Function} callback - the function that gets called after the account is verified
*/
UserSchema.statics.verifyAccount = function (username, token, callback) {
    this.findOne({username: username}, function (err, user) {
        if (err || (!err & !user)) {
            callback({success:false, message: 'Invalid username'});
        } else if (user.verified) {
            callback({success:false, isVerified: true, message: 'The account is already verified, please log in below:'});
        } else if (user.verificationToken !== token) {
            callback({success:false, message: 'Invalid verification token'});
        } else {
            user.verify(callback);
        }
    });
};

/*
* Checks if the provided username and password correspond to any user
* @param {String} username - username of the account to grant authentication
* @param {String} password - password of the account to grant authentication 
* @param {Function} callback - the function that gets called after the check is done, err argument
*                              is null if the given username and password are valid, otherwise,
*                              err.message contains the appropriate message to show to the user
*/
UserSchema.statics.authenticate = function (username, password, callback) {
    this.findOne({ username: username }, function (err, user) {
        if (err || user == null) {
            callback({message:'Please enter a valid username'});
        } else {
            bcrypt.compare(password, user.password, function (err, response) {
                if (response == true) {
                    callback(null, {username: username,
                                    _id: user._id,
                                    verified: user.verified,
                                    tutor: user.tutor,
                                    fullName: user.firstName + ' ' + user.lastName});
                } else {
                    callback({message:'Please enter a correct password'});
                }
            });
        }
    }); 
}

/*
* Registers a new user with the given userJSON (only if there is no user
* with the given username)
* @param {Object} userJSON - json object containing the appropriate fields
* @param {Boolean} devMode - true if the app is in developer mode, false otherwise
* @param {Function} callback - the function that gets called after the user is created, err argument
*                              is null if the given the registration succeed, otherwise, err.message
*                              contains the appropriate message to show to the user
*/
UserSchema.statics.signUp = function (userJSON, devMode, callback) {
    that = this;
    that.count({ username: userJSON.username }, function (err, count) {
        if (err) {
            callback({success: false, message: 'Database error'});
        } else if (count === 0) {
            that.count({ email: userJSON.email }, function (err, count) {
                if (err) {
                    callback({success: false, message: 'Database error'});
                } else if (count === 0) {
                    that.create(userJSON, function(err, user){
                        that.sendVerificationEmail(user.username, devMode, callback);
                    });
                } else {
                    callback({message: 'There is already an account with this email address.' 
                        + 'Please make sure you have entered your email address correctly'});
                }   
            })
            
        } else {
            callback({message: 'There is already an account with this username'});
        }
    });
}

/*
* Sends a verification email to the user if there exists an account with such username.
* If devMode is true, send a verification link with localhost prefix, otherwise send the
* production URL prefix
* @param {String} username - username of the user 
* @param {Boolean} devMode - true if the app is in development mode, false otherwise
* @param {Function} callback - the function that gets called after the user is created, err argument
*                              is null if the given the registration succeed, otherwise, err.message
*/
UserSchema.statics.sendVerificationEmail = function (username, devMode, callback) {
    that = this;
    that.count({ username: username }, function (err, count) {
        if (count === 0) {
            callback({message: 'Invalid username'});
        } else {
            that.findOne({username: username}, function (err, user) {
                if (err) {
                    callback(err)
                } else if (user && !user.isVerified) {
                    email.sendVerificationEmail(user, devMode, callback);
                } else {
                    callback({message: 'Your account has already been verified. You can now log in.'});
                }
            });
        }
    });
}

/*
 * Edits the profile of a query user. 
 * @param {String} username - The username of the query user. 
 * @param {Number} newPhoneNumber - The new phone number of the user. 
 * @param {String} newDorm - The new dorm of the user. 
 * @param {Function} callback - The function to execute after the profile is editted. Callback
 * function takes 1 parameter: an error when the request is not properly claimed
 */
UserSchema.statics.editProfile = function(username, newPhoneNumber, newDorm, callback) {
    this.findOne({'username': username}, function(err, user){
        user.changePhoneNumber(newPhoneNumber, function(err){
            if (err) {
                callback(new Error("Invalid phone number."));
            } else {
                user.changeDorm(newDorm, function(err){
                    if (err) {
                        callback(new Error("Invalid dorm."));
                    } else {
                        callback(null);
                    }
                });
            }
        });
    });
}

/*
 * Changes the password of a query user. 
 * @param {String} username - The username of the query user. 
 * @param {String} newPassword - The new password of the user. 
 * @param {Function} callback - The function to execute after the password is changed. Callback
 * function takes 1 parameter: an error when the request is not properly claimed
 */
UserSchema.statics.changePassword = function(username, newPassword, callback){
    this.findOne({username: username}, function (err, user) {
        if (err) {
            callback(new Error("Invalid username."));
        } else {
            authentication.encryptPassword(newPassword, function(err, hash){
                if (err){
                    callback(new Error("The new password is invalid."));
                } else {
                    user.password = hash;
                    user.save(callback); 
                }
            });
        }
    });
}

var UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
