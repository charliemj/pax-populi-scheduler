var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var csrf = require('csurf');
var Availability = require("../models/availability.js");


//GET request for displaying the availablities form
//there will be a link to "register for a class"

router.get('/',function(req, res, next){
  var user = req.session.passport.user;
  res.render('availability', {title: 'Register',
                                        csrfToken: req.csrfToken(),
                                        username: user.username,
                                        tutor: user.tutor,
                                        fullName: user.fullName,
                                        });
});//end get request


//POST request for submitting the availablities from submit button

router.post('/', function(req, res, next){
    var times = req.body.availability; 
    
    // times is an object like
      // { '0': [ [ '23:00', '24:00' ] ],
      // '1': [],
      // '2': [],
      // '3': [],
      // '4': [],
      // '5': [],
      // '6': [[ '23:00', '24:00' ] }

    Availability.create({times: times}, 
    function(err, availability){
        if (err){
            res.send({
            success: false,
            message: err
          }); 
        }//end if
        else{
            res.status(200); //everything worked! 
        }//end else
    });//end create
});//end post request


//PUT request for updating availablities (only available via the confirmation of a schedule page!)

router.put('/availability/:user_id', function(req, res, next){
    //find user, go to their avail, update it
    Availability.update({_id: req.params.user_id}, 
    function(err, availability){
        if (err){
            res.send(err);
        }//end if
        else{
            //do something
        }//end else
    });//end update
});//end put request


module.exports = router; //keep at the bottom of the file
