var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/nls', 'vs/base/common/actions', 'vs/platform/extensions/common/extensions', 'vs/platform/extensions/common/extensionsRegistry', 'vs/platform/keybinding/common/keybindingService'], function (require, exports, nls_1, actions_1, extensions_1, extensionsRegistry_1, keybindingService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function isCommands(thing) {
        return Array.isArray(thing);
    }
    function isValidCommand(candidate, rejects) {
        if (!candidate) {
            rejects.push(nls_1.localize('nonempty', "expected non-empty value."));
            return false;
        }
        if (typeof candidate.command !== 'string') {
            rejects.push(nls_1.localize('requirestring', "property `{0}` is mandatory and must be of type `string`", 'command'));
            return false;
        }
        if (typeof candidate.title !== 'string') {
            rejects.push(nls_1.localize('requirestring', "property `{0}` is mandatory and must be of type `string`", 'title'));
            return false;
        }
        if (candidate.category && typeof candidate.category !== 'string') {
            rejects.push(nls_1.localize('optstring', "property `{0}` can be omitted or must be of type `string`", 'category'));
            return false;
        }
        return true;
    }
    var commandType = {
        type: 'object',
        properties: {
            command: {
                description: nls_1.localize('vscode.extension.contributes.commandType.command', 'Identifier of the command to execute'),
                type: 'string'
            },
            title: {
                description: nls_1.localize('vscode.extension.contributes.commandType.title', 'Title by which the command is represented in the UI.'),
                type: 'string'
            },
            category: {
                description: nls_1.localize('vscode.extension.contributes.commandType.category', '(Optional) category string by the command is grouped in the UI'),
                type: 'string'
            }
        }
    };
    var commandsExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint('commands', {
        description: nls_1.localize('vscode.extension.contributes.commands', "Contributes commands to the command palette."),
        oneOf: [
            commandType,
            {
                type: 'array',
                items: commandType
            }
        ]
    });
    var ActionsService = (function () {
        function ActionsService(extensionService, keybindingsService) {
            var _this = this;
            this._extensionsActions = [];
            this._extensionService = extensionService;
            this._keybindingsService = keybindingsService;
            commandsExtPoint.setHandler(function (extensions) {
                for (var _i = 0, extensions_2 = extensions; _i < extensions_2.length; _i++) {
                    var d = extensions_2[_i];
                    _this._onDescription(d.value, d.collector);
                }
            });
        }
        ActionsService.prototype._onDescription = function (commands, collector) {
            if (isCommands(commands)) {
                for (var _i = 0, commands_1 = commands; _i < commands_1.length; _i++) {
                    var command = commands_1[_i];
                    this._handleCommand(command, collector);
                }
            }
            else {
                this._handleCommand(commands, collector);
            }
        };
        ActionsService.prototype._handleCommand = function (command, collector) {
            var _this = this;
            var rejects = [];
            if (isValidCommand(command, rejects)) {
                // make sure this extension is activated by this command
                var activationEvent_1 = "onCommand:" + command.command;
                // action that (1) activates the extension and dispatches the command
                var label = command.category ? nls_1.localize('category.label', "{0}: {1}", command.category, command.title) : command.title;
                var action = new actions_1.Action(command.command, label, undefined, true, function () {
                    return _this._extensionService.activateByEvent(activationEvent_1).then(function () {
                        return _this._keybindingsService.executeCommand(command.command);
                    });
                });
                this._extensionsActions.push(action);
            }
            if (rejects.length > 0) {
                collector.error(nls_1.localize('error', "Invalid `contributes.{0}`: {1}", commandsExtPoint.name, rejects.join('\n')));
            }
        };
        ActionsService.prototype.getActions = function () {
            return this._extensionsActions.slice(0);
        };
        ActionsService = __decorate([
            __param(0, extensions_1.IExtensionService),
            __param(1, keybindingService_1.IKeybindingService)
        ], ActionsService);
        return ActionsService;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ActionsService;
});
//# sourceMappingURL=actionsService.js.map