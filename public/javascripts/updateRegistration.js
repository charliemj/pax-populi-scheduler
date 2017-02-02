//Angular.js code that populates the screen with the time selector interface and includes a function
//to send the updated registrations to the database when the "update" button is clicked


var updateRegistration = angular.module("updateRegistration",[]);

updateRegistration.controller('mainController', ['$scope','$http', function($scope, $http){

    
    $("#day-schedule").dayScheduleSelector({}); //function that makes the calendar UI
    
    //LOGIC FOR POPULATING PAGE WITH SAVED REGISTRATION DATA
    //populates calendar with previously submitted registration values
    var oldRegistration = JSON.parse($("#oldRegistration").val());
    var availability = oldRegistration.availability;
    var genderPref = oldRegistration.genderPref;
    var earliestStartTime = oldRegistration.earliestStartTime;
    var courses = oldRegistration.courses;
    var regId = $("#regId").val();
    var username = $("#username").val();

    //converts earliestStartTime back into a date object
    var earliestStartTimeDate = new Date(earliestStartTime);
    
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
    //gets us the form we need to feed back into datepicker UI, substring(0,10) gives us yyyy-mm-dd
    var oldEarliestTime = earliestStartTimeDate.toISOString().substring(0, 10);

    //set the fields on the UI with the data we have
    $('#genderPref').val(genderPref);
    $('#earliestStartTime').val(oldEarliestTime);
    $('#courses').val(courses);
    $("#earliestStartTime").attr("min", oldEarliestTime); 

    //populates schedule UI with the previously selected times
    $("#day-schedule").data('artsy.dayScheduleSelector').deserialize(availability);
    ////////////////////

    //LOGIC FOR VALIDATING UPDATE FORM
    
    var registrationFormValidation = function(){
        var availability = $("#day-schedule").data('artsy.dayScheduleSelector').serialize();
        var genderPref = $("#genderPref").val();
        var courses = $("#courses").val();
        var earliestStartDate = $("#earliestStartTime").val();

        if(genderPref == "MALE" | genderPref == "FEMALE" | genderPref == "NONE"){
            $("#genderPrefError").empty(); 
        }
        else{
            $("#genderPrefError").append('<p>Error: Please answer this question.</p>');
            return false;
        }

        if (courses.length === 0){
            $("#coursesError").append('<p>Error: Please select at least one course.</p>');
            return false;
        }
        else{
            $("#coursesError").empty();
        }

        if(earliestStartDate === undefined || earliestStartDate =="" ){
            $("#startTimeError").append('<p>Error: Please select a date.</p>');
            return false;
        }
        else{
            $("#startTimeError").empty();
        }

        return true; //hits no errors
    };

    //LOGIC FOR UPDATING REGISTRATION
    //Submit the schedule-- save availablity and other registration info to database
    $scope.updateRegistration = function (){

        if (!registrationFormValidation()){return;} //if validation false, don't submit

        var availability = $("#day-schedule").data('artsy.dayScheduleSelector').serialize(); //gets the schedule output as an object
        
        var csrf = $('#csrf').val(); //all posts requests need an _csrf param
        var courses = $("#courses").val();
        var genderPref = $("#genderPref").val();
        var earliestStartTime = $("#earliestStartTime").val();
        var data = {_csrf:csrf, availability:availability, courses:courses, genderPref:genderPref, earliestStartTime: earliestStartTime};

        $http.put('/registrations/update/'+ username +'/' + regId, data).then(
            function (result){
                var data = result.data;
                if (data.success) {
                    addMessage(data.message, true);
                    if (typeof data.redirect === 'string') {
                        setTimeout(function(){
                            window.location = data.redirect;
                        }, 2500);   
                    }
                } else {
                    addMessage(data.message, false);
                }
            }, //if call to server is sucessful, redirects to dashboard
            function (result){
                var data = result.data;
                addMessage('A network error might have occurred. Please try again.', false);
            });
    };//end updateRegistration


    $scope.deleteRegistration = function(){
        var csrf = $('#csrf').val();

        data = {_csrf:csrf};
        // console.log(data);
        
        $http({ //need to do this kind of http req because angulars $http.delete cannot send the csrf token :(
            method: 'DELETE',
            url: '/registrations/delete/' + username + '/' + regId,
            data: data,
            headers: {'Content-Type': 'application/json;charset=utf-8'}
        }).then(
            function(result){
                var data = result.data;
                if (data.success) {
                    addMessage(data.message, true);
                    if (typeof data.redirect === 'string') {
                        setTimeout(function(){
                            window.location = data.redirect;
                        }, 2500);   
                    }
                } else {
                    addMessage(data.message, false);
                }
            }, //if call to server is sucessful, redirects to dashboard
            function (result){
                var data = result.data;
                // console.log(data);
                addMessage('A network error might have occurred. Please try again.', false);
            });
    };


}]);//end controller
