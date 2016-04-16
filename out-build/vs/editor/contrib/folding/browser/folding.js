/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/// <amd-dependency path="vs/css!./folding" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls!vs/editor/contrib/folding/browser/folding', 'vs/base/common/async', 'vs/base/common/keyCodes', 'vs/base/common/lifecycle', 'vs/base/common/winjs.base', 'vs/editor/common/editorAction', 'vs/editor/common/editorActionEnablement', 'vs/editor/common/editorCommon', 'vs/editor/common/core/range', 'vs/editor/common/editorCommonExtensions', 'vs/editor/browser/editorBrowserExtensions', 'vs/editor/contrib/folding/common/indentFoldStrategy', "vs/css!./folding"], function (require, exports, nls, async_1, keyCodes_1, lifecycle_1, winjs_base_1, editorAction_1, editorActionEnablement_1, editorCommon, range_1, editorCommonExtensions_1, editorBrowserExtensions_1, indentFoldStrategy_1) {
    'use strict';
    var CollapsibleRegion = (function () {
        function CollapsibleRegion(range, model, changeAccessor) {
            this.decorationIds = [];
            this.update(range, model, changeAccessor);
        }
        Object.defineProperty(CollapsibleRegion.prototype, "isCollapsed", {
            get: function () {
                return this._isCollapsed;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CollapsibleRegion.prototype, "indent", {
            get: function () {
                return this._indent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CollapsibleRegion.prototype, "startLineNumber", {
            get: function () {
                return this._lastRange ? this._lastRange.startLineNumber : void 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CollapsibleRegion.prototype, "endLineNumber", {
            get: function () {
                return this._lastRange ? this._lastRange.endLineNumber : void 0;
            },
            enumerable: true,
            configurable: true
        });
        CollapsibleRegion.prototype.setCollapsed = function (isCollaped, changeAccessor) {
            this._isCollapsed = isCollaped;
            if (this.decorationIds.length > 0) {
                changeAccessor.changeDecorationOptions(this.decorationIds[0], this.getVisualDecorationOptions());
            }
        };
        CollapsibleRegion.prototype.getDecorationRange = function (model) {
            if (this.decorationIds.length > 0) {
                return model.getDecorationRange(this.decorationIds[1]);
            }
            return null;
        };
        CollapsibleRegion.prototype.getVisualDecorationOptions = function () {
            if (this._isCollapsed) {
                return {
                    stickiness: editorCommon.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
                    inlineClassName: 'inline-folded',
                    linesDecorationsClassName: 'folding collapsed'
                };
            }
            else {
                return {
                    stickiness: editorCommon.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
                    linesDecorationsClassName: 'folding'
                };
            }
        };
        CollapsibleRegion.prototype.getRangeDecorationOptions = function () {
            return {
                stickiness: editorCommon.TrackedRangeStickiness.GrowsOnlyWhenTypingBefore
            };
        };
        CollapsibleRegion.prototype.update = function (newRange, model, changeAccessor) {
            this._lastRange = newRange;
            this._isCollapsed = !!newRange.isCollapsed;
            this._indent = newRange.indent;
            var newDecorations = [];
            var maxColumn = model.getLineMaxColumn(newRange.startLineNumber);
            var visualRng = {
                startLineNumber: newRange.startLineNumber,
                startColumn: maxColumn - 1,
                endLineNumber: newRange.startLineNumber,
                endColumn: maxColumn
            };
            newDecorations.push({ range: visualRng, options: this.getVisualDecorationOptions() });
            var colRng = {
                startLineNumber: newRange.startLineNumber,
                startColumn: 1,
                endLineNumber: newRange.endLineNumber,
                endColumn: model.getLineMaxColumn(newRange.endLineNumber)
            };
            newDecorations.push({ range: colRng, options: this.getRangeDecorationOptions() });
            this.decorationIds = changeAccessor.deltaDecorations(this.decorationIds, newDecorations);
        };
        CollapsibleRegion.prototype.dispose = function (changeAccessor) {
            this._lastRange = null;
            this.decorationIds = changeAccessor.deltaDecorations(this.decorationIds, []);
        };
        CollapsibleRegion.prototype.toString = function () {
            var str = this.isCollapsed ? 'collapsed ' : 'expanded ';
            if (this._lastRange) {
                str += (this._lastRange.startLineNumber + '/' + this._lastRange.endLineNumber);
            }
            else {
                str += 'no range';
            }
            return str;
        };
        return CollapsibleRegion;
    }());
    var FoldingController = (function () {
        function FoldingController(editor) {
            var _this = this;
            this.editor = editor;
            this.globalToDispose = [];
            this.localToDispose = [];
            this.decorations = [];
            this.computeToken = 0;
            this.globalToDispose.push(this.editor.addListener2(editorCommon.EventType.ModelChanged, function () { return _this.onModelChanged(); }));
            this.globalToDispose.push(this.editor.addListener2(editorCommon.EventType.ConfigurationChanged, function (e) {
                if (e.folding) {
                    _this.onModelChanged();
                }
            }));
            this.onModelChanged();
        }
        FoldingController.getFoldingController = function (editor) {
            return editor.getContribution(FoldingController.ID);
        };
        FoldingController.prototype.getId = function () {
            return FoldingController.ID;
        };
        FoldingController.prototype.dispose = function () {
            this.cleanState();
            this.globalToDispose = lifecycle_1.dispose(this.globalToDispose);
        };
        /**
         * Store view state.
         */
        FoldingController.prototype.saveViewState = function () {
            var model = this.editor.getModel();
            if (!model) {
                return {};
            }
            var collapsedRegions = [];
            this.decorations.forEach(function (d) {
                if (d.isCollapsed) {
                    var range = d.getDecorationRange(model);
                    if (range) {
                        collapsedRegions.push({ startLineNumber: range.startLineNumber, endLineNumber: range.endLineNumber, indent: d.indent, isCollapsed: true });
                    }
                }
            });
            return { collapsedRegions: collapsedRegions, lineCount: model.getLineCount() };
        };
        /**
         * Restore view state.
         */
        FoldingController.prototype.restoreViewState = function (state) {
            var model = this.editor.getModel();
            if (!model) {
                return;
            }
            if (!this.editor.getConfiguration().folding) {
                return;
            }
            if (!state || !Array.isArray(state.collapsedRegions) || state.collapsedRegions.length === 0 || state.lineCount !== model.getLineCount()) {
                return;
            }
            this.applyRegions(state.collapsedRegions);
        };
        FoldingController.prototype.cleanState = function () {
            this.localToDispose = lifecycle_1.dispose(this.localToDispose);
        };
        FoldingController.prototype.applyRegions = function (regions) {
            var _this = this;
            var model = this.editor.getModel();
            if (!model) {
                return;
            }
            var updateHiddenRegions = false;
            regions = indentFoldStrategy_1.limitByIndent(regions, FoldingController.MAX_FOLDING_REGIONS).sort(function (r1, r2) { return r1.startLineNumber - r2.startLineNumber; });
            this.editor.changeDecorations(function (changeAccessor) {
                var newDecorations = [];
                var k = 0, i = 0;
                while (i < _this.decorations.length && k < regions.length) {
                    var dec = _this.decorations[i];
                    var decRange = dec.getDecorationRange(model);
                    if (!decRange) {
                        updateHiddenRegions = updateHiddenRegions || dec.isCollapsed;
                        dec.dispose(changeAccessor);
                        i++;
                    }
                    else {
                        while (k < regions.length && decRange.startLineNumber > regions[k].startLineNumber) {
                            var region = regions[k];
                            updateHiddenRegions = updateHiddenRegions || region.isCollapsed;
                            newDecorations.push(new CollapsibleRegion(region, model, changeAccessor));
                            k++;
                        }
                        if (k < regions.length) {
                            var currRange = regions[k];
                            if (decRange.startLineNumber < currRange.startLineNumber) {
                                updateHiddenRegions = updateHiddenRegions || dec.isCollapsed;
                                dec.dispose(changeAccessor);
                                i++;
                            }
                            else if (decRange.startLineNumber === currRange.startLineNumber) {
                                if (dec.isCollapsed && (dec.startLineNumber !== currRange.startLineNumber || dec.endLineNumber !== currRange.endLineNumber)) {
                                    updateHiddenRegions = true;
                                }
                                currRange.isCollapsed = dec.isCollapsed; // preserve collapse state
                                dec.update(currRange, model, changeAccessor);
                                newDecorations.push(dec);
                                i++;
                                k++;
                            }
                        }
                    }
                }
                while (i < _this.decorations.length) {
                    var dec = _this.decorations[i];
                    updateHiddenRegions = updateHiddenRegions || dec.isCollapsed;
                    dec.dispose(changeAccessor);
                    i++;
                }
                while (k < regions.length) {
                    var region = regions[k];
                    updateHiddenRegions = updateHiddenRegions || region.isCollapsed;
                    newDecorations.push(new CollapsibleRegion(region, model, changeAccessor));
                    k++;
                }
                _this.decorations = newDecorations;
            });
            if (updateHiddenRegions) {
                this.updateHiddenAreas(void 0);
            }
        };
        FoldingController.prototype.onModelChanged = function () {
            var _this = this;
            this.cleanState();
            var model = this.editor.getModel();
            if (!this.editor.getConfiguration().folding || !model) {
                return;
            }
            this.contentChangedScheduler = new async_1.RunOnceScheduler(function () {
                var myToken = (++_this.computeToken);
                _this.computeCollapsibleRegions().then(function (regions) {
                    if (myToken !== _this.computeToken) {
                        return; // A new request was made in the meantime or the model was changed
                    }
                    _this.applyRegions(regions);
                });
            }, 200);
            this.cursorChangedScheduler = new async_1.RunOnceScheduler(function () {
                _this.revealCursor();
            }, 200);
            this.localToDispose.push(this.contentChangedScheduler);
            this.localToDispose.push(this.cursorChangedScheduler);
            this.localToDispose.push(this.editor.addListener2('change', function () {
                _this.contentChangedScheduler.schedule();
            }));
            this.localToDispose.push({ dispose: function () {
                    ++_this.computeToken;
                    _this.editor.changeDecorations(function (changeAccessor) {
                        _this.decorations.forEach(function (dec) { return dec.dispose(changeAccessor); });
                    });
                    _this.decorations = [];
                    _this.editor.setHiddenAreas([]);
                } });
            this.localToDispose.push(this.editor.addListener2(editorCommon.EventType.MouseDown, function (e) { return _this.onEditorMouseDown(e); }));
            this.localToDispose.push(this.editor.addListener2(editorCommon.EventType.MouseUp, function (e) { return _this.onEditorMouseUp(e); }));
            this.localToDispose.push(this.editor.addListener2(editorCommon.EventType.CursorPositionChanged, function (e) {
                _this.cursorChangedScheduler.schedule();
            }));
            this.contentChangedScheduler.schedule();
        };
        FoldingController.prototype.computeCollapsibleRegions = function () {
            var model = this.editor.getModel();
            if (!model) {
                return winjs_base_1.TPromise.as([]);
            }
            var tabSize = model.getOptions().tabSize;
            var ranges = indentFoldStrategy_1.computeRanges(model, tabSize);
            return winjs_base_1.TPromise.as(ranges);
        };
        FoldingController.prototype.revealCursor = function () {
            var _this = this;
            var model = this.editor.getModel();
            if (!model) {
                return;
            }
            var hasChanges = false;
            var position = this.editor.getPosition();
            var lineNumber = position.lineNumber;
            this.editor.changeDecorations(function (changeAccessor) {
                return _this.decorations.forEach(function (dec) {
                    if (dec.isCollapsed) {
                        var decRange = dec.getDecorationRange(model);
                        // reveal if cursor in in one of the collapsed line (not the first)
                        if (decRange && decRange.startLineNumber < lineNumber && lineNumber <= decRange.endLineNumber) {
                            dec.setCollapsed(false, changeAccessor);
                            hasChanges = true;
                        }
                    }
                });
            });
            if (hasChanges) {
                this.updateHiddenAreas(lineNumber);
            }
        };
        FoldingController.prototype.onEditorMouseDown = function (e) {
            this.mouseDownInfo = null;
            if (this.decorations.length === 0) {
                return;
            }
            var range = e.target.range;
            if (!range || !range.isEmpty) {
                return;
            }
            if (!e.event.leftButton) {
                return;
            }
            var model = this.editor.getModel();
            var iconClicked = false;
            switch (e.target.type) {
                case editorCommon.MouseTargetType.GUTTER_LINE_DECORATIONS:
                    iconClicked = true;
                    break;
                case editorCommon.MouseTargetType.CONTENT_TEXT:
                    if (range.isEmpty && range.startColumn === model.getLineMaxColumn(range.startLineNumber)) {
                        break;
                    }
                    return;
                default:
                    return;
            }
            this.mouseDownInfo = { lineNumber: range.startLineNumber, iconClicked: iconClicked };
        };
        FoldingController.prototype.onEditorMouseUp = function (e) {
            var _this = this;
            if (!this.mouseDownInfo) {
                return;
            }
            var lineNumber = this.mouseDownInfo.lineNumber;
            var iconClicked = this.mouseDownInfo.iconClicked;
            var range = e.target.range;
            if (!range || !range.isEmpty || range.startLineNumber !== lineNumber) {
                return;
            }
            var model = this.editor.getModel();
            if (iconClicked) {
                if (e.target.type !== editorCommon.MouseTargetType.GUTTER_LINE_DECORATIONS) {
                    return;
                }
            }
            else {
                if (range.startColumn !== model.getLineMaxColumn(lineNumber)) {
                    return;
                }
            }
            this.editor.changeDecorations(function (changeAccessor) {
                for (var i = 0; i < _this.decorations.length; i++) {
                    var dec = _this.decorations[i];
                    var decRange = dec.getDecorationRange(model);
                    if (decRange.startLineNumber === lineNumber) {
                        if (iconClicked || dec.isCollapsed) {
                            dec.setCollapsed(!dec.isCollapsed, changeAccessor);
                            _this.updateHiddenAreas(lineNumber);
                        }
                        return;
                    }
                }
            });
        };
        FoldingController.prototype.updateHiddenAreas = function (focusLine) {
            var model = this.editor.getModel();
            var selections = this.editor.getSelections();
            var updateSelections = false;
            var hiddenAreas = [];
            this.decorations.filter(function (dec) { return dec.isCollapsed; }).forEach(function (dec) {
                var decRange = dec.getDecorationRange(model);
                hiddenAreas.push({
                    startLineNumber: decRange.startLineNumber + 1,
                    startColumn: 1,
                    endLineNumber: decRange.endLineNumber,
                    endColumn: 1
                });
                selections.forEach(function (selection, i) {
                    if (range_1.Range.containsPosition(decRange, selection.getStartPosition())) {
                        selections[i] = selection = selection.setStartPosition(decRange.startLineNumber, model.getLineMaxColumn(decRange.startLineNumber));
                        updateSelections = true;
                    }
                    if (range_1.Range.containsPosition(decRange, selection.getEndPosition())) {
                        selections[i] = selection.setEndPosition(decRange.startLineNumber, model.getLineMaxColumn(decRange.startLineNumber));
                        updateSelections = true;
                    }
                });
            });
            var revealPosition;
            if (focusLine) {
                revealPosition = { lineNumber: focusLine, column: 1 };
            }
            else {
                revealPosition = selections[0].getStartPosition();
            }
            if (updateSelections) {
                this.editor.setSelections(selections);
            }
            this.editor.setHiddenAreas(hiddenAreas);
            this.editor.revealPositionInCenterIfOutsideViewport(revealPosition);
        };
        FoldingController.prototype.unfold = function () {
            var _this = this;
            var model = this.editor.getModel();
            var hasChanges = false;
            var selections = this.editor.getSelections();
            var selectionsHasChanged = false;
            selections.forEach(function (selection, index) {
                var lineNumber = selection.startLineNumber;
                var surroundingUnfolded;
                var _loop_1 = function(i, len) {
                    var dec = _this.decorations[i];
                    var decRange = dec.getDecorationRange(model);
                    if (!decRange) {
                        return "continue";
                    }
                    if (decRange.startLineNumber <= lineNumber) {
                        if (lineNumber <= decRange.endLineNumber) {
                            if (dec.isCollapsed) {
                                _this.editor.changeDecorations(function (changeAccessor) {
                                    dec.setCollapsed(false, changeAccessor);
                                    hasChanges = true;
                                });
                                return { value: void 0 };
                            }
                            surroundingUnfolded = decRange;
                        }
                    }
                    else {
                        if (surroundingUnfolded && range_1.Range.containsRange(surroundingUnfolded, decRange)) {
                            if (dec.isCollapsed) {
                                _this.editor.changeDecorations(function (changeAccessor) {
                                    dec.setCollapsed(false, changeAccessor);
                                    hasChanges = true;
                                    var lineNumber = decRange.startLineNumber, column = model.getLineMaxColumn(decRange.startLineNumber);
                                    selections[index] = selection.setEndPosition(lineNumber, column).setStartPosition(lineNumber, column);
                                    selectionsHasChanged = true;
                                });
                                return { value: void 0 };
                            }
                        }
                        else {
                            return { value: void 0 };
                        }
                    }
                };
                for (var i = 0, len = _this.decorations.length; i < len; i++) {
                    var state_1 = _loop_1(i, len);
                    if (typeof state_1 === "object") return state_1.value;
                    if (state_1 === "continue") continue;
                }
            });
            if (selectionsHasChanged) {
                this.editor.setSelections(selections);
            }
            if (hasChanges) {
                this.updateHiddenAreas(selections[0].startLineNumber);
            }
        };
        FoldingController.prototype.fold = function () {
            var _this = this;
            var hasChanges = false;
            var model = this.editor.getModel();
            var selections = this.editor.getSelections();
            selections.forEach(function (selection) {
                var lineNumber = selection.startLineNumber;
                var toFold = null;
                for (var i = 0, len = _this.decorations.length; i < len; i++) {
                    var dec = _this.decorations[i];
                    var decRange = dec.getDecorationRange(model);
                    if (!decRange) {
                        continue;
                    }
                    if (decRange.startLineNumber <= lineNumber) {
                        if (lineNumber <= decRange.endLineNumber && !dec.isCollapsed) {
                            toFold = dec;
                        }
                    }
                    else {
                        break;
                    }
                }
                ;
                if (toFold) {
                    _this.editor.changeDecorations(function (changeAccessor) {
                        toFold.setCollapsed(true, changeAccessor);
                        hasChanges = true;
                    });
                }
            });
            if (hasChanges) {
                this.updateHiddenAreas(selections[0].startLineNumber);
            }
        };
        FoldingController.prototype.changeAll = function (collapse) {
            var _this = this;
            if (this.decorations.length > 0) {
                var hasChanges_1 = true;
                this.editor.changeDecorations(function (changeAccessor) {
                    _this.decorations.forEach(function (d) {
                        if (collapse !== d.isCollapsed) {
                            d.setCollapsed(collapse, changeAccessor);
                            hasChanges_1 = true;
                        }
                    });
                });
                if (hasChanges_1) {
                    this.updateHiddenAreas(void 0);
                }
            }
        };
        FoldingController.prototype.foldLevel = function (foldLevel, selectedLineNumbers) {
            var _this = this;
            var model = this.editor.getModel();
            var foldingRegionStack = [model.getFullModelRange()]; // sentinel
            var hasChanges = false;
            this.editor.changeDecorations(function (changeAccessor) {
                _this.decorations.forEach(function (dec) {
                    var decRange = dec.getDecorationRange(model);
                    if (decRange) {
                        while (!range_1.Range.containsRange(foldingRegionStack[foldingRegionStack.length - 1], decRange)) {
                            foldingRegionStack.pop();
                        }
                        foldingRegionStack.push(decRange);
                        if (foldingRegionStack.length === foldLevel + 1 && !dec.isCollapsed && !selectedLineNumbers.some(function (lineNumber) { return decRange.startLineNumber < lineNumber && lineNumber <= decRange.endLineNumber; })) {
                            dec.setCollapsed(true, changeAccessor);
                            hasChanges = true;
                        }
                    }
                });
            });
            if (hasChanges) {
                this.updateHiddenAreas(selectedLineNumbers[0]);
            }
        };
        FoldingController.ID = 'editor.contrib.folding';
        FoldingController.MAX_FOLDING_REGIONS = 5000;
        return FoldingController;
    }());
    exports.FoldingController = FoldingController;
    var FoldingAction = (function (_super) {
        __extends(FoldingAction, _super);
        function FoldingAction(descriptor, editor) {
            _super.call(this, descriptor, editor, editorActionEnablement_1.Behaviour.TextFocus);
        }
        FoldingAction.prototype.run = function () {
            var foldingController = FoldingController.getFoldingController(this.editor);
            this.invoke(foldingController);
            return winjs_base_1.TPromise.as(true);
        };
        return FoldingAction;
    }(editorAction_1.EditorAction));
    var UnfoldAction = (function (_super) {
        __extends(UnfoldAction, _super);
        function UnfoldAction() {
            _super.apply(this, arguments);
        }
        UnfoldAction.prototype.invoke = function (foldingController) {
            foldingController.unfold();
        };
        UnfoldAction.ID = 'editor.unfold';
        return UnfoldAction;
    }(FoldingAction));
    var FoldAction = (function (_super) {
        __extends(FoldAction, _super);
        function FoldAction() {
            _super.apply(this, arguments);
        }
        FoldAction.prototype.invoke = function (foldingController) {
            foldingController.fold();
        };
        FoldAction.ID = 'editor.fold';
        return FoldAction;
    }(FoldingAction));
    var FoldAllAction = (function (_super) {
        __extends(FoldAllAction, _super);
        function FoldAllAction() {
            _super.apply(this, arguments);
        }
        FoldAllAction.prototype.invoke = function (foldingController) {
            foldingController.changeAll(true);
        };
        FoldAllAction.ID = 'editor.foldAll';
        return FoldAllAction;
    }(FoldingAction));
    var UnfoldAllAction = (function (_super) {
        __extends(UnfoldAllAction, _super);
        function UnfoldAllAction() {
            _super.apply(this, arguments);
        }
        UnfoldAllAction.prototype.invoke = function (foldingController) {
            foldingController.changeAll(false);
        };
        UnfoldAllAction.ID = 'editor.unfoldAll';
        return UnfoldAllAction;
    }(FoldingAction));
    var FoldLevelAction = (function (_super) {
        __extends(FoldLevelAction, _super);
        function FoldLevelAction() {
            _super.apply(this, arguments);
        }
        FoldLevelAction.prototype.getFoldingLevel = function () {
            return parseInt(this.id.substr(FoldLevelAction.ID_PREFIX.length));
        };
        FoldLevelAction.prototype.getSelectedLines = function () {
            return this.editor.getSelections().map(function (s) { return s.startLineNumber; });
        };
        FoldLevelAction.prototype.invoke = function (foldingController) {
            foldingController.foldLevel(this.getFoldingLevel(), this.getSelectedLines());
        };
        FoldLevelAction.ID_PREFIX = 'editor.foldLevel';
        FoldLevelAction.ID = function (level) { return FoldLevelAction.ID_PREFIX + level; };
        return FoldLevelAction;
    }(FoldingAction));
    editorBrowserExtensions_1.EditorBrowserRegistry.registerEditorContribution(FoldingController);
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(UnfoldAction, UnfoldAction.ID, nls.localize(0, null), {
        context: editorCommonExtensions_1.ContextKey.EditorFocus,
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.US_CLOSE_SQUARE_BRACKET
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(FoldAction, FoldAction.ID, nls.localize(1, null), {
        context: editorCommonExtensions_1.ContextKey.EditorFocus,
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.US_OPEN_SQUARE_BRACKET
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(FoldAllAction, FoldAllAction.ID, nls.localize(2, null), {
        context: editorCommonExtensions_1.ContextKey.EditorFocus,
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.US_OPEN_SQUARE_BRACKET
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(UnfoldAllAction, UnfoldAllAction.ID, nls.localize(3, null), {
        context: editorCommonExtensions_1.ContextKey.EditorFocus,
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.US_CLOSE_SQUARE_BRACKET,
        secondary: [keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_J)]
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(FoldLevelAction, FoldLevelAction.ID(1), nls.localize(4, null), {
        context: editorCommonExtensions_1.ContextKey.EditorFocus,
        primary: keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_1)
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(FoldLevelAction, FoldLevelAction.ID(2), nls.localize(5, null), {
        context: editorCommonExtensions_1.ContextKey.EditorFocus,
        primary: keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_2)
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(FoldLevelAction, FoldLevelAction.ID(3), nls.localize(6, null), {
        context: editorCommonExtensions_1.ContextKey.EditorFocus,
        primary: keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_3)
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(FoldLevelAction, FoldLevelAction.ID(4), nls.localize(7, null), {
        context: editorCommonExtensions_1.ContextKey.EditorFocus,
        primary: keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_4)
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(FoldLevelAction, FoldLevelAction.ID(5), nls.localize(8, null), {
        context: editorCommonExtensions_1.ContextKey.EditorFocus,
        primary: keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_5)
    }));
});
//# sourceMappingURL=folding.js.map