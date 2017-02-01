var dateFormat = require('dateformat');

var HbsHelpers = function() {
    var that = Object.create(HbsHelpers.prototype);

    that.lowerCase = function (string) {
    	return string.toLowerCase();
    }

    that.equalStrings = function (stringA, stringB, options) {
        if (stringA.toLowerCase() === stringB.toLowerCase()) {
            return options.fn(this);
        }
        return options.inverse(this);
    }

    that.ifNot = function (bool, options) {
        if (!bool) {
            return options.fn(this);
        }
        return options.inverse(this);
    }

    that.notNotApplicable = function (string, options) {
        if (string.toLowerCase() !== 'n/a') {
            return options.fn(this);
        }
        return options.inverse(this);
    }

    that.formatDate = function (date) {
        return dateFormat(date, "mmm d, yyyy");
    };

    that.isRegularUser = function (role, options) {
    	if (role.toLowerCase() !== 'administrator' && role.toLowerCase() !== 'coordinator') {
    		return options.fn(this);
    	}
    	return options.inverse(this);
    }

    that.isAdministrator = function (role, options) {
        if (role.toLowerCase() === 'administrator') {
            return options.fn(this);
        }
        return options.inverse(this);
    }

    that.isCoordinator = function (role, options) {
        if (role.toLowerCase() === 'coordinator') {
            return options.fn(this);
        }
        return options.inverse(this);
    }

    that.isStudent = function (role, options) {
        if (role.toLowerCase() === 'student') {
            return options.fn(this);
        }
        return options.inverse(this);
    }

    that.isTutor = function (role, options) {
        if (role.toLowerCase() === 'tutor') {
            return options.fn(this);
        }
        return options.inverse(this);
    }

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

    that.weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    that.summarizeSchedule = function (schedule) {

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
                var day = that.weekday[new Date(startDate).getDay()];
                formatedSchedule.push('{} {} ({} - {})'.format(day, meetingTime, startDate, endDate));
                startDate = date;
                meetingTime = time;
                endDate = date;
                
            }
        });
        var day = that.weekday[new Date(startDate).getDay()];
        formatedSchedule.push('{} {} ({} - {})'.format(day, meetingTime, startDate, endDate));
        return formatedSchedule;
    }

    that.formatSchedules = function (studentSchedules, tutorSchedules) {
        var formatedStudentSchedules = studentSchedules.map(function (schedule) {
            return that.summarizeSchedule(schedule);
        });
        var formatedTutorSchedules = tutorSchedules.map(function (schedule) {
            return that.summarizeSchedule(schedule);
        });

        var formatedSchedules = [];
        for (var i=0; i < formatedStudentSchedules.length; i++) {
            formatedSchedules.push({studentSchedule: formatedStudentSchedules[i],
                                    tutorSchedule: formatedTutorSchedules[i]});
        }
        return formatedSchedules;
    }

    that.eachFormatedSchedule = function (studentSchedules, tutorSchedules, options) {
        var ret = "";
        context = that.formatSchedules(studentSchedules, tutorSchedules);
        for(var i=0, j=context.length; i<j; i++) {
            ret = ret + options.fn(context[i]);
        }
        return ret;
    };

    that.eachFormatedTutorSchedule = function (tutorSchedules, options) {
        var ret = "";
        context = that.summarizeSchedule(tutorSchedules);
        for(var i=0, j=context.length; i<j; i++) {
            ret = ret + options.fn(context[i]);
        }
        return ret;
    };

    Object.freeze(that);
    return that;
};

module.exports = HbsHelpers();