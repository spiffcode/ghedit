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
define(["require", "exports", 'vs/nls!vs/workbench/electron-browser/integration', 'vs/base/common/winjs.base', 'vs/base/common/errors', 'vs/base/common/arrays', 'vs/base/common/severity', 'vs/base/browser/ui/actionbar/actionbar', 'vs/base/common/actions', 'vs/workbench/services/part/common/partService', 'vs/platform/message/common/message', 'vs/platform/instantiation/common/instantiation', 'vs/platform/telemetry/common/telemetry', 'vs/platform/contextview/browser/contextView', 'vs/platform/keybinding/common/keybindingService', 'vs/workbench/services/workspace/common/contextService', 'vs/workbench/services/window/electron-browser/windowService', 'vs/platform/configuration/common/configuration', 'vs/workbench/electron-browser/window', 'electron'], function (require, exports, nls, winjs_base_1, errors, arrays, severity_1, actionbar_1, actions_1, partService_1, message_1, instantiation_1, telemetry_1, contextView_1, keybindingService_1, contextService_1, windowService_1, configuration_1, win, electron_1) {
    'use strict';
    var currentWindow = electron_1.remote.getCurrentWindow();
    var TextInputActions = [
        new actions_1.Action('undo', nls.localize(0, null), null, true, function () { return document.execCommand('undo') && winjs_base_1.TPromise.as(true); }),
        new actions_1.Action('redo', nls.localize(1, null), null, true, function () { return document.execCommand('redo') && winjs_base_1.TPromise.as(true); }),
        new actionbar_1.Separator(),
        new actions_1.Action('editor.action.clipboardCutAction', nls.localize(2, null), null, true, function () { return document.execCommand('cut') && winjs_base_1.TPromise.as(true); }),
        new actions_1.Action('editor.action.clipboardCopyAction', nls.localize(3, null), null, true, function () { return document.execCommand('copy') && winjs_base_1.TPromise.as(true); }),
        new actions_1.Action('editor.action.clipboardPasteAction', nls.localize(4, null), null, true, function () { return document.execCommand('paste') && winjs_base_1.TPromise.as(true); }),
        new actionbar_1.Separator(),
        new actions_1.Action('editor.action.selectAll', nls.localize(5, null), null, true, function () { return document.execCommand('selectAll') && winjs_base_1.TPromise.as(true); })
    ];
    var ElectronIntegration = (function () {
        function ElectronIntegration(instantiationService, windowService, partService, contextService, telemetryService, configurationService, keybindingService, messageService, contextMenuService) {
            this.instantiationService = instantiationService;
            this.windowService = windowService;
            this.partService = partService;
            this.contextService = contextService;
            this.telemetryService = telemetryService;
            this.configurationService = configurationService;
            this.keybindingService = keybindingService;
            this.messageService = messageService;
            this.contextMenuService = contextMenuService;
        }
        ElectronIntegration.prototype.integrate = function (shellContainer) {
            var _this = this;
            // Register the active window
            var activeWindow = this.instantiationService.createInstance(win.ElectronWindow, currentWindow, shellContainer);
            this.windowService.registerWindow(activeWindow);
            // Support runAction event
            electron_1.ipcRenderer.on('vscode:runAction', function (event, actionId) {
                _this.keybindingService.executeCommand(actionId, { from: 'menu' }).done(undefined, function (err) { return _this.messageService.show(severity_1.default.Error, err); });
            });
            // Support options change
            electron_1.ipcRenderer.on('vscode:optionsChange', function (event, options) {
                var optionsData = JSON.parse(options);
                for (var key in optionsData) {
                    if (optionsData.hasOwnProperty(key)) {
                        var value = optionsData[key];
                        _this.contextService.updateOptions(key, value);
                    }
                }
            });
            // Support resolve keybindings event
            electron_1.ipcRenderer.on('vscode:resolveKeybindings', function (event, rawActionIds) {
                var actionIds = [];
                try {
                    actionIds = JSON.parse(rawActionIds);
                }
                catch (error) {
                }
                // Resolve keys using the keybinding service and send back to browser process
                _this.resolveKeybindings(actionIds).done(function (keybindings) {
                    if (keybindings.length) {
                        electron_1.ipcRenderer.send('vscode:keybindingsResolved', JSON.stringify(keybindings));
                    }
                }, function () { return errors.onUnexpectedError; });
            });
            electron_1.ipcRenderer.on('vscode:telemetry', function (event, _a) {
                var eventName = _a.eventName, data = _a.data;
                _this.telemetryService.publicLog(eventName, data);
            });
            electron_1.ipcRenderer.on('vscode:reportError', function (event, error) {
                if (error) {
                    var errorParsed = JSON.parse(error);
                    errorParsed.mainProcess = true;
                    errors.onUnexpectedError(errorParsed);
                }
            });
            // Emit event when vscode has loaded
            this.partService.joinCreation().then(function () {
                electron_1.ipcRenderer.send('vscode:workbenchLoaded', _this.windowService.getWindowId());
            });
            // Message support
            electron_1.ipcRenderer.on('vscode:showInfoMessage', function (event, message) {
                _this.messageService.show(severity_1.default.Info, message);
            });
            // Configuration changes
            var previousConfiguredZoomLevel;
            this.configurationService.addListener(configuration_1.ConfigurationServiceEventTypes.UPDATED, function (e) {
                var windowConfig = e.config;
                var newZoomLevel = 0;
                if (windowConfig.window && typeof windowConfig.window.zoomLevel === 'number') {
                    newZoomLevel = windowConfig.window.zoomLevel;
                    // Leave early if the configured zoom level did not change (https://github.com/Microsoft/vscode/issues/1536)
                    if (previousConfiguredZoomLevel === newZoomLevel) {
                        return;
                    }
                    previousConfiguredZoomLevel = newZoomLevel;
                }
                if (electron_1.webFrame.getZoomLevel() !== newZoomLevel) {
                    electron_1.webFrame.setZoomLevel(newZoomLevel);
                }
            });
            // Context menu support in input/textarea
            window.document.addEventListener('contextmenu', function (e) {
                if (e.target instanceof HTMLElement) {
                    var target_1 = e.target;
                    if (target_1.nodeName && (target_1.nodeName.toLowerCase() === 'input' || target_1.nodeName.toLowerCase() === 'textarea')) {
                        e.preventDefault();
                        e.stopPropagation();
                        _this.contextMenuService.showContextMenu({
                            getAnchor: function () { return target_1; },
                            getActions: function () { return winjs_base_1.TPromise.as(TextInputActions); },
                            getKeyBinding: function (action) {
                                var opts = _this.keybindingService.lookupKeybindings(action.id);
                                if (opts.length > 0) {
                                    return opts[0]; // only take the first one
                                }
                                return null;
                            }
                        });
                    }
                }
            });
        };
        ElectronIntegration.prototype.resolveKeybindings = function (actionIds) {
            var _this = this;
            return this.partService.joinCreation().then(function () {
                return arrays.coalesce(actionIds.map(function (id) {
                    var bindings = _this.keybindingService.lookupKeybindings(id);
                    // return the first binding that can be represented by electron
                    for (var i = 0; i < bindings.length; i++) {
                        var binding = bindings[i];
                        var electronAccelerator = _this.keybindingService.getElectronAcceleratorFor(binding);
                        if (electronAccelerator) {
                            return {
                                id: id,
                                binding: binding.value
                            };
                        }
                    }
                    return null;
                }));
            });
        };
        ElectronIntegration = __decorate([
            __param(0, instantiation_1.IInstantiationService),
            __param(1, windowService_1.IWindowService),
            __param(2, partService_1.IPartService),
            __param(3, contextService_1.IWorkspaceContextService),
            __param(4, telemetry_1.ITelemetryService),
            __param(5, configuration_1.IConfigurationService),
            __param(6, keybindingService_1.IKeybindingService),
            __param(7, message_1.IMessageService),
            __param(8, contextView_1.IContextMenuService)
        ], ElectronIntegration);
        return ElectronIntegration;
    }());
    exports.ElectronIntegration = ElectronIntegration;
});
//# sourceMappingURL=integration.js.map