/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/platform/platform', 'vs/base/common/timer', 'vs/base/common/events', 'vs/base/browser/builder', 'vs/nls', 'vs/base/common/strings', 'vs/base/common/assert', 'vs/base/common/arrays', 'vs/base/common/types', 'vs/base/common/errors', 'vs/workbench/common/memento', 'vs/workbench/browser/actionBarRegistry', 'vs/workbench/browser/part', 'vs/workbench/common/events', 'vs/workbench/browser/parts/editor/baseEditor', 'vs/workbench/common/editor', 'vs/workbench/browser/parts/editor/textEditor', 'vs/workbench/browser/parts/editor/sideBySideEditorControl', 'vs/workbench/services/progress/browser/progressService', 'vs/platform/editor/common/editor', 'vs/platform/message/common/message', 'vs/css!./media/editorpart', 'vs/workbench/browser/parts/editor/editor.contribution'], function (require, exports, winjs_base_1, platform_1, timer, events_1, builder_1, nls, strings, assert, arrays, types, errors, memento_1, actionBarRegistry_1, part_1, events_2, baseEditor_1, editor_1, textEditor_1, sideBySideEditorControl_1, progressService_1, editor_2, message_1) {
    'use strict';
    var EDITOR_STATE_STORAGE_KEY = 'editorpart.editorState';
    /**
     * The editor part is the container for editors in the workbench. Based on the editor input being opened, it asks the registered
     * editor for the given input to show the contents. The editor part supports up to 3 side-by-side editors.
     */
    var EditorPart = (function (_super) {
        __extends(EditorPart, _super);
        function EditorPart(messageService, eventService, telemetryService, storageService, partService, id) {
            _super.call(this, id);
            this.messageService = messageService;
            this.eventService = eventService;
            this.telemetryService = telemetryService;
            this.storageService = storageService;
            this.partService = partService;
            this.visibleInputs = [];
            this.visibleInputListeners = [];
            this.visibleEditors = [];
            this.editorOpenToken = [];
            for (var i = 0; i < editor_2.POSITIONS.length; i++) {
                this.editorOpenToken[i] = 0;
            }
            this.editorSetInputErrorCounter = [];
            for (var i = 0; i < editor_2.POSITIONS.length; i++) {
                this.editorSetInputErrorCounter[i] = 0;
            }
            this.visibleEditorListeners = this.createPositionArray(true);
            this.instantiatedEditors = this.createPositionArray(true);
            this.mapEditorToEditorContainers = this.createPositionArray(false);
            this.mapActionsToEditors = this.createPositionArray(false);
            this.mapEditorLoadingPromiseToEditor = this.createPositionArray(false);
            this.mapEditorCreationPromiseToEditor = this.createPositionArray(false);
            this.pendingEditorInputsToClose = [];
            this.pendingEditorInputCloseTimeout = null;
        }
        EditorPart.prototype.setInstantiationService = function (service) {
            this.instantiationService = service;
        };
        EditorPart.prototype.createPositionArray = function (multiArray) {
            var array = [];
            for (var i = 0; i < editor_2.POSITIONS.length; i++) {
                array[i] = multiArray ? [] : {};
            }
            return array;
        };
        EditorPart.prototype.getActiveEditorInput = function () {
            var lastActiveEditor = this.sideBySideControl.getActiveEditor();
            return lastActiveEditor ? lastActiveEditor.input : null;
        };
        EditorPart.prototype.getActiveEditor = function () {
            return this.sideBySideControl.getActiveEditor();
        };
        EditorPart.prototype.getVisibleEditors = function () {
            return this.visibleEditors ? this.visibleEditors.filter(function (editor) { return !!editor; }) : [];
        };
        EditorPart.prototype.setEditors = function (inputs, options) {
            var _this = this;
            return this.closeEditors().then(function () {
                return _this.restoreEditorState(inputs, options);
            });
        };
        EditorPart.prototype.openEditor = function (input, options, arg3, widthRatios) {
            var _this = this;
            // Normalize some values
            if (!input) {
                input = null;
            }
            if (!options) {
                options = null;
            }
            // Determine position to open editor in (left, center, right)
            var position = this.findPosition(arg3, widthRatios);
            // In case the position is invalid, return early. This can happen when the user tries to open a side editor
            // when the maximum number of allowed editors is reached and no more side editor can be opened.
            if (position === null) {
                return winjs_base_1.TPromise.as(null);
            }
            // Prevent bad UI issues by ignoring any attempt to open an editor if at the same time an editor is
            // either creating or loading at this position. Not very nice, but helpful and typically should not cause issues.
            if (Object.keys(this.mapEditorLoadingPromiseToEditor[position]).length > 0 || Object.keys(this.mapEditorCreationPromiseToEditor[position]).length > 0) {
                return winjs_base_1.TPromise.as(null);
            }
            // Prevent bad UI issues by ignoring openEditor() calls while the user is dragging an editor
            if (this.sideBySideControl.isDragging()) {
                return winjs_base_1.TPromise.as(null);
            }
            // Emit early open event to allow for veto
            var event = new events_2.EditorEvent(this.visibleEditors[position], this.visibleEditors[position] && this.visibleEditors[position].getId(), input, options, position);
            this.emit(events_2.EventType.EDITOR_INPUT_OPENING, event);
            if (event.isPrevented()) {
                return winjs_base_1.TPromise.as(null);
            }
            // Do ref counting of this method
            this.editorOpenToken[position]++;
            var editorOpenToken = this.editorOpenToken[position];
            // Log side by side use
            if (input && position !== editor_2.Position.LEFT) {
                this.telemetryService.publicLog('workbenchSideEditorOpened', { position: position });
            }
            // Determine options if the editor opens to the side by looking at same input already opened
            if (input && position !== editor_2.Position.LEFT) {
                options = this.findSideOptions(input, options, position);
            }
            // Remember as visible input for this position
            this.visibleInputs[position] = input;
            // Dispose previous input listener if any
            if (this.visibleInputListeners[position]) {
                this.visibleInputListeners[position]();
                this.visibleInputListeners[position] = null;
            }
            // Close editor when input provided and input gets disposed
            if (input) {
                this.visibleInputListeners[position] = input.addListener(events_1.EventType.DISPOSE, function () {
                    // Keep the inputs to close. We use this to support multiple inputs closing
                    // right after each other and this helps avoid layout issues with the delayed
                    // timeout based closing below
                    if (input === _this.visibleInputs[position]) {
                        _this.pendingEditorInputsToClose.push(input);
                        _this.startDelayedCloseEditorsFromInputDispose();
                    }
                });
            }
            // Close any opened editor at position if input is null
            if (input === null) {
                if (this.visibleEditors[position]) {
                    // Reset counter
                    this.editorSetInputErrorCounter[position] = 0;
                    // Emit Input-Changing Event
                    this.emit(events_2.EventType.EDITOR_INPUT_CHANGING, new events_2.EditorEvent(null, null, null, null, position));
                    // Hide Editor
                    return this.hideEditor(this.visibleEditors[position], position, true).then(function () {
                        // Emit Input-Changed Event
                        _this.emit(events_2.EventType.EDITOR_INPUT_CHANGED, new events_2.EditorEvent(null, null, null, null, position));
                        // Focus next editor if there is still an active one left
                        var currentActiveEditor = _this.sideBySideControl.getActiveEditor();
                        if (currentActiveEditor) {
                            return _this.openEditor(currentActiveEditor.input, null, currentActiveEditor.position).then(function () {
                                // Explicitly trigger the focus changed handler because the side by side control will not trigger it unless
                                // the user is actively changing focus with the mouse from left to right.
                                _this.onEditorFocusChanged();
                                return currentActiveEditor;
                            });
                        }
                        return winjs_base_1.TPromise.as(null);
                    });
                }
                return winjs_base_1.TPromise.as(null);
            }
            // Lookup Editor and Assert
            var editorDescriptor = platform_1.Registry.as(baseEditor_1.Extensions.Editors).getEditor(input);
            assert.ok(editorDescriptor, strings.format('Can not find a registered editor for the input {0}', input));
            // Progress Indication
            var loadingPromise = winjs_base_1.TPromise.timeout(this.partService.isCreated() ? 800 : 3200 /* less ugly initial startup */).then(function () {
                if (editorOpenToken === _this.editorOpenToken[position]) {
                    _this.sideBySideControl.getProgressBar(position).infinite().getContainer().show();
                    _this.sideBySideControl.setLoading(position, input);
                }
            });
            // Handle Active Editor showing
            var activeEditorHidePromise;
            if (this.visibleEditors[position]) {
                // Editor can handle Input
                if (editorDescriptor.describes(this.visibleEditors[position])) {
                    // If the editor is currently being created, join this process to avoid issues
                    var pendingEditorCreationPromise = this.mapEditorCreationPromiseToEditor[position][editorDescriptor.getId()];
                    if (!pendingEditorCreationPromise) {
                        pendingEditorCreationPromise = winjs_base_1.TPromise.as(null);
                    }
                    return pendingEditorCreationPromise.then(function () {
                        return _this.setInput(_this.visibleEditors[position], input, options, position, loadingPromise);
                    });
                }
                // Editor can not handle Input (Close this Editor)
                activeEditorHidePromise = this.hideEditor(this.visibleEditors[position], position, false);
            }
            else {
                activeEditorHidePromise = winjs_base_1.TPromise.as(null);
            }
            return activeEditorHidePromise.then(function () {
                var timerEvent = timer.start(timer.Topic.WORKBENCH, strings.format('Creating Editor: {0}', editorDescriptor.getName()));
                // We need the container for this editor now
                var editorContainer = _this.mapEditorToEditorContainers[position][editorDescriptor.getId()];
                var newlyCreatedEditorContainerBuilder;
                if (!editorContainer) {
                    // Build Container off-DOM
                    editorContainer = builder_1.$().div({
                        'class': 'editor-container',
                        id: editorDescriptor.getId()
                    }, function (div) {
                        newlyCreatedEditorContainerBuilder = div;
                    });
                    // Remember editor container
                    _this.mapEditorToEditorContainers[position][editorDescriptor.getId()] = editorContainer;
                }
                // Create or get editor from cache
                var editor = _this.getEditorFromCache(editorDescriptor, position);
                var loadOrGetEditorPromise;
                if (editor === null) {
                    // Check if loading is pending from another openEditor
                    var pendingEditorLoad = _this.mapEditorLoadingPromiseToEditor[position][editorDescriptor.getId()];
                    if (pendingEditorLoad) {
                        loadOrGetEditorPromise = pendingEditorLoad;
                    }
                    else {
                        var loaded_1 = false;
                        loadOrGetEditorPromise = _this.createEditor(editorDescriptor, newlyCreatedEditorContainerBuilder.getHTMLElement(), position).then(function (editor) {
                            loaded_1 = true;
                            _this.instantiatedEditors[position].push(editor);
                            delete _this.mapEditorLoadingPromiseToEditor[position][editorDescriptor.getId()];
                            return editor;
                        }, function (error) {
                            loaded_1 = true;
                            delete _this.mapEditorLoadingPromiseToEditor[position][editorDescriptor.getId()];
                            return winjs_base_1.TPromise.wrapError(error);
                        });
                        if (!loaded_1) {
                            _this.mapEditorLoadingPromiseToEditor[position][editorDescriptor.getId()] = loadOrGetEditorPromise;
                        }
                    }
                }
                else {
                    loadOrGetEditorPromise = winjs_base_1.TPromise.as(editor);
                }
                return loadOrGetEditorPromise.then(function (editor) {
                    // Make sure that the user meanwhile did not open another editor
                    if (editorOpenToken !== _this.editorOpenToken[position]) {
                        timerEvent.stop();
                        // Stop loading promise if any
                        loadingPromise.cancel();
                        return null;
                    }
                    // Remember Editor at position
                    _this.visibleEditors[position] = editor;
                    // Register as Emitter to Workbench Bus
                    _this.visibleEditorListeners[position].push(_this.eventService.addEmitter(_this.visibleEditors[position], _this.visibleEditors[position].getId()));
                    var createEditorPromise;
                    if (newlyCreatedEditorContainerBuilder) {
                        // create editor
                        var created_1 = false;
                        createEditorPromise = editor.create(newlyCreatedEditorContainerBuilder).then(function () {
                            created_1 = true;
                            delete _this.mapEditorCreationPromiseToEditor[position][editorDescriptor.getId()];
                        }, function (error) {
                            created_1 = true;
                            delete _this.mapEditorCreationPromiseToEditor[position][editorDescriptor.getId()];
                            return winjs_base_1.TPromise.wrapError(error);
                        });
                        if (!created_1) {
                            _this.mapEditorCreationPromiseToEditor[position][editorDescriptor.getId()] = createEditorPromise;
                        }
                    }
                    else {
                        // Check if create is pending from another openEditor
                        var pendingEditorCreate = _this.mapEditorCreationPromiseToEditor[position][editorDescriptor.getId()];
                        if (pendingEditorCreate) {
                            createEditorPromise = pendingEditorCreate;
                        }
                        else {
                            createEditorPromise = winjs_base_1.TPromise.as(null);
                        }
                    }
                    // Fill Content and Actions
                    return createEditorPromise.then(function () {
                        // Make sure that the user meanwhile did not open another editor
                        if (!_this.visibleEditors[position] || editor.getId() !== _this.visibleEditors[position].getId()) {
                            timerEvent.stop();
                            // Stop loading promise if any
                            loadingPromise.cancel();
                            return null;
                        }
                        // Show in side by side control
                        _this.sideBySideControl.show(editor, editorContainer, position, options && options.preserveFocus, widthRatios);
                        // Indicate to editor that it is now visible
                        return editor.setVisible(true, position).then(function () {
                            // Make sure the editor is layed out
                            _this.sideBySideControl.layout(position);
                            // Emit Editor-Opened Event
                            _this.emit(events_2.EventType.EDITOR_OPENED, new events_2.EditorEvent(editor, editor.getId(), input, options, position));
                            timerEvent.stop();
                            // Set Input
                            return _this.setInput(editor, input, options, position, loadingPromise);
                        });
                    }, function (e) { return _this.showError(e); });
                });
            });
        };
        EditorPart.prototype.startDelayedCloseEditorsFromInputDispose = function () {
            var _this = this;
            // To prevent race conditions, we call the close in a timeout because it can well be
            // that an input is being disposed with the intent to replace it with some other input
            // right after.
            if (this.pendingEditorInputCloseTimeout === null) {
                this.pendingEditorInputCloseTimeout = setTimeout(function () {
                    _this.closeEditors(false, _this.pendingEditorInputsToClose).done(null, errors.onUnexpectedError);
                    // Reset
                    _this.pendingEditorInputCloseTimeout = null;
                    _this.pendingEditorInputsToClose = [];
                }, 0);
            }
        };
        EditorPart.prototype.closeEditors = function (othersOnly, inputs) {
            var promises = [];
            var editors = this.getVisibleEditors().reverse(); // start from the end to prevent layout to happen through rochade
            for (var i = 0; i < editors.length; i++) {
                var editor = editors[i];
                if (othersOnly && this.getActiveEditor() === editor) {
                    continue;
                }
                if (!inputs || inputs.some(function (inp) { return inp === editor.input; })) {
                    promises.push(this.openEditor(null, null, editor.position));
                }
            }
            return winjs_base_1.TPromise.join(promises).then(function () { return void 0; });
        };
        EditorPart.prototype.findPosition = function (arg1, widthRatios) {
            // With defined width ratios, always trust the provided position
            if (widthRatios && types.isNumber(arg1)) {
                return arg1;
            }
            // No editor open
            var visibleEditors = this.getVisibleEditors();
            var activeEditor = this.getActiveEditor();
            if (visibleEditors.length === 0 || !activeEditor) {
                return editor_2.Position.LEFT; // can only be LEFT
            }
            // Position is unknown: pick last active or LEFT
            if (types.isUndefinedOrNull(arg1) || arg1 === false) {
                var lastActivePosition = this.sideBySideControl.getActivePosition();
                return lastActivePosition || editor_2.Position.LEFT;
            }
            // Position is sideBySide: Find position relative to active editor
            if (arg1 === true) {
                switch (activeEditor.position) {
                    case editor_2.Position.LEFT:
                        return editor_2.Position.CENTER;
                    case editor_2.Position.CENTER:
                        return editor_2.Position.RIGHT;
                    case editor_2.Position.RIGHT:
                        return null; // Cannot open to the side of the right most editor
                }
                return null; // Prevent opening to the side
            }
            // Position is provided, validate it
            if (arg1 === editor_2.Position.RIGHT && visibleEditors.length === 1) {
                return editor_2.Position.CENTER;
            }
            return arg1;
        };
        EditorPart.prototype.findSideOptions = function (input, options, position) {
            // Return early if the input is already showing at the position
            if (this.visibleEditors[position] && input.matches(this.visibleEditors[position].input)) {
                return options;
            }
            // Return early if explicit text options are defined
            if (options instanceof editor_1.TextEditorOptions && options.hasOptionsDefined()) {
                return options;
            }
            // Otherwise try to copy viewstate over from an existing opened editor with same input
            var viewState = null;
            var editors = this.getVisibleEditors();
            for (var i = 0; i < editors.length; i++) {
                var editor = editors[i];
                if (!(editor instanceof textEditor_1.BaseTextEditor)) {
                    continue; // Only works with text editors
                }
                // Found a match
                if (input.matches(editor.input)) {
                    var codeEditor = editor.getControl();
                    viewState = codeEditor.saveViewState();
                    break;
                }
            }
            // Found view state
            if (viewState) {
                var textEditorOptions = null;
                // Merge into existing text editor options if given
                if (options instanceof editor_1.TextEditorOptions) {
                    textEditorOptions = options;
                    textEditorOptions.viewState(viewState);
                    return textEditorOptions;
                }
                // Otherwise create new
                textEditorOptions = new editor_1.TextEditorOptions();
                textEditorOptions.viewState(viewState);
                if (options) {
                    textEditorOptions.forceOpen = options.forceOpen;
                    textEditorOptions.preserveFocus = options.preserveFocus;
                }
                return textEditorOptions;
            }
            return options;
        };
        EditorPart.prototype.rochade = function (arg1, arg2) {
            if (types.isUndefinedOrNull(arg2)) {
                var rochade = arg1;
                switch (rochade) {
                    case sideBySideEditorControl_1.Rochade.CENTER_TO_LEFT:
                        this.rochade(editor_2.Position.CENTER, editor_2.Position.LEFT);
                        break;
                    case sideBySideEditorControl_1.Rochade.RIGHT_TO_CENTER:
                        this.rochade(editor_2.Position.RIGHT, editor_2.Position.CENTER);
                        break;
                    case sideBySideEditorControl_1.Rochade.CENTER_AND_RIGHT_TO_LEFT:
                        this.rochade(editor_2.Position.CENTER, editor_2.Position.LEFT);
                        this.rochade(editor_2.Position.RIGHT, editor_2.Position.CENTER);
                        break;
                }
            }
            else {
                var from = arg1;
                var to = arg2;
                this.doRochade(this.visibleInputs, from, to, null);
                this.doRochade(this.visibleInputListeners, from, to, null);
                this.doRochade(this.visibleEditors, from, to, null);
                this.doRochade(this.editorOpenToken, from, to, null);
                this.doRochade(this.mapEditorLoadingPromiseToEditor, from, to, {});
                this.doRochade(this.mapEditorCreationPromiseToEditor, from, to, {});
                this.doRochade(this.visibleEditorListeners, from, to, []);
                this.doRochade(this.instantiatedEditors, from, to, []);
                this.doRochade(this.mapEditorToEditorContainers, from, to, {});
                this.doRochade(this.mapActionsToEditors, from, to, {});
            }
        };
        EditorPart.prototype.doRochade = function (array, from, to, empty) {
            array[to] = array[from];
            array[from] = empty;
        };
        EditorPart.prototype.moveEditor = function (from, to) {
            if (!this.visibleEditors[from] || !this.visibleEditors[to] || from === to) {
                return; // Ignore if we cannot move
            }
            // Move widgets
            this.sideBySideControl.move(from, to);
            // Move data structures
            arrays.move(this.visibleInputs, from, to);
            arrays.move(this.visibleInputListeners, from, to);
            arrays.move(this.visibleEditors, from, to);
            arrays.move(this.visibleEditorListeners, from, to);
            arrays.move(this.editorOpenToken, from, to);
            arrays.move(this.mapEditorLoadingPromiseToEditor, from, to);
            arrays.move(this.mapEditorCreationPromiseToEditor, from, to);
            arrays.move(this.instantiatedEditors, from, to);
            arrays.move(this.mapEditorToEditorContainers, from, to);
            arrays.move(this.mapActionsToEditors, from, to);
            // Update all title areas
            this.updateEditorTitleArea();
            // Restore focus
            var activeEditor = this.sideBySideControl.getActiveEditor();
            this.openEditor(activeEditor.input, null, activeEditor.position).done(null, errors.onUnexpectedError);
        };
        EditorPart.prototype.arrangeEditors = function (arrangement) {
            this.sideBySideControl.arrangeEditors(arrangement);
        };
        EditorPart.prototype.setInput = function (editor, input, options, position, loadingPromise) {
            var _this = this;
            // Emit Input-/Options-Changed Event as appropiate
            var oldInput = editor.getInput();
            var oldOptions = editor.getOptions();
            var inputChanged = (!oldInput || !oldInput.matches(input) || (options && options.forceOpen));
            if (inputChanged) {
                this.emit(events_2.EventType.EDITOR_INPUT_CHANGING, new events_2.EditorEvent(editor, editor.getId(), input, options, position));
            }
            else if (!oldOptions || !oldOptions.matches(options)) {
                this.emit(events_2.EventType.EDITOR_OPTIONS_CHANGING, new events_2.EditorEvent(editor, editor.getId(), input, options, position));
            }
            // Call into Editor
            var timerEvent = timer.start(timer.Topic.WORKBENCH, strings.format('Set Editor Input: {0}', input.getName()));
            return editor.setInput(input, options).then(function () {
                // Reset counter
                _this.editorSetInputErrorCounter[position] = 0;
                // Stop loading promise if any
                loadingPromise.cancel();
                // Make sure that the user meanwhile has not opened another input
                if (_this.visibleInputs[position] !== input) {
                    timerEvent.stop();
                    // It can happen that the same editor input is being opened rapidly one after the other
                    // (e.g. fast double click on a file). In this case the first open will stop here because
                    // we detect that a second open happens. However, since the input is the same, inputChanged
                    // is false and we are not doing some things that we typically do when opening a file because
                    // we think, the input has not changed.
                    // The fix is to detect if the active input matches with this one that gets canceled and only
                    // in that case notify others about the input change event as well as to make sure that the
                    // editor title area is up to date.
                    if (_this.visibleInputs[position] && _this.visibleInputs[position].matches(input)) {
                        _this.updateEditorTitleArea();
                        _this.emit(events_2.EventType.EDITOR_INPUT_CHANGED, new events_2.EditorEvent(editor, editor.getId(), _this.visibleInputs[position], options, position));
                    }
                    return editor;
                }
                // Focus (unless prevented)
                if (!options || !options.preserveFocus) {
                    editor.focus();
                }
                else if (options && options.forceActive) {
                    _this.sideBySideControl.setActive(editor);
                }
                // Progress Done
                _this.sideBySideControl.getProgressBar(position).done().getContainer().hide();
                // Update Title Area if input changed
                if (inputChanged) {
                    _this.updateEditorTitleArea();
                }
                // Emit Input-Changed Event (if input changed)
                if (inputChanged) {
                    _this.emit(events_2.EventType.EDITOR_INPUT_CHANGED, new events_2.EditorEvent(editor, editor.getId(), input, options, position));
                }
                timerEvent.stop();
                // Fullfill promise with Editor that is being used
                return editor;
            }, function (e) {
                // Keep counter
                _this.editorSetInputErrorCounter[position]++;
                // Stop loading promise if any
                loadingPromise.cancel();
                // Report error
                _this.onSetInputError(e, editor, input, options, position);
                // Recover from this error by closing the editor if the attempt of setInput failed and we are not having any previous input
                if (!oldInput && _this.visibleInputs[position] === input && input) {
                    _this.openEditor(null, null, position).done(null, errors.onUnexpectedError);
                }
                else if (_this.editorSetInputErrorCounter[position] > 1) {
                    _this.openEditor(null, null, position).done(null, errors.onUnexpectedError);
                }
                else if (oldInput) {
                    _this.openEditor(oldInput, null, position).done(null, errors.onUnexpectedError);
                }
            });
        };
        EditorPart.prototype.getEditorFromCache = function (editorDescriptor, position) {
            // Check for existing instantiated editor
            for (var i = 0; i < this.instantiatedEditors[position].length; i++) {
                if (editorDescriptor.describes(this.instantiatedEditors[position][i])) {
                    return this.instantiatedEditors[position][i];
                }
            }
            return null;
        };
        EditorPart.prototype.createEditor = function (editorDescriptor, editorDomNode, position) {
            var services = {
                progressService: new progressService_1.WorkbenchProgressService(this.eventService, this.sideBySideControl.getProgressBar(position), editorDescriptor.getId(), true)
            };
            var editorInstantiationService = this.instantiationService.createChild(services);
            return editorInstantiationService.createInstance(editorDescriptor);
        };
        EditorPart.prototype.hideEditor = function (editor, position, layoutAndRochade) {
            var _this = this;
            var editorContainer = this.mapEditorToEditorContainers[position][editor.getId()];
            // Hide in side by side control
            var rochade = this.sideBySideControl.hide(editor, editorContainer, position, layoutAndRochade);
            // Clear any running Progress
            this.sideBySideControl.getProgressBar(position).stop().getContainer().hide();
            // Clear Listeners
            while (this.visibleEditorListeners[position].length) {
                this.visibleEditorListeners[position].pop()();
            }
            // Indicate to Editor
            editor.clearInput();
            return editor.setVisible(false).then(function () {
                // Clear active editor
                _this.visibleEditors[position] = null;
                // Rochade as needed
                _this.rochade(rochade);
                // Clear Title Area for Position
                _this.sideBySideControl.clearTitle(position);
                // Emit Editor Closed Event
                _this.emit(events_2.EventType.EDITOR_CLOSED, new events_2.EditorEvent(editor, editor.getId(), null, null, position));
                return editor;
            });
        };
        EditorPart.prototype.updateEditorTitleArea = function () {
            var activePosition = this.sideBySideControl.getActivePosition();
            // Update each position individually
            for (var i = 0; i < editor_2.POSITIONS.length; i++) {
                var editor = this.visibleEditors[i];
                var input = editor ? editor.input : null;
                if (input && editor) {
                    this.doUpdateEditorTitleArea(editor, input, i, activePosition === i);
                }
            }
        };
        EditorPart.prototype.doUpdateEditorTitleArea = function (editor, input, position, isActive) {
            var primaryActions = [];
            var secondaryActions = [];
            // Handle toolbar only if side is active
            if (isActive) {
                // Handle Editor Actions
                var editorActions = this.mapActionsToEditors[position][editor.getId()];
                if (!editorActions) {
                    editorActions = this.getEditorActionsForContext(editor, editor, position);
                    this.mapActionsToEditors[position][editor.getId()] = editorActions;
                }
                primaryActions.push.apply(primaryActions, editorActions.primary);
                secondaryActions.push.apply(secondaryActions, editorActions.secondary);
                // Handle Editor Input Actions
                var editorInputActions = this.getEditorActionsForContext({ input: input, editor: editor, position: position }, editor, position);
                primaryActions.push.apply(primaryActions, editorInputActions.primary);
                secondaryActions.push.apply(secondaryActions, editorInputActions.secondary);
            }
            // Apply to title in side by side control
            this.sideBySideControl.setTitle(position, input, actionBarRegistry_1.prepareActions(primaryActions), actionBarRegistry_1.prepareActions(secondaryActions), isActive);
        };
        EditorPart.prototype.getEditorActionsForContext = function (context, editor, position) {
            var primaryActions = [];
            var secondaryActions = [];
            // From Editor
            if (context instanceof baseEditor_1.BaseEditor) {
                primaryActions.push.apply(primaryActions, context.getActions());
                secondaryActions.push.apply(secondaryActions, context.getSecondaryActions());
            }
            // From Contributions
            var actionBarRegistry = platform_1.Registry.as(actionBarRegistry_1.Extensions.Actionbar);
            primaryActions.push.apply(primaryActions, actionBarRegistry.getActionBarActionsForContext(actionBarRegistry_1.Scope.EDITOR, context));
            secondaryActions.push.apply(secondaryActions, actionBarRegistry.getSecondaryActionBarActionsForContext(actionBarRegistry_1.Scope.EDITOR, context));
            return {
                primary: primaryActions,
                secondary: secondaryActions
            };
        };
        EditorPart.prototype.createContentArea = function (parent) {
            var _this = this;
            // Content Container
            var contentArea = builder_1.$(parent)
                .div()
                .addClass('content');
            // Side by Side Control
            this.sideBySideControl = this.instantiationService.createInstance(sideBySideEditorControl_1.SideBySideEditorControl, contentArea);
            this.toUnbind.push(this.sideBySideControl.addListener(sideBySideEditorControl_1.EventType.EDITOR_FOCUS_CHANGED, function () { _this.onEditorFocusChanged(); }));
            // get settings
            this.memento = this.getMemento(this.storageService, memento_1.Scope.WORKSPACE);
            return contentArea;
        };
        EditorPart.prototype.restoreEditorState = function (inputsToOpen, options) {
            var _this = this;
            var activeInput;
            var inputsToRestore;
            var widthRatios;
            // Inputs are given, so just use them
            if (inputsToOpen && inputsToOpen.length) {
                if (inputsToOpen.length > 3) {
                    inputsToOpen = inputsToOpen.slice(inputsToOpen.length - 3); // make sure to reduce the array to the last 3 elements if n > 3
                }
                inputsToRestore = inputsToOpen;
                widthRatios = (inputsToRestore.length === 3) ? [0.33, 0.33, 0.34] : (inputsToRestore.length === 2) ? [0.5, 0.5] : [1];
            }
            else if (this.memento[EDITOR_STATE_STORAGE_KEY]) {
                var editorState = this.memento[EDITOR_STATE_STORAGE_KEY];
                if (editorState && editorState.editors) {
                    // Find inputs to restore
                    var registry = platform_1.Registry.as(baseEditor_1.Extensions.Editors);
                    var inputs = [];
                    widthRatios = editorState.widthRatio;
                    for (var i = 0; i < editorState.editors.length; i++) {
                        var state = editorState.editors[i];
                        var factory = registry.getEditorInputFactory(state.inputId);
                        if (factory && types.isString(state.inputValue)) {
                            var input = factory.deserialize(this.instantiationService, state.inputValue);
                            if (input) {
                                if (state.hasFocus) {
                                    activeInput = input;
                                }
                                inputs.push(input);
                            }
                        }
                    }
                    if (inputs.length) {
                        inputsToRestore = inputs;
                    }
                }
            }
            // Do the restore
            if (inputsToRestore && inputsToRestore.length) {
                // Pick first input if we didnt find any active input from memento
                if (!activeInput && inputsToRestore.length) {
                    activeInput = inputsToRestore[0];
                }
                // Reset width ratios if they dont match with the number of editors to restore
                if (widthRatios && widthRatios.length !== inputsToRestore.length) {
                    widthRatios = inputsToRestore.length === 2 ? [0.5, 0.5] : null;
                }
                // Open editor inputs in parallel if any
                var promises_1 = [];
                inputsToRestore.forEach(function (input, index) {
                    var preserveFocus = (input !== activeInput);
                    var option;
                    if (options && options[index]) {
                        option = options[index];
                        option.preserveFocus = preserveFocus;
                    }
                    else {
                        option = editor_1.EditorOptions.create({ preserveFocus: preserveFocus });
                    }
                    promises_1.push(_this.openEditor(input, option, index, widthRatios));
                });
                return winjs_base_1.TPromise.join(promises_1).then(function (editors) {
                    // Workaround for bad layout issue: If any of the editors fails to load, reset side by side by closing
                    // all editors. This fixes an issue where a side editor might show, but no editor to the left hand side.
                    if (_this.getVisibleEditors().length !== inputsToRestore.length) {
                        _this.closeEditors().done(null, errors.onUnexpectedError);
                    }
                    // Full layout side by side
                    _this.sideBySideControl.layout(_this.dimension);
                    return editors;
                });
            }
            return winjs_base_1.TPromise.as([]);
        };
        EditorPart.prototype.activateEditor = function (editor) {
            if (editor) {
                this.sideBySideControl.setActive(editor);
            }
        };
        EditorPart.prototype.onEditorFocusChanged = function () {
            // Emit as editor input change event so that clients get aware of new active editor
            var activeEditor = this.sideBySideControl.getActiveEditor();
            if (activeEditor) {
                this.emit(events_2.EventType.EDITOR_INPUT_CHANGING, new events_2.EditorEvent(activeEditor, activeEditor.getId(), activeEditor.input, null, activeEditor.position));
                this.emit(events_2.EventType.EDITOR_INPUT_CHANGED, new events_2.EditorEvent(activeEditor, activeEditor.getId(), activeEditor.input, null, activeEditor.position));
            }
            // Update Title Area
            this.updateEditorTitleArea();
        };
        EditorPart.prototype.layout = function (dimension) {
            // Pass to super
            var sizes = _super.prototype.layout.call(this, dimension);
            // Pass to Side by Side Control
            this.dimension = sizes[1];
            this.sideBySideControl.layout(this.dimension);
            return sizes;
        };
        EditorPart.prototype.onSetInputError = function (e, editor, input, options, position) {
            // only show an error if this was not us restoring previous error state
            if (this.partService.isCreated() && !errors.isPromiseCanceledError(e)) {
                var errorMessage = nls.localize('editorOpenError', "Unable to open '{0}': {1}.", input.getName(), errors.toErrorMessage(e));
                var error = void 0;
                if (e && e.actions && e.actions.length) {
                    error = errors.create(errorMessage, { actions: e.actions }); // Support error actions from thrower
                }
                else {
                    error = errorMessage;
                }
                this.showError(error);
            }
            this.sideBySideControl.getProgressBar(position).done().getContainer().hide();
            this.emit(events_2.EventType.EDITOR_SET_INPUT_ERROR, new events_2.EditorEvent(editor, editor.getId(), input, options, position));
        };
        EditorPart.prototype.showError = function (e) {
            return this.messageService.show(message_1.Severity.Error, types.isString(e) ? new Error(e) : e);
        };
        EditorPart.prototype.shutdown = function () {
            // Persist Editor State
            this.saveEditorState();
            // Unload all Instantiated Editors
            for (var i = 0; i < this.instantiatedEditors.length; i++) {
                for (var j = 0; j < this.instantiatedEditors[i].length; j++) {
                    this.instantiatedEditors[i][j].shutdown();
                }
            }
            // Pass to super
            _super.prototype.shutdown.call(this);
        };
        EditorPart.prototype.saveEditorState = function () {
            var registry = platform_1.Registry.as(baseEditor_1.Extensions.Editors);
            var editors = this.getVisibleEditors();
            var activeEditor = this.getActiveEditor();
            var widthRatios = this.sideBySideControl.getWidthRatios();
            var editorState = { editors: [], widthRatio: widthRatios };
            this.memento[EDITOR_STATE_STORAGE_KEY] = editorState;
            // For each visible editor
            for (var i = 0; i < editors.length; i++) {
                var editor = editors[i];
                var input = editor.input;
                // Serialize through factory
                if (input) {
                    var factory = registry.getEditorInputFactory(input.getId());
                    if (factory) {
                        var serialized = factory.serialize(input);
                        editorState.editors.push({
                            inputId: input.getId(),
                            inputValue: serialized,
                            hasFocus: activeEditor === editor
                        });
                    }
                }
            }
        };
        EditorPart.prototype.dispose = function () {
            var _this = this;
            this.mapEditorToEditorContainers = null;
            this.mapActionsToEditors = null;
            // Reset Tokens
            this.editorOpenToken = [];
            for (var i_1 = 0; i_1 < editor_2.POSITIONS.length; i_1++) {
                this.editorOpenToken[i_1] = 0;
            }
            // Widgets
            this.sideBySideControl.dispose();
            // Editor listeners
            for (var i_2 = 0; i_2 < this.visibleEditorListeners.length; i_2++) {
                while (this.visibleEditorListeners[i_2].length) {
                    this.visibleEditorListeners[i_2].pop()();
                }
            }
            // Input listeners
            for (var i_3 = 0; i_3 < this.visibleInputListeners.length; i_3++) {
                var listener = this.visibleInputListeners[i_3];
                if (listener) {
                    listener();
                }
                this.visibleInputListeners = [];
            }
            // Pass to active editors
            this.visibleEditors.forEach(function (editor) {
                if (editor) {
                    editor.dispose();
                }
            });
            // Pass to instantiated editors
            for (var i = 0; i < this.instantiatedEditors.length; i++) {
                for (var j = 0; j < this.instantiatedEditors[i].length; j++) {
                    if (this.visibleEditors.some(function (editor) { return editor === _this.instantiatedEditors[i][j]; })) {
                        continue;
                    }
                    this.instantiatedEditors[i][j].dispose();
                }
            }
            this.visibleEditors = null;
            this.visibleInputs = null;
            // Pass to super
            _super.prototype.dispose.call(this);
        };
        return EditorPart;
    }(part_1.Part));
    exports.EditorPart = EditorPart;
});
//# sourceMappingURL=editorPart.js.map