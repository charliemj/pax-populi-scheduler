const Config = function() {

 	const configuration = Object.create(Config.prototype);
 	//Creates a new instance of the object Config called configuration

 	configuration.emailAddress = function () {
 		return 'gmailAddressOfTheApp';
 	}

 	configuration.emailPassword = function () {
 		return 'gmailPasswordOfTheApp';
 	}

 	configuration.productionUrl = function () {
 		return 'http://productionURLOfTheApp'
 	}

 	configuration.adminUsername = function () {
 		return 'superAdminUsername';
 	}

 	configuration.adminFirstName = function () {
 		return 'superAdminFirstName';
 	}

 	configuration.adminLastName = function () {
 		return 'superAdminLastName';
 	}

 	configuration.adminPhoneNumber = function () {
 		return 5550000000;
 	}

 	configuration.adminPassword = function () {
 		return 'superAdminPasswordForThisApp';
 	}

 	configuration.adminEmailAddress = function () {
 		return 'superAdminEmailAddress';
 	}

 	Object.freeze(configuration);
 	return configuration;
 };



 module.exports = Config();
