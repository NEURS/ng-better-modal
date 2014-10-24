#
# ngModal
# by Adam Albrecht
# http://adamalbrecht.com
#
# Source Code: https://github.com/adamalbrecht/ngModal
#
# Compatible with Angular 1.2.x
#

app = angular.module("ngModal", [])

app.provider "ngModalDefaults", ->
  options: {
    closeButtonHtml: "<span class='ng-modal-close-x'>&times;</span>"
  }
  $get: ->
    @options

  set: (keyOrHash, value) ->
    if typeof(keyOrHash) == 'object'
      for k, v of keyOrHash
        @options[k] = v
    else
      @options[keyOrHash] = value

app.factory 'ngModalContents', ->
  data =
    contents:{}
    get: ->
      @contents

    set: (keyOrHash, value) ->
      if typeof(keyOrHash) == 'object'
        for k, v of keyOrHash
          @contents[k] = v
      else
        @contents[keyOrHash] = value
      @contents
    getContentTemplate: ->
      if @contents.value? && !@contents.source
        throw new Error "no valid content"

      template = ''

      if @contents.type? && @contents.source?
        switch @contents.type
          when "audio"
            urlEncoded = encodeURI(@contents.source)
            template += '<iframe width="640" height="450" scrolling="no" frameborder="no"'
            template += 'src="https://w.soundcloud.com/player/?url=' + urlEncoded + '&amp;'
            template += 'auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;'
            template += 'show_user=true&amp;show_reposts=false&amp;visual=true"></iframe>'
          when "photo"
            template += '<image src="https://' + @contents.source + '" alt=' + @contents.title + ' />'
          when "video"
            template += '<iframe src="https://' + @contents.source + '" width="640" '
            template += 'height="450" frameborder="0" webkitallowfullscreen '
            template += 'mozallowfullscreen allowfullscreen></iframe>'

        return template

      else if @contents.content?
        template += '<div>' + @contents.content + '</div>'

      return template

  data

app.directive 'modalContent', ['ngModalContents','$sce', (ngModalContents, $sce) ->
  restrict: 'A'
  scope: {
    type: '@',
    source: '@'
  }
  link: ($scope, $element, $attributes) ->
    $scope.$watch ()->
      ngModalContents.set {
        type: $attributes.type,
        source: $attributes.source
      }

      if ngModalContents? and ngModalContents.get()?
        document.getElementsByClassName('ng-modal-dialog-content')[0].innerHTML = $sce.trustAsHtml ngModalContents.getContentTemplate()
      else
        document.getElementsByClassName('ng-modal-dialog-content')[0].innerHTML = ''

]
app.directive 'modalDialog', ['ngModalDefaults', '$sce', (ngModalDefaults, $sce) ->
  restrict: 'E'
  scope:
    show: '='
    dialogTitle: '@'
    onClose: '&?'
  replace: true
  transclude: true
  link: (scope, element, attrs) ->
    setupCloseButton = ->
      scope.closeButtonHtml = $sce.trustAsHtml(ngModalDefaults.closeButtonHtml)

    setupStyle = ->
      scope.dialogStyle = {}
      scope.dialogStyle['width'] = attrs.width if attrs.width
      scope.dialogStyle['height'] = attrs.height if attrs.height

    scope.hideModal = ->
      scope.show = false

    scope.$watch('show', (newVal, oldVal) ->
      if newVal && !oldVal
        document.getElementsByTagName("body")[0].style.overflow = "hidden";
      else
        document.getElementsByTagName("body")[0].style.overflow = "";
      if (!newVal && oldVal) && scope.onClose?
        scope.onClose()
    )

    setupCloseButton()
    setupStyle()

  template: """
              <div class='ng-modal' ng-show='show'>
                <div class='ng-modal-overlay' ng-click='hideModal()'></div>
                <div class='ng-modal-dialog' ng-style='dialogStyle'>
                  <span class='ng-modal-title' ng-show='dialogTitle && dialogTitle.length' ng-bind='dialogTitle'></span>
                  <div class='ng-modal-close' ng-click='hideModal()'>
                    <div ng-bind-html='closeButtonHtml'></div>
                  </div>
                  <div class='ng-modal-dialog-content' ng-transclude></div>
                </div>
              </div>
            """
]
