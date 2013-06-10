(function() {
  'use strict';

  /**
   * Define services module and service dependencies
   */
  angular.module('app.services', [
    'app.services.socketService',
    'app.services.tagService',
    'app.services.controlService',
    'app.services.statsService',
    'app.services.imagesService'
  ]);
}());
