define(
  [
    'selection-cache',
    'tools/tools', 
    'tools/tool', 
    'tools/cursor'
  ],
  function(_$, Tools, Tool, Cursor) {

    var penTool = function() {
      var tool = this;
      var mode = hoverPoint = null;

      // Expose publicly
      var pub = {
        name: 'pen',
        hotkey: 'p'
      }

      pub.onMouseDown = function(e, shape) {

        console.log('Mode:', tool.mode);

        // Close the path
        if(tool.mode == 'join') {

          shape.focus_point = tool.hoverPoint;
          shape.focus_end = null;
          shape.path.closed = true;

        // Attach to end, divide end
        } else if(tool.mode == 'attach-divide') {

          shape.focus_point = tool.hoverPoint;
          shape.focus_point.divided = true;
          Tools.resetHandles(shape.focus_point, clickEnd);

        // Divide the segment
        } else if(tool.mode == 'divide') {

          shape.focus_point = tool.hoverPoint; 
          shape.focus_point.divided = true;
          Tools.resetHandles(shape.focus_point);
          shape.active_handle = 'handle-out';
          // Remove after divide
          tool.mode = 'subtract';

        // Divide half an end
        } else if(tool.mode == 'half-divide-end') {

          shape.focus_point = tool.hoverPoint; 
          shape.focus_point.divided = true;
          Tools.resetHandles(shape.focus_point, true);
          shape.active_handle = 'handle-out';

        // Remove the segment, prep for drag-open though
        } else if(tool.mode == 'subtract') {

          // For remove
          shape.focus_point = tool.hoverPoint;
          shape.focus_point.removeOnUp = true;

          // For potential dragging
          shape.focus_point.divided = false;
          shape.active_handle = 'handle-out';
          Cursor.updateModifier();

        // Insert a new point inside a line
        } else if(tool.mode == 'insert') {

          var inserted = shape.path.insert(tool.hoverStroke.location.index + 1, e.point.clone());
          shape.focus_point = inserted;
          shape.active_handle = 'handle-out';

          // Add new point to end line
        } else if(tool.mode == 'add-end' || tool.mode == 'anchor') {

          // Adding to the start
          if(shape.focus_end && Tools.isStartSegment(shape.focus_end, shape)) {
            shape.path.insert(0, e.point.clone());
            shape.focus_point = shape.path.segments[0];
            shape.focus_end = shape.path.segments[0];
          
          // Add to the end, or no end focused
          } else {
            shape.path.add(e.point);
            shape.focus_point = shape.path.lastSegment;
            shape.focus_end = shape.path.lastSegment;
          }

          shape.active_handle = 'handle-out';
          Tools.showCloseHandles(shape, shape.focus_point);
        }
      }

      pub.onMouseUp = function(e, shape) {
        // Focused on a point that should be removed
        if(shape.focus_point && shape.focus_point.removeOnUp) {
          shape.focus_point.remove();
          shape.focus_point = null;
          Cursor.updateModifier('add');
        }
      }

      pub.onMouseDrag = function(e, shape) {
        // If a handle is set begin draggin
        if(shape.active_handle) {
          Tools.alterHandles(e, shape.focus_point, shape.active_handle);
          Tools.showCloseHandles(shape, shape.focus_point);
          shape.focus_point.removeOnUp = false;
          tool.mode = 'dragging';
          Cursor.updateModifier();

        // If no handle set, do that
        } else {
          shape.focus_point.divided = false;
          shape.active_handle = 'handle-out';
        }

        updateGuideline(e, shape);
      }

      pub.onMouseMove = function(e, shape) {
        
        // If shape is empty, or no end is focused
        if(Tools.empty(shape) || !shape.focus_end) {
          // Anchor mode to start the new shape
          tool.mode = 'anchor';
          Cursor.updateModifier(tool.mode);

        // Otherwise
        } else {

          // End hitTest
          var hoverEnd = Tools.hitEnd(e, shape);

          // Hovering over an end, and we have a focus end
          if(hoverEnd && shape.focus_end &&
             // Path is long enough
             Tools.longerThanOne(shape) &&
             // Is the end we're focusing on opposite the focused end
             Tools.isOppositeFocusedEnd(hoverEnd, shape)) {

            tool.mode = 'join';
            tool.hoverPoint = hoverEnd.segment;
            Cursor.updateModifier(tool.mode);

          // Hovering over an end, but no end is focused
          } else if (hoverEnd && !shape.focus_end) {

            tool.mode = 'attach-divide';
            tool.hoverPoint = hoverEnd.segment;
            Cursor.updateModifier('divide');

          // Dividing an end
          } else if(hoverEnd && Tools.handlesAreUsed(hoverEnd.segment)) {

            if(Tools.isStartSegment(hoverEnd.segment, shape)) {
              tool.mode = 'half-divide-start';
              tool.hoverPoint = hoverEnd.segment;
              Cursor.updateModifier('divide');
            
            // Add to the end, or no end focused
            } else {
              tool.mode = 'half-divide-end';
              tool.hoverPoint = hoverEnd.segment;
              Cursor.updateModifier('divide');
            
            }

          // Hovering over a point not an end
          } else {

            // Hovering over a point we can divide
            var hoverPoint = Tools.hitSegment(e, shape);
            if(hoverPoint) {

              // Handles are used, so we can divide
              if(Tools.handlesAreUsed(hoverPoint.segment)) {

                tool.mode = 'divide';
                tool.hoverPoint = hoverPoint.segment;
                Cursor.updateModifier(tool.mode);

              // No handles are used, so the point must be removed
              } else {
                tool.mode = 'subtract';
                tool.hoverPoint = hoverPoint.segment;
                Cursor.updateModifier(tool.mode);
              }

            // Not hovering over an end, or another point
            } else {

              // Hovering over a stroke?
              var hoverStroke = Tools.hitStroke(e, shape);

              // Yes! Add a point
              if(hoverStroke) {
                tool.mode = 'insert';
                tool.hoverStroke = hoverStroke;
                Cursor.updateModifier('add');

              // An end is focused on, append to it
              } else if(shape.focus_end) {
                // Add a point to the focused end
                tool.mode = 'add-end';
                Cursor.updateModifier();
              
              // Catchall
              } else {
                tool.mode = '';
                Cursor.updateModifier();
              }
            }
          }
        }

        updateGuideline(e, shape);
        _$('#current-tool').text(tool.mode);
      }

      var updateGuideline = function(e, shape) {

        // The guideline should only be visible in these two cases
        shape.guideline.visible = tool.mode == 'add-end' || tool.mode == 'join';

        // Make sure there is a shape at all!
        if(shape.guideline.visible && shape.path) {
          shape.guideline.firstSegment.point = shape.path.lastSegment.point.clone();
          // Clone doesn't clone handles, wtf
          shape.guideline.firstSegment.handleOut.x = shape.path.lastSegment.handleOut.x;
          shape.guideline.firstSegment.handleOut.y = shape.path.lastSegment.handleOut.y;

          // To cursor
          if(tool.mode == 'add-end') {
            shape.guideline.lastSegment.point.x = e.point.x;
            shape.guideline.lastSegment.point.y = e.point.y;
          
          // To join
          } else if(tool.mode == 'join') {
            shape.guideline.lastSegment.point.x = tool.hoverPoint.point.x;
            shape.guideline.lastSegment.point.y = tool.hoverPoint.point.y;
          }
        }
      }

      pub.deactivate = function(shape) {
        shape.guideline.visible = false;
      }

      return pub;
    }

    return new Tool(new penTool());

  }
);