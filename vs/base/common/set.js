/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    'use strict';
    var ArraySet = (function () {
        function ArraySet(elements) {
            if (elements === void 0) { elements = []; }
            this._elements = elements.slice();
        }
        ArraySet.prototype.set = function (element) {
            this.unset(element);
            this._elements.push(element);
        };
        ArraySet.prototype.unset = function (element) {
            var index = this._elements.indexOf(element);
            if (index > -1) {
                this._elements.splice(index, 1);
            }
        };
        Object.defineProperty(ArraySet.prototype, "elements", {
            get: function () {
                return this._elements;
            },
            enumerable: true,
            configurable: true
        });
        return ArraySet;
    }());
    exports.ArraySet = ArraySet;
});
//# sourceMappingURL=set.js.map