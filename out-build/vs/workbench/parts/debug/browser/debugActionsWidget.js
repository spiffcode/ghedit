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
define(["require", "exports", 'vs/base/common/lifecycle', 'vs/base/common/errors', 'vs/base/common/severity', 'vs/base/browser/builder', 'vs/base/common/events', 'vs/base/browser/ui/actionbar/actionbar', 'vs/workbench/common/constants', 'vs/workbench/parts/debug/common/debug', 'vs/workbench/parts/debug/electron-browser/debugActions', 'vs/platform/instantiation/common/instantiation', 'vs/platform/message/common/message', 'vs/platform/telemetry/common/telemetry'], function (require, exports, lifecycle, errors, severity_1, builder, events, actionbar, constants, debug, dbgactions, instantiation_1, message_1, telemetry_1) {
    "use strict";
    var IDebugService = debug.IDebugService;
    var $ = builder.$;
    var DebugActionsWidget = (function () {
        function DebugActionsWidget(messageService, telemetryService, debugService, instantiationService) {
            this.messageService = messageService;
            this.telemetryService = telemetryService;
            this.debugService = debugService;
            this.instantiationService = instantiationService;
            this.$el = $().div().addClass('debug-actions-widget');
            this.toDispose = [];
            this.actionBar = new actionbar.ActionBar(this.$el, {
                orientation: actionbar.ActionsOrientation.HORIZONTAL
            });
            this.toDispose.push(this.actionBar);
            this.registerListeners();
            this.hide();
            this.isBuilt = false;
        }
        DebugActionsWidget.prototype.registerListeners = function () {
            var _this = this;
            this.toDispose.push(this.debugService.addListener2(debug.ServiceEvents.STATE_CHANGED, function () {
                _this.onDebugStateChange();
            }));
            this.toDispose.push(this.actionBar.actionRunner.addListener2(events.EventType.RUN, function (e) {
                // check for error
                if (e.error && !errors.isPromiseCanceledError(e.error)) {
                    _this.messageService.show(severity_1.default.Error, e.error);
                }
                // log in telemetry
                if (_this.telemetryService) {
                    _this.telemetryService.publicLog('workbenchActionExecuted', { id: e.action.id, from: 'debugActionsWidget' });
                }
            }));
        };
        DebugActionsWidget.prototype.getId = function () {
            return DebugActionsWidget.ID;
        };
        DebugActionsWidget.prototype.onDebugStateChange = function () {
            var state = this.debugService.getState();
            if (state === debug.State.Disabled || state === debug.State.Inactive || state === debug.State.Initializing) {
                return this.hide();
            }
            this.actionBar.clear();
            this.actionBar.push(this.getActions(this.instantiationService, this.debugService.getState()), { icon: true, label: false });
            this.show();
        };
        DebugActionsWidget.prototype.show = function () {
            if (this.isVisible) {
                return;
            }
            if (!this.isBuilt) {
                this.isBuilt = true;
                this.$el.build(builder.withElementById(constants.Identifiers.WORKBENCH_CONTAINER).getHTMLElement());
            }
            this.isVisible = true;
            this.$el.show();
        };
        DebugActionsWidget.prototype.hide = function () {
            this.isVisible = false;
            this.$el.hide();
        };
        DebugActionsWidget.prototype.getActions = function (instantiationService, state) {
            var _this = this;
            if (!this.actions) {
                this.continueAction = instantiationService.createInstance(dbgactions.ContinueAction, dbgactions.ContinueAction.ID, dbgactions.ContinueAction.LABEL);
                this.pauseAction = instantiationService.createInstance(dbgactions.PauseAction, dbgactions.PauseAction.ID, dbgactions.PauseAction.LABEL);
                this.actions = [
                    this.continueAction,
                    instantiationService.createInstance(dbgactions.StepOverDebugAction, dbgactions.StepOverDebugAction.ID, dbgactions.StepOverDebugAction.LABEL),
                    instantiationService.createInstance(dbgactions.StepIntoDebugAction, dbgactions.StepIntoDebugAction.ID, dbgactions.StepIntoDebugAction.LABEL),
                    instantiationService.createInstance(dbgactions.StepOutDebugAction, dbgactions.StepOutDebugAction.ID, dbgactions.StepOutDebugAction.LABEL),
                    instantiationService.createInstance(dbgactions.RestartDebugAction, dbgactions.RestartDebugAction.ID, dbgactions.RestartDebugAction.LABEL),
                    instantiationService.createInstance(dbgactions.StopDebugAction, dbgactions.StopDebugAction.ID, dbgactions.StopDebugAction.LABEL)
                ];
                this.actions.forEach(function (a) {
                    _this.toDispose.push(a);
                });
                this.toDispose.push(this.pauseAction);
            }
            this.actions[0] = state === debug.State.Running ? this.pauseAction : this.continueAction;
            return this.actions;
        };
        DebugActionsWidget.prototype.dispose = function () {
            this.toDispose = lifecycle.dispose(this.toDispose);
            if (this.$el) {
                this.$el.destroy();
                delete this.$el;
            }
        };
        DebugActionsWidget.ID = 'debug.actionsWidget';
        DebugActionsWidget = __decorate([
            __param(0, message_1.IMessageService),
            __param(1, telemetry_1.ITelemetryService),
            __param(2, IDebugService),
            __param(3, instantiation_1.IInstantiationService)
        ], DebugActionsWidget);
        return DebugActionsWidget;
    }());
    exports.DebugActionsWidget = DebugActionsWidget;
});
//# sourceMappingURL=debugActionsWidget.js.map