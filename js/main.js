requirejs.config({
  paths: {
    'jquery' :          'https://ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min',
    'tooltipsy':        'libs/tooltipsy.min',
    'underscore':       'libs/underscore-min',
    'paper':            'libs/paper',
    'selection-cache':  'libs/selection-cache.min'
  },

  shim: {
    'underscore': { exports: '_' },
    'paper': { exports: 'paper' },
    'tooltipsy': { 
      deps: ['jquery'], 
      exports: 'jQuery.fn.tooltipsy' 
    }
  },
});

require(
  [
    'jquery',
    'app',
    'tools/default',
    'tools/pen',
    'tools/handle'
  ], 
  function($, App, defaultTool, penTool, handleTool) {
    
    $(function() {
      App.init({
        tools: [
          defaultTool,
          penTool,
          handleTool
        ]
      });
      App.switchToTool(penTool);
    });

  }
);