define(
  [
    'tools/tools', 
    'tools/tool', 
    'tools/cursor'
  ],
  function(Tools, Tool, Cursor) {

    var penTool = new Tool({
      name: 'pen',
      hotkey: 'p',

      onMouseDown: function(e, shape) {
        // Alter existing point
        var clickPoint = Tools.hitSegment.apply(this, arguments);
        var clickEnd = Tools.hitEnd.apply(this, arguments);

        if(clickEnd || clickPoint) {
          // Close the path
          if(clickEnd && clickEnd.segment.index == 0 && shape.path.segments.length > 1) {
            shape.path.closed = true;
            clickEnd.segment.skip_remove = true;

          // Divide the segment
          } else {
            shape.focus_point = clickPoint.segment;

            if(Tools.handlesAreUsed(clickPoint.segment)) {
              shape.focus_point.skip_remove = true;
              shape.focus_point.divided = true;
              // Reset handles, only handleOut if end
              Tools.resetHandles(clickPoint.segment, clickEnd);
              Cursor.updateModifier('subtract');
            } else {
              shape.focus_point.skip_remove = false;
              shape.focus_point.divided = false;
              shape.active_handle = 'handle-out';
              Cursor.updateModifier();
            }
          }

        } else {
          var clickStroke = Tools.hitStroke.apply(this, arguments);
          // Add new point inside segment
          if(clickStroke) {
            var inserted = shape.path.insert(clickStroke.location.index + 1, e.point.clone());
            shape.focus_point = inserted;
            shape.active_handle = 'handle-out';
            // Remember not to remove this point as soon as we've added it
            shape.focus_point.skip_remove = true;

          // Add new point to end line
          } else {
            shape.path.add(e.point);
            shape.focus_point = shape.path.lastSegment;
            Tools.showCloseHandles(shape.path, shape.focus_point);
          }
        }
      },

      onMouseUp: function(e, shape) {
        var clickPoint = shape.path.hitTest(e.point, {segments: true, tolerance: 100});

        if(clickPoint) {
          if(!Tools.handlesAreUsed(clickPoint.segment)) {
            if(shape.path.lastSegment.index != clickPoint.segment.index) {
              if(clickPoint.segment.skip_remove) {
                clickPoint.segment.skip_remove = false;
              } else {
                clickPoint.segment.remove();
                Cursor.updateModifier('add');
              }
            }
          }
        }
      },
      
      onMouseMove: function(e, shape) {
        // If no points in path, add an anchor
        if(shape.path.segments.length == 0) {
          Cursor.updateModifier('anchor');

        // Otherwise
        } else {

          // End hitTest
          var hoverEnd = shape.path.hitTest(e.point, {ends: true, tolerance: 100});

          if(hoverEnd && hoverEnd.segment.index == 0 && shape.path.segments.length > 1) {
            Cursor.updateModifier('join');

          } else {
            // Hovering over a point we can divide
            var hoverPoint = shape.path.hitTest(e.point, {segments: true, tolerance: 100});
            if(hoverPoint) {
              if(Tools.handlesAreUsed(hoverPoint.segment)) {
                Cursor.updateModifier('divide');
              } else {
                Cursor.updateModifier('subtract');
              }

            } else {
              // Stroke hitTest
              try {
                var hoverStroke = shape.path.hitTest(e.point, {stroke: true, tolerance: 5});
                if(hoverStroke) {
                  Cursor.updateModifier('add');
                } else {
                  Cursor.updateModifier();
                }
              // Bug in paper.js, need to catch here :/
              } catch(err) {}
            }
          }
        }
      },
      
      onMouseDrag: function(e, shape) {
        // If a handle is set, make the altercation
        if(shape.active_handle) {
          Tools.alterHandles(e, shape.focus_point, shape.active_handle);
          Tools.showCloseHandles(shape.path, shape.focus_point);
          Cursor.updateModifier();

        // If no handle set, do that
        } else {
          shape.focus_point.divided = false;
          shape.active_handle = 'handle-out';
        }
      }
    });

    return penTool;

  }
);