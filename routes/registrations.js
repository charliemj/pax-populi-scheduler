var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var bodyParser = require('body-parser');
var csrf = require('csurf');
var Registration = require("../models/registration.js");
var enums = require('../javascripts/enums.js');
var authentication = require('../javascripts/authentication.js');


//GET request for displaying the registration form
//Users can have at most one active (unmatched) registration at once
router.get('/', authentication.isAuthenticated, function (req, res, next) {
    var user = req.session.passport.user;

    Registration.getUnmatchedRegistrationsForUser(user, function(err, registration){

      if (err) {
        console.log("error getting registration " + err);
        res.send({ success: false, message: err.message });
      }
      else {
        if (registration.length > 0){
          res.render('registrationError', {title: 'Register',
                                csrfToken: req.csrfToken(),
                                username: user.username,
                                role: user.role,
                                user: user,
                                fullName: user.fullName,
                                onHold: user.onHold,
                                inPool: user.inPool,
                                courses: enums.courses()});
        }

        else {
          res.render('registration', {title: 'Register',
                                csrfToken: req.csrfToken(),
                                user: user,
                                username: user.username,
                                role: user.role,
                                fullName: user.fullName,
                                onHold: user.onHold,
                                inPool: user.inPool,
                                courses: enums.courses()});
        }
      }

    });

});


//POST request for submitting the registration form
router.post('/:username', authentication.isAuthenticated, function (req, res, next) {
    console.log('submitting registration');
    var availability = req.body.availability;
    var user = req.session.passport.user; 
    var genderPref = req.body.genderPref;
    var courses = req.body.courses;
    var username = user.username;
    var earliestStartTime = req.body.earliestStartTime;

    Registration.createRegistration(user, genderPref, availability, courses, earliestStartTime,
        function (err,registration){
            if (err){
                console.log("error submitting registration " + err);
                res.send({ success: false, message: err.message });
            } else {
                console.log("submission worked");
                res.status(200).send( {success: true,
                                        message:"Registration has been submitted!", 
                                        redirect: "/"});
            }
    });
});


// GET request for seeing a particular submitted registration
router.get('/update/:username/:registration_id', authentication.isAuthenticated, function (req, res, next){
  var regId = req.params.registration_id;
  var user = req.session.passport.user;
  var username = user.username;

  Registration.findRegistration(regId, user, 
    function (err, registration){
        if (err) {
            console.log("error getting registration " + err);
            res.send({ success: false, message: err.message });
        } else {
            res.render('updateRegistration', {title: 'Update Registration',
                                                user: user,
                                                csrfToken: req.csrfToken(),
                                                courses: enums.courses(),
                                                username: user.username,
                                                role: user.role,
                                                fullName: user.fullName,
                                                oldRegistration: JSON.stringify(registration),
                                                regId: regId });
        }
  });
});

//PUT request for updating registration forms
router.put('/update/:username/:registration_id', authentication.isAuthenticated, function(req, res, next){
  
  var availability = req.body.availability;
  var user = req.session.passport.user; 
  var genderPref = req.body.genderPref;
  var courses = req.body.courses;
  var earliestStartTime = req.body.earliestStartTime;
  var regId = req.params.registration_id;

  Registration.updateRegistration(user, regId, genderPref, availability, courses, earliestStartTime, 
      function (err, registration){
          if (err){
              console.log("error updating registration " + err);
              res.send({ success: false, message: err.message });
          } else {
              res.status(200).send({success: true,
                                      message:"Registration has been updated!", 
                                      redirect: "/"});
          } 
      });
});


//DELETE request for deleting a registration
router.delete('/delete/:username/:registration_id', authentication.isAuthenticated, function(req, res, next){
  var regId = req.params.registration_id;
  var user = req.session.passport.user; 

  Registration.deleteRegistration(regId, user, function (err){

    if (err){
      console.log("error deleting registration " + err);
      res.send({ success: false, message: err.message });
    }
    else {
      res.status(200).send({success: true,
                              message:"Registration has been deleted!", 
                              redirect: "/"});
    }
  });
});



module.exports = router;
