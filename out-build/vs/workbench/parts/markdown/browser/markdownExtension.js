var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/types', 'vs/base/common/events', 'vs/platform/files/common/files', 'vs/base/common/paths', 'vs/editor/common/editorCommon', 'vs/platform/theme/common/themes', 'vs/workbench/browser/parts/editor/iframeEditor', 'vs/workbench/parts/markdown/common/markdownEditorInput', 'vs/workbench/common/events', 'vs/workbench/services/editor/common/editorService', 'vs/workbench/services/workspace/common/contextService', 'vs/platform/configuration/common/configuration', 'vs/editor/common/services/modelService', 'vs/platform/event/common/event', 'vs/platform/instantiation/common/instantiation', 'vs/editor/common/services/modeService', 'vs/workbench/services/themes/common/themeService'], function (require, exports, types, events_1, files_1, paths, editorCommon_1, themes_1, iframeEditor_1, markdownEditorInput_1, events_2, editorService_1, contextService_1, configuration_1, modelService_1, event_1, instantiation_1, modeService_1, themeService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    // This extension tracks markdown files for changes to update markdown editors and inputs accordingly.
    var MarkdownFileTracker = (function () {
        function MarkdownFileTracker(modeService, eventService, editorService, configurationService, contextService, modelService, instantiationService, themeService) {
            this.modeService = modeService;
            this.eventService = eventService;
            this.editorService = editorService;
            this.configurationService = configurationService;
            this.contextService = contextService;
            this.modelService = modelService;
            this.instantiationService = instantiationService;
            this.themeService = themeService;
            this.markdownConfigurationPaths = [];
            this.hasModelListenerOnResourcePath = Object.create(null);
            this.configureMode(themeService.getTheme());
            this.registerListeners();
        }
        MarkdownFileTracker.prototype.registerListeners = function () {
            var _this = this;
            this.fileChangeListener = this.eventService.addListener(files_1.EventType.FILE_CHANGES, function (e) { return _this.onFileChanges(e); });
            this.configFileChangeListener = this.configurationService.addListener(configuration_1.ConfigurationServiceEventTypes.UPDATED, function (e) { return _this.onConfigFileChange(e); });
            // reload markdown editors when their resources change
            this.editorInputChangeListener = this.eventService.addListener(events_2.EventType.EDITOR_INPUT_CHANGED, function (e) { return _this.onEditorInputChanged(e); });
            // initially read the config for CSS styles in preview
            this.readMarkdownConfiguration(this.configurationService.getConfiguration());
            // listen to theme changes
            this.themeChangeListener = this.themeService.onDidThemeChange(function (themeId) {
                _this.configureMode(themeId);
                _this.reloadMarkdownEditors(true);
            });
        };
        MarkdownFileTracker.prototype.onEditorInputChanged = function (e) {
            var _this = this;
            var input = e.editorInput;
            if (input instanceof markdownEditorInput_1.MarkdownEditorInput) {
                var markdownResource_1 = input.getResource();
                var editorModel = this.modelService.getModel(markdownResource_1);
                if (editorModel && !this.hasModelListenerOnResourcePath[markdownResource_1.toString()]) {
                    var toUnbind_1 = [];
                    var unbind_1 = function () {
                        while (toUnbind_1.length) {
                            toUnbind_1.pop()();
                        }
                        _this.hasModelListenerOnResourcePath[markdownResource_1.toString()] = false;
                    };
                    // Listen on changes to the underlying resource of the markdown preview
                    toUnbind_1.push(editorModel.addListener(editorCommon_1.EventType.ModelContentChanged, function (modelEvent) {
                        if (_this.reloadTimeout) {
                            window.clearTimeout(_this.reloadTimeout);
                        }
                        _this.reloadTimeout = setTimeout(function () {
                            if (!_this.reloadMarkdownEditors(false, markdownResource_1)) {
                                unbind_1();
                            }
                        }, MarkdownFileTracker.RELOAD_MARKDOWN_DELAY);
                    }));
                    // Mark as being listened
                    this.hasModelListenerOnResourcePath[markdownResource_1.toString()] = true;
                    // Unbind when input or model gets disposed
                    toUnbind_1.push(input.addListener(events_1.EventType.DISPOSE, unbind_1));
                    toUnbind_1.push(editorModel.addListener(editorCommon_1.EventType.ModelDispose, unbind_1));
                }
            }
        };
        MarkdownFileTracker.prototype.configureMode = function (theme) {
            if (theme) {
                var baseTheme = themes_1.getBaseThemeId(theme);
                this.modeService.configureMode('text/x-web-markdown', { theme: baseTheme });
            }
        };
        MarkdownFileTracker.prototype.getId = function () {
            return 'vs.markdown.filetracker';
        };
        MarkdownFileTracker.prototype.onConfigFileChange = function (e) {
            // reload markdown editors if styles change
            if (this.readMarkdownConfiguration(e.config)) {
                this.reloadMarkdownEditors(true);
            }
        };
        MarkdownFileTracker.prototype.readMarkdownConfiguration = function (languageConfiguration) {
            var oldMarkdownConfigurationThumbprint = this.markdownConfigurationThumbprint;
            var newMarkdownConfigurationThumbprint;
            // Reset old
            this.markdownConfigurationThumbprint = null;
            this.markdownConfigurationPaths = [];
            if (languageConfiguration) {
                var markdownConfiguration = languageConfiguration.markdown;
                if (markdownConfiguration && types.isArray(markdownConfiguration.styles)) {
                    newMarkdownConfigurationThumbprint = markdownConfiguration.styles.join('');
                    var styles = markdownConfiguration.styles.map(function (style) { return paths.makeAbsolute(paths.normalize(style)); });
                    this.markdownConfigurationPaths = styles;
                }
            }
            // Remember as current
            this.markdownConfigurationThumbprint = newMarkdownConfigurationThumbprint;
            return (oldMarkdownConfigurationThumbprint !== newMarkdownConfigurationThumbprint);
        };
        MarkdownFileTracker.prototype.onFileChanges = function (e) {
            var _this = this;
            // If any of the markdown CSS styles have updated, reload all markdown editors
            if (this.markdownConfigurationPaths.length && e.containsAny(this.markdownConfigurationPaths.map(function (p) { return _this.contextService.toResource(p); }), files_1.FileChangeType.UPDATED)) {
                this.reloadMarkdownEditors(true);
            }
        };
        MarkdownFileTracker.prototype.reloadMarkdownEditors = function (clearIFrame, resource) {
            var didReload = false;
            var editors = this.editorService.getVisibleEditors();
            editors.forEach(function (editor) {
                // Only applicable to markdown editor inputs in iframe editors
                var input = editor.input;
                if (input instanceof markdownEditorInput_1.MarkdownEditorInput && editor instanceof iframeEditor_1.IFrameEditor) {
                    if (!resource || resource.toString() === input.getResource().toString()) {
                        editor.reload(clearIFrame);
                        didReload = true;
                    }
                }
            });
            return didReload;
        };
        MarkdownFileTracker.prototype.dispose = function () {
            if (this.fileChangeListener) {
                this.fileChangeListener();
                this.fileChangeListener = null;
            }
            if (this.configFileChangeListener) {
                this.configFileChangeListener();
                this.configFileChangeListener = null;
            }
            if (this.editorInputChangeListener) {
                this.editorInputChangeListener();
                this.editorInputChangeListener = null;
            }
        };
        MarkdownFileTracker.RELOAD_MARKDOWN_DELAY = 300; // delay before reloading markdown preview after user typing
        MarkdownFileTracker = __decorate([
            __param(0, modeService_1.IModeService),
            __param(1, event_1.IEventService),
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, configuration_1.IConfigurationService),
            __param(4, contextService_1.IWorkspaceContextService),
            __param(5, modelService_1.IModelService),
            __param(6, instantiation_1.IInstantiationService),
            __param(7, themeService_1.IThemeService)
        ], MarkdownFileTracker);
        return MarkdownFileTracker;
    }());
    exports.MarkdownFileTracker = MarkdownFileTracker;
});
//# sourceMappingURL=markdownExtension.js.map