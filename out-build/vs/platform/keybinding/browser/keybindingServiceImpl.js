var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls', 'vs/base/common/keyCodes', 'vs/base/common/lifecycle', 'vs/base/common/severity', 'vs/base/common/arrays', 'vs/base/common/winjs.base', 'vs/base/browser/dom', 'vs/base/browser/keyboardEvent', 'vs/platform/keybinding/common/keybindingResolver', 'vs/platform/keybinding/common/keybindingService', 'vs/platform/keybinding/common/keybindingsRegistry', 'vs/css!./keybindings'], function (require, exports, nls, keyCodes_1, lifecycle_1, severity_1, arrays_1, winjs_base_1, dom, keyboardEvent_1, keybindingResolver_1, keybindingService_1, keybindingsRegistry_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var KEYBINDING_CONTEXT_ATTR = 'data-keybinding-context';
    var KeybindingContext = (function () {
        function KeybindingContext(id, parent) {
            this._id = id;
            this._parent = parent;
            this._value = Object.create(null);
            this._value['_contextId'] = id;
        }
        KeybindingContext.prototype.setValue = function (key, value) {
            //		console.log('SET ' + key + ' = ' + value + ' ON ' + this._id);
            this._value[key] = value;
        };
        KeybindingContext.prototype.removeValue = function (key) {
            //		console.log('REMOVE ' + key + ' FROM ' + this._id);
            delete this._value[key];
        };
        KeybindingContext.prototype.fillInContext = function (bucket) {
            if (this._parent) {
                this._parent.fillInContext(bucket);
            }
            for (var key in this._value) {
                bucket[key] = this._value[key];
            }
        };
        return KeybindingContext;
    }());
    exports.KeybindingContext = KeybindingContext;
    var ConfigurationContext = (function () {
        function ConfigurationContext(configurationService) {
            var _this = this;
            this._subscription = configurationService.onDidUpdateConfiguration(function (e) { return _this._updateConfigurationContext(e.config); });
            this._updateConfigurationContext(configurationService.getConfiguration());
        }
        ConfigurationContext.prototype.dispose = function () {
            this._subscription.dispose();
        };
        ConfigurationContext.prototype._updateConfigurationContext = function (config) {
            var _this = this;
            this._values = Object.create(null);
            var walk = function (obj, keys) {
                for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        keys.push(key);
                        var value = obj[key];
                        if (typeof value === 'boolean') {
                            _this._values[keys.join('.')] = value;
                        }
                        else if (typeof value === 'object') {
                            walk(value, keys);
                        }
                        keys.pop();
                    }
                }
            };
            walk(config, ['config']);
        };
        ConfigurationContext.prototype.fillInContext = function (bucket) {
            if (this._values) {
                for (var key in this._values) {
                    bucket[key] = this._values[key];
                }
            }
        };
        return ConfigurationContext;
    }());
    exports.ConfigurationContext = ConfigurationContext;
    var KeybindingContextKey = (function () {
        function KeybindingContextKey(parent, key, defaultValue) {
            this._parent = parent;
            this._key = key;
            this._defaultValue = defaultValue;
            if (typeof this._defaultValue !== 'undefined') {
                this._parent.setContext(this._key, this._defaultValue);
            }
        }
        KeybindingContextKey.prototype.set = function (value) {
            this._parent.setContext(this._key, value);
        };
        KeybindingContextKey.prototype.reset = function () {
            if (typeof this._defaultValue === 'undefined') {
                this._parent.removeContext(this._key);
            }
            else {
                this._parent.setContext(this._key, this._defaultValue);
            }
        };
        return KeybindingContextKey;
    }());
    var AbstractKeybindingService = (function () {
        function AbstractKeybindingService(myContextId) {
            this.serviceId = keybindingService_1.IKeybindingService;
            this._myContextId = myContextId;
            this._instantiationService = null;
            this._messageService = null;
        }
        AbstractKeybindingService.prototype.setMessageService = function (messageService) {
            this._messageService = messageService;
        };
        AbstractKeybindingService.prototype.createKey = function (key, defaultValue) {
            return new KeybindingContextKey(this, key, defaultValue);
        };
        AbstractKeybindingService.prototype.setInstantiationService = function (instantiationService) {
            this._instantiationService = instantiationService;
        };
        AbstractKeybindingService.prototype.createScoped = function (domNode) {
            return new ScopedKeybindingService(this, domNode);
        };
        AbstractKeybindingService.prototype.setContext = function (key, value) {
            this.getContext(this._myContextId).setValue(key, value);
        };
        AbstractKeybindingService.prototype.removeContext = function (key) {
            this.getContext(this._myContextId).removeValue(key);
        };
        AbstractKeybindingService.prototype.hasCommand = function (commandId) {
            return !!keybindingsRegistry_1.KeybindingsRegistry.getCommands()[commandId];
        };
        return AbstractKeybindingService;
    }());
    exports.AbstractKeybindingService = AbstractKeybindingService;
    var KeybindingService = (function (_super) {
        __extends(KeybindingService, _super);
        function KeybindingService(configurationService) {
            _super.call(this, 0);
            this._toDispose = [];
            this._lastContextId = 0;
            this._contexts = Object.create(null);
            this._contexts[String(this._myContextId)] = new KeybindingContext(this._myContextId, null);
            this._cachedResolver = null;
            this._firstTimeComputingResolver = true;
            this._currentChord = 0;
            this._currentChordStatusMessage = null;
            this._configurationContext = new ConfigurationContext(configurationService);
            this._toDispose.push(this._configurationContext);
        }
        KeybindingService.prototype._beginListening = function (domNode) {
            var _this = this;
            this._toDispose.push(dom.addDisposableListener(domNode, dom.EventType.KEY_DOWN, function (e) {
                var keyEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                _this._dispatch(keyEvent);
            }));
        };
        KeybindingService.prototype._getResolver = function () {
            if (!this._cachedResolver) {
                this._cachedResolver = new keybindingResolver_1.KeybindingResolver(keybindingsRegistry_1.KeybindingsRegistry.getDefaultKeybindings(), this._getExtraKeybindings(this._firstTimeComputingResolver));
                this._firstTimeComputingResolver = false;
            }
            return this._cachedResolver;
        };
        KeybindingService.prototype.dispose = function () {
            this._toDispose = lifecycle_1.dispose(this._toDispose);
        };
        KeybindingService.prototype.getLabelFor = function (keybinding) {
            return keybinding._toUSLabel();
        };
        KeybindingService.prototype.getHTMLLabelFor = function (keybinding) {
            return keybinding._toUSHTMLLabel();
        };
        KeybindingService.prototype.getAriaLabelFor = function (keybinding) {
            return keybinding._toUSAriaLabel();
        };
        KeybindingService.prototype.getElectronAcceleratorFor = function (keybinding) {
            return keybinding._toElectronAccelerator();
        };
        KeybindingService.prototype.updateResolver = function () {
            this._cachedResolver = null;
        };
        KeybindingService.prototype._getExtraKeybindings = function (isFirstTime) {
            return [];
        };
        KeybindingService.prototype.getDefaultKeybindings = function () {
            return this._getResolver().getDefaultKeybindings() + '\n\n' + this._getAllCommandsAsComment();
        };
        KeybindingService.prototype.customKeybindingsCount = function () {
            return 0;
        };
        KeybindingService.prototype.lookupKeybindings = function (commandId) {
            return this._getResolver().lookupKeybinding(commandId);
        };
        KeybindingService.prototype._getAllCommandsAsComment = function () {
            var commands = keybindingsRegistry_1.KeybindingsRegistry.getCommands();
            var unboundCommands = [];
            var boundCommands = this._getResolver().getDefaultBoundCommands();
            for (var id in commands) {
                if (id[0] === '_' || id.indexOf('vscode.') === 0) {
                    continue;
                }
                if (typeof commands[id].description === 'object'
                    && !arrays_1.isFalsyOrEmpty(commands[id].description.args)) {
                    continue;
                }
                if (boundCommands[id]) {
                    continue;
                }
                unboundCommands.push(id);
            }
            var pretty = unboundCommands.sort().join('\n// - ');
            return '// ' + nls.localize('unboundCommands', "Here are other available commands: ") + '\n// - ' + pretty;
        };
        KeybindingService.prototype._getCommandHandler = function (commandId) {
            return keybindingsRegistry_1.KeybindingsRegistry.getCommands()[commandId];
        };
        KeybindingService.prototype._dispatch = function (e) {
            var _this = this;
            var isModifierKey = (e.keyCode === keyCodes_1.KeyCode.Ctrl || e.keyCode === keyCodes_1.KeyCode.Shift || e.keyCode === keyCodes_1.KeyCode.Alt || e.keyCode === keyCodes_1.KeyCode.Meta);
            if (isModifierKey) {
                return;
            }
            var contextValue = Object.create(null);
            this.getContext(this._findContextAttr(e.target)).fillInContext(contextValue);
            this._configurationContext.fillInContext(contextValue);
            // console.log(JSON.stringify(contextValue, null, '\t'));
            var resolveResult = this._getResolver().resolve(contextValue, this._currentChord, e.asKeybinding());
            if (resolveResult && resolveResult.enterChord) {
                e.preventDefault();
                this._currentChord = resolveResult.enterChord;
                if (this._messageService) {
                    var firstPartLabel = this.getLabelFor(new keyCodes_1.Keybinding(this._currentChord));
                    this._currentChordStatusMessage = this._messageService.setStatusMessage(nls.localize('first.chord', "({0}) was pressed. Waiting for second key of chord...", firstPartLabel));
                }
                return;
            }
            if (this._messageService && this._currentChord) {
                if (!resolveResult || !resolveResult.commandId) {
                    var firstPartLabel = this.getLabelFor(new keyCodes_1.Keybinding(this._currentChord));
                    var chordPartLabel = this.getLabelFor(new keyCodes_1.Keybinding(e.asKeybinding()));
                    this._messageService.setStatusMessage(nls.localize('missing.chord', "The key combination ({0}, {1}) is not a command.", firstPartLabel, chordPartLabel), 10 * 1000 /* 10s */);
                    e.preventDefault();
                }
            }
            if (this._currentChordStatusMessage) {
                this._currentChordStatusMessage.dispose();
                this._currentChordStatusMessage = null;
            }
            this._currentChord = 0;
            if (resolveResult && resolveResult.commandId) {
                if (!/^\^/.test(resolveResult.commandId)) {
                    e.preventDefault();
                }
                var commandId = resolveResult.commandId.replace(/^\^/, '');
                this._invokeHandler(commandId, { context: contextValue }).done(undefined, function (err) {
                    _this._messageService.show(severity_1.default.Warning, err);
                });
            }
        };
        KeybindingService.prototype._invokeHandler = function (commandId, args) {
            var handler = this._getCommandHandler(commandId);
            if (!handler) {
                return winjs_base_1.TPromise.wrapError(new Error("No handler found for the command: '" + commandId + "'. An extension might be missing an activation event."));
            }
            try {
                var result = this._instantiationService.invokeFunction(handler, args);
                return winjs_base_1.TPromise.as(result);
            }
            catch (err) {
                return winjs_base_1.TPromise.wrapError(err);
            }
        };
        KeybindingService.prototype._findContextAttr = function (domNode) {
            while (domNode) {
                if (domNode.hasAttribute(KEYBINDING_CONTEXT_ATTR)) {
                    return parseInt(domNode.getAttribute(KEYBINDING_CONTEXT_ATTR), 10);
                }
                domNode = domNode.parentElement;
            }
            return this._myContextId;
        };
        KeybindingService.prototype.getContext = function (contextId) {
            return this._contexts[String(contextId)];
        };
        KeybindingService.prototype.createChildContext = function (parentContextId) {
            if (parentContextId === void 0) { parentContextId = this._myContextId; }
            var id = (++this._lastContextId);
            this._contexts[String(id)] = new KeybindingContext(id, this.getContext(parentContextId));
            return id;
        };
        KeybindingService.prototype.disposeContext = function (contextId) {
            delete this._contexts[String(contextId)];
        };
        KeybindingService.prototype.executeCommand = function (commandId, args) {
            if (args === void 0) { args = {}; }
            // TODO@{Alex,Joh} we should spec what args should be. adding extra
            // props on a string will throw errors
            if ((Array.isArray(args) || typeof args === 'object')
                && !args.context) {
                args.context = Object.create(null);
                this.getContext(this._findContextAttr(document.activeElement)).fillInContext(args.context);
                this._configurationContext.fillInContext(args.context);
            }
            if (commandId === keybindingService_1.SET_CONTEXT_COMMAND_ID) {
                var contextKey = String(args[0]);
                var contextValue = args[1];
                this.setContext(contextKey, contextValue);
                return winjs_base_1.TPromise.as(null);
            }
            return this._invokeHandler(commandId, args);
        };
        return KeybindingService;
    }(AbstractKeybindingService));
    exports.KeybindingService = KeybindingService;
    var ScopedKeybindingService = (function (_super) {
        __extends(ScopedKeybindingService, _super);
        function ScopedKeybindingService(parent, domNode) {
            _super.call(this, parent.createChildContext());
            this._parent = parent;
            this._domNode = domNode;
            this._domNode.setAttribute(KEYBINDING_CONTEXT_ATTR, String(this._myContextId));
        }
        ScopedKeybindingService.prototype.dispose = function () {
            this._parent.disposeContext(this._myContextId);
            this._domNode.removeAttribute(KEYBINDING_CONTEXT_ATTR);
        };
        ScopedKeybindingService.prototype.getLabelFor = function (keybinding) {
            return this._parent.getLabelFor(keybinding);
        };
        ScopedKeybindingService.prototype.getHTMLLabelFor = function (keybinding) {
            return this._parent.getHTMLLabelFor(keybinding);
        };
        ScopedKeybindingService.prototype.getAriaLabelFor = function (keybinding) {
            return this._parent.getAriaLabelFor(keybinding);
        };
        ScopedKeybindingService.prototype.getElectronAcceleratorFor = function (keybinding) {
            return this._parent.getElectronAcceleratorFor(keybinding);
        };
        ScopedKeybindingService.prototype.getDefaultKeybindings = function () {
            return this._parent.getDefaultKeybindings();
        };
        ScopedKeybindingService.prototype.customKeybindingsCount = function () {
            return this._parent.customKeybindingsCount();
        };
        ScopedKeybindingService.prototype.lookupKeybindings = function (commandId) {
            return this._parent.lookupKeybindings(commandId);
        };
        ScopedKeybindingService.prototype.getContext = function (contextId) {
            return this._parent.getContext(contextId);
        };
        ScopedKeybindingService.prototype.createChildContext = function (parentContextId) {
            if (parentContextId === void 0) { parentContextId = this._myContextId; }
            return this._parent.createChildContext(parentContextId);
        };
        ScopedKeybindingService.prototype.disposeContext = function (contextId) {
            this._parent.disposeContext(contextId);
        };
        ScopedKeybindingService.prototype.executeCommand = function (commandId, args) {
            return this._parent.executeCommand(commandId, args);
        };
        return ScopedKeybindingService;
    }(AbstractKeybindingService));
});
