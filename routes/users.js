var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var csrf = require('csurf');
var User = require('../models/user.js');
var utils = require('../javascripts/utils.js');
var authentication = require('../javascripts/authentication.js');
var Registration = require("../models/registration.js");


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//gets a user's dashboard and any registrations they might have
//TODO-- eventually add a similar functionality for getting any schedules they might have
router.get('/:username', authentication.isAuthenticated, function (req, res, next) {
	var user = req.session.passport.user;

  Registration.getUnmatchedRegistrationsForUser(user, function(err, registrations){

    if(err){
      console.log("error getting registrations " + err);
      res.send({
          success: false,
          message: err
        });//end send
    }
    else{
        var regDateList = []; // will be a list containing dateAdded param of all unmatched registrations for user
        var regIdList = []; //will be a list containing ids of all unmatched registrations for the user 
        for(var i=0; i<registrations.length; i++){

            //console.log([registrations[i]._id, registrations[i].dateAdded]);

            regIdList.push(registrations[i]._id); 
            regDateList.push(registrations[i].dateAdded);

           
        }
        
        res.render('dashboard',{title: 'Dashboard',
                                csrfToken: req.csrfToken(),
                                username: req.params.username,
                                verified: user.verified,
                                approved: user.approved,
                                rejected: user.rejected,
                                onHold: user.onHold,
                                inPool: user.inPool,
                                isTutor: user.isTutor,                                        
                                fullName: user.fullName,
                                regIdList: regIdList,
                                regDateList: regDateList}                            
      );
    }//end else
  });//end get unmatched
});//end GET



router.get('/:username/profile', authentication.isAuthenticated, function (req, res, next) {
	var fullName = req.session.passport.user.fullName;
    User.findOne({'username': req.params.username}, function(err, user){
        res.render('profile', {title: 'Profile Page',
                                username: req.params.username,
                                verified: user.verified,
                                approved: user.approved,
                                rejected: user.rejected,
                                onHold: user.onHold,
                                inPool: user.inPool,
                                isTutor: user.isTutor,
                                fullName: fullName,
                                email: user.email,
                                csrfToken: req.csrfToken()
                           });
    });
});

module.exports = router;
