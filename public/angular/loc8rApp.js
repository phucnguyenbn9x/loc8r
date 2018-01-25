angular.module('loc8rApp', []);

var loc8rData = function($http) {
  var locationByCoords = function(lat, lng) {
    return $http.get('/api/locations?lng=105.782436&lat=21.040034&maxDistance=20');
    // return $http.get('/api/locations?lng=' + lng + '&lat=' + lat + '&maxDistance=20');
  };
  return {
    locationByCoords: locationByCoords
  };

  // return $http.get('/api/locations?lng=-0.9691895&lat=51.455041&maxDistance=20');

  // return [{
  //   name: 'Burger Queen',
  //   address: '125 High Street, Reading, RG6 1PS',
  //   rating: 3,
  //   facilities: ['Hot drinks', 'Food', 'Premium wifi'],
  //   distance: '0.296456',
  //   _id: '5370a35f2536f6785f8dfb6a'
  // }, {
  //   name: 'Costy',
  //   address: '125 High Street, Reading, RG6 1PS',
  //   rating: 5,
  //   facilities: ['Hot drinks', 'Food', 'Alcoholic drinks'],
  //   distance: '0.7865456',
  //   _id: '5370a35f2536f6785f8dfb6a'
  // }];
};

var locationListCtrl = function($scope, loc8rData, geolocation) {
  $scope.message = "Checking your location";

  $scope.getData = function(position) {
    var lat = position.coords.latitude,
      lng = position.coords.longitude;
    $scope.message = "Searching for nearby places";
    loc8rData.locationByCoords(lat, lng).then(function(response) {
      $scope.message = response.data.length > 0 ? "" : "No locations found";
      $scope.data = {
        locations: response.data
      };
    }, function(response) {
      $scope.message = "Sorry, something's gone wrong";
    });
  };

  $scope.showError = function(error) {
    $scope.$apply(function() {
      $scope.message = error.message;
    });
  };

  $scope.noGeo = function() {
    $scope.$apply(function() {
      $scope.message = "Geolocation not supported by this browser.";
    });
  };

  geolocation.getPosition($scope.getData, $scope.showError, $scope.noGeo);
};

var _isNumeric = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

var formatDistance = function() {
  return function(distance) {
    var numDistance, unit;
    if (distance && _isNumeric(distance)) {
      if (distance > 1) {
        numDistance = parseFloat(distance).toFixed(1);
        unit = 'km';
      } else {
        numDistance = parseInt(distance * 1000, 10);
        unit = 'm';
      }
      return numDistance + unit;
    } else {
      return "?";
    }
  };
};

var ratingStars = function() {
  return {
    scope: {
      thisRating: '=rating'
    },
    templateUrl: '/angular/rating-stars.html'
  };
};

var geolocation = function() {
  var getPosition = function(cbSuccess, cbError, cbNoGeo) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(cbSuccess, cbError);
    } else {
      cbNoGeo();
    }
  };
  return {
    getPosition: getPosition
  };
};

angular
  .module('loc8rApp')
  .controller('locationListCtrl', locationListCtrl)
  .filter('formatDistance', formatDistance)
  .directive('ratingStars', ratingStars)
  .service('loc8rData', loc8rData)
  .service('geolocation', geolocation);
