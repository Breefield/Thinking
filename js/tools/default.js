define(
  [
    'tools/tools', 
    'tools/tool', 
    'tools/cursor'
  ],
  function(Tools, Tool, Cursor) {

    var defaultTool = function() {
      var tool = this;

      // Expose publicly
      var pub = {
        name: 'default',
        hotkey: 'v'
      }

      pub.onMouseDown = function(e, shape) {
        var hitStroke = Tools.hitStroke(e, shape);

        if(hitStroke) {
          Tools.activatePath(shape);
        } else {
          Tools.deactivatePath(shape);
          shape.focus_end = null;
        }
      }

      pub.onMouseMove = function(e, shape) {
        // Check if line selection should be shown
        var hoverStroke = Tools.hitStroke(e, shape);
        // If we're hovering over the path and not already activated
        if(hoverStroke) {
          Tools.selectAllPoints(shape);
        } else if(!shape.active) {
          Tools.deselectAllPoints(shape);
        }
      }

      pub.onMouseDrag = function(e, shape) {
        // If active, move entire path
        if(shape.active) {
          shape.path.position.x += e.delta.x;
          shape.path.position.y += e.delta.y;
        }
      }

      return pub;
    }

    return new Tool(new defaultTool());
  
  }
);