var express = require("express");
var router = express.Router();
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
var PythonShell = require('python-shell');
var Schedule = require("../models/schedule.js");
var Registration = require("../models/registration.js");
var authentication = require('../javascripts/authentication.js');
var utils = require('../javascripts/utils.js');
var csrf = require('csurf');
var ObjectId = mongoose.Schema.Types.ObjectId;


// gets all the registration objects and feed those to the python script 
// to get the pairs
router.put('/match', [authentication.isAuthenticated, authentication.isAdministrator], function (req, res, next) {
	Schedule.getMatches(function (err, matches) {
		if (err) {
			res.send({success: false, message: err.message});
		} else {
			var numMatches = matches.length;
			var message = 'Successfully generated ' +  numMatches + ' new ';
			message += numMatches > 1 ? 'matches!': 'match!';
			res.send({success: true, message: message});
		}
	});
});

router.put('/toggleSwitch', [authentication.isAuthenticated, authentication.isAdministrator], function (req, res, next) {
	global.schedulerJob.running = !global.schedulerJob.running;
	res.send({success: true, message: global.schedulerJob.running ? 'Turned the scheduler on': 'Turned the scheduler off'});
});

router.put('/approve/:username/:scheduleId', [authentication.isAuthenticated, authentication.isAdministrator], function (req, res, next) {
	var scheduleIndex = parseInt(req.body.scheduleIndex);
	var course = req.body.course.trim();
	var scheduleId = req.body.scheduleId;
	console.log(scheduleIndex, course, scheduleId)
	Schedule.approveSchedule(scheduleId, scheduleIndex, course, function (err, updatedSchedule) {
		if (err) {
			console.log(err);
			res.send({success: false, message :err.message});
		} else {
			res.send({success: true, message: 'Successfully approved the schedule!'});
		}
	});
});

router.put('/reject/:username/:scheduleId', [authentication.isAuthenticated, authentication.isAdministrator], function (req, res, next) {
	console.log('in reject');
	Schedule.rejectSchedule(id, function (err, updatedSchedule) {
		if (err) {
			res.send({success: false, message :err.message});
		} else {
			console.log('removeSchedule', updatedSchedule);
			res.send({success: true, message: 'Successfully rejected the schedule'});
		}
	});
});

module.exports = router;