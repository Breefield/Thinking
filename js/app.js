/** App Module
 */
var App = (function() {

  // Class variables
  this.canvas = null;

  this.initialize = function() {
    initToolbar();

    initCanvas(function() {
      initKeyCommands();
      initTools();
    });
  }

  /** function initToolbar
   * Ensure all items in the toolbar are set up to function
   */
  this.initToolbar = function() {
    var that = this;

    // Tooltips
    _$('.keytip').tooltipsy({
      delay: 2250,
      offset: [10, 10],
      alignTo: 'cursor'
    });

    _$('#toolbar .icon').on('click', function() {
      $el = $(this);
      switchToTool($el.attr('data-tool'));
    });
  }

  /** function initHotkeys
   * Watch all keystrokes on the window and select the correct tool
   * or alter the current drawing 
   */
  this.initKeyCommands = function() {
    var that = this;

    // Lets hook keycodes up to actions
    var hotkeys = {
      'v': function() { switchToTool('default'); },
      'a': function() { switchToTool('handle'); },
      'p': function() { switchToTool('pen'); }
    }

    that.canvas.tool.onKeyDown = function(e) {
      if(e.key == 'backspace') {
        that.deleteKeypress();
        return false;
      }

      // Check every hotkey
      $.each(hotkeys, function(i, f) {
        if(e.key == i) {
          f();
          _$(window).mousemove();
        }
      });
    }
  }

  this.switchToTool = function(tool) {
    Cursor.update(tool);

    // Select toolbar item
    $('#toolbar .icon.current').removeClass('current');
    _$('#toolbar').find('.icon[data-tool="' + tool + '"]').addClass('current');
  }

  /** function initCanvas
   * Start up Paper JS so we're ready to render/draw things
   */
  this.initCanvas = function(f) {
    this.canvas = new paper.PaperScope();
    this.canvas.setup(_$('#canvas')[0]);
    this.canvas.tool = new paper.Tool();

    // Callback
    f();
  }

  /** function initTools
   * Lets match the actions of each tool to corresponding procedures
   */
  function initTools() {
    var that = this;
    switchToTool('pen');

    initGuideline();
    initPenline();

    that.canvas.tool.onMouseDown = function(e) {
      resetPenline();

      // Click with Default
      if(Cursor.is('default')) {
        defaultTool.onMouseDown(e, that.penline);

      // Click with Pen Tool
      } else if(Cursor.is('pen')) {
        penTool.onMouseDown(e, that.penline);

      // Click with Handle
      } else if(Cursor.is('handle')) {
        handleTool.onMouseDown(e, that.penline);

      }
    }

    that.canvas.tool.onMouseMove = function(e) {
      updateGuideline(e);

      // Move with Default
      if(Cursor.is('default')) {
        defaultTool.onMouseMove(e, that.penline);

      // Move with pen
      } else if(Cursor.is('pen')) {
        penTool.onMouseMove(e, that.penline);

      // Move with handle
      } else if(Cursor.is('handle')) {
        handleTool.onMouseMove(e, that.penline);
      }
    }

    that.canvas.tool.onMouseDrag = function(e) {

      // Drag with Default
      if(Cursor.is('default')) {
        defaultTool.onMouseDrag(e, that.penline);

      // Drag with Pen
      } else if(Cursor.is('pen')) {
        penTool.onMouseDrag(e, that.penline);

      // Drag with Handle
      } else if(Cursor.is('handle')) {
        handleTool.onMouseDrag(e, that.penline);

      }
    }

    that.canvas.tool.onMouseUp = function(e) {
      if(Cursor.is('handle')) {
        handleTool.onMouseUp(e, that.penline);
      
      } else if(Cursor.is('pen')) {
        penTool.onMouseUp(e, that.penline);

      }
    }

    that.deleteKeypress = function() {
      if(that.penline.focus_point) {
        that.penline.focus_point.remove();
      }
    }
  }

  /** function initPenline
   * Prep the penline variables
   */
  function initPenline() {
    var that = this;
    that.penline = {
      path: new that.canvas.Path(),
      active: true,
      active_handle: null,
      moving: null,
      focus_point: null
    }
    that.penline.path.style = {
      strokeWidth: 2,
      strokeColor: 'black'
    }
  }

  /** function resetPenline
   * Ensure new lines are ready to go
   */
  function resetPenline() {
    this.penline.active_handle = null;
    this.penline.moving = null;
    this.penline.focus_point = null;
  }

  /** function initFutureLine
   * Prep the guideline variables
   */
  function initGuideline() {
    var that = this
    that.guideline = new that.canvas.Path();
    that.guideline.style = {
      strokeWidth: 0.5,
      strokeColor: '#009DEC'
    }
    that.guideline.visible = false;
  }

  function updateGuideline() {
    //that.guideline.moveTo();
  }

  // Return the correct functions for external interaction
  return {
    init: initialize
  }

})();