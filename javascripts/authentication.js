var request = require('request');
var config = require('./config.js');
var bcrypt = require('bcrypt');
var utils = require('./utils.js');
var enums = require('./enums.js');

var Authentication = function() {

    var newAuth = Object.create(Authentication.prototype); 
    //newAuth is the object created each time a new authentication is requested
    
    /**
    * Checks if the request has a defined session and correct authentication
    * If so, direct the user to the request route. Otherwise, direct the user
    * back to the homepage to login
    * @param {Object} req - request to check for authentication
    * @param {Object} res - response from the previous function
    * @param {Function} next - callback function
    * @return {Boolean} true if the request has the authenication, false otherwise
    */
    newAuth.isAuthenticated = function (req, res, next) {
        if (req.params.username == undefined && req.isAuthenticated() || 
                req.isAuthenticated() && req.params.username === req.session.passport.user.username) {
            // if the request is not user specific, give permission as long as the user is authenticated,
            // otherwise, needs to check that user is requesting for themself
            next();
        } else if (req.isAuthenticated()) {
            next();
        } else {
            // direct to homepage to either login
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
    }


    /**
    * Checks if the owner of the request is an admin. If so, direct 
    * the user to the request route. Otherwise, direct the user
    * @param {Object} req - request to check for authentication
    * @param {Object} res - response from the previous function
    * @param {Function} next - callback function
    * @return {Boolean} true if the request has the authenication, false otherwise
    */
    newAuth.isAdministrator = function (req, res, next) {
        var user = req.session.passport.user;
        if (utils.isAdministrator(user.role)) {
            next();
        } else {
            res.render('home', {title: 'Pax Populi Scheduler',
                                message: 'You do not have the right permission to proceed',
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
    }

    /*
    * Encrypts the password using hashing and salting
    * @param {String} password - the password to encrypt
    * @param  {Function} callback - the function that takes in an object and
    *                               is called once this function is done
    */
    newAuth.encryptPassword = function (password, callback) {
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

    /*
    * Creates a JSON for creating user object using the data provided
    * @param {Object} data - the object which contains information about the user
    * @param  {Function} callback - the function that takes in an object and is
    *                               called once this function is done
    */

    newAuth.createUserJSON = function (data, callback) {
        var role = data.userType.trim();
        role = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
        var isTutor = utils.isTutor(role);
        var isStudent = utils.isStudent(role);
        var isAdminTutor = !utils.isRegularUser(role);
        var password = data.password.trim();

        newAuth.encryptPassword(password, function (err, hash) {
            if (err) {
                return err;
            }
            // add the basic information
            var userJSON = {username: data.username.trim().toLowerCase(),
                            password: hash,
                            role: role,
                            email: data.email.trim(), //at some point this has to check to see that this isn't a .edu email
                            alternativeEmail: data.alternativeEmail.trim().length > 0 ? data.alternativeEmail.trim(): 'N/A',
                            firstName: data.firstName.trim(),
                            middleName: data.middleName.trim(),
                            lastName: data.lastName.trim(),
                            phoneNumber: data.phoneNumber.trim()}

            data.school ? data.tutorSchool = data.school : null;
            data.school ? data.studentSchool = data.school : null;
            data.interests ? data.interests.splice(-1,1): null;

            if (utils.isRegularUser(userJSON.role)) {
                var additionalInfo = {  nickname: data.nickname.trim(),
                                        gender: data.gender.trim(),
                                        dateOfBirth: new Date(data.dateOfBirth.trim()),
                                        skypeId: data.skypeId.trim().length > 0 ? data.skypeId.trim(): 'N/A',
                                        school: isTutor ? data.tutorSchool : data.studentSchool,   
                                        educationLevel: isTutor ? data.tutorEducationLevel.trim() : 
                                                            data.studentEducationLevel.trim(),
                                        enrolled: data.enrolled === 'Yes',
                                        nationality: data.nationality.trim(),
                                        country: data.country.trim(),
                                        region: data.region.trim(),
                                        interests: data.interests,
                                        timezone: data.timezone };
                Object.assign(userJSON, additionalInfo);
            }   
            if (isTutor) {
                userJSON['major'] = utils.extractChosen(data.major);
            } else if (isStudent) {
                userJSON['major'] = 'N/A';
            }
	    if (utils.isCoordinator(role)) {
                var scopes = ['schoolInCharge', 'regionInCharge', 'countryInCharge'];
                scopes.forEach(function (scope) {
                    if (data[scope]) {
                        if (scope === 'schoolInCharge') { 
                            userJSON[scope] = utils.extractChosen(data[scope]); 
                        } else {
                            userJSON[scope] = data[scope];
                        }   
                    }
                });
            }

            callback(null, userJSON)
        });
    }

    Object.freeze(newAuth);
    return newAuth;
}

module.exports = Authentication();
