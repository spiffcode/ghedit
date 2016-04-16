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
define(["require", "exports", 'vs/nls', 'vs/base/common/winjs.base', 'vs/base/browser/dom', 'vs/base/common/strings', 'vs/base/common/paths', 'vs/base/common/types', 'vs/base/common/errors', 'vs/base/common/actions', 'vs/workbench/common/editor/untitledEditorInput', 'vs/workbench/common/editor', 'vs/base/common/lifecycle', 'vs/platform/message/common/message', 'vs/workbench/browser/actions/openSettings', 'vs/editor/contrib/linesOperations/common/linesOperations', 'vs/editor/common/editorCommon', 'vs/editor/contrib/indentation/common/indentation', 'vs/workbench/common/events', 'vs/workbench/browser/parts/editor/textEditor', 'vs/workbench/services/editor/common/editorService', 'vs/workbench/services/quickopen/common/quickOpenService', 'vs/platform/configuration/common/configuration', 'vs/platform/event/common/event', 'vs/platform/files/common/files', 'vs/platform/instantiation/common/instantiation', 'vs/editor/common/services/modeService', 'vs/base/browser/styleMutator', 'vs/css!./media/editorstatus'], function (require, exports, nls, winjs_base_1, dom_1, strings, paths, types, errors, actions_1, untitledEditorInput_1, editor_1, lifecycle_1, message_1, openSettings_1, linesOperations_1, editorCommon_1, indentation_1, events_1, textEditor_1, editorService_1, quickOpenService_1, configuration_1, event_1, files_1, instantiation_1, modeService_1, styleMutator_1) {
    'use strict';
    function getCodeEditor(e) {
        if (e instanceof textEditor_1.BaseTextEditor) {
            var editorWidget = e.getControl();
            if (editorWidget.getEditorType() === editorCommon_1.EditorType.IDiffEditor) {
                return editorWidget.getModifiedEditor();
            }
            if (editorWidget.getEditorType() === editorCommon_1.EditorType.ICodeEditor) {
                return editorWidget;
            }
            return null;
        }
        return null;
    }
    function getTextModel(editorWidget) {
        var textModel;
        // Support for diff
        var model = editorWidget.getModel();
        if (model && !!model.modified) {
            textModel = model.modified;
        }
        else {
            textModel = model;
        }
        return textModel;
    }
    function asFileOrUntitledEditorInput(input) {
        if (input instanceof untitledEditorInput_1.UntitledEditorInput) {
            return input;
        }
        return editor_1.asFileEditorInput(input, true /* support diff editor */);
    }
    var StateChange = (function () {
        function StateChange() {
            this.indentation = false;
            this.selectionStatus = false;
            this.mode = false;
            this.encoding = false;
            this.EOL = false;
            this.tabFocusMode = false;
        }
        StateChange.prototype.combine = function (other) {
            this.indentation = this.indentation || other.indentation;
            this.selectionStatus = this.selectionStatus || other.selectionStatus;
            this.mode = this.mode || other.mode;
            this.encoding = this.encoding || other.encoding;
            this.EOL = this.EOL || other.EOL;
            this.tabFocusMode = this.tabFocusMode || other.tabFocusMode;
        };
        return StateChange;
    }());
    var State = (function () {
        function State() {
            this._selectionStatus = null;
            this._mode = null;
            this._encoding = null;
            this._EOL = null;
            this._tabFocusMode = false;
        }
        Object.defineProperty(State.prototype, "selectionStatus", {
            get: function () { return this._selectionStatus; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(State.prototype, "mode", {
            get: function () { return this._mode; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(State.prototype, "encoding", {
            get: function () { return this._encoding; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(State.prototype, "EOL", {
            get: function () { return this._EOL; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(State.prototype, "indentation", {
            get: function () { return this._indentation; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(State.prototype, "tabFocusMode", {
            get: function () { return this._tabFocusMode; },
            enumerable: true,
            configurable: true
        });
        State.prototype.update = function (update) {
            var e = new StateChange();
            var somethingChanged = false;
            if (typeof update.selectionStatus !== 'undefined') {
                if (this._selectionStatus !== update.selectionStatus) {
                    this._selectionStatus = update.selectionStatus;
                    somethingChanged = true;
                    e.selectionStatus = true;
                }
            }
            if (typeof update.indentation !== 'undefined') {
                if (this._indentation !== update.indentation) {
                    this._indentation = update.indentation;
                    somethingChanged = true;
                    e.indentation = true;
                }
            }
            if (typeof update.mode !== 'undefined') {
                if (this._mode !== update.mode) {
                    this._mode = update.mode;
                    somethingChanged = true;
                    e.mode = true;
                }
            }
            if (typeof update.encoding !== 'undefined') {
                if (this._encoding !== update.encoding) {
                    this._encoding = update.encoding;
                    somethingChanged = true;
                    e.encoding = true;
                }
            }
            if (typeof update.EOL !== 'undefined') {
                if (this._EOL !== update.EOL) {
                    this._EOL = update.EOL;
                    somethingChanged = true;
                    e.EOL = true;
                }
            }
            if (typeof update.tabFocusMode !== 'undefined') {
                if (this._tabFocusMode !== update.tabFocusMode) {
                    this._tabFocusMode = update.tabFocusMode;
                    somethingChanged = true;
                    e.tabFocusMode = true;
                }
            }
            if (somethingChanged) {
                return e;
            }
            return null;
        };
        return State;
    }());
    var nlsSingleSelectionRange = nls.localize('singleSelectionRange', "Ln {0}, Col {1} ({2} selected)");
    var nlsSingleSelection = nls.localize('singleSelection', "Ln {0}, Col {1}");
    var nlsMultiSelectionRange = nls.localize('multiSelectionRange', "{0} selections ({1} characters selected)");
    var nlsMultiSelection = nls.localize('multiSelection', "{0} selections");
    var nlsEOLLF = nls.localize('endOfLineLineFeed', "LF");
    var nlsEOLCRLF = nls.localize('endOfLineCarriageReturnLineFeed', "CRLF");
    var nlsTabFocusMode = nls.localize('tabFocusModeEnabled', "Tab moves focus");
    function show(el) {
        styleMutator_1.StyleMutator.setDisplay(el, '');
    }
    function hide(el) {
        styleMutator_1.StyleMutator.setDisplay(el, 'none');
    }
    var EditorStatus = (function () {
        function EditorStatus(editorService, quickOpenService, instantiationService, eventService, modeService, configurationService) {
            this.editorService = editorService;
            this.quickOpenService = quickOpenService;
            this.instantiationService = instantiationService;
            this.eventService = eventService;
            this.modeService = modeService;
            this.configurationService = configurationService;
            this.toDispose = [];
            this.state = new State();
        }
        EditorStatus.prototype.render = function (container) {
            var _this = this;
            this.element = dom_1.append(container, dom_1.emmet('.editor-statusbar-item'));
            this.tabFocusModeElement = dom_1.append(this.element, dom_1.emmet('a.editor-status-tabfocusmode'));
            this.tabFocusModeElement.title = nls.localize('disableTabMode', "Disable Accessibility Mode");
            this.tabFocusModeElement.onclick = function () { return _this.onTabFocusModeClick(); };
            this.tabFocusModeElement.textContent = nlsTabFocusMode;
            hide(this.tabFocusModeElement);
            this.selectionElement = dom_1.append(this.element, dom_1.emmet('a.editor-status-selection'));
            this.selectionElement.title = nls.localize('gotoLine', "Go to Line");
            this.selectionElement.onclick = function () { return _this.onSelectionClick(); };
            hide(this.selectionElement);
            this.indentationElement = dom_1.append(this.element, dom_1.emmet('a.editor-status-indentation'));
            this.indentationElement.title = nls.localize('indentation', "Indentation");
            this.indentationElement.onclick = function () { return _this.onIndentationClick(); };
            hide(this.indentationElement);
            this.encodingElement = dom_1.append(this.element, dom_1.emmet('a.editor-status-encoding'));
            this.encodingElement.title = nls.localize('selectEncoding', "Select Encoding");
            this.encodingElement.onclick = function () { return _this.onEncodingClick(); };
            hide(this.encodingElement);
            this.eolElement = dom_1.append(this.element, dom_1.emmet('a.editor-status-eol'));
            this.eolElement.title = nls.localize('selectEOL', "Select End of Line Sequence");
            this.eolElement.onclick = function () { return _this.onEOLClick(); };
            hide(this.eolElement);
            this.modeElement = dom_1.append(this.element, dom_1.emmet('a.editor-status-mode'));
            this.modeElement.title = nls.localize('selectLanguageMode', "Select Language Mode");
            this.modeElement.onclick = function () { return _this.onModeClick(); };
            hide(this.modeElement);
            this.delayedRender = null;
            this.toRender = null;
            this.toDispose.push({
                dispose: function () {
                    if (_this.delayedRender) {
                        _this.delayedRender.dispose();
                        _this.delayedRender = null;
                    }
                }
            }, this.eventService.addListener2(events_1.EventType.EDITOR_INPUT_CHANGED, function (e) { return _this.onEditorInputChange(e.editor); }), this.eventService.addListener2(events_1.EventType.RESOURCE_ENCODING_CHANGED, function (e) { return _this.onResourceEncodingChange(e.resource); }), this.eventService.addListener2(events_1.EventType.TEXT_EDITOR_SELECTION_CHANGED, function (e) { return _this.onSelectionChange(e.editor); }), this.eventService.addListener2(events_1.EventType.TEXT_EDITOR_MODE_CHANGED, function (e) { return _this.onModeChange(e.editor); }), this.eventService.addListener2(events_1.EventType.TEXT_EDITOR_CONTENT_CHANGED, function (e) { return _this.onEOLChange(e.editor); }), this.eventService.addListener2(events_1.EventType.TEXT_EDITOR_CONFIGURATION_CHANGED, function (e) { return _this.onTabFocusModeChange(e.editor); }), this.eventService.addListener2(events_1.EventType.TEXT_EDITOR_CONTENT_OPTIONS_CHANGED, function (e) { return _this.onIndentationChange(e.editor); }));
            return lifecycle_1.combinedDisposable(this.toDispose);
        };
        EditorStatus.prototype.updateState = function (update) {
            var _this = this;
            var changed = this.state.update(update);
            if (!changed) {
                // Nothing really changed
                return;
            }
            if (!this.toRender) {
                this.toRender = changed;
                this.delayedRender = dom_1.runAtThisOrScheduleAtNextAnimationFrame(function () {
                    _this.delayedRender = null;
                    var toRender = _this.toRender;
                    _this.toRender = null;
                    _this._renderNow(toRender);
                });
            }
            else {
                this.toRender.combine(changed);
            }
        };
        EditorStatus.prototype._renderNow = function (changed) {
            if (changed.tabFocusMode) {
                if (this.state.tabFocusMode && this.state.tabFocusMode === true) {
                    show(this.tabFocusModeElement);
                }
                else {
                    hide(this.tabFocusModeElement);
                }
            }
            if (changed.indentation) {
                if (this.state.indentation) {
                    this.indentationElement.textContent = this.state.indentation;
                    show(this.indentationElement);
                }
                else {
                    hide(this.indentationElement);
                }
            }
            if (changed.selectionStatus) {
                if (this.state.selectionStatus) {
                    this.selectionElement.textContent = this.state.selectionStatus;
                    show(this.selectionElement);
                }
                else {
                    hide(this.selectionElement);
                }
            }
            if (changed.encoding) {
                if (this.state.encoding) {
                    this.encodingElement.textContent = this.state.encoding;
                    show(this.encodingElement);
                }
                else {
                    hide(this.encodingElement);
                }
            }
            if (changed.EOL) {
                if (this.state.EOL) {
                    this.eolElement.textContent = this.state.EOL === '\r\n' ? nlsEOLCRLF : nlsEOLLF;
                    show(this.eolElement);
                }
                else {
                    hide(this.eolElement);
                }
            }
            if (changed.mode) {
                if (this.state.mode) {
                    this.modeElement.textContent = this.state.mode;
                    show(this.modeElement);
                }
                else {
                    hide(this.modeElement);
                }
            }
        };
        EditorStatus.prototype.getSelectionLabel = function (info) {
            if (!info || !info.selections) {
                return null;
            }
            if (info.selections.length === 1) {
                if (info.charactersSelected) {
                    return strings.format(nlsSingleSelectionRange, info.selections[0].positionLineNumber, info.selections[0].positionColumn, info.charactersSelected);
                }
                else {
                    return strings.format(nlsSingleSelection, info.selections[0].positionLineNumber, info.selections[0].positionColumn);
                }
            }
            else {
                if (info.charactersSelected) {
                    return strings.format(nlsMultiSelectionRange, info.selections.length, info.charactersSelected);
                }
                else {
                    return strings.format(nlsMultiSelection, info.selections.length);
                }
            }
        };
        EditorStatus.prototype.onModeClick = function () {
            var action = this.instantiationService.createInstance(ChangeModeAction, ChangeModeAction.ID, ChangeModeAction.LABEL);
            action.run().done(null, errors.onUnexpectedError);
            action.dispose();
        };
        EditorStatus.prototype.onIndentationClick = function () {
            var action = this.instantiationService.createInstance(ChangeIndentationAction, ChangeIndentationAction.ID, ChangeIndentationAction.LABEL);
            action.run().done(null, errors.onUnexpectedError);
            action.dispose();
        };
        EditorStatus.prototype.onSelectionClick = function () {
            this.quickOpenService.show(':'); // "Go to line"
        };
        EditorStatus.prototype.onEOLClick = function () {
            var action = this.instantiationService.createInstance(ChangeEOLAction, ChangeEOLAction.ID, ChangeEOLAction.LABEL);
            action.run().done(null, errors.onUnexpectedError);
            action.dispose();
        };
        EditorStatus.prototype.onEncodingClick = function () {
            var action = this.instantiationService.createInstance(ChangeEncodingAction, ChangeEncodingAction.ID, ChangeEncodingAction.LABEL);
            action.run().done(null, errors.onUnexpectedError);
            action.dispose();
        };
        EditorStatus.prototype.onTabFocusModeClick = function () {
            var activeEditor = this.editorService.getActiveEditor();
            if (activeEditor instanceof textEditor_1.BaseTextEditor && isCodeEditorWithTabFocusMode(activeEditor)) {
                activeEditor.getControl().updateOptions({ tabFocusMode: false });
            }
        };
        EditorStatus.prototype.onEditorInputChange = function (e) {
            this.onSelectionChange(e);
            this.onModeChange(e);
            this.onEOLChange(e);
            this.onEncodingChange(e);
            this.onTabFocusModeChange(e);
            this.onIndentationChange(e);
        };
        EditorStatus.prototype.onModeChange = function (e) {
            if (e && !this.isActiveEditor(e)) {
                return;
            }
            var info = { mode: null };
            // We only support text based editors
            if (e instanceof textEditor_1.BaseTextEditor) {
                var editorWidget = e.getControl();
                var textModel = getTextModel(editorWidget);
                if (textModel) {
                    // Compute mode
                    if (!!textModel.getMode) {
                        var mode = textModel.getMode();
                        if (mode) {
                            info = { mode: this.modeService.getLanguageName(mode.getId()) };
                        }
                    }
                }
            }
            this.updateState(info);
        };
        EditorStatus.prototype.onIndentationChange = function (e) {
            if (e && !this.isActiveEditor(e)) {
                return;
            }
            var update = { indentation: null };
            if (e instanceof textEditor_1.BaseTextEditor) {
                var editorWidget = e.getControl();
                if (editorWidget) {
                    if (editorWidget.getEditorType() === editorCommon_1.EditorType.IDiffEditor) {
                        editorWidget = editorWidget.getModifiedEditor();
                    }
                    var model = editorWidget.getModel();
                    if (model) {
                        var modelOpts = model.getOptions();
                        update.indentation = (modelOpts.insertSpaces
                            ? nls.localize('spacesSize', "Spaces: {0}", modelOpts.tabSize)
                            : nls.localize({ key: 'tabSize', comment: ['Tab corresponds to the tab key'] }, "Tab Size: {0}", modelOpts.tabSize));
                    }
                }
            }
            this.updateState(update);
        };
        EditorStatus.prototype.onSelectionChange = function (e) {
            if (e && !this.isActiveEditor(e)) {
                return;
            }
            var info = {};
            // We only support text based editors
            if (e instanceof textEditor_1.BaseTextEditor) {
                var editorWidget = e.getControl();
                // Compute selection(s)
                info.selections = editorWidget.getSelections() || [];
                // Compute selection length
                info.charactersSelected = 0;
                var textModel_1 = getTextModel(editorWidget);
                if (textModel_1) {
                    info.selections.forEach(function (selection) {
                        info.charactersSelected += textModel_1.getValueLengthInRange(selection);
                    });
                }
                // Compute the visible column for one selection. This will properly handle tabs and their configured widths
                if (info.selections.length === 1) {
                    var visibleColumn = editorWidget.getVisibleColumnFromPosition(editorWidget.getPosition());
                    var selectionClone = info.selections[0].clone(); // do not modify the original position we got from the editor
                    selectionClone.positionColumn = visibleColumn;
                    info.selections[0] = selectionClone;
                }
            }
            this.updateState({ selectionStatus: this.getSelectionLabel(info) });
        };
        EditorStatus.prototype.onEOLChange = function (e) {
            if (e && !this.isActiveEditor(e)) {
                return;
            }
            var info = { EOL: null };
            var codeEditor = getCodeEditor(e);
            if (codeEditor && !codeEditor.getConfiguration().readOnly) {
                var codeEditorModel = codeEditor.getModel();
                if (codeEditorModel) {
                    info.EOL = codeEditorModel.getEOL();
                }
            }
            this.updateState(info);
        };
        EditorStatus.prototype.onEncodingChange = function (e) {
            if (e && !this.isActiveEditor(e)) {
                return;
            }
            var info = { encoding: null };
            // We only support text based editors
            if (e instanceof textEditor_1.BaseTextEditor) {
                var encodingSupport = asFileOrUntitledEditorInput(e.input);
                if (encodingSupport && types.isFunction(encodingSupport.getEncoding)) {
                    var rawEncoding = encodingSupport.getEncoding();
                    var encodingInfo = files_1.SUPPORTED_ENCODINGS[rawEncoding];
                    if (encodingInfo) {
                        info.encoding = encodingInfo.labelShort; // if we have a label, take it from there
                    }
                    else {
                        info.encoding = rawEncoding; // otherwise use it raw
                    }
                }
            }
            this.updateState(info);
        };
        EditorStatus.prototype.onResourceEncodingChange = function (resource) {
            var activeEditor = this.editorService.getActiveEditor();
            if (activeEditor) {
                var activeResource = editor_1.getUntitledOrFileResource(activeEditor.input, true);
                if (activeResource && activeResource.toString() === resource.toString()) {
                    return this.onEncodingChange(activeEditor); // only update if the encoding changed for the active resource
                }
            }
        };
        EditorStatus.prototype.onTabFocusModeChange = function (e) {
            if (e && !this.isActiveEditor(e)) {
                return;
            }
            var info = { tabFocusMode: false };
            // We only support text based editors
            if (e instanceof textEditor_1.BaseTextEditor && isCodeEditorWithTabFocusMode(e)) {
                info = { tabFocusMode: true };
            }
            this.updateState(info);
        };
        EditorStatus.prototype.isActiveEditor = function (e) {
            var activeEditor = this.editorService.getActiveEditor();
            return activeEditor && e && activeEditor === e;
        };
        EditorStatus = __decorate([
            __param(0, editorService_1.IWorkbenchEditorService),
            __param(1, quickOpenService_1.IQuickOpenService),
            __param(2, instantiation_1.IInstantiationService),
            __param(3, event_1.IEventService),
            __param(4, modeService_1.IModeService),
            __param(5, configuration_1.IConfigurationService)
        ], EditorStatus);
        return EditorStatus;
    }());
    exports.EditorStatus = EditorStatus;
    function isCodeEditorWithTabFocusMode(e) {
        var editorWidget = e.getControl();
        if (editorWidget.getEditorType() === editorCommon_1.EditorType.IDiffEditor) {
            editorWidget = editorWidget.getModifiedEditor();
        }
        if (editorWidget.getEditorType() !== editorCommon_1.EditorType.ICodeEditor) {
            return false;
        }
        var editorConfig = editorWidget.getConfiguration();
        return editorConfig.tabFocusMode && !editorConfig.readOnly;
    }
    function isWritableCodeEditor(e) {
        var editorWidget = e.getControl();
        if (editorWidget.getEditorType() === editorCommon_1.EditorType.IDiffEditor) {
            editorWidget = editorWidget.getModifiedEditor();
        }
        return (editorWidget.getEditorType() === editorCommon_1.EditorType.ICodeEditor &&
            !editorWidget.getConfiguration().readOnly);
    }
    var ChangeModeAction = (function (_super) {
        __extends(ChangeModeAction, _super);
        function ChangeModeAction(actionId, actionLabel, modeService, editorService, messageService, instantiationService, quickOpenService) {
            _super.call(this, actionId, actionLabel);
            this.modeService = modeService;
            this.editorService = editorService;
            this.messageService = messageService;
            this.instantiationService = instantiationService;
            this.quickOpenService = quickOpenService;
        }
        ChangeModeAction.prototype.run = function () {
            var _this = this;
            var languages = this.modeService.getRegisteredLanguageNames();
            var activeEditor = this.editorService.getActiveEditor();
            if (!(activeEditor instanceof textEditor_1.BaseTextEditor)) {
                return this.quickOpenService.pick([{ label: nls.localize('noEditor', "No text editor active at this time") }]);
            }
            var editorWidget = activeEditor.getControl();
            var textModel = getTextModel(editorWidget);
            var fileinput = editor_1.asFileEditorInput(activeEditor.input, true);
            // Compute mode
            var currentModeId;
            if (!!textModel.getMode) {
                var mode = textModel.getMode();
                if (mode) {
                    currentModeId = this.modeService.getLanguageName(mode.getId());
                }
            }
            // All languages are valid picks
            var picks = languages.sort().map(function (lang, index) {
                return {
                    label: lang,
                    description: currentModeId === lang ? nls.localize('configuredLanguage', "Configured Language") : void 0
                };
            });
            picks[0].separator = { border: true, label: nls.localize('languagesPicks', "languages") };
            // Offer action to configure via settings
            var configureLabel = nls.localize('configureAssociations', "Configure File Associations...");
            if (fileinput) {
                var resource = fileinput.getResource();
                var ext = paths.extname(resource.fsPath) || paths.basename(resource.fsPath);
                if (ext) {
                    configureLabel = nls.localize('configureAssociationsExt', "Configure File Association for '{0}'...", ext);
                }
            }
            var configureModeAssociations = {
                label: configureLabel
            };
            picks.unshift(configureModeAssociations);
            // Offer to "Auto Detect"
            var autoDetectMode = {
                label: nls.localize('autoDetect', "Auto Detect")
            };
            if (fileinput) {
                picks.unshift(autoDetectMode);
            }
            return this.quickOpenService.pick(picks, { placeHolder: nls.localize('pickLanguage', "Select Language Mode") }).then(function (language) {
                if (language) {
                    activeEditor = _this.editorService.getActiveEditor();
                    if (activeEditor instanceof textEditor_1.BaseTextEditor) {
                        var editorWidget_1 = activeEditor.getControl();
                        var models = [];
                        var textModel_2 = getTextModel(editorWidget_1);
                        models.push(textModel_2);
                        // Support for original side of diff
                        var model = editorWidget_1.getModel();
                        if (model && !!model.original) {
                            models.push(model.original);
                        }
                        // Find mode
                        var mode_1;
                        if (language === autoDetectMode) {
                            mode_1 = _this.modeService.getOrCreateModeByFilenameOrFirstLine(editor_1.getUntitledOrFileResource(activeEditor.input, true).fsPath, textModel_2.getLineContent(1));
                        }
                        else if (language === configureModeAssociations) {
                            var action_1 = _this.instantiationService.createInstance(openSettings_1.OpenGlobalSettingsAction, openSettings_1.OpenGlobalSettingsAction.ID, openSettings_1.OpenGlobalSettingsAction.LABEL);
                            action_1.run().done(function () { return action_1.dispose(); }, errors.onUnexpectedError);
                            _this.messageService.show(message_1.Severity.Info, nls.localize('persistFileAssociations', "You can configure filename to language associations in the **files.associations** section. The changes may need a restart to take effect on already opened files."));
                        }
                        else {
                            mode_1 = _this.modeService.getOrCreateModeByLanguageName(language.label);
                        }
                        // Change mode
                        models.forEach(function (textModel) {
                            if (!!textModel.getMode) {
                                textModel.setMode(mode_1);
                            }
                        });
                    }
                }
            });
        };
        ChangeModeAction.ID = 'workbench.action.editor.changeLanguageMode';
        ChangeModeAction.LABEL = nls.localize('changeMode', "Change Language Mode");
        ChangeModeAction = __decorate([
            __param(2, modeService_1.IModeService),
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, message_1.IMessageService),
            __param(5, instantiation_1.IInstantiationService),
            __param(6, quickOpenService_1.IQuickOpenService)
        ], ChangeModeAction);
        return ChangeModeAction;
    }(actions_1.Action));
    exports.ChangeModeAction = ChangeModeAction;
    var ChangeIndentationAction = (function (_super) {
        __extends(ChangeIndentationAction, _super);
        function ChangeIndentationAction(actionId, actionLabel, editorService, quickOpenService) {
            _super.call(this, actionId, actionLabel);
            this.editorService = editorService;
            this.quickOpenService = quickOpenService;
        }
        ChangeIndentationAction.prototype.run = function () {
            var activeEditor = this.editorService.getActiveEditor();
            if (!(activeEditor instanceof textEditor_1.BaseTextEditor)) {
                return this.quickOpenService.pick([{ label: nls.localize('noEditor', "No text editor active at this time") }]);
            }
            if (!isWritableCodeEditor(activeEditor)) {
                return this.quickOpenService.pick([{ label: nls.localize('noWritableCodeEditor', "The active code editor is read-only.") }]);
            }
            var control = activeEditor.getControl();
            var picks = [control.getAction(indentation_1.IndentUsingSpaces.ID), control.getAction(indentation_1.IndentUsingTabs.ID), control.getAction(indentation_1.DetectIndentation.ID),
                control.getAction(indentation_1.IndentationToSpacesAction.ID), control.getAction(indentation_1.IndentationToTabsAction.ID), control.getAction(linesOperations_1.TrimTrailingWhitespaceAction.ID)];
            picks[0].separator = { label: nls.localize('indentView', "change view") };
            picks[3].separator = { label: nls.localize('indentConvert', "convert file"), border: true };
            return this.quickOpenService.pick(picks, { placeHolder: nls.localize('pickAction', "Select Action") }).then(function (action) { return action && action.run(); });
        };
        ChangeIndentationAction.ID = 'workbench.action.editor.changeIndentation';
        ChangeIndentationAction.LABEL = nls.localize('changeIndentation', "Change Indentation");
        ChangeIndentationAction = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, quickOpenService_1.IQuickOpenService)
        ], ChangeIndentationAction);
        return ChangeIndentationAction;
    }(actions_1.Action));
    var ChangeEOLAction = (function (_super) {
        __extends(ChangeEOLAction, _super);
        function ChangeEOLAction(actionId, actionLabel, editorService, quickOpenService) {
            _super.call(this, actionId, actionLabel);
            this.editorService = editorService;
            this.quickOpenService = quickOpenService;
        }
        ChangeEOLAction.prototype.run = function () {
            var _this = this;
            var activeEditor = this.editorService.getActiveEditor();
            if (!(activeEditor instanceof textEditor_1.BaseTextEditor)) {
                return this.quickOpenService.pick([{ label: nls.localize('noEditor', "No text editor active at this time") }]);
            }
            if (!isWritableCodeEditor(activeEditor)) {
                return this.quickOpenService.pick([{ label: nls.localize('noWritableCodeEditor', "The active code editor is read-only.") }]);
            }
            var editorWidget = activeEditor.getControl();
            var textModel = getTextModel(editorWidget);
            var EOLOptions = [
                { label: nlsEOLLF, eol: editorCommon_1.EndOfLineSequence.LF },
                { label: nlsEOLCRLF, eol: editorCommon_1.EndOfLineSequence.CRLF },
            ];
            var selectedIndex = (textModel.getEOL() === '\n') ? 0 : 1;
            return this.quickOpenService.pick(EOLOptions, { placeHolder: nls.localize('pickEndOfLine', "Select End of Line Sequence"), autoFocus: { autoFocusIndex: selectedIndex } }).then(function (eol) {
                if (eol) {
                    activeEditor = _this.editorService.getActiveEditor();
                    if (activeEditor instanceof textEditor_1.BaseTextEditor && isWritableCodeEditor(activeEditor)) {
                        var editorWidget_2 = activeEditor.getControl();
                        var textModel_3 = getTextModel(editorWidget_2);
                        textModel_3.setEOL(eol.eol);
                    }
                }
            });
        };
        ChangeEOLAction.ID = 'workbench.action.editor.changeEOL';
        ChangeEOLAction.LABEL = nls.localize('changeEndOfLine', "Change End of Line Sequence");
        ChangeEOLAction = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, quickOpenService_1.IQuickOpenService)
        ], ChangeEOLAction);
        return ChangeEOLAction;
    }(actions_1.Action));
    exports.ChangeEOLAction = ChangeEOLAction;
    var ChangeEncodingAction = (function (_super) {
        __extends(ChangeEncodingAction, _super);
        function ChangeEncodingAction(actionId, actionLabel, editorService, quickOpenService, configurationService) {
            _super.call(this, actionId, actionLabel);
            this.editorService = editorService;
            this.quickOpenService = quickOpenService;
            this.configurationService = configurationService;
        }
        ChangeEncodingAction.prototype.run = function () {
            var _this = this;
            var activeEditor = this.editorService.getActiveEditor();
            if (!(activeEditor instanceof textEditor_1.BaseTextEditor) || !activeEditor.input) {
                return this.quickOpenService.pick([{ label: nls.localize('noEditor', "No text editor active at this time") }]);
            }
            var encodingSupport = asFileOrUntitledEditorInput(activeEditor.input);
            if (!types.areFunctions(encodingSupport.setEncoding, encodingSupport.getEncoding)) {
                return this.quickOpenService.pick([{ label: nls.localize('noFileEditor', "No file active at this time") }]);
            }
            var pickActionPromise;
            var saveWithEncodingPick = { label: nls.localize('saveWithEncoding', "Save with Encoding") };
            var reopenWithEncodingPick = { label: nls.localize('reopenWithEncoding', "Reopen with Encoding") };
            if (encodingSupport instanceof untitledEditorInput_1.UntitledEditorInput) {
                pickActionPromise = winjs_base_1.TPromise.as(saveWithEncodingPick);
            }
            else if (!isWritableCodeEditor(activeEditor)) {
                pickActionPromise = winjs_base_1.TPromise.as(reopenWithEncodingPick);
            }
            else {
                pickActionPromise = this.quickOpenService.pick([reopenWithEncodingPick, saveWithEncodingPick], { placeHolder: nls.localize('pickAction', "Select Action") });
            }
            return pickActionPromise.then(function (action) {
                if (!action) {
                    return;
                }
                return winjs_base_1.TPromise.timeout(50 /* quick open is sensitive to being opened so soon after another */).then(function () {
                    var configuration = _this.configurationService.getConfiguration();
                    var isReopenWithEncoding = (action === reopenWithEncodingPick);
                    var configuredEncoding = configuration && configuration.files && configuration.files.encoding;
                    var directMatchIndex;
                    var aliasMatchIndex;
                    // All encodings are valid picks
                    var picks = Object.keys(files_1.SUPPORTED_ENCODINGS)
                        .sort(function (k1, k2) {
                        if (k1 === configuredEncoding) {
                            return -1;
                        }
                        else if (k2 === configuredEncoding) {
                            return 1;
                        }
                        return files_1.SUPPORTED_ENCODINGS[k1].order - files_1.SUPPORTED_ENCODINGS[k2].order;
                    })
                        .filter(function (k) {
                        return !isReopenWithEncoding || !files_1.SUPPORTED_ENCODINGS[k].encodeOnly; // hide those that can only be used for encoding if we are about to decode
                    })
                        .map(function (key, index) {
                        if (key === encodingSupport.getEncoding()) {
                            directMatchIndex = index;
                        }
                        else if (files_1.SUPPORTED_ENCODINGS[key].alias === encodingSupport.getEncoding()) {
                            aliasMatchIndex = index;
                        }
                        return { id: key, label: files_1.SUPPORTED_ENCODINGS[key].labelLong };
                    });
                    return _this.quickOpenService.pick(picks, {
                        placeHolder: isReopenWithEncoding ? nls.localize('pickEncodingForReopen', "Select File Encoding to Reopen File") : nls.localize('pickEncodingForSave', "Select File Encoding to Save with"),
                        autoFocus: { autoFocusIndex: typeof directMatchIndex === 'number' ? directMatchIndex : typeof aliasMatchIndex === 'number' ? aliasMatchIndex : void 0 }
                    }).then(function (encoding) {
                        if (encoding) {
                            activeEditor = _this.editorService.getActiveEditor();
                            encodingSupport = asFileOrUntitledEditorInput(activeEditor.input);
                            if (encodingSupport && types.areFunctions(encodingSupport.setEncoding, encodingSupport.getEncoding) && encodingSupport.getEncoding() !== encoding.id) {
                                encodingSupport.setEncoding(encoding.id, isReopenWithEncoding ? editor_1.EncodingMode.Decode : editor_1.EncodingMode.Encode); // Set new encoding
                            }
                        }
                    });
                });
            });
        };
        ChangeEncodingAction.ID = 'workbench.action.editor.changeEncoding';
        ChangeEncodingAction.LABEL = nls.localize('changeEncoding', "Change File Encoding");
        ChangeEncodingAction = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, quickOpenService_1.IQuickOpenService),
            __param(4, configuration_1.IConfigurationService)
        ], ChangeEncodingAction);
        return ChangeEncodingAction;
    }(actions_1.Action));
    exports.ChangeEncodingAction = ChangeEncodingAction;
});
