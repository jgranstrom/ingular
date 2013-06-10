(function() {
  'use strict';

  /**
   * The control service provides an API for manipulating the stream flow
   */
  angular.module('app.services.controlService', [])
    .factory('controlService', function() {
      var controlService = {};

      controlService.isPaused = false;

      controlService.togglePause = function() {
        controlService.isPaused = !controlService.isPaused;
      };

      return controlService;
    });
}());