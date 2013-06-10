(function() {
  'use strict';

  /**
   * A service for the actual images stream and controls
   */
  angular.module('app.services.streamService', [
      'app.services.socketService',
      'app.services.tagService',
      'app.filters.tagFilter'
    ])
    .factory('streamService', function($rootScope, socketService, tagService, $filter) {
      var streamService = {};

      var tagFilter = $filter('tagFilter');

      var lastImagePerSecond = 0; // Keep one behind to smooth calculations a bit
      var lastUpdateTime = null;

      streamService.images = [];
      streamService.timeSeries = new TimeSeries();
      streamService.isPaused = false;

      streamService.togglePause = function() {
        streamService.isPaused = !streamService.isPaused;
      };

      var targetImagesSeen = 0;
      streamService.imagesSeen = 0;

      var targetIps = 0;
      var ipsSpeed = 0;
      streamService.ipsToDisplay = 0;

      // Time updater
      setInterval(function() {
        $rootScope.$apply(function() {
          if(lastUpdateTime && new Date() - lastUpdateTime > 15000) {
            // If no update in a while, reset meters
            targetIps = 0;
            ipsSpeed = -streamService.ipsToDisplay;
          }

          // Update iamges seen
          if(streamService.imagesSeen < targetImagesSeen) {
            var imSeen = streamService.imagesSeen + Math.ceil((targetImagesSeen - streamService.imagesSeen) / 3);
            if(imSeen > targetImagesSeen) {
              imSeen = targetImagesSeen;
            }
            streamService.imagesSeen = imSeen;
          }

          // Update ips to display
          streamService.ipsToDisplay += 0.1 * ipsSpeed;

          if((ipsSpeed > 0 && streamService.ipsToDisplay >= targetIps) || (ipsSpeed < 0 && streamService.ipsToDisplay <= targetIps)) {
            streamService.ipsToDisplay = targetIps;
            ipsSpeed = 0;
          }

          // Add to time series
          streamService.timeSeries.append(new Date().getTime(), streamService.ipsToDisplay);
        });
      }, 100);

      socketService.on('updates', function(data) {
        if(streamService.isPaused) {
          // Throw away updates if paused
          return;
        }

        // Filter incoming updates by enabled tags to throw away deselected ones, abort update if none left
        data = tagFilter(data);
        if(data.length <= 0) {
          return;
        }

        var temp = data.reverse().concat(streamService.images);

        var currentTime = new Date();
        if(lastUpdateTime) {
          var passedTime = currentTime - lastUpdateTime;
          var currentIps = (data.length / passedTime) * 1000;
          var meanIps = lastImagePerSecond > 0 ? (currentIps + lastImagePerSecond) / 2 : currentIps;

          ipsSpeed = meanIps - targetIps;
          targetIps = meanIps;
        }
        lastUpdateTime = currentTime;

        targetImagesSeen += data.length;

        // Limit the number of pictures shown
        if(temp.length > 100) {
          temp.length = 100;
        }

        streamService.images = temp;
      });

      return streamService;
    });
})();