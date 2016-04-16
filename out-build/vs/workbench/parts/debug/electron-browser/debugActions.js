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
define(["require", "exports", 'vs/nls!vs/workbench/parts/debug/electron-browser/debugActions', 'vs/base/common/actions', 'vs/base/common/lifecycle', 'vs/base/common/winjs.base', 'vs/editor/common/core/range', 'vs/editor/common/editorAction', 'vs/editor/common/editorActionEnablement', 'vs/platform/event/common/event', 'vs/platform/keybinding/common/keybindingService', 'vs/workbench/common/events', 'vs/workbench/parts/debug/common/debug', 'vs/workbench/parts/debug/common/debugModel', 'vs/workbench/services/part/common/partService', 'vs/workbench/services/panel/common/panelService', 'vs/workbench/services/viewlet/common/viewletService', 'electron'], function (require, exports, nls, actions, lifecycle, winjs_base_1, range_1, editorAction_1, editorActionEnablement_1, event_1, keybindingService_1, events_1, debug, model, partService_1, panelService_1, viewletService_1, electron_1) {
    "use strict";
    var IDebugService = debug.IDebugService;
    var AbstractDebugAction = (function (_super) {
        __extends(AbstractDebugAction, _super);
        function AbstractDebugAction(id, label, cssClass, debugService, keybindingService) {
            var _this = this;
            _super.call(this, id, label, cssClass, false);
            this.debugService = debugService;
            this.keybindingService = keybindingService;
            this.toDispose = [];
            this.toDispose.push(this.debugService.addListener2(debug.ServiceEvents.STATE_CHANGED, function () { return _this.updateEnablement(); }));
            var keys = this.keybindingService.lookupKeybindings(id).map(function (k) { return _this.keybindingService.getLabelFor(k); });
            if (keys && keys.length) {
                this.keybinding = keys[0];
            }
            this.updateLabel(label);
            this.updateEnablement();
        }
        AbstractDebugAction.prototype.run = function (e) {
            throw new Error('implement me');
        };
        AbstractDebugAction.prototype.updateLabel = function (newLabel) {
            if (this.keybinding) {
                this.label = nls.localize(0, null, newLabel, this.keybinding);
            }
            else {
                this.label = newLabel;
            }
        };
        AbstractDebugAction.prototype.updateEnablement = function () {
            this.enabled = this.isEnabled();
        };
        AbstractDebugAction.prototype.isEnabled = function () {
            return this.debugService.getState() !== debug.State.Disabled;
        };
        AbstractDebugAction.prototype.dispose = function () {
            this.debugService = null;
            this.toDispose = lifecycle.dispose(this.toDispose);
            _super.prototype.dispose.call(this);
        };
        AbstractDebugAction = __decorate([
            __param(3, IDebugService),
            __param(4, keybindingService_1.IKeybindingService)
        ], AbstractDebugAction);
        return AbstractDebugAction;
    }(actions.Action));
    exports.AbstractDebugAction = AbstractDebugAction;
    var ConfigureAction = (function (_super) {
        __extends(ConfigureAction, _super);
        function ConfigureAction(id, label, debugService, keybindingService) {
            var _this = this;
            _super.call(this, id, label, 'debug-action configure', debugService, keybindingService);
            this.toDispose.push(debugService.addListener2(debug.ServiceEvents.CONFIGURATION_CHANGED, function (e) {
                _this.class = _this.debugService.getConfigurationName() ? 'debug-action configure' : 'debug-action configure notification';
            }));
        }
        ConfigureAction.prototype.run = function (event) {
            var sideBySide = !!(event && (event.ctrlKey || event.metaKey));
            return this.debugService.openConfigFile(sideBySide);
        };
        ConfigureAction.ID = 'workbench.action.debug.configure';
        ConfigureAction.LABEL = nls.localize(1, null, 'launch.json');
        ConfigureAction = __decorate([
            __param(2, IDebugService),
            __param(3, keybindingService_1.IKeybindingService)
        ], ConfigureAction);
        return ConfigureAction;
    }(AbstractDebugAction));
    exports.ConfigureAction = ConfigureAction;
    var SelectConfigAction = (function (_super) {
        __extends(SelectConfigAction, _super);
        function SelectConfigAction(id, label, debugService, keybindingService) {
            _super.call(this, id, label, 'debug-action select-active-config', debugService, keybindingService);
        }
        SelectConfigAction.prototype.run = function (configName) {
            return this.debugService.setConfiguration(configName);
        };
        SelectConfigAction.prototype.isEnabled = function () {
            return _super.prototype.isEnabled.call(this) && this.debugService.getState() === debug.State.Inactive;
        };
        SelectConfigAction.ID = 'workbench.debug.action.setActiveConfig';
        SelectConfigAction.LABEL = nls.localize(2, null);
        SelectConfigAction = __decorate([
            __param(2, IDebugService),
            __param(3, keybindingService_1.IKeybindingService)
        ], SelectConfigAction);
        return SelectConfigAction;
    }(AbstractDebugAction));
    exports.SelectConfigAction = SelectConfigAction;
    var StartDebugAction = (function (_super) {
        __extends(StartDebugAction, _super);
        function StartDebugAction(id, label, debugService, keybindingService) {
            _super.call(this, id, label, 'debug-action start', debugService, keybindingService);
            this.updateEnablement();
        }
        StartDebugAction.prototype.run = function () {
            return this.debugService.createSession(false);
        };
        StartDebugAction.prototype.isEnabled = function () {
            return _super.prototype.isEnabled.call(this) && this.debugService.getState() === debug.State.Inactive;
        };
        StartDebugAction.ID = 'workbench.action.debug.start';
        StartDebugAction.LABEL = nls.localize(3, null);
        StartDebugAction = __decorate([
            __param(2, IDebugService),
            __param(3, keybindingService_1.IKeybindingService)
        ], StartDebugAction);
        return StartDebugAction;
    }(AbstractDebugAction));
    exports.StartDebugAction = StartDebugAction;
    var RestartDebugAction = (function (_super) {
        __extends(RestartDebugAction, _super);
        function RestartDebugAction(id, label, debugService, keybindingService) {
            var _this = this;
            _super.call(this, id, label, 'debug-action restart', debugService, keybindingService);
            this.updateEnablement();
            this.toDispose.push(this.debugService.addListener2(debug.ServiceEvents.STATE_CHANGED, function () {
                var session = _this.debugService.getActiveSession();
                if (session) {
                    _this.updateLabel(session.isAttach ? RestartDebugAction.RECONNECT_LABEL : RestartDebugAction.LABEL);
                }
            }));
        }
        RestartDebugAction.prototype.run = function () {
            return this.debugService.restartSession();
        };
        RestartDebugAction.prototype.isEnabled = function () {
            return _super.prototype.isEnabled.call(this) && this.debugService.getState() !== debug.State.Inactive;
        };
        RestartDebugAction.ID = 'workbench.action.debug.restart';
        RestartDebugAction.LABEL = nls.localize(4, null);
        RestartDebugAction.RECONNECT_LABEL = nls.localize(5, null);
        RestartDebugAction = __decorate([
            __param(2, IDebugService),
            __param(3, keybindingService_1.IKeybindingService)
        ], RestartDebugAction);
        return RestartDebugAction;
    }(AbstractDebugAction));
    exports.RestartDebugAction = RestartDebugAction;
    var StepOverDebugAction = (function (_super) {
        __extends(StepOverDebugAction, _super);
        function StepOverDebugAction(id, label, debugService, keybindingService) {
            _super.call(this, id, label, 'debug-action step-over', debugService, keybindingService);
        }
        StepOverDebugAction.prototype.run = function () {
            return this.debugService.getActiveSession().next({ threadId: this.debugService.getViewModel().getFocusedThreadId() });
        };
        StepOverDebugAction.prototype.isEnabled = function () {
            return _super.prototype.isEnabled.call(this) && this.debugService.getState() === debug.State.Stopped;
        };
        StepOverDebugAction.ID = 'workbench.action.debug.stepOver';
        StepOverDebugAction.LABEL = nls.localize(6, null);
        StepOverDebugAction = __decorate([
            __param(2, IDebugService),
            __param(3, keybindingService_1.IKeybindingService)
        ], StepOverDebugAction);
        return StepOverDebugAction;
    }(AbstractDebugAction));
    exports.StepOverDebugAction = StepOverDebugAction;
    var StepIntoDebugAction = (function (_super) {
        __extends(StepIntoDebugAction, _super);
        function StepIntoDebugAction(id, label, debugService, keybindingService) {
            _super.call(this, id, label, 'debug-action step-into', debugService, keybindingService);
        }
        StepIntoDebugAction.prototype.run = function () {
            return this.debugService.getActiveSession().stepIn({ threadId: this.debugService.getViewModel().getFocusedThreadId() });
        };
        StepIntoDebugAction.prototype.isEnabled = function () {
            return _super.prototype.isEnabled.call(this) && this.debugService.getState() === debug.State.Stopped;
        };
        StepIntoDebugAction.ID = 'workbench.action.debug.stepInto';
        StepIntoDebugAction.LABEL = nls.localize(7, null);
        StepIntoDebugAction = __decorate([
            __param(2, IDebugService),
            __param(3, keybindingService_1.IKeybindingService)
        ], StepIntoDebugAction);
        return StepIntoDebugAction;
    }(AbstractDebugAction));
    exports.StepIntoDebugAction = StepIntoDebugAction;
    var StepOutDebugAction = (function (_super) {
        __extends(StepOutDebugAction, _super);
        function StepOutDebugAction(id, label, debugService, keybindingService) {
            _super.call(this, id, label, 'debug-action step-out', debugService, keybindingService);
        }
        StepOutDebugAction.prototype.run = function () {
            return this.debugService.getActiveSession().stepOut({ threadId: this.debugService.getViewModel().getFocusedThreadId() });
        };
        StepOutDebugAction.prototype.isEnabled = function () {
            return _super.prototype.isEnabled.call(this) && this.debugService.getState() === debug.State.Stopped;
        };
        StepOutDebugAction.ID = 'workbench.action.debug.stepOut';
        StepOutDebugAction.LABEL = nls.localize(8, null);
        StepOutDebugAction = __decorate([
            __param(2, IDebugService),
            __param(3, keybindingService_1.IKeybindingService)
        ], StepOutDebugAction);
        return StepOutDebugAction;
    }(AbstractDebugAction));
    exports.StepOutDebugAction = StepOutDebugAction;
    var StopDebugAction = (function (_super) {
        __extends(StopDebugAction, _super);
        function StopDebugAction(id, label, debugService, keybindingService) {
            var _this = this;
            _super.call(this, id, label, 'debug-action stop', debugService, keybindingService);
            this.toDispose.push(this.debugService.addListener2(debug.ServiceEvents.STATE_CHANGED, function () {
                var session = _this.debugService.getActiveSession();
                if (session) {
                    _this.updateLabel(session.isAttach ? StopDebugAction.DISCONNECT_LABEL : StopDebugAction.LABEL);
                }
            }));
        }
        StopDebugAction.prototype.run = function () {
            var session = this.debugService.getActiveSession();
            return session ? session.disconnect(false, true) : winjs_base_1.TPromise.as(null);
        };
        StopDebugAction.prototype.isEnabled = function () {
            return _super.prototype.isEnabled.call(this) && this.debugService.getState() !== debug.State.Inactive;
        };
        StopDebugAction.ID = 'workbench.action.debug.stop';
        StopDebugAction.LABEL = nls.localize(9, null);
        StopDebugAction.DISCONNECT_LABEL = nls.localize(10, null);
        StopDebugAction = __decorate([
            __param(2, IDebugService),
            __param(3, keybindingService_1.IKeybindingService)
        ], StopDebugAction);
        return StopDebugAction;
    }(AbstractDebugAction));
    exports.StopDebugAction = StopDebugAction;
    var ContinueAction = (function (_super) {
        __extends(ContinueAction, _super);
        function ContinueAction(id, label, debugService, keybindingService) {
            _super.call(this, id, label, 'debug-action continue', debugService, keybindingService);
        }
        ContinueAction.prototype.run = function () {
            return this.debugService.getActiveSession().continue({ threadId: this.debugService.getViewModel().getFocusedThreadId() });
        };
        ContinueAction.prototype.isEnabled = function () {
            return _super.prototype.isEnabled.call(this) && this.debugService.getState() === debug.State.Stopped;
        };
        ContinueAction.ID = 'workbench.action.debug.continue';
        ContinueAction.LABEL = nls.localize(11, null);
        ContinueAction = __decorate([
            __param(2, IDebugService),
            __param(3, keybindingService_1.IKeybindingService)
        ], ContinueAction);
        return ContinueAction;
    }(AbstractDebugAction));
    exports.ContinueAction = ContinueAction;
    var PauseAction = (function (_super) {
        __extends(PauseAction, _super);
        function PauseAction(id, label, debugService, keybindingService) {
            _super.call(this, id, label, 'debug-action pause', debugService, keybindingService);
        }
        PauseAction.prototype.run = function () {
            return this.debugService.getActiveSession().pause({ threadId: this.debugService.getViewModel().getFocusedThreadId() });
        };
        PauseAction.prototype.isEnabled = function () {
            return _super.prototype.isEnabled.call(this) && this.debugService.getState() === debug.State.Running;
        };
        PauseAction.ID = 'workbench.action.debug.pause';
        PauseAction.LABEL = nls.localize(12, null);
        PauseAction = __decorate([
            __param(2, IDebugService),
            __param(3, keybindingService_1.IKeybindingService)
        ], PauseAction);
        return PauseAction;
    }(AbstractDebugAction));
    exports.PauseAction = PauseAction;
    var RemoveBreakpointAction = (function (_super) {
        __extends(RemoveBreakpointAction, _super);
        function RemoveBreakpointAction(id, label, debugService, keybindingService) {
            _super.call(this, id, label, 'debug-action remove', debugService, keybindingService);
            this.updateEnablement();
        }
        RemoveBreakpointAction.prototype.run = function (breakpoint) {
            return breakpoint instanceof model.Breakpoint ? this.debugService.toggleBreakpoint({ uri: breakpoint.source.uri, lineNumber: breakpoint.lineNumber })
                : this.debugService.removeFunctionBreakpoints(breakpoint.getId());
        };
        RemoveBreakpointAction.ID = 'workbench.debug.viewlet.action.removeBreakpoint';
        RemoveBreakpointAction.LABEL = nls.localize(13, null);
        RemoveBreakpointAction = __decorate([
            __param(2, IDebugService),
            __param(3, keybindingService_1.IKeybindingService)
        ], RemoveBreakpointAction);
        return RemoveBreakpointAction;
    }(AbstractDebugAction));
    exports.RemoveBreakpointAction = RemoveBreakpointAction;
    var RemoveAllBreakpointsAction = (function (_super) {
        __extends(RemoveAllBreakpointsAction, _super);
        function RemoveAllBreakpointsAction(id, label, debugService, keybindingService) {
            var _this = this;
            _super.call(this, id, label, 'debug-action remove-all', debugService, keybindingService);
            this.toDispose.push(this.debugService.getModel().addListener2(debug.ModelEvents.BREAKPOINTS_UPDATED, function () { return _this.updateEnablement(); }));
        }
        RemoveAllBreakpointsAction.prototype.run = function () {
            return winjs_base_1.TPromise.join([this.debugService.removeAllBreakpoints(), this.debugService.removeFunctionBreakpoints()]);
        };
        RemoveAllBreakpointsAction.prototype.isEnabled = function () {
            return _super.prototype.isEnabled.call(this) && (this.debugService.getModel().getBreakpoints().length > 0 || this.debugService.getModel().getFunctionBreakpoints().length > 0);
        };
        RemoveAllBreakpointsAction.ID = 'workbench.debug.viewlet.action.removeAllBreakpoints';
        RemoveAllBreakpointsAction.LABEL = nls.localize(14, null);
        RemoveAllBreakpointsAction = __decorate([
            __param(2, IDebugService),
            __param(3, keybindingService_1.IKeybindingService)
        ], RemoveAllBreakpointsAction);
        return RemoveAllBreakpointsAction;
    }(AbstractDebugAction));
    exports.RemoveAllBreakpointsAction = RemoveAllBreakpointsAction;
    var ToggleEnablementAction = (function (_super) {
        __extends(ToggleEnablementAction, _super);
        function ToggleEnablementAction(id, label, debugService, keybindingService) {
            _super.call(this, id, label, 'debug-action toggle-enablement', debugService, keybindingService);
        }
        ToggleEnablementAction.prototype.run = function (element) {
            return this.debugService.toggleEnablement(element);
        };
        ToggleEnablementAction.ID = 'workbench.debug.viewlet.action.toggleBreakpointEnablement';
        ToggleEnablementAction.LABEL = nls.localize(15, null);
        ToggleEnablementAction = __decorate([
            __param(2, IDebugService),
            __param(3, keybindingService_1.IKeybindingService)
        ], ToggleEnablementAction);
        return ToggleEnablementAction;
    }(AbstractDebugAction));
    exports.ToggleEnablementAction = ToggleEnablementAction;
    var EnableAllBreakpointsAction = (function (_super) {
        __extends(EnableAllBreakpointsAction, _super);
        function EnableAllBreakpointsAction(id, label, debugService, keybindingService) {
            var _this = this;
            _super.call(this, id, label, 'debug-action enable-all-breakpoints', debugService, keybindingService);
            this.toDispose.push(this.debugService.getModel().addListener2(debug.ModelEvents.BREAKPOINTS_UPDATED, function () { return _this.updateEnablement(); }));
        }
        EnableAllBreakpointsAction.prototype.run = function () {
            return this.debugService.enableOrDisableAllBreakpoints(true);
        };
        EnableAllBreakpointsAction.prototype.isEnabled = function () {
            var model = this.debugService.getModel();
            return _super.prototype.isEnabled.call(this) && model.getBreakpoints().concat(model.getFunctionBreakpoints()).concat(model.getExceptionBreakpoints()).some(function (bp) { return !bp.enabled; });
        };
        EnableAllBreakpointsAction.ID = 'workbench.debug.viewlet.action.enableAllBreakpoints';
        EnableAllBreakpointsAction.LABEL = nls.localize(16, null);
        EnableAllBreakpointsAction = __decorate([
            __param(2, IDebugService),
            __param(3, keybindingService_1.IKeybindingService)
        ], EnableAllBreakpointsAction);
        return EnableAllBreakpointsAction;
    }(AbstractDebugAction));
    exports.EnableAllBreakpointsAction = EnableAllBreakpointsAction;
    var DisableAllBreakpointsAction = (function (_super) {
        __extends(DisableAllBreakpointsAction, _super);
        function DisableAllBreakpointsAction(id, label, debugService, keybindingService) {
            var _this = this;
            _super.call(this, id, label, 'debug-action disable-all-breakpoints', debugService, keybindingService);
            this.toDispose.push(this.debugService.getModel().addListener2(debug.ModelEvents.BREAKPOINTS_UPDATED, function () { return _this.updateEnablement(); }));
        }
        DisableAllBreakpointsAction.prototype.run = function () {
            return this.debugService.enableOrDisableAllBreakpoints(false);
        };
        DisableAllBreakpointsAction.prototype.isEnabled = function () {
            var model = this.debugService.getModel();
            return _super.prototype.isEnabled.call(this) && model.getBreakpoints().concat(model.getFunctionBreakpoints()).concat(model.getExceptionBreakpoints()).some(function (bp) { return bp.enabled; });
        };
        DisableAllBreakpointsAction.ID = 'workbench.debug.viewlet.action.disableAllBreakpoints';
        DisableAllBreakpointsAction.LABEL = nls.localize(17, null);
        DisableAllBreakpointsAction = __decorate([
            __param(2, IDebugService),
            __param(3, keybindingService_1.IKeybindingService)
        ], DisableAllBreakpointsAction);
        return DisableAllBreakpointsAction;
    }(AbstractDebugAction));
    exports.DisableAllBreakpointsAction = DisableAllBreakpointsAction;
    var ToggleBreakpointsActivatedAction = (function (_super) {
        __extends(ToggleBreakpointsActivatedAction, _super);
        function ToggleBreakpointsActivatedAction(id, label, debugService, keybindingService) {
            var _this = this;
            _super.call(this, id, label, 'debug-action breakpoints-activate', debugService, keybindingService);
            this.updateLabel(this.debugService.getModel().areBreakpointsActivated() ? ToggleBreakpointsActivatedAction.DEACTIVATE_LABEL : ToggleBreakpointsActivatedAction.ACTIVATE_LABEL);
            this.toDispose.push(this.debugService.getModel().addListener2(debug.ModelEvents.BREAKPOINTS_UPDATED, function () {
                _this.updateLabel(_this.debugService.getModel().areBreakpointsActivated() ? ToggleBreakpointsActivatedAction.DEACTIVATE_LABEL : ToggleBreakpointsActivatedAction.ACTIVATE_LABEL);
                _this.updateEnablement();
            }));
        }
        ToggleBreakpointsActivatedAction.prototype.run = function () {
            return this.debugService.toggleBreakpointsActivated();
        };
        ToggleBreakpointsActivatedAction.prototype.isEnabled = function () {
            return (this.debugService.getModel().getFunctionBreakpoints().length + this.debugService.getModel().getBreakpoints().length) > 0;
        };
        ToggleBreakpointsActivatedAction.ID = 'workbench.debug.viewlet.action.toggleBreakpointsActivatedAction';
        ToggleBreakpointsActivatedAction.ACTIVATE_LABEL = nls.localize(18, null);
        ToggleBreakpointsActivatedAction.DEACTIVATE_LABEL = nls.localize(19, null);
        ToggleBreakpointsActivatedAction = __decorate([
            __param(2, IDebugService),
            __param(3, keybindingService_1.IKeybindingService)
        ], ToggleBreakpointsActivatedAction);
        return ToggleBreakpointsActivatedAction;
    }(AbstractDebugAction));
    exports.ToggleBreakpointsActivatedAction = ToggleBreakpointsActivatedAction;
    var ReapplyBreakpointsAction = (function (_super) {
        __extends(ReapplyBreakpointsAction, _super);
        function ReapplyBreakpointsAction(id, label, debugService, keybindingService) {
            var _this = this;
            _super.call(this, id, label, null, debugService, keybindingService);
            this.toDispose.push(this.debugService.getModel().addListener2(debug.ModelEvents.BREAKPOINTS_UPDATED, function () { return _this.updateEnablement(); }));
        }
        ReapplyBreakpointsAction.prototype.run = function () {
            return this.debugService.sendAllBreakpoints();
        };
        ReapplyBreakpointsAction.prototype.isEnabled = function () {
            return _super.prototype.isEnabled.call(this) && this.debugService.getState() !== debug.State.Disabled && this.debugService.getState() !== debug.State.Inactive &&
                ((this.debugService.getModel().getFunctionBreakpoints().length + this.debugService.getModel().getBreakpoints().length) > 0);
        };
        ReapplyBreakpointsAction.ID = 'workbench.debug.viewlet.action.reapplyBreakpointsAction';
        ReapplyBreakpointsAction.LABEL = nls.localize(20, null);
        ReapplyBreakpointsAction = __decorate([
            __param(2, IDebugService),
            __param(3, keybindingService_1.IKeybindingService)
        ], ReapplyBreakpointsAction);
        return ReapplyBreakpointsAction;
    }(AbstractDebugAction));
    exports.ReapplyBreakpointsAction = ReapplyBreakpointsAction;
    var AddFunctionBreakpointAction = (function (_super) {
        __extends(AddFunctionBreakpointAction, _super);
        function AddFunctionBreakpointAction(id, label, debugService, keybindingService) {
            _super.call(this, id, label, 'debug-action add-function-breakpoint', debugService, keybindingService);
        }
        AddFunctionBreakpointAction.prototype.run = function () {
            this.debugService.addFunctionBreakpoint();
            return winjs_base_1.TPromise.as(null);
        };
        AddFunctionBreakpointAction.ID = 'workbench.debug.viewlet.action.addFunctionBreakpointAction';
        AddFunctionBreakpointAction.LABEL = nls.localize(21, null);
        AddFunctionBreakpointAction = __decorate([
            __param(2, IDebugService),
            __param(3, keybindingService_1.IKeybindingService)
        ], AddFunctionBreakpointAction);
        return AddFunctionBreakpointAction;
    }(AbstractDebugAction));
    exports.AddFunctionBreakpointAction = AddFunctionBreakpointAction;
    var RenameFunctionBreakpointAction = (function (_super) {
        __extends(RenameFunctionBreakpointAction, _super);
        function RenameFunctionBreakpointAction(id, label, debugService, keybindingService) {
            _super.call(this, id, label, null, debugService, keybindingService);
        }
        RenameFunctionBreakpointAction.prototype.run = function (fbp) {
            this.debugService.getViewModel().setSelectedFunctionBreakpoint(fbp);
            return winjs_base_1.TPromise.as(null);
        };
        RenameFunctionBreakpointAction.ID = 'workbench.debug.viewlet.action.renameFunctionBreakpointAction';
        RenameFunctionBreakpointAction.LABEL = nls.localize(22, null);
        RenameFunctionBreakpointAction = __decorate([
            __param(2, IDebugService),
            __param(3, keybindingService_1.IKeybindingService)
        ], RenameFunctionBreakpointAction);
        return RenameFunctionBreakpointAction;
    }(AbstractDebugAction));
    exports.RenameFunctionBreakpointAction = RenameFunctionBreakpointAction;
    var AddConditionalBreakpointAction = (function (_super) {
        __extends(AddConditionalBreakpointAction, _super);
        function AddConditionalBreakpointAction(id, label, editor, lineNumber, debugService, keybindingService) {
            _super.call(this, id, label, null, debugService, keybindingService);
            this.editor = editor;
            this.lineNumber = lineNumber;
        }
        AddConditionalBreakpointAction.prototype.run = function () {
            return this.debugService.editBreakpoint(this.editor, this.lineNumber);
        };
        AddConditionalBreakpointAction.ID = 'workbench.debug.viewlet.action.addConditionalBreakpointAction';
        AddConditionalBreakpointAction.LABEL = nls.localize(23, null);
        AddConditionalBreakpointAction = __decorate([
            __param(4, IDebugService),
            __param(5, keybindingService_1.IKeybindingService)
        ], AddConditionalBreakpointAction);
        return AddConditionalBreakpointAction;
    }(AbstractDebugAction));
    exports.AddConditionalBreakpointAction = AddConditionalBreakpointAction;
    var EditConditionalBreakpointAction = (function (_super) {
        __extends(EditConditionalBreakpointAction, _super);
        function EditConditionalBreakpointAction(id, label, editor, lineNumber, debugService, keybindingService) {
            _super.call(this, id, label, null, debugService, keybindingService);
            this.editor = editor;
            this.lineNumber = lineNumber;
        }
        EditConditionalBreakpointAction.prototype.run = function (breakpoint) {
            return this.debugService.editBreakpoint(this.editor, this.lineNumber);
        };
        EditConditionalBreakpointAction.ID = 'workbench.debug.viewlet.action.editConditionalBreakpointAction';
        EditConditionalBreakpointAction.LABEL = nls.localize(24, null);
        EditConditionalBreakpointAction = __decorate([
            __param(4, IDebugService),
            __param(5, keybindingService_1.IKeybindingService)
        ], EditConditionalBreakpointAction);
        return EditConditionalBreakpointAction;
    }(AbstractDebugAction));
    exports.EditConditionalBreakpointAction = EditConditionalBreakpointAction;
    var ToggleBreakpointAction = (function (_super) {
        __extends(ToggleBreakpointAction, _super);
        function ToggleBreakpointAction(descriptor, editor, debugService) {
            _super.call(this, descriptor, editor, editorActionEnablement_1.Behaviour.TextFocus);
            this.debugService = debugService;
        }
        ToggleBreakpointAction.prototype.run = function () {
            if (this.debugService.getState() !== debug.State.Disabled) {
                var lineNumber = this.editor.getPosition().lineNumber;
                var modelUrl = this.editor.getModel().getAssociatedResource();
                if (this.debugService.canSetBreakpointsIn(this.editor.getModel())) {
                    return this.debugService.toggleBreakpoint({ uri: modelUrl, lineNumber: lineNumber });
                }
            }
            return winjs_base_1.TPromise.as(null);
        };
        ToggleBreakpointAction.ID = 'editor.debug.action.toggleBreakpoint';
        ToggleBreakpointAction = __decorate([
            __param(2, IDebugService)
        ], ToggleBreakpointAction);
        return ToggleBreakpointAction;
    }(editorAction_1.EditorAction));
    exports.ToggleBreakpointAction = ToggleBreakpointAction;
    var EditorConditionalBreakpointAction = (function (_super) {
        __extends(EditorConditionalBreakpointAction, _super);
        function EditorConditionalBreakpointAction(descriptor, editor, debugService) {
            _super.call(this, descriptor, editor, editorActionEnablement_1.Behaviour.TextFocus);
            this.debugService = debugService;
        }
        EditorConditionalBreakpointAction.prototype.run = function () {
            if (this.debugService.getState() !== debug.State.Disabled) {
                var lineNumber = this.editor.getPosition().lineNumber;
                if (this.debugService.canSetBreakpointsIn(this.editor.getModel())) {
                    return this.debugService.editBreakpoint(this.editor, lineNumber);
                }
            }
            return winjs_base_1.TPromise.as(null);
        };
        EditorConditionalBreakpointAction.ID = 'editor.debug.action.conditionalBreakpoint';
        EditorConditionalBreakpointAction = __decorate([
            __param(2, IDebugService)
        ], EditorConditionalBreakpointAction);
        return EditorConditionalBreakpointAction;
    }(editorAction_1.EditorAction));
    exports.EditorConditionalBreakpointAction = EditorConditionalBreakpointAction;
    var CopyValueAction = (function (_super) {
        __extends(CopyValueAction, _super);
        function CopyValueAction(id, label, value, debugService, keybindingService) {
            _super.call(this, id, label, 'debug-action copy-value', debugService, keybindingService);
            this.value = value;
        }
        CopyValueAction.prototype.run = function () {
            var _this = this;
            if (this.value instanceof model.Variable) {
                var frameId = this.debugService.getViewModel().getFocusedStackFrame().frameId;
                var session = this.debugService.getActiveSession();
                return session.evaluate({ expression: model.getFullExpressionName(this.value, session.getType()), frameId: frameId }).then(function (result) {
                    electron_1.clipboard.writeText(result.body.result);
                }, function (err) { return electron_1.clipboard.writeText(_this.value.value); });
            }
            electron_1.clipboard.writeText(this.value);
            return winjs_base_1.TPromise.as(null);
        };
        CopyValueAction.ID = 'workbench.debug.viewlet.action.copyValue';
        CopyValueAction.LABEL = nls.localize(25, null);
        CopyValueAction = __decorate([
            __param(3, IDebugService),
            __param(4, keybindingService_1.IKeybindingService)
        ], CopyValueAction);
        return CopyValueAction;
    }(AbstractDebugAction));
    exports.CopyValueAction = CopyValueAction;
    var RunToCursorAction = (function (_super) {
        __extends(RunToCursorAction, _super);
        function RunToCursorAction(descriptor, editor, debugService) {
            _super.call(this, descriptor, editor, editorActionEnablement_1.Behaviour.TextFocus);
            this.debugService = debugService;
        }
        RunToCursorAction.prototype.run = function () {
            var _this = this;
            var lineNumber = this.editor.getPosition().lineNumber;
            var uri = this.editor.getModel().getAssociatedResource();
            this.debugService.getActiveSession().addOneTimeListener(debug.SessionEvents.STOPPED, function () {
                _this.debugService.toggleBreakpoint({ uri: uri, lineNumber: lineNumber });
            });
            return this.debugService.toggleBreakpoint({ uri: uri, lineNumber: lineNumber }).then(function () {
                return _this.debugService.getActiveSession().continue({ threadId: _this.debugService.getViewModel().getFocusedThreadId() }).then(function (response) {
                    return response.success;
                });
            });
        };
        RunToCursorAction.prototype.getGroupId = function () {
            return '5_debug/1_run_to_cursor';
        };
        RunToCursorAction.prototype.shouldShowInContextMenu = function () {
            if (this.debugService.getState() !== debug.State.Stopped) {
                return false;
            }
            var lineNumber = this.editor.getPosition().lineNumber;
            var uri = this.editor.getModel().getAssociatedResource();
            var bps = this.debugService.getModel().getBreakpoints().filter(function (bp) { return bp.lineNumber === lineNumber && bp.source.uri.toString() === uri.toString(); });
            // breakpoint must not be on position (no need for this action).
            return bps.length === 0;
        };
        RunToCursorAction.ID = 'editor.debug.action.runToCursor';
        RunToCursorAction = __decorate([
            __param(2, IDebugService)
        ], RunToCursorAction);
        return RunToCursorAction;
    }(editorAction_1.EditorAction));
    exports.RunToCursorAction = RunToCursorAction;
    var AddWatchExpressionAction = (function (_super) {
        __extends(AddWatchExpressionAction, _super);
        function AddWatchExpressionAction(id, label, debugService, keybindingService) {
            var _this = this;
            _super.call(this, id, label, 'debug-action add-watch-expression', debugService, keybindingService);
            this.toDispose.push(this.debugService.getModel().addListener2(debug.ModelEvents.WATCH_EXPRESSIONS_UPDATED, function () { return _this.updateEnablement(); }));
        }
        AddWatchExpressionAction.prototype.run = function () {
            return this.debugService.addWatchExpression();
        };
        AddWatchExpressionAction.prototype.isEnabled = function () {
            return _super.prototype.isEnabled.call(this) && this.debugService.getModel().getWatchExpressions().every(function (we) { return !!we.name; });
        };
        AddWatchExpressionAction.ID = 'workbench.debug.viewlet.action.addWatchExpression';
        AddWatchExpressionAction.LABEL = nls.localize(26, null);
        AddWatchExpressionAction = __decorate([
            __param(2, IDebugService),
            __param(3, keybindingService_1.IKeybindingService)
        ], AddWatchExpressionAction);
        return AddWatchExpressionAction;
    }(AbstractDebugAction));
    exports.AddWatchExpressionAction = AddWatchExpressionAction;
    var SelectionToWatchExpressionsAction = (function (_super) {
        __extends(SelectionToWatchExpressionsAction, _super);
        function SelectionToWatchExpressionsAction(descriptor, editor, debugService, viewletService) {
            _super.call(this, descriptor, editor, editorActionEnablement_1.Behaviour.TextFocus);
            this.debugService = debugService;
            this.viewletService = viewletService;
        }
        SelectionToWatchExpressionsAction.prototype.run = function () {
            var _this = this;
            var text = this.editor.getModel().getValueInRange(this.editor.getSelection());
            return this.viewletService.openViewlet(debug.VIEWLET_ID).then(function () { return _this.debugService.addWatchExpression(text); });
        };
        SelectionToWatchExpressionsAction.prototype.getGroupId = function () {
            return '5_debug/3_selection_to_watch';
        };
        SelectionToWatchExpressionsAction.prototype.shouldShowInContextMenu = function () {
            var selection = this.editor.getSelection();
            var text = this.editor.getModel().getValueInRange(selection);
            return !!selection && !selection.isEmpty() && this.debugService.getConfigurationName() && text && /\S/.test(text);
        };
        SelectionToWatchExpressionsAction.ID = 'editor.debug.action.selectionToWatch';
        SelectionToWatchExpressionsAction = __decorate([
            __param(2, IDebugService),
            __param(3, viewletService_1.IViewletService)
        ], SelectionToWatchExpressionsAction);
        return SelectionToWatchExpressionsAction;
    }(editorAction_1.EditorAction));
    exports.SelectionToWatchExpressionsAction = SelectionToWatchExpressionsAction;
    var SelectionToReplAction = (function (_super) {
        __extends(SelectionToReplAction, _super);
        function SelectionToReplAction(descriptor, editor, debugService) {
            _super.call(this, descriptor, editor, editorActionEnablement_1.Behaviour.TextFocus);
            this.debugService = debugService;
        }
        SelectionToReplAction.prototype.run = function () {
            var _this = this;
            var text = this.editor.getModel().getValueInRange(this.editor.getSelection());
            return this.debugService.addReplExpression(text).then(function () { return _this.debugService.revealRepl(); });
        };
        SelectionToReplAction.prototype.getGroupId = function () {
            return '5_debug/2_selection_to_repl';
        };
        SelectionToReplAction.prototype.shouldShowInContextMenu = function () {
            var selection = this.editor.getSelection();
            return !!selection && !selection.isEmpty() && this.debugService.getState() === debug.State.Stopped;
        };
        SelectionToReplAction.ID = 'editor.debug.action.selectionToRepl';
        SelectionToReplAction = __decorate([
            __param(2, IDebugService)
        ], SelectionToReplAction);
        return SelectionToReplAction;
    }(editorAction_1.EditorAction));
    exports.SelectionToReplAction = SelectionToReplAction;
    var ShowDebugHoverAction = (function (_super) {
        __extends(ShowDebugHoverAction, _super);
        function ShowDebugHoverAction(descriptor, editor) {
            _super.call(this, descriptor, editor, editorActionEnablement_1.Behaviour.TextFocus);
        }
        ShowDebugHoverAction.prototype.run = function () {
            var position = this.editor.getPosition();
            var word = this.editor.getModel().getWordAtPosition(position);
            if (!word) {
                return winjs_base_1.TPromise.as(null);
            }
            var range = new range_1.Range(position.lineNumber, position.column, position.lineNumber, word.endColumn);
            return this.editor.getContribution(debug.EDITOR_CONTRIBUTION_ID).showHover(range, word.word, true);
        };
        ShowDebugHoverAction.ID = 'editor.debug.action.showDebugHover';
        return ShowDebugHoverAction;
    }(editorAction_1.EditorAction));
    exports.ShowDebugHoverAction = ShowDebugHoverAction;
    var AddToWatchExpressionsAction = (function (_super) {
        __extends(AddToWatchExpressionsAction, _super);
        function AddToWatchExpressionsAction(id, label, expression, debugService, keybindingService) {
            _super.call(this, id, label, 'debug-action add-to-watch', debugService, keybindingService);
            this.expression = expression;
        }
        AddToWatchExpressionsAction.prototype.run = function () {
            return this.debugService.addWatchExpression(model.getFullExpressionName(this.expression, this.debugService.getActiveSession().getType()));
        };
        AddToWatchExpressionsAction.ID = 'workbench.debug.viewlet.action.addToWatchExpressions';
        AddToWatchExpressionsAction.LABEL = nls.localize(27, null);
        AddToWatchExpressionsAction = __decorate([
            __param(3, IDebugService),
            __param(4, keybindingService_1.IKeybindingService)
        ], AddToWatchExpressionsAction);
        return AddToWatchExpressionsAction;
    }(AbstractDebugAction));
    exports.AddToWatchExpressionsAction = AddToWatchExpressionsAction;
    var RenameWatchExpressionAction = (function (_super) {
        __extends(RenameWatchExpressionAction, _super);
        function RenameWatchExpressionAction(id, label, expression, debugService, keybindingService) {
            _super.call(this, id, label, 'debug-action rename', debugService, keybindingService);
            this.expression = expression;
        }
        RenameWatchExpressionAction.prototype.run = function () {
            this.debugService.getViewModel().setSelectedExpression(this.expression);
            return winjs_base_1.TPromise.as(null);
        };
        RenameWatchExpressionAction.ID = 'workbench.debug.viewlet.action.renameWatchExpression';
        RenameWatchExpressionAction.LABEL = nls.localize(28, null);
        RenameWatchExpressionAction = __decorate([
            __param(3, IDebugService),
            __param(4, keybindingService_1.IKeybindingService)
        ], RenameWatchExpressionAction);
        return RenameWatchExpressionAction;
    }(AbstractDebugAction));
    exports.RenameWatchExpressionAction = RenameWatchExpressionAction;
    var RemoveWatchExpressionAction = (function (_super) {
        __extends(RemoveWatchExpressionAction, _super);
        function RemoveWatchExpressionAction(id, label, debugService, keybindingService) {
            _super.call(this, id, label, 'debug-action remove', debugService, keybindingService);
        }
        RemoveWatchExpressionAction.prototype.run = function (expression) {
            this.debugService.clearWatchExpressions(expression.getId());
            return winjs_base_1.TPromise.as(null);
        };
        RemoveWatchExpressionAction.ID = 'workbench.debug.viewlet.action.removeWatchExpression';
        RemoveWatchExpressionAction.LABEL = nls.localize(29, null);
        RemoveWatchExpressionAction = __decorate([
            __param(2, IDebugService),
            __param(3, keybindingService_1.IKeybindingService)
        ], RemoveWatchExpressionAction);
        return RemoveWatchExpressionAction;
    }(AbstractDebugAction));
    exports.RemoveWatchExpressionAction = RemoveWatchExpressionAction;
    var RemoveAllWatchExpressionsAction = (function (_super) {
        __extends(RemoveAllWatchExpressionsAction, _super);
        function RemoveAllWatchExpressionsAction(id, label, debugService, keybindingService) {
            var _this = this;
            _super.call(this, id, label, 'debug-action remove-all', debugService, keybindingService);
            this.toDispose.push(this.debugService.getModel().addListener2(debug.ModelEvents.WATCH_EXPRESSIONS_UPDATED, function () { return _this.updateEnablement(); }));
        }
        RemoveAllWatchExpressionsAction.prototype.run = function () {
            this.debugService.clearWatchExpressions();
            return winjs_base_1.TPromise.as(null);
        };
        RemoveAllWatchExpressionsAction.prototype.isEnabled = function () {
            return _super.prototype.isEnabled.call(this) && this.debugService.getModel().getWatchExpressions().length > 0;
        };
        RemoveAllWatchExpressionsAction.ID = 'workbench.debug.viewlet.action.removeAllWatchExpressions';
        RemoveAllWatchExpressionsAction.LABEL = nls.localize(30, null);
        RemoveAllWatchExpressionsAction = __decorate([
            __param(2, IDebugService),
            __param(3, keybindingService_1.IKeybindingService)
        ], RemoveAllWatchExpressionsAction);
        return RemoveAllWatchExpressionsAction;
    }(AbstractDebugAction));
    exports.RemoveAllWatchExpressionsAction = RemoveAllWatchExpressionsAction;
    var ClearReplAction = (function (_super) {
        __extends(ClearReplAction, _super);
        function ClearReplAction(id, label, debugService, keybindingService) {
            _super.call(this, id, label, 'debug-action clear-repl', debugService, keybindingService);
        }
        ClearReplAction.prototype.run = function () {
            this.debugService.clearReplExpressions();
            // focus back to repl
            return this.debugService.revealRepl();
        };
        ClearReplAction.ID = 'workbench.debug.panel.action.clearReplAction';
        ClearReplAction.LABEL = nls.localize(31, null);
        ClearReplAction = __decorate([
            __param(2, IDebugService),
            __param(3, keybindingService_1.IKeybindingService)
        ], ClearReplAction);
        return ClearReplAction;
    }(AbstractDebugAction));
    exports.ClearReplAction = ClearReplAction;
    var CopyAction = (function (_super) {
        __extends(CopyAction, _super);
        function CopyAction() {
            _super.apply(this, arguments);
        }
        CopyAction.prototype.run = function () {
            electron_1.clipboard.writeText(window.getSelection().toString());
            return winjs_base_1.TPromise.as(null);
        };
        CopyAction.ID = 'workbench.debug.action.copy';
        CopyAction.LABEL = nls.localize(32, null);
        return CopyAction;
    }(actions.Action));
    exports.CopyAction = CopyAction;
    var ToggleReplAction = (function (_super) {
        __extends(ToggleReplAction, _super);
        function ToggleReplAction(id, label, debugService, partService, panelService, keybindingService, eventService) {
            _super.call(this, id, label, 'debug-action toggle-repl', debugService, keybindingService);
            this.partService = partService;
            this.panelService = panelService;
            this.eventService = eventService;
            this.enabled = this.debugService.getState() !== debug.State.Disabled;
            this.registerListeners();
        }
        ToggleReplAction.prototype.run = function () {
            if (this.isReplVisible()) {
                this.partService.setPanelHidden(true);
                return winjs_base_1.TPromise.as(null);
            }
            return this.debugService.revealRepl();
        };
        ToggleReplAction.prototype.registerListeners = function () {
            var _this = this;
            this.toDispose.push(this.debugService.getModel().addListener2(debug.ModelEvents.REPL_ELEMENTS_UPDATED, function () {
                if (!_this.isReplVisible()) {
                    _this.class = 'debug-action toggle-repl notification';
                }
            }));
            this.toDispose.push(this.eventService.addListener2(events_1.EventType.COMPOSITE_OPENED, function (e) {
                if (e.compositeId === debug.REPL_ID) {
                    _this.class = 'debug-action toggle-repl';
                }
            }));
        };
        ToggleReplAction.prototype.isReplVisible = function () {
            var panel = this.panelService.getActivePanel();
            return panel && panel.getId() === debug.REPL_ID;
        };
        ToggleReplAction.ID = 'workbench.debug.action.toggleRepl';
        ToggleReplAction.LABEL = nls.localize(33, null);
        ToggleReplAction = __decorate([
            __param(2, IDebugService),
            __param(3, partService_1.IPartService),
            __param(4, panelService_1.IPanelService),
            __param(5, keybindingService_1.IKeybindingService),
            __param(6, event_1.IEventService)
        ], ToggleReplAction);
        return ToggleReplAction;
    }(AbstractDebugAction));
    exports.ToggleReplAction = ToggleReplAction;
    var RunAction = (function (_super) {
        __extends(RunAction, _super);
        function RunAction(id, label, debugService, keybindingService) {
            _super.call(this, id, label, null, debugService, keybindingService);
        }
        RunAction.prototype.run = function () {
            return this.debugService.createSession(true);
        };
        RunAction.prototype.isEnabled = function () {
            return _super.prototype.isEnabled.call(this) && this.debugService.getState() === debug.State.Inactive;
        };
        RunAction.ID = 'workbench.action.debug.run';
        RunAction.LABEL = nls.localize(34, null);
        RunAction = __decorate([
            __param(2, IDebugService),
            __param(3, keybindingService_1.IKeybindingService)
        ], RunAction);
        return RunAction;
    }(AbstractDebugAction));
    exports.RunAction = RunAction;
});
//# sourceMappingURL=debugActions.js.map