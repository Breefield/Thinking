define(
  ['jquery'],
  function($) {

    var Tools = {
      showCloseHandles: function(path, point) {
        this.deselectAllPoints(path);
        point.selected = true;

        var before = path.segments[point.index - 1];
        if(before != undefined) before.selected = true;
        var after = path.segments[point.index + 1];
        if(after != undefined) after.selected = true;
      },

      isHandleUsed: function(handle) {
        return handle.x != 0 && handle.y != 0;
      },

      handlesAreUsed: function(segment) {
        return (segment.handleIn.x != 0 && 
                segment.handleIn.y != 0) ||
               (segment.handleOut.x != 0 && 
                segment.handleOut.y != 0);
      },

      resetHandles: function(segment, only_out) {
        only_out = only_out || false
        if(only_out) {
          segment.handleOut.x = segment.handleOut.y = 0;
        } else {
          segment.handleIn.x = segment.handleIn.y = segment.handleOut.x = segment.handleOut.y = 0;
        }
      },

      alterHandles: function(e, segment, handle, save_opposite_distance) {
        var that = this;
        save_opposite_distance = save_opposite_distance || false;

        var current = handle == 'handle-out' ? segment.handleOut : segment.handleIn;
        var opposite = handle == 'handle-out' ? segment.handleIn : segment.handleOut;

        if(save_opposite_distance) var prev_angle = segment.point.getDirectedAngle(current.clone());

        current.x += e.delta.x;
        current.y += e.delta.y;

        // If the segment is divided don't worry about the other handle
        if(!segment.divided && !segment.preview_divided) {
          if(save_opposite_distance) {
            // FIXME
            // When switching handles around 180 degrees delta is drastic!
            var new_angle = segment.point.getDirectedAngle(current);
            var angle_delta = new_angle - prev_angle;
            opposite.angle = opposite.angle + angle_delta;
            
          } else {
            opposite.x -= e.delta.x;
            opposite.y -= e.delta.y;
          }
        }
      },

      activatePath: function(line) {
        line.active = true;
        this.deselectAllPoints(line.path);
        line.path.selected = true;
      },

      deselectAllPoints: function(path) {
        path.selected = false;
        path.fullySelected = false;
        $.each(path.segments, function(i, p) { p.point.selected = false; });
      },

      hitSegment: function(e, shape) {
        return shape.path.hitTest(e.point, {segments: true, tolerance: 100});
      },

      hitEnd: function(e, shape) {
        return shape.path.hitTest(e.point, {ends: true, tolerance: 100});
      },

      hitStroke: function(e, shape) {
        return shape.path.hitTest(e.point, {stroke: true, tolerance: 5});
      }
    }

    return Tools;

  }
);