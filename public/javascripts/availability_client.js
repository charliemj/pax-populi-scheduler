//Angular.js code that populates the screen with the time selector interface and includes a function
// to send the selected availabilties to the database when the "submit" button is clicked

var avail = angular.module("availability",[]);

avail.controller('mainController', ['$scope','$http', function($scope,$http){

    
    $("#day-schedule").dayScheduleSelector({}); //function that makes the calendar UI
     

    //Submit the schedule-- save availablity to database
    $scope.submitAvail = function(){
        var avail = $("#day-schedule").data('artsy.dayScheduleSelector').serialize(); //gets the schedule output as an object
        
        console.log("Here's the availablity");
        console.log(avail);
        
        var csrf = $('#csrf').val(); //all posts requests need an _csrf param
        var result = {_csrf:csrf, avail:avail};

        //submits the user's availablity (data) to server
        $http.post('/availabilities', result).then(
            function(data){}, 
            function(data){console.log("Error: " + data);});
    };//end submitAvail
}]);//end controller



