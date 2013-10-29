define(
  [
    'jquery',
    'underscore',
    'selection-cache',
    'tools/cursor',
    'tooltipsy',
    'paper'
  ],
  function($, _, _$, Cursor) {

    function App() {
      'use strict';
      var app = this,
          opts = {tools:[]};

      // Class variables
      var project = null;

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
          var tool = _.find(opts.tools, function (tool) { return tool.name === toolName; });
          if(tool) switchToTool(tool);

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

        project.tool.onKeyDown = function (e) {

          if (_.isFunction(hotkeys[e.key])) {
            (hotkeys[e.key])(e);
            _$(window).mousemove();
          }

        };
      };

      var switchToTool = function (tool) {
        Cursor.update(tool, app.penline);

        // Select toolbar item
        $('#toolbar .icon.current').removeClass('current');
        _$('#toolbar').find('.icon[data-tool="' + tool.name + '"]').addClass('current');
      };

      /** function initCanvas
       * Start up Paper JS so we're ready to render/draw things
       */
      var initCanvas = function(f) {
        project = (new paper.PaperScope());
        project.setup(_$('#canvas')[0]);
        project.tool = new paper.Tool();

        // Callback
        f();
      };

      /** function initTools
       * Lets match the actions of each tool to corresponding procedures
       */
      function initTools() {

        initPenline();

        project.tool.onMouseDown = function (e) {
          resetPenline();
          Cursor.onMouseDown(e, app.penline);
        };

        project.tool.onMouseMove = function (e) {
          Cursor.onMouseMove(e, app.penline);
        };

        project.tool.onMouseDrag = function (e) {
          Cursor.onMouseDrag(e, app.penline);
        };

        project.tool.onMouseUp = function (e) {
          Cursor.onMouseUp(e, app.penline);
        };

        app.deleteKeypress = function () {
          if(app.penline.focus_point) {
            app.penline.focus_point.remove();
            app.penline.focus_point = null;
          }
        };
      }

      /** fuction initShapes
       */

      /** function initPenline
       * Prep the penline variables
       */
      function initPenline() {
        app.penline = {
          path: new project.Path(),
          guideline: new project.Path(),
          active: false,
          active_handle: null,
          moving: null,
          focus_point: null,
          focus_end: null
        };

        app.penline.path.style = {
          strokeWidth: 2,
          strokeColor: 'black'
        };

        app.penline.guideline.style = {
          strokeWidth: 1,
          strokeColor: '#009DEC'
        }

        app.penline.guideline.add(new project.Point(0, 0));
        app.penline.guideline.add(new project.Point(0, 0));
        app.penline.guideline.visible =  false;
      }

      /** function resetPenline
       * Ensure new lines are ready to go
       */
      function resetPenline() {
        app.penline.active_handle = null;
        app.penline.moving = null;
        app.penline.post_inserted = null;
      }

      // Return the correct functions for external interaction
      return {
        init: initialize,
        switchToTool: switchToTool
      }

    };

    return new App();
  }
);