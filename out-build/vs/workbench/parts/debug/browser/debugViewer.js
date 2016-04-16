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
define(["require", "exports", 'vs/nls!vs/workbench/parts/debug/browser/debugViewer', 'vs/base/common/winjs.base', 'vs/base/common/lifecycle', 'vs/base/common/keyCodes', 'vs/base/common/paths', 'vs/base/common/async', 'vs/base/common/errors', 'vs/base/common/strings', 'vs/base/common/platform', 'vs/base/browser/dom', 'vs/base/common/labels', 'vs/base/browser/ui/actionbar/actionbar', 'vs/base/browser/ui/inputbox/inputBox', 'vs/base/parts/tree/browser/treeDefaults', 'vs/workbench/parts/debug/common/debug', 'vs/workbench/parts/debug/common/debugModel', 'vs/workbench/parts/debug/common/debugViewModel', 'vs/workbench/parts/debug/electron-browser/debugActions', 'vs/platform/contextview/browser/contextView', 'vs/platform/workspace/common/workspace', 'vs/platform/message/common/message'], function (require, exports, nls, winjs_base_1, lifecycle, keyCodes_1, paths, async, errors, strings, platform_1, dom, labels, actionbar, inputbox, treedefaults, debug, model, viewmodel, debugactions, contextView_1, workspace_1, message_1) {
    "use strict";
    var $ = dom.emmet;
    var booleanRegex = /^true|false$/i;
    var stringRegex = /^(['"]).*\1$/;
    function renderExpressionValue(expressionOrValue, container, showChanged) {
        var value = typeof expressionOrValue === 'string' ? expressionOrValue : expressionOrValue.value;
        // remove stale classes
        container.className = 'value';
        // when resolving expressions we represent errors from the server as a variable with name === null.
        if (value === null || ((expressionOrValue instanceof model.Expression || expressionOrValue instanceof model.Variable) && !expressionOrValue.available)) {
            dom.addClass(container, 'unavailable');
            if (value !== model.Expression.DEFAULT_VALUE) {
                dom.addClass(container, 'error');
            }
        }
        else if (!isNaN(+value)) {
            dom.addClass(container, 'number');
        }
        else if (booleanRegex.test(value)) {
            dom.addClass(container, 'boolean');
        }
        else if (stringRegex.test(value)) {
            dom.addClass(container, 'string');
        }
        if (showChanged && expressionOrValue.valueChanged) {
            // value changed color has priority over other colors.
            container.className = 'value changed';
        }
        container.textContent = value;
        container.title = value;
    }
    exports.renderExpressionValue = renderExpressionValue;
    function renderVariable(tree, variable, data, showChanged) {
        if (variable.available) {
            data.name.textContent = variable.name + ':';
        }
        if (variable.value) {
            renderExpressionValue(variable, data.value, showChanged);
            data.expression.title = variable.value;
        }
        else {
            data.value.textContent = '';
            data.value.title = '';
        }
    }
    exports.renderVariable = renderVariable;
    function renderRenameBox(debugService, contextViewService, tree, element, container, placeholder, ariaLabel) {
        var inputBoxContainer = dom.append(container, $('.inputBoxContainer'));
        var inputBox = new inputbox.InputBox(inputBoxContainer, contextViewService, {
            validationOptions: {
                validation: null,
                showMessage: false
            },
            placeholder: placeholder,
            ariaLabel: ariaLabel
        });
        inputBox.value = element.name ? element.name : '';
        inputBox.focus();
        var disposed = false;
        var toDispose = [inputBox];
        var wrapUp = async.once(function (renamed) {
            if (!disposed) {
                disposed = true;
                if (element instanceof model.Expression && renamed && inputBox.value) {
                    debugService.renameWatchExpression(element.getId(), inputBox.value).done(null, errors.onUnexpectedError);
                }
                else if (element instanceof model.Expression && !element.name) {
                    debugService.clearWatchExpressions(element.getId());
                }
                else if (element instanceof model.FunctionBreakpoint && renamed && inputBox.value) {
                    debugService.renameFunctionBreakpoint(element.getId(), inputBox.value).done(null, errors.onUnexpectedError);
                }
                else if (element instanceof model.FunctionBreakpoint && !element.name) {
                    debugService.removeFunctionBreakpoints(element.getId()).done(null, errors.onUnexpectedError);
                }
                tree.clearHighlight();
                tree.DOMFocus();
                tree.setFocus(element);
                // need to remove the input box since this template will be reused.
                container.removeChild(inputBoxContainer);
                lifecycle.dispose(toDispose);
            }
        });
        toDispose.push(dom.addStandardDisposableListener(inputBox.inputElement, 'keydown', function (e) {
            var isEscape = e.equals(keyCodes_1.CommonKeybindings.ESCAPE);
            var isEnter = e.equals(keyCodes_1.CommonKeybindings.ENTER);
            if (isEscape || isEnter) {
                wrapUp(isEnter);
            }
        }));
        toDispose.push(dom.addDisposableListener(inputBox.inputElement, 'blur', function () {
            wrapUp(true);
        }));
    }
    function getSourceName(source, contextService) {
        if (source.inMemory) {
            return source.name;
        }
        return labels.getPathLabel(paths.basename(source.uri.fsPath), contextService);
    }
    var BaseDebugController = (function (_super) {
        __extends(BaseDebugController, _super);
        function BaseDebugController(debugService, contextMenuService, actionProvider, focusOnContextMenu) {
            if (focusOnContextMenu === void 0) { focusOnContextMenu = true; }
            _super.call(this);
            this.debugService = debugService;
            this.contextMenuService = contextMenuService;
            this.actionProvider = actionProvider;
            this.focusOnContextMenu = focusOnContextMenu;
            if (platform_1.isMacintosh) {
                this.downKeyBindingDispatcher.set(keyCodes_1.CommonKeybindings.CTRLCMD_BACKSPACE, this.onDelete.bind(this));
            }
            else {
                this.downKeyBindingDispatcher.set(keyCodes_1.CommonKeybindings.DELETE, this.onDelete.bind(this));
                this.downKeyBindingDispatcher.set(keyCodes_1.CommonKeybindings.SHIFT_DELETE, this.onDelete.bind(this));
            }
        }
        BaseDebugController.prototype.onContextMenu = function (tree, element, event) {
            var _this = this;
            if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'input') {
                return false;
            }
            event.preventDefault();
            event.stopPropagation();
            if (this.focusOnContextMenu) {
                tree.setFocus(element);
            }
            if (this.actionProvider.hasSecondaryActions(tree, element)) {
                var anchor_1 = { x: event.posx + 1, y: event.posy };
                this.contextMenuService.showContextMenu({
                    getAnchor: function () { return anchor_1; },
                    getActions: function () { return _this.actionProvider.getSecondaryActions(tree, element); },
                    onHide: function (wasCancelled) {
                        if (wasCancelled) {
                            tree.DOMFocus();
                        }
                    },
                    getActionsContext: function () { return element; }
                });
                return true;
            }
            return false;
        };
        BaseDebugController.prototype.onDelete = function (tree, event) {
            return false;
        };
        return BaseDebugController;
    }(treedefaults.DefaultController));
    exports.BaseDebugController = BaseDebugController;
    // call stack
    var CallStackDataSource = (function () {
        function CallStackDataSource(debugService) {
            this.debugService = debugService;
            // noop
        }
        CallStackDataSource.prototype.getId = function (tree, element) {
            if (typeof element === 'number') {
                return element.toString();
            }
            return element.getId();
        };
        CallStackDataSource.prototype.hasChildren = function (tree, element) {
            return element instanceof model.Model || element instanceof model.Thread;
        };
        CallStackDataSource.prototype.getChildren = function (tree, element) {
            if (element instanceof model.Thread) {
                return this.getThreadChildren(element);
            }
            var threads = element.getThreads();
            var threadsArray = [];
            Object.keys(threads).forEach(function (threadId) {
                threadsArray.push(threads[threadId]);
            });
            if (threadsArray.length === 1) {
                return this.getThreadChildren(threadsArray[0]);
            }
            else {
                return winjs_base_1.TPromise.as(threadsArray);
            }
        };
        CallStackDataSource.prototype.getThreadChildren = function (thread) {
            return thread.getCallStack(this.debugService).then(function (callStack) {
                if (thread.stoppedDetails && thread.stoppedDetails.totalFrames > callStack.length) {
                    return callStack.concat([thread.threadId]);
                }
                return callStack;
            });
        };
        CallStackDataSource.prototype.getParent = function (tree, element) {
            return winjs_base_1.TPromise.as(null);
        };
        CallStackDataSource = __decorate([
            __param(0, debug.IDebugService)
        ], CallStackDataSource);
        return CallStackDataSource;
    }());
    exports.CallStackDataSource = CallStackDataSource;
    var CallStackRenderer = (function () {
        function CallStackRenderer(contextService) {
            this.contextService = contextService;
            // noop
        }
        CallStackRenderer.prototype.getHeight = function (tree, element) {
            return 22;
        };
        CallStackRenderer.prototype.getTemplateId = function (tree, element) {
            if (element instanceof model.Thread) {
                return CallStackRenderer.THREAD_TEMPLATE_ID;
            }
            if (element instanceof model.StackFrame) {
                return CallStackRenderer.STACK_FRAME_TEMPLATE_ID;
            }
            return CallStackRenderer.LOAD_MORE_TEMPLATE_ID;
        };
        CallStackRenderer.prototype.renderTemplate = function (tree, templateId, container) {
            if (templateId === CallStackRenderer.LOAD_MORE_TEMPLATE_ID) {
                var data_1 = Object.create(null);
                data_1.label = dom.append(container, $('.load-more'));
                return data_1;
            }
            if (templateId === CallStackRenderer.THREAD_TEMPLATE_ID) {
                var data_2 = Object.create(null);
                data_2.name = dom.append(container, $('.thread'));
                return data_2;
            }
            var data = Object.create(null);
            data.stackFrame = dom.append(container, $('.stack-frame'));
            data.label = dom.append(data.stackFrame, $('span.label'));
            data.file = dom.append(data.stackFrame, $('.file'));
            data.fileName = dom.append(data.file, $('span.file-name'));
            data.lineNumber = dom.append(data.file, $('span.line-number'));
            return data;
        };
        CallStackRenderer.prototype.renderElement = function (tree, element, templateId, templateData) {
            if (templateId === CallStackRenderer.THREAD_TEMPLATE_ID) {
                this.renderThread(element, templateData);
            }
            else if (templateId === CallStackRenderer.STACK_FRAME_TEMPLATE_ID) {
                this.renderStackFrame(element, templateData);
            }
            else {
                this.renderLoadMore(element, templateData);
            }
        };
        CallStackRenderer.prototype.renderThread = function (thread, data) {
            data.name.textContent = thread.name;
        };
        CallStackRenderer.prototype.renderLoadMore = function (element, data) {
            data.label.textContent = nls.localize(0, null);
        };
        CallStackRenderer.prototype.renderStackFrame = function (stackFrame, data) {
            stackFrame.source.available ? dom.removeClass(data.stackFrame, 'disabled') : dom.addClass(data.stackFrame, 'disabled');
            data.file.title = stackFrame.source.uri.fsPath;
            data.label.textContent = stackFrame.name;
            data.label.title = stackFrame.name;
            data.fileName.textContent = getSourceName(stackFrame.source, this.contextService);
            data.lineNumber.textContent = (stackFrame.source.available && stackFrame.lineNumber !== undefined) ? "" + stackFrame.lineNumber : '';
        };
        CallStackRenderer.prototype.disposeTemplate = function (tree, templateId, templateData) {
            // noop
        };
        CallStackRenderer.THREAD_TEMPLATE_ID = 'thread';
        CallStackRenderer.STACK_FRAME_TEMPLATE_ID = 'stackFrame';
        CallStackRenderer.LOAD_MORE_TEMPLATE_ID = 'loadMore';
        CallStackRenderer = __decorate([
            __param(0, workspace_1.IWorkspaceContextService)
        ], CallStackRenderer);
        return CallStackRenderer;
    }());
    exports.CallStackRenderer = CallStackRenderer;
    var CallstackAccessibilityProvider = (function () {
        function CallstackAccessibilityProvider(contextService) {
            this.contextService = contextService;
            // noop
        }
        CallstackAccessibilityProvider.prototype.getAriaLabel = function (tree, element) {
            if (element instanceof model.Thread) {
                return nls.localize(1, null, element.name);
            }
            if (element instanceof model.StackFrame) {
                return nls.localize(2, null, element.name, element.lineNumber, getSourceName(element.source, this.contextService));
            }
            return null;
        };
        CallstackAccessibilityProvider = __decorate([
            __param(0, workspace_1.IWorkspaceContextService)
        ], CallstackAccessibilityProvider);
        return CallstackAccessibilityProvider;
    }());
    exports.CallstackAccessibilityProvider = CallstackAccessibilityProvider;
    // variables
    var VariablesActionProvider = (function () {
        function VariablesActionProvider(instantiationService) {
            this.instantiationService = instantiationService;
        }
        VariablesActionProvider.prototype.hasActions = function (tree, element) {
            return false;
        };
        VariablesActionProvider.prototype.getActions = function (tree, element) {
            return winjs_base_1.TPromise.as([]);
        };
        VariablesActionProvider.prototype.hasSecondaryActions = function (tree, element) {
            return element instanceof model.Variable;
        };
        VariablesActionProvider.prototype.getSecondaryActions = function (tree, element) {
            var actions = [];
            var variable = element;
            actions.push(this.instantiationService.createInstance(debugactions.AddToWatchExpressionsAction, debugactions.AddToWatchExpressionsAction.ID, debugactions.AddToWatchExpressionsAction.LABEL, variable));
            if (variable.reference === 0) {
                actions.push(this.instantiationService.createInstance(debugactions.CopyValueAction, debugactions.CopyValueAction.ID, debugactions.CopyValueAction.LABEL, variable));
            }
            return winjs_base_1.TPromise.as(actions);
        };
        VariablesActionProvider.prototype.getActionItem = function (tree, element, action) {
            return null;
        };
        return VariablesActionProvider;
    }());
    exports.VariablesActionProvider = VariablesActionProvider;
    var VariablesDataSource = (function () {
        function VariablesDataSource(debugService) {
            this.debugService = debugService;
            // noop
        }
        VariablesDataSource.prototype.getId = function (tree, element) {
            return element.getId();
        };
        VariablesDataSource.prototype.hasChildren = function (tree, element) {
            if (element instanceof viewmodel.ViewModel || element instanceof model.Scope) {
                return true;
            }
            var variable = element;
            return variable.reference !== 0 && !strings.equalsIgnoreCase(variable.value, 'null');
        };
        VariablesDataSource.prototype.getChildren = function (tree, element) {
            if (element instanceof viewmodel.ViewModel) {
                var focusedStackFrame = element.getFocusedStackFrame();
                return focusedStackFrame ? focusedStackFrame.getScopes(this.debugService) : winjs_base_1.TPromise.as([]);
            }
            var scope = element;
            return scope.getChildren(this.debugService);
        };
        VariablesDataSource.prototype.getParent = function (tree, element) {
            return winjs_base_1.TPromise.as(null);
        };
        return VariablesDataSource;
    }());
    exports.VariablesDataSource = VariablesDataSource;
    var VariablesRenderer = (function () {
        function VariablesRenderer() {
        }
        VariablesRenderer.prototype.getHeight = function (tree, element) {
            return 22;
        };
        VariablesRenderer.prototype.getTemplateId = function (tree, element) {
            if (element instanceof model.Scope) {
                return VariablesRenderer.SCOPE_TEMPLATE_ID;
            }
            if (element instanceof model.Variable) {
                return VariablesRenderer.VARIABLE_TEMPLATE_ID;
            }
            return null;
        };
        VariablesRenderer.prototype.renderTemplate = function (tree, templateId, container) {
            if (templateId === VariablesRenderer.SCOPE_TEMPLATE_ID) {
                var data_3 = Object.create(null);
                data_3.name = dom.append(container, $('.scope'));
                return data_3;
            }
            var data = Object.create(null);
            data.expression = dom.append(container, $(platform_1.isMacintosh ? '.expression.mac' : '.expression.win-linux'));
            data.name = dom.append(data.expression, $('span.name'));
            data.value = dom.append(data.expression, $('span.value'));
            return data;
        };
        VariablesRenderer.prototype.renderElement = function (tree, element, templateId, templateData) {
            if (templateId === VariablesRenderer.SCOPE_TEMPLATE_ID) {
                this.renderScope(element, templateData);
            }
            else {
                renderVariable(tree, element, templateData, true);
            }
        };
        VariablesRenderer.prototype.renderScope = function (scope, data) {
            data.name.textContent = scope.name;
        };
        VariablesRenderer.prototype.disposeTemplate = function (tree, templateId, templateData) {
            // noop
        };
        VariablesRenderer.SCOPE_TEMPLATE_ID = 'scope';
        VariablesRenderer.VARIABLE_TEMPLATE_ID = 'variable';
        return VariablesRenderer;
    }());
    exports.VariablesRenderer = VariablesRenderer;
    var VariablesAccessibilityProvider = (function () {
        function VariablesAccessibilityProvider() {
        }
        VariablesAccessibilityProvider.prototype.getAriaLabel = function (tree, element) {
            if (element instanceof model.Scope) {
                return nls.localize(3, null, element.name);
            }
            if (element instanceof model.Variable) {
                return nls.localize(4, null, element.name, element.value);
            }
            return null;
        };
        return VariablesAccessibilityProvider;
    }());
    exports.VariablesAccessibilityProvider = VariablesAccessibilityProvider;
    // watch expressions
    var WatchExpressionsActionProvider = (function () {
        function WatchExpressionsActionProvider(instantiationService) {
            this.instantiationService = instantiationService;
        }
        WatchExpressionsActionProvider.prototype.hasActions = function (tree, element) {
            return element instanceof model.Expression && element.name;
        };
        WatchExpressionsActionProvider.prototype.hasSecondaryActions = function (tree, element) {
            return true;
        };
        WatchExpressionsActionProvider.prototype.getActions = function (tree, element) {
            return winjs_base_1.TPromise.as(this.getExpressionActions());
        };
        WatchExpressionsActionProvider.prototype.getExpressionActions = function () {
            return [this.instantiationService.createInstance(debugactions.RemoveWatchExpressionAction, debugactions.RemoveWatchExpressionAction.ID, debugactions.RemoveWatchExpressionAction.LABEL)];
        };
        WatchExpressionsActionProvider.prototype.getSecondaryActions = function (tree, element) {
            var actions = [];
            if (element instanceof model.Expression) {
                var expression = element;
                actions.push(this.instantiationService.createInstance(debugactions.AddWatchExpressionAction, debugactions.AddWatchExpressionAction.ID, debugactions.AddWatchExpressionAction.LABEL));
                actions.push(this.instantiationService.createInstance(debugactions.RenameWatchExpressionAction, debugactions.RenameWatchExpressionAction.ID, debugactions.RenameWatchExpressionAction.LABEL, expression));
                if (expression.reference === 0) {
                    actions.push(this.instantiationService.createInstance(debugactions.CopyValueAction, debugactions.CopyValueAction.ID, debugactions.CopyValueAction.LABEL, expression.value));
                }
                actions.push(new actionbar.Separator());
                actions.push(this.instantiationService.createInstance(debugactions.RemoveWatchExpressionAction, debugactions.RemoveWatchExpressionAction.ID, debugactions.RemoveWatchExpressionAction.LABEL));
                actions.push(this.instantiationService.createInstance(debugactions.RemoveAllWatchExpressionsAction, debugactions.RemoveAllWatchExpressionsAction.ID, debugactions.RemoveAllWatchExpressionsAction.LABEL));
            }
            else {
                actions.push(this.instantiationService.createInstance(debugactions.AddWatchExpressionAction, debugactions.AddWatchExpressionAction.ID, debugactions.AddWatchExpressionAction.LABEL));
                if (element instanceof model.Variable) {
                    var variable = element;
                    if (variable.reference === 0) {
                        actions.push(this.instantiationService.createInstance(debugactions.CopyValueAction, debugactions.CopyValueAction.ID, debugactions.CopyValueAction.LABEL, variable.value));
                    }
                    actions.push(new actionbar.Separator());
                }
                actions.push(this.instantiationService.createInstance(debugactions.RemoveAllWatchExpressionsAction, debugactions.RemoveAllWatchExpressionsAction.ID, debugactions.RemoveAllWatchExpressionsAction.LABEL));
            }
            return winjs_base_1.TPromise.as(actions);
        };
        WatchExpressionsActionProvider.prototype.getActionItem = function (tree, element, action) {
            return null;
        };
        return WatchExpressionsActionProvider;
    }());
    exports.WatchExpressionsActionProvider = WatchExpressionsActionProvider;
    var WatchExpressionsDataSource = (function () {
        function WatchExpressionsDataSource(debugService) {
            this.debugService = debugService;
            // noop
        }
        WatchExpressionsDataSource.prototype.getId = function (tree, element) {
            return element.getId();
        };
        WatchExpressionsDataSource.prototype.hasChildren = function (tree, element) {
            if (element instanceof model.Model) {
                return true;
            }
            var watchExpression = element;
            return watchExpression.reference !== 0 && !strings.equalsIgnoreCase(watchExpression.value, 'null');
        };
        WatchExpressionsDataSource.prototype.getChildren = function (tree, element) {
            if (element instanceof model.Model) {
                return winjs_base_1.TPromise.as(element.getWatchExpressions());
            }
            var expression = element;
            return expression.getChildren(this.debugService);
        };
        WatchExpressionsDataSource.prototype.getParent = function (tree, element) {
            return winjs_base_1.TPromise.as(null);
        };
        return WatchExpressionsDataSource;
    }());
    exports.WatchExpressionsDataSource = WatchExpressionsDataSource;
    var WatchExpressionsRenderer = (function () {
        function WatchExpressionsRenderer(actionProvider, actionRunner, messageService, debugService, contextViewService) {
            this.actionRunner = actionRunner;
            this.messageService = messageService;
            this.debugService = debugService;
            this.contextViewService = contextViewService;
            this.toDispose = [];
            this.actionProvider = actionProvider;
        }
        WatchExpressionsRenderer.prototype.getHeight = function (tree, element) {
            return 22;
        };
        WatchExpressionsRenderer.prototype.getTemplateId = function (tree, element) {
            if (element instanceof model.Expression) {
                return WatchExpressionsRenderer.WATCH_EXPRESSION_TEMPLATE_ID;
            }
            return WatchExpressionsRenderer.VARIABLE_TEMPLATE_ID;
        };
        WatchExpressionsRenderer.prototype.renderTemplate = function (tree, templateId, container) {
            var data = Object.create(null);
            if (templateId === WatchExpressionsRenderer.WATCH_EXPRESSION_TEMPLATE_ID) {
                data.actionBar = new actionbar.ActionBar(container, { actionRunner: this.actionRunner });
                data.actionBar.push(this.actionProvider.getExpressionActions(), { icon: true, label: false });
            }
            data.expression = dom.append(container, $(platform_1.isMacintosh ? '.expression.mac' : '.expression.win-linux'));
            data.name = dom.append(data.expression, $('span.name'));
            data.value = dom.append(data.expression, $('span.value'));
            return data;
        };
        WatchExpressionsRenderer.prototype.renderElement = function (tree, element, templateId, templateData) {
            if (templateId === WatchExpressionsRenderer.WATCH_EXPRESSION_TEMPLATE_ID) {
                this.renderWatchExpression(tree, element, templateData);
            }
            else {
                renderVariable(tree, element, templateData, true);
            }
        };
        WatchExpressionsRenderer.prototype.renderWatchExpression = function (tree, watchExpression, data) {
            var selectedExpression = this.debugService.getViewModel().getSelectedExpression();
            if ((selectedExpression instanceof model.Expression && selectedExpression.getId() === watchExpression.getId()) || (watchExpression instanceof model.Expression && !watchExpression.name)) {
                renderRenameBox(this.debugService, this.contextViewService, tree, watchExpression, data.expression, nls.localize(5, null), nls.localize(6, null));
            }
            data.actionBar.context = watchExpression;
            data.name.textContent = watchExpression.name + ":";
            if (watchExpression.value) {
                renderExpressionValue(watchExpression, data.value, true);
                data.expression.title = watchExpression.value;
            }
        };
        WatchExpressionsRenderer.prototype.disposeTemplate = function (tree, templateId, templateData) {
            if (templateId === WatchExpressionsRenderer.WATCH_EXPRESSION_TEMPLATE_ID) {
                templateData.actionBar.dispose();
            }
        };
        WatchExpressionsRenderer.prototype.dispose = function () {
            this.toDispose = lifecycle.dispose(this.toDispose);
        };
        WatchExpressionsRenderer.WATCH_EXPRESSION_TEMPLATE_ID = 'watchExpression';
        WatchExpressionsRenderer.VARIABLE_TEMPLATE_ID = 'variables';
        WatchExpressionsRenderer = __decorate([
            __param(2, message_1.IMessageService),
            __param(3, debug.IDebugService),
            __param(4, contextView_1.IContextViewService)
        ], WatchExpressionsRenderer);
        return WatchExpressionsRenderer;
    }());
    exports.WatchExpressionsRenderer = WatchExpressionsRenderer;
    var WatchExpressionsAccessibilityProvider = (function () {
        function WatchExpressionsAccessibilityProvider() {
        }
        WatchExpressionsAccessibilityProvider.prototype.getAriaLabel = function (tree, element) {
            if (element instanceof model.Expression) {
                return nls.localize(7, null, element.name, element.value);
            }
            if (element instanceof model.Variable) {
                return nls.localize(8, null, element.name, element.value);
            }
            return null;
        };
        return WatchExpressionsAccessibilityProvider;
    }());
    exports.WatchExpressionsAccessibilityProvider = WatchExpressionsAccessibilityProvider;
    var WatchExpressionsController = (function (_super) {
        __extends(WatchExpressionsController, _super);
        function WatchExpressionsController(debugService, contextMenuService, actionProvider) {
            _super.call(this, debugService, contextMenuService, actionProvider);
            if (platform_1.isMacintosh) {
                this.downKeyBindingDispatcher.set(keyCodes_1.CommonKeybindings.ENTER, this.onRename.bind(this));
            }
            else {
                this.downKeyBindingDispatcher.set(keyCodes_1.CommonKeybindings.F2, this.onRename.bind(this));
            }
        }
        WatchExpressionsController.prototype.onLeftClick = function (tree, element, event) {
            // double click on primitive value: open input box to be able to select and copy value.
            if (element instanceof model.Expression && event.detail === 2) {
                var expression = element;
                if (expression.reference === 0) {
                    this.debugService.getViewModel().setSelectedExpression(expression);
                }
                return true;
            }
            return _super.prototype.onLeftClick.call(this, tree, element, event);
        };
        WatchExpressionsController.prototype.onRename = function (tree, event) {
            var element = tree.getFocus();
            if (element instanceof model.Expression) {
                var watchExpression = element;
                if (watchExpression.reference === 0) {
                    this.debugService.getViewModel().setSelectedExpression(watchExpression);
                }
                return true;
            }
            return false;
        };
        WatchExpressionsController.prototype.onDelete = function (tree, event) {
            var element = tree.getFocus();
            if (element instanceof model.Expression) {
                var we = element;
                this.debugService.clearWatchExpressions(we.getId());
                return true;
            }
            return false;
        };
        return WatchExpressionsController;
    }(BaseDebugController));
    exports.WatchExpressionsController = WatchExpressionsController;
    // breakpoints
    var BreakpointsActionProvider = (function () {
        function BreakpointsActionProvider(instantiationService) {
            this.instantiationService = instantiationService;
            // noop
        }
        BreakpointsActionProvider.prototype.hasActions = function (tree, element) {
            return element instanceof model.Breakpoint;
        };
        BreakpointsActionProvider.prototype.hasSecondaryActions = function (tree, element) {
            return element instanceof model.Breakpoint || element instanceof model.ExceptionBreakpoint || element instanceof model.FunctionBreakpoint;
        };
        BreakpointsActionProvider.prototype.getActions = function (tree, element) {
            if (element instanceof model.Breakpoint) {
                return winjs_base_1.TPromise.as(this.getBreakpointActions());
            }
            return winjs_base_1.TPromise.as([]);
        };
        BreakpointsActionProvider.prototype.getBreakpointActions = function () {
            return [this.instantiationService.createInstance(debugactions.RemoveBreakpointAction, debugactions.RemoveBreakpointAction.ID, debugactions.RemoveBreakpointAction.LABEL)];
        };
        BreakpointsActionProvider.prototype.getSecondaryActions = function (tree, element) {
            var actions = [this.instantiationService.createInstance(debugactions.ToggleEnablementAction, debugactions.ToggleEnablementAction.ID, debugactions.ToggleEnablementAction.LABEL)];
            actions.push(new actionbar.Separator());
            if (element instanceof model.Breakpoint || element instanceof model.FunctionBreakpoint) {
                actions.push(this.instantiationService.createInstance(debugactions.RemoveBreakpointAction, debugactions.RemoveBreakpointAction.ID, debugactions.RemoveBreakpointAction.LABEL));
            }
            actions.push(this.instantiationService.createInstance(debugactions.RemoveAllBreakpointsAction, debugactions.RemoveAllBreakpointsAction.ID, debugactions.RemoveAllBreakpointsAction.LABEL));
            actions.push(new actionbar.Separator());
            actions.push(this.instantiationService.createInstance(debugactions.ToggleBreakpointsActivatedAction, debugactions.ToggleBreakpointsActivatedAction.ID, debugactions.ToggleBreakpointsActivatedAction.LABEL));
            actions.push(new actionbar.Separator());
            actions.push(this.instantiationService.createInstance(debugactions.EnableAllBreakpointsAction, debugactions.EnableAllBreakpointsAction.ID, debugactions.EnableAllBreakpointsAction.LABEL));
            actions.push(this.instantiationService.createInstance(debugactions.DisableAllBreakpointsAction, debugactions.DisableAllBreakpointsAction.ID, debugactions.DisableAllBreakpointsAction.LABEL));
            actions.push(new actionbar.Separator());
            actions.push(this.instantiationService.createInstance(debugactions.AddFunctionBreakpointAction, debugactions.AddFunctionBreakpointAction.ID, debugactions.AddFunctionBreakpointAction.LABEL));
            if (element instanceof model.FunctionBreakpoint) {
                actions.push(this.instantiationService.createInstance(debugactions.RenameFunctionBreakpointAction, debugactions.RenameFunctionBreakpointAction.ID, debugactions.RenameFunctionBreakpointAction.LABEL));
            }
            actions.push(new actionbar.Separator());
            actions.push(this.instantiationService.createInstance(debugactions.ReapplyBreakpointsAction, debugactions.ReapplyBreakpointsAction.ID, debugactions.ReapplyBreakpointsAction.LABEL));
            return winjs_base_1.TPromise.as(actions);
        };
        BreakpointsActionProvider.prototype.getActionItem = function (tree, element, action) {
            return null;
        };
        return BreakpointsActionProvider;
    }());
    exports.BreakpointsActionProvider = BreakpointsActionProvider;
    var BreakpointsDataSource = (function () {
        function BreakpointsDataSource() {
        }
        BreakpointsDataSource.prototype.getId = function (tree, element) {
            return element.getId();
        };
        BreakpointsDataSource.prototype.hasChildren = function (tree, element) {
            return element instanceof model.Model;
        };
        BreakpointsDataSource.prototype.getChildren = function (tree, element) {
            var model = element;
            var exBreakpoints = model.getExceptionBreakpoints();
            return winjs_base_1.TPromise.as(exBreakpoints.concat(model.getFunctionBreakpoints()).concat(model.getBreakpoints()));
        };
        BreakpointsDataSource.prototype.getParent = function (tree, element) {
            return winjs_base_1.TPromise.as(null);
        };
        return BreakpointsDataSource;
    }());
    exports.BreakpointsDataSource = BreakpointsDataSource;
    var BreakpointsRenderer = (function () {
        function BreakpointsRenderer(actionProvider, actionRunner, messageService, contextService, debugService, contextViewService) {
            this.actionProvider = actionProvider;
            this.actionRunner = actionRunner;
            this.messageService = messageService;
            this.contextService = contextService;
            this.debugService = debugService;
            this.contextViewService = contextViewService;
            // noop
        }
        BreakpointsRenderer.prototype.getHeight = function (tree, element) {
            return 22;
        };
        BreakpointsRenderer.prototype.getTemplateId = function (tree, element) {
            if (element instanceof model.Breakpoint) {
                return BreakpointsRenderer.BREAKPOINT_TEMPLATE_ID;
            }
            if (element instanceof model.FunctionBreakpoint) {
                return BreakpointsRenderer.FUNCTION_BREAKPOINT_TEMPLATE_ID;
            }
            if (element instanceof model.ExceptionBreakpoint) {
                return BreakpointsRenderer.EXCEPTION_BREAKPOINT_TEMPLATE_ID;
            }
            return null;
        };
        BreakpointsRenderer.prototype.renderTemplate = function (tree, templateId, container) {
            var data = Object.create(null);
            if (templateId === BreakpointsRenderer.BREAKPOINT_TEMPLATE_ID || templateId === BreakpointsRenderer.FUNCTION_BREAKPOINT_TEMPLATE_ID) {
                data.actionBar = new actionbar.ActionBar(container, { actionRunner: this.actionRunner });
                data.actionBar.push(this.actionProvider.getBreakpointActions(), { icon: true, label: false });
            }
            data.breakpoint = dom.append(container, $('.breakpoint'));
            data.toDisposeBeforeRender = [];
            data.checkbox = $('input');
            data.checkbox.type = 'checkbox';
            if (!platform_1.isMacintosh) {
                data.checkbox.className = 'checkbox-win-linux';
            }
            dom.append(data.breakpoint, data.checkbox);
            data.name = dom.append(data.breakpoint, $('span.name'));
            if (templateId === BreakpointsRenderer.BREAKPOINT_TEMPLATE_ID) {
                data.lineNumber = dom.append(data.breakpoint, $('span.line-number'));
                data.filePath = dom.append(data.breakpoint, $('span.file-path'));
            }
            return data;
        };
        BreakpointsRenderer.prototype.renderElement = function (tree, element, templateId, templateData) {
            var _this = this;
            templateData.toDisposeBeforeRender = lifecycle.dispose(templateData.toDisposeBeforeRender);
            templateData.toDisposeBeforeRender.push(dom.addStandardDisposableListener(templateData.checkbox, 'change', function (e) {
                _this.debugService.toggleEnablement(element);
            }));
            if (templateId === BreakpointsRenderer.EXCEPTION_BREAKPOINT_TEMPLATE_ID) {
                this.renderExceptionBreakpoint(element, templateData);
            }
            else if (templateId === BreakpointsRenderer.FUNCTION_BREAKPOINT_TEMPLATE_ID) {
                this.renderFunctionBreakpoint(tree, element, templateData);
            }
            else {
                this.renderBreakpoint(tree, element, templateData);
            }
        };
        BreakpointsRenderer.prototype.renderExceptionBreakpoint = function (exceptionBreakpoint, data) {
            data.name.textContent = exceptionBreakpoint.label || exceptionBreakpoint.filter + " exceptions";
            ;
            data.checkbox.checked = exceptionBreakpoint.enabled;
        };
        BreakpointsRenderer.prototype.renderFunctionBreakpoint = function (tree, functionBreakpoint, data) {
            var selected = this.debugService.getViewModel().getSelectedFunctionBreakpoint();
            if (!functionBreakpoint.name || (selected && selected.getId() === functionBreakpoint.getId())) {
                renderRenameBox(this.debugService, this.contextViewService, tree, functionBreakpoint, data.breakpoint, nls.localize(9, null), nls.localize(10, null));
            }
            else {
                this.debugService.getModel().areBreakpointsActivated() ? tree.removeTraits('disabled', [functionBreakpoint]) : tree.addTraits('disabled', [functionBreakpoint]);
                data.name.textContent = functionBreakpoint.name;
                data.checkbox.checked = functionBreakpoint.enabled;
            }
            data.actionBar.context = functionBreakpoint;
        };
        BreakpointsRenderer.prototype.renderBreakpoint = function (tree, breakpoint, data) {
            this.debugService.getModel().areBreakpointsActivated() ? tree.removeTraits('disabled', [breakpoint]) : tree.addTraits('disabled', [breakpoint]);
            data.name.textContent = labels.getPathLabel(paths.basename(breakpoint.source.uri.fsPath), this.contextService);
            data.lineNumber.textContent = breakpoint.desiredLineNumber !== breakpoint.lineNumber ? breakpoint.desiredLineNumber + ' \u2192 ' + breakpoint.lineNumber : '' + breakpoint.lineNumber;
            data.filePath.textContent = labels.getPathLabel(paths.dirname(breakpoint.source.uri.fsPath), this.contextService);
            data.checkbox.checked = breakpoint.enabled;
            data.actionBar.context = breakpoint;
            if (breakpoint.condition) {
                data.breakpoint.title = breakpoint.condition;
            }
        };
        BreakpointsRenderer.prototype.disposeTemplate = function (tree, templateId, templateData) {
            if (templateId === BreakpointsRenderer.BREAKPOINT_TEMPLATE_ID || templateId === BreakpointsRenderer.FUNCTION_BREAKPOINT_TEMPLATE_ID) {
                templateData.actionBar.dispose();
            }
        };
        BreakpointsRenderer.EXCEPTION_BREAKPOINT_TEMPLATE_ID = 'exceptionBreakpoint';
        BreakpointsRenderer.FUNCTION_BREAKPOINT_TEMPLATE_ID = 'functionBreakpoint';
        BreakpointsRenderer.BREAKPOINT_TEMPLATE_ID = 'breakpoint';
        BreakpointsRenderer = __decorate([
            __param(2, message_1.IMessageService),
            __param(3, workspace_1.IWorkspaceContextService),
            __param(4, debug.IDebugService),
            __param(5, contextView_1.IContextViewService)
        ], BreakpointsRenderer);
        return BreakpointsRenderer;
    }());
    exports.BreakpointsRenderer = BreakpointsRenderer;
    var BreakpointsAccessibilityProvider = (function () {
        function BreakpointsAccessibilityProvider(contextService) {
            this.contextService = contextService;
            // noop
        }
        BreakpointsAccessibilityProvider.prototype.getAriaLabel = function (tree, element) {
            if (element instanceof model.Breakpoint) {
                return nls.localize(11, null, element.lineNumber, getSourceName(element.source, this.contextService));
            }
            if (element instanceof model.FunctionBreakpoint) {
                return nls.localize(12, null, element.name);
            }
            if (element instanceof model.ExceptionBreakpoint) {
                return nls.localize(13, null, element.filter);
            }
            return null;
        };
        BreakpointsAccessibilityProvider = __decorate([
            __param(0, workspace_1.IWorkspaceContextService)
        ], BreakpointsAccessibilityProvider);
        return BreakpointsAccessibilityProvider;
    }());
    exports.BreakpointsAccessibilityProvider = BreakpointsAccessibilityProvider;
    var BreakpointsController = (function (_super) {
        __extends(BreakpointsController, _super);
        function BreakpointsController() {
            _super.apply(this, arguments);
        }
        BreakpointsController.prototype.onLeftClick = function (tree, element, event) {
            if (element instanceof model.FunctionBreakpoint && event.detail === 2) {
                this.debugService.getViewModel().setSelectedFunctionBreakpoint(element);
                return true;
            }
            return _super.prototype.onLeftClick.call(this, tree, element, event);
        };
        BreakpointsController.prototype.onSpace = function (tree, event) {
            _super.prototype.onSpace.call(this, tree, event);
            var element = tree.getFocus();
            this.debugService.toggleEnablement(element).done(null, errors.onUnexpectedError);
            return true;
        };
        BreakpointsController.prototype.onDelete = function (tree, event) {
            var element = tree.getFocus();
            if (element instanceof model.Breakpoint) {
                var bp = element;
                this.debugService.toggleBreakpoint({ uri: bp.source.uri, lineNumber: bp.lineNumber }).done(null, errors.onUnexpectedError);
                return true;
            }
            else if (element instanceof model.FunctionBreakpoint) {
                var fbp = element;
                this.debugService.removeFunctionBreakpoints(fbp.getId()).done(null, errors.onUnexpectedError);
                return true;
            }
            return false;
        };
        return BreakpointsController;
    }(BaseDebugController));
    exports.BreakpointsController = BreakpointsController;
});
//# sourceMappingURL=debugViewer.js.map