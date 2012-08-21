define(
  ['underscore'],
  function(_) {

  var Tool = function (props) {
  	var noOp = function (){};
  	_.extend(this, {
      onMouseDown: noOp,
  		onMouseUp: noOp,
  		onMouseDrag: noOp,
  		onMouseMove: noOp
  	});
    
  	_.extend(this, props);
  };

  return Tool;

});