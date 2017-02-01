var nodemailer = require('nodemailer');
var config = require('./config.js');
var utils = require('./utils.js');
var enums = require('./enums.js');
var User = require('../models/user.js');


var Email = function() {

    var that = Object.create(Email.prototype);

    that.welcomeMessage = '<center><h2>Hello from Pax Populi Scheduler!</h2></center>';
    that.signature = '<br> Cheers, <br> Pax Populi Scheduler Team';

    // create reusable transporter object using the default SMTP transport
    var smtpConfig = {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: process.env.GMAIL_ADDRESS || config.emailAddress(),
            pass: process.env.GMAIL_PASSWORD || config.emailPassword()
        }
    };
    that.transporter = nodemailer.createTransport(smtpConfig);


    /**
    * Source: http://stackoverflow.com/a/4974690
    * Replaces the '{}' in the string by the arguments in order
    */
    String.prototype.format = function () {
        var i = 0, args = arguments;
        return this.replace(/{}/g, function () {
            return typeof args[i] != 'undefined' ? args[i++] : '';
        });
    };

    /**
    * Send an email from Pax Populi Scheduler email to the given email address
    * @param {String} email address - the email address of the receiver of the email
    * @param {String} subject - the subject of the email
    * @param {String} html - the html string for the email body
    * @return {Object} object - object.success is true if the email was sent
                                successfully, false otherwise
    */
    var sendEmail = function (emailAddress, subject, htmlContent, callback) {
        var sendFrom = process.env.GMAIL_ADDRESS || config.emailAddress();
        var mailOptions = {
            from: 'Pax Populi Scheduler 6.S187 <' + sendFrom + '>', // sender address
            to: emailAddress,
            subject: subject, // subject line
            text: '', // plaintext body
            html: htmlContent // html body
        };
        // send mail with defined transport object
        that.transporter.sendMail(mailOptions, function(err, info){
            if(err){
                console.log('could not send', err.message);
                return callback({success: false, message: 'Failed to send the email'});
            }
            console.log('sending succeeded');
            return callback(null);
        });
    };

    // Adapted from https://www.quora.com/How-can-you-send-a-password-email-verification-link-using-NodeJS-1
    /**
    * Creates a random enums.numTokenDigits-long token for the spepcified user
    * @param {Object} user - the user object for while the verification token is for
    * @param {Function} callback - the function to call after the token has been created
    */
    that.createToken = function (user, isVerifyToken, callback) {
        // create random 32 character token
        var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var token = '';
        for (var i = enums.numTokenDigits(); i > 0; --i) {
            token += chars[Math.round(Math.random() * (chars.length - 1))];
        }
        isVerifyToken ? user.setVerificationToken(token, callback) : user.setRequestToken(token, callback);
    };

    /**
    * Sends verfication email to user with the confirm button that links to verify request
    * @param {Object} user - the user object for while the verification token is for
    * @param {Boolean} developmentMode - true if the app is in development mode, false otherwise
    * @param {Function} callback - the function to call after the email has been sent
    */
    that.sendVerificationEmail = function (user, developmentMode, callback) {
        that.createToken(user, true, function (err, user) {
            var subject = 'Confirm your Pax Populi Scheduler Account, {}!'.format(user.username);
            var link;
            if (developmentMode) {
                link = 'http://localhost:3000/verify/{}/{}'.format(user.username, user.verificationToken);
            } else {
                link = '{}/verify/{}/{}'.format((process.env.PRODUCTION_URL || config.productionUrl()), user.username, user.verificationToken);
            }
            var content = '{}<p>Hi {}!<br><br>Confirm your Pax Populi Scheduler account by clicking on the confirm button below.<form action="{}"><input type="submit" value="Confirm" /></form>{}</p>'.format(that.welcomeMessage, user.firstName, link, that.signature);
            console.log('about to send a verification email to', user.email);
            sendEmail(user.email, subject, content, callback);

        });
    };

    /**
    * Sends an email to the admin to ask for the approval for a new 
    * @param {Object} user - the user object for while the verification token is for
    * @param {Boolean} developmentMode - true if the app is in development mode, false otherwise
    * @param {Function} callback - the function to call after the email has been sent
    */
    that.sendApprovalRequestEmail = function (user, developmentMode, admins, callback) {
        that.createToken(user, false, function (err, user) {
            if (err) {
                return callback({success: false, message: err.message});
            }
            admins.forEach(function (admin) {
                var subject = 'Pax Populi Scheduler Account Request from {} {}!'.format(user.firstName, user.lastName);
                var content = that.makeApprovalRequestEmailContent(user, developmentMode, admin);
                console.log(content);
                console.log('about to send an approval request email to', user.email);
                sendEmail(admin.email, subject, content, callback); // for now send it back to the user
            });
        });
    };

    /**
    * Sends an email to inform the user that his/her account has been approved
    * @param {Object} user - the user object whose account just got approved
    * @param {Object} developmentMode - true if the app is in development mode, false otherwise
    * @return {Object} object - object.success is true if the email was sent
                                successfully, false otherwise
    */
    that.sendApprovalEmail = function (user, developmentMode, callback) {
        var subject = 'Updates on the status of your Pax Populi account';
        var emailContent = '{}<p> Hi {}!<br><br>Your Pax Populi account has been approved! You can now log in and register for a class.<br>{}</p>'.format(that.welcomeMessage, user.firstName, that.signature);
        console.log('user', user);
        return sendEmail(user.email, subject, emailContent, callback);
    };

    /**
    * Sends an email to inform the user that his/her account has been rejection
    * @param {Object} user - the user object whose account just got rejection
    * @param {Object} developmentMode - true if the app is in development mode, false otherwise
    * @return {Object} object - object.success is true if the email was sent
                                successfully, false otherwise
    */
    that.sendRejectionEmail = function (user, developmentMode, callback) {
        var subject = 'Updates on the status of your Pax Populi account';
        var emailContent = '{}<p> Hi {}!<br><br>Sorry, you have not been approved by an administrator and will not be able to login or register for classes. If you have any concerns or would like us to re-evaluate your account, please email Bob McNulty at robert@appliedethics.org.<br>{}</p>'.format(that.welcomeMessage, user.firstName, that.signature);
        console.log('user', user);
        return sendEmail(user.email, subject, emailContent, callback);
    };

    /**
    * Sends an email to inform the user that his/her account has been waitlisted
    * @param {Object} user - the user object whose account just got rejection
    * @param {Object} developmentMode - true if the app is in development mode, false otherwise
    * @return {Object} object - object.success is true if the email was sent
                                successfully, false otherwise
    */
    that.sendWaitlistEmail = function (user, developmentMode, callback) {
        var subject = 'Updates on the status of your Pax Populi account';
        var emailContent = '{}<p> Hi {}!<br><br>Your Pax Populi account has been approved. However, due to limited capacity, you are currenly waitlisted. This means that while you can now sign in to your account, you cannot register for classes just yet. We will notify you when you can register for a class. Sorry for the inconvenience!<br>{}</p>'.format(that.welcomeMessage, user.firstName, that.signature);
        console.log('user', user);
        return sendEmail(user.email, subject, emailContent, callback);
    };

    /**
    * Sends an email to inform the user that his/her account has been archived
    * @param {Object} user - the user object whose account just got archived
    * @param {Object} developmentMode - true if the app is in development mode, false otherwise
    * @return {Object} object - object.success is true if the email was sent
                                successfully, false otherwise
    */
    that.sendArchiveEmail = function (user, developmentMode, callback) {
        var subject = 'Updates on the status of your Pax Populi account';
        var emailContent = '{}<p> Hi {}!<br><br>Your Pax Populi account has been deactivated by the administrators. You no longer have access to this account and will not receive any emails from us in the future. If you think there was a mistake, please contact Bob McNulty at robert@appliedethics.org.<br>{}</p>'.format(that.welcomeMessage, user.firstName, that.signature);
        console.log('user', user);
        return sendEmail(user.email, subject, emailContent, callback);
    };

    /**
    * Sends an email to inform the user that they have been matched to someone
    * @param {Object} user - the user object of the user
    * @return {Object} object - object.success is true if the email was sent
                                successfully, false otherwise
    */
    that.sendScheduleEmails = function (user, callback) {
        var subject = 'Updates on the status of your Pax Populi class registration';
        var emailContent = '{}<p> Hi {}!<br><br>You have been matched to a {} for the class you last registered for. You can now see your schedule on your dashboard.<br>{}</p>'.format(that.welcomeMessage, user.firstName, user.role.toLowerCase() === 'student'? 'tutor': 'student', that.signature);
        sendEmail(user.email, subject, emailContent, callback);
    };

    /**
    * Sends an email to inform admins that there are new matches
    * @param {Number} numMatches - the number of newly generated matches
    * @return {Object} object - object.success is true if the email was sent
                                successfully, false otherwise
    */
    that.notifyAdmins = function (numMatches, admins, callback) {
        admins.forEach(function (admin) {
            var subject = 'New matches generated in Pax Populi Scheduler';
            var emailContent = '{}<p> Hi {}!<br><br>We have just generated {} new matches. You can view them under \"Pending Schedules\" on your dashboard. Please log in to approve/reject the matches before the start date of each class. If you fail to do so, the newly matched registrations will be moved back to the matching pool.<br>{}</p>'.format(that.welcomeMessage, admin.firstName, numMatches, that.signature);
            sendEmail(admin.email, subject, emailContent, callback);
        });  
    };

    /**
    * Sends an email to remind student/tutor to confirm that they could meet
    * @param {Object} user - the user object of the user
    * @return {Object} object - object.success is true if the email was sent
                                successfully, false otherwise
    */
    that.sendReminderEmail = function (user, userSchedule, callback) {
        var subject = 'Pax Populi Class Reminder';
        var partner = user.role.toLowerCase() === 'student'? 'tutor': 'student';
        var emailContent = '{}<p> Hi {}!<br><br>You have an appointment scheduled with your {} in three days on {}. If you cannot make this appointment, please contact your {} as well as your coordinator.<br>{}</p>'.format(that.welcomeMessage, user.firstName, partner, utils.getFormatedNearestMeetingTime(userSchedule), partner, that.signature);
        sendEmail(user.email, subject, emailContent, callback);
    };

    that.makeApprovalRequestEmailContent = function (user, developmentMode, admin) {
        var link;
            if (developmentMode) {
                link = 'http://localhost:3000/respond/{}/{}'.format(user.username, user.requestToken);
            } else {
                link = '{}/respond/{}/{}'.format((process.env.PRODUCTION_URL || config.productionUrl()), user.username, user.requestToken);
            }
        var content = '{}<p>Hi {} {}!<br><br>'.format(that.welcomeMessage, admin.firstName, admin.lastName)
                            + '{} {} has just requested to join Pax Populi as a/an {}. '.format(user.firstName, user.lastName, user.role.toLowerCase())
                            + 'Below is {}\'s profile. To respond to this application, click on the "Respond to Request" button below.<br><ul>'.format(user.firstName)
                            + '<li>Full Name: {} {}</li>'.format(user.firstName, user.lastName)
                            + '<li>Email Address: {}'.format(user.email);
            if (utils.isCoordinator(user.role)) {
                if (user.schoolInCharge !== 'N/A') {
                    content += '<li>School in Charge: {}</li>'.format(user.schoolInCharge);
                } else if (user.regionInCharge !== 'N/A') {
                    content += '<li>Region in Charge: {}</li>'.format(user.regionInCharge);
                }
                if (user.countryInCharge !== 'N/A') {
                    content += '<li>Country in Charge: {}</li>'.format(user.countryInCharge);
                }  
            }
            if (utils.isRegularUser(user.role)) {
                content += '<li>Gender: {}</li>'.format(user.gender)
                            + '<li>Date of Birth: {}</li>'.format(utils.formatDate(user.dateOfBirth))
                            + '<li>School/Institution: {}</li>'.format(user.school)
                            + '<li>Nationality: {}</li>'.format(user.nationality)
                            + '<li>Country: {}</li>'.format(user.country)
                            + '<li>Region: {}</li>'.format(user.region)
                            + '<li>Major: {}</li>'.format(user.major)
                            + '<li>Education Level: {}</li>'.format(user.educationLevel)
                            + '<li>Currently Enrolled: {}</li>'.format(user.enrolled ? 'Yes': 'No')
                            + '<li>Interests: {}</li>'.format(user.interests);
            }                            
            content += '</ul><br><form action="{}"><input type="hidden" name="ref_path" value="{}"><input type="submit" value="Respond to Request"/></form>'.format(link, link)
                            + '{}</p>'.format(that.signature);
        return content;
    }

    Object.freeze(that);
    return that;
};

module.exports = Email();
