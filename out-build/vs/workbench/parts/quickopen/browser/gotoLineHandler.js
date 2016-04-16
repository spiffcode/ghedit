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
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/nls!vs/workbench/parts/quickopen/browser/gotoLineHandler', 'vs/base/common/types', 'vs/base/common/errors', 'vs/base/parts/quickopen/common/quickOpen', 'vs/base/parts/quickopen/browser/quickOpenModel', 'vs/workbench/browser/quickopen', 'vs/workbench/browser/actions/quickOpenAction', 'vs/workbench/common/editor', 'vs/workbench/browser/parts/editor/textEditor', 'vs/editor/common/editorCommon', 'vs/workbench/services/editor/common/editorService', 'vs/workbench/services/quickopen/common/quickOpenService'], function (require, exports, winjs_base_1, nls, types, errors, quickOpen_1, quickOpenModel_1, quickopen_1, quickOpenAction_1, editor_1, textEditor_1, editorCommon_1, editorService_1, quickOpenService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    exports.GOTO_LINE_PREFIX = ':';
    var GotoLineAction = (function (_super) {
        __extends(GotoLineAction, _super);
        function GotoLineAction(actionId, actionLabel, quickOpenService) {
            _super.call(this, actionId, actionLabel, exports.GOTO_LINE_PREFIX, quickOpenService);
        }
        GotoLineAction.ID = 'workbench.action.gotoLine';
        GotoLineAction.LABEL = nls.localize(0, null);
        GotoLineAction = __decorate([
            __param(2, quickOpenService_1.IQuickOpenService)
        ], GotoLineAction);
        return GotoLineAction;
    }(quickOpenAction_1.QuickOpenAction));
    exports.GotoLineAction = GotoLineAction;
    var GotoLineEntry = (function (_super) {
        __extends(GotoLineEntry, _super);
        function GotoLineEntry(line, editorService, handler) {
            _super.call(this, editorService);
            this.parseInput(line);
            this.handler = handler;
        }
        GotoLineEntry.prototype.parseInput = function (line) {
            var numbers = line.split(/,|:|#/).map(function (part) { return parseInt(part, 10); }).filter(function (part) { return !isNaN(part); });
            this.line = numbers[0];
            this.column = numbers[1];
        };
        GotoLineEntry.prototype.getLabel = function () {
            // Inform user about valid range if input is invalid
            var maxLineNumber = this.getMaxLineNumber();
            if (this.invalidRange(maxLineNumber)) {
                if (maxLineNumber > 0) {
                    return nls.localize(1, null, maxLineNumber);
                }
                return nls.localize(2, null);
            }
            // Input valid, indicate action
            return this.column ? nls.localize(3, null, this.line, this.column) : nls.localize(4, null, this.line);
        };
        GotoLineEntry.prototype.invalidRange = function (maxLineNumber) {
            if (maxLineNumber === void 0) { maxLineNumber = this.getMaxLineNumber(); }
            return !this.line || !types.isNumber(this.line) || (maxLineNumber > 0 && types.isNumber(this.line) && this.line > maxLineNumber);
        };
        GotoLineEntry.prototype.getMaxLineNumber = function () {
            var editor = this.editorService.getActiveEditor();
            var editorControl = editor.getControl();
            var model = editorControl.getModel();
            if (model && model.modified && model.original) {
                model = model.modified; // Support for diff editor models
            }
            return model && types.isFunction(model.getLineCount) ? model.getLineCount() : -1;
        };
        GotoLineEntry.prototype.run = function (mode, context) {
            if (mode === quickOpen_1.Mode.OPEN) {
                return this.runOpen(context);
            }
            return this.runPreview();
        };
        GotoLineEntry.prototype.getInput = function () {
            return this.editorService.getActiveEditorInput();
        };
        GotoLineEntry.prototype.getOptions = function () {
            var range = this.toSelection();
            var options = new editor_1.TextEditorOptions();
            options.selection(range.startLineNumber, range.startColumn, range.startLineNumber, range.startColumn);
            return options;
        };
        GotoLineEntry.prototype.runOpen = function (context) {
            // No-op if range is not valid
            if (this.invalidRange()) {
                return false;
            }
            // Check for sideBySide use
            var event = context.event;
            var sideBySide = (event && (event.ctrlKey || event.metaKey || (event.payload && event.payload.originalEvent && (event.payload.originalEvent.ctrlKey || event.payload.originalEvent.metaKey))));
            if (sideBySide) {
                this.editorService.openEditor(this.getInput(), this.getOptions(), true).done(null, errors.onUnexpectedError);
            }
            // Apply selection and focus
            var range = this.toSelection();
            var activeEditor = this.editorService.getActiveEditor();
            if (activeEditor) {
                var editor = activeEditor.getControl();
                editor.setSelection(range);
                editor.revealRangeInCenter(range);
            }
            return true;
        };
        GotoLineEntry.prototype.runPreview = function () {
            // No-op if range is not valid
            if (this.invalidRange()) {
                this.handler.clearDecorations();
                return false;
            }
            // Select Line Position
            var range = this.toSelection();
            var activeEditor = this.editorService.getActiveEditor();
            if (activeEditor) {
                var editorControl = activeEditor.getControl();
                editorControl.revealRangeInCenter(range);
                // Decorate if possible
                if (types.isFunction(editorControl.changeDecorations)) {
                    this.handler.decorateOutline(range, editorControl, activeEditor.position);
                }
            }
            return false;
        };
        GotoLineEntry.prototype.toSelection = function () {
            return {
                startLineNumber: this.line,
                startColumn: this.column || 1,
                endLineNumber: this.line,
                endColumn: this.column || 1
            };
        };
        return GotoLineEntry;
    }(quickopen_1.EditorQuickOpenEntry));
    var GotoLineHandler = (function (_super) {
        __extends(GotoLineHandler, _super);
        function GotoLineHandler(editorService) {
            _super.call(this);
            this.editorService = editorService;
        }
        GotoLineHandler.prototype.getAriaLabel = function () {
            return nls.localize(5, null);
        };
        GotoLineHandler.prototype.getResults = function (searchValue) {
            searchValue = searchValue.trim();
            // Remember view state to be able to restore on cancel
            if (!this.lastKnownEditorViewState) {
                var editor = this.editorService.getActiveEditor();
                this.lastKnownEditorViewState = editor.getControl().saveViewState();
            }
            return winjs_base_1.TPromise.as(new quickOpenModel_1.QuickOpenModel([new GotoLineEntry(searchValue, this.editorService, this)]));
        };
        GotoLineHandler.prototype.canRun = function () {
            var canRun = this.editorService.getActiveEditor() instanceof textEditor_1.BaseTextEditor;
            return canRun ? true : nls.localize(6, null);
        };
        GotoLineHandler.prototype.decorateOutline = function (range, editor, position) {
            var _this = this;
            editor.changeDecorations(function (changeAccessor) {
                var deleteDecorations = [];
                if (_this.lineHighlightDecorationId) {
                    deleteDecorations.push(_this.lineHighlightDecorationId.lineDecorationId);
                    deleteDecorations.push(_this.lineHighlightDecorationId.lineHighlightId);
                    _this.lineHighlightDecorationId = null;
                }
                var newDecorations = [
                    // lineHighlight at index 0
                    {
                        range: range,
                        options: {
                            className: 'lineHighlight',
                            isWholeLine: true
                        }
                    },
                    // lineDecoration at index 1
                    {
                        range: range,
                        options: {
                            overviewRuler: {
                                color: 'rgba(0, 122, 204, 0.6)',
                                darkColor: 'rgba(0, 122, 204, 0.6)',
                                position: editorCommon_1.OverviewRulerLane.Full
                            }
                        }
                    }
                ];
                var decorations = changeAccessor.deltaDecorations(deleteDecorations, newDecorations);
                var lineHighlightId = decorations[0];
                var lineDecorationId = decorations[1];
                _this.lineHighlightDecorationId = {
                    lineHighlightId: lineHighlightId,
                    lineDecorationId: lineDecorationId,
                    position: position
                };
            });
        };
        GotoLineHandler.prototype.clearDecorations = function () {
            var _this = this;
            if (this.lineHighlightDecorationId) {
                this.editorService.getVisibleEditors().forEach(function (editor) {
                    if (editor.position === _this.lineHighlightDecorationId.position) {
                        var editorControl = editor.getControl();
                        editorControl.changeDecorations(function (changeAccessor) {
                            changeAccessor.deltaDecorations([
                                _this.lineHighlightDecorationId.lineDecorationId,
                                _this.lineHighlightDecorationId.lineHighlightId
                            ], []);
                        });
                    }
                });
                this.lineHighlightDecorationId = null;
            }
        };
        GotoLineHandler.prototype.onClose = function (canceled) {
            // Clear Highlight Decorations if present
            this.clearDecorations();
            // Restore selection if canceled
            if (canceled && this.lastKnownEditorViewState) {
                var activeEditor = this.editorService.getActiveEditor();
                if (activeEditor) {
                    var editor = activeEditor.getControl();
                    editor.restoreViewState(this.lastKnownEditorViewState);
                }
            }
            this.lastKnownEditorViewState = null;
        };
        GotoLineHandler.prototype.getAutoFocus = function (searchValue) {
            return {
                autoFocusFirstEntry: searchValue.trim().length > 0
            };
        };
        GotoLineHandler = __decorate([
            __param(0, editorService_1.IWorkbenchEditorService)
        ], GotoLineHandler);
        return GotoLineHandler;
    }(quickopen_1.QuickOpenHandler));
    exports.GotoLineHandler = GotoLineHandler;
});
//# sourceMappingURL=gotoLineHandler.js.map