var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls!vs/editor/contrib/rename/browser/renameModel', 'vs/base/common/arrays', 'vs/base/common/collections', 'vs/base/common/uri', 'vs/base/common/winjs.base', 'vs/editor/common/core/editOperation', 'vs/editor/common/core/range', 'vs/editor/common/core/selection'], function (require, exports, nls, arrays, collections, uri_1, winjs_base_1, editOperation_1, range_1, selection_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var EditTask = (function () {
        function EditTask(model) {
            this._endCursorSelection = null;
            this._model = model;
            this._edits = [];
        }
        EditTask.prototype.addEdit = function (edit) {
            var range;
            if (!edit.range) {
                range = this._model.getFullModelRange();
            }
            else {
                range = edit.range;
            }
            this._edits.push(editOperation_1.EditOperation.replace(range_1.Range.lift(range), edit.newText));
        };
        EditTask.prototype.apply = function () {
            var _this = this;
            if (this._edits.length === 0) {
                return;
            }
            this._edits.sort(EditTask._editCompare);
            this._initialSelections = this._getInitialSelections();
            this._model.pushEditOperations(this._initialSelections, this._edits, function (edits) { return _this._getEndCursorSelections(edits); });
        };
        EditTask.prototype._getInitialSelections = function () {
            var firstRange = this._edits[0].range;
            var initialSelection = selection_1.Selection.createSelection(firstRange.startLineNumber, firstRange.startColumn, firstRange.endLineNumber, firstRange.endColumn);
            return [initialSelection];
        };
        EditTask.prototype._getEndCursorSelections = function (inverseEditOperations) {
            var relevantEditIndex = 0;
            for (var i = 0; i < inverseEditOperations.length; i++) {
                var editRange = inverseEditOperations[i].range;
                for (var j = 0; j < this._initialSelections.length; j++) {
                    var selectionRange = this._initialSelections[j];
                    if (range_1.Range.areIntersectingOrTouching(editRange, selectionRange)) {
                        relevantEditIndex = i;
                        break;
                    }
                }
            }
            var srcRange = inverseEditOperations[relevantEditIndex].range;
            this._endCursorSelection = selection_1.Selection.createSelection(srcRange.endLineNumber, srcRange.endColumn, srcRange.endLineNumber, srcRange.endColumn);
            return [this._endCursorSelection];
        };
        EditTask.prototype.getEndCursorSelection = function () {
            return this._endCursorSelection;
        };
        EditTask._editCompare = function (a, b) {
            return range_1.Range.compareRangesUsingStarts(a.range, b.range);
        };
        return EditTask;
    }());
    var SourceModelEditTask = (function (_super) {
        __extends(SourceModelEditTask, _super);
        function SourceModelEditTask(model, initialSelections) {
            _super.call(this, model);
            this._knownInitialSelections = initialSelections;
        }
        SourceModelEditTask.prototype._getInitialSelections = function () {
            return this._knownInitialSelections;
        };
        return SourceModelEditTask;
    }(EditTask));
    var RenameModel = (function () {
        function RenameModel(editorService, sourceModel, sourceSelections, editsOrReject) {
            this._numberOfResourcesToModify = 0;
            this._numberOfChanges = 0;
            this._edits = Object.create(null);
            this._editorService = editorService;
            this._sourceModel = sourceModel;
            this._sourceSelections = sourceSelections;
            this._sourceModelTask = null;
            if (typeof editsOrReject === 'string') {
                this.reject(editsOrReject);
            }
            else {
                editsOrReject.forEach(this._addEdit, this);
            }
        }
        RenameModel.prototype.reject = function (value) {
            if (!this._rejectReasons) {
                this._rejectReasons = [];
            }
            this._rejectReasons.push(value);
        };
        RenameModel.prototype.isRejected = function () {
            return !arrays.isFalsyOrEmpty(this._rejectReasons);
        };
        RenameModel.prototype.rejectReasons = function () {
            return this._rejectReasons;
        };
        RenameModel.prototype.resourcesCount = function () {
            return this._numberOfResourcesToModify;
        };
        RenameModel.prototype.changeCount = function () {
            return this._numberOfChanges;
        };
        RenameModel.prototype._addEdit = function (edit) {
            var array = this._edits[edit.resource.toString()];
            if (!array) {
                this._edits[edit.resource.toString()] = array = [];
                this._numberOfResourcesToModify += 1;
            }
            this._numberOfChanges += 1;
            array.push(edit);
        };
        RenameModel.prototype.prepare = function () {
            var _this = this;
            if (this._tasks) {
                throw new Error('illegal state - already prepared');
            }
            this._tasks = [];
            var promises = [];
            collections.forEach(this._edits, function (entry) {
                var promise = _this._editorService.resolveEditorModel({ resource: uri_1.default.parse(entry.key) }).then(function (model) {
                    if (!model || !model.textEditorModel) {
                        _this.reject(nls.localize(0, null, entry.key));
                    }
                    else {
                        var textEditorModel = model.textEditorModel, task;
                        if (textEditorModel.getAssociatedResource().toString() === _this._sourceModel.toString()) {
                            _this._sourceModelTask = new SourceModelEditTask(textEditorModel, _this._sourceSelections);
                            task = _this._sourceModelTask;
                        }
                        else {
                            task = new EditTask(textEditorModel);
                        }
                        entry.value.forEach(function (edit) { return task.addEdit(edit); });
                        _this._tasks.push(task);
                    }
                });
                promises.push(promise);
            });
            return winjs_base_1.TPromise.join(promises).then(function (_) { return _this; });
        };
        RenameModel.prototype.apply = function () {
            this._tasks.forEach(function (task) { return task.apply(); });
            var r = null;
            if (this._sourceModelTask) {
                r = this._sourceModelTask.getEndCursorSelection();
            }
            return r;
        };
        return RenameModel;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = RenameModel;
});
//# sourceMappingURL=renameModel.js.map