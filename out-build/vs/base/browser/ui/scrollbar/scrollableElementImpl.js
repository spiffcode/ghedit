var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/browser/dom', 'vs/base/common/platform', 'vs/base/browser/mouseEvent', 'vs/base/browser/ui/scrollbar/horizontalScrollbar', 'vs/base/browser/ui/scrollbar/verticalScrollbar', 'vs/base/browser/ui/scrollbar/scrollableElement', 'vs/base/common/lifecycle', 'vs/base/common/scrollable', 'vs/base/browser/ui/widget', 'vs/base/common/async', 'vs/base/browser/styleMutator', 'vs/css!./media/scrollbars'], function (require, exports, DomUtils, Platform, mouseEvent_1, horizontalScrollbar_1, verticalScrollbar_1, scrollableElement_1, lifecycle_1, scrollable_1, widget_1, async_1, styleMutator_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var HIDE_TIMEOUT = 500;
    var SCROLL_WHEEL_SENSITIVITY = 50;
    var ScrollableElement = (function (_super) {
        __extends(ScrollableElement, _super);
        function ScrollableElement(element, scrollable, options, dimensions) {
            var _this = this;
            if (dimensions === void 0) { dimensions = null; }
            _super.call(this);
            element.style.overflow = 'hidden';
            this._options = this._createOptions(options);
            this._scrollable = this._register(new scrollable_1.DelegateScrollable(scrollable, function () { return _this._onScroll(); }));
            this.verticalScrollbarWidth = this._options.verticalScrollbarSize;
            this.horizontalScrollbarHeight = this._options.horizontalScrollbarSize;
            this._verticalScrollbar = this._register(new verticalScrollbar_1.VerticalScrollbar(this._scrollable, this, this._options));
            this._horizontalScrollbar = this._register(new horizontalScrollbar_1.HorizontalScrollbar(this._scrollable, this, this._options));
            this._domNode = document.createElement('div');
            this._domNode.className = 'monaco-scrollable-element ' + this._options.className;
            this._domNode.setAttribute('role', 'presentation');
            this._domNode.style.position = 'relative';
            this._domNode.style.overflow = 'hidden';
            this._domNode.appendChild(element);
            this._domNode.appendChild(this._horizontalScrollbar.domNode.domNode);
            this._domNode.appendChild(this._verticalScrollbar.domNode.domNode);
            if (this._options.useShadows) {
                this._leftShadowDomNode = styleMutator_1.createFastDomNode(document.createElement('div'));
                this._leftShadowDomNode.setClassName('shadow');
                this._domNode.appendChild(this._leftShadowDomNode.domNode);
                this._topShadowDomNode = styleMutator_1.createFastDomNode(document.createElement('div'));
                this._topShadowDomNode.setClassName('shadow');
                this._domNode.appendChild(this._topShadowDomNode.domNode);
                this._topLeftShadowDomNode = styleMutator_1.createFastDomNode(document.createElement('div'));
                this._topLeftShadowDomNode.setClassName('shadow top-left-corner');
                this._domNode.appendChild(this._topLeftShadowDomNode.domNode);
            }
            this._listenOnDomNode = this._options.listenOnDomNode || this._domNode;
            this._mouseWheelToDispose = [];
            this._setListeningToMouseWheel(this._options.handleMouseWheel);
            this.onmouseover(this._listenOnDomNode, function (e) { return _this._onMouseOver(e); });
            this.onnonbubblingmouseout(this._listenOnDomNode, function (e) { return _this._onMouseOut(e); });
            this._onElementDimensionsTimeout = this._register(new async_1.TimeoutTimer());
            this._hideTimeout = this._register(new async_1.TimeoutTimer());
            this._isDragging = false;
            this._mouseIsOver = false;
            this.onElementDimensions(dimensions, true);
            this._shouldRender = true;
            this._shouldRender = this._horizontalScrollbar.onElementScrollSize(this._scrollable.getScrollWidth()) || this._shouldRender;
            this._shouldRender = this._verticalScrollbar.onElementScrollSize(this._scrollable.getScrollHeight()) || this._shouldRender;
        }
        ScrollableElement.prototype.dispose = function () {
            this._mouseWheelToDispose = lifecycle_1.dispose(this._mouseWheelToDispose);
            _super.prototype.dispose.call(this);
        };
        ScrollableElement.prototype.getDomNode = function () {
            return this._domNode;
        };
        ScrollableElement.prototype.getOverviewRulerLayoutInfo = function () {
            return {
                parent: this._domNode,
                insertBefore: this._verticalScrollbar.domNode.domNode,
            };
        };
        ScrollableElement.prototype.delegateVerticalScrollbarMouseDown = function (browserEvent) {
            this._verticalScrollbar.delegateMouseDown(browserEvent);
        };
        ScrollableElement.prototype.onElementDimensions = function (dimensions, synchronous) {
            var _this = this;
            if (dimensions === void 0) { dimensions = null; }
            if (synchronous === void 0) { synchronous = false; }
            if (synchronous) {
                this._actualElementDimensions(dimensions);
                this._onElementDimensionsTimeout.cancel();
            }
            else {
                this._onElementDimensionsTimeout.cancelAndSet(function () { return _this._actualElementDimensions(dimensions); }, 0);
            }
        };
        ScrollableElement.prototype._actualElementDimensions = function (dimensions) {
            if (dimensions === void 0) { dimensions = null; }
            if (!dimensions) {
                dimensions = {
                    width: this._domNode.clientWidth,
                    height: this._domNode.clientHeight
                };
            }
            var width = Math.round(dimensions.width);
            var height = Math.round(dimensions.height);
            this._shouldRender = this._verticalScrollbar.onElementSize(height) || this._shouldRender;
            this._shouldRender = this._horizontalScrollbar.onElementSize(width) || this._shouldRender;
        };
        ScrollableElement.prototype.updateClassName = function (newClassName) {
            this._options.className = newClassName;
            // Defaults are different on Macs
            if (Platform.isMacintosh) {
                this._options.className += ' mac';
            }
            this._domNode.className = 'monaco-scrollable-element ' + this._options.className;
        };
        ScrollableElement.prototype.updateOptions = function (newOptions) {
            // only support handleMouseWheel changes for now
            var massagedOptions = this._createOptions(newOptions);
            this._options.handleMouseWheel = massagedOptions.handleMouseWheel;
            this._options.mouseWheelScrollSensitivity = massagedOptions.mouseWheelScrollSensitivity;
            this._setListeningToMouseWheel(this._options.handleMouseWheel);
        };
        // -------------------- mouse wheel scrolling --------------------
        ScrollableElement.prototype._setListeningToMouseWheel = function (shouldListen) {
            var _this = this;
            var isListening = (this._mouseWheelToDispose.length > 0);
            if (isListening === shouldListen) {
                // No change
                return;
            }
            // Stop listening (if necessary)
            this._mouseWheelToDispose = lifecycle_1.dispose(this._mouseWheelToDispose);
            // Start listening (if necessary)
            if (shouldListen) {
                var onMouseWheel = function (browserEvent) {
                    var e = new mouseEvent_1.StandardMouseWheelEvent(browserEvent);
                    _this.onMouseWheel(e);
                };
                this._mouseWheelToDispose.push(DomUtils.addDisposableListener(this._listenOnDomNode, 'mousewheel', onMouseWheel));
                this._mouseWheelToDispose.push(DomUtils.addDisposableListener(this._listenOnDomNode, 'DOMMouseScroll', onMouseWheel));
            }
        };
        ScrollableElement.prototype.onMouseWheel = function (e) {
            if (Platform.isMacintosh && e.browserEvent && this._options.saveLastScrollTimeOnClassName) {
                // Mark dom node with timestamp of wheel event
                var target = e.browserEvent.target;
                if (target && target.nodeType === 1) {
                    var r = DomUtils.findParentWithClass(target, this._options.saveLastScrollTimeOnClassName);
                    if (r) {
                        r.setAttribute('last-scroll-time', String(new Date().getTime()));
                    }
                }
            }
            var desiredScrollTop = -1;
            var desiredScrollLeft = -1;
            if (e.deltaY || e.deltaX) {
                var deltaY = e.deltaY * this._options.mouseWheelScrollSensitivity;
                var deltaX = e.deltaX * this._options.mouseWheelScrollSensitivity;
                if (this._options.flipAxes) {
                    deltaY = e.deltaX;
                    deltaX = e.deltaY;
                }
                if (Platform.isMacintosh) {
                    // Give preference to vertical scrolling
                    if (deltaY && Math.abs(deltaX) < 0.2) {
                        deltaX = 0;
                    }
                    if (Math.abs(deltaY) > Math.abs(deltaX) * 0.5) {
                        deltaX = 0;
                    }
                }
                if (deltaY) {
                    var currentScrollTop = this._scrollable.getScrollTop();
                    desiredScrollTop = this._verticalScrollbar.validateScrollPosition((desiredScrollTop !== -1 ? desiredScrollTop : currentScrollTop) - SCROLL_WHEEL_SENSITIVITY * deltaY);
                    if (desiredScrollTop === currentScrollTop) {
                        desiredScrollTop = -1;
                    }
                }
                if (deltaX) {
                    var currentScrollLeft = this._scrollable.getScrollLeft();
                    desiredScrollLeft = this._horizontalScrollbar.validateScrollPosition((desiredScrollLeft !== -1 ? desiredScrollLeft : currentScrollLeft) - SCROLL_WHEEL_SENSITIVITY * deltaX);
                    if (desiredScrollLeft === currentScrollLeft) {
                        desiredScrollLeft = -1;
                    }
                }
                if (desiredScrollTop !== -1 || desiredScrollLeft !== -1) {
                    if (desiredScrollTop !== -1) {
                        this._shouldRender = this._verticalScrollbar.setDesiredScrollPosition(desiredScrollTop) || this._shouldRender;
                        desiredScrollTop = -1;
                    }
                    if (desiredScrollLeft !== -1) {
                        this._shouldRender = this._horizontalScrollbar.setDesiredScrollPosition(desiredScrollLeft) || this._shouldRender;
                        desiredScrollLeft = -1;
                    }
                }
            }
            e.preventDefault();
            e.stopPropagation();
        };
        ScrollableElement.prototype._onScroll = function () {
            var scrollHeight = this._scrollable.getScrollHeight();
            var scrollTop = this._scrollable.getScrollTop();
            var scrollWidth = this._scrollable.getScrollWidth();
            var scrollLeft = this._scrollable.getScrollLeft();
            this._shouldRender = this._horizontalScrollbar.onElementScrollSize(scrollWidth) || this._shouldRender;
            this._shouldRender = this._verticalScrollbar.onElementScrollSize(scrollHeight) || this._shouldRender;
            this._shouldRender = this._verticalScrollbar.onElementScrollPosition(scrollTop) || this._shouldRender;
            this._shouldRender = this._horizontalScrollbar.onElementScrollPosition(scrollLeft) || this._shouldRender;
            if (this._options.useShadows) {
                this._shouldRender = true;
            }
            this._reveal();
            if (!this._options.lazyRender) {
                this._render();
            }
        };
        ScrollableElement.prototype.renderNow = function () {
            if (!this._options.lazyRender) {
                throw new Error('Please use `lazyRender` together with `renderNow`!');
            }
            this._render();
        };
        ScrollableElement.prototype._render = function () {
            if (!this._shouldRender) {
                return;
            }
            this._shouldRender = false;
            this._horizontalScrollbar.render();
            this._verticalScrollbar.render();
            if (this._options.useShadows) {
                var enableTop = this._scrollable.getScrollTop() > 0;
                var enableLeft = this._scrollable.getScrollLeft() > 0;
                this._leftShadowDomNode.setClassName('shadow' + (enableLeft ? ' left' : ''));
                this._topShadowDomNode.setClassName('shadow' + (enableTop ? ' top' : ''));
                this._topLeftShadowDomNode.setClassName('shadow top-left-corner' + (enableTop ? ' top' : '') + (enableLeft ? ' left' : ''));
            }
        };
        // -------------------- fade in / fade out --------------------
        ScrollableElement.prototype.onDragStart = function () {
            this._isDragging = true;
            this._reveal();
        };
        ScrollableElement.prototype.onDragEnd = function () {
            this._isDragging = false;
            this._hide();
        };
        ScrollableElement.prototype._onMouseOut = function (e) {
            this._mouseIsOver = false;
            this._hide();
        };
        ScrollableElement.prototype._onMouseOver = function (e) {
            this._mouseIsOver = true;
            this._reveal();
        };
        ScrollableElement.prototype._reveal = function () {
            this._verticalScrollbar.beginReveal();
            this._horizontalScrollbar.beginReveal();
            this._scheduleHide();
        };
        ScrollableElement.prototype._hide = function () {
            if (!this._mouseIsOver && !this._isDragging) {
                this._verticalScrollbar.beginHide();
                this._horizontalScrollbar.beginHide();
            }
        };
        ScrollableElement.prototype._scheduleHide = function () {
            var _this = this;
            this._hideTimeout.cancelAndSet(function () { return _this._hide(); }, HIDE_TIMEOUT);
        };
        // -------------------- size & layout --------------------
        ScrollableElement.prototype._createOptions = function (options) {
            function ensureValue(source, prop, value) {
                if (source.hasOwnProperty(prop)) {
                    return source[prop];
                }
                return value;
            }
            var result = {
                forbidTranslate3dUse: ensureValue(options, 'forbidTranslate3dUse', false),
                lazyRender: ensureValue(options, 'lazyRender', false),
                className: ensureValue(options, 'className', ''),
                useShadows: ensureValue(options, 'useShadows', true),
                handleMouseWheel: ensureValue(options, 'handleMouseWheel', true),
                flipAxes: ensureValue(options, 'flipAxes', false),
                mouseWheelScrollSensitivity: ensureValue(options, 'mouseWheelScrollSensitivity', 1),
                arrowSize: ensureValue(options, 'arrowSize', 11),
                listenOnDomNode: ensureValue(options, 'listenOnDomNode', null),
                horizontal: scrollableElement_1.visibilityFromString(ensureValue(options, 'horizontal', 'auto')),
                horizontalScrollbarSize: ensureValue(options, 'horizontalScrollbarSize', 10),
                horizontalSliderSize: 0,
                horizontalHasArrows: ensureValue(options, 'horizontalHasArrows', false),
                vertical: scrollableElement_1.visibilityFromString(ensureValue(options, 'vertical', 'auto')),
                verticalScrollbarSize: ensureValue(options, 'verticalScrollbarSize', 10),
                verticalHasArrows: ensureValue(options, 'verticalHasArrows', false),
                verticalSliderSize: 0,
                saveLastScrollTimeOnClassName: ensureValue(options, 'saveLastScrollTimeOnClassName', null)
            };
            result.horizontalSliderSize = ensureValue(options, 'horizontalSliderSize', result.horizontalScrollbarSize);
            result.verticalSliderSize = ensureValue(options, 'verticalSliderSize', result.verticalScrollbarSize);
            // Defaults are different on Macs
            if (Platform.isMacintosh) {
                result.className += ' mac';
            }
            return result;
        };
        return ScrollableElement;
    }(widget_1.Widget));
    exports.ScrollableElement = ScrollableElement;
});
