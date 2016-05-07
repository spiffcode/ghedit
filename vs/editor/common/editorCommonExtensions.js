define(["require", "exports", 'vs/base/common/errors', 'vs/base/common/uri', 'vs/platform/instantiation/common/descriptors', 'vs/platform/keybinding/common/keybindingService', 'vs/platform/keybinding/common/keybindingsRegistry', 'vs/platform/platform', 'vs/platform/telemetry/common/telemetry', 'vs/editor/common/config/config', 'vs/editor/common/core/position', 'vs/editor/common/editorCommon', 'vs/editor/common/services/modelService'], function (require, exports, errors_1, uri_1, descriptors_1, keybindingService_1, keybindingsRegistry_1, platform_1, telemetry_1, config_1, position_1, editorCommon, modelService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    // --- Keybinding extensions to make it more concise to express keybindings conditions
    (function (ContextKey) {
        ContextKey[ContextKey["None"] = 0] = "None";
        ContextKey[ContextKey["EditorTextFocus"] = 1] = "EditorTextFocus";
        ContextKey[ContextKey["EditorFocus"] = 2] = "EditorFocus";
    })(exports.ContextKey || (exports.ContextKey = {}));
    var ContextKey = exports.ContextKey;
    // --- Editor Actions
    var EditorActionDescriptor = (function () {
        function EditorActionDescriptor(ctor, id, label, kbOpts) {
            if (kbOpts === void 0) { kbOpts = defaultEditorActionKeybindingOptions; }
            this.ctor = ctor;
            this.id = id;
            this.label = label;
            this.kbOpts = kbOpts;
        }
        return EditorActionDescriptor;
    }());
    exports.EditorActionDescriptor = EditorActionDescriptor;
    var CommonEditorRegistry;
    (function (CommonEditorRegistry) {
        function registerEditorAction(desc) {
            platform_1.Registry.as(Extensions.EditorCommonContributions).registerEditorAction(desc);
        }
        CommonEditorRegistry.registerEditorAction = registerEditorAction;
        // --- Editor Contributions
        function registerEditorContribution(ctor) {
            platform_1.Registry.as(Extensions.EditorCommonContributions).registerEditorContribution2(ctor);
        }
        CommonEditorRegistry.registerEditorContribution = registerEditorContribution;
        function getEditorContributions() {
            return platform_1.Registry.as(Extensions.EditorCommonContributions).getEditorContributions2();
        }
        CommonEditorRegistry.getEditorContributions = getEditorContributions;
        // --- Editor Commands
        function commandWeight(importance) {
            if (importance === void 0) { importance = 0; }
            return keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib(importance);
        }
        CommonEditorRegistry.commandWeight = commandWeight;
        function registerEditorCommand(commandId, weight, keybinding, needsTextFocus, needsKey, handler) {
            var commandDesc = {
                id: commandId,
                handler: createCommandHandler(commandId, handler),
                weight: weight,
                context: contextRule(needsTextFocus, needsKey),
                primary: keybinding.primary,
                secondary: keybinding.secondary,
                win: keybinding.win,
                linux: keybinding.linux,
                mac: keybinding.mac,
            };
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandDesc(commandDesc);
        }
        CommonEditorRegistry.registerEditorCommand = registerEditorCommand;
        function registerLanguageCommand(id, handler) {
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandDesc({
                id: id,
                handler: function (accessor, args) {
                    if (args && args.length > 1 || typeof args[0] !== 'object') {
                        throw errors_1.illegalArgument();
                    }
                    return handler(accessor, args && args[0]);
                },
                weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib(),
                primary: undefined,
                context: undefined,
            });
        }
        CommonEditorRegistry.registerLanguageCommand = registerLanguageCommand;
        function registerDefaultLanguageCommand(id, handler) {
            registerLanguageCommand(id, function (accessor, args) {
                var resource = args.resource, position = args.position;
                if (!(resource instanceof uri_1.default) || !position_1.Position.isIPosition(position)) {
                    throw errors_1.illegalArgument();
                }
                var model = accessor.get(modelService_1.IModelService).getModel(resource);
                if (!model) {
                    throw errors_1.illegalArgument();
                }
                return handler(model, position, args);
            });
        }
        CommonEditorRegistry.registerDefaultLanguageCommand = registerDefaultLanguageCommand;
    })(CommonEditorRegistry = exports.CommonEditorRegistry || (exports.CommonEditorRegistry = {}));
    var SimpleEditorContributionDescriptor = (function () {
        function SimpleEditorContributionDescriptor(ctor) {
            this._ctor = ctor;
        }
        SimpleEditorContributionDescriptor.prototype.createInstance = function (instantiationService, editor) {
            return instantiationService.createInstance(this._ctor, editor);
        };
        return SimpleEditorContributionDescriptor;
    }());
    var InternalEditorActionDescriptor = (function () {
        function InternalEditorActionDescriptor(ctor, id, label) {
            this._descriptor = descriptors_1.createSyncDescriptor(ctor, {
                id: id,
                label: label
            });
        }
        InternalEditorActionDescriptor.prototype.createInstance = function (instService, editor) {
            return instService.createInstance(this._descriptor, editor);
        };
        return InternalEditorActionDescriptor;
    }());
    // Editor extension points
    var Extensions = {
        EditorCommonContributions: 'editor.commonContributions'
    };
    var EditorContributionRegistry = (function () {
        function EditorContributionRegistry() {
            this.editorContributions = [];
        }
        EditorContributionRegistry.prototype.registerEditorContribution2 = function (ctor) {
            this.editorContributions.push(new SimpleEditorContributionDescriptor(ctor));
        };
        EditorContributionRegistry.prototype.registerEditorAction = function (desc) {
            var handler = desc.kbOpts.handler;
            if (!handler) {
                if (desc.kbOpts.context === ContextKey.EditorTextFocus || desc.kbOpts.context === ContextKey.EditorFocus) {
                    handler = triggerEditorAction.bind(null, desc.id);
                }
                else {
                    handler = triggerEditorActionGlobal.bind(null, desc.id);
                }
            }
            var context = null;
            if (typeof desc.kbOpts.kbExpr === 'undefined') {
                if (desc.kbOpts.context === ContextKey.EditorTextFocus) {
                    context = keybindingService_1.KbExpr.has(editorCommon.KEYBINDING_CONTEXT_EDITOR_TEXT_FOCUS);
                }
                else if (desc.kbOpts.context === ContextKey.EditorFocus) {
                    context = keybindingService_1.KbExpr.has(editorCommon.KEYBINDING_CONTEXT_EDITOR_FOCUS);
                }
            }
            else {
                context = desc.kbOpts.kbExpr;
            }
            var commandDesc = {
                id: desc.id,
                handler: handler,
                weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib(),
                context: context,
                primary: desc.kbOpts.primary,
                secondary: desc.kbOpts.secondary,
                win: desc.kbOpts.win,
                linux: desc.kbOpts.linux,
                mac: desc.kbOpts.mac,
            };
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandDesc(commandDesc);
            this.editorContributions.push(new InternalEditorActionDescriptor(desc.ctor, desc.id, desc.label));
        };
        EditorContributionRegistry.prototype.getEditorContributions2 = function () {
            return this.editorContributions.slice(0);
        };
        return EditorContributionRegistry;
    }());
    platform_1.Registry.add(Extensions.EditorCommonContributions, new EditorContributionRegistry());
    function triggerEditorAction(actionId, accessor, args) {
        config_1.withCodeEditorFromCommandHandler(actionId, accessor, args, function (editor) {
            editor.trigger('keyboard', actionId, args);
        });
    }
    function triggerEditorActionGlobal(actionId, accessor, args) {
        // TODO: this is not necessarily keyboard
        var focusedEditor = config_1.findFocusedEditor(actionId, accessor, args, false);
        if (focusedEditor) {
            focusedEditor.trigger('keyboard', actionId, args);
            return;
        }
        var activeEditor = config_1.getActiveEditor(accessor);
        if (activeEditor) {
            var action = activeEditor.getAction(actionId);
            if (action) {
                accessor.get(telemetry_1.ITelemetryService).publicLog('editorActionInvoked', { name: action.label });
                action.run().done(null, errors_1.onUnexpectedError);
            }
            return;
        }
    }
    var defaultEditorActionKeybindingOptions = { primary: null, context: ContextKey.EditorTextFocus };
    function contextRule(needsTextFocus, needsKey) {
        var base = keybindingService_1.KbExpr.has(needsTextFocus ? editorCommon.KEYBINDING_CONTEXT_EDITOR_TEXT_FOCUS : editorCommon.KEYBINDING_CONTEXT_EDITOR_FOCUS);
        if (needsKey) {
            return keybindingService_1.KbExpr.and(base, keybindingService_1.KbExpr.has(needsKey));
        }
        return base;
    }
    function createCommandHandler(commandId, handler) {
        return function (accessor, args) {
            config_1.withCodeEditorFromCommandHandler(commandId, accessor, args, function (editor) {
                handler(accessor, editor, args);
            });
        };
    }
});
//# sourceMappingURL=editorCommonExtensions.js.map