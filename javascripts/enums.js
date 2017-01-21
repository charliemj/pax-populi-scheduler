var Enums = function() {

    var that = Object.create(Enums.prototype);

    that.numTokenDigits = function () {
        return 32;
    };

    that.minUsernameLength = function () {
        return 5;
    }

    that.maxUsernameLength = function () {
        return 15;
    }

    that.userTypes = function () {
        return ["--","Student", "Tutor"];
    }

    that.genders = function () {
    	return ["Male","Female"];
    }

    that.confirmation = function () {
        return ["Yes", "No"];
    }

    that.studentSchools = function () {
        return ["Select your school...","Afghans for Progessive Thinking (APT)", "Independent" , 
                "Kabul Education Advising Center", 
                "Kandahar Institute of Modern Studies (KIMS)",
                "Lincoln Learning Center (Kabul)",
                "Horizon Public School and Academy (Quetta)", "Other"]
    }

    that.tutorSchools = function () {
        return ["Select your school...","Bentley University", "Salem State University",
                "Harvard University", "Other"]
    }

    that.lowerLevels = ["Primary Education: Kindergarten through 5th Grade", 
                        "Middle School: 6th through 8th Grade", 
                        "9th Grade", "10th Grade", "11th Grade", 
                        "12th Grade", "Trade School"]
    that.higherLevels = ["University Freshman", "University Sophomore", 
                        "University Junior", "University Senior", 
                        "Master's Degree", "Doctoral Degree"];

    that.studentEducationLevels = function () {
        return that.lowerLevels.concat(that.higherLevels);
    }

    that.tutorEducationLevels = function (isTutor) {
        return ['High School'].concat(that.higherLevels);
    }

    that.majors = function () {
        return ["International Relations or Global Studies", "Economics",
                  "Management", "English", "Sociology", "Not Applicable",
                  "Other",]
    }

    that.interests = function () {
        return ["English", "Science", "Math", "History", "Current Events", 
                "Business", "International Relations", "Computers and Technology", 
                "Fine Arts", "Sports", "Education", "Foreign Languages", 
                "Other"]
    }

    that.courses = function(){
        return ["Beginner Math", "Advanced Math", "Beginner English", "Intermediate English", "Advanced English", "Intermediate Math"]
    };

   	Object.freeze(that);
    return that;
};

module.exports = Enums();
