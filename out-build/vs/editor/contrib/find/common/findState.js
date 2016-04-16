define(["require", "exports", 'vs/base/common/eventEmitter', 'vs/editor/common/core/range'], function (require, exports, eventEmitter_1, range_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var FindReplaceState = (function () {
        function FindReplaceState() {
            this._searchString = '';
            this._replaceString = '';
            this._isRevealed = false;
            this._isReplaceRevealed = false;
            this._isRegex = false;
            this._wholeWord = false;
            this._matchCase = false;
            this._searchScope = null;
            this._matchesPosition = 0;
            this._matchesCount = 0;
            this._eventEmitter = new eventEmitter_1.EventEmitter();
        }
        Object.defineProperty(FindReplaceState.prototype, "searchString", {
            get: function () { return this._searchString; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FindReplaceState.prototype, "replaceString", {
            get: function () { return this._replaceString; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FindReplaceState.prototype, "isRevealed", {
            get: function () { return this._isRevealed; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FindReplaceState.prototype, "isReplaceRevealed", {
            get: function () { return this._isReplaceRevealed; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FindReplaceState.prototype, "isRegex", {
            get: function () { return this._isRegex; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FindReplaceState.prototype, "wholeWord", {
            get: function () { return this._wholeWord; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FindReplaceState.prototype, "matchCase", {
            get: function () { return this._matchCase; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FindReplaceState.prototype, "searchScope", {
            get: function () { return this._searchScope; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FindReplaceState.prototype, "matchesPosition", {
            get: function () { return this._matchesPosition; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FindReplaceState.prototype, "matchesCount", {
            get: function () { return this._matchesCount; },
            enumerable: true,
            configurable: true
        });
        FindReplaceState.prototype.dispose = function () {
            this._eventEmitter.dispose();
        };
        FindReplaceState.prototype.addChangeListener = function (listener) {
            return this._eventEmitter.addListener2(FindReplaceState._CHANGED_EVENT, listener);
        };
        FindReplaceState.prototype.changeMatchInfo = function (matchesPosition, matchesCount) {
            var changeEvent = {
                moveCursor: false,
                searchString: false,
                replaceString: false,
                isRevealed: false,
                isReplaceRevealed: false,
                isRegex: false,
                wholeWord: false,
                matchCase: false,
                searchScope: false,
                matchesPosition: false,
                matchesCount: false
            };
            var somethingChanged = false;
            if (matchesCount === 0) {
                matchesPosition = 0;
            }
            if (matchesPosition > matchesCount) {
                matchesPosition = matchesCount;
            }
            if (this._matchesPosition !== matchesPosition) {
                this._matchesPosition = matchesPosition;
                changeEvent.matchesPosition = true;
                somethingChanged = true;
            }
            if (this._matchesCount !== matchesCount) {
                this._matchesCount = matchesCount;
                changeEvent.matchesCount = true;
                somethingChanged = true;
            }
            if (somethingChanged) {
                this._eventEmitter.emit(FindReplaceState._CHANGED_EVENT, changeEvent);
            }
        };
        FindReplaceState.prototype.change = function (newState, moveCursor) {
            var changeEvent = {
                moveCursor: moveCursor,
                searchString: false,
                replaceString: false,
                isRevealed: false,
                isReplaceRevealed: false,
                isRegex: false,
                wholeWord: false,
                matchCase: false,
                searchScope: false,
                matchesPosition: false,
                matchesCount: false
            };
            var somethingChanged = false;
            if (typeof newState.searchString !== 'undefined') {
                if (this._searchString !== newState.searchString) {
                    this._searchString = newState.searchString;
                    changeEvent.searchString = true;
                    somethingChanged = true;
                }
            }
            if (typeof newState.replaceString !== 'undefined') {
                if (this._replaceString !== newState.replaceString) {
                    this._replaceString = newState.replaceString;
                    changeEvent.replaceString = true;
                    somethingChanged = true;
                }
            }
            if (typeof newState.isRevealed !== 'undefined') {
                if (this._isRevealed !== newState.isRevealed) {
                    this._isRevealed = newState.isRevealed;
                    changeEvent.isRevealed = true;
                    somethingChanged = true;
                }
            }
            if (typeof newState.isReplaceRevealed !== 'undefined') {
                if (this._isReplaceRevealed !== newState.isReplaceRevealed) {
                    this._isReplaceRevealed = newState.isReplaceRevealed;
                    changeEvent.isReplaceRevealed = true;
                    somethingChanged = true;
                }
            }
            if (typeof newState.isRegex !== 'undefined') {
                if (this._isRegex !== newState.isRegex) {
                    this._isRegex = newState.isRegex;
                    changeEvent.isRegex = true;
                    somethingChanged = true;
                }
            }
            if (typeof newState.wholeWord !== 'undefined') {
                if (this._wholeWord !== newState.wholeWord) {
                    this._wholeWord = newState.wholeWord;
                    changeEvent.wholeWord = true;
                    somethingChanged = true;
                }
            }
            if (typeof newState.matchCase !== 'undefined') {
                if (this._matchCase !== newState.matchCase) {
                    this._matchCase = newState.matchCase;
                    changeEvent.matchCase = true;
                    somethingChanged = true;
                }
            }
            if (typeof newState.searchScope !== 'undefined') {
                if (!range_1.Range.equalsRange(this._searchScope, newState.searchScope)) {
                    this._searchScope = newState.searchScope;
                    changeEvent.searchScope = true;
                    somethingChanged = true;
                }
            }
            if (somethingChanged) {
                this._eventEmitter.emit(FindReplaceState._CHANGED_EVENT, changeEvent);
            }
        };
        FindReplaceState._CHANGED_EVENT = 'changed';
        return FindReplaceState;
    }());
    exports.FindReplaceState = FindReplaceState;
});
//# sourceMappingURL=findState.js.map