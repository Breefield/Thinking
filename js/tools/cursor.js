define(
  [
    'libs/underscore-min', 
    'libs/selection-cache.min'
  ],

  function($, _, _$) {

    var Cursor = new (function() {
      var cursor = this;
      var current = {};
      var modifier = false;

      this.update = function(update) {
        // If the cursor is new, lets change it
        if(current != update) {
          current = update;
          _$('body').css({'cursor': "url('img/cursors/" + update.name + ".png'), default"});
        }
      }

      this.updateModifier = function(update) {
        // Default is false
        var update = update || false;

        // If the modifier is new, lets change it
        if(modifier != update) {
          modifier = update;

          // If there is no modifier, don't show
          var set_modifier = update != false ? '-' + update : '';
          _$('body').css({'cursor': "url('img/cursors/" + current.name + set_modifier + ".png'), default"});
        }
      }

      this.is = function (cursor) {
        return current === cursor;
      }

      // Bind all events
      _.each(['onMouseDown', 'onMouseMove', 'onMouseUp', 'onMouseDrag'], function (ev) {
        cursor[ev] = function () {
          current[ev].apply(this, arguments);
        }
      });

      return cursor;
    })();
  
    return Cursor;
  }
);