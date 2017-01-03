var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var csrf = require('csurf');
var User = require('../models/user');
var authentication = require('../javascripts/authentication.js');
var email = require('../javascripts/email.js');

// setup csurf middlewares 
var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });

/* GET home page. */
router.get('/', function(req, res, next) {
    if (req.session.passport && req.session.passport.user && req.session.passport.user.username) {
        res.redirect('/users/'+ req.session.passport.user.username);
    } else {
        res.render('home', {title: 'Pax Populi Scheduler',
                            csrfToken: req.csrfToken()});
    }
});

// Use passport.js for login authentication and bcrypt to encrypt passwords
passport.use(new LocalStrategy(function (username, password, callback) {
    User.authenticate(username.toLowerCase(), password, callback);
}))

passport.serializeUser(function (user, callback) {
    callback(null, user);
})

passport.deserializeUser(function (user, callback) {
    User.find({username: user.username}, function(err, user) {
        callback(err, user);
    });
});

// Logs the user in
router.post('/login', parseForm, csrfProtection, function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        data = {title: 'Pax Populi Scheduler',
                csrfToken: req.csrfToken()};
        if (err) {
            data.message = err.message;
            return res.render('home', data);
        }
        if (!user) {
            return res.redirect('/');
        } 
        if (!user.verified) {
            data.message = 'Your account has not been verified, please go to your mailbox to verify.';
            data.isValidAccount = true;
            data.username = user.username;
            return res.render('home', data);
        }
        req.logIn(user, function(err) {
            if (err) {
                data.message = err.message;
                return res.render('home', data);
            }
            res.redirect('/users/'+ user.username);
        });
    })(req, res, next);
});

// Logs the user out
router.post('/logout', parseForm, csrfProtection, function(req, res, next) {
    req.logout();
    res.redirect('/');
});

// Resends verification email
router.get('/verify/:username/resend', function(req, res, next) {
    var username = req.params.username;
    data = {title: 'Pax Populi Scheduler',
            username: username,
            csrfToken: req.csrfToken()}
    User.sendVerificationEmail(username, req.devMode, function (err, user) {
        if (err) {
            return res.render('home', data);
        }
        data.message = 'We have sent another verification email. Please check your email.';
        res.render('home', data);
    });    
});

// Directs user to verification page
router.get('/verify/:username/:verificationToken', function(req, res, next) {
    data = {title: 'Pax Populi Scheduler',
            username: req.params.username,
            verificationToken: req.params.verificationToken,
            csrfToken: req.csrfToken()}
    res.render('home', data);      
});

// Verifies the account
router.put('/verify/:username/:verificationToken', parseForm, csrfProtection, function(req, res, next) {
    User.verifyAccount(req.params.username, req.params.verificationToken, function (err, user) {
        data = {title: 'Pax Populi Scheduler',
                csrfToken: req.csrfToken()}
        if (err && !err.isVerified) {
            data.message = err.message;
            return res.json({'success': false, message: err.message});
        }
        data.message = 'Your account has been verified. You can now log in';
        data.success = true;
        data.redirect = '/'
        res.json(data);
    })
});

// Signs up a new account
router.post('/signup', parseForm, csrfProtection, function(req, res, next) {
    var username = req.body.requestedUsername.trim().toLowerCase();
    var password = req.body.requestedPassword.trim();
    var email = req.body.requestedEmail.trim();
    var firstName = req.body.firstName.trim();
    var lastName = req.body.lastName.trim();
    var status = req.body.status.trim();

    data = {title: 'Pax Populi Scheduler',
            csrfToken: req.csrfToken()}

    if (username.length === 0 || password.length === 0 || email.length === 0
    	|| firstName === 0 || lastName === 0) {
        data.message = 'Please enter your username and password below';
        res.render('home', data);
    } else {
        User.count({ username: username },
            function (err, count) {
                if (count > 0) {
                    data.message = 'There is already an account with this username, '
                                    + 'make sure you enter your username correctly';
                    res.render('home', data);
                } else {
                	User.count({ email: email },
            			function (err, count) {
		                if (count > 0) {
		                    data.message = 'There is already an account with this email address, '
		                                    + 'make sure you enter your email address correctly';
		                    res.render('home', data);
		                } else {
		                    authentication.createUserJSON(username, password, email, firstName, lastName, status,
		                        function (err, userJSON) {
		                            if (err) {
		                                data.message = err.message;
		                                res.render('home', data);
		                            } else {
		                            	User.signUp(userJSON, req.devMode, function (err, user) {
				                            if (err) {
				                                res.json({'success': false, 'message': err.message});
				                            } else {
				                                res.render('home', {title: 'Pax Populi Scheduler',
				                                                    message: 'Sign up successful! We have sent you a verification email.'
				                                                              + 'Please check your email.',
				                                                    csrfToken: req.csrfToken()});
				                            }
		                        		});
		                            }	
		                        });
		                }
		            });
				}
            });
    }
});

router.get('/faq', authentication.isAuthenticated, function (req, res) {
    var user = req.session.passport.user;
    res.render('faq', { title: 'FAQ',
                        username: user.username,
                        fullName: user.fullName,
                        csrfToken: req.csrfToken()});
});

module.exports = router;



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('dashboard', { title: 'Pax-Populi Scheduler' });
});

module.exports = router;
