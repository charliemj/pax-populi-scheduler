var dateFormat = require('dateformat');

var Utils = function() {

    var that = Object.create(Utils.prototype);

    var from_to = function (from, to, f) {
        if (from > to) return;
        f(from); from_to(from+1, to, f);
    };

    that.each = function (a, f) {
        from_to(0, a.length-1, function (i) {f(a[i]);});
    };

    /**
    * Reformat the deadline of each delivery
    * @param {Date} date - date object to format
    * @return {String} a formatted date string mmm d, h:MM TT
    */
    that.formatDate = function (date) {
        return dateFormat(date, "mmm d, yyyy");
    };

    /**
     * Checks if number is an integer from from to to.
     * @param  {Integer}  number the number to check
     * @param  {Integer}  from   the minimum integer value for number
     * @param  {Integer}  to     the maximum integer value for number
     * @return {Boolean}         true if number is an integer from from to to; false otherwise
     */
    var isFromToInt = function(number, from, to) {
        return Number.isInteger(number) && number >= from && number <= to;
    };

    /**
    * @param {String} role - string specifying the role of the user, must be one
    *                       of ["Coordinator", "Administrator", "Student", "Tutor"]
    * @return {Boolean} true if the role is "Student" or "Tutor" (case-insensitive)
    */
    that.isRegularUser = function (role) {
        return role.toLowerCase() !== 'administrator' && role.toLowerCase() !== 'coordinator';
    }

    /**
    * @param {String} role - string specifying the role of the user, must be one
    *                       of ["Coordinator", "Administrator", "Student", "Tutor"]
    * @return {Boolean} true if the role is "Student" (case-insensitive)
    */
    that.isStudent = function (role) {
        return role.toLowerCase() === 'student';
    }

    /**
    * @param {String} role - string specifying the role of the user, must be one
    *                       of ["Coordinator", "Administrator", "Student", "Tutor"]
    * @return {Boolean} true if the role is "Tutor" (case-insensitive)
    */
    that.isTutor = function (role) {
        return role.toLowerCase() === 'tutor';
    }

    /**
    * @param {String} role - string specifying the role of the user, must be one
    *                       of ["Coordinator", "Administrator", "Student", "Tutor"]
    * @return {Boolean} true if the role is "Administrator" (case-insensitive)
    */
    that.isAdministrator = function (role) {
        return role.toLowerCase() === 'administrator';
    }

    /**
    * @param {String} role - string specifying the role of the user, must be one
    *                       of ["Coordinator", "Administrator", "Student", "Tutor"]
    * @return {Boolean} true if the role is "Coordinator" (case-insensitive)
    */
    that.isCoordinator = function (role) {
        return role.toLowerCase() === 'coordinator';
    }

    /**
    * @param {Array} array - array of strings to check
    * @return {Boolean} true if the array's first element is "Other" (case-insensitive)
    */
    that.containsOther = function (array) {
        return array[0].toLowerCase().trim() === 'other';
    }

    /**
    * @param {Array} array - array of strings
    * @return {String} the second element of the array if the first element is "Other" 
    *                  (case-insensitive), otherwise returns the first element
    */
    that.extractChosen = function (array) {
        if (that.containsOther(array)) {
            return array[1].trim();
        }
        return array[0].trim();
    }

    /**
    * @param {{Array}} schedules - an array of different set of schedules,
    *                  each is an array of datestring
    * @return {{Array}} an array of different set of schedules, each is an array of date, time
    *                  arrays of the form [yyyy-mm-dd, hh:mm]
    */
    that.formatDates = function (schedules) {
        return schedules.map(function (schedule) {
            return schedule.map(function (dateString) {
                        return dateString.split(' ');
            });
        });
    }

    /*
    * Returns a date object with hours set to 00:00:00
    */
    Date.prototype.withoutTime = function () {
        var d = new Date(this);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    /*
    * Returns a date object with date set the first day of the year
    */
    Date.prototype.withoutDate = function () {
        var d = new Date(this);
        d.setDate(0);
        return d;
    }

    /**
    * @param {Array}} schedules - an array of different set of schedules,
    *                  each is an array of date, time arrays of the form [yyyy-mm-dd, hh:mm]
    * @return {String} datestring of the form ddd yyyy-mm-dd, hh:mm of the closest meeting time
    */
    that.getFormatedNearestMeetingTime = function (schedule) {
        var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var today = new Date();
        for (var i=0; i < schedule.length; i++) {
            var date = new Date(schedule[i][0]);
            if (today.withoutTime() <= date.withoutTime()) {
              var day = weekday[date.getDay()];
                return day + ' ' + schedule[i];
            }
        }
        throw new Error('Could not find nearest meeting time');
 
    }

    Object.freeze(that);
    return that;
};

module.exports = Utils();
