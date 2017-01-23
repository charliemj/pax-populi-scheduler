var request = require('request');
var config = require('./config.js');
var bcrypt = require('bcrypt');
var utils = require('./utils.js');
var enums = require('./enums.js');

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
        console.log('in authenicated...');
        if (req.params.username == undefined && req.isAuthenticated() || 
                req.isAuthenticated() && req.params.username === req.session.passport.user.username) {
            // if the request is not user specific, give permission as long as the user is authenticated,
            // otherwise, needs to check that user is requesting for himself
            next();
        } else if (req.isAuthenticated()) {
            next();
        } else {
            res.render('home', {title: 'Pax Populi Scheduler',
                                message: 'Please log in below',
                                csrfToken: req.csrfToken(),
                                userTypes: enums.userTypes(),
                                genders: enums.genders(),
                                confirmation: enums.confirmation(),
                                studentSchools: enums.studentSchools(),
                                tutorSchools: enums.tutorSchools(),
                                studentEducationLevels: enums.studentEducationLevels(),
                                tutorEducationLevels: enums.tutorEducationLevels(),
                                majors: enums.majors(),
                                interests: enums.interests(),
                                ref_path: req.query.ref_path});
        }
    };

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
    };

    Object.freeze(that);
    return that;
};

module.exports = Authentication();
