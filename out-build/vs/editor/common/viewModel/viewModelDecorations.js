define(["require", "exports", 'vs/editor/common/core/range', 'vs/editor/common/editorCommon'], function (require, exports, range_1, editorCommon) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ViewModelDecoration = (function () {
        function ViewModelDecoration(source, range) {
            this.id = source.id;
            this.options = source.options;
            this.ownerId = source.ownerId;
            this.modelRange = source.range;
            this.range = range;
        }
        return ViewModelDecoration;
    }());
    var ViewModelDecorations = (function () {
        function ViewModelDecorations(editorId, configuration, converter) {
            this.editorId = editorId;
            this.configuration = configuration;
            this.converter = converter;
            this.decorations = [];
            this._clearCachedModelDecorationsResolver();
        }
        ViewModelDecorations.prototype._clearCachedModelDecorationsResolver = function () {
            this._cachedModelDecorationsResolver = null;
            this._cachedModelDecorationsResolverStartLineNumber = 0;
            this._cachedModelDecorationsResolverEndLineNumber = 0;
        };
        ViewModelDecorations.prototype.dispose = function () {
            this.converter = null;
            this.decorations = null;
            this._clearCachedModelDecorationsResolver();
        };
        ViewModelDecorations.compareDecorations = function (a, b) {
            return range_1.Range.compareRangesUsingStarts(a.range, b.range);
        };
        ViewModelDecorations.prototype.reset = function (model) {
            var decorations = model.getAllDecorations(this.editorId, this.configuration.editor.readOnly), i, len, theirDecoration, myDecoration;
            this.decorations = [];
            for (i = 0, len = decorations.length; i < len; i++) {
                theirDecoration = decorations[i];
                myDecoration = new ViewModelDecoration(theirDecoration, this.converter.convertModelRangeToViewRange(theirDecoration.range, theirDecoration.options.isWholeLine));
                this.decorations[i] = myDecoration;
            }
            this._clearCachedModelDecorationsResolver();
            this.decorations.sort(ViewModelDecorations.compareDecorations);
        };
        ViewModelDecorations.prototype.onModelDecorationsChanged = function (e, emit) {
            var somethingChanged = false, inlineDecorationsChanged = false;
            // -----------------------------------
            // Interpret addedOrChangedDecorations
            var removedMap = {}, addedOrChangedMap = {}, theirDecoration, i, skipValidation = this.configuration.editor.readOnly, len;
            for (i = 0, len = e.addedOrChangedDecorations.length; i < len; i++) {
                theirDecoration = e.addedOrChangedDecorations[i];
                if (skipValidation && theirDecoration.isForValidation) {
                    continue;
                }
                if (theirDecoration.ownerId && theirDecoration.ownerId !== this.editorId) {
                    continue;
                }
                addedOrChangedMap[theirDecoration.id] = theirDecoration;
            }
            for (i = 0, len = e.removedDecorations.length; i < len; i++) {
                removedMap[e.removedDecorations[i]] = true;
            }
            // Interpret changed decorations
            var usedMap = {}, myDecoration;
            for (i = 0, len = this.decorations.length; i < len; i++) {
                myDecoration = this.decorations[i];
                if (addedOrChangedMap.hasOwnProperty(myDecoration.id)) {
                    usedMap[myDecoration.id] = true;
                    theirDecoration = addedOrChangedMap[myDecoration.id];
                    myDecoration.options = theirDecoration.options;
                    myDecoration.modelRange = theirDecoration.range;
                    myDecoration.range = this.converter.convertModelRangeToViewRange(theirDecoration.range, theirDecoration.options.isWholeLine);
                    //				console.log(theirDecoration.range.toString() + '--->' + myDecoration.range.toString());
                    if (myDecoration.options.inlineClassName) {
                        inlineDecorationsChanged = true;
                    }
                    somethingChanged = true;
                }
                if (removedMap.hasOwnProperty(myDecoration.id)) {
                    if (this.decorations[i].options.inlineClassName) {
                        inlineDecorationsChanged = true;
                    }
                    this.decorations.splice(i, 1);
                    len--;
                    i--;
                    somethingChanged = true;
                }
            }
            // Interpret new decorations
            var keys = Object.keys(addedOrChangedMap);
            for (var i_1 = 0, len_1 = keys.length; i_1 < len_1; i_1++) {
                var id = keys[i_1];
                if (!usedMap.hasOwnProperty(id)) {
                    theirDecoration = addedOrChangedMap[id];
                    myDecoration = new ViewModelDecoration(theirDecoration, this.converter.convertModelRangeToViewRange(theirDecoration.range, theirDecoration.options.isWholeLine));
                    //				console.log(theirDecoration.range.toString() + '--->' + myDecoration.range.toString());
                    this.decorations.push(myDecoration);
                    if (myDecoration.options.inlineClassName) {
                        inlineDecorationsChanged = true;
                    }
                    somethingChanged = true;
                }
            }
            if (somethingChanged) {
                this._clearCachedModelDecorationsResolver();
                this.decorations.sort(ViewModelDecorations.compareDecorations);
                var newEvent = {
                    inlineDecorationsChanged: inlineDecorationsChanged
                };
                emit(editorCommon.ViewEventNames.DecorationsChangedEvent, newEvent);
            }
        };
        ViewModelDecorations.prototype.onLineMappingChanged = function (emit) {
            var decorations = this.decorations, d, i, newRange, somethingChanged = false, inlineDecorationsChanged = false, len;
            for (i = 0, len = decorations.length; i < len; i++) {
                d = decorations[i];
                newRange = this.converter.convertModelRangeToViewRange(d.modelRange, d.options.isWholeLine);
                if (!inlineDecorationsChanged && d.options.inlineClassName && !range_1.Range.equalsRange(newRange, d.range)) {
                    inlineDecorationsChanged = true;
                }
                if (!somethingChanged && !range_1.Range.equalsRange(newRange, d.range)) {
                    somethingChanged = true;
                }
                d.range = newRange;
            }
            if (somethingChanged) {
                this._clearCachedModelDecorationsResolver();
                this.decorations.sort(ViewModelDecorations.compareDecorations);
                var newEvent = {
                    inlineDecorationsChanged: inlineDecorationsChanged
                };
                emit(editorCommon.ViewEventNames.DecorationsChangedEvent, newEvent);
            }
        };
        ViewModelDecorations.prototype.getAllDecorations = function () {
            return this.decorations;
        };
        ViewModelDecorations.prototype.getDecorationsViewportData = function (startLineNumber, endLineNumber) {
            var cacheIsValid = true;
            cacheIsValid = cacheIsValid && (this._cachedModelDecorationsResolver !== null);
            cacheIsValid = cacheIsValid && (this._cachedModelDecorationsResolverStartLineNumber === startLineNumber);
            cacheIsValid = cacheIsValid && (this._cachedModelDecorationsResolverEndLineNumber === endLineNumber);
            if (!cacheIsValid) {
                this._cachedModelDecorationsResolver = this._getDecorationsViewportData(startLineNumber, endLineNumber);
                this._cachedModelDecorationsResolverStartLineNumber = startLineNumber;
                this._cachedModelDecorationsResolverEndLineNumber = endLineNumber;
            }
            return this._cachedModelDecorationsResolver;
        };
        ViewModelDecorations.prototype._getDecorationsViewportData = function (startLineNumber, endLineNumber) {
            var decorationsInViewport = [], inlineDecorations = [], j, intersectedStartLineNumber, intersectedEndLineNumber, decorations = this.decorations, d, r, i, len;
            for (j = startLineNumber; j <= endLineNumber; j++) {
                inlineDecorations[j - startLineNumber] = [];
            }
            for (i = 0, len = decorations.length; i < len; i++) {
                d = decorations[i];
                r = d.range;
                if (r.startLineNumber > endLineNumber) {
                    // Decorations are sorted ascending by line number, it is safe to stop now
                    break;
                }
                if (r.endLineNumber < startLineNumber) {
                    continue;
                }
                decorationsInViewport.push(d);
                if (d.options.inlineClassName) {
                    intersectedStartLineNumber = Math.max(startLineNumber, r.startLineNumber);
                    intersectedEndLineNumber = Math.min(endLineNumber, r.endLineNumber);
                    for (j = intersectedStartLineNumber; j <= intersectedEndLineNumber; j++) {
                        inlineDecorations[j - startLineNumber].push(d);
                    }
                }
            }
            return {
                decorations: decorationsInViewport,
                inlineDecorations: inlineDecorations
            };
        };
        return ViewModelDecorations;
    }());
    exports.ViewModelDecorations = ViewModelDecorations;
});
