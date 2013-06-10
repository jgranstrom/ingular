(function() {
  'use strict';

  angular.module('app.controllers.StreamCtrl', [
      'app.services.streamService',
      'app.services.tagService'
    ])
    .controller('StreamCtrl', function ($scope, $filter, streamService, tagService) {
      $scope.service = streamService;
      $scope.timeSeries = streamService.timeSeries;
      $scope.tagEntries = tagService.tags;
    });
}());