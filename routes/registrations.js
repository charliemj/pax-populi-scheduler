var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var bodyParser = require('body-parser');
var csrf = require('csurf');
var Registration = require("../models/registration.js");
var enums = require('../javascripts/enums.js');
var authentication = require('../javascripts/authentication.js');


//GET request for displaying the availablities form

router.get('/', authentication.isAuthenticated, function (req, res, next) {
    var user = req.session.passport.user;

    Registration.getUnmatchedRegistrationsForUser(user, function(err, registration){

      if (err){
        console.log("error getting registration " + err);
        res.send({ success: false, message: err.message });
      }

      else{
        console.log("here's the registration");
        console.log(registration);
        if (registration.length > 0){
          res.render('registrationError', {title: 'Register',
                                csrfToken: req.csrfToken(),
                                username: user.username,
                                role: user.role,
                                fullName: user.fullName,
                                onHold: user.onHold,
                                inPool: user.inPool,
                                courses: enums.courses()});
        }

        else{
          res.render('registration', {title: 'Register',
                                csrfToken: req.csrfToken(),
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


//POST request for submitting the availablities from submit button

router.post('/:username', authentication.isAuthenticated, function (req, res, next) {
    console.log('in submitting')
    var availability = req.body.availability;
    var user = req.session.passport.user; 
    var genderPref = req.body.genderPref;
    var courses = req.body.courses;
    var username = user.username;
    var earliestStartTime = req.body.earliestStartTime;

    Registration.createRegistration(username, genderPref, availability, courses, earliestStartTime,
        function (err,registration){
            console.log(err);
            if (err){
                console.log("error submitting registration " + err);
                res.send({ success: false, message: err.message });
            } else {
                res.status(200).send( {success: true,
                                        message:"Registration has been submitted!", 
                                        redirect: "/"});
                //TODO redirect
            }
    });
});


// GET request for seeing a submitted registration

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

//PUT request for updating availablities

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


//DELETE request for deleting registration objects
router.delete('/delete/:username/:registration_id', authentication.isAuthenticated, function(req, res, next){
  var regId = req.params.registration_id;

  Registration.deleteRegistration(regId, function(err){

    if (err){
      console.log("breaks in route if");
      console.log("error deleting registration " + err);
      res.send({ success: false, message: err.message });
    }
    else {
      console.log("breaks in route else");
      res.status(200).send({success: true,
                              message:"Registration has been deleted!", 
                              redirect: "/"});
    }
  });

});



module.exports = router;
