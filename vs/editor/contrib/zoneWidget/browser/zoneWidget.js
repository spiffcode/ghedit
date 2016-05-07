/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/eventEmitter', 'vs/base/common/objects', 'vs/base/browser/dom', 'vs/editor/common/editorCommon', 'vs/css!./zoneWidget'], function (require, exports, eventEmitter_1, objects, dom, editorCommon_1) {
    'use strict';
    var defaultOptions = {
        showArrow: true,
        showFrame: true,
        frameColor: '',
        className: ''
    };
    var WIDGET_ID = 'vs.editor.contrib.zoneWidget';
    var ViewZoneDelegate = (function () {
        function ViewZoneDelegate(domNode, afterLineNumber, afterColumn, heightInLines, onDomNodeTop, onComputedHeight) {
            this.domNode = domNode;
            this.afterLineNumber = afterLineNumber;
            this.afterColumn = afterColumn;
            this.heightInLines = heightInLines;
            this._onDomNodeTop = onDomNodeTop;
            this._onComputedHeight = onComputedHeight;
        }
        ViewZoneDelegate.prototype.onDomNodeTop = function (top) {
            this._onDomNodeTop(top);
        };
        ViewZoneDelegate.prototype.onComputedHeight = function (height) {
            this._onComputedHeight(height);
        };
        return ViewZoneDelegate;
    }());
    var OverlayWidgetDelegate = (function () {
        function OverlayWidgetDelegate(id, domNode) {
            this._id = id;
            this._domNode = domNode;
        }
        OverlayWidgetDelegate.prototype.getId = function () {
            return this._id;
        };
        OverlayWidgetDelegate.prototype.getDomNode = function () {
            return this._domNode;
        };
        OverlayWidgetDelegate.prototype.getPosition = function () {
            return null;
        };
        return OverlayWidgetDelegate;
    }());
    // TODO@Joh - this is an event emitter, why?
    var ZoneWidget = (function (_super) {
        __extends(ZoneWidget, _super);
        function ZoneWidget(editor, options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            _super.call(this);
            this.editor = editor;
            this.options = objects.mixin(objects.clone(defaultOptions), options);
            this.zoneId = -1;
            this.overlayWidget = null;
            this.lastView = null;
            this.domNode = document.createElement('div');
            if (!this.options.isAccessible) {
                this.domNode.setAttribute('aria-hidden', 'true');
                this.domNode.setAttribute('role', 'presentation');
            }
            this.container = null;
            this.listenersToRemove = [];
            this.listenersToRemove.push(this.editor.addListener(editorCommon_1.EventType.EditorLayout, function (info) {
                var width = _this.getWidth(info);
                _this.domNode.style.width = width + 'px';
                _this.onWidth(width);
            }));
        }
        ZoneWidget.prototype.create = function () {
            dom.addClass(this.domNode, 'zone-widget');
            dom.addClass(this.domNode, this.options.className);
            this.container = document.createElement('div');
            dom.addClass(this.container, 'zone-widget-container');
            this.domNode.appendChild(this.container);
            this.fillContainer(this.container);
        };
        ZoneWidget.prototype.getWidth = function (info) {
            if (info === void 0) { info = this.editor.getLayoutInfo(); }
            return info.width - info.verticalScrollbarWidth;
        };
        ZoneWidget.prototype.onViewZoneTop = function (top) {
            this.domNode.style.top = top + 'px';
        };
        ZoneWidget.prototype.onViewZoneHeight = function (height) {
            this.domNode.style.height = height + 'px';
            this.doLayout(height - this._decoratingElementsHeight());
        };
        ZoneWidget.prototype.show = function (where, heightInLines) {
            if (typeof where.startLineNumber === 'number') {
                this.showImpl(where, heightInLines);
            }
            else {
                this.showImpl({
                    startLineNumber: where.lineNumber,
                    startColumn: where.column,
                    endLineNumber: where.lineNumber,
                    endColumn: where.column
                }, heightInLines);
            }
        };
        ZoneWidget.prototype._decoratingElementsHeight = function () {
            var lineHeight = this.editor.getConfiguration().lineHeight;
            var result = 0;
            if (this.options.showArrow) {
                var arrowHeight = Math.round(lineHeight / 3);
                result += 2 * arrowHeight;
            }
            if (this.options.showFrame) {
                var frameThickness = Math.round(lineHeight / 9);
                result += 2 * frameThickness;
            }
            return result;
        };
        ZoneWidget.prototype.showImpl = function (where, heightInLines) {
            var _this = this;
            var position = {
                lineNumber: where.startLineNumber,
                column: where.startColumn
            };
            this.domNode.style.width = this.getWidth() + 'px';
            // Reveal position, to get the line rendered, such that the arrow can be positioned properly
            this.editor.revealPosition(position);
            // Render the widget as zone (rendering) and widget (lifecycle)
            var viewZoneDomNode = document.createElement('div'), arrow = document.createElement('div'), lineHeight = this.editor.getConfiguration().lineHeight, arrowHeight = 0, frameThickness = 0;
            // Render the arrow one 1/3 of an editor line height
            if (this.options.showArrow) {
                arrowHeight = Math.round(lineHeight / 3);
                arrow = document.createElement('div');
                arrow.className = 'zone-widget-arrow below';
                arrow.style.top = -arrowHeight + 'px';
                arrow.style.borderWidth = arrowHeight + 'px';
                arrow.style.left = this.editor.getOffsetForColumn(position.lineNumber, position.column) + 'px';
                arrow.style.borderBottomColor = this.options.frameColor;
                viewZoneDomNode.appendChild(arrow);
            }
            // Render the frame as 1/9 of an editor line height
            if (this.options.showFrame) {
                frameThickness = Math.round(lineHeight / 9);
            }
            // insert zone widget
            this.editor.changeViewZones(function (accessor) {
                if (_this.zoneId !== -1) {
                    accessor.removeZone(_this.zoneId);
                }
                if (_this.overlayWidget) {
                    _this.editor.removeOverlayWidget(_this.overlayWidget);
                    _this.overlayWidget = null;
                }
                _this.domNode.style.top = '-1000px';
                var viewZone = new ViewZoneDelegate(viewZoneDomNode, position.lineNumber, position.column, heightInLines, function (top) { return _this.onViewZoneTop(top); }, function (height) { return _this.onViewZoneHeight(height); });
                _this.zoneId = accessor.addZone(viewZone);
                _this.overlayWidget = new OverlayWidgetDelegate(WIDGET_ID + _this.zoneId, _this.domNode);
                _this.editor.addOverlayWidget(_this.overlayWidget);
            });
            if (this.options.showFrame) {
                this.container.style.borderTopColor = this.options.frameColor;
                this.container.style.borderBottomColor = this.options.frameColor;
                this.container.style.borderTopWidth = frameThickness + 'px';
                this.container.style.borderBottomWidth = frameThickness + 'px';
            }
            var containerHeight = heightInLines * lineHeight - this._decoratingElementsHeight();
            this.container.style.top = arrowHeight + 'px';
            this.container.style.height = containerHeight + 'px';
            this.container.style.overflow = 'hidden';
            this.doLayout(containerHeight);
            this.editor.setSelection(where);
            // Reveal the line above or below the zone widget, to get the zone widget in the viewport
            var revealLineNumber = Math.min(this.editor.getModel().getLineCount(), Math.max(1, where.endLineNumber + 1));
            this.editor.revealLine(revealLineNumber);
            this.position = position;
        };
        ZoneWidget.prototype.dispose = function () {
            var _this = this;
            this.listenersToRemove.forEach(function (element) {
                element();
            });
            this.listenersToRemove = [];
            if (this.overlayWidget) {
                this.editor.removeOverlayWidget(this.overlayWidget);
                this.overlayWidget = null;
            }
            if (this.zoneId !== -1) {
                this.editor.changeViewZones(function (accessor) {
                    accessor.removeZone(_this.zoneId);
                    _this.zoneId = -1;
                });
            }
        };
        ZoneWidget.prototype.fillContainer = function (container) {
            // implement in subclass
        };
        ZoneWidget.prototype.onWidth = function (widthInPixel) {
            // implement in subclass
        };
        ZoneWidget.prototype.doLayout = function (heightInPixel) {
            // implement in subclass
        };
        return ZoneWidget;
    }(eventEmitter_1.EventEmitter));
    exports.ZoneWidget = ZoneWidget;
});
//# sourceMappingURL=zoneWidget.js.map