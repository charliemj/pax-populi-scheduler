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
        return dateFormat(date, "mmm d, h:MM TT");
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

    Object.freeze(that);
    return that;
};

module.exports = Utils();
