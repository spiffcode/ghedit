define(["require", "exports", 'vs/editor/common/core/arrays'], function (require, exports, arrays_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ModeTransition = (function () {
        function ModeTransition(startIndex, mode) {
            this.startIndex = startIndex | 0;
            this.mode = mode;
        }
        ModeTransition.findIndexInSegmentsArray = function (arr, desiredIndex) {
            return arrays_1.Arrays.findIndexInSegmentsArray(arr, desiredIndex);
        };
        ModeTransition.create = function (modeTransitions) {
            var result = [];
            for (var i = 0, len = modeTransitions.length; i < len; i++) {
                var modeTransition = modeTransitions[i];
                result.push(new ModeTransition(modeTransition.startIndex, modeTransition.mode));
            }
            return result;
        };
        return ModeTransition;
    }());
    exports.ModeTransition = ModeTransition;
});
//# sourceMappingURL=modeTransition.js.map