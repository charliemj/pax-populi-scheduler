var app = angular.module('timezoneSelect', ['angular-timezone-selector']).config(function($interpolateProvider){
    $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
});

app.controller('tzControl', ['$scope', function ($scope) {
  $scope.timezone = '';

  // $scope.formSubmit = function (){
  //   //console.log($scope.timezone);
  // };

}]);