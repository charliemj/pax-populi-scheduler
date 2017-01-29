$(document).ready(function(){
    
    var validForm = {};

    //checks for some validation on required fields. Will not allow form to be submitted if any of these conditions aren't met.
    $("#register-button").click(function(){

        var notAllowedPattern = new RegExp (JSON.parse($("#notAllowedRegex").val()));

        var firstName = $("#firstName-register-box").val();
        var middleName = $("#middleName-register-box").val();
        var lastName = $("#lastName-register-box").val();
        var nickName = $("#nickName-register-box").val();
        var phone = $("#phone-number-box").val();
        var skype = $("#skypeId-register-box").val();
        var nationality = $("#nationality-register-box").val();
        var DOB = $("#dob-register-box").val();
        var role = $('.role :selected').text().toLowerCase();
        var regularUser = role !== 'administrator' && role != 'coordinator';
        var username = $("#username-register-box").val();
        var pw = $("#password-register-box").val();
        var passwordPattern = new RegExp(JSON.parse($("#passwordRegex").val()));
        var pwConfirm = $("#confirm-password-register-box").val();
        var email = $("#email-register-box").val();
        var emailRegEx = new RegExp(JSON.parse($("#emailRegex").val()));
        var altEmail = $("#alternative-email-register-box").val();
        var gender = $("#gender").val();
        var userType = $("#userType").val();
        var studentSchool = $("#studentSchool").val();
        var tutorSchool = $("#tutorSchool");
        var studentEd = $("#student-education-level");
        var tutorEd = $("#tutor-education-level");
        var tutorMajor = $("#major-register-box");
        var country = $("input[name=country]");
        var region = $("input[name=region]");
        var interests = $("input[name=interests]");
        var inCharge = $("input[name=in-charge]");

        validForm.userType = true;
        if (!userType){
            validForm.userType = false;
            $('#userTypeErrors').empty();
            $('#userTypeErrors').append('<p>Please select a user type.</p>');
        }

        else{
            $('#userTypeErrors').empty();
        }


        validForm.country = true;
        validForm.region = true;
        validForm.interests = true;

        if (regularUser){
            if(!country){
                validForm.country = false;
                $('#countryErrors').empty();
                $('#countryErrors').append('<p>Please select your country.</p>');
            }
            else{
                $('#countryErrors').empty();
            }
            if(!region){
                validForm.region = false;
                $('#regionErrors').empty();
                $('#regionErrors').append('<p>Please select your region.</p>');
            }
            else{
                $('#regionErrors').empty();
            }

            if(!interests){
                validForm.interests = false;
                $('#interestsErrors').empty();
                $('#interestsErrors').append('<p>Please select some of your interests.</p>');

            }

            else{
                $('#interestsErrors').empty();
            }
        }


        validForm.studentSchoool = true;
        validForm.studentEd = true;
        if (role==="student"){

            if(!studentEd){
                validForm.studentEd = false;
                $('#studentEdErrors').empty();
                $('#studentEdErrors').append('<p>Please select your education level.</p>');

            }
             else{
                $('#studentEdErrors').empty();
            }


            if(!studentSchool){
                validForm.studentSchool = false;
                $('#studentSchoolErrors').empty();
                $('#studentSchoolErrors').append('<p>Please select your school.</p>');

            }
             else{
                $('#studentSchoolErrors').empty();
            }

        }

        validForm.tutorEd = true;
        validForm.tutorSchoool = true;
        validForm.tutorMajor = true;
        if (role==="tutor"){

            if (!tutorMajor){
                validForm.tutorMajor = false;
                $('#majorErrors').empty();
                $('#majorErrors').append('<p>Please select your education level.</p>');

            }

            else{
                $('#majorErrors').empty();
            }

            if (!tutorEd){
                validForm.tutorEd = false;
                $('#tutorEdErrors').empty();
                $('#tutorEdErrors').append('<p>Please select your education level.</p>');

            }
             else{
                $('#tutorEdErrors').empty();
            }

            if(!tutorSchool){
                validForm.tutorSchool = false;
                $('#tutorSchoolErrors').empty();
                $('#tutorSchoolErrors').append('<p>Please select your school.</p>');

            }
             else{
                $('#tutorSchoolErrors').empty();
            }

        }


        validForm.username = true;
        if (username.length < 5 || username.length > 15){
            validForm.username = false;
        
            if (notAllowedPattern.test(username)) {
                validForm.username = false;
            }
        }

        validForm.password = true;
        if ( pw.legnth < 8 || !(passwordPattern.test(pw))){
            validForm.password = false;
        }
            if (notAllowedPattern.test(pw)) {
                validForm.password = false;
        }


        validForm.passwordConfirm = true;
        if (pw !== pwConfirm){
            validForm.passwordConfirm = false;
        }

        
        validForm.email = true;
        if( !email || !(emailRegEx.test(email))) {
            validForm.email = false;
        }

        else if(email.slice(-3) == "edu"){
            validForm.email = false;
        }

        if (notAllowedPattern.test(email)) {
            validForm.email = false;
        }

        
        validForm.altEmail = true;
        if( altEmail && !(emailRegEx.test(altEmail))) {
            validForm.altEmail = false;
        }
        

        if (altEmail && notAllowedPattern.test(altEmail)) {
            validForm.altEmail = false;
        }

            
        validForm.timezone = true;
        if($("input[name=timezone]").val() == "" && regularUser){
            validForm.timezone = false;
            $('#timezoneErrors').empty();
            $('#timezoneErrors').append('<p>Please select your timezone.</p>');
        }

        validForm.gender = true;
        if (!gender && regularUser){
            validForm.gender = false;
            $('#genderErrors').empty();
            $('#genderErrors').append('<p>Please select your gender.</p>');
        }

        else if (regularUser){
            $('#genderErrors').empty();
        }

        //An invalid birthday is one that occured within the past year. This could be better. 
        var birthdayYear = parseInt(DOB.substring(0,4));
        var currentYear = new Date().getFullYear();
        
        validForm.DOB = true;
        if (birthdayYear >= currentYear && regularUser){
            $('#DOBErrors').empty();
            $('#DOBErrors').append('<p>Please enter a valid birthday.</p>');
            validForm.DOB = false;
        }

        else if (regularUser){
            $('#DOBErrors').empty();
        }

        validForm.firstName = true;
        if(notAllowedPattern.test(firstName)){
            validForm.firstName = false;
            $("#firstNameErrors").append("<p>First name contains disallowed special characters</p>");
        }
        else{$("#firstNameErrors").empty();}

        validForm.middleName = true;
        if(notAllowedPattern.test(middleName)){
            validForm.middleName = false;
            $("#middleNameErrors").append("<p>Middle name contains disallowed special characters</p>");
        }
        else{$("#middleNameErrors").empty();}

        validForm.lastName = true;
        if(notAllowedPattern.test(lastName)){
            validForm.lastName = false;
            $("#lastNameErrors").append("<p>Last name contains disallowed special characters</p>");
        }
        else{$("#lastNameErrors").empty();}

        validForm.nickname = true;
        if(notAllowedPattern.test(nickName)){
            validForm.nickname = false;
            $("#nickNameErrors").append("<p>Nickname contains disallowed special characters</p>");
        }
        else{$("#nickNameErrors").empty();}

        validForm.phone = true;
        if(notAllowedPattern.test(phone)){
            validForm.phone = false;
            $("#phoneNumErrors").append("<p>Phone number contains disallowed special characters</p>");
        }
        else{$("#phoneNumErrors").empty();}

        validForm.skype = true;
        if(notAllowedPattern.test(skype)){
            validForm.skype = false;
            $("#skypeErrors").append("<p>Skype username contains disallowed special characters</p>");
        }
        else{$("#skypeErrors").empty();}

        validForm.nationality = true;
        if(notAllowedPattern.test(nationality)){
            validForm.nationality = false;
            $("#nationalityErrors").append("<p>Nationality contains disallowed special characters</p>");
        }
        else{$("#nationalityErrors").empty();}


        validForm.inCharge = true;
        if (role === "coordinator"){

            if (!inCharge){
                validForm.inCharge = false;
                $('#inChargeErrors').empty();
                $('#inChargeErrors').append('<p>Please select what you are in charge of.</p>');
            }

            else{
                $('#inChargeErrors').empty();
            }

            if (inCharge === "School"){

                if (!$("input[name=schoolInCharge]")){
                    $('#inChargeSchoolErrors').append('<p>Please select what school are in charge of.</p>');
                }
                else{
                    $('#inChargeSchoolErrors').empty();
                }


            }

            if (inCharge === "Region"){
                if (!$("input[name=countryInCharge]")){
                    $('#inChargeCountryErrors').append('<p>Please select what country are in charge of.</p>');
                }

                else{
                    $('#inChargeCountryErrors').empty();
                }

                if (!$("input[name=regionInCharge]")){
                    $('#inChargeRegionErrors').append('<p>Please select what region are in charge of.</p>');
                }

                else{
                    $('#inChargeRegionErrors').empty();
                }

            }

            if (inCharge === "Country"){

                if (!$("input[name=countryInCharge]")){
                    $('#inChargeCountryErrors').append('<p>Please select what country are in charge of.</p>');
                }

                else{
                    $('#inChargeCountryErrors').empty();
                }

            }


        }



        var allValid = true;
        for (var key in validForm){
            if (validForm[key] === false){
                allValid = false;
                console.log(key);
            }

        }
        if (allValid){
            $("#register-form").submit();
        }
    });

    
    // THE FOLLOWING BLUR ALERTS ARE ONLY TO VISUALLY ALERT USER TO MISSING FIELDS
    // DOES NOT PREVENT USER FROM SUBMITTING FORM (that validation is done above)
    //alerts user in realtime to possible registration errors on signup form. Does not actually enforce requirements though. 

    $("#username-register-box").blur(function(){

        //usernames can only contain numbers and letters and the following special chars: _ - .
        var username = $("#username-register-box").val();
        var notAllowedPattern = new RegExp (JSON.parse($("#notAllowedRegex").val()));
        console.log(notAllowedPattern);

        if (username.length < 5 || username.length > 15){
            $('#usernameErrors').empty();
            $('#usernameErrors').append('<p>Username must be 5-15 characters long</p>');
            $("#username-register-box").css({"border-color":"red"});
        }

        else if (5<= username.length && username.length <= 15){
            $('#usernameErrors').empty();
        

            if (notAllowedPattern.test(username)) {
                $('#usernameErrors').append('<p>Username contains disallowed special characters.</p>');
                $("#username-register-box").css({"border-color":"red"});
                validForm.username = false;
            
            }

            else{
                $('#usernameErrors').empty();
                $("#username-register-box").css({"border-color":"green"});
            }
        }

    }); 

    $("#password-register-box").blur(function(){

        var pw = $("#password-register-box").val();

        var passwordPattern = new RegExp(JSON.parse($("#passwordRegex").val()));
        var notAllowedPattern = new RegExp (JSON.parse($("#notAllowedRegex").val()));

        if ( pw.legnth < 8 || !(passwordPattern.test(pw))){
            $('#pwErrors').empty();
            $("#pwErrors").append("<p>A valid password contains at least 8 characters, and at least one uppercase character, one lowercase character, a number and one special character.</p>");
            $("#password-register-box").css({"border-color":"red"});
        }

        if (pw.length >= 8 && passwordPattern.test(pw)){
            $('#pwErrors').empty();

            if (notAllowedPattern.test(pw)) {
                $('#pwErrors').append('<p>Password contains disallowed special characters.</p>');
                $("#password-register-box").css({"border-color":"red"});
            }

            else{
                $('#pwErrors').empty();
                $("#password-register-box").css({"border-color":"green"});
            }   
        }

        
    });

    $("#confirm-password-register-box").blur(function(){
        var pw = $("#password-register-box").val();
        var pwConfirm = $("#confirm-password-register-box").val();

        validForm.passwordConfirm = true;
        if (pw !== pwConfirm){
            $("#pwConErrors").empty();
            $("#pwConErrors").append("<p>This password does not match the one you entered above.</p>");
            $("#confirm-password-register-box").css({"border-color":"red"});
            validForm.passwordConfirm = false;
        }

        else{
            $("#pwConErrors").empty();
            $("#confirm-password-register-box").css({"border-color":"green"});
        }
        
    });


    $("#email-register-box").blur(function(){
        var email = $("#email-register-box").val();
        var emailRegEx = new RegExp(JSON.parse($("#emailRegex").val()));
        var notAllowedPattern = new RegExp (JSON.parse($("#notAllowedRegex").val()));

        validForm.email = true;
        if( !(emailRegEx.test(email))) {
            $("#emailErrors").empty();
            $("#emailErrors").append("<p>Please enter a valid email address</p>");
            $("#email-register-box").css({"border-color":"red"});
            validForm.email = false;
        }

        else if(email.slice(-3) == "edu"){
            $("#emailErrors").empty();
            $("#emailErrors").append("<p>Please use a non .edu email address as your primary email address</p>");
            $("#email-register-box").css({"border-color":"red"});
            validForm.email = false;
        }


        else{
            $("#emailErrors").empty();

            if (notAllowedPattern.test(email)) {
                $('#emailErrors').append('<p>Email contains disallowed special characters.</p>');
                $("#email-register-box").css({"border-color":"red"});
                validForm.email = false;
            }

            else{
                $('#emailErrors').empty();
                $("#email-register-box").css({"border-color":"green"});
            }   
        }
    });

    $("#alternative-email-register-box").blur(function(){
        var email = $("#alternative-email-register-box").val();
        var emailRegEx = new RegExp(JSON.parse($("#emailRegex").val()));
        var notAllowedPattern = new RegExp (JSON.parse($("#notAllowedRegex").val()));

        validForm.altEmail = true;
        if( email && !(emailRegEx.test(email))) {
            $("#altEmailErrors").empty();
            $("#altEmailErrors").append("<p>Please enter a valid email address</p>");
            $("#alternative-email-register-box").css({"border-color":"red"});
            validForm.altEmail = false;
        }

        else{

            $("#altEmailErrors").empty();

            if (notAllowedPattern.test(email)) {
                $('#altEmailErrors').append('<p>Email contains disallowed special characters.</p>');
                $("#alternative-email-register-box").css({"border-color":"red"});
                validForm.altEmail = false;
            }

            else{
                $('#altEmailErrors').empty();
                $("#alternative-email-register-box").css({"border-color":"green"});
            }   
        }

    });
});