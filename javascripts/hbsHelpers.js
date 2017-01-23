var HbsHelpers = function() {
    var that = Object.create(HbsHelpers.prototype);

    that.lowerCase = function (string) {
    	return string.toLowerCase();
    }

    Object.freeze(that);
    return that;
};

module.exports = HbsHelpers();