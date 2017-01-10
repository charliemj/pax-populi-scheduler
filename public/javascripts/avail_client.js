var avail = angular.module("availability",[]);

avail.controller('mainController', ['$scope','$http', function($scope,$http){

    
      $("#day-schedule").dayScheduleSelector({}); //fn that makes the calendar UI
     


    //Submit the schedule-- save avail to database
    $scope.submitAvail = function(){
        var avail = $("#day-schedule").data('artsy.dayScheduleSelector').serialize();
        
        console.log("Here's the availablity");
        console.log(avail);
        
        var csrf = $('#csrf').val();

        var result = {_csrf:csrf, avail:avail};

        var x = $http.post('/avail', result);
        
        x.then(
            function(data){$scope.avail = data;}, 
            function(data){console.log("Error: " + data);}); //<-- is this what we want?
    };//end submitAvail
}]);//end controller


// function mainController($scope, $http){
//     $("#day-schedule").dayScheduleSelector({});

//     $scope.submitAvail = function(){
//         var avail = $("#day-schedule").data('artsy.dayScheduleSelector').serialize();
        
//         console.log("Here's the availablity");
//         console.log(avail);
        
//         var x = $http.post('/avail', avail);
//         console.log(x);

//         x.success(function(data){
//             $scope.avail = data;
//         })
//         .error(function(data){
//             console.log("Error: " + data); //<-- is this what we want?
//         });
//     };

// }

