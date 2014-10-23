(function() {
  var app;

  app = angular.module("ngModal", []);

  app.provider("ngModalDefaults", function() {
    return {
      options: {
        closeButtonHtml: "<span class='ng-modal-close-x'>&times;</span>"
      },
      $get: function() {
        return this.options;
      },
      set: function(keyOrHash, value) {
        var k, v, _results;
        if (typeof keyOrHash === 'object') {
          _results = [];
          for (k in keyOrHash) {
            v = keyOrHash[k];
            _results.push(this.options[k] = v);
          }
          return _results;
        } else {
          return this.options[keyOrHash] = value;
        }
      }
    };
  });

  app.factory('ngModalContents', function() {
    var data;
    data = {
      contents: {},
      get: function() {
        return this.contents;
      },
      set: function(keyOrHash, value) {
        var k, v;
        if (typeof keyOrHash === 'object') {
          for (k in keyOrHash) {
            v = keyOrHash[k];
            this.contents[k] = v;
          }
        } else {
          this.contents[keyOrHash] = value;
        }
        return this.contents;
      },
      getContentTemplate: function() {
        var template, urlEncoded;
        if ((this.contents.value != null) && !this.contents.source) {
          throw new Error("no valid content");
        }
        template = '';
        if ((this.contents.type != null) && (this.contents.source != null)) {
          switch (this.contents.type) {
            case "audio":
              urlEncoded = encodeURI(this.contents.source);
              template += '<iframe width="640" height="450" scrolling="no" frameborder="no"';
              template += 'src="https://w.soundcloud.com/player/?url=' + urlEncoded + '&amp;';
              template += 'auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;';
              template += 'show_user=true&amp;show_reposts=false&amp;visual=true"></iframe>';
              break;
            case "photo":
              template += '<image src="https://' + this.contents.source + '" alt=' + this.contents.title + ' />';
              break;
            case "video":
              template += '<iframe src="https://' + this.contents.source + '" width="640" ';
              template += 'height="450" frameborder="0" webkitallowfullscreen ';
              template += 'mozallowfullscreen allowfullscreen></iframe>';
          }
          return template;
        } else if (this.contents.content != null) {
          template += '<div>' + this.contents.content + '</div>';
        }
        return template;
      }
    };
    return data;
  });

  app.directive('ngModalContent', [
    'ngModalContents', '$sce', function(ngModalContents, $sce) {
      return {
        restrict: 'A',
        scope: {
          type: '@',
          source: '@'
        },
        link: function($scope, $element, $attributes) {
          console.log($attributes);
          ngModalContents.set({
            type: $attributes.type,
            source: $attributes.source
          });
          if ((ngModalContents != null) && (ngModalContents.get() != null)) {
            return document.getElementsByClassName('ng-modal-dialog-content')[0].innerHTML = $sce.trustAsHtml(ngModalContents.getContentTemplate());
          } else {
            return document.getElementsByClassName('ng-modal-dialog-content')[0].innerHTML = '';
          }
        }
      };
    }
  ]);

  app.directive('modalDialog', [
    'ngModalDefaults', '$sce', function(ngModalDefaults, $sce) {
      return {
        restrict: 'E',
        scope: {
          show: '=',
          dialogTitle: '@',
          onClose: '&?'
        },
        replace: true,
        transclude: true,
        link: function(scope, element, attrs) {
          var setupCloseButton, setupStyle;
          setupCloseButton = function() {
            return scope.closeButtonHtml = $sce.trustAsHtml(ngModalDefaults.closeButtonHtml);
          };
          setupStyle = function() {
            scope.dialogStyle = {};
            if (attrs.width) {
              scope.dialogStyle['width'] = attrs.width;
            }
            if (attrs.height) {
              return scope.dialogStyle['height'] = attrs.height;
            }
          };
          scope.hideModal = function() {
            return scope.show = false;
          };
          scope.$watch('show', function(newVal, oldVal) {
            if (newVal && !oldVal) {
              document.getElementsByTagName("body")[0].style.overflow = "hidden";
            } else {
              document.getElementsByTagName("body")[0].style.overflow = "";
            }
            if ((!newVal && oldVal) && (scope.onClose != null)) {
              return scope.onClose();
            }
          });
          setupCloseButton();
          return setupStyle();
        },
        template: "<div class='ng-modal' ng-show='show'>\n  <div class='ng-modal-overlay' ng-click='hideModal()'></div>\n  <div class='ng-modal-dialog' ng-style='dialogStyle'>\n    <span class='ng-modal-title' ng-show='dialogTitle && dialogTitle.length' ng-bind='dialogTitle'></span>\n    <div class='ng-modal-close' ng-click='hideModal()'>\n      <div ng-bind-html='closeButtonHtml'></div>\n    </div>\n    <div class='ng-modal-dialog-content' ng-transclude></div>\n  </div>\n</div>"
      };
    }
  ]);

}).call(this);
