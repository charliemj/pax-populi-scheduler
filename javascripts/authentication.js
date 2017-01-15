var request = require('request');
var config = require('./config.js');
var bcrypt = require('bcrypt');
var utils = require('./utils.js');

var Authentication = function() {

    var that = Object.create(Authentication.prototype);

    /**
    * Checks if the request has a defined session and correct authentication
    * @param {Object} req - request to check for authentication
    * @param {Object} res - response from the previous function
    * @param {Function} next - callback function
    * @return {Boolean} true if the request has the authenication, false otherwise
    */
    that.isAuthenticated = function (req, res, next) {
        if (req.params.username == undefined && req.isAuthenticated() || 
                req.isAuthenticated() && req.params.username === req.session.passport.user.username) {
            // if the request is not user specific, give permission as long as the user is authenticated,
            // otherwise, needs to check that user is requesting for himself
                next();
        } else if (req.isAuthenticated()) {
            res.redirect('/users/'+req.session.passport.user.username);
        } else {
            res.render('home', { title: 'Pax Populi Scheduler', message: 'Please log in below', csrfToken: req.csrfToken()});
        }
    }

    /*
    * Encrypts the password using hashing and salting
    * @param {String} password - the password to encrypt
    * @param  {Function} callback - the function that takes in an object and is called once this function is done
    */
    that.encryptPassword = function (password, callback) {
        bcrypt.genSalt(function(err, salt) {
            if (err) {
                return callback(err);
            } else {
                bcrypt.hash(password, salt, function(err, hash) {
                    if (err) {
                        return callback(err);
                    } else {
                        return callback(err, hash);
                    }
                });
            }
        });
    }

    /*
    * Creates a JSON object whose fields are username, hashed password, first name, last name, email
    * @param {String} username - the username for the user
    * @param {String} password - the user's password
    * @param {String} email - the user's email address
    * @param {String} firstName - the user's first name
    * @param {String} lastName - the user's last name
    * @param {String} status - the login status of the student - must be either 'Student' or 'Tutor'
    * @param  {Function} callback - the function that takes in an object and is called once this function is done
    */
    that.createUserJSON = function (username, password, email, firstName, lastName, isTutor, callback) {
        if (password.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/.test(password)) {
            callback({success: false, message: "A valid password contains at least 8 characters, and at least one uppercase character, one lowercase character, a number and one special character."})
        } else {
            that.encryptPassword(password, function (err, hash) {
                if (err) {
                    return callback(err);
                } else {
                    var user = {username: username,
                            password: hash,
                            firstName: firstName,
                            lastName: lastName,
                            email: email,
                            tutor: isTutor};
                    callback(null, user);
                }      
            });
        }
    }

    Object.freeze(that);
    return that;
};

module.exports = Authentication();
