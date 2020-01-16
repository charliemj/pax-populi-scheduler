var Config = function() {

 	var that = Object.create(Config.prototype);

 	that.emailAddress = function () {
 		return 'gmailAddressOfTheApp';
 	}

 	that.emailPassword = function () {
 		return 'gmailPasswordOfTheApp';
 	}

 	that.productionUrl = function () {
 		return 'http://productionURLOfTheApp'
 	}

 	that.adminUsername = function () {
 		return 'superAdminUsername';
 	}

 	that.adminFirstName = function () {
 		return 'superAdminFirstName';
 	}

 	that.adminLastName = function () {
 		return 'superAdminLastName';
 	}

 	that.adminPhoneNumber = function () {
 		return 0000000000;
 	}

 	that.adminPassword = function () {
 		return 'superAdminPasswordForThisApp';
 	}

 	that.adminEmailAddress = function () {
 		return 'superAdminEmailAddress';
 	}

 	Object.freeze(that);
 	return that;
 };



 module.exports = Config();
