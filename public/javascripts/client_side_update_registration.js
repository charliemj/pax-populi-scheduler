//Angular.js code that populates the screen with the time selector interface and includes a function
// to send the updated availabilties to the database when the "submit" button is clicked

var updateRegistration = angular.module("updateRegistration",[]);

updateRegistration.controller('mainController', ['$scope','$http', function($scope, $http){

    
    $("#day-schedule").dayScheduleSelector({}); //function that makes the calendar UI
     
    //populates calendar with previously submitted availabilties
    $("#day-schedule").data('artsy.dayScheduleSelector').deserialize({
        // '0': [['09:30', '11:00'], ['13:00', '16:30']],
        // '3':[['08:00','12:00'],['15:00','15:30']]
      });

    //Submit the schedule-- save availablity to database
    $scope.updateRegistration = function (){
        var availability = $("#day-schedule").data('artsy.dayScheduleSelector').serialize(); //gets the schedule output as an object
        
        var csrf = $('#csrf').val(); //all posts requests need an _csrf param
        var course = $("#course").val();
        var genderPref = $("#genderPref").val();

        var result = {_csrf:csrf, availability:availability, course:course, genderPref:genderPref};
    
        $http.put('/registrations/:username/:registration_id', result).then(
            function (data){}, 
            function (data){console.log("Error: " + data);});
    };//end submitRegistration
}]);//end controller



