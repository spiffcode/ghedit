define(["require", "exports", 'vs/editor/common/editorCommon', 'vs/editor/common/model/tokensBinaryEncoding'], function (require, exports, editorCommon_1, TokensBinaryEncoding) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var FilteredLineTokens = (function () {
        function FilteredLineTokens() {
        }
        /**
         * [startOffset; endOffset) (i.e. do not include endOffset)
         */
        FilteredLineTokens.create = function (original, startOffset, endOffset, deltaStartIndex) {
            var inflatedTokens = TokensBinaryEncoding.sliceAndInflate(original.getBinaryEncodedTokensMap(), original.getBinaryEncodedTokens(), startOffset, endOffset, deltaStartIndex);
            return new editorCommon_1.ViewLineTokens(inflatedTokens, deltaStartIndex, endOffset - startOffset + deltaStartIndex);
        };
        return FilteredLineTokens;
    }());
    exports.FilteredLineTokens = FilteredLineTokens;
    var IdentityFilteredLineTokens = (function () {
        function IdentityFilteredLineTokens() {
        }
        IdentityFilteredLineTokens.create = function (original, textLength) {
            var inflatedTokens = TokensBinaryEncoding.inflateArr(original.getBinaryEncodedTokensMap(), original.getBinaryEncodedTokens());
            return new editorCommon_1.ViewLineTokens(inflatedTokens, 0, textLength);
        };
        return IdentityFilteredLineTokens;
    }());
    exports.IdentityFilteredLineTokens = IdentityFilteredLineTokens;
});
