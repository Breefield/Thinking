define(
  [
    'tools/tools', 
    'tools/tool', 
    'tools/cursor'
  ],
  function(Tools, Tool, Cursor) {

    var defaultTool = new Tool({
      name: 'default',
      hotkey: 'v',
      init: function () {},
      onMouseDown: function(e, shape) {
        shape.active = shape.path.hitTest(e.point, {stroke: true, tolerance: 5});
        shape.path.selected = shape.active ? true : false;
      },

      onMouseMove: function(e, shape) {
        // Check if line selection should be shown
        var hoverStroke = shape.path.hitTest(e.point, {stroke: true, tolerance: 5});

        // If we're hovering over the path and not already activated
        if(hoverStroke && !shape.active) Tools.activatePath(shape);
      },

      onMouseDrag: function(e, shape) {
        // If active, move entire path
        if(shape.active) {
          shape.path.position.x += e.delta.x;
          shape.path.position.y += e.delta.y;
        }
      }
    });

    return defaultTool;
  
  }
);