(function() {
  'use strict';

  angular.module('app.controllers.TagsCtrl', [
      'app.services.socketService'
    ])
    .controller('TagsCtrl', function ($scope, tagService) {
      $scope.maxTags = tagService.maxTags;
      $scope.tagEntries = tagService.tags;
      $scope.tagToAdd = '';

      $scope.addTag = function(tag) {
        if(tagService.addTag(tag)) {
          $scope.tagToAdd = '';
        }
      };

      $scope.removeTag = function(tag) {
        tagService.removeTag(tag.tag);
      };
    });
}());