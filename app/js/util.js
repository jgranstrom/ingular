(function() {
  'use strict';

  /**
   * Service for utility functions
   */
  angular.module('app.util', [])
    .factory('util', function() {
      return {

        /**
         * Utility function for attaching a scope property to a arbitrary object property using $watch.
         * Typical use is binding specific properties of a service to the ViewModel or $scope.
         *
         * @param scope The scope on which to attach the property.
         * @param obj The object on which watched property resides.
         * @param prop {String|Array} The name of the property to attach or an array of names.
         */
        attach: function(scope, obj, prop) {
          var props = null;
          if(typeof prop === 'string') {
            // If string make array of single element
            props = [prop];
          } else {
            // If not string expect array of strings
            props = prop;
          }

          // Attach each property to the scope
          angular.forEach(props, function(prop) {
            scope.$watch(function() { return obj[prop]; }, function(data) {
              scope[prop] = data;
            });
          });
        }

    };
  });
}());
