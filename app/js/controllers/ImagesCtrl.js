(function() {
  'use strict';

  angular.module('app.controllers.ImagesCtrl', [
      'app.services.imagesService',
      'app.services.tagService',
      'app.util'
    ])
    .controller('ImagesCtrl', function ($scope, imagesService, tagService, util) {
      util.attach($scope, imagesService, 'images');
      $scope.tagEntries = tagService.tags;

      $scope.mouseenter = function(img) {
        img.hover = true;
      };
      $scope.mouseleave = function(img) {
        img.hover = false;
      };
    });
}());