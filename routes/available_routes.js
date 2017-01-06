var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");

var Available = require("../models/available_model.js");

//csrf stuff?
//var csrf = require('csurf');
//var csrfProtection = csrf({ cookie: true });

//GET request for displaying the availablities form
//there will be a link to "register for a class"

//POST request for submitting the availablities form
//submit button

// req.body[0] -->sunday etc

//PUT request for updating availablities (only available via the confirmation of a schedule page!)

module.exports = router; //keep at the bottom of the file
