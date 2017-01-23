var HbsHelpers = function() {
    var that = Object.create(HbsHelpers.prototype);

    that.lowerCase = function (string) {
    	return string.toLowerCase();
    }

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

    Object.freeze(that);
    return that;
};

module.exports = HbsHelpers();