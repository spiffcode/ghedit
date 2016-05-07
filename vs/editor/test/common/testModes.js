var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/editor/common/modes/abstractState', 'vs/editor/common/modes/supports/richEditSupport', 'vs/editor/common/modes/supports/tokenizationSupport', 'vs/editor/test/common/mocks/mockMode'], function (require, exports, abstractState_1, richEditSupport_1, tokenizationSupport_1, mockMode_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var CommentState = (function (_super) {
        __extends(CommentState, _super);
        function CommentState(mode, stateCount) {
            _super.call(this, mode);
        }
        CommentState.prototype.makeClone = function () {
            return this;
        };
        CommentState.prototype.equals = function (other) {
            return true;
        };
        CommentState.prototype.tokenize = function (stream) {
            stream.advanceToEOS();
            return { type: 'state' };
        };
        return CommentState;
    }(abstractState_1.AbstractState));
    exports.CommentState = CommentState;
    var CommentMode = (function (_super) {
        __extends(CommentMode, _super);
        function CommentMode(commentsConfig) {
            var _this = this;
            _super.call(this);
            this.tokenizationSupport = new tokenizationSupport_1.TokenizationSupport(this, {
                getInitialState: function () { return new CommentState(_this, 0); }
            }, false, false);
            this.richEditSupport = {
                comments: commentsConfig
            };
        }
        return CommentMode;
    }(mockMode_1.MockMode));
    exports.CommentMode = CommentMode;
    var AbstractIndentingMode = (function (_super) {
        __extends(AbstractIndentingMode, _super);
        function AbstractIndentingMode() {
            _super.apply(this, arguments);
        }
        AbstractIndentingMode.prototype.getElectricCharacters = function () {
            return null;
        };
        AbstractIndentingMode.prototype.onElectricCharacter = function (context, offset) {
            return null;
        };
        AbstractIndentingMode.prototype.onEnter = function (context, offset) {
            return null;
        };
        return AbstractIndentingMode;
    }(mockMode_1.MockMode));
    exports.AbstractIndentingMode = AbstractIndentingMode;
    var ModelState1 = (function (_super) {
        __extends(ModelState1, _super);
        function ModelState1(mode) {
            _super.call(this, mode);
        }
        ModelState1.prototype.makeClone = function () {
            return this;
        };
        ModelState1.prototype.equals = function (other) {
            return this === other;
        };
        ModelState1.prototype.tokenize = function (stream) {
            this.getMode().calledFor.push(stream.next());
            stream.advanceToEOS();
            return { type: '' };
        };
        return ModelState1;
    }(abstractState_1.AbstractState));
    exports.ModelState1 = ModelState1;
    var ModelMode1 = (function (_super) {
        __extends(ModelMode1, _super);
        function ModelMode1() {
            var _this = this;
            _super.call(this);
            this.calledFor = [];
            this.tokenizationSupport = new tokenizationSupport_1.TokenizationSupport(this, {
                getInitialState: function () { return new ModelState1(_this); }
            }, false, false);
        }
        return ModelMode1;
    }(mockMode_1.MockMode));
    exports.ModelMode1 = ModelMode1;
    var ModelState2 = (function (_super) {
        __extends(ModelState2, _super);
        function ModelState2(mode, prevLineContent) {
            _super.call(this, mode);
            this.prevLineContent = prevLineContent;
        }
        ModelState2.prototype.makeClone = function () {
            return new ModelState2(this.getMode(), this.prevLineContent);
        };
        ModelState2.prototype.equals = function (other) {
            return (other instanceof ModelState2) && (this.prevLineContent === other.prevLineContent);
        };
        ModelState2.prototype.tokenize = function (stream) {
            var line = '';
            while (!stream.eos()) {
                line += stream.next();
            }
            this.prevLineContent = line;
            return { type: '' };
        };
        return ModelState2;
    }(abstractState_1.AbstractState));
    exports.ModelState2 = ModelState2;
    var ModelMode2 = (function (_super) {
        __extends(ModelMode2, _super);
        function ModelMode2() {
            var _this = this;
            _super.call(this);
            this.calledFor = null;
            this.tokenizationSupport = new tokenizationSupport_1.TokenizationSupport(this, {
                getInitialState: function () { return new ModelState2(_this, ''); }
            }, false, false);
        }
        return ModelMode2;
    }(mockMode_1.MockMode));
    exports.ModelMode2 = ModelMode2;
    var BracketMode = (function (_super) {
        __extends(BracketMode, _super);
        function BracketMode() {
            _super.call(this);
            this.richEditSupport = new richEditSupport_1.RichEditSupport(this.getId(), null, {
                brackets: [
                    ['{', '}'],
                    ['[', ']'],
                    ['(', ')'],
                ]
            });
        }
        return BracketMode;
    }(mockMode_1.MockMode));
    exports.BracketMode = BracketMode;
    var NState = (function (_super) {
        __extends(NState, _super);
        function NState(mode, n) {
            _super.call(this, mode);
            this.n = n;
            this.allResults = null;
        }
        NState.prototype.makeClone = function () {
            return this;
        };
        NState.prototype.equals = function (other) {
            return true;
        };
        NState.prototype.tokenize = function (stream) {
            var ndash = this.n, value = '';
            while (!stream.eos() && ndash > 0) {
                value += stream.next();
                ndash--;
            }
            return { type: 'n-' + (this.n - ndash) + '-' + value };
        };
        return NState;
    }(abstractState_1.AbstractState));
    exports.NState = NState;
    var NMode = (function (_super) {
        __extends(NMode, _super);
        function NMode(n) {
            var _this = this;
            _super.call(this);
            this.n = n;
            this.tokenizationSupport = new tokenizationSupport_1.TokenizationSupport(this, {
                getInitialState: function () { return new NState(_this, _this.n); }
            }, false, false);
        }
        return NMode;
    }(mockMode_1.MockMode));
    exports.NMode = NMode;
});
//# sourceMappingURL=testModes.js.map