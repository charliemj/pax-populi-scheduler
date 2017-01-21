//Angular.js code that populates the screen with the time selector interface and includes a function
// to send the selected availabilties to the database when the "submit" button is clicked

var registration = angular.module("registration",[]);

registration.controller('mainController', ['$scope','$http', function($scope, $http){

    
    $("#day-schedule").dayScheduleSelector({}); //function that makes the calendar UI
     
    //Submit the schedule-- save availablity to database
    $scope.submitRegistration = function (){
        var availability = $("#day-schedule").data('artsy.dayScheduleSelector').serialize(); //gets the schedule output as an object
        
        var csrf = $('#csrf').val(); //all posts requests need an _csrf param
        var course = $("#course").val();
        var genderPref = $("#genderPref").val();
        var earliestStartTime = $("#earliestStartTime").val();

        var result = {_csrf:csrf, availability:availability, course:course, genderPref:genderPref, earliestStartTime:earliestStartTime};
    
        $http.post('/registrations', result).then(
            function (data){}, 
            function (data){console.log("Error: " + data);});
    };//end submitRegistration
}]);//end controller



