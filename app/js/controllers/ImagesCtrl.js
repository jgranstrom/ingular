(function() {
  'use strict';

  angular.module('app.controllers.ImagesCtrl', [
      'app.services.streamService',
      'app.services.tagService'
    ])
    .controller('ImagesCtrl', function ($scope, streamService, tagService) {
      $scope.streamService = streamService;
      $scope.tagEntries = tagService.tags;

      $scope.mouseenter = function(img) {
        img.hover = true;
      };
      $scope.mouseleave = function(img) {
        img.hover = false;
      };
    });
}());