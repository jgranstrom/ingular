(function() {
  'use strict';

  /**
   * A directive for the smoothie chart
   */
  angular.module('app.directives.chart', [
  ]).directive('chart', function($window) {
    return {
      restrict: 'A',
      link: function(scope, elem, attrs) {
        var chart = new SmoothieChart({
          millisPerPixel:59,
          grid: { fillStyle: 'transparent', strokeStyle: 'transparent' },
          labels: { fillStyle: '#333333', fontSize: 12, precision: 1, disabled: true }
        });

        // Add the time series
        chart.addTimeSeries(scope[attrs.timeSeries], { lineWidth: 2, strokeStyle: 'rgba(192,192,192,0.39)' });

        // Stream to the element concerned
        chart.streamTo(document.getElementById(attrs.id), 500);

        // Handle resizing by updating the canvas size
        elem.attr('width', elem.width());
        elem.attr('height', elem.height());
        $(window).on('resize', function() {
          elem.attr('width', elem.width());
          elem.attr('height', elem.height());
        });
      }
    };
  });
}());
