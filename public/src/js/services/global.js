'use strict';

//Global service for global variables
angular.module('insight.system')
  .factory('Global',[
    function() {
      return {};
    }
  ])
  .factory('Version',
    function($resource) {
      return $resource(window.apiPrefix + '/version');
  })
  .service('ScrollService', function($window, $timeout) {
    this.scrollToTop = function() {
      var currentY = $window.pageYOffset;
      var step = Math.abs(currentY / 25);
      
      function scrollStep() {
        if ($window.pageYOffset > 0) {
          $window.scrollTo(0, $window.pageYOffset - step);
          requestAnimationFrame(scrollStep);
        }
      }
      requestAnimationFrame(scrollStep);
    };

    this.scrollToBottom = function() {
      $timeout(function() {
        var element = document.getElementById('footer');
        element.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    };
  });
