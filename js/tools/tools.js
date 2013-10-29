define(
  ['jquery'],
  function($) {

    var Tools = {
      showCloseHandles: function(shape, point) {
        this.deselectAllPoints(shape);
        point.selected = true;

        var before = shape.path.segments[point.index - 1];
        if(before != undefined) before.selected = true;
        var after = shape.path.segments[point.index + 1];
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

      activatePath: function(shape) {
        if(shape.active) return false;
        this.selectAllPoints(shape);
        shape.active = true;
      },

      deactivatePath: function(shape) {
        if(!shape.active) return false;
        this.deselectAllPoints(shape);
        shape.active = false;
      },

      deselectAllPoints: function(shape) {
        shape.selected = false;
        shape.path.fullySelected = false;
        $.each(shape.path.segments, function(i, p) { p.point.selected = false; });
      },

      selectAllPoints: function(shape) {
        this.deselectAllPoints(shape);
        shape.path.selected = true;
      },

      hitSegment: function(e, shape) {
        try {
          return shape.path.hitTest(e.point, {segments: true, tolerance: 100});
        } catch(er) { 
          return false; 
        }
      },

      hitEnd: function(e, shape) {
        try {
          return shape.path.hitTest(e.point, {ends: true, tolerance: 100});
        } catch(er) { 
          return false; 
        }
      },

      hitStroke: function(e, shape) {
        try {
          return shape.path.hitTest(e.point, {stroke: true, tolerance: 5});
        } catch(er) { 
          console.log(er.message);
          return false; 
        }
      },

      hitHandles: function(e, shape) {
        try {
          return shape.path.hitTest(e.point, {handles: true, tolerance: 40});
        } catch(er) { 
          return false; 
        }
      },

      empty: function(shape) {
        return shape.path.segments.length == 0;
      },

      longerThanOne: function(shape) {
        return shape.path.segments.length > 1;
      },

      isOppositeFocusedEnd: function(end, shape) {
                // Points aren't the same point
        return  end.segment.index != shape.focus_end.index &&
                // Points are opposite one another
                ((end.segment.index == 0 && shape.focus_end.index == shape.path.segments.length - 1) || 
                (shape.focus_end.index == 0 && end.segment.index == shape.path.segments.length - 1));
      },

      isStartSegment: function(end, shape) {
        return end.index == 0 && shape.path.segments.length > 1;
      },

      isEndSegment: function(end, shape) {
        return end.index == shape.path.segments.length - 1;
      }
    }

    return Tools;

  }
);