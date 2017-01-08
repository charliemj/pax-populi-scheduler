var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");

var Avail = require("../models/available_model.js");

//csrf stuff?
//var csrf = require('csurf');
//var csrfProtection = csrf({ cookie: true });

//GET request for displaying the availablities form
//there will be a link to "register for a class"

router.get('/',function(req, res){
    //display the availabilty.html page
});//end get request

//POST request for submitting the availablities form
//submit button

router.post('/', function(req, res){
    Avail.create({
        //params to save to DB
    }, function(err, avail){
        if (err){
            res.send(err);
        }//end if
        else{
            //do something with the avail
        }//end else
    });//end create
});//end post request

// req.body[0] -->sunday etc

//PUT request for updating availablities (only available via the confirmation of a schedule page!)

router.put('/avail/:avail_id', function(req, res){
    Avail.update({_id: req.params.avail_id}, 
    function(err, avail){
        if (err){
            res.send(err);
        }//end if
        else{
            //do something
        }//end else
    });//end update
});//end put request


module.exports = router; //keep at the bottom of the file
