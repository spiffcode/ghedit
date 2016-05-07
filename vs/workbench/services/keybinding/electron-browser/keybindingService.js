var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls!vs/workbench/services/keybinding/electron-browser/keybindingService', 'vs/base/common/platform', 'vs/base/common/winjs.base', 'vs/platform/extensions/common/extensionsRegistry', 'vs/platform/jsonschemas/common/jsonContributionRegistry', 'vs/platform/keybinding/browser/keybindingServiceImpl', 'vs/platform/keybinding/common/keybindingResolver', 'vs/platform/keybinding/common/keybindingsRegistry', 'vs/platform/platform', 'vs/workbench/common/events', 'vs/workbench/services/keybinding/electron-browser/nativeKeymap'], function (require, exports, nls, platform, winjs_base_1, extensionsRegistry_1, jsonContributionRegistry_1, keybindingServiceImpl_1, keybindingResolver_1, keybindingsRegistry_1, platform_1, events_1, nativeKeymap_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function isContributedKeyBindingsArray(thing) {
        return Array.isArray(thing);
    }
    function isValidContributedKeyBinding(keyBinding, rejects) {
        if (!keyBinding) {
            rejects.push(nls.localize(0, null));
            return false;
        }
        if (typeof keyBinding.command !== 'string') {
            rejects.push(nls.localize(1, null, 'command'));
            return false;
        }
        if (typeof keyBinding.key !== 'string') {
            rejects.push(nls.localize(2, null, 'key'));
            return false;
        }
        if (keyBinding.when && typeof keyBinding.when !== 'string') {
            rejects.push(nls.localize(3, null, 'when'));
            return false;
        }
        if (keyBinding.mac && typeof keyBinding.mac !== 'string') {
            rejects.push(nls.localize(4, null, 'mac'));
            return false;
        }
        if (keyBinding.linux && typeof keyBinding.linux !== 'string') {
            rejects.push(nls.localize(5, null, 'linux'));
            return false;
        }
        if (keyBinding.win && typeof keyBinding.win !== 'string') {
            rejects.push(nls.localize(6, null, 'win'));
            return false;
        }
        return true;
    }
    var keybindingType = {
        type: 'object',
        default: { command: '', key: '' },
        properties: {
            command: {
                description: nls.localize(7, null),
                type: 'string'
            },
            key: {
                description: nls.localize(8, null),
                type: 'string'
            },
            mac: {
                description: nls.localize(9, null),
                type: 'string'
            },
            linux: {
                description: nls.localize(10, null),
                type: 'string'
            },
            win: {
                description: nls.localize(11, null),
                type: 'string'
            },
            when: {
                description: nls.localize(12, null),
                type: 'string'
            }
        }
    };
    var keybindingsExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint('keybindings', {
        description: nls.localize(13, null),
        oneOf: [
            keybindingType,
            {
                type: 'array',
                items: keybindingType
            }
        ]
    });
    var WorkbenchKeybindingService = (function (_super) {
        __extends(WorkbenchKeybindingService, _super);
        function WorkbenchKeybindingService(configurationService, contextService, eventService, telemetryService, domNode) {
            var _this = this;
            _super.call(this, configurationService);
            this.contextService = contextService;
            this.eventService = eventService;
            this.telemetryService = telemetryService;
            this.toDispose = this.eventService.addListener(events_1.EventType.WORKBENCH_OPTIONS_CHANGED, function (e) { return _this.onOptionsChanged(e); });
            this._eventService = eventService;
            keybindingsExtPoint.setHandler(function (extensions) {
                var commandAdded = false;
                for (var _i = 0, extensions_1 = extensions; _i < extensions_1.length; _i++) {
                    var extension = extensions_1[_i];
                    commandAdded = _this._handleKeybindingsExtensionPointUser(extension.description.isBuiltin, extension.value, extension.collector) || commandAdded;
                }
                if (commandAdded) {
                    _this.updateResolver();
                }
            });
            this._beginListening(domNode);
        }
        WorkbenchKeybindingService.prototype.setExtensionService = function (extensionService) {
            this._extensionService = extensionService;
        };
        WorkbenchKeybindingService.prototype.customKeybindingsCount = function () {
            var opts = this.contextService.getOptions();
            if (opts.globalSettings && opts.globalSettings.keybindings && Array.isArray(opts.globalSettings.keybindings)) {
                return opts.globalSettings.keybindings.length;
            }
            return 0;
        };
        WorkbenchKeybindingService.prototype._getExtraKeybindings = function (isFirstTime) {
            var extras = [];
            var opts = this.contextService.getOptions();
            if (opts.globalSettings && opts.globalSettings.keybindings) {
                if (!isFirstTime) {
                    var cnt = 0;
                    if (Array.isArray(opts.globalSettings.keybindings)) {
                        cnt = opts.globalSettings.keybindings.length;
                    }
                    this.telemetryService.publicLog('customKeybindingsChanged', {
                        keyCount: cnt
                    });
                }
                if (Array.isArray(opts.globalSettings.keybindings)) {
                    extras = opts.globalSettings.keybindings;
                }
            }
            return extras.map(function (k, i) { return keybindingResolver_1.IOSupport.readKeybindingItem(k, i); });
        };
        WorkbenchKeybindingService.prototype.onOptionsChanged = function (e) {
            if (e.key === 'globalSettings') {
                this.updateResolver();
            }
        };
        WorkbenchKeybindingService.prototype.dispose = function () {
            this.toDispose();
        };
        WorkbenchKeybindingService.prototype.getLabelFor = function (keybinding) {
            return keybinding.toCustomLabel(nativeKeymap_1.getNativeLabelProvider());
        };
        WorkbenchKeybindingService.prototype.getHTMLLabelFor = function (keybinding) {
            return keybinding.toCustomHTMLLabel(nativeKeymap_1.getNativeLabelProvider());
        };
        WorkbenchKeybindingService.prototype.getAriaLabelFor = function (keybinding) {
            return keybinding.toCustomLabel(nativeKeymap_1.getNativeAriaLabelProvider());
        };
        WorkbenchKeybindingService.prototype.getElectronAcceleratorFor = function (keybinding) {
            if (platform.isWindows) {
                // electron menus always do the correct rendering on Windows
                return _super.prototype.getElectronAcceleratorFor.call(this, keybinding);
            }
            var usLabel = keybinding._toUSLabel();
            var label = this.getLabelFor(keybinding);
            if (usLabel !== label) {
                // electron menus are incorrect in rendering (linux) and in rendering and interpreting (mac)
                // for non US standard keyboard layouts
                return null;
            }
            return _super.prototype.getElectronAcceleratorFor.call(this, keybinding);
        };
        WorkbenchKeybindingService.prototype._handleKeybindingsExtensionPointUser = function (isBuiltin, keybindings, collector) {
            if (isContributedKeyBindingsArray(keybindings)) {
                var commandAdded = false;
                for (var i = 0, len = keybindings.length; i < len; i++) {
                    commandAdded = this._handleKeybinding(isBuiltin, i + 1, keybindings[i], collector) || commandAdded;
                }
                return commandAdded;
            }
            else {
                return this._handleKeybinding(isBuiltin, 1, keybindings, collector);
            }
        };
        WorkbenchKeybindingService.prototype._handleKeybinding = function (isBuiltin, idx, keybindings, collector) {
            var rejects = [];
            var commandAdded = false;
            if (isValidContributedKeyBinding(keybindings, rejects)) {
                var rule = this._asCommandRule(isBuiltin, idx++, keybindings);
                if (rule) {
                    keybindingsRegistry_1.KeybindingsRegistry.registerCommandRule(rule);
                    commandAdded = true;
                }
            }
            if (rejects.length > 0) {
                collector.error(nls.localize(14, null, keybindingsExtPoint.name, rejects.join('\n')));
            }
            return commandAdded;
        };
        WorkbenchKeybindingService.prototype._invokeHandler = function (commandId, args) {
            var _this = this;
            if (this._extensionService) {
                return this._extensionService.activateByEvent('onCommand:' + commandId).then(function (_) {
                    return _super.prototype._invokeHandler.call(_this, commandId, args);
                });
            }
            return winjs_base_1.TPromise.as(null);
        };
        WorkbenchKeybindingService.prototype._asCommandRule = function (isBuiltin, idx, binding) {
            var command = binding.command, when = binding.when, key = binding.key, mac = binding.mac, linux = binding.linux, win = binding.win;
            var weight;
            if (isBuiltin) {
                weight = keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.builtinExtension(idx);
            }
            else {
                weight = keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.externalExtension(idx);
            }
            var desc = {
                id: command,
                context: keybindingResolver_1.IOSupport.readKeybindingContexts(when),
                weight: weight,
                primary: keybindingResolver_1.IOSupport.readKeybinding(key),
                mac: mac && { primary: keybindingResolver_1.IOSupport.readKeybinding(mac) },
                linux: linux && { primary: keybindingResolver_1.IOSupport.readKeybinding(linux) },
                win: win && { primary: keybindingResolver_1.IOSupport.readKeybinding(win) }
            };
            if (!desc.primary && !desc.mac && !desc.linux && !desc.win) {
                return;
            }
            return desc;
        };
        return WorkbenchKeybindingService;
    }(keybindingServiceImpl_1.KeybindingService));
    exports.WorkbenchKeybindingService = WorkbenchKeybindingService;
    var schemaId = 'vscode://schemas/keybindings';
    var schema = {
        'id': schemaId,
        'type': 'array',
        'title': nls.localize(15, null),
        'items': {
            'required': ['key'],
            'type': 'object',
            'defaultSnippets': [{ 'body': { 'key': '{{_}}', 'command': '{{_}}', 'when': '{{_}}' } }],
            'properties': {
                'key': {
                    'type': 'string',
                    'description': nls.localize(16, null),
                },
                'command': {
                    'description': nls.localize(17, null),
                },
                'when': {
                    'type': 'string',
                    'description': nls.localize(18, null)
                }
            }
        }
    };
    var schemaRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
    schemaRegistry.registerSchema(schemaId, schema);
    schemaRegistry.addSchemaFileAssociation('vscode://defaultsettings/keybindings.json', schemaId);
    schemaRegistry.addSchemaFileAssociation('%APP_SETTINGS_HOME%/keybindings.json', schemaId);
});
//# sourceMappingURL=keybindingService.js.map