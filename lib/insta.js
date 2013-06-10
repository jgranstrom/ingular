'use strict';

var insta = require('instagram-node-lib'),
  _ = require('underscore'),
  io;

// Keep a collection of active tags
var tags = {},
  callbackRouteUrl = '/insta/callback';

var lastMinId = {},
  pendingUpdate = {},
  waitingForUpdate = {};
function getRecentForTag(tag, callback) {
  // Check if there's an update waiting to respond for the tag
  if(waitingForUpdate[tag]) {
    console.log('Update busy for tag, waiting..');;
    // In that case we wont issue another update, check if the tag i already pending
    if(!pendingUpdate[tag]) {
      console.log('No pending for tag, adding pending for tag', tag);
      // If it's not pending add it as pending
      pendingUpdate[tag] = { callback: callback };
    }

    // Return without issuing an update directly
    return;
  }

  // From here on we are waiting for an update to return for this tag
  waitingForUpdate[tag] = true;
  insta.tags.recent({
    name: tag,
    min_id: lastMinId[tag] || 0,
    complete: function(data, pagination) {
      // Update the ID to get the next set of images next time
      lastMinId[tag] = pagination.min_tag_id || lastMinId[tag];
      callback(data);

      // We are no longer waiting for an update to return
      delete waitingForUpdate[tag];

      console.log('Checking for pending updates..');

      // Check if there's a pending update for the current tag
      if(pendingUpdate[tag]) {
        console.log('Issuing pending update for tag', tag);

        // Issue the update
        getRecentForTag(tag, pendingUpdate[tag].callback);

        // Remove the pending update as we will now issue it
        delete pendingUpdate[tag];
      }
    }
  });
}

function constructUpdateObject(tag, rawObjects) {
  return rawObjects.map(function(obj) {
    return {
      image: obj.images.thumbnail,
      tag: tag,
      link: obj.link,
      user: {
        username: obj.user.username,
        pic: obj.user.profile_picture
      }
    };
  });
}

function handleUpdates(updates) {
  updates.forEach(function(update) {
    // Tag contained within object_id
    var tag = update.object_id;
    getRecentForTag(tag, function(data) {
      io.sockets.in(tag).emit('updates', constructUpdateObject(tag, data));
    });
  });
}

/**
 * Call from update notification receiver to throttle the update request calls somewhat.
 * @type {*}
 */
var updateHandlerThrottledProxy = _.throttle(function(updates) {
  handleUpdates(updates);
}, 800);  // 800 gives a maximum of 1.25 requests per second = 4500 request per hour which gives
          // a 500 request margin to the 5000 requests / hour limit of the instagram API.

function routeApp(app) {
  // Route handshake get requests
  app.get(callbackRouteUrl, function(req, res) {
    insta.subscriptions.handshake(req, res);
  });

  // Route update post requests
  app.post(callbackRouteUrl, function(req, res) {
    res.end();
    console.log('update received');
    // Throttle calls to group rapid updates together
    updateHandlerThrottledProxy(req.body);
  });
}

function subscribeTag(tag) {
  tags[tag] = {
    count: 0,
    subId : null
  };

  insta.tags.subscribe({
    object_id: tag,
    complete: function(data) {
      tags[tag].subId = data.id;

      console.log('Subscribed to tag: ' + tag);

      console.log('Issuing initial update for subscribed tag');
      updateHandlerThrottledProxy([{ object_id: tag }]);
    },
    error: function(msg) {
      console.log('Error subscribing to tag ' + tag + ':\n' + msg);
    }
  });
}

function unsubscribeTag(tag) {
  insta.tags.unsubscribe({
    id: tags[tag].subId,
    complete: function(err) {
      if(err) throw err;

      console.log('Unsubscribed from tag: ' + tag);
    }
  });
  delete tags[tag];
}

exports.init = function(_io, app) {
  console.log('using client_id:', process.env.INSTAG_CLIENT_ID);
  insta.set('client_id', process.env.INSTAG_CLIENT_ID);

  console.log('using client_secret:', process.env.INSTAG_CLIENT_SECRET);
  insta.set('client_secret', process.env.INSTAG_CLIENT_SECRET);
  insta.set('callback_url', 'http://' + app.get('appHost') + callbackRouteUrl);

  io = _io;
  routeApp(app);
};

exports.addClientToTag = function(socket, tag) {
  if(!tag || tag.length <= 0) return;

  tag = tag.toLowerCase(); // Don't handle tags are case sensitive

  socket.tags = socket.tags || {};

  // Limit each client to 10 tags, yeah magic number woho
  // this should be handled on the client side primarily, just some security here to
  // avoid evil doers from blowing stuff up, well.. it's still pretty easy but yeah think positive
  if(Object.keys(socket.tags).length >= 10) {
    // Yup ignore it
    return;
  }

  // Keep track of the tags on the client TODO: Place in session?
  socket.tags[tag] = true;

  if(!tags[tag]) {
    subscribeTag(tag);
  }

  socket.join(tag);

  tags[tag].count++; // Add a client count for the tag

  console.log('Added client', (socket && socket.id) || 'null', 'to tag',  tag);
};

exports.removeClientFromTag = function(socket, tag) {
  if(!tag || tag.length <= 0) return;

  tag = tag.toLowerCase(); // Don't handle tags are case sensitive

  socket.leave(tag);

  // Keep track of the tags on the client TODO: Place in session?
  delete socket.tags[tag];

  if(tags[tag] && --tags[tag].count <= 0) {
    // Last client has left the tag, unsubscribe from it
    if(tags[tag].subId) {
      // Make sure we have received a subId response
      unsubscribeTag(tag);
    } else {
      setTimeout(function() {
        // Otherwise wait a while and check if still no subscribers
        // This is to give time for subscription to return if unsubscribed right away
        if(tags[tag].subId && (!tags[tag] || tags[tag].count <= 0)) {
          unsubscribeTag(tag);
        } else {
          console.warn('Unsubsribe did not get a subId after waiting, may have trailing subscriptions')
        }
      }, 2000);
    }
  }

  console.log('Removed client', (socket && socket.id) || 'null', 'from tag',  tag);
};

exports.removeClient = function(socket) {
  if(socket.tags) {
    Object.keys(socket.tags).forEach(function(tag) {
      if(tag) {
        exports.removeClientFromTag(socket, tag);
      }
    });
  }

  console.log('Removed client', (socket && socket.id) || 'null', 'entirely');
};

exports.unsubscribeAll = function() {
  insta.tags.unsubscribe_all({
    complete: function(err) {
      if(err) throw err;

      console.log('Unsubscribed from all tags.');
    }
  });
};
