(function() {
  'use strict';

  /**
   * Filter tags by enabled ones only
   */
  angular.module('app.filters.tagFilter', [
      'app.services.tagService'
  ]).filter('tagFilter', function(tagService) {
    return function(items) {
      var filtered = [];
      angular.forEach(items, function(item) {
        if(tagService.isTagEnabled(item.tag)) {
          filtered.push(item);
        }
      });

      return filtered;
    };
  });
}());