/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/lifecycle', 'vs/base/browser/builder', 'vs/base/browser/browser', 'vs/base/common/types', 'vs/base/browser/dom', 'vs/base/browser/touch', 'vs/base/common/eventEmitter', 'vs/base/browser/mouseEvent', 'vs/css!./sash'], function (require, exports, lifecycle_1, builder_1, browser_1, types, DOM, touch_1, eventEmitter_1, mouseEvent_1) {
    'use strict';
    (function (Orientation) {
        Orientation[Orientation["VERTICAL"] = 0] = "VERTICAL";
        Orientation[Orientation["HORIZONTAL"] = 1] = "HORIZONTAL";
    })(exports.Orientation || (exports.Orientation = {}));
    var Orientation = exports.Orientation;
    var Sash = (function (_super) {
        __extends(Sash, _super);
        function Sash(container, layoutProvider, options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            _super.call(this);
            this.$e = builder_1.$('.monaco-sash').appendTo(container);
            this.gesture = new touch_1.Gesture(this.$e.getHTMLElement());
            this.$e.on(DOM.EventType.MOUSE_DOWN, function (e) { _this.onMouseDown(e); });
            this.$e.on(DOM.EventType.DBLCLICK, function (e) { _this.emit('reset', e); });
            this.$e.on(touch_1.EventType.Start, function (e) { _this.onTouchStart(e); });
            this.orientation = options.orientation || Orientation.VERTICAL;
            this.$e.addClass(this.getOrientation());
            this.size = options.baseSize || 5;
            if (browser_1.isIPad) {
                this.size *= 4; // see also http://ux.stackexchange.com/questions/39023/what-is-the-optimum-button-size-of-touch-screen-applications
                this.$e.addClass('touch');
            }
            if (this.orientation === Orientation.HORIZONTAL) {
                this.$e.size(null, this.size);
            }
            else {
                this.$e.size(this.size);
            }
            this.isDisabled = false;
            this.hidden = false;
            this.layoutProvider = layoutProvider;
        }
        Sash.prototype.getHTMLElement = function () {
            return this.$e.getHTMLElement();
        };
        Sash.prototype.getOrientation = function () {
            return this.orientation === Orientation.HORIZONTAL ? 'horizontal' : 'vertical';
        };
        Sash.prototype.onMouseDown = function (e) {
            var _this = this;
            DOM.EventHelper.stop(e, false);
            if (this.isDisabled) {
                return;
            }
            var mouseDownEvent = new mouseEvent_1.StandardMouseEvent(e);
            var startX = mouseDownEvent.posx;
            var startY = mouseDownEvent.posy;
            var startEvent = {
                startX: startX,
                currentX: startX,
                startY: startY,
                currentY: startY
            };
            this.$e.addClass('active');
            this.emit('start', startEvent);
            var $window = builder_1.$(window);
            var containerCssClass = this.getOrientation() + "-cursor-container";
            var lastCurrentX = startX;
            var lastCurrentY = startY;
            $window.on('mousemove', function (e) {
                DOM.EventHelper.stop(e, false);
                var mouseMoveEvent = new mouseEvent_1.StandardMouseEvent(e);
                var event = {
                    startX: startX,
                    currentX: mouseMoveEvent.posx,
                    startY: startY,
                    currentY: mouseMoveEvent.posy
                };
                lastCurrentX = mouseMoveEvent.posx;
                lastCurrentY = mouseMoveEvent.posy;
                _this.emit('change', event);
            }).once('mouseup', function (e) {
                DOM.EventHelper.stop(e, false);
                _this.$e.removeClass('active');
                _this.emit('end');
                $window.off('mousemove');
                document.body.classList.remove(containerCssClass);
            });
            document.body.classList.add(containerCssClass);
        };
        Sash.prototype.onTouchStart = function (event) {
            var _this = this;
            DOM.EventHelper.stop(event);
            var listeners = [];
            var startX = event.pageX;
            var startY = event.pageY;
            this.emit('start', {
                startX: startX,
                currentX: startX,
                startY: startY,
                currentY: startY
            });
            var lastCurrentX = startX;
            var lastCurrentY = startY;
            listeners.push(DOM.addDisposableListener(this.$e.getHTMLElement(), touch_1.EventType.Change, function (event) {
                if (types.isNumber(event.pageX) && types.isNumber(event.pageY)) {
                    _this.emit('change', {
                        startX: startX,
                        currentX: event.pageX,
                        startY: startY,
                        currentY: event.pageY
                    });
                    lastCurrentX = event.pageX;
                    lastCurrentY = event.pageY;
                }
            }));
            listeners.push(DOM.addDisposableListener(this.$e.getHTMLElement(), touch_1.EventType.End, function (event) {
                _this.emit('end');
                lifecycle_1.dispose(listeners);
            }));
        };
        Sash.prototype.layout = function () {
            var style;
            if (this.orientation === Orientation.VERTICAL) {
                var verticalProvider = this.layoutProvider;
                style = { left: verticalProvider.getVerticalSashLeft(this) - (this.size / 2) + 'px' };
                if (verticalProvider.getVerticalSashTop) {
                    style.top = verticalProvider.getVerticalSashTop(this) + 'px';
                }
                if (verticalProvider.getVerticalSashHeight) {
                    style.height = verticalProvider.getVerticalSashHeight(this) + 'px';
                }
            }
            else {
                var horizontalProvider = this.layoutProvider;
                style = { top: horizontalProvider.getHorizontalSashTop(this) - (this.size / 2) + 'px' };
                if (horizontalProvider.getHorizontalSashLeft) {
                    style.left = horizontalProvider.getHorizontalSashLeft(this) + 'px';
                }
                if (horizontalProvider.getHorizontalSashWidth) {
                    style.width = horizontalProvider.getHorizontalSashWidth(this) + 'px';
                }
            }
            this.$e.style(style);
        };
        Sash.prototype.show = function () {
            this.hidden = false;
            this.$e.show();
        };
        Sash.prototype.hide = function () {
            this.hidden = true;
            this.$e.hide();
        };
        Sash.prototype.isHidden = function () {
            return this.hidden;
        };
        Sash.prototype.enable = function () {
            this.$e.removeClass('disabled');
            this.isDisabled = false;
        };
        Sash.prototype.disable = function () {
            this.$e.addClass('disabled');
            this.isDisabled = true;
        };
        Sash.prototype.dispose = function () {
            if (this.$e) {
                this.$e.destroy();
                this.$e = null;
            }
            _super.prototype.dispose.call(this);
        };
        return Sash;
    }(eventEmitter_1.EventEmitter));
    exports.Sash = Sash;
});
