(function() {
  'use strict';

  /**
   * Wrap the socket.io functionality in a service for convenience
   */
  angular.module('app.services.socketService', [])
    .factory('socketService', function($rootScope) {
      // Address provided by server on global config object
      var socket = io.connect('http://' + ingular.appHost);

      return {
        on: function(eventName, callback) {
          socket.on(eventName, function() {
            var args = arguments;
            $rootScope.$apply(function() {
              callback.apply(socket, args);
            });
          });
        },

        emit: function(eventName, data, callback) {
          socket.emit(eventName, data, function() {
            var args = arguments;
            $rootScope.apply(function() {
              if(callback) {
                callback.apply(args);
              }
            });
          });
        }
      };
    });
})();