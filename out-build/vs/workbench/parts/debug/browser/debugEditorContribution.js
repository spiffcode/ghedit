/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/nls!vs/workbench/parts/debug/browser/debugEditorContribution', 'vs/base/common/winjs.base', 'vs/base/common/async', 'vs/base/common/lifecycle', 'vs/base/common/platform', 'vs/base/common/actions', 'vs/base/common/keyCodes', 'vs/editor/common/editorCommon', 'vs/workbench/parts/debug/browser/debugHover', 'vs/workbench/parts/debug/electron-browser/debugActions', 'vs/workbench/parts/debug/common/debug', 'vs/workbench/services/workspace/common/contextService', 'vs/platform/instantiation/common/instantiation', 'vs/platform/contextview/browser/contextView'], function (require, exports, nls, winjs_base_1, async_1, lifecycle, env, actions_1, keyCodes_1, editorcommon, debugHover_1, debugactions, debug, contextService_1, instantiation_1, contextView_1) {
    "use strict";
    var HOVER_DELAY = 300;
    var DebugEditorContribution = (function () {
        function DebugEditorContribution(editor, debugService, contextService, contextMenuService, instantiationService) {
            var _this = this;
            this.editor = editor;
            this.debugService = debugService;
            this.contextService = contextService;
            this.contextMenuService = contextMenuService;
            this.instantiationService = instantiationService;
            this.breakpointHintDecoration = [];
            this.hoverWidget = new debugHover_1.DebugHoverWidget(this.editor, this.debugService, this.instantiationService);
            this.toDispose = [this.hoverWidget];
            this.showHoverScheduler = new async_1.RunOnceScheduler(function () { return _this.showHover(_this.hoverRange, _this.hoveringOver, false); }, HOVER_DELAY);
            this.hideHoverScheduler = new async_1.RunOnceScheduler(function () { return _this.hoverWidget.hide(); }, HOVER_DELAY);
            this.registerListeners();
        }
        DebugEditorContribution.getDebugEditorContribution = function (editor) {
            return editor.getContribution(debug.EDITOR_CONTRIBUTION_ID);
        };
        DebugEditorContribution.prototype.getContextMenuActions = function (breakpoint, uri, lineNumber) {
            var _this = this;
            var actions = [];
            if (breakpoint) {
                actions.push(this.instantiationService.createInstance(debugactions.RemoveBreakpointAction, debugactions.RemoveBreakpointAction.ID, debugactions.RemoveBreakpointAction.LABEL));
                actions.push(this.instantiationService.createInstance(debugactions.EditConditionalBreakpointAction, debugactions.EditConditionalBreakpointAction.ID, debugactions.EditConditionalBreakpointAction.LABEL, this.editor, lineNumber));
                actions.push(this.instantiationService.createInstance(debugactions.ToggleEnablementAction, debugactions.ToggleEnablementAction.ID, debugactions.ToggleEnablementAction.LABEL));
            }
            else {
                actions.push(new actions_1.Action('addBreakpoint', nls.localize(0, null), null, true, function () { return _this.debugService.toggleBreakpoint({ uri: uri, lineNumber: lineNumber }); }));
                actions.push(this.instantiationService.createInstance(debugactions.AddConditionalBreakpointAction, debugactions.AddConditionalBreakpointAction.ID, debugactions.AddConditionalBreakpointAction.LABEL, this.editor, lineNumber));
            }
            return winjs_base_1.TPromise.as(actions);
        };
        DebugEditorContribution.prototype.registerListeners = function () {
            var _this = this;
            this.toDispose.push(this.editor.addListener2(editorcommon.EventType.MouseDown, function (e) {
                if (e.target.type !== editorcommon.MouseTargetType.GUTTER_GLYPH_MARGIN || e.target.detail) {
                    return;
                }
                if (!_this.debugService.canSetBreakpointsIn(_this.editor.getModel())) {
                    return;
                }
                var lineNumber = e.target.position.lineNumber;
                var uri = _this.editor.getModel().getAssociatedResource();
                if (e.event.rightButton || (env.isMacintosh && e.event.leftButton && e.event.ctrlKey)) {
                    var anchor_1 = { x: e.event.posx + 1, y: e.event.posy };
                    var breakpoint_1 = _this.debugService.getModel().getBreakpoints().filter(function (bp) { return bp.lineNumber === lineNumber && bp.source.uri.toString() === uri.toString(); }).pop();
                    _this.contextMenuService.showContextMenu({
                        getAnchor: function () { return anchor_1; },
                        getActions: function () { return _this.getContextMenuActions(breakpoint_1, uri, lineNumber); },
                        getActionsContext: function () { return breakpoint_1; }
                    });
                }
                else {
                    _this.debugService.toggleBreakpoint({ uri: uri, lineNumber: lineNumber });
                }
            }));
            this.toDispose.push(this.editor.addListener2(editorcommon.EventType.MouseMove, function (e) {
                var showBreakpointHintAtLineNumber = -1;
                if (e.target.type === editorcommon.MouseTargetType.GUTTER_GLYPH_MARGIN && _this.debugService.canSetBreakpointsIn(_this.editor.getModel())) {
                    if (!e.target.detail) {
                        // is not after last line
                        showBreakpointHintAtLineNumber = e.target.position.lineNumber;
                    }
                }
                _this.ensureBreakpointHintDecoration(showBreakpointHintAtLineNumber);
            }));
            this.toDispose.push(this.editor.addListener2(editorcommon.EventType.MouseLeave, function (e) {
                _this.ensureBreakpointHintDecoration(-1);
            }));
            this.toDispose.push(this.debugService.addListener2(debug.ServiceEvents.STATE_CHANGED, function () { return _this.onDebugStateUpdate(); }));
            // hover listeners & hover widget
            this.toDispose.push(this.editor.addListener2(editorcommon.EventType.MouseDown, function (e) { return _this.onEditorMouseDown(e); }));
            this.toDispose.push(this.editor.addListener2(editorcommon.EventType.MouseMove, function (e) { return _this.onEditorMouseMove(e); }));
            this.toDispose.push(this.editor.addListener2(editorcommon.EventType.MouseLeave, function (e) { return _this.hoverWidget.hide(); }));
            this.toDispose.push(this.editor.addListener2(editorcommon.EventType.KeyDown, function (e) { return _this.onKeyDown(e); }));
            this.toDispose.push(this.editor.addListener2(editorcommon.EventType.ModelChanged, function () { return _this.hideHoverWidget(); }));
            this.toDispose.push(this.editor.addListener2('scroll', function () { return _this.hideHoverWidget; }));
        };
        DebugEditorContribution.prototype.getId = function () {
            return debug.EDITOR_CONTRIBUTION_ID;
        };
        DebugEditorContribution.prototype.showHover = function (range, hoveringOver, focus) {
            return this.hoverWidget.showAt(range, hoveringOver, focus);
        };
        DebugEditorContribution.prototype.ensureBreakpointHintDecoration = function (showBreakpointHintAtLineNumber) {
            var newDecoration = [];
            if (showBreakpointHintAtLineNumber !== -1) {
                newDecoration.push({
                    options: DebugEditorContribution.BREAKPOINT_HELPER_DECORATION,
                    range: {
                        startLineNumber: showBreakpointHintAtLineNumber,
                        startColumn: 1,
                        endLineNumber: showBreakpointHintAtLineNumber,
                        endColumn: 1
                    }
                });
            }
            this.breakpointHintDecoration = this.editor.deltaDecorations(this.breakpointHintDecoration, newDecoration);
        };
        DebugEditorContribution.prototype.onDebugStateUpdate = function () {
            if (this.debugService.getState() !== debug.State.Stopped) {
                this.hideHoverWidget();
            }
            this.contextService.updateOptions('editor', {
                hover: this.debugService.getState() !== debug.State.Stopped
            });
        };
        DebugEditorContribution.prototype.hideHoverWidget = function () {
            if (!this.hideHoverScheduler.isScheduled() && this.hoverWidget.isVisible) {
                this.hideHoverScheduler.schedule();
            }
            this.showHoverScheduler.cancel();
            this.hoveringOver = null;
        };
        // hover business
        DebugEditorContribution.prototype.onEditorMouseDown = function (mouseEvent) {
            if (mouseEvent.target.type === editorcommon.MouseTargetType.CONTENT_WIDGET && mouseEvent.target.detail === debugHover_1.DebugHoverWidget.ID) {
                return;
            }
            this.hideHoverWidget();
        };
        DebugEditorContribution.prototype.onEditorMouseMove = function (mouseEvent) {
            if (this.debugService.getState() !== debug.State.Stopped) {
                return;
            }
            var targetType = mouseEvent.target.type;
            var stopKey = env.isMacintosh ? 'metaKey' : 'ctrlKey';
            if (targetType === editorcommon.MouseTargetType.CONTENT_WIDGET && mouseEvent.target.detail === debugHover_1.DebugHoverWidget.ID && !mouseEvent.event[stopKey]) {
                // mouse moved on top of debug hover widget
                return;
            }
            if (targetType === editorcommon.MouseTargetType.CONTENT_TEXT) {
                var wordAtPosition = this.editor.getModel().getWordAtPosition(mouseEvent.target.range.getStartPosition());
                if (wordAtPosition && this.hoveringOver !== wordAtPosition.word) {
                    this.hoverRange = mouseEvent.target.range;
                    this.hoveringOver = wordAtPosition.word;
                    this.showHoverScheduler.schedule();
                }
            }
            else {
                this.hideHoverWidget();
            }
        };
        DebugEditorContribution.prototype.onKeyDown = function (e) {
            var stopKey = env.isMacintosh ? keyCodes_1.KeyCode.Meta : keyCodes_1.KeyCode.Ctrl;
            if (e.keyCode !== stopKey) {
                // do not hide hover when Ctrl/Meta is pressed
                this.hideHoverWidget();
            }
        };
        DebugEditorContribution.prototype.dispose = function () {
            this.toDispose = lifecycle.dispose(this.toDispose);
        };
        // end hover business
        DebugEditorContribution.BREAKPOINT_HELPER_DECORATION = {
            glyphMarginClassName: 'debug-breakpoint-hint-glyph',
            stickiness: editorcommon.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
        };
        DebugEditorContribution = __decorate([
            __param(1, debug.IDebugService),
            __param(2, contextService_1.IWorkspaceContextService),
            __param(3, contextView_1.IContextMenuService),
            __param(4, instantiation_1.IInstantiationService)
        ], DebugEditorContribution);
        return DebugEditorContribution;
    }());
    exports.DebugEditorContribution = DebugEditorContribution;
});
//# sourceMappingURL=debugEditorContribution.js.map