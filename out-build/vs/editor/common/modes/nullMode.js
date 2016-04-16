define(["require", "exports", 'vs/editor/common/config/defaultConfig'], function (require, exports, defaultConfig_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var NullState = (function () {
        function NullState(mode, stateData) {
            this.mode = mode;
            this.stateData = stateData;
        }
        NullState.prototype.clone = function () {
            var stateDataClone = (this.stateData ? this.stateData.clone() : null);
            return new NullState(this.mode, stateDataClone);
        };
        NullState.prototype.equals = function (other) {
            if (this.mode !== other.getMode()) {
                return false;
            }
            var otherStateData = other.getStateData();
            if (!this.stateData && !otherStateData) {
                return true;
            }
            if (this.stateData && otherStateData) {
                return this.stateData.equals(otherStateData);
            }
            return false;
        };
        NullState.prototype.getMode = function () {
            return this.mode;
        };
        NullState.prototype.tokenize = function (stream) {
            stream.advanceToEOS();
            return { type: '' };
        };
        NullState.prototype.getStateData = function () {
            return this.stateData;
        };
        NullState.prototype.setStateData = function (stateData) {
            this.stateData = stateData;
        };
        return NullState;
    }());
    exports.NullState = NullState;
    var NullMode = (function () {
        function NullMode() {
            this.richEditSupport = {
                wordDefinition: NullMode.DEFAULT_WORD_REGEXP
            };
        }
        /**
         * Create a word definition regular expression based on default word separators.
         * Optionally provide allowed separators that should be included in words.
         *
         * The default would look like this:
         * /(-?\d*\.\d\w*)|([^\`\~\!\@\#\$\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g
         */
        NullMode.createWordRegExp = function (allowInWords) {
            if (allowInWords === void 0) { allowInWords = ''; }
            var usualSeparators = defaultConfig_1.USUAL_WORD_SEPARATORS;
            var source = '(-?\\d*\\.\\d\\w*)|([^';
            for (var i = 0; i < usualSeparators.length; i++) {
                if (allowInWords.indexOf(usualSeparators[i]) >= 0) {
                    continue;
                }
                source += '\\' + usualSeparators[i];
            }
            source += '\\s]+)';
            return new RegExp(source, 'g');
        };
        NullMode.prototype.getId = function () {
            return NullMode.ID;
        };
        NullMode.prototype.toSimplifiedMode = function () {
            return this;
        };
        // catches numbers (including floating numbers) in the first group, and alphanum in the second
        NullMode.DEFAULT_WORD_REGEXP = NullMode.createWordRegExp();
        NullMode.ID = 'vs.editor.modes.nullMode';
        return NullMode;
    }());
    exports.NullMode = NullMode;
    function nullTokenize(mode, buffer, state, deltaOffset, stopAtOffset) {
        if (deltaOffset === void 0) { deltaOffset = 0; }
        var tokens = [
            {
                startIndex: deltaOffset,
                type: ''
            }
        ];
        var modeTransitions = [
            {
                startIndex: deltaOffset,
                mode: mode
            }
        ];
        return {
            tokens: tokens,
            actualStopOffset: deltaOffset + buffer.length,
            endState: state,
            modeTransitions: modeTransitions
        };
    }
    exports.nullTokenize = nullTokenize;
});
