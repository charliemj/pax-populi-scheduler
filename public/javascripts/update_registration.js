//Angular.js code that populates the screen with the time selector interface and includes a function
// to send the updated availabilties to the database when the "submit" button is clicked

$(document).ready(function () {
    $('#navbar-register').addClass('active');
});

var updateRegistration = angular.module("updateRegistration",[]);

updateRegistration.controller('mainController', ['$scope','$http', function($scope, $http){

    
    $("#day-schedule").dayScheduleSelector({}); //function that makes the calendar UI
     
    //populates calendar with previously submitted availabilties
    var availability = JSON.parse($("#availability").val());
    var genderPref = $("#oldGenderPref").val();
    var earliestStartTime = ($("#oldStartTime").val()); //will this date object give issues?
    var courses = $("#oldCourses").val();
    var regId = $("#regId").val();
    var username = $("#username").val();

    //converts this back into a date object
    var earliestStartTimeDate = new Date(earliestStartTime);
    
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
    //gets us the form we need to feed back into datepicker UI, substring(0,10) gives us yyyy-mm-dd
    var oldEarliestTime = earliestStartTimeDate.toISOString().substring(0, 10);

    $('#genderPref').val(genderPref);
    $('#earliestStartTime').val(oldEarliestTime);
    $('#courses').val(courses);

    //populates schedule UI with the previously selected times
    $("#day-schedule").data('artsy.dayScheduleSelector').deserialize(availability);


    //Submit the schedule-- save availablity to database
    $scope.updateRegistration = function (){
        var availability = $("#day-schedule").data('artsy.dayScheduleSelector').serialize(); //gets the schedule output as an object
        
        var csrf = $('#csrf').val(); //all posts requests need an _csrf param
        var courses = $("#courses").val();
        var genderPref = $("#genderPref").val();
        var earliestStartTime = $("#earliestStartTime").val();

        var result = {_csrf:csrf, availability:availability, courses:courses, genderPref:genderPref, earliestStartTime: earliestStartTime};
    
        $http.put('/registrations/update/'+ username +'/' + regId, result).then(
            function (data){window.location.replace("/"); alert("Registration succesfully updated!");}, 
            function (data){console.log("Error: " + data);});
    };//end submitRegistration
}]);//end controller



