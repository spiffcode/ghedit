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
define(["require", "exports", 'vs/nls!vs/workbench/parts/debug/browser/debugViews', 'vs/base/browser/dom', 'vs/base/browser/builder', 'vs/base/common/winjs.base', 'vs/base/common/errors', 'vs/base/common/events', 'vs/workbench/browser/actionBarRegistry', 'vs/base/parts/tree/browser/treeImpl', 'vs/base/browser/ui/splitview/splitview', 'vs/workbench/browser/viewlet', 'vs/workbench/parts/debug/common/debug', 'vs/workbench/parts/debug/common/debugModel', 'vs/workbench/parts/debug/browser/debugViewer', 'vs/workbench/parts/debug/electron-browser/debugActions', 'vs/platform/contextview/browser/contextView', 'vs/platform/instantiation/common/instantiation', 'vs/platform/telemetry/common/telemetry', 'vs/platform/message/common/message'], function (require, exports, nls, dom, builder, winjs_base_1, errors, events, actionbarregistry, treeimpl, splitview, viewlet, debug, model, viewer, debugactions, contextView_1, instantiation_1, telemetry_1, message_1) {
    "use strict";
    var IDebugService = debug.IDebugService;
    var debugTreeOptions = function (ariaLabel) {
        return {
            indentPixels: 8,
            twistiePixels: 20,
            ariaLabel: ariaLabel
        };
    };
    function renderViewTree(container) {
        var treeContainer = document.createElement('div');
        dom.addClass(treeContainer, 'debug-view-content');
        container.appendChild(treeContainer);
        return treeContainer;
    }
    var $ = builder.$;
    var VariablesView = (function (_super) {
        __extends(VariablesView, _super);
        function VariablesView(actionRunner, settings, messageService, contextMenuService, telemetryService, debugService, instantiationService) {
            _super.call(this, actionRunner, !!settings[VariablesView.MEMENTO], nls.localize(0, null), messageService, contextMenuService);
            this.settings = settings;
            this.telemetryService = telemetryService;
            this.debugService = debugService;
            this.instantiationService = instantiationService;
        }
        VariablesView.prototype.renderHeader = function (container) {
            var titleDiv = $('div.title').appendTo(container);
            $('span').text(nls.localize(1, null)).appendTo(titleDiv);
            _super.prototype.renderHeader.call(this, container);
        };
        VariablesView.prototype.renderBody = function (container) {
            var _this = this;
            dom.addClass(container, 'debug-variables');
            this.treeContainer = renderViewTree(container);
            this.tree = new treeimpl.Tree(this.treeContainer, {
                dataSource: new viewer.VariablesDataSource(this.debugService),
                renderer: this.instantiationService.createInstance(viewer.VariablesRenderer),
                accessibilityProvider: new viewer.VariablesAccessibilityProvider(),
                controller: new viewer.BaseDebugController(this.debugService, this.contextMenuService, new viewer.VariablesActionProvider(this.instantiationService))
            }, debugTreeOptions(nls.localize(2, null)));
            var viewModel = this.debugService.getViewModel();
            this.tree.setInput(viewModel);
            var collapseAction = this.instantiationService.createInstance(viewlet.CollapseAction, this.tree, false, 'explorer-action collapse-explorer');
            this.toolBar.setActions(actionbarregistry.prepareActions([collapseAction]))();
            this.toDispose.push(viewModel.addListener2(debug.ViewModelEvents.FOCUSED_STACK_FRAME_UPDATED, function () { return _this.onFocusedStackFrameUpdated(); }));
            this.toDispose.push(this.debugService.addListener2(debug.ServiceEvents.STATE_CHANGED, function () {
                collapseAction.enabled = _this.debugService.getState() === debug.State.Running || _this.debugService.getState() === debug.State.Stopped;
            }));
            this.toDispose.push(this.tree.addListener2(events.EventType.FOCUS, function (e) {
                var isMouseClick = (e.payload && e.payload.origin === 'mouse');
                var isVariableType = (e.focus instanceof model.Variable);
                if (isMouseClick && isVariableType) {
                    _this.telemetryService.publicLog('debug/variables/selected');
                }
            }));
        };
        VariablesView.prototype.onFocusedStackFrameUpdated = function () {
            var _this = this;
            this.tree.refresh().then(function () {
                var stackFrame = _this.debugService.getViewModel().getFocusedStackFrame();
                if (stackFrame) {
                    return stackFrame.getScopes(_this.debugService).then(function (scopes) {
                        if (scopes.length > 0) {
                            return _this.tree.expand(scopes[0]);
                        }
                    });
                }
            }).done(null, errors.onUnexpectedError);
        };
        VariablesView.prototype.shutdown = function () {
            this.settings[VariablesView.MEMENTO] = (this.state === splitview.CollapsibleState.COLLAPSED);
            _super.prototype.shutdown.call(this);
        };
        VariablesView.MEMENTO = 'variablesview.memento';
        VariablesView = __decorate([
            __param(2, message_1.IMessageService),
            __param(3, contextView_1.IContextMenuService),
            __param(4, telemetry_1.ITelemetryService),
            __param(5, IDebugService),
            __param(6, instantiation_1.IInstantiationService)
        ], VariablesView);
        return VariablesView;
    }(viewlet.CollapsibleViewletView));
    exports.VariablesView = VariablesView;
    var WatchExpressionsView = (function (_super) {
        __extends(WatchExpressionsView, _super);
        function WatchExpressionsView(actionRunner, settings, messageService, contextMenuService, debugService, instantiationService) {
            var _this = this;
            _super.call(this, actionRunner, !!settings[WatchExpressionsView.MEMENTO], nls.localize(3, null), messageService, contextMenuService);
            this.settings = settings;
            this.debugService = debugService;
            this.instantiationService = instantiationService;
            this.toDispose.push(this.debugService.getModel().addListener2(debug.ModelEvents.WATCH_EXPRESSIONS_UPDATED, function (we) {
                // only expand when a new watch expression is added.
                if (we instanceof model.Expression) {
                    _this.expand();
                }
            }));
        }
        WatchExpressionsView.prototype.renderHeader = function (container) {
            var titleDiv = $('div.title').appendTo(container);
            $('span').text(nls.localize(4, null)).appendTo(titleDiv);
            _super.prototype.renderHeader.call(this, container);
        };
        WatchExpressionsView.prototype.renderBody = function (container) {
            var _this = this;
            dom.addClass(container, 'debug-watch');
            this.treeContainer = renderViewTree(container);
            var actionProvider = new viewer.WatchExpressionsActionProvider(this.instantiationService);
            this.tree = new treeimpl.Tree(this.treeContainer, {
                dataSource: new viewer.WatchExpressionsDataSource(this.debugService),
                renderer: this.instantiationService.createInstance(viewer.WatchExpressionsRenderer, actionProvider, this.actionRunner),
                accessibilityProvider: new viewer.WatchExpressionsAccessibilityProvider(),
                controller: new viewer.WatchExpressionsController(this.debugService, this.contextMenuService, actionProvider)
            }, debugTreeOptions(nls.localize(5, null)));
            this.tree.setInput(this.debugService.getModel());
            var addWatchExpressionAction = this.instantiationService.createInstance(debugactions.AddWatchExpressionAction, debugactions.AddWatchExpressionAction.ID, debugactions.AddWatchExpressionAction.LABEL);
            var collapseAction = this.instantiationService.createInstance(viewlet.CollapseAction, this.tree, false, 'explorer-action collapse-explorer');
            var removeAllWatchExpressionsAction = this.instantiationService.createInstance(debugactions.RemoveAllWatchExpressionsAction, debugactions.RemoveAllWatchExpressionsAction.ID, debugactions.RemoveAllWatchExpressionsAction.LABEL);
            this.toolBar.setActions(actionbarregistry.prepareActions([addWatchExpressionAction, collapseAction, removeAllWatchExpressionsAction]))();
            this.toDispose.push(this.debugService.getModel().addListener2(debug.ModelEvents.WATCH_EXPRESSIONS_UPDATED, function (we) { return _this.onWatchExpressionsUpdated(we); }));
            this.toDispose.push(this.debugService.getViewModel().addListener2(debug.ViewModelEvents.SELECTED_EXPRESSION_UPDATED, function (expression) {
                if (!expression || !(expression instanceof model.Expression)) {
                    return;
                }
                _this.tree.refresh(expression, false).then(function () {
                    _this.tree.setHighlight(expression);
                    _this.tree.addOneTimeListener(events.EventType.HIGHLIGHT, function (e) {
                        if (!e.highlight) {
                            _this.debugService.getViewModel().setSelectedExpression(null);
                        }
                    });
                }).done(null, errors.onUnexpectedError);
            }));
        };
        WatchExpressionsView.prototype.onWatchExpressionsUpdated = function (we) {
            var _this = this;
            this.tree.refresh().done(function () {
                return we instanceof model.Expression ? _this.tree.reveal(we) : winjs_base_1.TPromise.as(true);
            }, errors.onUnexpectedError);
        };
        WatchExpressionsView.prototype.shutdown = function () {
            this.settings[WatchExpressionsView.MEMENTO] = (this.state === splitview.CollapsibleState.COLLAPSED);
            _super.prototype.shutdown.call(this);
        };
        WatchExpressionsView.MEMENTO = 'watchexpressionsview.memento';
        WatchExpressionsView = __decorate([
            __param(2, message_1.IMessageService),
            __param(3, contextView_1.IContextMenuService),
            __param(4, IDebugService),
            __param(5, instantiation_1.IInstantiationService)
        ], WatchExpressionsView);
        return WatchExpressionsView;
    }(viewlet.CollapsibleViewletView));
    exports.WatchExpressionsView = WatchExpressionsView;
    var CallStackView = (function (_super) {
        __extends(CallStackView, _super);
        function CallStackView(actionRunner, settings, messageService, contextMenuService, telemetryService, debugService, instantiationService) {
            _super.call(this, actionRunner, !!settings[CallStackView.MEMENTO], nls.localize(6, null), messageService, contextMenuService);
            this.settings = settings;
            this.telemetryService = telemetryService;
            this.debugService = debugService;
            this.instantiationService = instantiationService;
        }
        CallStackView.prototype.renderHeader = function (container) {
            var title = $('div.debug-call-stack-title').appendTo(container);
            $('span.title').text(nls.localize(7, null)).appendTo(title);
            this.pauseMessage = $('span.pause-message').appendTo(title);
            this.pauseMessage.hide();
            this.pauseMessageLabel = $('span.label').appendTo(this.pauseMessage);
            _super.prototype.renderHeader.call(this, container);
        };
        CallStackView.prototype.renderBody = function (container) {
            var _this = this;
            dom.addClass(container, 'debug-call-stack');
            this.treeContainer = renderViewTree(container);
            this.tree = new treeimpl.Tree(this.treeContainer, {
                dataSource: this.instantiationService.createInstance(viewer.CallStackDataSource),
                renderer: this.instantiationService.createInstance(viewer.CallStackRenderer),
                accessibilityProvider: this.instantiationService.createInstance(viewer.CallstackAccessibilityProvider)
            }, debugTreeOptions(nls.localize(8, null)));
            var debugModel = this.debugService.getModel();
            this.tree.setInput(debugModel);
            this.toDispose.push(this.tree.addListener2('selection', function (e) {
                if (!e.selection.length) {
                    return;
                }
                var element = e.selection[0];
                if (element instanceof model.StackFrame) {
                    var stackFrame = element;
                    _this.debugService.setFocusedStackFrameAndEvaluate(stackFrame);
                    var isMouse = (e.payload.origin === 'mouse');
                    var preserveFocus = isMouse;
                    var originalEvent = e && e.payload && e.payload.originalEvent;
                    if (originalEvent && isMouse && originalEvent.detail === 2) {
                        preserveFocus = false;
                        originalEvent.preventDefault(); // focus moves to editor, we need to prevent default
                    }
                    var sideBySide = (originalEvent && (originalEvent.ctrlKey || originalEvent.metaKey));
                    _this.debugService.openOrRevealEditor(stackFrame.source, stackFrame.lineNumber, preserveFocus, sideBySide).done(null, errors.onUnexpectedError);
                }
                // user clicked on 'Load More Stack Frames', get those stack frames and refresh the tree.
                if (typeof element === 'number') {
                    var thread = _this.debugService.getModel().getThreads()[element];
                    if (thread) {
                        thread.getCallStack(_this.debugService, true)
                            .then(function () { return _this.tree.refresh(); })
                            .then(function () {
                            _this.tree.clearFocus();
                            _this.tree.clearSelection();
                        }).done(null, errors.onUnexpectedError);
                    }
                }
            }));
            this.toDispose.push(this.tree.addListener2(events.EventType.FOCUS, function (e) {
                var isMouseClick = (e.payload && e.payload.origin === 'mouse');
                var isStackFrameType = (e.focus instanceof model.StackFrame);
                if (isMouseClick && isStackFrameType) {
                    _this.telemetryService.publicLog('debug/callStack/selected');
                }
            }));
            this.toDispose.push(debugModel.addListener2(debug.ModelEvents.CALLSTACK_UPDATED, function () {
                _this.tree.refresh().done(null, errors.onUnexpectedError);
            }));
            this.toDispose.push(this.debugService.getViewModel().addListener2(debug.ViewModelEvents.FOCUSED_STACK_FRAME_UPDATED, function () {
                var focussedThread = _this.debugService.getModel().getThreads()[_this.debugService.getViewModel().getFocusedThreadId()];
                if (!focussedThread) {
                    _this.pauseMessage.hide();
                    return;
                }
                _this.tree.expand(focussedThread);
                _this.tree.setFocus(_this.debugService.getViewModel().getFocusedStackFrame());
                if (focussedThread.stoppedDetails && focussedThread.stoppedDetails.reason) {
                    _this.pauseMessageLabel.text(nls.localize(9, null, focussedThread.stoppedDetails.reason));
                    if (focussedThread.stoppedDetails.text) {
                        _this.pauseMessageLabel.title(focussedThread.stoppedDetails.text);
                    }
                    focussedThread.stoppedDetails.reason === 'exception' ? _this.pauseMessageLabel.addClass('exception') : _this.pauseMessageLabel.removeClass('exception');
                    _this.pauseMessage.show();
                }
                else {
                    _this.pauseMessage.hide();
                }
            }));
        };
        CallStackView.prototype.shutdown = function () {
            this.settings[CallStackView.MEMENTO] = (this.state === splitview.CollapsibleState.COLLAPSED);
            _super.prototype.shutdown.call(this);
        };
        CallStackView.MEMENTO = 'callstackview.memento';
        CallStackView = __decorate([
            __param(2, message_1.IMessageService),
            __param(3, contextView_1.IContextMenuService),
            __param(4, telemetry_1.ITelemetryService),
            __param(5, IDebugService),
            __param(6, instantiation_1.IInstantiationService)
        ], CallStackView);
        return CallStackView;
    }(viewlet.CollapsibleViewletView));
    exports.CallStackView = CallStackView;
    var BreakpointsView = (function (_super) {
        __extends(BreakpointsView, _super);
        function BreakpointsView(actionRunner, settings, messageService, contextMenuService, debugService, instantiationService) {
            var _this = this;
            _super.call(this, actionRunner, BreakpointsView.getExpandedBodySize(debugService.getModel().getBreakpoints().length + debugService.getModel().getFunctionBreakpoints().length + debugService.getModel().getExceptionBreakpoints().length), !!settings[BreakpointsView.MEMENTO], nls.localize(10, null), messageService, contextMenuService);
            this.settings = settings;
            this.debugService = debugService;
            this.instantiationService = instantiationService;
            this.toDispose.push(this.debugService.getModel().addListener2(debug.ModelEvents.BREAKPOINTS_UPDATED, function () { return _this.onBreakpointsChange(); }));
        }
        BreakpointsView.prototype.renderHeader = function (container) {
            var titleDiv = $('div.title').appendTo(container);
            $('span').text(nls.localize(11, null)).appendTo(titleDiv);
            _super.prototype.renderHeader.call(this, container);
        };
        BreakpointsView.prototype.renderBody = function (container) {
            var _this = this;
            dom.addClass(container, 'debug-breakpoints');
            this.treeContainer = renderViewTree(container);
            var actionProvider = new viewer.BreakpointsActionProvider(this.instantiationService);
            this.tree = new treeimpl.Tree(this.treeContainer, {
                dataSource: new viewer.BreakpointsDataSource(),
                renderer: this.instantiationService.createInstance(viewer.BreakpointsRenderer, actionProvider, this.actionRunner),
                accessibilityProvider: this.instantiationService.createInstance(viewer.BreakpointsAccessibilityProvider),
                controller: new viewer.BreakpointsController(this.debugService, this.contextMenuService, actionProvider),
                sorter: {
                    compare: function (tree, element, otherElement) {
                        var first = element;
                        var second = otherElement;
                        if (first instanceof model.ExceptionBreakpoint) {
                            return -1;
                        }
                        if (second instanceof model.ExceptionBreakpoint) {
                            return 1;
                        }
                        if (first instanceof model.FunctionBreakpoint) {
                            return -1;
                        }
                        if (second instanceof model.FunctionBreakpoint) {
                            return 1;
                        }
                        if (first.source.uri.toString() !== second.source.uri.toString()) {
                            return first.source.uri.toString().localeCompare(second.source.uri.toString());
                        }
                        return first.desiredLineNumber - second.desiredLineNumber;
                    }
                }
            }, debugTreeOptions(nls.localize(12, null)));
            var debugModel = this.debugService.getModel();
            this.tree.setInput(debugModel);
            this.toDispose.push(this.tree.addListener2('selection', function (e) {
                if (!e.selection.length) {
                    return;
                }
                var element = e.selection[0];
                if (!(element instanceof model.Breakpoint)) {
                    return;
                }
                var breakpoint = element;
                if (!breakpoint.source.inMemory) {
                    var isMouse = (e.payload.origin === 'mouse');
                    var preserveFocus = isMouse;
                    var originalEvent = e && e.payload && e.payload.originalEvent;
                    if (originalEvent && isMouse && originalEvent.detail === 2) {
                        preserveFocus = false;
                        originalEvent.preventDefault(); // focus moves to editor, we need to prevent default
                    }
                    var sideBySide = (originalEvent && (originalEvent.ctrlKey || originalEvent.metaKey));
                    _this.debugService.openOrRevealEditor(breakpoint.source, breakpoint.lineNumber, preserveFocus, sideBySide).done(null, errors.onUnexpectedError);
                }
            }));
            this.toDispose.push(this.debugService.getViewModel().addListener2(debug.ViewModelEvents.SELECTED_FUNCTION_BREAKPOINT_UPDATED, function (fbp) {
                if (!fbp || !(fbp instanceof model.FunctionBreakpoint)) {
                    return;
                }
                _this.tree.refresh(fbp, false).then(function () {
                    _this.tree.setHighlight(fbp);
                    _this.tree.addOneTimeListener(events.EventType.HIGHLIGHT, function (e) {
                        if (!e.highlight) {
                            _this.debugService.getViewModel().setSelectedFunctionBreakpoint(null);
                        }
                    });
                }).done(null, errors.onUnexpectedError);
            }));
        };
        BreakpointsView.prototype.getActions = function () {
            return [
                this.instantiationService.createInstance(debugactions.AddFunctionBreakpointAction, debugactions.AddFunctionBreakpointAction.ID, debugactions.AddFunctionBreakpointAction.LABEL),
                this.instantiationService.createInstance(debugactions.ToggleBreakpointsActivatedAction, debugactions.ToggleBreakpointsActivatedAction.ID, debugactions.ToggleBreakpointsActivatedAction.LABEL),
                this.instantiationService.createInstance(debugactions.RemoveAllBreakpointsAction, debugactions.RemoveAllBreakpointsAction.ID, debugactions.RemoveAllBreakpointsAction.LABEL)
            ];
        };
        BreakpointsView.prototype.onBreakpointsChange = function () {
            var model = this.debugService.getModel();
            this.expandedBodySize = BreakpointsView.getExpandedBodySize(model.getBreakpoints().length + model.getExceptionBreakpoints().length + model.getFunctionBreakpoints().length);
            if (this.tree) {
                this.tree.refresh();
            }
        };
        BreakpointsView.getExpandedBodySize = function (length) {
            return Math.min(BreakpointsView.MAX_VISIBLE_FILES, length) * 22;
        };
        BreakpointsView.prototype.shutdown = function () {
            this.settings[BreakpointsView.MEMENTO] = (this.state === splitview.CollapsibleState.COLLAPSED);
            _super.prototype.shutdown.call(this);
        };
        BreakpointsView.MAX_VISIBLE_FILES = 9;
        BreakpointsView.MEMENTO = 'breakopintsview.memento';
        BreakpointsView = __decorate([
            __param(2, message_1.IMessageService),
            __param(3, contextView_1.IContextMenuService),
            __param(4, IDebugService),
            __param(5, instantiation_1.IInstantiationService)
        ], BreakpointsView);
        return BreakpointsView;
    }(viewlet.AdaptiveCollapsibleViewletView));
    exports.BreakpointsView = BreakpointsView;
});
//# sourceMappingURL=debugViews.js.map