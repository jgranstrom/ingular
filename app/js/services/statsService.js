(function() {
  'use strict';

  /**
   * Keep some statistics of the stream in this service and update with interval
   */
  angular.module('app.services.statsService', [])
    .factory('statsService', function($rootScope) {
      var statsService = {};

      /**
       * Internal update variables
       */
      var lastImagePerSecond = 0,
        lastUpdateTime = null,
        targetImagesSeen = 0,
        targetIps = 0,
        ipsSpeed = 0;

      /**
       * API
       */
      statsService.timeSeries = new TimeSeries();
      statsService.imagesSeen = 0;
      statsService.ipsToDisplay = 0;

      /**
       * Update statistics with the incoming data count
       */
      statsService.update = function(dataCount) {
        var currentTime = new Date();
        if(lastUpdateTime) {
          var passedTime = currentTime - lastUpdateTime;
          var currentIps = (dataCount / passedTime) * 1000;
          var meanIps = lastImagePerSecond > 0 ? (currentIps + lastImagePerSecond) / 2 : currentIps;

          ipsSpeed = meanIps - targetIps;
          targetIps = meanIps;
        }
        lastUpdateTime = currentTime;

        targetImagesSeen += dataCount;
      };

      /**
       * Internal update interval
       */
      setInterval(function() {
        $rootScope.$apply(function() {
          if(lastUpdateTime && new Date() - lastUpdateTime > 15000) {
            // If no update in a while, reset meters
            targetIps = 0;
            ipsSpeed = -statsService.ipsToDisplay;
          }

          // Update iamges seen
          if(statsService.imagesSeen < targetImagesSeen) {
            var imSeen = statsService.imagesSeen + Math.ceil((targetImagesSeen - statsService.imagesSeen) / 3);
            if(imSeen > targetImagesSeen) {
              imSeen = targetImagesSeen;
            }
            statsService.imagesSeen = imSeen;
          }

          // Update ips to display
          statsService.ipsToDisplay += 0.1 * ipsSpeed;

          if((ipsSpeed > 0 && statsService.ipsToDisplay >= targetIps) || (ipsSpeed < 0 && statsService.ipsToDisplay <= targetIps)) {
            statsService.ipsToDisplay = targetIps;
            ipsSpeed = 0;
          }

          // Add to time series
          statsService.timeSeries.append(new Date().getTime(), statsService.ipsToDisplay);
        });
      }, 100);

      return statsService;
    });
}());