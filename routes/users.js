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

// get dashboard
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
                fullName: user.fullName};

    // get unmatched registration to allow regular users to edit the registrations
    Registration.getUnmatchedRegistrationsForUser(user, function(err, registrations){
        if (err) {
          res.send({success: false, message: err.message});
        } else {
            data.registrations = registrations;
            // get either final schedules or pending schedules related to ther user
            Schedule.getSchedules(user, function (err, schedules) {
                if (err) {
                    res.send({success: false, message: err.message});
                } else {
                    data.schedules = schedules;
                    console.log('found schedules', schedules.length);
                    if (utils.isCoordinator(user.role) || utils.isRegularUser(user.role)) {
                        res.render('dashboard', data);
                    } else if (utils.isAdministrator(user.role)) {
                        // get the pending users so the admin can approve/reject/wailist from
                        // the dashboard
                        User.getPendingUsers(function (err, users) {
                            if (err) {
                                res.send({success: false, message: err.message});
                            } else {
                                data.pendingUsers = users;
                                res.render('dashboard', data);
                            }
                        });
                    }
                }
            }); 
        }
  });
});


//route for a button so that the admin can get a CSV file of all the users
router.get('/admin/userinfo', authentication.isAuthenticated, function(req, res, next){
    var user = req.session.passport.user;
    //https://www.npmjs.com/package/mongoose-to-csv
    if (utils.isAdministrator(user.role)) {
        User.getAllUsers();
        console.log('in the route shoudve made file');
    }

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
                                timezone: user.timezone,
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
