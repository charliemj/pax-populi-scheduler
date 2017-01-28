$(document).ready(function () {
    
    //on registration page, makes sure that the "earliest possible start date" is in the future
    var now = new Date(Date.now());
    var timeNow = now.toISOString().substring(0, 10);
    $("#earliestStartTime").attr("min", timeNow);

});
    

//Angular.js code that populates the screen with the time selector interface and includes a function
//to send the selected availabilties to the database when the "submit" button is clicked

var registration = angular.module("registration",[]);

registration.controller('mainController', ['$scope','$http', function($scope, $http){

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
    
    $("#day-schedule").dayScheduleSelector({}); //function that makes the calendar UI
     
    //Submit the schedule-- save registration to database
    $scope.submitRegistration = function (){

        if (!registrationFormValidation()){return;} //if validation false, don't submit

        var availability = $("#day-schedule").data('artsy.dayScheduleSelector').serialize(); //gets the schedule output as an object
        
        var csrf = $('#csrf').val(); //all posts requests need an _csrf param
        var courses = $("#courses").val();
        var genderPref = $("#genderPref").val();
        var earliestStartTime = $("#earliestStartTime").val();
        var username = $('#username').val();

        var data = {_csrf:csrf, availability:availability, courses:courses, genderPref:genderPref, earliestStartTime:earliestStartTime};

        $http.post('/registrations/' + username, data).then(
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
                    addMessage(data.datamessage, false);
                }
            }, //if call to server is sucessful, redirects to dashboard
            function (result){
                var data = result.data;
                addMessage('A network error might have occurred. Please try again.', false);
            });
    };//end submitRegistration
}]);//end controller
