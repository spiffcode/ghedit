/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/async', 'vs/base/common/errors', 'vs/base/common/lifecycle', 'vs/editor/common/core/range', 'vs/editor/common/editorCommon', 'vs/editor/browser/editorBrowserExtensions', 'vs/css!./outlineMarker'], function (require, exports, async_1, errors_1, lifecycle_1, range_1, editorCommon, editorBrowserExtensions_1) {
    'use strict';
    var OutlineViewZone = (function () {
        function OutlineViewZone(range, outlineType) {
            this.afterLineNumber = range.startLineNumber - 1;
            this.heightInPx = 4;
            this.suppressMouseDown = true;
            this.domNode = document.createElement('div');
            var hr = document.createElement('hr');
            hr.className = 'outlineRule ' + outlineType;
            this.domNode.appendChild(hr);
        }
        return OutlineViewZone;
    }());
    var OutlineMarkerHelper = (function () {
        function OutlineMarkerHelper() {
            this._removeDecorations = [];
            this._addDecorations = [];
            this._addDecorationsCallbacks = [];
        }
        OutlineMarkerHelper.prototype.addDecoration = function (decoration, callback) {
            this._addDecorations.push(decoration);
            this._addDecorationsCallbacks.push(callback);
        };
        OutlineMarkerHelper.prototype.removeDecoration = function (decorationId) {
            this._removeDecorations.push(decorationId);
        };
        OutlineMarkerHelper.prototype.commit = function (changeAccessor) {
            var resultingDecorations = changeAccessor.deltaDecorations(this._removeDecorations, this._addDecorations);
            for (var i = 0, len = resultingDecorations.length; i < len; i++) {
                this._addDecorationsCallbacks[i](resultingDecorations[i]);
            }
        };
        return OutlineMarkerHelper;
    }());
    var OutlineMarker = (function () {
        function OutlineMarker(range, outlineType, _editor, helper, viewZoneChangeAccessor) {
            var _this = this;
            this._editor = _editor;
            this._viewZone = new OutlineViewZone(range, outlineType);
            this._viewZoneId = viewZoneChangeAccessor.addZone(this._viewZone);
            helper.addDecoration({
                range: range,
                options: {}
            }, function (decorationId) {
                _this._decorationId = decorationId;
            });
        }
        OutlineMarker.prototype.dispose = function (helper, viewZoneChangeAccessor) {
            helper.removeDecoration(this._decorationId);
            viewZoneChangeAccessor.removeZone(this._viewZoneId);
        };
        OutlineMarker.prototype.getLine = function () {
            return this._viewZone.afterLineNumber;
        };
        OutlineMarker.prototype.update = function (viewZoneChangeAccessor) {
            var range = this._editor.getModel().getDecorationRange(this._decorationId);
            this._viewZone.afterLineNumber = range.startLineNumber - 1;
            viewZoneChangeAccessor.layoutZone(this._viewZoneId);
        };
        return OutlineMarker;
    }());
    var OutlineMarkerContribution = (function () {
        function OutlineMarkerContribution(editor) {
            var _this = this;
            this._editor = editor;
            this._globalToDispose = [];
            this._localToDispose = [];
            this._markers = [];
            this._currentOutlinePromise = null;
            this._globalToDispose.push(this._editor.addListener2(editorCommon.EventType.ModelChanged, function () { return _this.onChange(true); }));
            this._globalToDispose.push(this._editor.addListener2(editorCommon.EventType.ModelModeChanged, function () { return _this.onChange(false); }));
            this._globalToDispose.push(this._editor.addListener2(editorCommon.EventType.ModelModeSupportChanged, function (e) {
                if (e.outlineSupport) {
                    _this.onChange(false);
                }
            }));
            this._globalToDispose.push(this._editor.addListener2(editorCommon.EventType.ConfigurationChanged, function (e) {
                if (e.outlineMarkers) {
                    _this.onChange(false);
                }
            }));
            this.onChange(false);
        }
        OutlineMarkerContribution.prototype.dispose = function () {
            this.localDispose();
            this._globalToDispose = lifecycle_1.dispose(this._globalToDispose);
        };
        OutlineMarkerContribution.prototype.localDispose = function () {
            if (this._currentOutlinePromise) {
                this._currentOutlinePromise.cancel();
            }
            this._localToDispose = lifecycle_1.dispose(this._localToDispose);
        };
        OutlineMarkerContribution.prototype.getId = function () {
            return OutlineMarkerContribution.ID;
        };
        OutlineMarkerContribution.prototype.onChange = function (markersAlreadyDisposed) {
            var _this = this;
            if (markersAlreadyDisposed) {
                this._markers = [];
            }
            this.localDispose();
            if (!this._editor.getConfiguration().outlineMarkers) {
                return;
            }
            var model = this._editor.getModel();
            if (!model) {
                return;
            }
            var mode = model.getMode();
            if (!mode.outlineSupport) {
                return;
            }
            var scheduler = new async_1.RunOnceScheduler(function () {
                if (_this._currentOutlinePromise) {
                    _this._currentOutlinePromise.cancel();
                }
                _this._currentOutlinePromise = mode.outlineSupport.getOutline(model.getAssociatedResource());
                _this._currentOutlinePromise.then(function (result) {
                    _this.renderOutlines(result);
                }, function (error) {
                    errors_1.onUnexpectedError(error);
                });
            }, 250);
            this._localToDispose.push(scheduler);
            this._localToDispose.push(this._editor.addListener2('change', function () {
                // Synchronously move markers
                _this._editor.changeViewZones(function (viewAccessor) {
                    _this._markers.forEach(function (marker) {
                        marker.update(viewAccessor);
                    });
                });
                scheduler.schedule();
            }));
            this._localToDispose.push({
                dispose: function () {
                    if (_this._markers.length > 0) {
                        var helper = new OutlineMarkerHelper();
                        _this._editor.changeViewZones(function (accessor) {
                            _this._markers.forEach(function (marker) { return marker.dispose(helper, accessor); });
                            _this._markers = [];
                        });
                        _this._editor.changeDecorations(function (accessor) {
                            helper.commit(accessor);
                        });
                    }
                }
            });
            scheduler.schedule();
        };
        OutlineMarkerContribution.prototype.renderOutlines = function (entries) {
            var _this = this;
            var centeredRange = this._editor.getCenteredRangeInViewport();
            var oldMarkersCount = this._markers.length;
            this._editor.changeDecorations(function (decorationsAccessor) {
                var helper = new OutlineMarkerHelper();
                _this._editor.changeViewZones(function (viewzonesAccessor) {
                    _this._markers.forEach(function (marker) { return marker.dispose(helper, viewzonesAccessor); });
                    _this._markers = [];
                    _this.renderOutlinesRecursive(entries, helper, viewzonesAccessor);
                });
                helper.commit(decorationsAccessor);
            });
            var newMarkersCount = this._markers.length;
            if (Math.abs(oldMarkersCount - newMarkersCount) > 1) {
                // Reveal only if the delta is more than 1 marker
                this._editor.revealRangeInCenter(centeredRange);
            }
        };
        OutlineMarkerContribution.prototype.renderOutlinesRecursive = function (entries, helper, viewZoneChangeAccessor) {
            var _this = this;
            if (entries) {
                entries.forEach(function (outline) {
                    if (outline.type === 'class' || outline.type === 'method' || outline.type === 'function') {
                        var range = range_1.Range.lift(outline.range);
                        if (!_this.alreadyHasMarkerAtRange(range)) {
                            var marker = new OutlineMarker(range, outline.type, _this._editor, helper, viewZoneChangeAccessor);
                            _this._markers.push(marker);
                        }
                    }
                    _this.renderOutlinesRecursive(outline.children, helper, viewZoneChangeAccessor);
                });
            }
        };
        OutlineMarkerContribution.prototype.alreadyHasMarkerAtRange = function (range) {
            for (var i = 0; i < this._markers.length; ++i) {
                if (this._markers[i].getLine() === range.startLineNumber - 1) {
                    return true;
                }
            }
            return false;
        };
        OutlineMarkerContribution.ID = 'editor.outlineMarker';
        return OutlineMarkerContribution;
    }());
    exports.OutlineMarkerContribution = OutlineMarkerContribution;
    editorBrowserExtensions_1.EditorBrowserRegistry.registerEditorContribution(OutlineMarkerContribution);
});
//# sourceMappingURL=outlineMarker.js.map