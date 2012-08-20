
var pt = (function() {

  var onMouseDown = function(e, object) {
    // Alter existing point
    var clickPoint = object.path.hitTest(e.point, {segments: true, tolerance: 100});
    var clickEnd = object.path.hitTest(e.point, {ends: true, tolerance: 100});

    if(clickEnd || clickPoint) {
      // Close the path
      if(clickEnd && clickEnd.segment.index == 0 && object.path.segments.length > 1) {
        object.path.closed = true;
        clickEnd.segment.skip_remove = true;

      // Divide the segment
      } else {
        object.focus_point = clickPoint.segment;

        if(Tools.handlesAreUsed(clickPoint.segment)) {
          object.focus_point.skip_remove = true;
          object.focus_point.divided = true;
          // Reset handles, only out if end
          Tools.resetHandles(clickPoint.segment, clickEnd);
          Cursor.updateModifier('subtract');
        } else {
          object.focus_point.skip_remove = false;
          object.focus_point.divided = false;
          object.active_handle = 'handle-out';
          Cursor.updateModifier();
        }
      }

    } else {
      var clickStroke = object.path.hitTest(e.point, {stroke: true, tolerance: 5});
      // Add new point inside segment
      if(clickStroke) {
        var inserted = object.path.insert(clickStroke.location.index + 1, e.point.clone());
        object.focus_point = inserted;
        object.active_handle = 'handle-out';
        object.focus_point.skip_remove = false;

      // Add new point to end line
      } else {
        object.path.add(e.point);
        object.focus_point = object.path.lastSegment;
        Tools.showCloseHandles(object.path, object.focus_point);
      }
    }
  }

  var onMouseUp = function(e, object) {
    var clickPoint = object.path.hitTest(e.point, {segments: true, tolerance: 100});

    if(clickPoint) {
      if(!Tools.handlesAreUsed(clickPoint.segment)) {
        if(object.path.lastSegment.index != clickPoint.segment.index) {
          if(clickPoint.segment.skip_remove) {
            clickPoint.segment.skip_remove = false;
          } else {
            clickPoint.segment.remove();
            Cursor.updateModifier('add');
          }
        }
      }
    }
  }

  var onMouseMove = function(e, object) {
    // If no points in path, add an anchor
    if(object.path.segments.length == 0) {
      Cursor.updateModifier('anchor');

    // Otherwise
    } else {

      // End hitTest
      var hoverEnd = object.path.hitTest(e.point, {ends: true, tolerance: 100});

      if(hoverEnd && hoverEnd.segment.index == 0 && object.path.segments.length > 1) {
        Cursor.updateModifier('join');

      } else {
        // Hovering over a point we can divide
        var hoverPoint = object.path.hitTest(e.point, {segments: true, tolerance: 100});
        if(hoverPoint) {
          if(Tools.handlesAreUsed(hoverPoint.segment)) {
            Cursor.updateModifier('divide');
          } else {
            Cursor.updateModifier('subtract');
          }

        } else {
          // Stroke hitTest
          var hoverStroke = object.path.hitTest(e.point, {stroke: true, tolerance: 5});
          if(hoverStroke) {
            Cursor.updateModifier('add');
          } else {
            Cursor.updateModifier();
          }
        }
      }
    }
  }

  var onMouseDrag = function(e, object) {
    // If a handle is set, make the altercation
    if(object.active_handle) {
      Tools.alterHandles(e, object.focus_point, object.active_handle);
      Tools.showCloseHandles(object.path, object.focus_point);
      Cursor.updateModifier();

    // If no handle set, do that
    } else {
      object.focus_point.divided = false;
      object.active_handle = 'handle-out';
    }
  }

  return {
    onMouseDown: onMouseDown,
    onMouseUp: onMouseUp,
    onMouseMove: onMouseMove,
    onMouseDrag: onMouseDrag
  }

})();

var penTool = new Tool({
  name: 'pen',
  hotkey: 'p',
  init: function () {},
  onMouseDown: pt.onMouseDown,
  onMouseUp: pt.onMouseUp,
  onMouseMove: pt.onMouseMove,
  onMouseDrag: pt.onMouseDrag
});
