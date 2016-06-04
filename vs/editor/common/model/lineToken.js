define(["require", "exports", 'vs/editor/common/core/arrays'], function (require, exports, arrays_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /**
     * A token on a line.
     */
    var LineToken = (function () {
        function LineToken(startIndex, type) {
            this.startIndex = startIndex | 0; // @perf
            this.type = type;
        }
        LineToken.prototype.equals = function (other) {
            return (this.startIndex === other.startIndex
                && this.type === other.type);
        };
        LineToken.findIndexInSegmentsArray = function (arr, desiredIndex) {
            return arrays_1.Arrays.findIndexInSegmentsArray(arr, desiredIndex);
        };
        LineToken.equalsArray = function (a, b) {
            var aLen = a.length;
            var bLen = b.length;
            if (aLen !== bLen) {
                return false;
            }
            for (var i = 0; i < aLen; i++) {
                if (!a[i].equals(b[i])) {
                    return false;
                }
            }
            return true;
        };
        return LineToken;
    }());
    exports.LineToken = LineToken;
});
//# sourceMappingURL=lineToken.js.map