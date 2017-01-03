var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");


var Schedule = require("../models/schedule_model.js");

//csrf stuff?
//var csrf = require('csurf');
//var csrfProtection = csrf({ cookie: true });

//GET request for seeing schedule

module.exports = router; //keep at the bottom of the file
