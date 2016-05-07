var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/errors', 'vs/base/common/platform', 'vs/nls', 'vs/base/common/events', 'vs/workbench/common/editor', 'vs/workbench/browser/parts/editor/textEditor', 'vs/workbench/common/events', 'vs/workbench/services/history/common/history', 'vs/editor/common/core/selection'], function (require, exports, errors, platform, nls, events_1, editor_1, textEditor_1, events_2, history_1, selection_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /**
     * Stores the selection & view state of an editor and allows to compare it to other selection states.
     */
    var EditorState = (function () {
        function EditorState(_editorInput, _selection) {
            this._editorInput = _editorInput;
            this._selection = _selection;
            //
        }
        Object.defineProperty(EditorState.prototype, "editorInput", {
            get: function () {
                return this._editorInput;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EditorState.prototype, "selection", {
            get: function () {
                return this._selection;
            },
            enumerable: true,
            configurable: true
        });
        EditorState.prototype.justifiesNewPushState = function (other) {
            if (!this._editorInput.matches(other._editorInput)) {
                // push different editor inputs
                return true;
            }
            if (!selection_1.Selection.isISelection(this._selection) || !selection_1.Selection.isISelection(other._selection)) {
                // unknown selections
                return true;
            }
            var liftedSelection = selection_1.Selection.liftSelection(this._selection);
            var liftedOtherSelection = selection_1.Selection.liftSelection(other._selection);
            if (Math.abs(liftedSelection.getStartPosition().lineNumber - liftedOtherSelection.getStartPosition().lineNumber) < EditorState.EDITOR_SELECTION_THRESHOLD) {
                // ignore selection changes in the range of EditorState.EDITOR_SELECTION_THRESHOLD lines
                return false;
            }
            return true;
        };
        EditorState.EDITOR_SELECTION_THRESHOLD = 5; // number of lines to move in editor to justify for new state
        return EditorState;
    }());
    exports.EditorState = EditorState;
    var BaseHistoryService = (function () {
        function BaseHistoryService(eventService, editorService, contextService) {
            var _this = this;
            this.eventService = eventService;
            this.editorService = editorService;
            this.contextService = contextService;
            this.toUnbind = [];
            // Window Title
            window.document.title = this.getWindowTitle(null);
            // Editor Input Changes
            this.toUnbind.push(this.eventService.addListener(events_2.EventType.EDITOR_INPUT_CHANGED, function (e) { return _this.onEditorInputChanged(e); }));
            // Editor Input State Changes
            this.toUnbind.push(this.eventService.addListener(events_2.EventType.EDITOR_INPUT_STATE_CHANGED, function (e) { return _this.onEditorInputStateChanged(e.editorInput); }));
            // Text Editor Selection Changes
            this.toUnbind.push(this.eventService.addListener(events_2.EventType.TEXT_EDITOR_SELECTION_CHANGED, function (event) { return _this.onTextEditorSelectionChanged(event); }));
        }
        BaseHistoryService.prototype.onEditorInputStateChanged = function (input) {
            // If an active editor is set, but is different from the one from the event, prevent update because the editor is not active.
            var activeEditor = this.editorService.getActiveEditor();
            if (activeEditor && !input.matches(activeEditor.input)) {
                return;
            }
            // Calculate New Window Title
            this.updateWindowTitle(input);
        };
        BaseHistoryService.prototype.onTextEditorSelectionChanged = function (event) {
            // If an active editor is set, but is different from the one from the event, prevent update because the editor is not active.
            var editor = event.editor;
            var activeEditor = this.editorService.getActiveEditor();
            if (activeEditor && editor && activeEditor !== editor) {
                return;
            }
            // Delegate to implementors
            this.handleEditorSelectionChangeEvent(event.editor);
        };
        BaseHistoryService.prototype.onEditorInputChanged = function (event) {
            this.onEditorEvent(event.editor);
        };
        BaseHistoryService.prototype.onEditorEvent = function (editor) {
            var input = editor ? editor.input : null;
            // If an active editor is set, but is different from the one from the event, prevent update because the editor is not active.
            var activeEditor = this.editorService.getActiveEditor();
            if (activeEditor && editor && activeEditor !== editor) {
                return;
            }
            // Calculate New Window Title
            this.updateWindowTitle(input);
            // Delegate to implementors
            this.handleEditorInputChangeEvent(editor);
        };
        BaseHistoryService.prototype.updateWindowTitle = function (input) {
            var windowTitle = null;
            if (input && input.getName()) {
                windowTitle = this.getWindowTitle(input);
            }
            else {
                windowTitle = this.getWindowTitle(null);
            }
            window.document.title = windowTitle;
        };
        BaseHistoryService.prototype.getWindowTitle = function (input) {
            var title = this.doGetWindowTitle(input);
            // Extension Development Host gets a special title to identify itself
            if (this.contextService.getConfiguration().env.extensionDevelopmentPath) {
                return nls.localize('devExtensionWindowTitle', "[Extension Development Host] - {0}", title);
            }
            return title;
        };
        BaseHistoryService.prototype.doGetWindowTitle = function (input) {
            var appName = this.contextService.getConfiguration().env.appName;
            var prefix = input && input.getName();
            if (prefix && input) {
                var status_1 = input.getStatus();
                if (status_1 && status_1.decoration && !platform.isMacintosh /* Mac has its own decoration in window */) {
                    prefix = nls.localize('prefixDecoration', "{0} {1}", status_1.decoration, prefix);
                }
            }
            var workspace = this.contextService.getWorkspace();
            if (workspace) {
                var wsName = workspace.name;
                if (prefix) {
                    if (platform.isMacintosh) {
                        return nls.localize('prefixWorkspaceTitleMac', "{0} - {1}", prefix, wsName); // Mac: do not append base title
                    }
                    return nls.localize('prefixWorkspaceTitle', "{0} - {1} - {2}", prefix, wsName, appName);
                }
                if (platform.isMacintosh) {
                    return wsName; // Mac: do not append base title
                }
                return nls.localize('workspaceTitle', "{0} - {1}", wsName, appName);
            }
            if (prefix) {
                if (platform.isMacintosh) {
                    return prefix; // Mac: do not append base title
                }
                return nls.localize('prefixTitle', "{0} - {1}", prefix, appName);
            }
            return appName;
        };
        BaseHistoryService.prototype.findVisibleEditorPosition = function (input) {
            var activeEditor = this.editorService.getActiveEditor();
            if (activeEditor && input.matches(activeEditor.input)) {
                return activeEditor.position;
            }
            var editors = this.editorService.getVisibleEditors();
            for (var i = 0; i < editors.length; i++) {
                var editor = editors[i];
                if (editor !== activeEditor && input.matches(editor.input)) {
                    return editor.position;
                }
            }
            return null;
        };
        BaseHistoryService.prototype.dispose = function () {
            while (this.toUnbind.length) {
                this.toUnbind.pop()();
            }
        };
        return BaseHistoryService;
    }());
    exports.BaseHistoryService = BaseHistoryService;
    var HistoryService = (function (_super) {
        __extends(HistoryService, _super);
        function HistoryService(eventService, editorService, contextService, quickOpenService) {
            _super.call(this, eventService, editorService, contextService);
            this.serviceId = history_1.IHistoryService;
            this.quickOpenService = quickOpenService;
            this.index = -1;
        }
        Object.defineProperty(HistoryService.prototype, "stack", {
            get: function () {
                // Seed our stack from the persisted editor history
                if (!this._stack) {
                    this._stack = [];
                    var history_2 = this.quickOpenService.getEditorHistory();
                    for (var i = history_2.length - 1; i >= 0; i--) {
                        this.addToStack(history_2[i]);
                    }
                }
                return this._stack;
            },
            enumerable: true,
            configurable: true
        });
        HistoryService.prototype.forward = function () {
            if (this.stack.length > this.index + 1) {
                this.index++;
                this.navigate();
            }
        };
        HistoryService.prototype.back = function () {
            if (this.index > 0) {
                this.index--;
                this.navigate();
            }
        };
        HistoryService.prototype.navigate = function () {
            var _this = this;
            var state = this.stack[this.index];
            this.blockEditorEvent = true;
            this.editorService.openEditor(state.input, state.options, this.findVisibleEditorPosition(state.input)).done(function () {
                _this.blockEditorEvent = false;
            }, function (error) {
                _this.blockEditorEvent = false;
                errors.onUnexpectedError(error);
            });
        };
        HistoryService.prototype.handleEditorSelectionChangeEvent = function (editor) {
            this.handleEditorEvent(editor, true);
        };
        HistoryService.prototype.handleEditorInputChangeEvent = function (editor) {
            this.handleEditorEvent(editor, false);
        };
        HistoryService.prototype.handleEditorEvent = function (editor, storeSelection) {
            if (this.blockEditorEvent) {
                return; // while we open an editor due to a navigation, we do not want to update our stack
            }
            if (editor instanceof textEditor_1.BaseTextEditor && editor.input) {
                this.handleTextEditorEvent(editor, storeSelection);
                return;
            }
            this.currentFileEditorState = null; // at this time we have no active file editor view state
            if (editor && editor.input) {
                this.handleNonTextEditorEvent(editor);
            }
        };
        HistoryService.prototype.handleTextEditorEvent = function (editor, storeSelection) {
            var stateCandidate = new EditorState(editor.input, editor.getSelection());
            if (!this.currentFileEditorState || this.currentFileEditorState.justifiesNewPushState(stateCandidate)) {
                this.currentFileEditorState = stateCandidate;
                var options = void 0;
                if (storeSelection) {
                    options = new editor_1.TextEditorOptions();
                    options.selection(editor.getSelection().startLineNumber, editor.getSelection().startColumn);
                }
                this.addToStack(editor.input, options);
            }
        };
        HistoryService.prototype.handleNonTextEditorEvent = function (editor) {
            var currentStack = this.stack[this.index];
            if (currentStack && currentStack.input.matches(editor.input)) {
                return; // do not push same editor input again
            }
            this.addToStack(editor.input);
        };
        HistoryService.prototype.addToStack = function (input, options) {
            var _this = this;
            // Overwrite an entry in the stack if we have a matching input that comes
            // with editor options to indicate that this entry is more specific.
            var replace = false;
            if (this.stack[this.index]) {
                var currentEntry = this.stack[this.index];
                if (currentEntry.input.matches(input) && !currentEntry.options) {
                    replace = true;
                }
            }
            var entry = {
                input: input,
                options: options
            };
            // Replace at current position
            if (replace) {
                this.stack[this.index] = entry;
            }
            else {
                this.index++;
                this.stack.splice(this.index, 0, entry);
                // Check for limit
                if (this.stack.length > HistoryService.MAX_HISTORY_ITEMS) {
                    this.stack.shift(); // remove first
                    if (this.index > 0) {
                        this.index--;
                    }
                }
            }
            // Take out on dispose
            input.addOneTimeListener(events_1.EventType.DISPOSE, function () {
                _this.stack.forEach(function (e, i) {
                    if (e.input.matches(input)) {
                        _this.stack.splice(i, 1);
                        if (_this.index >= i) {
                            _this.index--; // reduce index if the element is before index
                        }
                    }
                });
            });
        };
        HistoryService.MAX_HISTORY_ITEMS = 200;
        return HistoryService;
    }(BaseHistoryService));
    exports.HistoryService = HistoryService;
});
//# sourceMappingURL=history.js.map