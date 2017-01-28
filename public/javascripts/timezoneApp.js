//Set up for the timezone selector on the signup form
var app = angular.module('timezoneSelect', ['angular-timezone-selector']).config(function($interpolateProvider){
    $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
});

app.controller('tzControl', ['$scope', function ($scope) {
  $scope.timezone = '';

}]);