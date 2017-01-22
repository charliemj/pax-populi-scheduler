//Angular.js code that populates the screen with the time selector interface and includes a function
// to send the selected availabilties to the database when the "submit" button is clicked

var registration = angular.module("registration",[]);

registration.controller('mainController', ['$scope','$http', function($scope, $http){

    
    $("#day-schedule").dayScheduleSelector({}); //function that makes the calendar UI
     
    //Submit the schedule-- save availablity to database
    $scope.submitRegistration = function (){
        var availability = $("#day-schedule").data('artsy.dayScheduleSelector').serialize(); //gets the schedule output as an object
        
        var csrf = $('#csrf').val(); //all posts requests need an _csrf param
        var courses = $("#courses").val();
        var genderPref = $("#genderPref").val();
        var earliestStartTime = $("#earliestStartTime").val();
        var username = $('#username').val();

        var data = {_csrf:csrf, availability:availability, courses:courses, genderPref:genderPref, earliestStartTime:earliestStartTime};

        $http.post('/registrations/' + username, data).then(
            //TODO better alert for sucessful registration
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



