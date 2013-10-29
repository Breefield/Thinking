define(
  [
    'underscore', 
    'selection-cache'
  ],

  function(_, _$) {

    function Cursor() {
      var cursor = this;
      // Seed with function that will be called upon initial update
      var current = {deactivate: function() {}};
      var modifier = false;

      this.update = function(update, shape) {
        // If the cursor is new, lets change it
        if(current != update) {

          // Ensure deactivate callback is fired
          current.deactivate(shape);

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
    }
  
    return new Cursor();
  }
);