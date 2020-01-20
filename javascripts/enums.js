const Enums = function() {

    const values = Object.create(Enums.prototype);
    //values is the object created each time one of enums' methods is required.

    values.numTokenDigits = function () {
        return 32;
    };

    values.minUsernameLength = function () {
        return 5;
    }

    values.maxUsernameLength = function () {
        return 15;
    }

    values.userTypes = function () {
        return ["Student", "Tutor", "Administrator", "Coordinator"];
    }

    values.genders = function () {
    	return ["Male","Female"];
    }

    values.confirmation = function () {
        return ["Yes", "No"];
    }

    values.studentSchools = function () {
        return ["Afghans for Progessive Thinking (APT)", "Independent" , 
                "Kabul Education Advising Center", 
                "Kandahar Institute of Modern Studies (KIMS)",
                "Lincoln Learning Center (Kabul)",
                "Horizon Public School and Academy (Quetta)", "Other"]
    }

    values.tutorSchools = function () {
        return ["Bentley University", "Salem State University",
                "Harvard University", "Other"]
    }

    values.lowerLevels = ["Primary Education: Kindergarten through 5th Grade",
                        "Middle School: 6th through 8th Grade", 
                        "9th Grade", "10th Grade", "11th Grade", 
                        "12th Grade", "Trade School"]
    values.higherLevels = ["University Freshman", "University Sophomore",
                        "University Junior", "University Senior", 
                        "Master's Degree", "Doctoral Degree"];

    values.studentEducationLevels = function () {
        return values.lowerLevels.concat(values.higherLevels);
    }

    values.tutorEducationLevels = function (isTutor) {
        return ['High School'].concat(values.higherLevels);
    }

    values.majors = function () {
        return ["International Relations or Global Studies", "Economics",
                  "Management", "English", "Sociology", "Not Applicable",
                  "Other",]
    }

    values.interests = function () {
        return ["English", "Science", "Math", "History", "Current Events", 
                "Business", "International Relations", "Computers and Technology", 
                "Fine Arts", "Sports", "Education", "Foreign Languages", 
                "Other"]
    }

    values.courses = function(){
        return ["Intermediate English 1A", "Intermediate English 1B", "Basic Mathematics"];
    };

   	Object.freeze(values);
    return values;
};

module.exports = Enums();
