var handleTool = (function() {

  var onMouseDown = function(e, object) {
    // Stroke hitTest
    object.active = object.path.hitTest(e.point, {stroke: true, tolerance: 5});;

    // Handles hitTest
    var clickHandles = object.path.hitTest(e.point, {handles: true, tolerance: 40});
    if(clickHandles) {
      object.active = true;
      object.focus_point = clickHandles.segment;
      object.active_handle = clickHandles.type;
    }

    // Points hitTest
    var clickPoint = object.path.hitTest(e.point, {segments: true, tolerance: 100});
    if(clickPoint) {
      object.active = true;
      object.focus_point = clickPoint.segment;
      object.moving = true;
      Tools.showCloseHandles(object.path, object.focus_point);

      if(e.modifiers.option) {
        // No handles used
        if(!Tools.isHandleUsed(object.focus_point.handleOut)) {
          object.active_handle = 'handle-out';
          object.focus_point.divided = true;

        // Handle out set
        } else if(!Tools.isHandleUsed(object.focus_point.handleIn)) {
          object.active_handle = 'handle-in';
          object.focus_point.divided = true;

        // Both handles set
        } else {
          object.active_handle = null;
        }

      // Option not held
      } else {
        object.active_handle = null;
      }
    }

    object.path.selected = object.active ? true : false;
  }

  var onMouseMove = function(e, object) {
    var hoverStroke = object.path.hitTest(e.point, {stroke: true, tolerance: 5});
        
    // If we're hovering over the path and not already activated
    if(hoverStroke && !object.active) Tools.activatePath(object);
    
    // Check for hover hanles
    var hoverHandles = object.path.hitTest(e.point, {handles: true, tolerance: 40});
    var hoverPoint = object.path.hitTest(e.point, {segments: true, tolerance: 100});
    
    if(hoverPoint || hoverHandles) {
      Cursor.updateModifier('drag');
    } else {
      Cursor.updateModifier();
    }
  }

  var onMouseDrag = function(e, object) {
    // Point handle is active
    if(object.active_handle) {
      // Divide the point
      object.focus_point.preview_divided = e.modifiers.option;

      // Update the handles
      Tools.alterHandles(e, object.focus_point, object.active_handle, true);

    // We're moving a point
    } else if(object.moving) {
      object.focus_point.point.x += e.delta.x;
      object.focus_point.point.y += e.delta.y;

    // Whole line active
    } else if(object.active) {
      object.path.position.x += e.delta.x;
      object.path.position.y += e.delta.y;
    }
  }

  var onMouseUp = function(e, object, app) {
    // Point handle is active
    if(object.active_handle) {
      // Divide the point
      if(e.modifiers.option) object.focus_point.divided = true;
    }
  }

  return {
    onMouseDown: onMouseDown,
    onMouseMove: onMouseMove,
    onMouseDrag: onMouseDrag,
    onMouseUp: onMouseUp
  }

})();