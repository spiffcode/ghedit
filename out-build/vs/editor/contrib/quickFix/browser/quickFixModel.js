var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/arrays', 'vs/base/common/async', 'vs/base/common/errors', 'vs/base/common/eventEmitter', 'vs/base/common/lifecycle', 'vs/base/common/timer', 'vs/base/common/winjs.base', 'vs/editor/common/core/range', 'vs/editor/common/editorCommon', 'vs/editor/common/modes', '../common/quickFix', './lightBulpWidget'], function (require, exports, arrays, async_1, errors_1, eventEmitter_1, lifecycle_1, timer, winjs_base_1, range_1, editorCommon_1, modes_1, quickFix_1, lightBulpWidget_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var QuickFixSuggestState;
    (function (QuickFixSuggestState) {
        QuickFixSuggestState[QuickFixSuggestState["NOT_ACTIVE"] = 0] = "NOT_ACTIVE";
        QuickFixSuggestState[QuickFixSuggestState["MANUAL_TRIGGER"] = 1] = "MANUAL_TRIGGER";
        QuickFixSuggestState[QuickFixSuggestState["AUTO_TRIGGER"] = 2] = "AUTO_TRIGGER";
    })(QuickFixSuggestState || (QuickFixSuggestState = {}));
    var QuickFixModel = (function (_super) {
        __extends(QuickFixModel, _super);
        function QuickFixModel(editor, markerService, onAccept) {
            var _this = this;
            _super.call(this);
            this.editor = editor;
            this.markerService = markerService;
            this.onAccept = onAccept;
            this.quickFixRequestPromise = null;
            this.lightBulpDecoration = [];
            this.toDispose = [];
            this.toLocalDispose = [];
            this.lightBulp = new lightBulpWidget_1.LightBulpWidget(editor, function (pos) { _this.onLightBulpClicked(pos); });
            this.enableAutoQuckFix = false; // turn off for now
            this.autoSuggestDelay = this.editor.getConfiguration().quickSuggestionsDelay;
            if (isNaN(this.autoSuggestDelay) || (!this.autoSuggestDelay && this.autoSuggestDelay !== 0) || this.autoSuggestDelay > 2000 || this.autoSuggestDelay < 0) {
                this.autoSuggestDelay = 300;
            }
            this.toDispose.push(this.editor.addListener2(editorCommon_1.EventType.ModelChanged, function () { return _this.onModelChanged(); }));
            this.toDispose.push(this.editor.addListener2(editorCommon_1.EventType.ModelModeChanged, function () { return _this.onModelChanged(); }));
            this.toDispose.push(this.editor.addListener2(editorCommon_1.EventType.ModelModeSupportChanged, function (e) {
                if (e.quickFixSupport) {
                    _this.onModelChanged();
                }
            }));
            this.toDispose.push(modes_1.QuickFixRegistry.onDidChange(this.onModelChanged, this));
        }
        QuickFixModel.prototype.onModelChanged = function () {
            var _this = this;
            this.cancelDialog();
            this.localDispose();
            this.lastMarker = null;
            this.lightBulpPosition = null;
            this.markers = null;
            this.updateScheduler = null;
            if (!modes_1.QuickFixRegistry.has(this.editor.getModel()) || this.editor.getConfiguration().readOnly) {
                this.setDecoration(null);
                return;
            }
            this.markerService.onMarkerChanged(this.onMarkerChanged, this, this.toLocalDispose);
            this.toLocalDispose.push(this.editor.addListener2(editorCommon_1.EventType.CursorPositionChanged, function (e) {
                _this.onCursorPositionChanged();
            }));
        };
        QuickFixModel.prototype.onLightBulpClicked = function (pos) {
            this.triggerDialog(true, pos);
        };
        QuickFixModel.prototype.isSimilarMarker = function (marker1, marker2) {
            if (marker1) {
                return marker2 && marker1.owner === marker2.owner && marker1.code === marker2.code;
            }
            return !marker2;
        };
        QuickFixModel.prototype.onMarkerChanged = function (changedResources) {
            var model = this.editor.getModel();
            if (!model) {
                return;
            }
            var associatedResource = model.getAssociatedResource();
            if (!changedResources.some(function (r) { return associatedResource.toString() === r.toString(); })) {
                return;
            }
            var lastMarker = this.lastMarker;
            this.markers = null;
            this.lastMarker = null;
            var currentMarker = this.findMarker(this.editor.getPosition(), false);
            if (this.isSimilarMarker(currentMarker, lastMarker)) {
                this.lastMarker = currentMarker;
            }
            else {
                this.onCursorPositionChanged();
            }
        };
        QuickFixModel.prototype.setDecoration = function (pos) {
            this.lightBulpPosition = pos;
            this.updateDecoration();
        };
        QuickFixModel.prototype.updateDecoration = function () {
            if (this.lightBulpPosition && this.state === QuickFixSuggestState.NOT_ACTIVE) {
                this.lightBulp.show(this.lightBulpPosition);
            }
            else {
                this.lightBulp.hide();
            }
        };
        QuickFixModel.prototype.onCursorPositionChanged = function () {
            var _this = this;
            if (this.triggerAutoSuggestPromise) {
                this.triggerAutoSuggestPromise.cancel();
                this.triggerAutoSuggestPromise = null;
            }
            this.cancelDialog();
            if (!this.updateScheduler) {
                this.updateScheduler = new async_1.RunOnceScheduler(function () {
                    var marker = _this.lastMarker;
                    var pos = _this.editor.getPosition();
                    if (marker && range_1.Range.containsPosition(marker, pos)) {
                        // still on the same marker
                        if (_this.lightBulpPosition) {
                            _this.setDecoration(pos);
                        }
                        return;
                    }
                    _this.lastMarker = marker = _this.findMarker(pos, false);
                    if (!marker) {
                        // remove lightbulp
                        _this.setDecoration(null);
                        return;
                    }
                    var $tRequest = timer.start(timer.Topic.EDITOR, 'quickfix/lighbulp');
                    var computeFixesPromise = _this.computeFixes(marker);
                    computeFixesPromise.done(function (fixes) {
                        _this.setDecoration(!arrays.isFalsyOrEmpty(fixes) ? pos : null);
                        _this.triggerAutoSuggest(marker);
                        $tRequest.stop();
                    }, function (error) {
                        errors_1.onUnexpectedError(error);
                        _this.setDecoration(null);
                        $tRequest.stop();
                    });
                }, 250);
                this.toLocalDispose.push(this.updateScheduler);
            }
            this.updateScheduler.schedule();
        };
        QuickFixModel.prototype.computeFixes = function (range) {
            var model = this.editor.getModel();
            if (!modes_1.QuickFixRegistry.has(model)) {
                return winjs_base_1.TPromise.as(null);
            }
            if (this.quickFixRequestPromise && range === this.quickFixRequestPromiseRange) {
                return this.quickFixRequestPromise;
            }
            if (this.quickFixRequestPromise) {
                this.quickFixRequestPromise.cancel();
                this.quickFixRequestPromise = null;
            }
            this.quickFixRequestPromiseRange = range;
            this.quickFixRequestPromise = quickFix_1.getQuickFixes(model, range);
            return this.quickFixRequestPromise;
        };
        /**
         * Returns all marker sorted by startLineNumber
         */
        QuickFixModel.prototype.getMarkers = function () {
            if (this.markers !== null) {
                return this.markers;
            }
            var model = this.editor.getModel();
            if (!model) {
                return;
            }
            this.markers = this.markerService.read({ resource: model.getAssociatedResource() })
                .sort(function (e1, e2) { return e1.startLineNumber - e2.startLineNumber; });
            return this.markers;
        };
        QuickFixModel.prototype.findMarker = function (pos, findOnSameLine) {
            if (this.lastMarker && range_1.Range.containsPosition(this.lastMarker, pos)) {
                return this.lastMarker;
            }
            var markers = this.getMarkers(); // makers sorted by line start number
            var result = null;
            var bestDistance = 0;
            var lineNumber = pos.lineNumber;
            // find first marker with a line number greater equal the current position
            var idx = arrays.findFirst(markers, function (m) { return m.startLineNumber >= lineNumber; });
            while (idx < markers.length && markers[idx].startLineNumber === lineNumber) {
                var marker = markers[idx];
                if (marker.startColumn <= pos.column && marker.endColumn >= pos.column) {
                    return marker;
                }
                if (findOnSameLine) {
                    var dist = pos.column < marker.startColumn ? marker.startColumn - pos.column : pos.column - marker.endColumn;
                    if (!result || dist < bestDistance) {
                        result = marker;
                        bestDistance = dist;
                    }
                }
                idx++;
            }
            return result;
        };
        QuickFixModel.prototype.cancelDialog = function (silent) {
            if (silent === void 0) { silent = false; }
            if (this.state !== QuickFixSuggestState.NOT_ACTIVE) {
                this.state = QuickFixSuggestState.NOT_ACTIVE;
                if (!silent) {
                    this.emit('cancel');
                }
                this.updateDecoration();
                return true;
            }
            return false;
        };
        QuickFixModel.prototype.isAutoSuggest = function () {
            return this.state === QuickFixSuggestState.AUTO_TRIGGER;
        };
        QuickFixModel.prototype.triggerAutoSuggest = function (marker) {
            var _this = this;
            if (this.enableAutoQuckFix && this.state === QuickFixSuggestState.NOT_ACTIVE) {
                this.triggerAutoSuggestPromise = winjs_base_1.TPromise.timeout(this.autoSuggestDelay);
                this.triggerAutoSuggestPromise.then(function () {
                    _this.triggerAutoSuggestPromise = null;
                    if (marker === _this.lastMarker) {
                        _this.triggerDialog(true, _this.editor.getPosition());
                    }
                });
            }
        };
        QuickFixModel.prototype.triggerDialog = function (auto, pos) {
            var _this = this;
            // Cancel previous requests, change state & update UI
            this.cancelDialog(false);
            var range;
            if (auto) {
                range = this.findMarker(pos, true);
                if (!range) {
                    return;
                }
            }
            else {
                range = this.findMarker(pos, true);
                if (!range) {
                    // no error on the same line: get code action for the current selection
                    range = this.editor.getSelection();
                }
                if (!range_1.Range.containsPosition(range, pos)) {
                    // move cursor
                    this.editor.setPosition({ lineNumber: range.startLineNumber, column: range.startColumn });
                }
            }
            var $tTrigger = timer.start(timer.Topic.EDITOR, 'quickfix/triggerdialog');
            this.state = auto ? QuickFixSuggestState.AUTO_TRIGGER : QuickFixSuggestState.MANUAL_TRIGGER;
            this.updateDecoration();
            this.emit('loading', { auto: this.isAutoSuggest() });
            this.computeFixes(range).done(function (fixes) {
                if (fixes && fixes.length > 0) {
                    fixes.sort(function (f1, f2) { return f2.score - f1.score; });
                    _this.emit('suggest', {
                        fixes: fixes,
                        range: range,
                        auto: _this.isAutoSuggest()
                    });
                }
                else {
                    _this.emit('empty', { auto: _this.isAutoSuggest() });
                }
                $tTrigger.stop();
            }, function (error) {
                errors_1.onUnexpectedError(error);
                _this.emit('empty', { auto: _this.isAutoSuggest() });
                $tTrigger.stop();
            });
        };
        QuickFixModel.prototype.accept = function (quickFix, range) {
            this.cancelDialog();
            if (!quickFix) {
                return false;
            }
            this.onAccept(quickFix, range);
            return true;
        };
        QuickFixModel.prototype.localDispose = function () {
            this.toLocalDispose = lifecycle_1.dispose(this.toLocalDispose);
            if (this.quickFixRequestPromise) {
                this.quickFixRequestPromise.cancel();
                this.quickFixRequestPromise = null;
            }
        };
        QuickFixModel.prototype.dispose = function () {
            this.localDispose();
            this.toDispose = lifecycle_1.dispose(this.toDispose);
            this.emit('destroy', null);
        };
        return QuickFixModel;
    }(eventEmitter_1.EventEmitter));
    exports.QuickFixModel = QuickFixModel;
});
//# sourceMappingURL=quickFixModel.js.map