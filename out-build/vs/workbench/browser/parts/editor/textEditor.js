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
define(["require", "exports", 'vs/base/common/objects', 'vs/editor/browser/widget/codeEditorWidget', 'vs/workbench/common/events', 'vs/workbench/common/memento', 'vs/workbench/browser/parts/editor/baseEditor', 'vs/editor/common/config/commonEditorConfig', 'vs/editor/common/editorCommon', 'vs/workbench/services/workspace/common/contextService', 'vs/platform/storage/common/storage', 'vs/platform/configuration/common/configuration', 'vs/platform/event/common/event', 'vs/platform/instantiation/common/instantiation', 'vs/platform/message/common/message', 'vs/platform/telemetry/common/telemetry', 'vs/workbench/services/editor/common/editorService', 'vs/editor/common/services/modeService', 'vs/workbench/services/themes/common/themeService', 'vs/css!./media/texteditor'], function (require, exports, objects, codeEditorWidget_1, events_1, memento_1, baseEditor_1, commonEditorConfig_1, editorCommon_1, contextService_1, storage_1, configuration_1, event_1, instantiation_1, message_1, telemetry_1, editorService_1, modeService_1, themeService_1) {
    'use strict';
    var EDITOR_VIEW_STATE_PREFERENCE_KEY = 'editorViewState';
    /**
     * The base class of editors that leverage the monaco text editor for the editing experience. This class is only intended to
     * be subclassed and not instantiated.
     */
    var BaseTextEditor = (function (_super) {
        __extends(BaseTextEditor, _super);
        function BaseTextEditor(id, telemetryService, _instantiationService, _contextService, _storageService, _messageService, configurationService, _eventService, _editorService, _modeService, _themeService) {
            var _this = this;
            _super.call(this, id, telemetryService);
            this._instantiationService = _instantiationService;
            this._contextService = _contextService;
            this._storageService = _storageService;
            this._messageService = _messageService;
            this.configurationService = configurationService;
            this._eventService = _eventService;
            this._editorService = _editorService;
            this._modeService = _modeService;
            this._themeService = _themeService;
            this.toUnbind.push(this._eventService.addListener(events_1.EventType.WORKBENCH_OPTIONS_CHANGED, function (e) { return _this.onOptionsChanged(e); }));
            this.toUnbind.push(this.configurationService.addListener(configuration_1.ConfigurationServiceEventTypes.UPDATED, function (e) { return _this.applyConfiguration(e.config); }));
            this.toUnbind.push(_themeService.onDidThemeChange(function (_) { return _this.onThemeChanged(); }).dispose);
        }
        Object.defineProperty(BaseTextEditor.prototype, "instantiationService", {
            get: function () {
                return this._instantiationService;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseTextEditor.prototype, "contextService", {
            get: function () {
                return this._contextService;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseTextEditor.prototype, "storageService", {
            get: function () {
                return this._storageService;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseTextEditor.prototype, "messageService", {
            get: function () {
                return this._messageService;
            },
            enumerable: true,
            configurable: true
        });
        BaseTextEditor.prototype.applyConfiguration = function (configuration) {
            // Update Editor with configuration and editor settings
            if (this.editorControl) {
                var specificEditorSettings = this.getCodeEditorOptions();
                configuration = objects.clone(configuration); // dont modify original config
                objects.assign(configuration[commonEditorConfig_1.EditorConfiguration.EDITOR_SECTION], specificEditorSettings);
                commonEditorConfig_1.EditorConfiguration.apply(configuration, this.editorControl);
            }
            // Update Languages
            this._modeService.configureAllModes(configuration);
        };
        BaseTextEditor.prototype.onOptionsChanged = function (event) {
            if (this.editorControl) {
                this.editorControl.updateOptions(this.getCodeEditorOptions());
            }
        };
        BaseTextEditor.prototype.onThemeChanged = function () {
            this.editorControl.updateOptions(this.getCodeEditorOptions());
        };
        BaseTextEditor.prototype.getCodeEditorOptions = function () {
            var baseOptions = {
                overviewRulerLanes: 3,
                readOnly: this.contextService.getOptions().readOnly,
                glyphMargin: true,
                lineNumbersMinChars: 3,
                theme: this._themeService.getTheme()
            };
            // Always mixin editor options from the context into our set to allow for override
            return objects.mixin(baseOptions, this.contextService.getOptions().editor);
        };
        Object.defineProperty(BaseTextEditor.prototype, "eventService", {
            get: function () {
                return this._eventService;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseTextEditor.prototype, "editorService", {
            get: function () {
                return this._editorService;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseTextEditor.prototype, "editorContainer", {
            get: function () {
                return this._editorContainer;
            },
            enumerable: true,
            configurable: true
        });
        BaseTextEditor.prototype.createEditor = function (parent) {
            var _this = this;
            // Editor for Text
            this._editorContainer = parent;
            this.editorControl = this.createEditorControl(parent);
            // Hook Listener for Selection changes
            this.toUnbind.push(this.editorControl.addListener(editorCommon_1.EventType.CursorPositionChanged, function (event) {
                var selection = _this.editorControl.getSelection();
                _this.eventService.emit(events_1.EventType.TEXT_EDITOR_SELECTION_CHANGED, new events_1.TextEditorSelectionEvent(selection, _this, _this.getId(), _this.input, null, _this.position, event));
            }));
            // Hook Listener for mode changes
            this.toUnbind.push(this.editorControl.addListener(editorCommon_1.EventType.ModelModeChanged, function (event) {
                _this.eventService.emit(events_1.EventType.TEXT_EDITOR_MODE_CHANGED, new events_1.EditorEvent(_this, _this.getId(), _this.input, null, _this.position, event));
            }));
            // Hook Listener for content changes
            this.toUnbind.push(this.editorControl.addListener(editorCommon_1.EventType.ModelContentChanged, function (event) {
                _this.eventService.emit(events_1.EventType.TEXT_EDITOR_CONTENT_CHANGED, new events_1.EditorEvent(_this, _this.getId(), _this.input, null, _this.position, event));
            }));
            // Hook Listener for content options changes
            this.toUnbind.push(this.editorControl.addListener(editorCommon_1.EventType.ModelOptionsChanged, function (event) {
                _this.eventService.emit(events_1.EventType.TEXT_EDITOR_CONTENT_OPTIONS_CHANGED, new events_1.EditorEvent(_this, _this.getId(), _this.input, null, _this.position, event));
            }));
            // Hook Listener for options changes
            this.toUnbind.push(this.editorControl.addListener(editorCommon_1.EventType.ConfigurationChanged, function (event) {
                _this.eventService.emit(events_1.EventType.TEXT_EDITOR_CONFIGURATION_CHANGED, new events_1.EditorEvent(_this, _this.getId(), _this.input, null, _this.position, event));
            }));
            // Configuration
            this.applyConfiguration(this.configurationService.getConfiguration());
        };
        /**
         * This method creates and returns the text editor control to be used. Subclasses can override to
         * provide their own editor control that should be used (e.g. a DiffEditor).
         */
        BaseTextEditor.prototype.createEditorControl = function (parent) {
            return this._instantiationService.createInstance(codeEditorWidget_1.CodeEditorWidget, parent.getHTMLElement(), this.getCodeEditorOptions());
        };
        BaseTextEditor.prototype.setInput = function (input, options) {
            var _this = this;
            return _super.prototype.setInput.call(this, input, options).then(function () {
                _this.editorControl.updateOptions(_this.getCodeEditorOptions()); // support input specific editor options
            });
        };
        BaseTextEditor.prototype.setVisible = function (visible, position) {
            if (position === void 0) { position = null; }
            var promise = _super.prototype.setVisible.call(this, visible, position);
            // Pass on to Editor
            if (visible) {
                this.editorControl.onVisible();
            }
            else {
                this.editorControl.onHide();
            }
            return promise;
        };
        BaseTextEditor.prototype.focus = function () {
            this.editorControl.focus();
        };
        BaseTextEditor.prototype.layout = function (dimension) {
            // Pass on to Editor
            this.editorControl.layout(dimension);
        };
        BaseTextEditor.prototype.getControl = function () {
            return this.editorControl;
        };
        BaseTextEditor.prototype.getSelection = function () {
            return this.editorControl.getSelection();
        };
        /**
         * Saves the text editor view state under the given key.
         */
        BaseTextEditor.prototype.saveTextEditorViewState = function (storageService, key) {
            var editorViewState = this.editorControl.saveViewState();
            var memento = this.getMemento(storageService, memento_1.Scope.WORKSPACE);
            var editorViewStateMemento = memento[EDITOR_VIEW_STATE_PREFERENCE_KEY];
            if (!editorViewStateMemento) {
                editorViewStateMemento = {};
                memento[EDITOR_VIEW_STATE_PREFERENCE_KEY] = editorViewStateMemento;
            }
            editorViewStateMemento[key] = editorViewState;
        };
        /**
         * Clears the text editor view state under the given key.
         */
        BaseTextEditor.prototype.clearTextEditorViewState = function (storageService, keys) {
            var memento = this.getMemento(storageService, memento_1.Scope.WORKSPACE);
            var editorViewStateMemento = memento[EDITOR_VIEW_STATE_PREFERENCE_KEY];
            if (editorViewStateMemento) {
                keys.forEach(function (key) { return delete editorViewStateMemento[key]; });
            }
        };
        /**
         * Loads the text editor view state for the given key and returns it.
         */
        BaseTextEditor.prototype.loadTextEditorViewState = function (storageService, key) {
            var memento = this.getMemento(storageService, memento_1.Scope.WORKSPACE);
            var editorViewStateMemento = memento[EDITOR_VIEW_STATE_PREFERENCE_KEY];
            if (editorViewStateMemento) {
                return editorViewStateMemento[key];
            }
            return null;
        };
        BaseTextEditor.prototype.dispose = function () {
            // Destroy Editor Control
            this.editorControl.destroy();
            _super.prototype.dispose.call(this);
        };
        BaseTextEditor = __decorate([
            __param(1, telemetry_1.ITelemetryService),
            __param(2, instantiation_1.IInstantiationService),
            __param(3, contextService_1.IWorkspaceContextService),
            __param(4, storage_1.IStorageService),
            __param(5, message_1.IMessageService),
            __param(6, configuration_1.IConfigurationService),
            __param(7, event_1.IEventService),
            __param(8, editorService_1.IWorkbenchEditorService),
            __param(9, modeService_1.IModeService),
            __param(10, themeService_1.IThemeService)
        ], BaseTextEditor);
        return BaseTextEditor;
    }(baseEditor_1.BaseEditor));
    exports.BaseTextEditor = BaseTextEditor;
});
