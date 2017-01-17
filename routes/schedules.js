var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");


var Schedule = require("../models/schedule.js");
var Registration = require("../models/registration.js");

//csrf stuff?
//var csrf = require('csurf');
//var csrfProtection = csrf({ cookie: true });

//GET request for seeing schedule

// gets all the registration objects and feed those to the python script 
// to get the pairs
router.get('/match', function(req, res, next) {
	Registration.getAllUnmatchedRegistrations(err, registrations) {
		var options = {
			mode: 'json',
			scriptPath: './scheduler/',
			args: [JSON.stringify(registrations)]
		}

		PythonShell.run('match.py', options, function (err, results) {
		  if (err) {
		  	throw err;
		  }
		  // results is an array consisting of messages collected during execution
		  console.log('results:', typeof results, results);
		});

		// parse the string and write to db
	}
	}
});

module.exports = router; //keep at the bottom of the file
