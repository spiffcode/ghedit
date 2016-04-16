var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/browser/browser', 'vs/base/common/platform', 'vs/base/browser/dom', 'vs/base/browser/mouseEvent', 'vs/base/browser/ui/scrollbar/scrollableElement', 'vs/base/common/lifecycle', 'vs/base/browser/globalMouseMoveMonitor', 'vs/base/browser/ui/widget', 'vs/base/common/async', 'vs/base/browser/styleMutator'], function (require, exports, Browser, Platform, DomUtils, mouseEvent_1, scrollableElement_1, lifecycle_1, globalMouseMoveMonitor_1, widget_1, async_1, styleMutator_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /**
     * The arrow image size.
     */
    exports.ARROW_IMG_SIZE = 11;
    /**
     * The orthogonal distance to the slider at which dragging "resets". This implements "snapping"
     */
    var MOUSE_DRAG_RESET_DISTANCE = 140;
    /**
     * The minimal size of the slider (such that it can still be clickable) -- it is artificially enlarged.
     */
    var MINIMUM_SLIDER_SIZE = 20;
    var ScrollbarState = (function () {
        function ScrollbarState(arrowSize, scrollbarSize, oppositeScrollbarSize) {
            this._scrollbarSize = Math.round(scrollbarSize);
            this._oppositeScrollbarSize = Math.round(oppositeScrollbarSize);
            this._arrowSize = Math.round(arrowSize);
            this._visibleSize = 0;
            this._scrollSize = 0;
            this._scrollPosition = 0;
            this._computedAvailableSize = 0;
            this._computedRepresentableSize = 0;
            this._computedRatio = 0.1;
            this._computedIsNeeded = false;
            this._computedSliderSize = 0;
            this._computedSliderPosition = 0;
            this._refreshComputedValues();
        }
        ScrollbarState.prototype.setVisibleSize = function (visibleSize) {
            var iVisibleSize = Math.round(visibleSize);
            if (this._visibleSize !== iVisibleSize) {
                this._visibleSize = iVisibleSize;
                this._refreshComputedValues();
                return true;
            }
            return false;
        };
        ScrollbarState.prototype.setScrollSize = function (scrollSize) {
            var iScrollSize = Math.round(scrollSize);
            if (this._scrollSize !== iScrollSize) {
                this._scrollSize = iScrollSize;
                this._refreshComputedValues();
                return true;
            }
            return false;
        };
        ScrollbarState.prototype.setScrollPosition = function (scrollPosition) {
            var iScrollPosition = Math.round(scrollPosition);
            if (this._scrollPosition !== iScrollPosition) {
                this._scrollPosition = iScrollPosition;
                this._refreshComputedValues();
                return true;
            }
            return false;
        };
        ScrollbarState.prototype._refreshComputedValues = function () {
            var oppositeScrollbarSize = this._oppositeScrollbarSize;
            var arrowSize = this._arrowSize;
            var visibleSize = this._visibleSize;
            var scrollSize = this._scrollSize;
            var scrollPosition = this._scrollPosition;
            var computedAvailableSize = Math.max(0, visibleSize - oppositeScrollbarSize);
            var computedRepresentableSize = Math.max(0, computedAvailableSize - 2 * arrowSize);
            var computedRatio = scrollSize > 0 ? (computedRepresentableSize / scrollSize) : 0;
            var computedIsNeeded = (scrollSize > visibleSize);
            var computedSliderSize;
            var computedSliderPosition;
            if (!computedIsNeeded) {
                computedSliderSize = computedRepresentableSize;
                computedSliderPosition = 0;
            }
            else {
                computedSliderSize = Math.floor(visibleSize * computedRatio);
                computedSliderPosition = Math.floor(scrollPosition * computedRatio);
                if (computedSliderSize < MINIMUM_SLIDER_SIZE) {
                    // We must artificially increase the size of the slider, since the slider would be too small otherwise
                    // The effort is to keep the slider centered around the original position, but we must take into
                    // account the cases when the slider is too close to the top or too close to the bottom
                    var sliderArtificialOffset = (MINIMUM_SLIDER_SIZE - computedSliderSize) / 2;
                    computedSliderSize = MINIMUM_SLIDER_SIZE;
                    computedSliderPosition -= sliderArtificialOffset;
                    if (computedSliderPosition + computedSliderSize > computedRepresentableSize) {
                        // Slider is too close to the bottom, so we glue it to the bottom
                        computedSliderPosition = computedRepresentableSize - computedSliderSize;
                    }
                    if (computedSliderPosition < 0) {
                        // Slider is too close to the top, so we glue it to the top
                        computedSliderPosition = 0;
                    }
                }
            }
            this._computedAvailableSize = Math.round(computedAvailableSize);
            this._computedRepresentableSize = Math.round(computedRepresentableSize);
            this._computedRatio = computedRatio;
            this._computedIsNeeded = computedIsNeeded;
            this._computedSliderSize = Math.round(computedSliderSize);
            this._computedSliderPosition = Math.round(computedSliderPosition);
        };
        ScrollbarState.prototype.getArrowSize = function () {
            return this._arrowSize;
        };
        ScrollbarState.prototype.getRectangleLargeSize = function () {
            return this._computedAvailableSize;
        };
        ScrollbarState.prototype.getRectangleSmallSize = function () {
            return this._scrollbarSize;
        };
        ScrollbarState.prototype.isNeeded = function () {
            return this._computedIsNeeded;
        };
        ScrollbarState.prototype.getSliderSize = function () {
            return this._computedSliderSize;
        };
        ScrollbarState.prototype.getSliderPosition = function () {
            return this._computedSliderPosition;
        };
        ScrollbarState.prototype.convertSliderPositionToScrollPosition = function (desiredSliderPosition) {
            return desiredSliderPosition / this._computedRatio;
        };
        ScrollbarState.prototype.validateScrollPosition = function (desiredScrollPosition) {
            desiredScrollPosition = Math.round(desiredScrollPosition);
            desiredScrollPosition = Math.max(desiredScrollPosition, 0);
            desiredScrollPosition = Math.min(desiredScrollPosition, this._scrollSize - this._visibleSize);
            return desiredScrollPosition;
        };
        return ScrollbarState;
    }());
    exports.ScrollbarState = ScrollbarState;
    var ScrollbarArrow = (function (_super) {
        __extends(ScrollbarArrow, _super);
        function ScrollbarArrow(className, top, left, bottom, right, bgWidth, bgHeight, mouseWheelEventFactory, parent) {
            var _this = this;
            _super.call(this);
            this._parent = parent;
            this._mouseWheelEventFactory = mouseWheelEventFactory;
            this.bgDomNode = document.createElement('div');
            this.bgDomNode.className = 'arrow-background';
            this.bgDomNode.style.position = 'absolute';
            setSize(this.bgDomNode, bgWidth, bgHeight);
            setPosition(this.bgDomNode, (top !== null ? 0 : null), (left !== null ? 0 : null), (bottom !== null ? 0 : null), (right !== null ? 0 : null));
            this.domNode = document.createElement('div');
            this.domNode.className = className;
            this.domNode.style.position = 'absolute';
            setSize(this.domNode, exports.ARROW_IMG_SIZE, exports.ARROW_IMG_SIZE);
            setPosition(this.domNode, top, left, bottom, right);
            this._mouseMoveMonitor = this._register(new globalMouseMoveMonitor_1.GlobalMouseMoveMonitor());
            this.onmousedown(this.bgDomNode, function (e) { return _this._arrowMouseDown(e); });
            this.onmousedown(this.domNode, function (e) { return _this._arrowMouseDown(e); });
            this._mousedownRepeatTimer = this._register(new async_1.IntervalTimer());
            this._mousedownScheduleRepeatTimer = this._register(new async_1.TimeoutTimer());
        }
        ScrollbarArrow.prototype._arrowMouseDown = function (e) {
            var _this = this;
            var repeater = function () {
                _this._parent.onMouseWheel(_this._mouseWheelEventFactory());
            };
            var scheduleRepeater = function () {
                _this._mousedownRepeatTimer.cancelAndSet(repeater, 1000 / 24);
            };
            repeater();
            this._mousedownRepeatTimer.cancel();
            this._mousedownScheduleRepeatTimer.cancelAndSet(scheduleRepeater, 200);
            this._mouseMoveMonitor.startMonitoring(globalMouseMoveMonitor_1.standardMouseMoveMerger, function (mouseMoveData) {
                /* Intentional empty */
            }, function () {
                _this._mousedownRepeatTimer.cancel();
                _this._mousedownScheduleRepeatTimer.cancel();
            });
            e.preventDefault();
        };
        return ScrollbarArrow;
    }(widget_1.Widget));
    var VisibilityController = (function (_super) {
        __extends(VisibilityController, _super);
        function VisibilityController(visibility, visibleClassName, invisibleClassName) {
            _super.call(this);
            this._visibility = visibility;
            this._visibleClassName = visibleClassName;
            this._invisibleClassName = invisibleClassName;
            this._domNode = null;
            this._isVisible = false;
            this._isNeeded = false;
            this._shouldBeVisible = false;
            this._revealTimer = this._register(new async_1.TimeoutTimer());
        }
        // ----------------- Hide / Reveal
        VisibilityController.prototype.applyVisibilitySetting = function (shouldBeVisible) {
            if (this._visibility === scrollableElement_1.Visibility.Hidden) {
                return false;
            }
            if (this._visibility === scrollableElement_1.Visibility.Visible) {
                return true;
            }
            return shouldBeVisible;
        };
        VisibilityController.prototype.setShouldBeVisible = function (rawShouldBeVisible) {
            var shouldBeVisible = this.applyVisibilitySetting(rawShouldBeVisible);
            if (this._shouldBeVisible !== shouldBeVisible) {
                this._shouldBeVisible = shouldBeVisible;
                this.ensureVisibility();
            }
        };
        VisibilityController.prototype.setIsNeeded = function (isNeeded) {
            if (this._isNeeded !== isNeeded) {
                this._isNeeded = isNeeded;
                this.ensureVisibility();
            }
        };
        VisibilityController.prototype.setDomNode = function (domNode) {
            this._domNode = domNode;
            this._domNode.setClassName(this._invisibleClassName);
            // Now that the flags & the dom node are in a consistent state, ensure the Hidden/Visible configuration
            this.setShouldBeVisible(false);
        };
        VisibilityController.prototype.ensureVisibility = function () {
            if (!this._isNeeded) {
                // Nothing to be rendered
                this._hide(false);
                return;
            }
            if (this._shouldBeVisible) {
                this._reveal();
            }
            else {
                this._hide(true);
            }
        };
        VisibilityController.prototype._reveal = function () {
            var _this = this;
            if (this._isVisible) {
                return;
            }
            this._isVisible = true;
            // The CSS animation doesn't play otherwise
            this._revealTimer.setIfNotSet(function () {
                _this._domNode.setClassName(_this._visibleClassName);
            }, 0);
        };
        VisibilityController.prototype._hide = function (withFadeAway) {
            this._revealTimer.cancel();
            if (!this._isVisible) {
                return;
            }
            this._isVisible = false;
            this._domNode.setClassName(this._invisibleClassName + (withFadeAway ? ' fade' : ''));
        };
        return VisibilityController;
    }(lifecycle_1.Disposable));
    var AbstractScrollbar = (function (_super) {
        __extends(AbstractScrollbar, _super);
        function AbstractScrollbar(forbidTranslate3dUse, lazyRender, parent, scrollbarState, visibility, extraScrollbarClassName) {
            _super.call(this);
            this._forbidTranslate3dUse = forbidTranslate3dUse;
            this._lazyRender = lazyRender;
            this._parent = parent;
            this._scrollbarState = scrollbarState;
            this._visibilityController = this._register(new VisibilityController(visibility, 'visible scrollbar ' + extraScrollbarClassName, 'invisible scrollbar ' + extraScrollbarClassName));
            this._mouseMoveMonitor = this._register(new globalMouseMoveMonitor_1.GlobalMouseMoveMonitor());
            this._shouldRender = true;
        }
        // ----------------- initialize & clean-up
        /**
         * Creates the container dom node for the scrollbar & hooks up the events
         */
        AbstractScrollbar.prototype._createDomNode = function () {
            var _this = this;
            this.domNode = styleMutator_1.createFastDomNode(document.createElement('div'));
            if (!this._forbidTranslate3dUse && Browser.canUseTranslate3d) {
                // Put the scrollbar in its own layer
                this.domNode.setTransform('translate3d(0px, 0px, 0px)');
            }
            this._visibilityController.setDomNode(this.domNode);
            this.domNode.setPosition('absolute');
            this.onmousedown(this.domNode.domNode, function (e) { return _this._domNodeMouseDown(e); });
        };
        /**
         * Creates the dom node for an arrow & adds it to the container
         */
        AbstractScrollbar.prototype._createArrow = function (className, top, left, bottom, right, bgWidth, bgHeight, mouseWheelEventFactory) {
            var arrow = this._register(new ScrollbarArrow(className, top, left, bottom, right, bgWidth, bgHeight, mouseWheelEventFactory, this._parent));
            this.domNode.domNode.appendChild(arrow.bgDomNode);
            this.domNode.domNode.appendChild(arrow.domNode);
        };
        /**
         * Creates the slider dom node, adds it to the container & hooks up the events
         */
        AbstractScrollbar.prototype._createSlider = function (top, left, width, height) {
            var _this = this;
            this.slider = styleMutator_1.createFastDomNode(document.createElement('div'));
            this.slider.setClassName('slider');
            this.slider.setPosition('absolute');
            this.slider.setTop(top);
            this.slider.setLeft(left);
            this.slider.setWidth(width);
            this.slider.setHeight(height);
            this.domNode.domNode.appendChild(this.slider.domNode);
            this.onmousedown(this.slider.domNode, function (e) { return _this._sliderMouseDown(e); });
        };
        // ----------------- Update state
        AbstractScrollbar.prototype.onElementSize = function (visibleSize) {
            if (this._scrollbarState.setVisibleSize(visibleSize)) {
                this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded());
                this._shouldRender = true;
                if (!this._lazyRender) {
                    this.render();
                }
            }
            return this._shouldRender;
        };
        AbstractScrollbar.prototype.onElementScrollSize = function (elementScrollSize) {
            if (this._scrollbarState.setScrollSize(elementScrollSize)) {
                this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded());
                this._shouldRender = true;
                if (!this._lazyRender) {
                    this.render();
                }
            }
            return this._shouldRender;
        };
        AbstractScrollbar.prototype.onElementScrollPosition = function (elementScrollPosition) {
            if (this._scrollbarState.setScrollPosition(elementScrollPosition)) {
                this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded());
                this._shouldRender = true;
                if (!this._lazyRender) {
                    this.render();
                }
            }
            return this._shouldRender;
        };
        // ----------------- rendering
        AbstractScrollbar.prototype.beginReveal = function () {
            this._visibilityController.setShouldBeVisible(true);
        };
        AbstractScrollbar.prototype.beginHide = function () {
            this._visibilityController.setShouldBeVisible(false);
        };
        AbstractScrollbar.prototype.render = function () {
            if (!this._shouldRender) {
                return;
            }
            this._shouldRender = false;
            this._renderDomNode(this._scrollbarState.getRectangleLargeSize(), this._scrollbarState.getRectangleSmallSize());
            this._updateSlider(this._scrollbarState.getSliderSize(), this._scrollbarState.getArrowSize() + this._scrollbarState.getSliderPosition());
        };
        // ----------------- DOM events
        AbstractScrollbar.prototype._domNodeMouseDown = function (e) {
            if (e.target !== this.domNode.domNode) {
                return;
            }
            this._onMouseDown(e);
        };
        AbstractScrollbar.prototype.delegateMouseDown = function (browserEvent) {
            var e = new mouseEvent_1.StandardMouseEvent(browserEvent);
            var domTop = this.domNode.domNode.getClientRects()[0].top;
            var sliderStart = domTop + this._scrollbarState.getSliderPosition();
            var sliderStop = domTop + this._scrollbarState.getSliderPosition() + this._scrollbarState.getSliderSize();
            var mousePos = this._sliderMousePosition(e);
            if (sliderStart <= mousePos && mousePos <= sliderStop) {
                // Act as if it was a mouse down on the slider
                this._sliderMouseDown(e);
            }
            else {
                // Act as if it was a mouse down on the scrollbar
                this._onMouseDown(e);
            }
        };
        AbstractScrollbar.prototype._onMouseDown = function (e) {
            var domNodePosition = DomUtils.getDomNodePosition(this.domNode.domNode);
            var desiredSliderPosition = this._mouseDownRelativePosition(e, domNodePosition) - this._scrollbarState.getArrowSize() - this._scrollbarState.getSliderSize() / 2;
            this.setDesiredScrollPosition(this._scrollbarState.convertSliderPositionToScrollPosition(desiredSliderPosition));
            this._sliderMouseDown(e);
        };
        AbstractScrollbar.prototype._sliderMouseDown = function (e) {
            var _this = this;
            if (e.leftButton) {
                var initialMouseOrthogonalPosition_1 = this._sliderOrthogonalMousePosition(e);
                var initialScrollPosition_1 = this._getScrollPosition();
                var draggingDelta_1 = this._sliderMousePosition(e) - this._scrollbarState.getSliderPosition();
                this.slider.toggleClassName('active', true);
                this._mouseMoveMonitor.startMonitoring(globalMouseMoveMonitor_1.standardMouseMoveMerger, function (mouseMoveData) {
                    var mouseOrthogonalPosition = _this._sliderOrthogonalMousePosition(mouseMoveData);
                    var mouseOrthogonalDelta = Math.abs(mouseOrthogonalPosition - initialMouseOrthogonalPosition_1);
                    // console.log(initialMouseOrthogonalPosition + ' -> ' + mouseOrthogonalPosition + ': ' + mouseOrthogonalDelta);
                    if (Platform.isWindows && mouseOrthogonalDelta > MOUSE_DRAG_RESET_DISTANCE) {
                        // The mouse has wondered away from the scrollbar => reset dragging
                        _this.setDesiredScrollPosition(initialScrollPosition_1);
                    }
                    else {
                        var desiredSliderPosition = _this._sliderMousePosition(mouseMoveData) - draggingDelta_1;
                        _this.setDesiredScrollPosition(_this._scrollbarState.convertSliderPositionToScrollPosition(desiredSliderPosition));
                    }
                }, function () {
                    _this.slider.toggleClassName('active', false);
                    _this._parent.onDragEnd();
                });
                e.preventDefault();
                this._parent.onDragStart();
            }
        };
        AbstractScrollbar.prototype.validateScrollPosition = function (desiredScrollPosition) {
            return this._scrollbarState.validateScrollPosition(desiredScrollPosition);
        };
        AbstractScrollbar.prototype.setDesiredScrollPosition = function (desiredScrollPosition) {
            desiredScrollPosition = this.validateScrollPosition(desiredScrollPosition);
            var oldScrollPosition = this._getScrollPosition();
            this._setScrollPosition(desiredScrollPosition);
            var newScrollPosition = this._getScrollPosition();
            if (oldScrollPosition !== newScrollPosition) {
                this.onElementScrollPosition(this._getScrollPosition());
                return true;
            }
            return false;
        };
        return AbstractScrollbar;
    }(widget_1.Widget));
    exports.AbstractScrollbar = AbstractScrollbar;
    function setPosition(domNode, top, left, bottom, right) {
        if (top !== null) {
            domNode.style.top = top + 'px';
        }
        if (left !== null) {
            domNode.style.left = left + 'px';
        }
        if (bottom !== null) {
            domNode.style.bottom = bottom + 'px';
        }
        if (right !== null) {
            domNode.style.right = right + 'px';
        }
    }
    function setSize(domNode, width, height) {
        if (width !== null) {
            domNode.style.width = width + 'px';
        }
        if (height !== null) {
            domNode.style.height = height + 'px';
        }
    }
});
