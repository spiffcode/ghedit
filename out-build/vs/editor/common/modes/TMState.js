define(["require", "exports", 'vs/editor/common/modes/abstractState'], function (require, exports, abstractState_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function stackElementEquals(a, b) {
        if (!a && !b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        // Not comparing enterPos since it does not represent state across lines
        return (a.ruleId === b.ruleId
            && a.endRule === b.endRule
            && a.scopeName === b.scopeName
            && a.contentName === b.contentName);
    }
    var TMState = (function () {
        function TMState(mode, parentEmbedderState, ruleStack) {
            this._mode = mode;
            this._parentEmbedderState = parentEmbedderState;
            this._ruleStack = ruleStack || null;
        }
        TMState.prototype.clone = function () {
            var parentEmbedderStateClone = abstractState_1.AbstractState.safeClone(this._parentEmbedderState);
            var ruleStackClone = null;
            if (this._ruleStack) {
                ruleStackClone = [];
                for (var i = 0, len = this._ruleStack.length; i < len; i++) {
                    var rule = this._ruleStack[i];
                    ruleStackClone.push(rule.clone());
                }
            }
            return new TMState(this._mode, parentEmbedderStateClone, ruleStackClone);
        };
        TMState.prototype.equals = function (other) {
            if (!other || !(other instanceof TMState)) {
                return false;
            }
            var otherState = other;
            // Equals on `_parentEmbedderState`
            if (!abstractState_1.AbstractState.safeEquals(this._parentEmbedderState, otherState._parentEmbedderState)) {
                return false;
            }
            // Equals on `_ruleStack`
            if (this._ruleStack === null && otherState._ruleStack === null) {
                return true;
            }
            if (this._ruleStack === null || otherState._ruleStack === null) {
                return false;
            }
            if (this._ruleStack.length !== otherState._ruleStack.length) {
                return false;
            }
            for (var i = 0, len = this._ruleStack.length; i < len; i++) {
                if (!stackElementEquals(this._ruleStack[i], otherState._ruleStack[i])) {
                    return false;
                }
            }
            return true;
        };
        TMState.prototype.getMode = function () {
            return this._mode;
        };
        TMState.prototype.tokenize = function (stream) {
            throw new Error();
        };
        TMState.prototype.getStateData = function () {
            return this._parentEmbedderState;
        };
        TMState.prototype.setStateData = function (state) {
            this._parentEmbedderState = state;
        };
        TMState.prototype.getRuleStack = function () {
            return this._ruleStack;
        };
        TMState.prototype.setRuleStack = function (ruleStack) {
            this._ruleStack = ruleStack;
        };
        return TMState;
    }());
    exports.TMState = TMState;
});
//# sourceMappingURL=TMState.js.map