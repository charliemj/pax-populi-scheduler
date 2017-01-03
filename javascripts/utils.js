var dateFormat = require('dateformat');

var Utils = function() {

    var that = Object.create(Utils.prototype);

    /**
    * @return {Integer} the number of digits in verification token
    */
    that.numTokenDigits = function () {
        return 32;
    };

    // taken from lectures
    var from_to = function (from, to, f) {
        if (from > to) return;
        f(from); from_to(from+1, to, f);
    };

    // taken from lecture
    that.each = function (a, f) {
        from_to(0, a.length-1, function (i) {f(a[i]);});
    };

    /**
    * Reformat the deadline of each delivery
    * @param {Array} deliveries - array of delivery objects
    * @return {Array} a new array of delivery objects with deadline formatted
    */
    that.formatDate = function (deliveries) {
        var deliveries = JSON.parse(JSON.stringify(deliveries)); // deep copy
        return deliveries.map(function (delivery) {
            delivery.rawDeadline = (new Date(delivery.deadline)).getTime();
            delivery.deadline = dateFormat(delivery.deadline, "mmm d, h:MM TT");
            if (delivery.pickupTime) {
                delivery.rawPickupTime = (new Date(delivery.pickupTime)).getTime();
                delivery.pickupTime = dateFormat(delivery.pickupTime, "mmm d, h:MM TT");
            }
            return delivery;
        });
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
