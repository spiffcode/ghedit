define(["require", "exports", 'vs/base/common/keyCodes', 'vs/base/common/platform', 'vs/base/common/types', 'vs/platform/platform'], function (require, exports, keyCodes_1, platform, types_1, platform_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var KeybindingsRegistryImpl = (function () {
        function KeybindingsRegistryImpl() {
            this.WEIGHT = {
                editorCore: function (importance) {
                    if (importance === void 0) { importance = 0; }
                    return 0 + importance;
                },
                editorContrib: function (importance) {
                    if (importance === void 0) { importance = 0; }
                    return 100 + importance;
                },
                workbenchContrib: function (importance) {
                    if (importance === void 0) { importance = 0; }
                    return 200 + importance;
                },
                builtinExtension: function (importance) {
                    if (importance === void 0) { importance = 0; }
                    return 300 + importance;
                },
                externalExtension: function (importance) {
                    if (importance === void 0) { importance = 0; }
                    return 400 + importance;
                }
            };
            this._keybindings = [];
            this._commands = Object.create(null);
        }
        /**
         * Take current platform into account and reduce to primary & secondary.
         */
        KeybindingsRegistryImpl.bindToCurrentPlatform = function (kb) {
            if (platform.isWindows) {
                if (kb && kb.win) {
                    return kb.win;
                }
            }
            else if (platform.isMacintosh) {
                if (kb && kb.mac) {
                    return kb.mac;
                }
            }
            else {
                if (kb && kb.linux) {
                    return kb.linux;
                }
            }
            return kb;
        };
        KeybindingsRegistryImpl.prototype.registerCommandRule = function (rule) {
            var _this = this;
            var actualKb = KeybindingsRegistryImpl.bindToCurrentPlatform(rule);
            if (actualKb && actualKb.primary) {
                this.registerDefaultKeybinding(actualKb.primary, rule.id, rule.weight, 0, rule.context);
            }
            if (actualKb && Array.isArray(actualKb.secondary)) {
                actualKb.secondary.forEach(function (k, i) { return _this.registerDefaultKeybinding(k, rule.id, rule.weight, -i - 1, rule.context); });
            }
        };
        KeybindingsRegistryImpl.prototype.registerCommandDesc = function (desc) {
            this.registerCommandRule(desc);
            // if (_commands[desc.id]) {
            // 	console.warn('Duplicate handler for command: ' + desc.id);
            // }
            // this._commands[desc.id] = desc.handler;
            var handler = desc.handler;
            var description = desc.description || handler.description;
            // add argument validation if rich command metadata is provided
            if (typeof description === 'object') {
                var constraints_1 = [];
                for (var _i = 0, _a = description.args; _i < _a.length; _i++) {
                    var arg = _a[_i];
                    constraints_1.push(arg.constraint);
                }
                handler = function (accesor, args) {
                    types_1.validateConstraints(args, constraints_1);
                    return desc.handler(accesor, args);
                };
            }
            // make sure description is there
            handler.description = description;
            // register handler
            this._commands[desc.id] = handler;
        };
        KeybindingsRegistryImpl.prototype.getCommands = function () {
            return this._commands;
        };
        KeybindingsRegistryImpl.prototype.registerDefaultKeybinding = function (keybinding, commandId, weight1, weight2, context) {
            if (platform.isWindows) {
                if (keyCodes_1.BinaryKeybindings.hasCtrlCmd(keybinding) && !keyCodes_1.BinaryKeybindings.hasShift(keybinding) && keyCodes_1.BinaryKeybindings.hasAlt(keybinding) && !keyCodes_1.BinaryKeybindings.hasWinCtrl(keybinding)) {
                    if (/^[A-Z0-9\[\]\|\;\'\,\.\/\`]$/.test(keyCodes_1.KeyCode.toString(keyCodes_1.BinaryKeybindings.extractKeyCode(keybinding)))) {
                        console.warn('Ctrl+Alt+ keybindings should not be used by default under Windows. Offender: ', keybinding, ' for ', commandId);
                    }
                }
            }
            this._keybindings.push({
                keybinding: keybinding,
                command: commandId,
                context: context,
                weight1: weight1,
                weight2: weight2
            });
        };
        KeybindingsRegistryImpl.prototype.getDefaultKeybindings = function () {
            return this._keybindings;
        };
        return KeybindingsRegistryImpl;
    }());
    exports.KeybindingsRegistry = new KeybindingsRegistryImpl();
    // Define extension point ids
    exports.Extensions = {
        EditorModes: 'platform.keybindingsRegistry'
    };
    platform_1.Registry.add(exports.Extensions.EditorModes, exports.KeybindingsRegistry);
});
