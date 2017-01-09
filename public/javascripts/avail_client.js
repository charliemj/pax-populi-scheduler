var avail = angular.module("availability",[]);

avail.controller('mainController', ['$scope','$http', function($scope,$http){

    
      $("#day-schedule").dayScheduleSelector({}); //fn that makes the calendar UI
     

    //Submit the schedule-- save avail to database
    $scope.submitAvail = function(){
        var avail = $("#day-schedule").data('artsy.dayScheduleSelector').serialize();
        
        console.log("Here's the availablity");
        console.log(avail);
        
        $http.post('/avail', avail)
        .success(function(data){
            $scope.avail = data;
        })
        .error(function(data){
            console.log("Error: " + data); //<-- is this what we want?
        });



    };
}]);