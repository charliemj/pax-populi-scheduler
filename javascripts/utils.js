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
    * Returns True if the user is a student or tutor
    */
    that.isRegularUser = function (role) {
        return role.toLowerCase() !== 'administrator' && role.toLowerCase() !== 'coordinator';
    }

    that.isStudent = function (role) {
        return role.toLowerCase() === 'student';
    }

    that.isTutor = function (role) {
        return role.toLowerCase() === 'tutor';
    }

    that.isAdministrator = function (role) {
        return role.toLowerCase() === 'administrator';
    }

    that.isCoordinator = function (role) {
        return role.toLowerCase() === 'coordinator';
    }

    that.containsOther = function (array) {
        return array[0].toLowerCase().trim() === 'other';
    }

    that.extractChosen = function (array) {
        console.log('array', array);
        if (that.containsOther(array)) {
            return array[1].trim();
        }
        return array[0].trim();
    }

    that.formatDates = function (schedules) {
        return schedules.map(function (schedule) {
            return schedule.map(function (dateString) {
                        return dateString.split(' ');
            });
        });
    }

    Object.freeze(that);
    return that;
};

module.exports = Utils();
