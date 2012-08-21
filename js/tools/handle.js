define(
  [
    'tools/tools', 
    'tools/tool', 
    'tools/cursor'
  ],
  function(Tools, Tool, Cursor) {

    var handleTool = new Tool({
      name: 'handle',
      hotkey: 'a',
      init: function () {},
      onMouseDown: function(e, shape) {
        // Stroke hitTest
        shape.active = shape.path.hitTest(e.point, {stroke: true, tolerance: 5});;

        // Handles hitTest
        var clickHandles = shape.path.hitTest(e.point, {handles: true, tolerance: 40});
        if(clickHandles) {
          shape.active = true;
          shape.focus_point = clickHandles.segment;
          shape.active_handle = clickHandles.type;
        }

        // Points hitTest
        var clickPoint = shape.path.hitTest(e.point, {segments: true, tolerance: 100});
        if(clickPoint) {
          shape.active = true;
          shape.focus_point = clickPoint.segment;
          shape.moving = true;
          Tools.showCloseHandles(shape.path, shape.focus_point);

          if(e.modifiers.option) {
            // No handles used
            if(!Tools.isHandleUsed(shape.focus_point.handleOut)) {
              shape.active_handle = 'handle-out';
              shape.focus_point.divided = true;

            // Handle out set
            } else if(!Tools.isHandleUsed(shape.focus_point.handleIn)) {
              shape.active_handle = 'handle-in';
              shape.focus_point.divided = true;

            // Both handles set
            } else {
              shape.active_handle = null;
            }

          // Option not held
          } else {
            shape.active_handle = null;
          }
        }

        shape.path.selected = shape.active ? true : false;
      },

      onMouseMove: function(e, shape) {
        var hoverStroke = shape.path.hitTest(e.point, {stroke: true, tolerance: 5});
            
        // If we're hovering over the path and not already activated
        if(hoverStroke && !shape.active) Tools.activatePath(shape);
        
        // Check for hover hanles
        var hoverHandles = shape.path.hitTest(e.point, {handles: true, tolerance: 40});
        var hoverPoint = shape.path.hitTest(e.point, {segments: true, tolerance: 100});
        
        if(hoverPoint || hoverHandles) {
          Cursor.updateModifier('drag');
        } else {
          Cursor.updateModifier();
        }
      },

      onMouseDrag: function(e, shape) {
        // Point handle is active
        if(shape.active_handle) {
          // Divide the point
          shape.focus_point.preview_divided = e.modifiers.option;

          // Update the handles
          Tools.alterHandles(e, shape.focus_point, shape.active_handle, true);

        // We're moving a point
        } else if(shape.moving) {
          shape.focus_point.point.x += e.delta.x;
          shape.focus_point.point.y += e.delta.y;

        // Whole line active
        } else if(shape.active) {
          shape.path.position.x += e.delta.x;
          shape.path.position.y += e.delta.y;
        }
      },

      onMouseUp: function(e, shape) {
        // Point handle is active
        if(shape.active_handle) {
          // Divide the point
          if(e.modifiers.option) shape.focus_point.divided = true;
        }
      }
    });

    return handleTool;

  }
);