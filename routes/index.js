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
var enums = require('../javascripts/enums.js');
var regexs = require("../javascripts/regexs.js");
var utils = require('../javascripts/utils.js');
var Schedule = require("../models/schedule.js");


// setup csurf middlewares 
var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });

/* GET home page. */
router.get('/', function(req, res, next) {
    if (req.session.passport && req.session.passport.user && req.session.passport.user.username) {
        res.redirect('/users/'+ req.session.passport.user.username);
    } else {
        res.render('home', {title: 'Pax Populi Scheduler',
                            csrfToken: req.csrfToken(),
                            userTypes: enums.userTypes(),
                        	genders: enums.genders(),
                        	confirmation: enums.confirmation(),
                        	studentSchools: enums.studentSchools(),
                        	tutorSchools: enums.tutorSchools(),
                        	studentEducationLevels: enums.studentEducationLevels(),
                        	tutorEducationLevels: enums.tutorEducationLevels(),
                            passwordRegex: JSON.stringify(regexs.passwordPattern()),
                            emailRegex: JSON.stringify(regexs.emailPattern()),
                            notAllowedRegex: JSON.stringify(regexs.notAllowedPattern()),
                        	majors: enums.majors(),
                        	interests: enums.interests()});
    }
});

// Use passport.js for login authentication and bcrypt to encrypt passwords
passport.use(new LocalStrategy(function (username, password, callback) {
    User.authenticate(username.toLowerCase(), password, callback);
}));

passport.serializeUser(function (user, callback) {
    callback(null, user);
});

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
        console.log('user', user);
        if (!user.verified) {
            data.message = 'Your account has not been verified, please go to your mailbox to verify.';
            data.isValidAccount = true;
            data.username = user.username;
            return res.render('home', data);
        } else if (user.rejected) {
        	data.message = 'Your account has been rejected by the adminstrators so you do not have '
        					+ 'the permission to use this scheduler';
        	return res.render('home', data);
        } else if (!user.approved) {
        	data.message = 'Your account has not been approved by the adminstrators so you do not have '
        					+ 'the permission to use this scheduler yet. Please keep an eye on your ' 
        					+ 'email for further notice.';
        	return res.render('home', data);
        } else if (user.approved) {
        	req.logIn(user, function(err) {
	            if (err) {
	                data.message = err.message;
	                return res.render('home', data);
	            }
                var path = req.body.ref_path;
                res.redirect(path !== '' ? path : '/users/'+ user.username);
	        });
        }
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
            csrfToken: req.csrfToken()};
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
    var username = req.params.username;
    data = {title: 'Pax Populi Scheduler',
            message: 'Hello ' + username + '! Click below to verify your account',
            username: username,
            verificationToken: req.params.verificationToken,
            csrfToken: req.csrfToken()};
    res.render('home', data);      
});

// Verifies the account
router.put('/verify/:username/:verificationToken', parseForm, csrfProtection, function(req, res, next) {
    User.verifyAccount(req.params.username, req.params.verificationToken, function (err, user) {
        data = {title: 'Pax Populi Scheduler',
                csrfToken: req.csrfToken()};
        if (err) {
        	if (!err.isVerified) {
            	data.message = err.message;
            	return res.json({'success': false, message: err.message});
            } else if (err.isVerified) {
            	data.success = true;
        		data.redirect = '/';
        		data.message = err.message;
        		return res.json(data);
        	}
        }
        email.sendApprovalRequestEmail(user, req.devMode, function (err, user) {
        	if (err) {
        		data.message = err.message;
            	return res.json({'success': false, message: err.message});
        	}
        	data.message = 'Your account has been verified successfully. Next, the adminstrators will be going through your application, and inform you shortly about their decision.';  
        	data.success = true;
        	data.redirect = '/';
        	res.json(data);
        }); 
    });
});

// Directs admin to request page
router.get('/respond/:username/:requestToken', [authentication.isAuthenticated, authentication.isAdministrator], function(req, res, next) {
    var username = req.params.username;
    var user = req.session.passport.user;
    User.getUser(username, function (err, accountUser) {
        accountUser.password = undefined;
        console.log(accountUser);
        var data = {title: 'Pax Populi Scheduler',
                    user: accountUser,
                    username: username,
                    fullName: user.fullName,
                    onHold: user.onHold,
                    inPool: user.inPool,
                    role: user.role,
                    requestToken: req.params.requestToken,
                    csrfToken: req.csrfToken()};
        res.render('home', data); 
    })
         
});

// Approves the account
router.put('/approve/:username/:requestToken', [authentication.isAuthenticated, authentication.isAdministrator], parseForm, csrfProtection, function(req, res, next) {
    User.respondToAccountRequest(req.params.username, req.params.requestToken, true, false, function (err, user) {
        data = {title: 'Pax Populi Scheduler',
                csrfToken: req.csrfToken()};
        if (!user || (err && !user.approved))  {
            data.message = err.message;
            return res.json({'success': false, message: err.message});
        }
        User.sendApprovalEmail(user.username, req.devMode, function (err) {
	        if (err) {
	        	console.log('failed to send');
	            return res.render('home', data);
	        }
	        console.log('sent, redirecting');
	        data.message = '{} {}\'s account has been approved. He/She has been notified.'.format(user.firstName, user.lastName);   
	        data.success = true;
	        data.redirect = '/';
	        res.json(data);
	    });
    });
});

// Rejects the account
router.put('/reject/:username/:requestToken', [authentication.isAuthenticated, authentication.isAdministrator], parseForm, csrfProtection, function(req, res, next) {
    User.respondToAccountRequest(req.params.username, req.params.requestToken, false, false, function (err, user) {
        data = {title: 'Pax Populi Scheduler',
                csrfToken: req.csrfToken()};
        if (!user || (err && !user.rejected)) {
            data.message = err.message;
            return res.json({'success': false, message: err.message});
        }
        User.sendRejectionEmail(user.username, req.devMode, function (err) {
	        if (err) {
	            return res.render('home', data);
	        }
	        data.message = '{} {}\'s account has been rejected. He/She has been notified.'.format(user.firstName, user.lastName);   
	        data.success = true;
	        data.redirect = '/';
	        res.json(data);
	    });
    });
});

// Waitlists the account
router.put('/waitlist/:username/:requestToken', [authentication.isAuthenticated, authentication.isAdministrator], parseForm, csrfProtection, function(req, res, next) {
    User.respondToAccountRequest(req.params.username, req.params.requestToken, true, true, function (err, user) {
        data = {title: 'Pax Populi Scheduler',
                csrfToken: req.csrfToken()};
        if (!user || (err || !user.approved || !user.onHold)){
            data.message = err.message;
            return res.json({'success': false, message: err.message});
        }
        User.sendWaitlistEmail(user.username, req.devMode, function (err) {
	        if (err) {
	            return res.render('home', data);
	        }
	        data.message = '{} {}\'s account has been moved to waitlist. He/She has been notified'.format(user.firstName, user.lastName);
	        data.success = true;
	        data.redirect = '/';
	        res.json(data);
	    });
    });
});

// signs up a new account
router.post('/signup', parseForm, csrfProtection, function(req, res, next) {
	console.log('signing up...');
    console.log(req.body);
    var userJSON = authentication.createUserJSON(req.body, function (err, userJSON) {
        if (err) {
            res.render('home', {title: 'Pax Populi Scheduler',
                                message: err.message,
                                csrfToken: req.csrfToken()});
        } else {
            console.log('userJSON', userJSON);
            data = {title: 'Pax Populi Scheduler',
                    csrfToken: req.csrfToken()};
            User.signUp(userJSON, req.devMode, function (err, user) {
                if (err) {
                    res.render('home', {title: 'Pax Populi Scheduler',
                                        message: err.message,
                                        csrfToken: req.csrfToken()});
                } else {
                    res.render('home', {title: 'Pax Populi Scheduler',
                                        message: 'Sign up successful! We have sent you a verification email.'
                                                  + 'Please check your email.',
                                        csrfToken: req.csrfToken()});
                }
            });
        }
    });
});

router.get('/faq', authentication.isAuthenticated, function (req, res) {
    var user = req.session.passport.user;
    res.render('faq', { title: 'FAQ',
                        username: user.username,
                        fullName: user.fullName,
                        onHold: user.onHold,
                        inPool: user.inPool,
                        role: user.role,
                        csrfToken: req.csrfToken()});
});

module.exports = router;
