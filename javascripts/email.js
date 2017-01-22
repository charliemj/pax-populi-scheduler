var nodemailer = require('nodemailer');
var config = require('./config.js');
var utils = require('./utils.js');
var enums = require('./enums.js');

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
    var sendEmail = function (emailAddress, subject, htmlContent) {
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
                return {success: false};
            }
            console.log('sending succeeded');
            return {success: true};
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
            sendEmail(user.email, subject, content);
            callback(null, user);
        });
    };

    /**
    * Sends an email to the admin to ask for the approval for a new 
    * @param {Object} user - the user object for while the verification token is for
    * @param {Boolean} developmentMode - true if the app is in development mode, false otherwise
    * @param {Function} callback - the function to call after the email has been sent
    */
    that.sendApprovalRequestEmail = function (user, developmentMode, callback) {
        that.createToken(user, false, function (err, user) {
            if (err) {
                return callback({success: false, message: err.message});
            }
            var subject = 'Pax Populi Scheduler Account Request from {} {}!'.format(user.firstname, user.lastName);
            var link;
            if (developmentMode) {
                link = 'http://localhost:3000/respond/{}/{}'.format(user.username, user.requestToken);
            } else {
                link = '{}/respond/{}/{}'.format((process.env.PRODUCTION_URL || config.productionUrl()), user.username, user.requestToken);
            }
            var content = '{}<p>Hi {} {}!<br><br>'.format(that.welcomeMessage, config.adminFirstName(), config.adminLastName())
                            + '{} {} has just requested to join Pax Populi as a {}. '.format(user.firstName, user.lastName, user.isTutor ? 'tutor': 'student')
                            + 'Below is {}\'s profile. To respond to this application, click on the "Respond to Request" button below.<br><ul>'.format(user.firstName)
                            + '<li>Full Name: {} {}</li>'.format(user.firstName, user.lastName)
                            + '<li>Gender: {}</li>'.format(user.gender)
                            + '<li>Date of Birth: {}</li>'.format(utils.formatDate(user.dateOfBirth))
                            + '<li>School: {}</li>'.format(user.school)
                            + '<li>Education Level: {}</li>'.format(user.educationLevel)
                            + '<li>Major: {}</li>'.format(user.major)
                            + '<li>Currently Enrolled: {}</li>'.format(user.enrolled ? 'Yes': 'No')
                            + '<li>Country: {}</li>'.format(user.country)
                            + '<li>Region: {}</li>'.format(user.region)
                            + '<li>Nationality: {}</li>'.format(user.nationality)
                            + '<li>Interests: {}</li></ul><br>'.format(user.interests)
            content += '<form action="{}"><input type="hidden" name="ref_path" value="{}"><input type="submit" value="Respond to Request"/></form>'.format(link, link)
                            + '{}</p>'.format(that.signature);
            console.log(content);
            console.log('about to send an approval request email to', user.email);
            sendEmail(config.adminEmailAddress(), subject, content); // for now send it back to the user
            callback(null, user);
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
        var emailContent = '{}<p> Hi {}!<br><br>This is to confirm that your Pax Populi account has been approved. You can now log in and register for a class.<br>{}</p>'.format(that.welcomeMessage, user.firstName, that.signature);
        console.log('user', user);
        return sendEmail(user.email, subject, emailContent);
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
        var emailContent = '{}<p> Hi {}!<br><br>This is to confirm that your Pax Populi account has been rejected.<br>{}</p>'.format(that.welcomeMessage, user.firstName, that.signature);
        console.log('user', user);
        return sendEmail(user.email, subject, emailContent);
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
        var emailContent = '{}<p> Hi {}!<br><br>This is to confirm that your Pax Populi account has been approved. However, you are currenly on the waitlist. So although you can log in to the website, you cannot register for any class until further notice from us.<br>{}</p>'.format(that.welcomeMessage, user.firstName, that.signature);
        console.log('user', user);
        return sendEmail(user.email, subject, emailContent);
    };

    Object.freeze(that);
    return that;
};

module.exports = Email();
