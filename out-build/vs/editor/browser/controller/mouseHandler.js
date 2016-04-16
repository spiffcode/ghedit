var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/lifecycle', 'vs/base/common/platform', 'vs/base/browser/browser', 'vs/base/browser/dom', 'vs/base/browser/globalMouseMoveMonitor', 'vs/base/browser/mouseEvent', 'vs/editor/common/core/position', 'vs/editor/common/core/selection', 'vs/editor/common/editorCommon', 'vs/editor/common/viewModel/viewEventHandler', 'vs/editor/browser/controller/mouseTarget', 'vs/base/common/async'], function (require, exports, lifecycle_1, platform, browser, dom, globalMouseMoveMonitor_1, mouseEvent_1, position_1, selection_1, editorCommon, viewEventHandler_1, mouseTarget_1, async_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /**
     * Merges mouse events when mouse move events are throttled
     */
    function createMouseMoveEventMerger(mouseTargetFactory) {
        return function (lastEvent, currentEvent) {
            var r = new mouseEvent_1.StandardMouseEvent(currentEvent);
            var targetIsWidget = false;
            if (mouseTargetFactory) {
                targetIsWidget = mouseTargetFactory.mouseTargetIsWidget(r);
            }
            if (!targetIsWidget) {
                r.preventDefault();
            }
            return r;
        };
    }
    var EventGateKeeper = (function (_super) {
        __extends(EventGateKeeper, _super);
        function EventGateKeeper(destination, condition) {
            var _this = this;
            _super.call(this);
            this._destination = destination;
            this._condition = condition;
            this._retryTimer = this._register(new async_1.TimeoutTimer());
            this.handler = function (value) { return _this._handle(value); };
        }
        EventGateKeeper.prototype.dispose = function () {
            this._retryValue = null;
            _super.prototype.dispose.call(this);
        };
        EventGateKeeper.prototype._handle = function (value) {
            var _this = this;
            if (this._condition()) {
                this._retryTimer.cancel();
                this._retryValue = null;
                this._destination(value);
            }
            else {
                this._retryValue = value;
                this._retryTimer.setIfNotSet(function () {
                    var tmp = _this._retryValue;
                    _this._retryValue = null;
                    _this._handle(tmp);
                }, 10);
            }
        };
        return EventGateKeeper;
    }(lifecycle_1.Disposable));
    var MousePosition = (function () {
        function MousePosition(position, mouseColumn) {
            this.position = position;
            this.mouseColumn = mouseColumn;
        }
        return MousePosition;
    }());
    var MouseHandler = (function (_super) {
        __extends(MouseHandler, _super);
        function MouseHandler(context, viewController, viewHelper) {
            var _this = this;
            _super.call(this);
            this.context = context;
            this.viewController = viewController;
            this.viewHelper = viewHelper;
            this.mouseTargetFactory = new mouseTarget_1.MouseTargetFactory(this.context, viewHelper);
            this.listenersToRemove = [];
            this._mouseDownOperation = new MouseDownOperation(this.context, this.viewController, this.viewHelper, function (e, testEventTarget) { return _this._createMouseTarget(e, testEventTarget); }, function (e) { return _this._getMouseColumn(e); });
            this.toDispose = [];
            this.lastMouseLeaveTime = -1;
            this.listenersToRemove.push(dom.addDisposableListener(this.viewHelper.viewDomNode, 'contextmenu', function (e) { return _this._onContextMenu(e, true); }));
            this._mouseMoveEventHandler = new EventGateKeeper(function (e) { return _this._onMouseMove(e); }, function () { return !_this.viewHelper.isDirty(); });
            this.toDispose.push(this._mouseMoveEventHandler);
            this.listenersToRemove.push(dom.addDisposableThrottledListener(this.viewHelper.viewDomNode, 'mousemove', this._mouseMoveEventHandler.handler, createMouseMoveEventMerger(this.mouseTargetFactory), MouseHandler.MOUSE_MOVE_MINIMUM_TIME));
            this.listenersToRemove.push(dom.addDisposableListener(this.viewHelper.viewDomNode, 'mouseup', function (e) { return _this._onMouseUp(e); }));
            this.listenersToRemove.push(dom.addDisposableNonBubblingMouseOutListener(this.viewHelper.viewDomNode, function (e) { return _this._onMouseLeave(e); }));
            this.listenersToRemove.push(dom.addDisposableListener(this.viewHelper.viewDomNode, 'mousedown', function (e) { return _this._onMouseDown(e); }));
            this.context.addEventHandler(this);
        }
        MouseHandler.prototype.dispose = function () {
            this.context.removeEventHandler(this);
            this.listenersToRemove = lifecycle_1.dispose(this.listenersToRemove);
            this.toDispose = lifecycle_1.dispose(this.toDispose);
            this._mouseDownOperation.dispose();
        };
        MouseHandler.prototype.onLayoutChanged = function (layoutInfo) {
            this._layoutInfo = layoutInfo;
            return false;
        };
        MouseHandler.prototype.onScrollChanged = function (e) {
            this._mouseDownOperation.onScrollChanged();
            return false;
        };
        MouseHandler.prototype.onCursorSelectionChanged = function (e) {
            this._mouseDownOperation.onCursorSelectionChanged(e);
            return false;
        };
        // --- end event handlers
        MouseHandler.prototype._createMouseTarget = function (e, testEventTarget) {
            var editorContent = dom.getDomNodePosition(this.viewHelper.viewDomNode);
            return this.mouseTargetFactory.createMouseTarget(this._layoutInfo, editorContent, e, testEventTarget);
        };
        MouseHandler.prototype._getMouseColumn = function (e) {
            var editorContent = dom.getDomNodePosition(this.viewHelper.viewDomNode);
            return this.mouseTargetFactory.getMouseColumn(this._layoutInfo, editorContent, e);
        };
        MouseHandler.prototype._onContextMenu = function (rawEvent, testEventTarget) {
            var e = new mouseEvent_1.StandardMouseEvent(rawEvent);
            var t = this._createMouseTarget(e, testEventTarget);
            var mouseEvent = {
                event: e,
                target: t
            };
            this.viewController.emitContextMenu(mouseEvent);
        };
        MouseHandler.prototype._onMouseMove = function (e) {
            if (this._mouseDownOperation.isActive()) {
                // In selection/drag operation
                return;
            }
            var actualMouseMoveTime = e.timestamp;
            if (actualMouseMoveTime < this.lastMouseLeaveTime) {
                // Due to throttling, this event occured before the mouse left the editor, therefore ignore it.
                return;
            }
            var t = this._createMouseTarget(e, true);
            var mouseEvent = {
                event: e,
                target: t
            };
            this.viewController.emitMouseMove(mouseEvent);
        };
        MouseHandler.prototype._onMouseLeave = function (rawEvent) {
            this.lastMouseLeaveTime = (new Date()).getTime();
            var mouseEvent = {
                event: new mouseEvent_1.StandardMouseEvent(rawEvent),
                target: null
            };
            this.viewController.emitMouseLeave(mouseEvent);
        };
        MouseHandler.prototype._onMouseUp = function (rawEvent) {
            var e = new mouseEvent_1.StandardMouseEvent(rawEvent);
            var t = this._createMouseTarget(e, true);
            var mouseEvent = {
                event: e,
                target: t
            };
            this.viewController.emitMouseUp(mouseEvent);
        };
        MouseHandler.prototype._onMouseDown = function (rawEvent) {
            var _this = this;
            var e = new mouseEvent_1.StandardMouseEvent(rawEvent);
            var t = this._createMouseTarget(e, true);
            var targetIsContent = (t.type === editorCommon.MouseTargetType.CONTENT_TEXT || t.type === editorCommon.MouseTargetType.CONTENT_EMPTY);
            var targetIsGutter = (t.type === editorCommon.MouseTargetType.GUTTER_GLYPH_MARGIN || t.type === editorCommon.MouseTargetType.GUTTER_LINE_NUMBERS || t.type === editorCommon.MouseTargetType.GUTTER_LINE_DECORATIONS);
            var targetIsLineNumbers = (t.type === editorCommon.MouseTargetType.GUTTER_LINE_NUMBERS);
            var selectOnLineNumbers = this.context.configuration.editor.selectOnLineNumbers;
            var targetIsViewZone = (t.type === editorCommon.MouseTargetType.CONTENT_VIEW_ZONE || t.type === editorCommon.MouseTargetType.GUTTER_VIEW_ZONE);
            var shouldHandle = e.leftButton;
            if (platform.isMacintosh && e.ctrlKey) {
                shouldHandle = false;
            }
            if (shouldHandle && (targetIsContent || (targetIsLineNumbers && selectOnLineNumbers))) {
                if (browser.isIE11orEarlier) {
                    // IE does not want to focus when coming in from the browser's address bar
                    if (e.browserEvent.fromElement) {
                        e.preventDefault();
                        this.viewHelper.focusTextArea();
                    }
                    else {
                        // TODO@Alex -> cancel this if focus is lost
                        setTimeout(function () {
                            _this.viewHelper.focusTextArea();
                        });
                    }
                }
                else {
                    e.preventDefault();
                    this.viewHelper.focusTextArea();
                }
                this._mouseDownOperation.start(t.type, e);
            }
            else if (targetIsGutter) {
                // Do not steal focus
                e.preventDefault();
            }
            else if (targetIsViewZone) {
                var viewZoneData = t.detail;
                if (this.viewHelper.shouldSuppressMouseDownOnViewZone(viewZoneData.viewZoneId)) {
                    e.preventDefault();
                }
            }
            var mouseEvent = {
                event: e,
                target: t
            };
            this.viewController.emitMouseDown(mouseEvent);
        };
        MouseHandler.MOUSE_MOVE_MINIMUM_TIME = 100; // ms
        return MouseHandler;
    }(viewEventHandler_1.ViewEventHandler));
    exports.MouseHandler = MouseHandler;
    var MouseDownOperation = (function (_super) {
        __extends(MouseDownOperation, _super);
        function MouseDownOperation(context, viewController, viewHelper, createMouseTarget, getMouseColumn) {
            var _this = this;
            _super.call(this);
            this._context = context;
            this._viewController = viewController;
            this._viewHelper = viewHelper;
            this._createMouseTarget = createMouseTarget;
            this._getMouseColumn = getMouseColumn;
            this._currentSelection = selection_1.Selection.createSelection(1, 1, 1, 1);
            this._mouseState = new MouseDownState();
            this._onScrollTimeout = this._register(new async_1.TimeoutTimer());
            this._isActive = false;
            this._lastMouseEvent = null;
            this._mouseMoveMonitor = this._register(new globalMouseMoveMonitor_1.GlobalMouseMoveMonitor());
            this._mouseDownThenMoveEventHandler = this._register(new EventGateKeeper(function (e) { return _this._onMouseDownThenMove(e); }, function () { return !_this._viewHelper.isDirty(); }));
        }
        MouseDownOperation.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
        };
        MouseDownOperation.prototype.isActive = function () {
            return this._isActive;
        };
        MouseDownOperation.prototype._onMouseDownThenMove = function (e) {
            this._lastMouseEvent = e;
            this._mouseState.setModifiers(e);
            var position = this._findMousePosition(e, true);
            if (!position) {
                // Ignoring because position is unknown
                return;
            }
            this._dispatchMouse(position, true);
        };
        MouseDownOperation.prototype.start = function (targetType, e) {
            var _this = this;
            this._lastMouseEvent = e;
            this._mouseState.setStartedOnLineNumbers(targetType === editorCommon.MouseTargetType.GUTTER_LINE_NUMBERS);
            this._mouseState.setModifiers(e);
            var position = this._findMousePosition(e, true);
            if (!position) {
                // Ignoring because position is unknown
                return;
            }
            this._mouseState.trySetCount(e.detail, position.position);
            // Overwrite the detail of the MouseEvent, as it will be sent out in an event and contributions might rely on it.
            e.detail = this._mouseState.count;
            this._dispatchMouse(position, e.shiftKey);
            if (!this._isActive) {
                this._isActive = true;
                this._mouseMoveMonitor.startMonitoring(createMouseMoveEventMerger(null), this._mouseDownThenMoveEventHandler.handler, function () { return _this._stop(); });
            }
        };
        MouseDownOperation.prototype._stop = function () {
            this._isActive = false;
            this._onScrollTimeout.cancel();
        };
        MouseDownOperation.prototype.onScrollChanged = function () {
            var _this = this;
            if (!this._isActive) {
                return;
            }
            this._onScrollTimeout.setIfNotSet(function () {
                var position = _this._findMousePosition(_this._lastMouseEvent, false);
                if (!position) {
                    // Ignoring because position is unknown
                    return;
                }
                _this._dispatchMouse(position, true);
            }, 10);
        };
        MouseDownOperation.prototype.onCursorSelectionChanged = function (e) {
            this._currentSelection = e.selection;
        };
        // private _getMouseColumn(e: ISimplifiedMouseEvent)
        MouseDownOperation.prototype._getPositionOutsideEditor = function (e) {
            var editorContent = dom.getDomNodePosition(this._viewHelper.viewDomNode);
            var mouseColumn = this._getMouseColumn(e);
            if (e.posy < editorContent.top) {
                var aboveLineNumber = this._viewHelper.getLineNumberAtVerticalOffset(Math.max(this._viewHelper.getScrollTop() - (editorContent.top - e.posy), 0));
                return new MousePosition(new position_1.Position(aboveLineNumber, 1), mouseColumn);
            }
            if (e.posy > editorContent.top + editorContent.height) {
                var belowLineNumber = this._viewHelper.getLineNumberAtVerticalOffset(this._viewHelper.getScrollTop() + (e.posy - editorContent.top));
                return new MousePosition(new position_1.Position(belowLineNumber, this._context.model.getLineMaxColumn(belowLineNumber)), mouseColumn);
            }
            var possibleLineNumber = this._viewHelper.getLineNumberAtVerticalOffset(this._viewHelper.getScrollTop() + (e.posy - editorContent.top));
            if (e.posx < editorContent.left) {
                return new MousePosition(new position_1.Position(possibleLineNumber, 1), mouseColumn);
            }
            if (e.posx > editorContent.left + editorContent.width) {
                return new MousePosition(new position_1.Position(possibleLineNumber, this._context.model.getLineMaxColumn(possibleLineNumber)), mouseColumn);
            }
            return null;
        };
        MouseDownOperation.prototype._findMousePosition = function (e, testEventTarget) {
            var positionOutsideEditor = this._getPositionOutsideEditor(e);
            if (positionOutsideEditor) {
                return positionOutsideEditor;
            }
            var t = this._createMouseTarget(e, testEventTarget);
            var hintedPosition = t.position;
            if (!hintedPosition) {
                return null;
            }
            if (t.type === editorCommon.MouseTargetType.CONTENT_VIEW_ZONE || t.type === editorCommon.MouseTargetType.GUTTER_VIEW_ZONE) {
                // Force position on view zones to go above or below depending on where selection started from
                var selectionStart = new position_1.Position(this._currentSelection.selectionStartLineNumber, this._currentSelection.selectionStartColumn);
                var viewZoneData = t.detail;
                var positionBefore = viewZoneData.positionBefore;
                var positionAfter = viewZoneData.positionAfter;
                if (positionBefore && positionAfter) {
                    if (positionBefore.isBefore(selectionStart)) {
                        return new MousePosition(positionBefore, t.mouseColumn);
                    }
                    else {
                        return new MousePosition(positionAfter, t.mouseColumn);
                    }
                }
            }
            return new MousePosition(hintedPosition, t.mouseColumn);
        };
        MouseDownOperation.prototype._dispatchMouse = function (position, inSelectionMode) {
            this._viewController.dispatchMouse({
                position: position.position,
                mouseColumn: position.mouseColumn,
                startedOnLineNumbers: this._mouseState.startedOnLineNumbers,
                inSelectionMode: inSelectionMode,
                mouseDownCount: this._mouseState.count,
                altKey: this._mouseState.altKey,
                ctrlKey: this._mouseState.ctrlKey,
                metaKey: this._mouseState.metaKey,
                shiftKey: this._mouseState.shiftKey,
            });
        };
        return MouseDownOperation;
    }(lifecycle_1.Disposable));
    var MouseDownState = (function () {
        function MouseDownState() {
            this._altKey = false;
            this._ctrlKey = false;
            this._metaKey = false;
            this._shiftKey = false;
            this._startedOnLineNumbers = false;
            this._lastMouseDownPosition = null;
            this._lastMouseDownPositionEqualCount = 0;
            this._lastMouseDownCount = 0;
            this._lastSetMouseDownCountTime = 0;
        }
        Object.defineProperty(MouseDownState.prototype, "altKey", {
            get: function () { return this._altKey; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MouseDownState.prototype, "ctrlKey", {
            get: function () { return this._ctrlKey; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MouseDownState.prototype, "metaKey", {
            get: function () { return this._metaKey; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MouseDownState.prototype, "shiftKey", {
            get: function () { return this._shiftKey; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MouseDownState.prototype, "startedOnLineNumbers", {
            get: function () { return this._startedOnLineNumbers; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MouseDownState.prototype, "count", {
            get: function () {
                return this._lastMouseDownCount;
            },
            enumerable: true,
            configurable: true
        });
        MouseDownState.prototype.setModifiers = function (source) {
            this._altKey = source.altKey;
            this._ctrlKey = source.ctrlKey;
            this._metaKey = source.metaKey;
            this._shiftKey = source.shiftKey;
        };
        MouseDownState.prototype.setStartedOnLineNumbers = function (startedOnLineNumbers) {
            this._startedOnLineNumbers = startedOnLineNumbers;
        };
        MouseDownState.prototype.trySetCount = function (setMouseDownCount, newMouseDownPosition) {
            // a. Invalidate multiple clicking if too much time has passed (will be hit by IE because the detail field of mouse events contains garbage in IE10)
            var currentTime = (new Date()).getTime();
            if (currentTime - this._lastSetMouseDownCountTime > MouseDownState.CLEAR_MOUSE_DOWN_COUNT_TIME) {
                setMouseDownCount = 1;
            }
            this._lastSetMouseDownCountTime = currentTime;
            // b. Ensure that we don't jump from single click to triple click in one go (will be hit by IE because the detail field of mouse events contains garbage in IE10)
            if (setMouseDownCount > this._lastMouseDownCount + 1) {
                setMouseDownCount = this._lastMouseDownCount + 1;
            }
            // c. Invalidate multiple clicking if the logical position is different
            if (this._lastMouseDownPosition && this._lastMouseDownPosition.equals(newMouseDownPosition)) {
                this._lastMouseDownPositionEqualCount++;
            }
            else {
                this._lastMouseDownPositionEqualCount = 1;
            }
            this._lastMouseDownPosition = newMouseDownPosition;
            // Finally set the lastMouseDownCount
            this._lastMouseDownCount = Math.min(setMouseDownCount, this._lastMouseDownPositionEqualCount);
        };
        MouseDownState.CLEAR_MOUSE_DOWN_COUNT_TIME = 400; // ms
        return MouseDownState;
    }());
});
