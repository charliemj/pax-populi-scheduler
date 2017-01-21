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
                                        isTutor: user.isTutor,
                                        fullName: user.fullName,
                                        onHold: user.onHold,
                                        inPool: user.inPool
                                        });

});//end GET request


//POST request for submitting the availablities from submit button

router.post('/', function(req, res, next){
    var availability = req.body.availability;
    var user = req.session.passport.user; 
    var genderPref = req.body.genderPref;
    var course = req.body.course;
    var username = user.username;
    

    Registration.createRegistration(username, genderPref, availability, course, 
      function(err,registration){
        if (err){
          console.log("error submitting registration " + err);
          res.send({
            success: false,
            message: err
          });//end send
        }//end if
        else {
          //console.log("registration here:");
          //console.log(JSON.stringify(registration));
          res.status(200).send({success:"Registration has been submitted!"});
          //TODO redirect
        }//end else
    });//end createRegistration
});//end POST request


// GET request for seeing a submitted registration
router.get('/:username/:registration_id', function (req, res, next){
  var regId = req.params.registration_id;
  var user = req.session.passport.user;
  var username = user.username;

  //TODO make getRegistration fn in registration model
  Registration.getRegistration(regId, username, 
    function (err, registration){

      if(err){
        console.log("error getting registration " + err);
        res.send({
            success: false,
            message: err
          });//end send
      }//end if
      else{
          res.render('updateRegistration', {title: 'Update Registration',
                                        csrfToken: req.csrfToken(),
                                        username: user.username,
                                        tutor: user.tutor,
                                        fullName: user.fullName,
                                        availability: registration.availability,
                                        genderPref: registration.genderPref,
                                        course: registration.course,
                                        });
      }//end else

  });//end getRegistration
  
});//end GET

//PUT request for updating availablities

router.put('/:username/:registration_id', function(req, res, next){
    
  // make sure that user who is logged in is the user who's reg it is
  // look up registration by reg_id
  // perform PUT request to update registration

    var availability = req.body.availability;
    var user = req.session.passport.user; 
    var genderPref = req.body.genderPref;
    var course = req.body.course;

    Registration.updateRegistration(user, regId, genderPref, availability, course,
      function (err, registration){
        if (err){
          console.log("error updating registration " + err);
          res.send({
            success: false,
            message: err
          });//end send
        }//end if
        else {
          res.send(200,{success:"Registration has been updated!"});
          // TO DO redirect 
        }//end else
    });//end updateAvailabilty
});//end PUT request


module.exports = router; //keep at the bottom of the file
