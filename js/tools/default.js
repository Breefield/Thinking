var dT = (function() {

  var onMouseDown = function(e, object, app) {
    object.active = object.path.hitTest(e.point, {stroke: true, tolerance: 5});
    object.path.selected = object.active ? true : false;
  }

  var onMouseMove = function(e, object, app) {
    // Check if line selection should be shown
    var hoverStroke = object.path.hitTest(e.point, {stroke: true, tolerance: 5});

    // If we're hovering over the path and not already activated
    if(hoverStroke && !object.active) Tools.activatePath(object);
  }

  var onMouseDrag = function(e, object, app) {
    // If active, move entire path
    if(object.active) {
      object.path.position.x += e.delta.x;
      object.path.position.y += e.delta.y;
    }
  }

  return {
    onMouseDown: onMouseDown,
    onMouseMove: onMouseMove,
    onMouseDrag: onMouseDrag
  }

})();

var defaultTool = new Tool({
  name: 'default',
  hotkey: 'v',
  init: function () {},
  onMouseDown: dT.onMouseDown,
  onMouseUp: dT.onMouseUp,
  onMouseMove: dT.onMouseMove,
  onMouseDrag: dT.onMouseDrag
});