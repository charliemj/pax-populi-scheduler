var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var csrf = require('csurf');
var User = require('../models/user.js');
var Schedule = require("../models/schedule.js");
var utils = require('../javascripts/utils.js');
var authentication = require('../javascripts/authentication.js');
var Registration = require("../models/registration.js");


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//gets a user's dashboard and any registrations they might have
//TODO-- eventually add a similar functionality for getting any schedules they might have
router.get('/:username', authentication.isAuthenticated, function (req, res, next) {
	var user = req.session.passport.user;
    var data = {title: 'Dashboard',
                csrfToken: req.csrfToken(),
                username: req.params.username,
                verified: user.verified,
                approved: user.approved,
                rejected: user.rejected,
                onHold: user.onHold,
                inPool: user.inPool,
                role: user.role,                                        
                fullName: user.fullName}

    Registration.getUnmatchedRegistrationsForUser(user, function(err, registrations){
        if (err) {
          res.send({success: false, message: err.message});
        } else {
            data.registrations = registrations;
            if (utils.isRegularUser(user.role)) {
                res.render('dashboard', data)
            } else {
                Schedule.getSchedules(user, function (err, schedules) {
                    if (err) {
                        res.send({success: false, message: err.message});
                    } else {
                        data.schedules = schedules;
                        if (utils.isCoordinator(user.role)) {
                            res.render('dashboard', data);
                        } else if (utils.isAdministrator(user.role)) {
                            User.getPendingUsers(function (err, users) {
                                if (err) {
                                    res.send({success: false, message: err.message});
                                } else {
                                    data.pendingUsers = users;
                                    res.render('dashboard', data);
                                }
                            })
                        }
                    }
                }); 
            }
        }
  });
});



router.get('/:username/profile', authentication.isAuthenticated, function (req, res, next) {
	var fullName = req.session.passport.user.fullName;
    User.findOne({'username': req.params.username}, function(err, user){
        res.render('profile', {title: 'Profile Page',
                                username: req.params.username,
                                verified: user.verified,
                                approved: user.approved,
                                rejected: user.rejected,
                                onHold: user.onHold,
                                inPool: user.inPool,
                                role: user.role,
                                fullName: fullName,
                                gender: user.gender,
                                dateOfBirth: utils.formatDate(user.dateOfBirth),
                                school: user.school,
                                educationLevel: user.educationLevel, 
                                major: user.major,
                                enrolled: user.enrolled ? 'Yes': 'No',
                                country: user.country,
                                region: user.region,
                                nationality: user.nationality,
                                interests: user.interests,
                                email: user.email,
                                skypeId: user.skypeId,
                                phoneNumber: user.phoneNumber,
                                schoolInCharge: user.schoolInCharge,
                                regionInCharge: user.regionInCharge,
                                countryInCharge: user.countryInCharge,
                                csrfToken: req.csrfToken()
                           });
    });
});

module.exports = router;
