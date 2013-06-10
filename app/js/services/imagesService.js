(function() {
  'use strict';

  /**
   * The images service receives and contains the images and updates the stats service accordingly
   */
  angular.module('app.services.imagesService', [
      'app.services.socketService',
      'app.services.tagService',
      'app.services.controlService',
      'app.services.statsService',
      'app.filters.tagFilter'
    ])
    .factory('imagesService', function(socketService, tagService, controlService, statsService, $filter) {
      var imagesService = {},
        tagFilter = $filter('tagFilter');

      imagesService.images = [];


      socketService.on('updates', function(data) {
        if(controlService.isPaused) {
          // Throw away updates if paused
          return;
        }

        // Filter incoming updates by enabled tags to throw away deselected ones, abort update if none left
        data = tagFilter(data);
        if(data.length <= 0) {
          return;
        }

        var temp = data.reverse().concat(imagesService.images);

        statsService.update(data.length);

        // Limit the number of pictures shown
        if(temp.length > 100) {
          temp.length = 100;
        }

        imagesService.images = temp;
      });

      return imagesService;
    });
}());