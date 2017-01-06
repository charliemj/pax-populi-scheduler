var avail = angular.module("availability",[]);

avail.controller('mainController', ['$scope','$http', function($scope,$http){

    
      $("#day-schedule").dayScheduleSelector({}); //fn that makes the calendar UI
     

    //Submit the schedule-- save avail to database
    $scope.submitAvail = function(){
        var lol = $("#day-schedule").data('artsy.dayScheduleSelector').serialize();
        //console.log("submitted!");
        console.log("Here's the availablity");
        console.log(lol);
        
        // $http.post('/avail',lol)
        // .success(function(data){
        //     $scope.availability = data;
        // })
        // .error(function(data){
        //     console.log("Error: " + data);
        // });
    };
}]);