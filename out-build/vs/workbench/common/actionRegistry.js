define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/collections', 'vs/platform/platform', 'vs/platform/keybinding/common/keybindingsRegistry', 'vs/workbench/services/part/common/partService', 'vs/platform/message/common/message', 'vs/platform/telemetry/common/telemetry', 'vs/platform/instantiation/common/instantiation', 'vs/base/common/severity'], function (require, exports, winjs_base_1, collections, platform_1, keybindingsRegistry_1, partService_1, message_1, telemetry_1, instantiation_1, severity_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    exports.Extensions = {
        WorkbenchActions: 'workbench.contributions.actions'
    };
    var WorkbenchActionRegistry = (function () {
        function WorkbenchActionRegistry() {
            this.workbenchActions = Object.create(null);
            this.mapActionIdToCategory = Object.create(null);
        }
        WorkbenchActionRegistry.prototype.registerWorkbenchAction = function (descriptor, category) {
            if (!this.workbenchActions[descriptor.id]) {
                this.workbenchActions[descriptor.id] = descriptor;
                registerWorkbenchCommandFromAction(descriptor);
                if (category) {
                    this.mapActionIdToCategory[descriptor.id] = category;
                }
            }
        };
        WorkbenchActionRegistry.prototype.unregisterWorkbenchAction = function (id) {
            if (!this.workbenchActions[id]) {
                return false;
            }
            delete this.workbenchActions[id];
            delete this.mapActionIdToCategory[id];
            return true;
        };
        WorkbenchActionRegistry.prototype.getWorkbenchAction = function (id) {
            return this.workbenchActions[id] || null;
        };
        WorkbenchActionRegistry.prototype.getCategory = function (id) {
            return this.mapActionIdToCategory[id] || null;
        };
        WorkbenchActionRegistry.prototype.getWorkbenchActions = function () {
            return collections.values(this.workbenchActions);
        };
        WorkbenchActionRegistry.prototype.setWorkbenchActions = function (actions) {
            var _this = this;
            this.workbenchActions = Object.create(null);
            this.mapActionIdToCategory = Object.create(null);
            actions.forEach(function (action) { return _this.registerWorkbenchAction(action); }, this);
        };
        return WorkbenchActionRegistry;
    }());
    platform_1.Registry.add(exports.Extensions.WorkbenchActions, new WorkbenchActionRegistry());
    function registerWorkbenchCommandFromAction(descriptor) {
        var context = descriptor.keybindingContext;
        var weight = (typeof descriptor.keybindingWeight === 'undefined' ? keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib() : descriptor.keybindingWeight);
        var keybindings = descriptor.keybindings;
        var desc = {
            id: descriptor.id,
            handler: createCommandHandler(descriptor),
            weight: weight,
            context: context,
            primary: keybindings && keybindings.primary,
            secondary: keybindings && keybindings.secondary,
            win: keybindings && keybindings.win,
            mac: keybindings && keybindings.mac,
            linux: keybindings && keybindings.linux
        };
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandDesc(desc);
    }
    function createCommandHandler(descriptor) {
        return function (accessor, args) {
            var messageService = accessor.get(message_1.IMessageService);
            var instantiationService = accessor.get(instantiation_1.IInstantiationService);
            var telemetryServce = accessor.get(telemetry_1.ITelemetryService);
            var partService = accessor.get(partService_1.IPartService);
            winjs_base_1.TPromise.as(triggerAndDisposeAction(instantiationService, telemetryServce, partService, descriptor, args)).done(null, function (err) {
                messageService.show(severity_1.default.Error, err);
            });
        };
    }
    exports.createCommandHandler = createCommandHandler;
    function triggerAndDisposeAction(instantitationService, telemetryService, partService, descriptor, args) {
        var actionInstance = instantitationService.createInstance(descriptor.syncDescriptor);
        actionInstance.label = descriptor.label || actionInstance.label;
        // don't run the action when not enabled
        if (!actionInstance.enabled) {
            actionInstance.dispose();
            return;
        }
        if (telemetryService) {
            telemetryService.publicLog('workbenchActionExecuted', { id: actionInstance.id, from: args.from || 'keybinding' });
        }
        // run action when workbench is created
        return partService.joinCreation().then(function () {
            try {
                return winjs_base_1.TPromise.as(actionInstance.run()).then(function () {
                    actionInstance.dispose();
                }, function (err) {
                    actionInstance.dispose();
                    return winjs_base_1.TPromise.wrapError(err);
                });
            }
            catch (err) {
                actionInstance.dispose();
                return winjs_base_1.TPromise.wrapError(err);
            }
        });
    }
    exports.triggerAndDisposeAction = triggerAndDisposeAction;
});
