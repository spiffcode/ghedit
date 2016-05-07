/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls!vs/editor/contrib/zoneWidget/browser/peekViewWidget', 'vs/base/common/actions', 'vs/base/common/strings', 'vs/base/browser/builder', 'vs/base/browser/dom', 'vs/base/browser/ui/actionbar/actionbar', 'vs/platform/instantiation/common/instantiation', 'vs/editor/common/services/codeEditorService', './zoneWidget', 'vs/css!./peekViewWidget'], function (require, exports, nls, actions_1, strings, builder_1, dom, actionbar_1, instantiation_1, codeEditorService_1, zoneWidget_1) {
    'use strict';
    exports.IPeekViewService = instantiation_1.createDecorator('peekViewService');
    var Events;
    (function (Events) {
        Events.Closed = 'closed';
    })(Events = exports.Events || (exports.Events = {}));
    var CONTEXT_OUTER_EDITOR = 'outerEditorId';
    function getOuterEditor(accessor, args) {
        var outerEditorId = args.context[CONTEXT_OUTER_EDITOR];
        if (!outerEditorId) {
            return null;
        }
        return accessor.get(codeEditorService_1.ICodeEditorService).getCodeEditor(outerEditorId);
    }
    exports.getOuterEditor = getOuterEditor;
    var PeekViewWidget = (function (_super) {
        __extends(PeekViewWidget, _super);
        function PeekViewWidget(editor, keybindingService, contextKey, options) {
            if (options === void 0) { options = {}; }
            _super.call(this, editor, options);
            this.serviceId = exports.IPeekViewService;
            this.contextKey = contextKey;
            keybindingService.createKey(CONTEXT_OUTER_EDITOR, editor.getId());
        }
        PeekViewWidget.prototype.dispose = function () {
            this._isActive = false;
            _super.prototype.dispose.call(this);
        };
        Object.defineProperty(PeekViewWidget.prototype, "isActive", {
            get: function () {
                return this._isActive;
            },
            enumerable: true,
            configurable: true
        });
        PeekViewWidget.prototype.getActiveWidget = function () {
            return this;
        };
        PeekViewWidget.prototype.show = function (where, heightInLines) {
            this._isActive = true;
            _super.prototype.show.call(this, where, heightInLines);
        };
        PeekViewWidget.prototype.fillContainer = function (container) {
            builder_1.$(container).addClass('peekview-widget');
            this._headElement = builder_1.$('.head').getHTMLElement();
            this._bodyElement = builder_1.$('.body').getHTMLElement();
            this._fillHead(this._headElement);
            this._fillBody(this._bodyElement);
            container.appendChild(this._headElement);
            container.appendChild(this._bodyElement);
        };
        PeekViewWidget.prototype._fillHead = function (container) {
            var _this = this;
            var titleElement = builder_1.$('.peekview-title').
                on(dom.EventType.CLICK, function (e) { return _this._onTitleClick(e); }).
                appendTo(this._headElement).
                getHTMLElement();
            this._primaryHeading = builder_1.$('span.filename').appendTo(titleElement).getHTMLElement();
            this._secondaryHeading = builder_1.$('span.dirname').appendTo(titleElement).getHTMLElement();
            this._metaHeading = builder_1.$('span.meta').appendTo(titleElement).getHTMLElement();
            this._actionbarWidget = new actionbar_1.ActionBar(builder_1.$('.peekview-actions').
                appendTo(this._headElement));
            this._actionbarWidget.push(new actions_1.Action('peekview.close', nls.localize(0, null), 'close-peekview-action', true, function () {
                _this.dispose();
                _this.emit(Events.Closed, _this);
                return null;
            }), { label: false, icon: true });
        };
        PeekViewWidget.prototype._onTitleClick = function (event) {
            // implement me
        };
        PeekViewWidget.prototype.setTitle = function (primaryHeading, secondaryHeading) {
            builder_1.$(this._primaryHeading).safeInnerHtml(primaryHeading);
            if (secondaryHeading) {
                builder_1.$(this._secondaryHeading).safeInnerHtml(secondaryHeading);
            }
            else {
                dom.clearNode(this._secondaryHeading);
            }
        };
        PeekViewWidget.prototype.setMetaTitle = function (value) {
            if (value) {
                builder_1.$(this._metaHeading).safeInnerHtml(value);
            }
            else {
                dom.clearNode(this._metaHeading);
            }
        };
        PeekViewWidget.prototype._fillBody = function (container) {
            // implement me
        };
        PeekViewWidget.prototype.doLayout = function (heightInPixel) {
            if (heightInPixel < 0) {
                // Looks like the view zone got folded away!
                this.dispose();
                this.emit(Events.Closed, this);
                return;
            }
            var headHeight = Math.ceil(this.editor.getConfiguration().lineHeight * 1.2), bodyHeight = heightInPixel - (headHeight + 2 /* the border-top/bottom width*/);
            this._doLayoutHead(headHeight);
            this._doLayoutBody(bodyHeight);
        };
        PeekViewWidget.prototype._doLayoutHead = function (heightInPixel) {
            this._headElement.style.height = strings.format('{0}px', heightInPixel);
            this._headElement.style.lineHeight = this._headElement.style.height;
        };
        PeekViewWidget.prototype._doLayoutBody = function (heightInPixel) {
            this._bodyElement.style.height = strings.format('{0}px', heightInPixel);
        };
        return PeekViewWidget;
    }(zoneWidget_1.ZoneWidget));
    exports.PeekViewWidget = PeekViewWidget;
});
//# sourceMappingURL=peekViewWidget.js.map