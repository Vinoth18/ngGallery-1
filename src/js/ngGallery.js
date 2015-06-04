'use strict';

angular.module('jkuri.gallery', []).directive('ngGallery', ['$document', '$timeout', '$templateCache', function($document, $timeout, $templateCache) {

	var defaults = { 
		baseClass 	: 'ng-gallery',
		thumbClass 	: 'ng-thumb',
		templateUrl : 'ng-gallery.html'
	};

	var keys_codes = {
		enter : 13,
		esc		: 27,
		left  : 37,
		right : 39
	};

	function setScopeValues(scope, attrs) {
		scope.baseClass = scope.class || defaults.baseClass;
		scope.thumbClass = scope.thumbClass || defaults.thumbClass;
		scope.img = scope.images[0];
	}

	var template_url = defaults.templateUrl;
	// Set the default template
  $templateCache.put(template_url,
  		'<div class="{{ baseClass }}">' +
  		'  <div ng-repeat="i in images">' +
  		'    <img ng-src="{{ i.thumb }}" class="{{ thumbClass }}" ng-click="openGallery($index)" alt="Image {{ $index + 1 }}" />' +
  		'  </div>' +
  		'</div>' +
      '<div class="ng-overlay" ng-show="opened">' +
      '</div>' +
      '<div class="ng-gallery-content" ng-show="opened">' +
      '  <a class="close" ng-click="closeGallery()">x</a>' +
      '  <a class="nav-left" ng-click="prevImage()"><</a>' +
      '  <img ng-src="{{ img.img }}" ng-click="nextImage()" />' +
      '  <a class="nav-right" ng-click="nextImage()">></a>' +
      '  <div class="ng-thumbnails-wrapper">' +
      '    <div class="ng-thumbnails slide-left">' +
      '      <div ng-repeat="i in images">' + 
      '        <img ng-src="{{ i.thumb }}" ng-class="{\'active\': index === $index}" ng-click="changeImage($index)" />' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '</div>'
  );

	return {
		restrict: 'EA',
		scope: {
			images: '='
		},
		templateUrl: function(element, attrs) {
        return attrs.templateUrl || defaults.templateUrl;
    },
		link: function (scope, element, attrs) {
			setScopeValues(scope, attrs);

			var $body = $document.find('body');
			var $thumbwrapper = angular.element(document.querySelectorAll('.ng-thumbnails-wrapper'));
			var $thumbnails = angular.element(document.querySelectorAll('.ng-thumbnails'));

			scope.index = 0;
			scope.opened = false;

			scope.thumb_wrapper_width = 0;
			scope.thumbs_width = 0;

			scope.changeImage = function (i) {
				scope.index = i;
				scope.img = scope.images[scope.index];
				smartScroll(scope.index);
			};

			scope.nextImage = function () {
				scope.index += 1;
				if (scope.index === scope.images.length) {
					scope.index = 0;
				}
				scope.img = scope.images[scope.index];
				smartScroll(scope.index);
			};

			scope.prevImage = function () {
				scope.index -= 1;
				if (scope.index < 0) {
					scope.index = scope.images.length;
				}
				scope.img = scope.images[scope.index];
				smartScroll(scope.index);
			}

			scope.openGallery = function (i) {
				if (typeof i !== undefined) {
					scope.index = i;
					scope.img = scope.images[i];
				}
				scope.opened = true;

				$timeout(function() {
					scope.thumbs_width = calculateThumbsWidth();
					$thumbnails.css({ width: scope.thumbs_width + 'px' });
					smartScroll(scope.index);
				});
			};

			scope.closeGallery = function () {
				scope.opened = false;
			};

			$body.bind('keydown', function(event) {
				if (!scope.opened) {
					return;
				}
				var which = event.which;
				if (which === keys_codes.esc) {
					scope.closeGallery();
				} else if (which === keys_codes.right || which === keys_codes.enter) {
					scope.nextImage();
				} else if (which === keys_codes.left) {
					scope.prevImage();
				}

				scope.$apply();
			});

			var calculateThumbsWidth = function () {
				var width = 0;
				angular.forEach($thumbnails.find('img'), function(thumb) {
					width += thumb.clientWidth;
					width += 10; // margin-right
				});
				return width;
			};

			var smartScroll = function (index) {
				$timeout(function() {
					var len = scope.images.length,
						 	width = scope.thumbs_width,
							current_scroll = $thumbwrapper[0].scrollLeft,
							item_scroll = parseInt(width / len, 10),
							i = index + 1;

			    $thumbwrapper[0].scrollLeft = 0;
			    $thumbwrapper[0].scrollLeft = i * item_scroll - (2 * item_scroll);
					//$thumbwrapper[0].scrollLeft += center;
				}, 100);
			};

		}
	};

}]);