$(document).ready(function(){
    

    //TODO maybe other validation to make sure that fields are checked
    
    $("#register-button").click(function(){

        var validForm = true;
        var notAllowedPattern = new RegExp (JSON.parse($("#notAllowedRegex").val()));


        var firstName = $("#firstName-register-box").val();
        var middleName = $("#middleName-register-box").val();
        var lastName = $("#lastName-register-box").val();
        var nickName = $("#nickName-register-box").val();
        var phone = $("#phone-number-box").val();
        var skype = $("#skypeId-register-box").val();
        var nationality = $("#nationality-register-box").val();
        var role = $('.role :selected').text().toLowerCase();
        var regularUser = role !== 'administrator' && role != 'coordinator';

        if($("input[name=timezone]").val() == "" && regularUser){
            validForm = false;
            $('#timezoneErrors').empty();
            $('#timezoneErrors').append('<p>Please select your timezone.</p>');
        }

        if(notAllowedPattern.test(firstName)){
            validForm = false;
            $("#firstNameErrors").append("<p>First name contains disallowed special characters</p>");
        }
        else{$("#firstNameErrors").empty();}

        if(notAllowedPattern.test(middleName)){
            validForm = false;
            $("#middleNameErrors").append("<p>Middle name contains disallowed special characters</p>");
        }
        else{$("#middleNameErrors").empty();}

        if(notAllowedPattern.test(lastName)){
            validForm = false;
            $("#lastNameErrors").append("<p>Last name contains disallowed special characters</p>");
        }
        else{$("#lastNameErrors").empty();}

        if(notAllowedPattern.test(nickName)){
            validForm = false;
            $("#nickNameErrors").append("<p>Nickname contains disallowed special characters</p>");
        }
        else{$("#nickNameErrors").empty();}

        if(notAllowedPattern.test(phone)){
            validForm = false;
            $("#phoneNumErrors").append("<p>Phone number contains disallowed special characters</p>");
        }
        else{$("#phoneNumErrors").empty();}

        if(notAllowedPattern.test(skype)){
            validForm = false;
            $("#skypeErrors").append("<p>Skype username contains disallowed special characters</p>");
        }
        else{$("#skypeErrors").empty();}

        if(notAllowedPattern.test(nationality)){
            validForm = false;
            $("#nationalityErrors").append("<p>Nationality contains disallowed special characters</p>");
        }
        else{$("#nationalityErrors").empty();}


        if (validForm){
            $("#register-form").submit();
        }
    });


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
            $("#emailErrors").append("<p>Please use a non .edu email address as your primary email address</p>");
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

        if( !(emailRegEx.test(email))) {
            $("#altEmailErrors").empty();
            $("#altEmailErrors").append("<p>Please enter a valid email address</p>");
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