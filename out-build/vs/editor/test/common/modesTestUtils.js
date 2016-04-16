var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/editor/common/core/arrays', 'vs/editor/common/modes/supports/richEditSupport', 'vs/editor/test/common/mocks/mockMode', 'vs/editor/common/core/modeTransition'], function (require, exports, arrays_1, richEditSupport_1, mockMode_1, modeTransition_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ModeWithRichEditSupport = (function (_super) {
        __extends(ModeWithRichEditSupport, _super);
        function ModeWithRichEditSupport(id, wordRegExp) {
            _super.call(this, id);
            this.richEditSupport = new richEditSupport_1.RichEditSupport(id, null, {
                wordPattern: wordRegExp
            });
        }
        return ModeWithRichEditSupport;
    }(mockMode_1.MockMode));
    function createMockMode(id, wordRegExp) {
        if (wordRegExp === void 0) { wordRegExp = null; }
        return new ModeWithRichEditSupport(id, wordRegExp);
    }
    exports.createMockMode = createMockMode;
    function createLineContextFromTokenText(tokens) {
        var line = '';
        var processedTokens = [];
        var indexSoFar = 0;
        for (var i = 0; i < tokens.length; ++i) {
            processedTokens.push({ startIndex: indexSoFar, type: tokens[i].type });
            line += tokens[i].text;
            indexSoFar += tokens[i].text.length;
        }
        return new TestLineContext(line, processedTokens, null);
    }
    exports.createLineContextFromTokenText = createLineContextFromTokenText;
    function createMockLineContext(line, tokens) {
        return new TestLineContext(line, tokens.tokens, modeTransition_1.ModeTransition.create(tokens.modeTransitions));
    }
    exports.createMockLineContext = createMockLineContext;
    var TestLineContext = (function () {
        function TestLineContext(line, tokens, modeTransitions) {
            this.modeTransitions = modeTransitions;
            this._line = line;
            this._tokens = tokens;
        }
        TestLineContext.prototype.getLineContent = function () {
            return this._line;
        };
        TestLineContext.prototype.getTokenCount = function () {
            return this._tokens.length;
        };
        TestLineContext.prototype.getTokenStartIndex = function (tokenIndex) {
            return this._tokens[tokenIndex].startIndex;
        };
        TestLineContext.prototype.getTokenEndIndex = function (tokenIndex) {
            if (tokenIndex + 1 < this._tokens.length) {
                return this._tokens[tokenIndex + 1].startIndex;
            }
            return this._line.length;
        };
        TestLineContext.prototype.getTokenType = function (tokenIndex) {
            return this._tokens[tokenIndex].type;
        };
        TestLineContext.prototype.findIndexOfOffset = function (offset) {
            return arrays_1.Arrays.findIndexInSegmentsArray(this._tokens, offset);
        };
        TestLineContext.prototype.getTokenText = function (tokenIndex) {
            var startIndex = this._tokens[tokenIndex].startIndex;
            var endIndex = tokenIndex + 1 < this._tokens.length ? this._tokens[tokenIndex + 1].startIndex : this._line.length;
            return this._line.substring(startIndex, endIndex);
        };
        return TestLineContext;
    }());
});
//# sourceMappingURL=modesTestUtils.js.map