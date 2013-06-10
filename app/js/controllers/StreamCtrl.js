(function() {
  'use strict';

  angular.module('app.controllers.StreamCtrl', [
      'app.services.statsService',
      'app.services.controlService',
      'app.services.tagService',
      'app.util'
    ])
    .controller('StreamCtrl', function ($scope, $filter, statsService, controlService, tagService, util) {
      /**
       * Stats exposure
       */
      util.attach($scope, statsService, [
        'ipsToDisplay',
        'imagesSeen'
      ]);

      $scope.timeSeries = statsService.timeSeries;

      /**
       * Control exposure
       */
      util.attach($scope, controlService, 'isPaused');
      $scope.togglePause = controlService.togglePause;

      /**
       * Tags exposure
       */
      $scope.tagEntries = tagService.tags;
    });
}());