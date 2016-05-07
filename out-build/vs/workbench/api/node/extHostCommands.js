var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/platform/thread/common/thread', 'vs/base/common/types', 'vs/platform/keybinding/common/keybindingsRegistry', 'vs/platform/keybinding/common/keybindingService', 'vs/base/common/winjs.base', 'vs/workbench/api/node/extHostEditors', 'vs/workbench/api/node/extHostTypes', 'vs/workbench/api/node/extHostTypeConverters', 'vs/base/common/objects'], function (require, exports, thread_1, types_1, keybindingsRegistry_1, keybindingService_1, winjs_base_1, extHostEditors_1, extHostTypes, extHostTypeConverter, objects_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ExtHostCommands = (function () {
        function ExtHostCommands(threadService) {
            this._commands = Object.create(null);
            this._extHostEditors = threadService.getRemotable(extHostEditors_1.ExtHostEditors);
            this._proxy = threadService.getRemotable(MainThreadCommands);
        }
        ExtHostCommands.prototype.registerCommand = function (id, callback, thisArg, description) {
            var _this = this;
            if (!id.trim().length) {
                throw new Error('invalid id');
            }
            if (this._commands[id]) {
                throw new Error('command with id already exists');
            }
            this._commands[id] = { callback: callback, thisArg: thisArg, description: description };
            this._proxy.$registerCommand(id);
            return new extHostTypes.Disposable(function () { return delete _this._commands[id]; });
        };
        ExtHostCommands.prototype.executeCommand = function (id) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (this._commands[id]) {
                // we stay inside the extension host and support
                // to pass any kind of parameters around
                return this.$executeContributedCommand.apply(this, [id].concat(args));
            }
            else {
                // automagically convert some argument types
                args = objects_1.cloneAndChange(args, function (value) {
                    if (value instanceof extHostTypes.Position) {
                        return extHostTypeConverter.fromPosition(value);
                    }
                    if (value instanceof extHostTypes.Range) {
                        return extHostTypeConverter.fromRange(value);
                    }
                    if (value instanceof extHostTypes.Location) {
                        return extHostTypeConverter.location.from(value);
                    }
                    if (!Array.isArray(value)) {
                        return value;
                    }
                });
                return this._proxy.$executeCommand(id, args);
            }
        };
        ExtHostCommands.prototype.$executeContributedCommand = function (id) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var command = this._commands[id];
            if (!command) {
                return Promise.reject("Contributed command '" + id + "' does not exist.");
            }
            try {
                var callback = command.callback, thisArg = command.thisArg, description = command.description;
                if (description) {
                    for (var i = 0; i < description.args.length; i++) {
                        types_1.validateConstraint(args[i], description.args[i].constraint);
                    }
                }
                var result = callback.apply(thisArg, args);
                return Promise.resolve(result);
            }
            catch (err) {
                // console.log(err);
                // try {
                // 	console.log(toErrorMessage(err));
                // } catch (err) {
                // 	//
                // }
                return Promise.reject("Running the contributed command:'" + id + "' failed.");
            }
        };
        ExtHostCommands.prototype.getCommands = function (filterUnderscoreCommands) {
            if (filterUnderscoreCommands === void 0) { filterUnderscoreCommands = false; }
            return this._proxy.$getCommands().then(function (result) {
                if (filterUnderscoreCommands) {
                    result = result.filter(function (command) { return command[0] !== '_'; });
                }
                return result;
            });
        };
        ExtHostCommands.prototype.$getContributedCommandHandlerDescriptions = function () {
            var result = Object.create(null);
            for (var id in this._commands) {
                var description = this._commands[id].description;
                if (description) {
                    result[id] = description;
                }
            }
            return winjs_base_1.TPromise.as(result);
        };
        ExtHostCommands = __decorate([
            thread_1.Remotable.ExtHostContext('ExtHostCommands'),
            __param(0, thread_1.IThreadService)
        ], ExtHostCommands);
        return ExtHostCommands;
    }());
    exports.ExtHostCommands = ExtHostCommands;
    var MainThreadCommands = (function () {
        function MainThreadCommands(threadService, keybindingService) {
            this._threadService = threadService;
            this._keybindingService = keybindingService;
            this._proxy = this._threadService.getRemotable(ExtHostCommands);
        }
        MainThreadCommands.prototype.$registerCommand = function (id) {
            var _this = this;
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandDesc({
                id: id,
                handler: function (serviceAccessor) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    return (_a = _this._proxy).$executeContributedCommand.apply(_a, [id].concat(args));
                    var _a;
                },
                weight: undefined,
                context: undefined,
                win: undefined,
                mac: undefined,
                linux: undefined,
                primary: undefined,
                secondary: undefined
            });
            return undefined;
        };
        MainThreadCommands.prototype.$executeCommand = function (id, args) {
            return this._keybindingService.executeCommand(id, args);
        };
        MainThreadCommands.prototype.$getCommands = function () {
            return winjs_base_1.TPromise.as(Object.keys(keybindingsRegistry_1.KeybindingsRegistry.getCommands()));
        };
        MainThreadCommands = __decorate([
            thread_1.Remotable.MainContext('MainThreadCommands'),
            __param(0, thread_1.IThreadService),
            __param(1, keybindingService_1.IKeybindingService)
        ], MainThreadCommands);
        return MainThreadCommands;
    }());
    exports.MainThreadCommands = MainThreadCommands;
    // --- command doc
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandDesc({
        id: '_generateCommandsDocumentation',
        handler: function (accessor) {
            return accessor.get(thread_1.IThreadService).getRemotable(ExtHostCommands).$getContributedCommandHandlerDescriptions().then(function (result) {
                // add local commands
                var commands = keybindingsRegistry_1.KeybindingsRegistry.getCommands();
                for (var id in commands) {
                    var description = commands[id].description;
                    if (description) {
                        result[id] = description;
                    }
                }
                // print all as markdown
                var all = [];
                for (var id in result) {
                    all.push('`' + id + '` - ' + _generateMarkdown(result[id]));
                }
                console.log(all.join('\n'));
            });
        },
        context: undefined,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.builtinExtension(0),
        primary: undefined
    });
    function _generateMarkdown(description) {
        if (typeof description === 'string') {
            return description;
        }
        else {
            var parts = [description.description];
            parts.push('\n\n');
            if (description.args) {
                for (var _i = 0, _a = description.args; _i < _a.length; _i++) {
                    var arg = _a[_i];
                    parts.push("* _" + arg.name + "_ " + (arg.description || '') + "\n");
                }
            }
            if (description.returns) {
                parts.push("* _(returns)_ " + description.returns);
            }
            parts.push('\n\n');
            return parts.join('');
        }
    }
});
//# sourceMappingURL=extHostCommands.js.map