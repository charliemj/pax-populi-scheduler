var nodemailer = require('nodemailer');
var config = require('./config.js');
var utils = require('./utils.js');

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
    var sendEmail = function (email_address, subject, htmlContent) {
        var sendFrom = process.env.GMAIL_ADDRESS || config.emailAddress();
        var mailOptions = {
            from: 'Pax Populi Scheduler 6.S187 <' + sendFrom + '>', // sender address
            to: email_address,
            subject: subject, // subject line
            text: '', // plaintext body
            html: htmlContent // html body
        };
        // send mail with defined transport object
        that.transporter.sendMail(mailOptions, function(err, info){
            if(err){
                return {success: false};
            }
            return {success: true}
        });
    }

    // Adapted from https://www.quora.com/How-can-you-send-a-password-email-verification-link-using-NodeJS-1
    /**
    * Creates a random 16 character long token for the spepcified user
    * @param {Object} user - the user object for while the verification token is for
    * @param {Function} callback - the function to call after the token has been created
    */
    that.createVerificationToken = function (user, callback) {
        // create random 32 character token
        var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var token = '';
        for (var i = utils.numTokenDigits(); i > 0; --i) {
            token += chars[Math.round(Math.random() * (chars.length - 1))];
        }
        user.setVerificationToken(token, callback);
    }

    /**
    * Sends verfication email to user with the confirm button that links to verify request
    * @param {Object} user - the user object for while the verification token is for
    * @param {Boolean} developmentMode - true if the app is in development mode, false otherwise
    * @param {Function} callback - the function to call after the email has been sent
    */
    that.sendVerificationEmail = function (user, developmentMode, callback) {
        that.createVerificationToken(user, function (err, user) {
            var subject = 'Confirm your Pax Populi Scheduler Account, {}!'.format(user.username);
            var link;
            if (developmentMode) {
                link = 'http://localhost:3000/verify/{}/{}'.format(user.username, user.verificationToken);
            } else {
                link = '{}/verify/{}/{}'.format((process.env.PRODUCTION_URL || config.productionUrl()), user.username, user.verificationToken);
            }
            var content = '{}<p>Hi {}!<br><br>Confirm your Pax Populi Scheduler account by clicking on the confirm button below.<form action="{}"><input type="submit" value="Confirm" /></form>{}</p>'.format(that.welcomeMessage, user.firstName, link, that.signature);
            console.log('about to send an email to', user.email);
            sendEmail(user.email, subject, content);
            callback(null, user);
        });
    }

    /**
    * Makes the body of the email that a requester receives when a shopper claims his/her delivery
    * @param {Object} delivery - the delivery object of the delivery that just got claimed
    * @return {String} the body of the email to the requester
    */
    var claimEmailContent = function (delivery) {
        return  '{}<p> Hi {}!<br><br>{} {} has bought {} ({}) you recently requested and is ready to deliver it to you. Please contact him/her at {} to setup a pickup time.<br>{}</p>'.format(that.welcomeMessage, delivery.requester.firstName, delivery.shopper.firstName, delivery.shopper.lastName, delivery.itemName, delivery.itemQuantity, delivery.shopper.phoneNumber, that.signature);       
    }

    Object.freeze(that);
    return that;
};

module.exports = Email();
