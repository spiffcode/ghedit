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
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/nls!vs/workbench/parts/quickopen/browser/commandsHandler', 'vs/base/common/arrays', 'vs/base/common/types', 'vs/base/common/strings', 'vs/base/common/errors', 'vs/base/parts/quickopen/common/quickOpen', 'vs/base/parts/quickopen/browser/quickOpenModel', 'vs/platform/actions/common/actions', 'vs/workbench/common/actionRegistry', 'vs/platform/platform', 'vs/workbench/browser/quickopen', 'vs/workbench/browser/actions/quickOpenAction', 'vs/base/common/filters', 'vs/editor/common/editorAction', 'vs/editor/common/editorActionEnablement', 'vs/workbench/services/editor/common/editorService', 'vs/platform/instantiation/common/instantiation', 'vs/platform/message/common/message', 'vs/platform/telemetry/common/telemetry', 'vs/platform/keybinding/common/keybindingService', 'vs/workbench/services/quickopen/common/quickOpenService', 'vs/css!./media/commandsHandler'], function (require, exports, winjs_base_1, nls, arrays, types, strings, errors_1, quickOpen_1, quickOpenModel_1, actions_1, actionRegistry_1, platform_1, quickopen_1, quickOpenAction_1, filters_1, editorAction_1, editorActionEnablement_1, editorService_1, instantiation_1, message_1, telemetry_1, keybindingService_1, quickOpenService_1) {
    'use strict';
    exports.ALL_COMMANDS_PREFIX = '>';
    exports.EDITOR_COMMANDS_PREFIX = '$';
    var wordFilter = filters_1.or(filters_1.matchesPrefix, filters_1.matchesWords, filters_1.matchesContiguousSubString);
    var ShowAllCommandsAction = (function (_super) {
        __extends(ShowAllCommandsAction, _super);
        function ShowAllCommandsAction(actionId, actionLabel, quickOpenService) {
            _super.call(this, actionId, actionLabel, exports.ALL_COMMANDS_PREFIX, quickOpenService);
        }
        ShowAllCommandsAction.ID = 'workbench.action.showCommands';
        ShowAllCommandsAction.LABEL = nls.localize(0, null);
        ShowAllCommandsAction = __decorate([
            __param(2, quickOpenService_1.IQuickOpenService)
        ], ShowAllCommandsAction);
        return ShowAllCommandsAction;
    }(quickOpenAction_1.QuickOpenAction));
    exports.ShowAllCommandsAction = ShowAllCommandsAction;
    var BaseCommandEntry = (function (_super) {
        __extends(BaseCommandEntry, _super);
        function BaseCommandEntry(keyLabel, keyAriaLabel, description, highlights, messageService, telemetryService) {
            _super.call(this);
            this.messageService = messageService;
            this.telemetryService = telemetryService;
            this.keyLabel = keyLabel;
            this.keyAriaLabel = keyAriaLabel;
            this.description = description;
            this.setHighlights(highlights);
        }
        BaseCommandEntry.prototype.getLabel = function () {
            return this.description;
        };
        BaseCommandEntry.prototype.getAriaLabel = function () {
            if (this.keyAriaLabel) {
                return nls.localize(1, null, this.getLabel(), this.keyAriaLabel);
            }
            return nls.localize(2, null, this.getLabel());
        };
        BaseCommandEntry.prototype.getGroupLabel = function () {
            return this.keyLabel;
        };
        BaseCommandEntry.prototype.onError = function (error) {
            var message = !error ? nls.localize(3, null, this.description) : errors_1.toErrorMessage(error);
            this.messageService.show(message_1.Severity.Error, message);
        };
        BaseCommandEntry.prototype.runAction = function (action) {
            var _this = this;
            // Use a timeout to give the quick open widget a chance to close itself first
            winjs_base_1.TPromise.timeout(50).done(function () {
                if (action && action.enabled) {
                    try {
                        _this.telemetryService.publicLog('workbenchActionExecuted', { id: action.id, from: 'quick open' });
                        (action.run() || winjs_base_1.TPromise.as(null)).done(function () {
                            action.dispose();
                        }, function (err) { return _this.onError(err); });
                    }
                    catch (error) {
                        _this.onError(error);
                    }
                }
                else {
                    _this.messageService.show(message_1.Severity.Info, nls.localize(4, null, _this.getLabel()));
                }
            }, function (err) { return _this.onError(err); });
        };
        BaseCommandEntry = __decorate([
            __param(4, message_1.IMessageService),
            __param(5, telemetry_1.ITelemetryService)
        ], BaseCommandEntry);
        return BaseCommandEntry;
    }(quickOpenModel_1.QuickOpenEntryGroup));
    var CommandEntry = (function (_super) {
        __extends(CommandEntry, _super);
        function CommandEntry(keyLabel, keyAriaLabel, description, highlights, actionDescriptor, editorService, instantiationService, messageService, telemetryService) {
            _super.call(this, keyLabel, keyAriaLabel, description, highlights, messageService, telemetryService);
            this.editorService = editorService;
            this.instantiationService = instantiationService;
            this.actionDescriptor = actionDescriptor;
        }
        CommandEntry.prototype.run = function (mode, context) {
            if (mode === quickOpen_1.Mode.OPEN) {
                var action = this.instantiationService.createInstance(this.actionDescriptor.syncDescriptor);
                this.runAction(action);
                return true;
            }
            return false;
        };
        CommandEntry = __decorate([
            __param(5, editorService_1.IWorkbenchEditorService),
            __param(6, instantiation_1.IInstantiationService),
            __param(7, message_1.IMessageService),
            __param(8, telemetry_1.ITelemetryService)
        ], CommandEntry);
        return CommandEntry;
    }(BaseCommandEntry));
    var EditorActionCommandEntry = (function (_super) {
        __extends(EditorActionCommandEntry, _super);
        function EditorActionCommandEntry(keyLabel, keyAriaLabel, description, highlights, action, editorService, messageService, telemetryService) {
            _super.call(this, keyLabel, keyAriaLabel, description, highlights, messageService, telemetryService);
            this.editorService = editorService;
            this.action = action;
        }
        EditorActionCommandEntry.prototype.run = function (mode, context) {
            if (mode === quickOpen_1.Mode.OPEN) {
                this.runAction(this.action);
                return true;
            }
            return false;
        };
        EditorActionCommandEntry = __decorate([
            __param(5, editorService_1.IWorkbenchEditorService),
            __param(6, message_1.IMessageService),
            __param(7, telemetry_1.ITelemetryService)
        ], EditorActionCommandEntry);
        return EditorActionCommandEntry;
    }(BaseCommandEntry));
    var ActionCommandEntry = (function (_super) {
        __extends(ActionCommandEntry, _super);
        function ActionCommandEntry(keyLabel, keyAriaLabel, description, highlights, action, messageService, telemetryService) {
            _super.call(this, keyLabel, keyAriaLabel, description, highlights, messageService, telemetryService);
            this.action = action;
        }
        ActionCommandEntry.prototype.run = function (mode, context) {
            if (mode === quickOpen_1.Mode.OPEN) {
                this.runAction(this.action);
                return true;
            }
            return false;
        };
        ActionCommandEntry = __decorate([
            __param(5, message_1.IMessageService),
            __param(6, telemetry_1.ITelemetryService)
        ], ActionCommandEntry);
        return ActionCommandEntry;
    }(BaseCommandEntry));
    var CommandsHandler = (function (_super) {
        __extends(CommandsHandler, _super);
        function CommandsHandler(editorService, instantiationService, messageService, keybindingService, actionsService) {
            _super.call(this);
            this.editorService = editorService;
            this.instantiationService = instantiationService;
            this.messageService = messageService;
            this.keybindingService = keybindingService;
            this.actionsService = actionsService;
        }
        CommandsHandler.prototype.includeWorkbenchCommands = function () {
            return true;
        };
        CommandsHandler.prototype.getResults = function (searchValue) {
            searchValue = searchValue.trim();
            // Workbench Actions (if prefix asks for all commands)
            var workbenchEntries = [];
            if (this.includeWorkbenchCommands()) {
                var workbenchActions = platform_1.Registry.as(actionRegistry_1.Extensions.WorkbenchActions).getWorkbenchActions();
                workbenchEntries = this.actionDescriptorsToEntries(workbenchActions, searchValue);
            }
            // Editor Actions
            var activeEditor = this.editorService.getActiveEditor();
            var activeEditorControl = (activeEditor ? activeEditor.getControl() : null);
            var editorActions = [];
            if (activeEditorControl && types.isFunction(activeEditorControl.getActions)) {
                editorActions = activeEditorControl.getActions();
            }
            var editorEntries = this.editorActionsToEntries(editorActions, searchValue);
            // Other Actions
            var otherActions = this.actionsService.getActions();
            var otherEntries = this.otherActionsToEntries(otherActions, searchValue);
            // Concat
            var entries = workbenchEntries.concat(editorEntries, otherEntries);
            // Remove duplicates
            entries = arrays.distinct(entries, function (entry) { return entry.getLabel() + entry.getGroupLabel(); });
            // Sort by name
            entries = entries.sort(function (elementA, elementB) { return strings.localeCompare(elementA.getLabel().toLowerCase(), elementB.getLabel().toLowerCase()); });
            return winjs_base_1.TPromise.as(new quickOpenModel_1.QuickOpenModel(entries));
        };
        CommandsHandler.prototype.actionDescriptorsToEntries = function (actionDescriptors, searchValue) {
            var _this = this;
            var entries = [];
            var registry = platform_1.Registry.as(actionRegistry_1.Extensions.WorkbenchActions);
            for (var i = 0; i < actionDescriptors.length; i++) {
                var actionDescriptor = actionDescriptors[i];
                var keys = this.keybindingService.lookupKeybindings(actionDescriptor.id);
                var keyLabel = keys.map(function (k) { return _this.keybindingService.getLabelFor(k); });
                var keyAriaLabel = keys.map(function (k) { return _this.keybindingService.getAriaLabelFor(k); });
                if (actionDescriptor.label) {
                    var label = actionDescriptor.label;
                    var category = registry.getCategory(actionDescriptor.id);
                    if (category) {
                        label = nls.localize(5, null, category, label);
                    }
                    var highlights = wordFilter(searchValue, label);
                    if (highlights) {
                        entries.push(this.instantiationService.createInstance(CommandEntry, keyLabel.length > 0 ? keyLabel.join(', ') : '', keyAriaLabel.length > 0 ? keyAriaLabel.join(', ') : '', label, highlights, actionDescriptor));
                    }
                }
            }
            return entries;
        };
        CommandsHandler.prototype.editorActionsToEntries = function (actions, searchValue) {
            var _this = this;
            var entries = [];
            for (var i = 0; i < actions.length; i++) {
                var action = actions[i];
                var editorAction = action;
                if (!editorAction.isSupported()) {
                    continue; // do not show actions that are not supported in this context
                }
                var keys = this.keybindingService.lookupKeybindings(editorAction.id);
                var keyLabel = keys.map(function (k) { return _this.keybindingService.getLabelFor(k); });
                var keyAriaLabel = keys.map(function (k) { return _this.keybindingService.getAriaLabelFor(k); });
                if (action.label) {
                    var highlights = wordFilter(searchValue, action.label);
                    if (highlights) {
                        entries.push(this.instantiationService.createInstance(EditorActionCommandEntry, keyLabel.length > 0 ? keyLabel.join(', ') : '', keyAriaLabel.length > 0 ? keyAriaLabel.join(', ') : '', action.label, highlights, action));
                    }
                }
            }
            return entries;
        };
        CommandsHandler.prototype.otherActionsToEntries = function (actions, searchValue) {
            var _this = this;
            var entries = [];
            for (var _i = 0, actions_2 = actions; _i < actions_2.length; _i++) {
                var action = actions_2[_i];
                var keys = this.keybindingService.lookupKeybindings(action.id);
                var keyLabel = keys.map(function (k) { return _this.keybindingService.getLabelFor(k); });
                var keyAriaLabel = keys.map(function (k) { return _this.keybindingService.getAriaLabelFor(k); });
                var highlights = wordFilter(searchValue, action.label);
                if (highlights) {
                    entries.push(this.instantiationService.createInstance(ActionCommandEntry, keyLabel.join(', '), keyAriaLabel.join(', '), action.label, highlights, action));
                }
            }
            return entries;
        };
        CommandsHandler.prototype.getAutoFocus = function (searchValue) {
            return {
                autoFocusFirstEntry: true,
                autoFocusPrefixMatch: searchValue.trim()
            };
        };
        CommandsHandler.prototype.getClass = function () {
            return 'commands-handler';
        };
        CommandsHandler.prototype.getEmptyLabel = function (searchString) {
            return nls.localize(6, null);
        };
        CommandsHandler = __decorate([
            __param(0, editorService_1.IWorkbenchEditorService),
            __param(1, instantiation_1.IInstantiationService),
            __param(2, message_1.IMessageService),
            __param(3, keybindingService_1.IKeybindingService),
            __param(4, actions_1.IActionsService)
        ], CommandsHandler);
        return CommandsHandler;
    }(quickopen_1.QuickOpenHandler));
    exports.CommandsHandler = CommandsHandler;
    var EditorCommandsHandler = (function (_super) {
        __extends(EditorCommandsHandler, _super);
        function EditorCommandsHandler() {
            _super.apply(this, arguments);
        }
        EditorCommandsHandler.prototype.includeWorkbenchCommands = function () {
            return false;
        };
        return EditorCommandsHandler;
    }(CommandsHandler));
    exports.EditorCommandsHandler = EditorCommandsHandler;
    var QuickCommandsEditorAction = (function (_super) {
        __extends(QuickCommandsEditorAction, _super);
        function QuickCommandsEditorAction(descriptor, editor, quickOpenService) {
            _super.call(this, descriptor, editor, editorActionEnablement_1.Behaviour.WidgetFocus | editorActionEnablement_1.Behaviour.ShowInContextMenu);
            this.quickOpenService = quickOpenService;
            this.label = nls.localize(7, null);
        }
        QuickCommandsEditorAction.prototype.getGroupId = function () {
            return '4_tools/1_commands';
        };
        QuickCommandsEditorAction.prototype.run = function () {
            // Pass focus to editor first before running quick open action
            this.editor.focus();
            // Show with prefix
            this.quickOpenService.show('$');
            return _super.prototype.run.call(this);
        };
        QuickCommandsEditorAction.ID = 'editor.action.quickCommand';
        QuickCommandsEditorAction = __decorate([
            __param(2, quickOpenService_1.IQuickOpenService)
        ], QuickCommandsEditorAction);
        return QuickCommandsEditorAction;
    }(editorAction_1.EditorAction));
    exports.QuickCommandsEditorAction = QuickCommandsEditorAction;
});
//# sourceMappingURL=commandsHandler.js.map