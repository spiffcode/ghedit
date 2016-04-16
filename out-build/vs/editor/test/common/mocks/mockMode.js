var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/editor/common/modes/abstractState', 'vs/editor/common/modes/supports/tokenizationSupport'], function (require, exports, abstractState_1, tokenizationSupport_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var MockMode = (function () {
        function MockMode(id) {
            if (id === void 0) { id = 'mockMode'; }
            this._id = id;
        }
        MockMode.prototype.getId = function () {
            return this._id;
        };
        MockMode.prototype.toSimplifiedMode = function () {
            return this;
        };
        return MockMode;
    }());
    exports.MockMode = MockMode;
    var StateForMockTokenizingMode = (function (_super) {
        __extends(StateForMockTokenizingMode, _super);
        function StateForMockTokenizingMode(mode, tokenType) {
            _super.call(this, mode);
            this._tokenType = tokenType;
        }
        StateForMockTokenizingMode.prototype.makeClone = function () {
            return this;
        };
        StateForMockTokenizingMode.prototype.equals = function (other) {
            return true;
        };
        StateForMockTokenizingMode.prototype.tokenize = function (stream) {
            stream.advanceToEOS();
            return { type: this._tokenType };
        };
        return StateForMockTokenizingMode;
    }(abstractState_1.AbstractState));
    exports.StateForMockTokenizingMode = StateForMockTokenizingMode;
    var MockTokenizingMode = (function (_super) {
        __extends(MockTokenizingMode, _super);
        function MockTokenizingMode(id, tokenType) {
            var _this = this;
            _super.call(this, id);
            this.tokenizationSupport = new tokenizationSupport_1.TokenizationSupport(this, {
                getInitialState: function () { return new StateForMockTokenizingMode(_this, tokenType); }
            }, false, false);
        }
        return MockTokenizingMode;
    }(MockMode));
    exports.MockTokenizingMode = MockTokenizingMode;
});
//# sourceMappingURL=mockMode.js.map