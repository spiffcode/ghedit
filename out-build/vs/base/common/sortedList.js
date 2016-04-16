define(["require", "exports", 'vs/base/common/arrays'], function (require, exports, Arrays) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var SortedList = (function () {
        function SortedList(comparator) {
            this.keys = [];
            this.values = [];
            this.comparator = comparator || SortedList.DEFAULT_COMPARATOR;
        }
        Object.defineProperty(SortedList.prototype, "count", {
            get: function () {
                return this.keys.length;
            },
            enumerable: true,
            configurable: true
        });
        SortedList.prototype.getValueByIndex = function (index) {
            if (0 <= index && index < this.values.length) {
                return this.values[index];
            }
            return null;
        };
        SortedList.prototype.getKey = function (index) {
            if (0 <= index && index < this.keys.length) {
                return this.keys[index];
            }
            return null;
        };
        SortedList.prototype.getKeys = function () {
            return new ListIterator(this.keys);
        };
        SortedList.prototype.getValue = function (key) {
            if (!key) {
                throw new Error('Key must be defined.');
            }
            var indexOfKey = this.indexOfKey(key);
            if (indexOfKey >= 0) {
                return this.values[indexOfKey];
            }
            return null;
        };
        SortedList.prototype.getValues = function () {
            return new ListIterator(this.values);
        };
        SortedList.prototype.indexOfKey = function (key) {
            if (!key) {
                throw new Error('Key must be defined.');
            }
            return Math.max(-1, Arrays.binarySearch(this.keys, key, this.comparator));
        };
        SortedList.prototype.add = function (key, value) {
            if (!key || !value) {
                throw new Error('Key and value must be defined.');
            }
            var position = 0;
            while (position < this.keys.length && this.comparator(key, this.keys[position]) > 0) {
                position++;
            }
            this.keys.splice(position, 0, key);
            this.values.splice(position, 0, value);
        };
        SortedList.prototype.remove = function (key) {
            if (!key) {
                throw new Error('Key must be defined.');
            }
            var indexOfKey = this.indexOfKey(key);
            if (indexOfKey >= 0) {
                this.values.splice(indexOfKey, 1);
                this.keys.splice(indexOfKey, 1);
            }
            return indexOfKey >= 0;
        };
        SortedList.prototype.getIterator = function () {
            return new SortedListIterator(this.keys, this.values);
        };
        SortedList.DEFAULT_COMPARATOR = function (first, second) {
            return first < second ? -1 : first > second ? 1 : 0;
        };
        return SortedList;
    }());
    exports.SortedList = SortedList;
    var SortedListIterator = (function () {
        function SortedListIterator(keys, values) {
            this.keys = keys;
            this.values = values;
            this.index = -1;
        }
        Object.defineProperty(SortedListIterator.prototype, "current", {
            get: function () {
                if (this.index < 0 || this.keys.length < this.index) {
                    return null;
                }
                return {
                    key: this.keys[this.index],
                    value: this.values[this.index]
                };
            },
            enumerable: true,
            configurable: true
        });
        SortedListIterator.prototype.moveNext = function () {
            this.index++;
            return this.index < this.keys.length;
        };
        SortedListIterator.prototype.hasNext = function () {
            return this.index + 1 < this.keys.length;
        };
        SortedListIterator.prototype.reset = function () {
            this.index = -1;
        };
        SortedListIterator.prototype.dispose = function () {
            this.keys = null;
            this.values = null;
        };
        return SortedListIterator;
    }());
    var ListIterator = (function () {
        function ListIterator(values) {
            this.values = values;
            this.index = -1;
        }
        Object.defineProperty(ListIterator.prototype, "current", {
            get: function () {
                if (this.index < 0 || this.values.length < this.index) {
                    return null;
                }
                return this.values[this.index];
            },
            enumerable: true,
            configurable: true
        });
        ListIterator.prototype.moveNext = function () {
            this.index++;
            return this.index < this.values.length;
        };
        ListIterator.prototype.hasNext = function () {
            return this.index + 1 < this.values.length;
        };
        ListIterator.prototype.reset = function () {
            this.index = -1;
        };
        ListIterator.prototype.dispose = function () {
            this.values = null;
        };
        return ListIterator;
    }());
});
//# sourceMappingURL=sortedList.js.map