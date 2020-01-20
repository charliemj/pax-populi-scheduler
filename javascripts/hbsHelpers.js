const dateFormat = require('dateformat');

const HbsHelpers = function() {
    const hbsHelper = Object.create(HbsHelpers.prototype);

    /**
    * @param {String} string - string to convert to lowercase
    * @return {String} the lowercased string
    */
    hbsHelper.lowerCase = function (string) {
    	return string.toLowerCase();
    };

    /**
    * @param {String} stringA, stringB - strings to compare
    * @return {Boolean} true if the strings are equal (case-insensitive), otherwise false
    */
    hbsHelper.equalStrings = function (stringA, stringB, options) {
        if (stringA.toLowerCase() === stringB.toLowerCase()) {
            return options.fn(this);
        }
        return options.inverse(this);
    };

    /**
    * @param {Boolean} bool - the boolean to flip
    * @return {Boolean} the opposite of bool
    */
    hbsHelper.ifNot = function (bool, options) {
        if (!bool) {
            return options.fn(this);
        }
        return options.inverse(this);
    };

    /**
    * @param {String} string - string to check
    * @return {Boolean} true if the string is not 'N/A' (case-insensitive)
    */
    hbsHelper.notNotApplicable = function (string, options) {
        if (string.toLowerCase() !== 'n/a') {
            return options.fn(this);
        }
        return options.inverse(this);
    };

    /**
    * @param {Object} date - the date object to format
    * @return {String} formatted date string mmm d, yyyy
    */
    hbsHelper.formatDate = function (date) {
        return dateFormat(date, "mmm d, yyyy");
    };

    /**
    * @param {String} role - string specifying the role of the user, must be one
    *                       of ["Coordinator", "Administrator", "Student", "Tutor"]
    * @return {Boolean} true if the role is "Student" or "Tutor" (case-insensitive)
    */
    hbsHelper.isRegularUser = function (role, options) {
    	if (role.toLowerCase() !== 'administrator' && role.toLowerCase() !== 'coordinator') {
    		return options.fn(this);
    	}
    	return options.inverse(this);
    };

    /**
    * @param {String} role - string specifying the role of the user, must be one
    *                       of ["Coordinator", "Administrator", "Student", "Tutor"]
    * @return {Boolean} true if the role is "Administrator" (case-insensitive)
    */
    hbsHelper.isAdministrator = function (role, options) {
        if (role.toLowerCase() === 'administrator') {
            return options.fn(this);
        }
        return options.inverse(this);
    };

    /**
    * @param {String} role - string specifying the role of the user, must be one
    *                       of ["Coordinator", "Administrator", "Student", "Tutor"]
    * @return {Boolean} true if the role is "Coordinator" (case-insensitive)
    */
    hbsHelper.isCoordinator = function (role, options) {
        if (role.toLowerCase() === 'coordinator') {
            return options.fn(this);
        }
        return options.inverse(this);
    };

    /**
    * @param {String} role - string specifying the role of the user, must be one
    *                       of ["Coordinator", "Administrator", "Student", "Tutor"]
    * @return {Boolean} true if the role is "Student" (case-insensitive)
    */
    hbsHelper.isStudent = function (role, options) {
        if (role.toLowerCase() === 'student') {
            return options.fn(this);
        }
        return options.inverse(this);
    };

    /**
    * @param {String} role - string specifying the role of the user, must be one
    *                       of ["Coordinator", "Administrator", "Student", "Tutor"]
    * @return {Boolean} true if the role is "Tutor" (case-insensitive)
    */
    hbsHelper.isTutor = function (role, options) {
        if (role.toLowerCase() === 'tutor') {
            return options.fn(this);
        }
        return options.inverse(this);
    };

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

    hbsHelper.weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    /**
    * @param {Array} schedule - an array of date, time arrays of the form [yyyy-mm-dd, hh:mm]
    * @return {Array} array of strings that summarize the schedules, each of the form
    *                 ddd hh:mm (yyyy-mm-dd - yyyy-mm-dd) [day meetingTime (startDate - endDate)]
    */
    hbsHelper.summarizeSchedule = function (schedule) {

        var startDate, endDate, meetingTime;
        var formatedSchedule = [];

        schedule.forEach(function (timeBlock) {
            var date = timeBlock[0];
            var time = timeBlock[1];
            if (!startDate) {
                startDate = date;
                meetingTime = time;
                endDate = date;
            } else if (meetingTime == time) {
                endDate = date;
            } else {
                var day = hbsHelper.weekday[new Date(startDate).getDay()];
                formatedSchedule.push('{} {} ({} - {})'.format(day, meetingTime, startDate, endDate));
                startDate = date;
                meetingTime = time;
                endDate = date;
                
            }
        });
        var day = hbsHelper.weekday[new Date(startDate).getDay()];
        formatedSchedule.push('{} {} ({} - {})'.format(day, meetingTime, startDate, endDate));
        return formatedSchedule;
    };

    /**
    * Pairs up the tutor's and student's schedules and return an array of summarized schedules arrays
    * @param {{Array}} studentSchedules, tutorSchedules - an array of different set of schedules,
    *                  each is an array of date, time arrays of the form [yyyy-mm-dd, hh:mm]
    */
    hbsHelper.formatSchedules = function (studentSchedules, tutorSchedules) {
        var formatedStudentSchedules = studentSchedules.map(function (schedule) {
            return hbsHelper.summarizeSchedule(schedule);
        });
        var formatedTutorSchedules = tutorSchedules.map(function (schedule) {
            return hbsHelper.summarizeSchedule(schedule);
        });

        var formatedSchedules = [];
        for (var i=0; i < formatedStudentSchedules.length; i++) {
            formatedSchedules.push({studentSchedule: formatedStudentSchedules[i],
                                    tutorSchedule: formatedTutorSchedules[i]});
        }
        return formatedSchedules;
    };

    /**
    * Handlebars each loop for the student's and tutor's schedule pairs
    * @param {{Array}} studentSchedules, tutorSchedules - an array of different set of schedules,
    *                  each is an array of date, time arrays of the form [yyyy-mm-dd, hh:mm]
    */
    hbsHelper.eachFormatedSchedule = function (studentSchedules, tutorSchedules, options) {
        var ret = "";
        context = hbsHelper.formatSchedules(studentSchedules, tutorSchedules);
        for(var i=0, j=context.length; i<j; i++) {
            ret = ret + options.fn(context[i]);
        }
        return ret;
    };

    /**
    * Handlebars each loop for the tutor's schedule
    * @param {{Array}} tutorSchedules - an array of different set of schedules,
    *                  each is an array of date, time arrays of the form [yyyy-mm-dd, hh:mm]
    */
    hbsHelper.eachFormatedTutorSchedule = function (tutorSchedules, options) {
        var ret = "";
        context = hbsHelper.summarizeSchedule(tutorSchedules);
        for(var i=0, j=context.length; i<j; i++) {
            ret = ret + options.fn(context[i]);
        }
        return ret;
    };

    Object.freeze(hbsHelper);
    return hbsHelper;
};

module.exports = HbsHelpers();