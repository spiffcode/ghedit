/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/nls!vs/workbench/parts/debug/browser/breakpointWidget', 'vs/base/common/async', 'vs/base/common/errors', 'vs/base/common/keyCodes', 'vs/base/common/platform', 'vs/base/common/lifecycle', 'vs/base/browser/dom', 'vs/base/browser/ui/inputbox/inputBox', 'vs/editor/common/editorCommonExtensions', 'vs/editor/common/editorCommon', 'vs/editor/contrib/zoneWidget/browser/zoneWidget', 'vs/platform/contextview/browser/contextView', 'vs/platform/keybinding/common/keybindingService', 'vs/workbench/parts/debug/common/debug', 'vs/css!../browser/media/breakpointWidget'], function (require, exports, nls, async, errors, keyCodes_1, platform, lifecycle, dom, inputBox_1, editorCommonExtensions_1, editorcommon, zoneWidget_1, contextView_1, keybindingService_1, debug) {
    "use strict";
    var $ = dom.emmet;
    var CONTEXT_BREAKPOINT_WIDGET_VISIBLE = 'breakpointWidgetVisible';
    var CLOSE_BREAKPOINT_WIDGET_COMMAND_ID = 'closeBreakpointWidget';
    var BreakpointWidget = (function (_super) {
        __extends(BreakpointWidget, _super);
        function BreakpointWidget(editor, lineNumber, contextViewService, debugService, keybindingService) {
            var _this = this;
            _super.call(this, editor, { showFrame: true, showArrow: false });
            this.lineNumber = lineNumber;
            this.contextViewService = contextViewService;
            this.debugService = debugService;
            this.toDispose = [];
            this.create();
            this.breakpointWidgetVisible = keybindingService.createKey(CONTEXT_BREAKPOINT_WIDGET_VISIBLE, false);
            this.breakpointWidgetVisible.set(true);
            BreakpointWidget.INSTANCE = this;
            this.toDispose.push(editor.addListener2(editorcommon.EventType.ModelChanged, function () { return _this.dispose(); }));
        }
        BreakpointWidget.prototype.fillContainer = function (container) {
            var _this = this;
            dom.addClass(container, 'breakpoint-widget');
            var uri = this.editor.getModel().getAssociatedResource();
            var breakpoint = this.debugService.getModel().getBreakpoints().filter(function (bp) { return bp.lineNumber === _this.lineNumber && bp.source.uri.toString() === uri.toString(); }).pop();
            var inputBoxContainer = dom.append(container, $('.inputBoxContainer'));
            this.inputBox = new inputBox_1.InputBox(inputBoxContainer, this.contextViewService, {
                placeholder: nls.localize(0, null, this.lineNumber),
                ariaLabel: nls.localize(1, null)
            });
            this.toDispose.push(this.inputBox);
            dom.addClass(this.inputBox.inputElement, platform.isWindows ? 'windows' : platform.isMacintosh ? 'mac' : 'linux');
            this.inputBox.value = (breakpoint && breakpoint.condition) ? breakpoint.condition : '';
            // Due to an electron bug we have to do the timeout, otherwise we do not get focus
            setTimeout(function () { return _this.inputBox.focus(); }, 0);
            var disposed = false;
            var wrapUp = async.once(function (success) {
                if (!disposed) {
                    disposed = true;
                    if (success) {
                        var raw = {
                            uri: uri,
                            lineNumber: _this.lineNumber,
                            enabled: true,
                            condition: _this.inputBox.value
                        };
                        // if there is already a breakpoint on this location - remove it.
                        if (_this.debugService.getModel().getBreakpoints().some(function (bp) { return bp.lineNumber === _this.lineNumber && bp.source.uri.toString() === uri.toString(); })) {
                            _this.debugService.toggleBreakpoint(raw).done(null, errors.onUnexpectedError);
                        }
                        _this.debugService.toggleBreakpoint(raw).done(null, errors.onUnexpectedError);
                    }
                    _this.dispose();
                }
            });
            this.toDispose.push(dom.addStandardDisposableListener(this.inputBox.inputElement, 'keydown', function (e) {
                var isEscape = e.equals(keyCodes_1.CommonKeybindings.ESCAPE);
                var isEnter = e.equals(keyCodes_1.CommonKeybindings.ENTER);
                if (isEscape || isEnter) {
                    e.stopPropagation();
                    wrapUp(isEnter);
                }
            }));
        };
        BreakpointWidget.prototype.dispose = function () {
            var _this = this;
            _super.prototype.dispose.call(this);
            this.breakpointWidgetVisible.reset();
            BreakpointWidget.INSTANCE = undefined;
            lifecycle.dispose(this.toDispose);
            setTimeout(function () { return _this.editor.focus(); }, 0);
        };
        BreakpointWidget = __decorate([
            __param(2, contextView_1.IContextViewService),
            __param(3, debug.IDebugService),
            __param(4, keybindingService_1.IKeybindingService)
        ], BreakpointWidget);
        return BreakpointWidget;
    }(zoneWidget_1.ZoneWidget));
    exports.BreakpointWidget = BreakpointWidget;
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorCommand(CLOSE_BREAKPOINT_WIDGET_COMMAND_ID, editorCommonExtensions_1.CommonEditorRegistry.commandWeight(8), { primary: keyCodes_1.KeyCode.Escape, secondary: [keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.Escape] }, false, CONTEXT_BREAKPOINT_WIDGET_VISIBLE, function (ctx, editor, args) {
        if (BreakpointWidget.INSTANCE) {
            BreakpointWidget.INSTANCE.dispose();
        }
    });
});
//# sourceMappingURL=breakpointWidget.js.map