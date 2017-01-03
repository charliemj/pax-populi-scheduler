var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var csrf = require('csurf');
var User = require('../models/user.js');
var utils = require('../javascripts/utils.js');
var authentication = require('../javascripts/authentication.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/:username', authentication.isAuthenticated, function (req, res, next) {
	var user = req.session.passport.user;
    res.render('dashboard', { title: 'Dashboard',
                              username: user.username,
                              tutor: user.tutor,
                              fullName: user.fullName,
                              csrfToken: req.csrfToken()});
});

router.get('/:username/profile', authentication.isAuthenticated, function (req, res, next) {
	var fullName = req.session.passport.user.fullName;
    User.findOne({'username': req.params.username}, function(err, user){
        res.render('profile', {title: 'Profile Page',
                               username: req.params.username,
                               tutor: user.tutor,
                               fullName: fullName,
                               email: user.email,
                               csrfToken: req.csrfToken()
                           });
    });
});

module.exports = router;
