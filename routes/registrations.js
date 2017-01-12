var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var csrf = require('csurf');
var Registration = require("../models/registration.js");


//GET request for displaying the availablities form
//there will be a link to "register for a class"

router.get('/',function(req, res, next){
  var user = req.session.passport.user;
  res.render('registration', {title: 'Register',
                                        csrfToken: req.csrfToken(),
                                        username: user.username,
                                        tutor: user.tutor,
                                        fullName: user.fullName,
                                        });
});//end GET request


//POST request for submitting the availablities from submit button

router.post('/', function(req, res, next){
    var times = req.body.registration;
    var gender_pref = req.body.gender_pref;
    var user = req.session.passport.user; 
    var genderPref = req.body.genderPref;
    var course = req.body.course;
    var username = user.username;
    

    Registration.createRegistration(user, genderPref, times,
      function(err,registration){
        if (err){
          console.log("error submitting registration " + err);
          res.send({
            success: false,
            message: err
          });//end send
        }//end if
        else {
          res.send(200,{success:"Registration has been submitted!"});
        }//end else
    });//end createRegistration
});//end POST request


//PUT request for updating availablities (only available via the confirmation of a schedule page!)

router.put('/registration/:user_id', function(req, res, next){
    //find user, go to their avail, update it
    var times = req.body.registration;
    var user = req.session.passport.user; 
    var genderPref = req.body.genderPref;
    var course = req.body.course;

    Registration.updateAvailabilty(user, gender_pref, times,
      function(err,availabilty){
        if (err){
          console.log("error updating availablity " + err);
          res.send({
            success: false,
            message: err
          });//end send
        }//end if
        else {
          res.send(200,{success:"Availabilty has been updated!"});
        }//end else
    });//end updateAvailabilty
});//end PUT request


module.exports = router; //keep at the bottom of the file
