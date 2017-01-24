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

    that.makeProfileTable = function (user) {
        var table = '<table class="table table-hover"><tbody>'
                        + '<tr><th>Full Name</th><td>{} {}</td>'.format(user.firstName, user.lastName)
                        + '<tr><th>Email Address</th><td>{}</td>'.format(user.email);
        if (that.isCoordinator(user.role)) {
                if (user.schoolInCharge) {
                    table += '<tr><th>School in Charge</th><td>{}</td>'.format(user.schoolInCharge);
                } else if (user.regionInCharge) {
                    table += '<tr><th>Region in Charge</th><td>{}</td>'.format(user.regionInCharge);
                }
                if (user.countryInCharge) {
                    table += '<tr><th>Country in Charge</th><td>{}</td>'.format(user.countryInCharge);
                }  
            }
        if (that.isRegularUser(user.role)) {
            table += '<tr><th>Gender</th><td>{}</td>'.format(user.gender)
                        + '<tr><th>Date of Birth</th><td>{}</td>'.format(that.formatDate(user.dateOfBirth))
                        + '<tr><th>School/Institution</th><td>{}</td>'.format(user.school)
                        + '<tr><th>Education Level</th><td>{}</td>'.format(user.educationLevel)
                        + '<tr><th>Major</th><td>{}</td>'.format(user.major)
                        + '<tr><th>Currently Enrolled</th><td>{}</td>'.format(user.enrolled ? 'Yes': 'No')
                        + '<tr><th>Interests</th><td>{}</td>'.format(user.interests);
                        + '<tr><th>Nationality</th><td>{}</td>'.format(user.nationality)
                        + '<tr><th>Country</th><td>{}</td>'.format(user.country)
                        + '<tr><th>Region</th><td>{}</td>'.format(user.region)
        }                
        table += '</tbody></table>';
        return table;
    }

    Object.freeze(that);
    return that;
};

module.exports = Utils();
