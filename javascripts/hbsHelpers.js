var HbsHelpers = function() {
    var that = Object.create(HbsHelpers.prototype);

    that.lowerCase = function (string) {
    	return string.toLowerCase();
    }

    that.notAdmin = function (role, options) {
    	console.log(role);
    	console.log(options);
    	if (!role.toLowerCase() === 'administrator') {
    		return options.fn(this);
    	}
    	return options.inverse(this);
    }

    Object.freeze(that);
    return that;
};

module.exports = HbsHelpers();