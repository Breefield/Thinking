define(
  ['underscore'],
  function(_) {

  var Tool = function (props) {
  	var noOp = function (){};
    // Every tool must have these functions as cursor relies on them
    _.extend(this, {
      onMouseDown: noOp,
      onMouseUp: noOp,
      onMouseDrag: noOp,
      onMouseMove: noOp,
      deactivate: noOp
    });
    
  	_.extend(this, props);
  };

  return Tool;

});