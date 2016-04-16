/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/async', 'vs/base/common/errors', 'vs/base/common/lifecycle', 'vs/base/common/strings', 'vs/base/browser/dom', 'vs/editor/common/editorCommon', 'vs/editor/common/editorCommonExtensions', 'vs/css!./color'], function (require, exports, async_1, errors_1, lifecycle_1, strings, dom, editorCommon, editorCommonExtensions_1) {
    'use strict';
    var ColorDecoration = (function () {
        function ColorDecoration(renderingDecorationId, trackingDecorationId) {
            this.renderingDecorationId = renderingDecorationId;
            this.trackingDecorationId = trackingDecorationId;
        }
        ColorDecoration.createRenderingDecoration = function (range, inlineClassName) {
            return {
                range: {
                    startLineNumber: range.startLineNumber,
                    startColumn: range.startColumn,
                    endLineNumber: range.startLineNumber,
                    endColumn: range.startColumn + 1
                },
                options: {
                    inlineClassName: 'inline-color-decoration ' + inlineClassName,
                    stickiness: editorCommon.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
                }
            };
        };
        ColorDecoration.createTrackingDecoration = function (range) {
            return {
                range: range,
                options: {
                    stickiness: editorCommon.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
                }
            };
        };
        ColorDecoration.prototype.getColorValue = function (model) {
            var range = model.getDecorationRange(this.trackingDecorationId);
            if (range) {
                return model.getValueInRange(range);
            }
            return '';
        };
        return ColorDecoration;
    }());
    var ColorContribution = (function () {
        function ColorContribution(editor) {
            var _this = this;
            this._instanceCount = (++ColorContribution.INSTANCE_COUNT);
            this._editor = editor;
            this._callOnDispose = [];
            this._callOnModelChange = [];
            this._currentDecorations = [];
            this._currentDynamicColors = [];
            this._contentChangedScheduler = new async_1.RunOnceScheduler(null, 250);
            this._decorationsChangedScheduler = new async_1.RunOnceScheduler(function () { return _this.onDecorationsChanged(); }, 250);
            this._currentFindColorDeclarationsPromise = null;
            this._callOnDispose.push(this._contentChangedScheduler);
            this._callOnDispose.push(this._decorationsChangedScheduler);
            this._callOnDispose.push(this._editor.addListener2(editorCommon.EventType.ModelChanged, function () { return _this.onModelChange(); }));
            this._callOnDispose.push(this._editor.addListener2(editorCommon.EventType.ModelModeChanged, function () { return _this.onModelChange(); }));
            this._callOnDispose.push(this._editor.addListener2(editorCommon.EventType.ModelModeSupportChanged, function (e) {
                _this.onModelChange();
            }));
            this._style = dom.createStyleSheet();
            this.onModelChange();
        }
        ColorContribution.prototype.dispose = function () {
            var _this = this;
            if (this._currentDecorations.length > 0) {
                this._editor.changeDecorations(function (changeAccessor) {
                    var oldDecorations = [];
                    for (var i = 0, len = _this._currentDecorations.length; i < len; i++) {
                        oldDecorations.push(_this._currentDecorations[i].renderingDecorationId);
                        oldDecorations.push(_this._currentDecorations[i].trackingDecorationId);
                    }
                    changeAccessor.deltaDecorations(oldDecorations, []);
                    _this._currentDecorations = null;
                });
            }
            this._style.parentNode.removeChild(this._style);
            this._style = null;
            this._callOnDispose = lifecycle_1.dispose(this._callOnDispose);
        };
        ColorContribution.prototype.getId = function () {
            return ColorContribution.ID;
        };
        ColorContribution.prototype.onModelChange = function () {
            var _this = this;
            lifecycle_1.cAll(this._callOnModelChange);
            var model = this._editor.getModel();
            if (!model) {
                return;
            }
            var rawMode = model.getMode();
            if (typeof rawMode['findColorDeclarations'] !== 'function') {
                return;
            }
            this._contentChangedScheduler.setRunner(function () {
                if (_this._currentFindColorDeclarationsPromise) {
                    _this._currentFindColorDeclarationsPromise.cancel();
                }
                _this._currentFindColorDeclarationsPromise = rawMode['findColorDeclarations'](model.getAssociatedResource());
                var myModelVersion = _this._editor.getModel().getVersionId();
                _this._currentFindColorDeclarationsPromise.then(function (result) {
                    if (myModelVersion !== _this._editor.getModel().getVersionId()) {
                        return;
                    }
                    _this.renderAndTrackColors(result);
                }, function (error) {
                    errors_1.onUnexpectedError(error);
                });
            });
            this._contentChangedScheduler.schedule();
            this._callOnModelChange.push(function () {
                _this._contentChangedScheduler.cancel();
                _this._decorationsChangedScheduler.cancel();
            });
            this._callOnModelChange.push(function () {
                if (_this._currentFindColorDeclarationsPromise) {
                    _this._currentFindColorDeclarationsPromise.cancel();
                }
                _this._currentFindColorDeclarationsPromise = null;
            });
            this._callOnModelChange.push(this._editor.addListener(editorCommon.EventType.ModelContentChanged, function (event) { return _this._contentChangedScheduler.schedule(); }));
            this._callOnModelChange.push(model.addListener(editorCommon.EventType.ModelDecorationsChanged, function (event) { return _this._decorationsChangedScheduler.schedule(); }));
        };
        ColorContribution.prototype.renderAndTrackColors = function (colors) {
            var _this = this;
            // Reduce to a maximum of 500 colors
            colors = colors.slice(0, 500);
            this._editor.changeDecorations(function (changeAccessor) {
                var oldDecorations = [];
                for (var i = 0, len = _this._currentDecorations.length; i < len; i++) {
                    oldDecorations.push(_this._currentDecorations[i].renderingDecorationId);
                    oldDecorations.push(_this._currentDecorations[i].trackingDecorationId);
                }
                var newDecorations = [];
                for (var i = 0, len = colors.length; i < len; i++) {
                    newDecorations.push(ColorDecoration.createRenderingDecoration(colors[i].range, _this.getCSSRuleName(i)));
                    newDecorations.push(ColorDecoration.createTrackingDecoration(colors[i].range));
                }
                var decorations = changeAccessor.deltaDecorations(oldDecorations, newDecorations);
                _this._currentDecorations = [];
                for (var i = 0, len = colors.length; i < len; i++) {
                    _this._currentDecorations.push(new ColorDecoration(decorations[2 * i], decorations[2 * i + 1]));
                }
            });
            this.onDecorationsChanged();
        };
        ColorContribution.prototype.onDecorationsChanged = function () {
            var _this = this;
            var model = this._editor.getModel(), i, len, range, renderingRange, desiredRenderingRange, decoration, desiredColors = [];
            this._editor.changeDecorations(function (changeAccessor) {
                for (i = 0, len = _this._currentDecorations.length; i < len; i++) {
                    decoration = _this._currentDecorations[i];
                    range = model.getDecorationRange(decoration.trackingDecorationId);
                    if (range && !range.isEmpty()) {
                        // Collect color for this decoration
                        desiredColors[i] = model.getValueInRange(range).replace(/[^%#a-z0-9.,()]/gi, '');
                        // Prevent rendering decorations from growing too much
                        renderingRange = model.getDecorationRange(decoration.renderingDecorationId);
                        desiredRenderingRange = model.validateRange({
                            startLineNumber: range.startLineNumber,
                            startColumn: range.startColumn,
                            endLineNumber: range.startLineNumber,
                            endColumn: range.startColumn + 1
                        });
                        if (!renderingRange || !renderingRange.equalsRange(desiredRenderingRange)) {
                            changeAccessor.changeDecoration(decoration.renderingDecorationId, desiredRenderingRange);
                        }
                    }
                    else {
                        desiredColors[i] = '';
                    }
                }
                _this.ensureColors(desiredColors);
            });
        };
        ColorContribution.prototype.getCSSRuleName = function (index) {
            if (index < 0) {
                return '.monaco-css-dynamic-' + this._instanceCount + '-';
            }
            return '.monaco-css-dynamic-' + this._instanceCount + '-' + index + ':before';
        };
        ColorContribution.prototype._changeCost = function (desiredColors) {
            if (this._currentDynamicColors.length !== desiredColors.length) {
                return Number.MAX_VALUE;
            }
            var modifiedCnt = 0;
            for (var i = 0; i < desiredColors.length; i++) {
                if (desiredColors[i] !== this._currentDynamicColors[i]) {
                    modifiedCnt++;
                }
            }
            return modifiedCnt;
        };
        ColorContribution.prototype.ensureColors = function (desiredColors) {
            var i, changeCost = this._changeCost(desiredColors);
            if (changeCost === 0) {
                // Nothing to change
                return;
            }
            if (changeCost < 10) {
                // Simply modify up to 10 rules (lengths will match for sure)
                for (i = 0; i < desiredColors.length; i++) {
                    if (desiredColors[i] !== this._currentDynamicColors[i]) {
                        var rule = dom.getCSSRule(this.getCSSRuleName(i), this._style);
                        if (rule) {
                            rule.style.backgroundColor = desiredColors[i];
                        }
                    }
                }
            }
            else {
                // .innerHTML is the friend here
                var result = [];
                for (i = 0; i < desiredColors.length; i++) {
                    result.push(this.getCSSRuleName(i));
                    result.push('{');
                    result.push(this.getCSSText(desiredColors[i]));
                    result.push('}');
                }
                this._style.innerHTML = result.join('');
            }
            this._currentDynamicColors = desiredColors;
        };
        ColorContribution.prototype.getCSSText = function (color) {
            // Variants:
            return strings.format('background-color:{0};', color);
        };
        ColorContribution.ID = 'css.editor.colorContribution';
        ColorContribution.INSTANCE_COUNT = 0;
        return ColorContribution;
    }());
    exports.ColorContribution = ColorContribution;
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorContribution(ColorContribution);
});
//# sourceMappingURL=color.js.map