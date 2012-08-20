/** App Module
 */

var App = new (function (global) {
  'use strict';
  var app = this,
      opts = {tools:[]};

  // Class variables
  var canvas = null;

  var initialize = function (o) {
    _.extend(opts, o);
    initToolbar();

    initCanvas(function () {
      initKeyCommands();
      initTools();
    });
  }

  /** function initToolbar
   * Ensure all items in the toolbar are set up to function
   */
  var initToolbar = function () {

    // Tooltips
    _$('.keytip').tooltipsy({
      delay: 2250,
      offset: [10, 10],
      alignTo: 'cursor'
    });

    _$('#toolbar .icon').on('click', function () {
      var $el = $(this);
      var toolName = $el.data('tool');
      var tool = _.find(opts.tools, function (tool) {
        return tool.name === toolName;
      });
      if (tool) {
        switchToTool(tool);
      }

    });
  };

  /** function initHotkeys
   * Watch all keystrokes on the window and select the correct tool
   * or alter the current drawing
   */
  var initKeyCommands = function () {

    // Lets hook keycodes up to actions
    var hotkeys = {
      'backspace': function (e) { e.preventDefault(); app.deleteKeypress(); }
    };

    _.each(opts.tools, function (tool) {
        hotkeys[tool.hotkey] = _.bind(switchToTool, app, tool);
    });

    app.canvas.tool.onKeyDown = function (e) {

      if (_.isFunction(hotkeys[e.key])) {
        (hotkeys[e.key])();
        _$(window).mousemove();
      }

    };
  };

  var switchToTool = function (tool) {
    Cursor.update(tool);

    // Select toolbar item
    $('#toolbar .icon.current').removeClass('current');
    _$('#toolbar').find('.icon[data-tool="' + tool.name + '"]').addClass('current');
  };

  /** function initCanvas
   * Start up Paper JS so we're ready to render/draw things
   */
  var initCanvas = function(f) {
    app.canvas = (new paper.PaperScope());
    app.canvas.setup(_$('#canvas')[0]);
    app.canvas.tool = new paper.Tool();

    // Callback
    f();
  };

  /** function initTools
   * Lets match the actions of each tool to corresponding procedures
   */
  function initTools() {
    switchToTool(penTool);

    initGuideline();
    initPenline();

    app.canvas.tool.onMouseDown = function (e) {
      resetPenline();
      Cursor.onMouseDown(e, app.penline);
    };

    app.canvas.tool.onMouseMove = function (e) {
      updateGuideline(e);
      Cursor.onMouseMove(e, app.penline);
    };

    app.canvas.tool.onMouseDrag = function (e) {
      Cursor.onMouseDrag(e, app.penline);
    };

    app.canvas.tool.onMouseUp = function (e) {
      Cursor.onMouseUp(e, app.penline);
    };

    app.deleteKeypress = function () {
      if(that.penline.focus_point) {
        that.penline.focus_point.remove();
      }
    };
  }

  /** function initPenline
   * Prep the penline variables
   */
  function initPenline() {
    app.penline = {
      path: new app.canvas.Path(),
      active: true,
      active_handle: null,
      moving: null,
      focus_point: null
    };
    app.penline.path.style = {
      strokeWidth: 2,
      strokeColor: 'black'
    };
  }

  /** function resetPenline
   * Ensure new lines are ready to go
   */
  function resetPenline() {
    app.penline.active_handle = null;
    app.penline.moving = null;
    app.penline.focus_point = null;
  }

  /** function initFutureLine
   * Prep the guideline variables
   */
  function initGuideline() {
    app.guideline = new app.canvas.Path();
    app.guideline.style = {
      strokeWidth: 0.5,
      strokeColor: '#009DEC'
    }
    app.guideline.visible = false;
  }

  function updateGuideline() {
    //that.guideline.moveTo();
  }

  // Return the correct functions for external interaction
  return {
    init: initialize
  }

})();