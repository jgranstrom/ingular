(function() {
  'use strict';

  /**
   * Tag service for adding and removing tags and emitting socket.io events
   */
  angular.module('app.services.tagService', [
      'app.services.socketService'
    ])
    .factory('tagService', function(socketService) {
      var maxTags = 10;
      var tags = [];
      // tagMap is an index caching object for performance
      var tagMap = {};

      return {
        tags: tags,
        maxTags: maxTags,
        tagMap: tagMap,

        addTag: function(tagToAdd) {
          tagToAdd = tagToAdd.toLowerCase();
          if(tagToAdd.indexOf('#') === 0) {
            tagToAdd = tagToAdd.substr(1);
          }

          if(tagToAdd && tagToAdd.length > 0 && !tagMap[tagToAdd] && tags.length <= maxTags) {
            tags.push({
              tag: tagToAdd,
              enabled: true
            });
            tagMap[tagToAdd] = { index: tags.length - 1 }; // Set tagMap of tag to index of tag in array

            socketService.emit('addTag', tagToAdd);

            return true;
          }

          return false;
        },

        removeTag: function(tagToRemove) {
          var mapValue = tagMap[tagToRemove];

          if(mapValue) {
            tags.splice(mapValue.index, 1);
            // Update tagMap for all succeeding tags in array to compensate for removal
            for(var j = mapValue.index; j < tags.length; j++) {
              tagMap[tags[j].tag].index--;
            }

            delete tagMap[tagToRemove];

            socketService.emit('removeTag', tagToRemove);

            return true;
          }

          return false;
        },

        isTagEnabled: function(tag) {
          var mapped = tagMap[tag];
          return mapped && tags[mapped.index].enabled;
        }
      };
    });
})();