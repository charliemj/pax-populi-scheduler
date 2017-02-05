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
        var studentSchool = $("select[name=studentSchool]").val();
        var tutorSchool = $("select[name=tutorSchool]").val();
        var studentEd = $("select[name=studentEducationLevel]").val();
        var tutorEd = $("select[name=tutorEducationLevel]").val();
        var tutorMajor = $("#major-register-box").val();
        var country = $("select[name=country]").val();
        var region = $("select[name=region]").val();
        var interests = $("select[name=interests]").val();
        var inCharge = $("input[name=in-charge]:checked").val();
        var signature = $("#signature-register-box").val();

        validForm.userType = true;
        $('#userTypeErrors').empty();
        if (!userType){
            validForm.userType = false;
            $('#userTypeErrors').empty();
            $('#userTypeErrors').append('<p>Please select a user type.</p>');
        }


        validForm.country = true;
        validForm.region = true;
        validForm.interests = true;

        $('#countryErrors').empty();
        $('#regionErrors').empty();
        $('#interestsErrors').empty();

        if (regularUser){
            // console.log(country);
            if(!country){
                validForm.country = false;
                $('#countryErrors').empty();
                $('#countryErrors').append('<p>Please select your country.</p>');
            }
           
            if(!region){
                validForm.region = false;
                $('#regionErrors').empty();
                $('#regionErrors').append('<p>Please select your region.</p>');
            }
            

            if(!interests){
                validForm.interests = false;
                $('#interestsErrors').empty();
                $('#interestsErrors').append('<p>Please select some of your interests.</p>');

            }
        }


        validForm.studentSchoool = true;
        validForm.studentEd = true;
        
        $('#studentEdErrors').empty();
        $('#studentSchoolErrors').empty();

        if (role==="student"){

            if(!studentEd){
                validForm.studentEd = false;
                $('#studentEdErrors').empty();
                $('#studentEdErrors').append('<p>Please select your education level.</p>');

            }
             
            if(!studentSchool){
                validForm.studentSchool = false;
                $('#studentSchoolErrors').empty();
                $('#studentSchoolErrors').append('<p>Please select your school.</p>');

            }
        }

        validForm.tutorEd = true;
        validForm.tutorSchoool = true;
        validForm.tutorMajor = true;

        $('#majorErrors').empty();
        $('#tutorEdErrors').empty();
        $('#tutorSchoolErrors').empty();

        if (role==="tutor"){

            if (!tutorMajor){
                validForm.tutorMajor = false;
                $('#majorErrors').empty();
                $('#majorErrors').append('<p>Please select your education level.</p>');

            }

            
            if (!tutorEd){
                validForm.tutorEd = false;
                $('#tutorEdErrors').empty();
                $('#tutorEdErrors').append('<p>Please select your education level.</p>');

            }
             
            if(!tutorSchool){
                validForm.tutorSchool = false;
                $('#tutorSchoolErrors').empty();
                $('#tutorSchoolErrors').append('<p>Please select your school.</p>');

            }
            
        }


        validForm.username = true;
        $('#usernameErrors').empty();

        if (username.length < 5 || username.length > 15){
            validForm.username = false;
            $('#usernameErrors').empty();
            $('#usernameErrors').append('<p>Username must be 5-15 characters long</p>');
            
        
            if (notAllowedPattern.test(username)) {
                validForm.username = false;
                $('#usernameErrors').append('<p>Username contains disallowed special characters.</p>');
                
            }
        }

        validForm.password = true;
        $('#pwErrors').empty();

        if ( pw.legnth < 8 || !(passwordPattern.test(pw))){
            validForm.password = false;
            $('#pwErrors').empty();
            $("#pwErrors").append("<p>A valid password contains at least 8 characters, and at least one uppercase character, one lowercase character, a number and one special character.</p>");
            
        }
            if (notAllowedPattern.test(pw)) {
                validForm.password = false;
                $('#pwErrors').append('<p>Password contains disallowed special characters.</p>');
                
        }


        validForm.passwordConfirm = true;
        $("#pwConErrors").empty();

        if (pw !== pwConfirm){
            validForm.passwordConfirm = false;
            $("#pwConErrors").empty();
            $("#pwConErrors").append("<p>This password does not match the one you entered above.</p>");
        }

        
        validForm.email = true;
        $("#emailErrors").empty();

        if( !email || !(emailRegEx.test(email))) {
            validForm.email = false;
            $("#emailErrors").empty();
            $("#emailErrors").append("<p>Please enter a valid email address.</p>");
        }

        else if(email.slice(-3) == "edu"){
            validForm.email = false;
            $("#emailErrors").empty();
            $("#emailErrors").append("<p>Please use a non .edu email address as your primary email address.</p>");
        }

        

        if (notAllowedPattern.test(email)) {
            validForm.email = false;
            $("#altEmailErrors").empty();
            $('#altEmailErrors').append('<p>Email contains disallowed special characters.</p>');
        }

        
        validForm.altEmail = true;
        $("#altEmailErrors").empty();

        if( altEmail && !(emailRegEx.test(altEmail))) {
            validForm.altEmail = false;
            $("#altEmailErrors").empty();
            $("#altEmailErrors").append("<p>Please enter a valid email address.</p>");
        }
        

        if (altEmail && notAllowedPattern.test(altEmail)) {
            validForm.altEmail = false;

        }

        $('#timezoneErrors').empty();
        validForm.timezone = true;

        if($("input[name=timezone]").val() == "" && regularUser){ //do NOT do triple equals here
            validForm.timezone = false;
            $('#timezoneErrors').empty();
            $('#timezoneErrors').append('<p>Please select your timezone.</p>');
        }

        $('#genderErrors').empty();
        validForm.gender = true;

        if (!gender && regularUser){
            validForm.gender = false;
            $('#genderErrors').empty();
            $('#genderErrors').append('<p>Please select your gender.</p>');
        }


        //An invalid birthday is one that occured within the past year. This could be better. 
        var birthdayYear = parseInt(DOB.substring(0,4));
        var currentYear = new Date().getFullYear();
        
        validForm.DOB = true;
        $('#DOBErrors').empty();

        if (birthdayYear >= currentYear && regularUser){
            $('#DOBErrors').empty();
            $('#DOBErrors').append('<p>Please enter a valid birthday.</p>');
            validForm.DOB = false;
        }

        if (!DOB && regularUser){
            $('#DOBErrors').empty();
            $('#DOBErrors').append('<p>Please enter your birthday.</p>');
        }

        validForm.firstName = true;
        $("#firstNameErrors").empty();

        if(notAllowedPattern.test(firstName)){
            validForm.firstName = false;
            $("#firstNameErrors").empty();
            $("#firstNameErrors").append("<p>First name contains disallowed special characters.</p>");
        }
        else if(!firstName){
            $("#firstNameErrors").empty();
            $("#firstNameErrors").append("<p>Please provide your first name.</p>");
        }
        
        $("#middleNameErrors").empty();
        validForm.middleName = true;

        if(notAllowedPattern.test(middleName)){
            validForm.middleName = false;
            $("#middleNameErrors").empty();
            $("#middleNameErrors").append("<p>Middle name contains disallowed special characters.</p>");
        }
        
        $("#lastNameErrors").empty();
        validForm.lastName = true;

        if(notAllowedPattern.test(lastName)){
            validForm.lastName = false;
            $("#lastNameErrors").empty();
            $("#lastNameErrors").append("<p>Last name contains disallowed special characters.</p>");
        }
        else if(!lastName){
            $("#lastNameErrors").empty();
            $("#lastNameErrors").append("<p>Please provide your last name.</p>");
        }
        

        $("#nickNameErrors").empty();
        validForm.nickname = true;

        if(notAllowedPattern.test(nickName)){
            validForm.nickname = false;
            $("#nickNameErrors").empty();
            $("#nickNameErrors").append("<p>Nickname contains disallowed special characters.</p>");
        }
        

        validForm.phone = true;
        $("#phoneNumErrors").empty();

        if(notAllowedPattern.test(phone)){
            validForm.phone = false;
            $("#phoneNumErrors").empty();
            $("#phoneNumErrors").append("<p>Phone number contains disallowed special characters.</p>");
        }
        else if (!phone){
            $("#phoneNumErrors").empty();
            $("#phoneNumErrors").append("<p>Please provide your phone number.</p>");
        }
        

        validForm.skype = true;
        $("#skypeErrors").empty();

        if(notAllowedPattern.test(skype)){
            validForm.skype = false;
            $("#skypeErrors").empty();
            $("#skypeErrors").append("<p>Skype username contains disallowed special characters.</p>");
        }
        

        validForm.nationality = true;
        $("#nationalityErrors").empty();

        if (regularUser){
            // console.log("nation"+nationality);
            if (nationality === ""){
                // console.log("work?");
                validForm.nationality = false;
                $("#nationalityErrors").empty();
                $("#nationalityErrors").append("<p>Please indicate your nationality.</p>");
            }
        }

        if(notAllowedPattern.test(nationality)){
            validForm.nationality = false;
            $("#nationalityErrors").empty();
            $("#nationalityErrors").append("<p>Nationality contains disallowed special characters.</p>");
        }
        


        validForm.inCharge = true;
        $('#inChargeErrors').empty();
        $('#inChargeSchoolErrors').empty();
        $('#inChargeCountryErrors').empty();
        $('#inChargeRegionErrors').empty();

        if (role === "coordinator"){
            // console.log(inCharge);
            if (!inCharge){
                validForm.inCharge = false;
                $('#inChargeErrors').empty();
                $('#inChargeErrors').append('<p>Please select what you are in charge of.</p>');
            }

            if (inCharge === "School"){
                if (!$("#inChargeSchool").val()){
                    $('#inChargeSchoolErrors').empty();
                    $('#inChargeSchoolErrors').append('<p>Please select what school are in charge of.</p>');
                }
            }

            if (inCharge === "Region"){
                if (!$("input[name=countryInCharge]").val()){
                    $('#inChargeCountryErrors').empty();
                    $('#inChargeCountryErrors').append('<p>Please select what country are in charge of.</p>');
                }


                if (!$("input[name=regionInCharge]").val()){
                    $('#inChargeRegionErrors').empty();
                    $('#inChargeRegionErrors').append('<p>Please select what region are in charge of.</p>');
                }
            }

            if (inCharge === "Country"){
                if (!$("input[name=countryInCharge]").val()){
                    $('#inChargeCountryErrors').empty();
                    $('#inChargeCountryErrors').append('<p>Please select what country are in charge of.</p>');
                }
            }
        }

        validForm.agreementSignature = true;
        $('#agreementErrors').empty();
        if (regularUser && !signature){
            validForm.agreementSignature = false;
            $('#agreementErrors').append('<p>Please type your name.</p>');
        }


        var allValid = true;
        // console.log(validForm);
        for (var key in validForm){
            if (validForm[key] === false){
                allValid = false;
                //// console.log(key);
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
        

        if (username.length < 5 || username.length > 15){
            $('#usernameErrors').empty();
            $('#usernameErrors').append('<p>Username must be 5-15 characters long.</p>');
            $("#username-register-box").css({"border-color":"red"});
        }

        else if (5<= username.length && username.length <= 15){
            $('#usernameErrors').empty();
        

            if (notAllowedPattern.test(username)) {
                $('#usernameErrors').append('<p>Username contains disallowed special characters.</p>');
                $("#username-register-box").css({"border-color":"red"});
                
            
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

        if (pw !== pwConfirm){
            $("#pwConErrors").empty();
            $("#pwConErrors").append("<p>This password does not match the one you entered above.</p>");
            $("#confirm-password-register-box").css({"border-color":"red"});
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

        if( !(emailRegEx.test(email))) {
            $("#emailErrors").empty();
            $("#emailErrors").append("<p>Please enter a valid email address</p>");
            $("#email-register-box").css({"border-color":"red"});
        }

        else if(email.slice(-3) == "edu"){
            $("#emailErrors").empty();
            $("#emailErrors").append("<p>Please use a non .edu email address as your primary email address.</p>");
            $("#email-register-box").css({"border-color":"red"});
        }


        else{
            $("#emailErrors").empty();

            if (notAllowedPattern.test(email)) {
                $('#emailErrors').append('<p>Email contains disallowed special characters.</p>');
                $("#email-register-box").css({"border-color":"red"});
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

        if( email && !(emailRegEx.test(email))) {
            $("#altEmailErrors").empty();
            $("#altEmailErrors").append("<p>Please enter a valid email address.</p>");
            $("#alternative-email-register-box").css({"border-color":"red"});
        }

        else{

            $("#altEmailErrors").empty();

            if (notAllowedPattern.test(email)) {
                $('#altEmailErrors').append('<p>Email contains disallowed special characters.</p>');
                $("#alternative-email-register-box").css({"border-color":"red"});
            }

            else{
                $('#altEmailErrors').empty();
                $("#alternative-email-register-box").css({"border-color":"green"});
            }   
        }

    });
});