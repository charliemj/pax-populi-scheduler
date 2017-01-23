var HbsHelpers = function() {
    var that = Object.create(HbsHelpers.prototype);

    that.lowerCase = function (string) {
    	return string.toLowerCase();
    }

    that.notAdmin = function (role, options) {
    	if (role.toLowerCase() !== 'administrator') {
            console.log('not administrator', role);
    		return options.fn(this);
    	}
        console.log('is administrator', role)
    	return options.inverse(this);
    }

    Object.freeze(that);
    return that;
};

module.exports = HbsHelpers();