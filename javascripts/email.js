const nodemailer = require('nodemailer');
const config = require('./config.js');
const utils = require('./utils.js');
const enums = require('./enums.js');
const User = require('../models/user.js');


const Email = function() {

    const newEmail = Object.create(Email.prototype);
    //newEmail is the object created each time an email has to be sent

    newEmail.welcomeMessage = '<div style="text-align: center;"><h2>Hello from Pax Populi Scheduler!</h2></div>';
    newEmail.signature = '<br> Cheers, <br> Pax Populi Scheduler Team';

    // create reusable transporter object using the default SMTP transport
    const smtpConfig = {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: process.env.GMAIL_ADDRESS || config.emailAddress(), //sets  object value to either the  gmail address of the user as seen in the user's environment, or the emailAddress as found in config.js
            pass: process.env.GMAIL_PASSWORD || config.emailPassword() //sets object value to either the gmail password of the user as seen in the user's environment, or the emailPassword as found in config.js
        }
    };
    newEmail.transporter = nodemailer.createTransport(smtpConfig); //makes a transporter to send mail based off the configuration specified above


    /**
    * Source: http://stackoverflow.com/a/4974690
    * Replaces the '{}' in the string by the arguments in order
    */
    String.prototype.format = function () {
        let i = 0, args = arguments;
        return this.replace(/{}/g, function () {
            return typeof args[i] != 'undefined' ? args[i++] : '';
        });
    };

    /**
     * Send an email from Pax Populi Scheduler email to the given email address
     * @param {String} emailAddress - the email address of the receiver of the email
     * @param {String} subject - the subject of the email
     * @param {String} htmlContent - the html string for the email body
     * @param {Function} callback - the function called after sending the email is attempted
     * @return {Object} object - object.success is true if the email was sent
     successfully, false otherwise
     */
    const sendEmail = function (emailAddress, subject, htmlContent, callback) {
        const sendFrom = process.env.GMAIL_ADDRESS || config.emailAddress();
        const mailOptions = {
            from: 'Pax Populi Scheduler 6.S187 <' + sendFrom + '>', // sender address
            to: emailAddress,
            subject: subject, // subject line
            text: '', // plaintext body
            html: htmlContent // html body
        };
        // send mail with defined transport object
        newEmail.transporter.sendMail(mailOptions, function(err, info){ //uses transporter created to send email to recipient
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
    * Creates a random enums.numTokenDigits-long token for the specified user
    * @param {Object} user - the user object for while the verification token is for
    * @param {Function} callback - the function to call after the token has been created
    */
    newEmail.createToken = function (user, isVerifyToken, callback) {
        // create random 32 character token
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let token = '';
        for (let i = enums.numTokenDigits(); i > 0; --i) {
            token += chars[Math.round(Math.random() * (chars.length - 1))];
        }
        isVerifyToken ? user.setVerificationToken(token, callback) : user.setRequestToken(token, callback);
    };

    /**
    * Sends verification email to user with the confirm button that links to verify request
    * @param {Object} user - the user object for while the verification token is for
    * @param {Boolean} developmentMode - true if the app is in development mode, false otherwise
    * @param {Function} callback - the function to call after the email has been sent
    */
    newEmail.sendVerificationEmail = function (user, developmentMode, callback) {
        newEmail.createToken(user, true, function (err, user) {
            const subject = 'Confirm your Pax Populi Scheduler Account, {}!'.format(user.username);
            let link;
            if (developmentMode) {
                link = 'http://localhost:3000/verify/{}/{}'.format(user.username, user.verificationToken);
            } else {
                link = '{}/verify/{}/{}'.format((process.env.PRODUCTION_URL || config.productionUrl()), user.username, user.verificationToken); //provide productionUrl in config.js needing to test
            }
            const content = '{}<p>Hi {}!<br><br>Confirm your Pax Populi Scheduler account by clicking on the confirm button below.<form action="{}"><input type="submit" value="Confirm" /></form>{}</p>'.format(newEmail.welcomeMessage, user.firstName, link, newEmail.signature);
            console.log('about to send a verification email to', user.email);
            sendEmail(user.email, subject, content, callback);

        });
    };

    /**
     * Sends an email to inform the user that his/her account has been approved
     * @param {Object} user - the user object whose account just got approved
     * @param {Object} developmentMode - true if the app is in development mode, false otherwise
     * @param {Function} callback - the function to call after the email has been sent
     * @return {Object} object - object.success is true if the email was sent
     successfully, false otherwise
     */
    newEmail.sendApprovalEmail = function (user, developmentMode, callback) {
        const subject = 'Updates on the status of your Pax Populi account';
        const action = utils.isRegularUser(user.role) ? 'register for classes' : 'view the schedules';
        const emailContent = '{}<p> Hi {}!<br><br>Your Pax Populi account has been approved! You can now log in and {}.<br>{}</p>'.format(newEmail.welcomeMessage, user.firstName, action, newEmail.signature);
        return sendEmail(user.email, subject, emailContent, callback);
    };

    /**
     * Sends an email to inform the user that his/her account has been rejection
     * @param {Object} user - the user object whose account just got rejection
     * @param {Object} developmentMode - true if the app is in development mode, false otherwise
     * @param {Function} callback - the function to call after the email has been sent
     * @return {Object} object - object.success is true if the email was sent
     successfully, false otherwise
     */
    newEmail.sendRejectionEmail = function (user, developmentMode, callback) {
        const subject = 'Updates on the status of your Pax Populi account';
        const action = utils.isRegularUser(user.role) ? 'register for classes' : 'view the schedules';
        const emailContent = '{}<p> Hi {}!<br><br>Sorry, you have not been approved by an administrator and will not be able to login or {}. If you have any concerns or would like us to re-evaluate your account, please email Bob McNulty at robert@appliedethics.org.<br>{}</p>'.format(newEmail.welcomeMessage, user.firstName, action, newEmail.signature);
        return sendEmail(user.email, subject, emailContent, callback);
    };

    /**
     * Sends an email to inform the user that his/her account has been waitlisted
     * @param {Object} user - the user object whose account just got rejection
     * @param {Object} developmentMode - true if the app is in development mode, false otherwise
     * @param {Function} callback - the function to call after the email has been sent
     * @return {Object} object - object.success is true if the email was sent
     successfully, false otherwise
     */
    newEmail.sendWaitlistEmail = function (user, developmentMode, callback) {
        const subject = 'Updates on the status of your Pax Populi account';
        const action = utils.isRegularUser(user.role) ? 'register for classes' : 'view the schedules';
        const emailContent = '{}<p> Hi {}!<br><br>Your Pax Populi account has been approved. However, due to limited capacity, you are currenly waitlisted. This means that while you can now sign in to your account, you cannot {} just yet. We will notify you when you can {}. Sorry for the inconvenience!<br>{}</p>'.format(newEmail.welcomeMessage, user.firstName, action, action, newEmail.signature);
        return sendEmail(user.email, subject, emailContent, callback);
    };

    /**
     * Sends an email to inform the user that his/her account has been archived
     * @param {Object} user - the user object whose account just got archived
     * @param {Object} developmentMode - true if the app is in development mode, false otherwise
     * @param {Function} callback - the function to call after the email has been sent
     * @return {Object} object - object.success is true if the email was sent
     successfully, false otherwise
     */
    newEmail.sendArchiveEmail = function (user, developmentMode, callback) {
        const subject = 'Updates on the status of your Pax Populi account';
        const emailContent = '{}<p> Hi {}!<br><br>Your Pax Populi account has been deactivated by the administrators. You no longer have access to this account and will not receive any emails from us in the future. If you think there was a mistake, please contact Bob McNulty at robert@appliedethics.org.<br>{}</p>'.format(newEmail.welcomeMessage, user.firstName, newEmail.signature);
        console.log('user', user);
        return sendEmail(user.email, subject, emailContent, callback);
    };

    /**
     * Sends an email to inform the user that they have been matched to someone
     * @param {Object} user - the user object of the user
     * @param {Function} callback - the function to call after the email has been sent
     * @return {Object} object - object.success is true if the email was sent
     successfully, false otherwise
     */
    newEmail.sendScheduleEmails = function (user, callback) {
        const subject = 'Updates on the status of your Pax Populi class registration';
        const emailContent = '{}<p> Hi {}!<br><br>You have been matched to a {} for the class you last registered for. You can now see your schedule on your dashboard.<br>{}</p>'.format(newEmail.welcomeMessage, user.firstName, user.role.toLowerCase() === 'student'? 'tutor': 'student', newEmail.signature);
        sendEmail(user.email, subject, emailContent, callback);
    };

    /**
     * Sends an email to remind student/tutor to confirm that they could meet
     * @param {Object} user - the user object of the user
     * @param {Array.Array} userSchedule - the individual schedule of a given student/tutor, given as an array of date, time arrays
     * @param {Function} callback - the function to call after the email was sent
     * @return {Object} object - object.success is true if the email was sent
     successfully, false otherwise
     */
    newEmail.sendReminderEmail = function (user, userSchedule, callback) {
        const subject = 'Pax Populi Class Reminder';
        const partner = user.role.toLowerCase() === 'student'? 'tutor': 'student';
        const emailContent = '{}<p> Hi {}!<br><br>You have an appointment scheduled with your {} in three days on {}. If you cannot make this appointment, please contact your {} as well as your coordinator.<br>{}</p>'.format(newEmail.welcomeMessage, user.firstName, partner, utils.getFormattedNearestMeetingTime(userSchedule), partner, newEmail.signature);
        sendEmail(user.email, subject, emailContent, callback);
    };

    /**
     * Sends an email to the admins to ask for the approval of a new account registration
     * @param {Object} user - the user object for while the verification token is for
     * @param {Boolean} developmentMode - true if the app is in development mode, false otherwise
     * @param {Array.Object} admins - an array of admin objects to send emails to
     * @param {Function} callback - the function to call after the email has been sent
     */
    newEmail.sendApprovalRequestEmail = function (user, developmentMode, admins, callback) {
        newEmail.createToken(user, false, function (err, user) {
            if (err) {
                return callback({success: false, message: err.message});
            }
            let count = 0;
            admins.forEach(function (admin) {
                const subject = 'Pax Populi Scheduler Account Request from {} {}!'.format(user.firstName, user.lastName);
                const content = newEmail.makeApprovalRequestEmailContent(user, developmentMode, admin);
                sendEmail(admin.email, subject, content, function (err) {
                    if (err) {
                        callback(err);
                    }
                });
                count++;
                // only fires successful callback after all emails have been sent
                if (count === admins.length) {
                    callback(null);
                }
            });
        });
    };

    /**
    * Sends an email to inform admins that there are new matches
    * @param {Number} numMatches - the number of newly generated matches
    * @param Array {Object} admins - an array of admin objects to send emails to
    * @return {Object} object - object.success is true if the email was sent
                                successfully, false otherwise
    */
    newEmail.notifyAdmins = function (numMatches, admins, callback) {
        let count = 0;
        console.log('notifying admins');
        admins.forEach(function (admin) {
            const subject = 'New matches generated in Pax Populi Scheduler';
            const word = numMatches > 1 ? 'matches' : 'match';
            const emailContent = '{}<p> Hi {}!<br><br>We have just generated {} new {}. You can view them under \"Pending Schedules\" on your dashboard. Please log in to approve/reject the matches before the start date of each class. If you fail to do so, the newly matched registrations will be moved back to the matching pool.<br>{}</p>'.format(newEmail.welcomeMessage, admin.firstName, numMatches, word, newEmail.signature);
            console.log('sending email...');
            sendEmail(admin.email, subject, emailContent, function (err) {
                if (err) {
                    callback(err);
                }
            });
            count++;
            // only fires successful callback after all emails have been sent
            if (count === admins.length) {
                callback(null);
            } 
        });  
    };

    /**
    * Make the content of the approval requset email for the given admin and user
    * @param {Object} user - the user object of the account
    * @param {Boolean} developmentMode - true if the app is in developmentMode
    * @param {Object} admin - the admin object to send an email to
    * @return {Object} object - object.success is true if the email was sent
                                successfully, false otherwise
    */
    newEmail.makeApprovalRequestEmailContent = function (user, developmentMode, admin) {
        let link;
            if (developmentMode) {
                link = 'http://localhost:3000/respond/{}/{}'.format(user.username, user.requestToken);
            } else {
                link = '{}/respond/{}/{}'.format((process.env.PRODUCTION_URL || config.productionUrl()), user.username, user.requestToken);
            }
        const role = user.role.toLowerCase() === 'administrator' ? 'an administrator': 'a {}'.format(user.role.toLowerCase());
        let content = '{}<p>Hi {} {}!<br><br>'.format(newEmail.welcomeMessage, admin.firstName, admin.lastName)
                            + '{} {} has just requested to join Pax Populi as {}. '.format(user.firstName, user.lastName, role)
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
                            + '{}</p>'.format(newEmail.signature);
        return content;
    }

    Object.freeze(newEmail);
    return newEmail;
};

module.exports = Email();
