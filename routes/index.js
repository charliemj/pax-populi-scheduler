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
                            userTypes: global.enums.userTypes,
                        	genders: global.enums.genders,
                        	confirmation: global.enums.confirmation,
                        	studentSchools: global.enums.studentSchools,
                        	tutorSchools: global.enums.tutorSchools,
                        	studentEducationLevels: global.enums.studentEducationLevels,
                        	tutorEducationLevels: global.enums.tutorEducationLevels,
                            passwordRegex: JSON.stringify(regexs.passwordPattern()),
                            emailRegex: JSON.stringify(regexs.emailPattern()),
                            notAllowedRegex: JSON.stringify(regexs.notAllowedPattern()),
                        	majors: global.enums.majors,
                        	interests: global.enums.interests});
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
        if (!user.verified) {
            data.message = 'Your account has not been verified, please go to your mailbox to verify.';
            data.isValidAccount = true;
            data.username = user.username;
            return res.render('home', data);
        } else if (user.archived) {
            data.message = 'Your account has been archived by the adminstrators. '
                            + 'You no longer have access to this account';
            data.archived = true;
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
        User.find({role: 'Administrator'}, function (err, admins) {
                if (err) {
                    res.send({success: false, message: err.message});
                } else {
                    console.log('admins', admins);
                    email.sendApprovalRequestEmail(user, req.devMode, admins, function (err, user) {
                        if (err) {
                            data.message = err.message;
                            return res.json({'success': false, message: err.message});
                        }
                    });
                    data.message = 'Your account has been verified successfully. Next, the adminstrators will be going through your application, and inform you shortly about their decision.';  
                    data.success = true;
                    data.redirect = '/';
                    res.json(data);
                }
        });
    });
});

// Directs admin to request page
router.get('/respond/:username/:requestToken', [authentication.isAuthenticated, authentication.isAdministrator], function(req, res, next) {
    var username = req.params.username;
    var user = req.session.passport.user;
    User.getUser(username, function (err, accountUser) {
        if (err){
            return res.json({'success': false, message: err});
        }
        else{
            accountUser.password = undefined;
            var data = {title: 'Pax Populi Scheduler',
                        user: accountUser,
                        username: username,
                        fullName: user.fullName,
                        onHold: user.onHold,
                        inPool: user.inPool,
                        role: user.role,
                        requestToken: req.params.requestToken,
                        csrfToken: req.csrfToken()};
            res.redirect('/'); 
        }
    });
         
});

// Approves the account
router.put('/approve/:username/:requestToken', [authentication.isAuthenticated, authentication.isAdministrator], parseForm, csrfProtection, function(req, res, next) {
    User.respondToAccountRequest(req.params.username, req.params.requestToken, true, false, function (err, user) {
        data = {title: 'Pax Populi Scheduler',
                csrfToken: req.csrfToken(),
                redirect: '/'};
        if (!user || (err && !user.approved))  {
            data.message = err.message;
            data.success = false;
            return res.json(data);
        }
        User.sendApprovalEmail(user.username, req.devMode, function (err) {
	        if (err) {
	            data.message = err.message;
                data.success = false;
                return res.json(data);
	        }
	        else{
                data.message = '{} {}\'s account has been approved. He/She has been notified.'.format(user.firstName, user.lastName);   
    	        data.success = true;
    	        data.redirect = '/';
    	        res.json(data);
            }
	    });
    });
});

// Rejects the account
router.put('/reject/:username/:requestToken', [authentication.isAuthenticated, authentication.isAdministrator], parseForm, csrfProtection, function(req, res, next) {
    User.respondToAccountRequest(req.params.username, req.params.requestToken, false, false, function (err, user) {
        data = {title: 'Pax Populi Scheduler',
                csrfToken: req.csrfToken(),
                redirect: '/'};
        if (!user || (err && !user.rejected)) {
            data.message = err.message;
            data.success = false;
            return res.json(data);
        }
        User.sendRejectionEmail(user.username, req.devMode, function (err) {
	        if (err) {
	            data.message = err.message;
                data.success = false;
                return res.json(data);
	        }
            else{
    	        data.message = '{} {}\'s account has been rejected. He/She has been notified.'.format(user.firstName, user.lastName);   
    	        data.success = true;
    	        data.redirect = '/';
    	        res.json(data);
            }
	    });
    });
});

// Waitlists the account
router.put('/waitlist/:username/:requestToken', [authentication.isAuthenticated, authentication.isAdministrator], parseForm, csrfProtection, function(req, res, next) {
    User.respondToAccountRequest(req.params.username, req.params.requestToken, true, true, function (err, user) {
        data = {title: 'Pax Populi Scheduler',
                csrfToken: req.csrfToken(),
                redirect: '/'};
        if (!user || (err || !user.approved || !user.onHold)){
            data.message = err.message;
            data.success = false;
            return res.json(data);
        }
        User.sendWaitlistEmail(user.username, req.devMode, function (err) {
	        if (err) {
	            data.message = err.message;
                data.success = false;
                return res.json(data);
	        }
            else{
    	        data.message = '{} {}\'s account has been moved to waitlist. He/She has been notified'.format(user.firstName, user.lastName);
    	        data.success = true;
    	        data.redirect = '/';
    	        res.json(data);
            }
	    });
    });
});

// Archives the account
router.put('/archive/:username', [authentication.isAuthenticated, authentication.isAdministrator], parseForm, csrfProtection, function(req, res, next) {
    User.archiveUser(req.params.username, function (err, user) {
        data = {title: 'Pax Populi Scheduler',
                csrfToken: req.csrfToken(),
                redirect: '/'};
        if (!user || (err || !user.archived)) {
            data.message = err.message;
            data.success = false;
            return res.json(data);
        }
        User.sendArchiveEmail(user.username, req.devMode, function (err) {
            if (err) {
                data.message = err.message;
                data.success = false;
                return res.json(data);
            }
            else{
                data.message = '{} {}\'s account has been archived. He/She has been notified'.format(user.firstName, user.lastName);
                data.success = true;
                data.redirect = '/settings';
                res.json(data);
            }
        });
    });
});

// signs up a new account
router.post('/signup', parseForm, csrfProtection, function(req, res, next) {
	console.log('signing up...');
    var formDefaults = { userTypes: global.enums.userTypes,
                            genders: global.enums.genders,
                            confirmation: global.enums.confirmation,
                            studentSchools: global.enums.studentSchools,
                            tutorSchools: global.enums.tutorSchools,
                            studentEducationLevels: global.enums.studentEducationLevels,
                            tutorEducationLevels: global.enums.tutorEducationLevels,
                            passwordRegex: JSON.stringify(regexs.passwordPattern()),
                            emailRegex: JSON.stringify(regexs.emailPattern()),
                            notAllowedRegex: JSON.stringify(regexs.notAllowedPattern()),
                            majors: global.enums.majors,
                            interests: global.enums.interests};
    var data = {title: 'Pax Populi Scheduler',
                csrfToken: req.csrfToken()};
    Object.assign(data, formDefaults);
    var userJSON = authentication.createUserJSON(req.body, function (err, userJSON) {
        if (err) {
            data.message = err.message;
            res.render('home', data);
        } else {
            console.log('userJSON', userJSON);
            User.signUp(userJSON, req.devMode, function (err, user) {
                if (err) {
                    data.mesage = err.message;
                    res.render('home', data);
                } else {
                    data.message = 'Sign up successful! We have sent you a verification email. '
                                    + 'Please check your email.';
                    res.render('home', data);
                }
            });
        }
    });
});

//Gets the FAQ page
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

//Gets the settings page for admin (where they can turn off/on scheduler and update sign up form info)
router.get('/settings', [authentication.isAuthenticated, authentication.isAdministrator], parseForm, csrfProtection, function(req, res, next) {
    var user = req.session.passport.user;
    res.render('settings', {title: 'Settings',
                            username: user.username,
                            fullName: user.fullName,
                            onHold: user.onHold,
                            inPool: user.inPool,
                            role: user.role,
                            csrfToken: req.csrfToken(),
                            studentSchools: global.enums.studentSchools,
                            tutorSchools: global.enums.tutorSchools,
                            majors: global.enums.majors,
                            interests: global.enums.interests,
                            courses: global.enums.courses,
                            schedulerOn: global.schedulerJob.running});
});

//Gets the "manage users" page for admins
router.get('/manageUsers', [authentication.isAuthenticated, authentication.isAdministrator], parseForm, csrfProtection, function(req, res, next) {
    var user = req.session.passport.user;
    res.render('userSearch', {title: 'Manage Users',
                            username: user.username,
                            fullName: user.fullName,
                            onHold: user.onHold,
                            inPool: user.inPool,
                            role: user.role,
                            csrfToken: req.csrfToken(),
                            studentSchools: global.enums.studentSchools,
                            tutorSchools: global.enums.tutorSchools,
                            majors: global.enums.majors,
                            interests: global.enums.interests,
                            courses: global.enums.courses,
                            schedulerOn: global.schedulerJob.running});
});

//Performs the search request for admins looking up users
router.post('/search', [authentication.isAuthenticated, authentication.isAdministrator], parseForm, csrfProtection, function(req, res, next) {
    var keyword = req.body.keyword.trim();
    var user = req.session.passport.user;
    var data = {title: 'Manage Users',
                username: user.username,
                fullName: user.fullName,
                onHold: user.onHold,
                inPool: user.inPool,
                role: user.role,
                csrfToken: req.csrfToken(),
                schedulerOn: global.schedulerJob.running,
                studentSchools: global.enums.studentSchools,
                tutorSchools: global.enums.tutorSchools,
                majors: global.enums.majors,
                interests: global.enums.interests,
                courses: global.enums.courses,
                schedulerOn: global.schedulerJob.running};
    User.searchUsers(keyword, function (err, users) {
        if (err) {
            data.message = 'An error has occured. Please try again.';
        } else if (users.length === 0) {
            data.message = 'No results.';
        } else {
            users.forEach(function (user) {
                user.password = undefined;
            });
            data.users = users;
        }
        res.render('userSearch', data);
    });
});

router.post('/editFormDefaults', [authentication.isAuthenticated, authentication.isAdministrator], parseForm, csrfProtection, function(req, res, next) {
    global.global.enums.updateEnum(req.body, function (err, enums) {
        if (err) {
            console.log(err.message);
            res.redirect('/settings');
        } else {
            console.log('Update successful');
            global.enums = enums;
            res.redirect('/settings');
        }
    });
});

module.exports = router;
