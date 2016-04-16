define(["require", "exports"], function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var AbstractState = (function () {
        function AbstractState(mode, stateData) {
            if (stateData === void 0) { stateData = null; }
            this.mode = mode;
            this.stateData = stateData;
        }
        AbstractState.prototype.getMode = function () {
            return this.mode;
        };
        AbstractState.prototype.clone = function () {
            var result = this.makeClone();
            result.initializeFrom(this);
            return result;
        };
        AbstractState.prototype.makeClone = function () {
            throw new Error('Abstract Method');
        };
        AbstractState.prototype.initializeFrom = function (other) {
            this.stateData = other.stateData !== null ? other.stateData.clone() : null;
        };
        AbstractState.prototype.getStateData = function () {
            return this.stateData;
        };
        AbstractState.prototype.setStateData = function (state) {
            this.stateData = state;
        };
        AbstractState.prototype.equals = function (other) {
            if (other === null || this.mode !== other.getMode()) {
                return false;
            }
            if (other instanceof AbstractState) {
                return AbstractState.safeEquals(this.stateData, other.stateData);
            }
            return false;
        };
        AbstractState.prototype.tokenize = function (stream) {
            throw new Error('Abstract Method');
        };
        AbstractState.safeEquals = function (a, b) {
            if (a === null && b === null) {
                return true;
            }
            if (a === null || b === null) {
                return false;
            }
            return a.equals(b);
        };
        AbstractState.safeClone = function (state) {
            if (state) {
                return state.clone();
            }
            return null;
        };
        return AbstractState;
    }());
    exports.AbstractState = AbstractState;
});
