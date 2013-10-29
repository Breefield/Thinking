define(
  [
    'tools/tools', 
    'tools/tool', 
    'tools/cursor'
  ],
  function(Tools, Tool, Cursor) {

    var handleTool = function() {
      var tool = this;
      var mode = hoverStroke = hoverPoint = hoverHandle = null;

      var pub = {
        name: 'handle',
        hotkey: 'a'
      }
      
      pub.onMouseDown = function(e, shape) {
        // Stroke hitTest
        var clickStroke = Tools.hitStroke(e, shape);
        var clickHandles = Tools.hitHandles(e, shape);
        if(clickStroke || clickHandles) {
          Tools.activatePath(shape);
        } else {
          Tools.deactivatePath(shape);
          shape.focus_end = null;
        }

        // Handles hitTest
        if(clickHandles) {
          shape.active = true;
          shape.focus_point = clickHandles.segment;
          shape.active_handle = clickHandles.type;
        }

        // Points hitTest
        var clickPoint = Tools.hitSegment(e, shape);
        if(clickPoint) {
          shape.active = true;
          shape.focus_point = clickPoint.segment;
          shape.moving = true;
          Tools.showCloseHandles(shape, shape.focus_point);

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
      },

      pub.onMouseMove = function(e, shape) {
        // Instance var hoverStroke
        hoverStroke = Tools.hitStroke(e, shape);

        // If we're hovering over the path and not already activated
        if(hoverStroke && !shape.active) {
          tool.mode = 'activate';

          Tools.selectAllPoints(shape);
        } else if(!shape.active) {
          tool.mode = 'inactive';

          Tools.deselectAllPoints(shape);
        }
        
        // Check for hover handles, instances vars being set
        hoverHandle = Tools.hitHandles(e, shape);
        hoverPoint = Tools.hitSegment(e, shape);
        
        if(hoverPoint) {
          tool.mode = 'drag-point';
          Cursor.updateModifier('drag');

        } else if(hoverHandle) {
          tool.mode = 'drag-handle';
          Cursor.updateModifier('drag');

        } else {
          tool.mode = null;
          Cursor.updateModifier();
        }
      },

      pub.onMouseDrag = function(e, shape) {
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

      pub.onMouseUp = function(e, shape) {
        // Point handle is active
        if(shape.active_handle) {
          // Divide the point
          if(e.modifiers.option) shape.focus_point.divided = true;
        }
      }

      return pub;
    }

    return new Tool(new handleTool());

  }
);