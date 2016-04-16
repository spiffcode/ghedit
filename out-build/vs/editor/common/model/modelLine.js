define(["require", "exports", 'vs/base/common/strings', 'vs/editor/common/model/tokensBinaryEncoding', 'vs/editor/common/core/modeTransition'], function (require, exports, strings, TokensBinaryEncoding, modeTransition_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var NO_OP_TOKENS_ADJUSTER = {
        adjust: function () { },
        finish: function () { }
    };
    var NO_OP_MARKERS_ADJUSTER = {
        adjustDelta: function () { },
        adjustSet: function () { },
        finish: function () { }
    };
    var MarkerMoveSemantics;
    (function (MarkerMoveSemantics) {
        MarkerMoveSemantics[MarkerMoveSemantics["MarkerDefined"] = 0] = "MarkerDefined";
        MarkerMoveSemantics[MarkerMoveSemantics["ForceMove"] = 1] = "ForceMove";
        MarkerMoveSemantics[MarkerMoveSemantics["ForceStay"] = 2] = "ForceStay";
    })(MarkerMoveSemantics || (MarkerMoveSemantics = {}));
    var ModelLine = (function () {
        function ModelLine(lineNumber, text) {
            this._lineNumber = lineNumber | 0;
            this._text = text;
            this._isInvalid = false;
            this._state = null;
            this._modeTransitions = null;
            this._lineTokens = null;
            this._markers = null;
        }
        Object.defineProperty(ModelLine.prototype, "lineNumber", {
            get: function () { return this._lineNumber; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ModelLine.prototype, "text", {
            get: function () { return this._text; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ModelLine.prototype, "isInvalid", {
            get: function () { return this._isInvalid; },
            set: function (value) { this._isInvalid = value; },
            enumerable: true,
            configurable: true
        });
        // --- BEGIN STATE
        ModelLine.prototype.setState = function (state) {
            this._state = state;
        };
        ModelLine.prototype.getState = function () {
            return this._state || null;
        };
        // --- END STATE
        // --- BEGIN MODE TRANSITIONS
        ModelLine.prototype.getModeTransitions = function (topLevelMode) {
            if (this._modeTransitions) {
                return this._modeTransitions;
            }
            else {
                return [new modeTransition_1.ModeTransition(0, topLevelMode)];
            }
        };
        // --- END MODE TRANSITIONS
        // --- BEGIN TOKENS
        ModelLine.prototype.setTokens = function (map, tokens, topLevelMode, modeTransitions) {
            this._lineTokens = toLineTokensFromInflated(map, tokens, this._text.length);
            this._modeTransitions = toModeTransitions(topLevelMode, modeTransitions);
        };
        ModelLine.prototype._setLineTokensFromDeflated = function (map, tokens) {
            this._lineTokens = toLineTokensFromDeflated(map, tokens, this._text.length);
        };
        ModelLine.prototype.getTokens = function () {
            if (this._lineTokens) {
                return this._lineTokens;
            }
            if (this._text.length === 0) {
                return EmptyLineTokens.INSTANCE;
            }
            return DefaultLineTokens.INSTANCE;
        };
        // --- END TOKENS
        ModelLine.prototype._createTokensAdjuster = function () {
            if (!this._lineTokens) {
                // This line does not have real tokens, so there is nothing to adjust
                return NO_OP_TOKENS_ADJUSTER;
            }
            var lineTokens = this._lineTokens;
            var BIN = TokensBinaryEncoding;
            var tokens = lineTokens.getBinaryEncodedTokens();
            var tokensLength = tokens.length;
            var tokensIndex = 0;
            var currentTokenStartIndex = 0;
            var adjust = function (toColumn, delta, minimumAllowedColumn) {
                // console.log('before call: tokensIndex: ' + tokensIndex + ': ' + String(this.getTokens()));
                // console.log('adjustTokens: ' + toColumn + ' with delta: ' + delta + ' and [' + minimumAllowedColumn + ']');
                // console.log('currentTokenStartIndex: ' + currentTokenStartIndex);
                var minimumAllowedIndex = minimumAllowedColumn - 1;
                while (currentTokenStartIndex < toColumn && tokensIndex < tokensLength) {
                    if (currentTokenStartIndex > 0 && delta !== 0) {
                        // adjust token's `startIndex` by `delta`
                        var deflatedType = (tokens[tokensIndex] / BIN.TYPE_OFFSET) & BIN.TYPE_MASK;
                        var newStartIndex = Math.max(minimumAllowedIndex, currentTokenStartIndex + delta);
                        var newToken = deflatedType * BIN.TYPE_OFFSET + newStartIndex * BIN.START_INDEX_OFFSET;
                        if (delta < 0) {
                            // pop all previous tokens that have become `collapsed`
                            while (tokensIndex > 0) {
                                var prevTokenStartIndex = (tokens[tokensIndex - 1] / BIN.START_INDEX_OFFSET) & BIN.START_INDEX_MASK;
                                if (prevTokenStartIndex >= newStartIndex) {
                                    // Token at `tokensIndex` - 1 is now `collapsed` => pop it
                                    tokens.splice(tokensIndex - 1, 1);
                                    tokensLength--;
                                    tokensIndex--;
                                }
                                else {
                                    break;
                                }
                            }
                        }
                        tokens[tokensIndex] = newToken;
                    }
                    tokensIndex++;
                    if (tokensIndex < tokensLength) {
                        currentTokenStartIndex = (tokens[tokensIndex] / BIN.START_INDEX_OFFSET) & BIN.START_INDEX_MASK;
                    }
                }
                // console.log('after call: tokensIndex: ' + tokensIndex + ': ' + String(this.getTokens()));
            };
            var finish = function (delta, lineTextLength) {
                adjust(Number.MAX_VALUE, delta, 1);
            };
            return {
                adjust: adjust,
                finish: finish
            };
        };
        ModelLine.prototype._setText = function (text) {
            this._text = text;
            if (this._lineTokens) {
                var BIN = TokensBinaryEncoding, map = this._lineTokens.getBinaryEncodedTokensMap(), tokens = this._lineTokens.getBinaryEncodedTokens(), lineTextLength = this._text.length;
                // Remove overflowing tokens
                while (tokens.length > 0) {
                    var lastTokenStartIndex = (tokens[tokens.length - 1] / BIN.START_INDEX_OFFSET) & BIN.START_INDEX_MASK;
                    if (lastTokenStartIndex < lineTextLength) {
                        // Valid token
                        break;
                    }
                    // This token now overflows the text => remove it
                    tokens.pop();
                }
                this._setLineTokensFromDeflated(map, tokens);
            }
        };
        // private _printMarkers(): string {
        // 	if (!this._markers) {
        // 		return '[]';
        // 	}
        // 	if (this._markers.length === 0) {
        // 		return '[]';
        // 	}
        // 	var markers = this._markers;
        // 	var printMarker = (m:ILineMarker) => {
        // 		if (m.stickToPreviousCharacter) {
        // 			return '|' + m.column;
        // 		}
        // 		return m.column + '|';
        // 	};
        // 	return '[' + markers.map(printMarker).join(', ') + ']';
        // }
        ModelLine.prototype._createMarkersAdjuster = function (changedMarkers) {
            var _this = this;
            if (!this._markers) {
                return NO_OP_MARKERS_ADJUSTER;
            }
            if (this._markers.length === 0) {
                return NO_OP_MARKERS_ADJUSTER;
            }
            this._markers.sort(ModelLine._compareMarkers);
            var markers = this._markers;
            var markersLength = markers.length;
            var markersIndex = 0;
            var marker = markers[markersIndex];
            // console.log('------------- INITIAL MARKERS: ' + this._printMarkers());
            var adjustMarkerBeforeColumn = function (toColumn, moveSemantics) {
                if (marker.column < toColumn) {
                    return true;
                }
                if (marker.column > toColumn) {
                    return false;
                }
                if (moveSemantics === MarkerMoveSemantics.ForceMove) {
                    return false;
                }
                if (moveSemantics === MarkerMoveSemantics.ForceStay) {
                    return true;
                }
                return marker.stickToPreviousCharacter;
            };
            var adjustDelta = function (toColumn, delta, minimumAllowedColumn, moveSemantics) {
                // console.log('------------------------------');
                // console.log('adjustDelta called: toColumn: ' + toColumn + ', delta: ' + delta + ', minimumAllowedColumn: ' + minimumAllowedColumn + ', moveSemantics: ' + MarkerMoveSemantics[moveSemantics]);
                // console.log('BEFORE::: markersIndex: ' + markersIndex + ' : ' + this._printMarkers());
                while (markersIndex < markersLength && adjustMarkerBeforeColumn(toColumn, moveSemantics)) {
                    if (delta !== 0) {
                        var newColumn = Math.max(minimumAllowedColumn, marker.column + delta);
                        if (marker.column !== newColumn) {
                            changedMarkers[marker.id] = true;
                            marker.oldLineNumber = marker.oldLineNumber || _this._lineNumber;
                            marker.oldColumn = marker.oldColumn || marker.column;
                            marker.column = newColumn;
                        }
                    }
                    markersIndex++;
                    if (markersIndex < markersLength) {
                        marker = markers[markersIndex];
                    }
                }
                // console.log('AFTER::: markersIndex: ' + markersIndex + ' : ' + this._printMarkers());
            };
            var adjustSet = function (toColumn, newColumn, moveSemantics) {
                // console.log('------------------------------');
                // console.log('adjustSet called: toColumn: ' + toColumn + ', newColumn: ' + newColumn + ', moveSemantics: ' + MarkerMoveSemantics[moveSemantics]);
                // console.log('BEFORE::: markersIndex: ' + markersIndex + ' : ' + this._printMarkers());
                while (markersIndex < markersLength && adjustMarkerBeforeColumn(toColumn, moveSemantics)) {
                    if (marker.column !== newColumn) {
                        changedMarkers[marker.id] = true;
                        marker.oldLineNumber = marker.oldLineNumber || _this._lineNumber;
                        marker.oldColumn = marker.oldColumn || marker.column;
                        marker.column = newColumn;
                    }
                    markersIndex++;
                    if (markersIndex < markersLength) {
                        marker = markers[markersIndex];
                    }
                }
                // console.log('AFTER::: markersIndex: ' + markersIndex + ' : ' + this._printMarkers());
            };
            var finish = function (delta, lineTextLength) {
                adjustDelta(Number.MAX_VALUE, delta, 1, MarkerMoveSemantics.MarkerDefined);
                // console.log('------------- FINAL MARKERS: ' + this._printMarkers());
            };
            return {
                adjustDelta: adjustDelta,
                adjustSet: adjustSet,
                finish: finish
            };
        };
        ModelLine.prototype.applyEdits = function (changedMarkers, edits) {
            var deltaColumn = 0;
            var resultText = this._text;
            var tokensAdjuster = this._createTokensAdjuster();
            var markersAdjuster = this._createMarkersAdjuster(changedMarkers);
            for (var i = 0, len = edits.length; i < len; i++) {
                var edit = edits[i];
                // console.log();
                // console.log('=============================');
                // console.log('EDIT #' + i + ' [ ' + edit.startColumn + ' -> ' + edit.endColumn + ' ] : <<<' + edit.text + '>>>, forceMoveMarkers: ' + edit.forceMoveMarkers);
                // console.log('deltaColumn: ' + deltaColumn);
                var startColumn = deltaColumn + edit.startColumn;
                var endColumn = deltaColumn + edit.endColumn;
                var deletingCnt = endColumn - startColumn;
                var insertingCnt = edit.text.length;
                // Adjust tokens & markers before this edit
                // console.log('Adjust tokens & markers before this edit');
                tokensAdjuster.adjust(edit.startColumn - 1, deltaColumn, 1);
                markersAdjuster.adjustDelta(edit.startColumn, deltaColumn, 1, edit.forceMoveMarkers ? MarkerMoveSemantics.ForceMove : (deletingCnt > 0 ? MarkerMoveSemantics.ForceStay : MarkerMoveSemantics.MarkerDefined));
                // Adjust tokens & markers for the common part of this edit
                var commonLength = Math.min(deletingCnt, insertingCnt);
                if (commonLength > 0) {
                    // console.log('Adjust tokens & markers for the common part of this edit');
                    tokensAdjuster.adjust(edit.startColumn - 1 + commonLength, deltaColumn, startColumn);
                    if (!edit.forceMoveMarkers) {
                        markersAdjuster.adjustDelta(edit.startColumn + commonLength, deltaColumn, startColumn, edit.forceMoveMarkers ? MarkerMoveSemantics.ForceMove : (deletingCnt > insertingCnt ? MarkerMoveSemantics.ForceStay : MarkerMoveSemantics.MarkerDefined));
                    }
                }
                // Perform the edit & update `deltaColumn`
                resultText = resultText.substring(0, startColumn - 1) + edit.text + resultText.substring(endColumn - 1);
                deltaColumn += insertingCnt - deletingCnt;
                // Adjust tokens & markers inside this edit
                // console.log('Adjust tokens & markers inside this edit');
                tokensAdjuster.adjust(edit.endColumn, deltaColumn, startColumn);
                markersAdjuster.adjustSet(edit.endColumn, startColumn + insertingCnt, edit.forceMoveMarkers ? MarkerMoveSemantics.ForceMove : MarkerMoveSemantics.MarkerDefined);
            }
            // Wrap up tokens & markers; adjust remaining if needed
            tokensAdjuster.finish(deltaColumn, resultText.length);
            markersAdjuster.finish(deltaColumn, resultText.length);
            // Save the resulting text
            this._setText(resultText);
            return deltaColumn;
        };
        ModelLine.prototype.split = function (changedMarkers, splitColumn, forceMoveMarkers) {
            // console.log('--> split @ ' + splitColumn + '::: ' + this._printMarkers());
            var myText = this._text.substring(0, splitColumn - 1);
            var otherText = this._text.substring(splitColumn - 1);
            var otherMarkers = null;
            if (this._markers) {
                this._markers.sort(ModelLine._compareMarkers);
                for (var i = 0, len = this._markers.length; i < len; i++) {
                    var marker = this._markers[i];
                    if (marker.column > splitColumn
                        || (marker.column === splitColumn
                            && (forceMoveMarkers
                                || !marker.stickToPreviousCharacter))) {
                        var myMarkers = this._markers.slice(0, i);
                        otherMarkers = this._markers.slice(i);
                        this._markers = myMarkers;
                        break;
                    }
                }
                if (otherMarkers) {
                    for (var i = 0, len = otherMarkers.length; i < len; i++) {
                        var marker = otherMarkers[i];
                        changedMarkers[marker.id] = true;
                        marker.oldLineNumber = marker.oldLineNumber || this._lineNumber;
                        marker.oldColumn = marker.oldColumn || marker.column;
                        marker.column -= splitColumn - 1;
                    }
                }
            }
            this._setText(myText);
            var otherLine = new ModelLine(this._lineNumber + 1, otherText);
            if (otherMarkers) {
                otherLine.addMarkers(otherMarkers);
            }
            return otherLine;
        };
        ModelLine.prototype.append = function (changedMarkers, other) {
            // console.log('--> append: THIS :: ' + this._printMarkers());
            // console.log('--> append: OTHER :: ' + this._printMarkers());
            var thisTextLength = this._text.length;
            this._setText(this._text + other._text);
            var otherLineTokens = other._lineTokens;
            if (otherLineTokens) {
                // Other has real tokens
                var otherTokens = otherLineTokens.getBinaryEncodedTokens();
                // Adjust other tokens
                if (thisTextLength > 0) {
                    var BIN = TokensBinaryEncoding;
                    for (var i = 0, len = otherTokens.length; i < len; i++) {
                        var token = otherTokens[i];
                        var deflatedStartIndex = (token / BIN.START_INDEX_OFFSET) & BIN.START_INDEX_MASK;
                        var deflatedType = (token / BIN.TYPE_OFFSET) & BIN.TYPE_MASK;
                        var newStartIndex = deflatedStartIndex + thisTextLength;
                        var newToken = deflatedType * BIN.TYPE_OFFSET + newStartIndex * BIN.START_INDEX_OFFSET;
                        otherTokens[i] = newToken;
                    }
                }
                // Append other tokens
                var myLineTokens = this._lineTokens;
                if (myLineTokens) {
                    // I have real tokens
                    this._setLineTokensFromDeflated(myLineTokens.getBinaryEncodedTokensMap(), myLineTokens.getBinaryEncodedTokens().concat(otherTokens));
                }
                else {
                    // I don't have real tokens
                    this._setLineTokensFromDeflated(otherLineTokens.getBinaryEncodedTokensMap(), otherTokens);
                }
            }
            if (other._markers) {
                // Other has markers
                var otherMarkers = other._markers;
                // Adjust other markers
                for (var i = 0, len = otherMarkers.length; i < len; i++) {
                    var marker = otherMarkers[i];
                    changedMarkers[marker.id] = true;
                    marker.oldLineNumber = marker.oldLineNumber || other.lineNumber;
                    marker.oldColumn = marker.oldColumn || marker.column;
                    marker.column += thisTextLength;
                }
                this.addMarkers(otherMarkers);
            }
        };
        ModelLine.prototype.addMarker = function (marker) {
            marker.line = this;
            if (!this._markers) {
                this._markers = [marker];
            }
            else {
                this._markers.push(marker);
            }
        };
        ModelLine.prototype.addMarkers = function (markers) {
            if (markers.length === 0) {
                return;
            }
            var i, len;
            for (i = 0, len = markers.length; i < len; i++) {
                markers[i].line = this;
            }
            if (!this._markers) {
                this._markers = markers.slice(0);
            }
            else {
                this._markers = this._markers.concat(markers);
            }
        };
        ModelLine._compareMarkers = function (a, b) {
            if (a.column === b.column) {
                return (a.stickToPreviousCharacter ? 0 : 1) - (b.stickToPreviousCharacter ? 0 : 1);
            }
            return a.column - b.column;
        };
        ModelLine.prototype.removeMarker = function (marker) {
            if (!this._markers) {
                return;
            }
            var index = this._indexOfMarkerId(marker.id);
            if (index >= 0) {
                marker.line = null;
                this._markers.splice(index, 1);
            }
            if (this._markers.length === 0) {
                this._markers = null;
            }
        };
        ModelLine.prototype.removeMarkers = function (deleteMarkers) {
            if (!this._markers) {
                return;
            }
            for (var i = 0, len = this._markers.length; i < len; i++) {
                var marker = this._markers[i];
                if (deleteMarkers[marker.id]) {
                    marker.line = null;
                    this._markers.splice(i, 1);
                    len--;
                    i--;
                }
            }
            if (this._markers.length === 0) {
                this._markers = null;
            }
        };
        ModelLine.prototype.getMarkers = function () {
            if (!this._markers) {
                return [];
            }
            return this._markers.slice(0);
        };
        ModelLine.prototype.updateLineNumber = function (changedMarkers, newLineNumber) {
            if (this._markers) {
                var markers = this._markers, i, len, marker;
                for (i = 0, len = markers.length; i < len; i++) {
                    marker = markers[i];
                    changedMarkers[marker.id] = true;
                    marker.oldLineNumber = marker.oldLineNumber || this._lineNumber;
                }
            }
            this._lineNumber = newLineNumber;
        };
        ModelLine.prototype.deleteLine = function (changedMarkers, setMarkersColumn, setMarkersOldLineNumber) {
            // console.log('--> deleteLine: ');
            if (this._markers) {
                var markers = this._markers, i, len, marker;
                // Mark all these markers as changed
                for (i = 0, len = markers.length; i < len; i++) {
                    marker = markers[i];
                    changedMarkers[marker.id] = true;
                    marker.oldColumn = marker.oldColumn || marker.column;
                    marker.oldLineNumber = marker.oldLineNumber || setMarkersOldLineNumber;
                    marker.column = setMarkersColumn;
                }
                return markers;
            }
            return [];
        };
        ModelLine.prototype._indexOfMarkerId = function (markerId) {
            var markers = this._markers;
            for (var i = 0, len = markers.length; i < len; i++) {
                if (markers[i].id === markerId) {
                    return i;
                }
            }
        };
        return ModelLine;
    }());
    exports.ModelLine = ModelLine;
    function toLineTokensFromInflated(map, tokens, textLength) {
        if (textLength === 0) {
            return null;
        }
        if (!tokens || tokens.length === 0) {
            return null;
        }
        if (tokens.length === 1) {
            if (tokens[0].startIndex === 0 && tokens[0].type === '') {
                return null;
            }
        }
        var deflated = TokensBinaryEncoding.deflateArr(map, tokens);
        return new LineTokens(map, deflated);
    }
    function toLineTokensFromDeflated(map, tokens, textLength) {
        if (textLength === 0) {
            return null;
        }
        if (!tokens || tokens.length === 0) {
            return null;
        }
        if (tokens.length === 1) {
            if (tokens[0] === 0) {
                return null;
            }
        }
        return new LineTokens(map, tokens);
    }
    var getStartIndex = TokensBinaryEncoding.getStartIndex;
    var getType = TokensBinaryEncoding.getType;
    var findIndexOfOffset = TokensBinaryEncoding.findIndexOfOffset;
    var LineTokens = (function () {
        function LineTokens(map, tokens) {
            this.map = map;
            this._tokens = tokens;
        }
        LineTokens.prototype.getBinaryEncodedTokensMap = function () {
            return this.map;
        };
        LineTokens.prototype.getBinaryEncodedTokens = function () {
            return this._tokens;
        };
        LineTokens.prototype.getTokenCount = function () {
            return this._tokens.length;
        };
        LineTokens.prototype.getTokenStartIndex = function (tokenIndex) {
            return getStartIndex(this._tokens[tokenIndex]);
        };
        LineTokens.prototype.getTokenType = function (tokenIndex) {
            return getType(this.map, this._tokens[tokenIndex]);
        };
        LineTokens.prototype.getTokenEndIndex = function (tokenIndex, textLength) {
            if (tokenIndex + 1 < this._tokens.length) {
                return getStartIndex(this._tokens[tokenIndex + 1]);
            }
            return textLength;
        };
        LineTokens.prototype.equals = function (other) {
            return this === other;
        };
        LineTokens.prototype.findIndexOfOffset = function (offset) {
            return findIndexOfOffset(this._tokens, offset);
        };
        return LineTokens;
    }());
    exports.LineTokens = LineTokens;
    var EmptyLineTokens = (function () {
        function EmptyLineTokens() {
        }
        EmptyLineTokens.prototype.getBinaryEncodedTokens = function () {
            return EmptyLineTokens.TOKENS;
        };
        EmptyLineTokens.prototype.getBinaryEncodedTokensMap = function () {
            return null;
        };
        EmptyLineTokens.prototype.getTokenCount = function () {
            return 0;
        };
        EmptyLineTokens.prototype.getTokenStartIndex = function (tokenIndex) {
            return 0;
        };
        EmptyLineTokens.prototype.getTokenType = function (tokenIndex) {
            return strings.empty;
        };
        EmptyLineTokens.prototype.getTokenEndIndex = function (tokenIndex, textLength) {
            return 0;
        };
        EmptyLineTokens.prototype.equals = function (other) {
            return other === this;
        };
        EmptyLineTokens.prototype.findIndexOfOffset = function (offset) {
            return 0;
        };
        EmptyLineTokens.INSTANCE = new EmptyLineTokens();
        EmptyLineTokens.TOKENS = [];
        return EmptyLineTokens;
    }());
    var DefaultLineTokens = (function () {
        function DefaultLineTokens() {
        }
        DefaultLineTokens.prototype.getBinaryEncodedTokensMap = function () {
            return null;
        };
        DefaultLineTokens.prototype.getBinaryEncodedTokens = function () {
            return DefaultLineTokens.TOKENS;
        };
        DefaultLineTokens.prototype.getTokenCount = function () {
            return 1;
        };
        DefaultLineTokens.prototype.getTokenStartIndex = function (tokenIndex) {
            return 0;
        };
        DefaultLineTokens.prototype.getTokenType = function (tokenIndex) {
            return strings.empty;
        };
        DefaultLineTokens.prototype.getTokenEndIndex = function (tokenIndex, textLength) {
            return textLength;
        };
        DefaultLineTokens.prototype.equals = function (other) {
            return this === other;
        };
        DefaultLineTokens.prototype.findIndexOfOffset = function (offset) {
            return 0;
        };
        DefaultLineTokens.INSTANCE = new DefaultLineTokens();
        DefaultLineTokens.TOKENS = [0];
        return DefaultLineTokens;
    }());
    exports.DefaultLineTokens = DefaultLineTokens;
    function toModeTransitions(topLevelMode, modeTransitions) {
        if (!modeTransitions || modeTransitions.length === 0) {
            return null;
        }
        else if (modeTransitions.length === 1 && modeTransitions[0].startIndex === 0 && modeTransitions[0].mode === topLevelMode) {
            return null;
        }
        return modeTransitions;
    }
});
