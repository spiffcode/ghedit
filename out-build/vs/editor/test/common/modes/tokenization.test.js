var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'assert', 'vs/base/common/lifecycle', 'vs/editor/common/modes/abstractState', 'vs/editor/common/modes/supports', 'vs/editor/common/modes/supports/tokenizationSupport', 'vs/editor/test/common/modesTestUtils', 'vs/editor/test/common/mocks/mockMode'], function (require, exports, assert, lifecycle_1, abstractState_1, supports_1, tokenizationSupport_1, modesTestUtils_1, mockMode_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var State = (function (_super) {
        __extends(State, _super);
        function State(mode) {
            _super.call(this, mode);
        }
        State.prototype.makeClone = function () {
            return new State(this.getMode());
        };
        State.prototype.tokenize = function (stream) {
            return { type: stream.next() === '.' ? '' : 'text' };
        };
        return State;
    }(abstractState_1.AbstractState));
    exports.State = State;
    var Mode = (function (_super) {
        __extends(Mode, _super);
        function Mode() {
            var _this = this;
            _super.call(this);
            this.tokenizationSupport = new tokenizationSupport_1.TokenizationSupport(this, {
                getInitialState: function () { return new State(_this); }
            }, false, false);
        }
        return Mode;
    }(mockMode_1.MockMode));
    exports.Mode = Mode;
    function checkTokens(actual, expected) {
        assert.equal(actual.length, expected.length);
        for (var i = 0; i < expected.length; i++) {
            for (var key in expected[i]) {
                assert.deepEqual(actual[i][key], expected[i][key]);
            }
        }
    }
    var StateMemorizingLastWord = (function (_super) {
        __extends(StateMemorizingLastWord, _super);
        function StateMemorizingLastWord(mode, descriptor, lastWord) {
            _super.call(this, mode);
            this.lastWord = lastWord;
            this.descriptor = descriptor;
        }
        StateMemorizingLastWord.prototype.makeClone = function () {
            return new StateMemorizingLastWord(this.getMode(), this.descriptor, this.lastWord);
        };
        StateMemorizingLastWord.prototype.tokenize = function (stream) {
            stream.setTokenRules('[]{}()==--', '\t \u00a0');
            if (stream.skipWhitespace() !== '') {
                return {
                    type: ''
                };
            }
            var word = stream.nextToken();
            return {
                type: this.getMode().getId() + '.' + word,
                nextState: new StateMemorizingLastWord(this.getMode(), this.descriptor, word)
            };
        };
        return StateMemorizingLastWord;
    }(abstractState_1.AbstractState));
    exports.StateMemorizingLastWord = StateMemorizingLastWord;
    var SwitchingMode = (function (_super) {
        __extends(SwitchingMode, _super);
        function SwitchingMode(id, descriptor) {
            _super.call(this, id);
            this._switchingModeDescriptor = descriptor;
            this.tokenizationSupport = new tokenizationSupport_1.TokenizationSupport(this, this, true, false);
        }
        SwitchingMode.prototype.addSupportChangedListener = function (callback) {
            return lifecycle_1.empty;
        };
        /**
         * Register a support by name. Only optional.
         */
        SwitchingMode.prototype.registerSupport = function (support, callback) {
            return lifecycle_1.empty;
        };
        SwitchingMode.prototype.getInitialState = function () {
            return new StateMemorizingLastWord(this, this._switchingModeDescriptor, null);
        };
        SwitchingMode.prototype.enterNestedMode = function (state) {
            var s = state;
            if (this._switchingModeDescriptor.hasOwnProperty(s.lastWord)) {
                return true;
            }
        };
        SwitchingMode.prototype.getNestedMode = function (state) {
            var s = state;
            return {
                mode: this._switchingModeDescriptor[s.lastWord].mode,
                missingModePromise: null
            };
        };
        SwitchingMode.prototype.getLeavingNestedModeData = function (line, state) {
            var s = state;
            var endChar = this._switchingModeDescriptor[s.lastWord].endCharacter;
            var endCharPosition = line.indexOf(endChar);
            if (endCharPosition >= 0) {
                return {
                    nestedModeBuffer: line.substring(0, endCharPosition),
                    bufferAfterNestedMode: line.substring(endCharPosition),
                    stateAfterNestedMode: new StateMemorizingLastWord(this, this._switchingModeDescriptor, null)
                };
            }
            return null;
        };
        return SwitchingMode;
    }(mockMode_1.MockMode));
    exports.SwitchingMode = SwitchingMode;
    function assertTokens(actual, expected, message) {
        assert.equal(actual.length, expected.length, 'Lengths mismatch');
        for (var i = 0; i < expected.length; i++) {
            assert.equal(actual[i].startIndex, expected[i].startIndex, 'startIndex mismatch');
            assert.equal(actual[i].type, expected[i].type, 'type mismatch');
        }
    }
    ;
    function assertModeTransitions(actual, expected, message) {
        var massagedActual = [];
        for (var i = 0; i < actual.length; i++) {
            massagedActual.push({
                startIndex: actual[i].startIndex,
                id: actual[i].mode.getId()
            });
        }
        assert.deepEqual(massagedActual, expected, message);
    }
    ;
    function createMode() {
        var modeB = new SwitchingMode('B', {});
        var modeC = new SwitchingMode('C', {});
        var modeD = new SwitchingMode('D', {
            '(': {
                endCharacter: ')',
                mode: modeB
            }
        });
        var modeA = new SwitchingMode('A', {
            '(': {
                endCharacter: ')',
                mode: modeB
            },
            '[': {
                endCharacter: ']',
                mode: modeC
            },
            '{': {
                endCharacter: '}',
                mode: modeD
            }
        });
        return modeA;
    }
    function switchingModeTokenize(line, mode, state) {
        if (mode === void 0) { mode = null; }
        if (state === void 0) { state = null; }
        if (state && mode) {
            return mode.tokenizationSupport.tokenize(line, state);
        }
        else {
            mode = createMode();
            return mode.tokenizationSupport.tokenize(line, mode.tokenizationSupport.getInitialState());
        }
    }
    suite('Editor Modes - Tokenization', function () {
        test('Syntax engine merges sequential untyped tokens', function () {
            var mode = new Mode();
            var lineTokens = mode.tokenizationSupport.tokenize('.abc..def...gh', mode.tokenizationSupport.getInitialState());
            checkTokens(lineTokens.tokens, [
                { startIndex: 0, type: '' },
                { startIndex: 1, type: 'text' },
                { startIndex: 4, type: '' },
                { startIndex: 6, type: 'text' },
                { startIndex: 9, type: '' },
                { startIndex: 12, type: 'text' }
            ]);
        });
        test('Warmup', function () {
            var lineTokens = switchingModeTokenize('abc def ghi');
            assertTokens(lineTokens.tokens, [
                { startIndex: 0, type: 'A.abc' },
                { startIndex: 3, type: '' },
                { startIndex: 4, type: 'A.def' },
                { startIndex: 7, type: '' },
                { startIndex: 8, type: 'A.ghi' }
            ]);
            assert.equal(lineTokens.endState.lastWord, 'ghi');
            assertModeTransitions(lineTokens.modeTransitions, [
                { startIndex: 0, id: 'A' }
            ]);
        });
        test('One embedded', function () {
            var lineTokens = switchingModeTokenize('abc (def) ghi');
            assertTokens(lineTokens.tokens, [
                { startIndex: 0, type: 'A.abc' },
                { startIndex: 3, type: '' },
                { startIndex: 4, type: 'A.(' },
                { startIndex: 5, type: 'B.def' },
                { startIndex: 8, type: 'A.)' },
                { startIndex: 9, type: '' },
                { startIndex: 10, type: 'A.ghi' }
            ]);
            assert.equal(lineTokens.endState.lastWord, 'ghi');
            assertModeTransitions(lineTokens.modeTransitions, [
                { startIndex: 0, id: 'A' },
                { startIndex: 5, id: 'B' },
                { startIndex: 8, id: 'A' }
            ]);
        });
        test('Empty one embedded', function () {
            var lineTokens = switchingModeTokenize('abc () ghi');
            assertTokens(lineTokens.tokens, [
                { startIndex: 0, type: 'A.abc' },
                { startIndex: 3, type: '' },
                { startIndex: 4, type: 'A.(' },
                { startIndex: 5, type: 'A.)' },
                { startIndex: 6, type: '' },
                { startIndex: 7, type: 'A.ghi' }
            ]);
            assert.equal(lineTokens.endState.lastWord, 'ghi');
            assertModeTransitions(lineTokens.modeTransitions, [
                { startIndex: 0, id: 'A' }
            ]);
        });
        test('Finish in embedded', function () {
            var lineTokens = switchingModeTokenize('abc (');
            assertTokens(lineTokens.tokens, [
                { startIndex: 0, type: 'A.abc' },
                { startIndex: 3, type: '' },
                { startIndex: 4, type: 'A.(' }
            ]);
            assert.equal(lineTokens.endState.getMode().getId(), 'B');
            assertModeTransitions(lineTokens.modeTransitions, [
                { startIndex: 0, id: 'A' }
            ]);
        });
        test('One embedded over multiple lines 1', function () {
            var mode = createMode();
            var lineTokens = switchingModeTokenize('abc (def', mode, mode.getInitialState());
            assertTokens(lineTokens.tokens, [
                { startIndex: 0, type: 'A.abc' },
                { startIndex: 3, type: '' },
                { startIndex: 4, type: 'A.(' },
                { startIndex: 5, type: 'B.def' }
            ]);
            assertModeTransitions(lineTokens.modeTransitions, [
                { startIndex: 0, id: 'A' },
                { startIndex: 5, id: 'B' }
            ]);
            lineTokens = switchingModeTokenize('ghi jkl', mode, lineTokens.endState);
            assertTokens(lineTokens.tokens, [
                { startIndex: 0, type: 'B.ghi' },
                { startIndex: 3, type: '' },
                { startIndex: 4, type: 'B.jkl' }
            ]);
            assertModeTransitions(lineTokens.modeTransitions, [
                { startIndex: 0, id: 'B' }
            ]);
            lineTokens = switchingModeTokenize('mno)pqr', mode, lineTokens.endState);
            assertTokens(lineTokens.tokens, [
                { startIndex: 0, type: 'B.mno' },
                { startIndex: 3, type: 'A.)' },
                { startIndex: 4, type: 'A.pqr' }
            ]);
            assertModeTransitions(lineTokens.modeTransitions, [
                { startIndex: 0, id: 'B' },
                { startIndex: 3, id: 'A' }
            ]);
        });
        test('One embedded over multiple lines 2 with handleEvent', function () {
            var mode = createMode();
            var lineTokens = switchingModeTokenize('abc (def', mode, mode.getInitialState());
            assertTokens(lineTokens.tokens, [
                { startIndex: 0, type: 'A.abc' },
                { startIndex: 3, type: '' },
                { startIndex: 4, type: 'A.(' },
                { startIndex: 5, type: 'B.def' }
            ]);
            assertModeTransitions(lineTokens.modeTransitions, [
                { startIndex: 0, id: 'A' },
                { startIndex: 5, id: 'B' }
            ]);
            supports_1.handleEvent(modesTestUtils_1.createMockLineContext('abc (def', lineTokens), 0, function (mode, context, offset) {
                assert.deepEqual(mode.getId(), 'A');
                assert.equal(context.getTokenCount(), 3);
                assert.equal(context.getTokenStartIndex(0), 0);
                assert.equal(context.getTokenType(0), 'A.abc');
                assert.equal(context.getTokenStartIndex(1), 3);
                assert.equal(context.getTokenType(1), '');
                assert.equal(context.getTokenStartIndex(2), 4);
                assert.equal(context.getTokenType(2), 'A.(');
                assert.deepEqual(offset, 0);
                assert.equal(context.getLineContent(), 'abc (');
            });
            supports_1.handleEvent(modesTestUtils_1.createMockLineContext('abc (def', lineTokens), 6, function (mode, context, offset) {
                assert.deepEqual(mode.getId(), 'B');
                assert.equal(context.getTokenCount(), 1);
                assert.equal(context.getTokenStartIndex(0), 0);
                assert.equal(context.getTokenType(0), 'B.def');
                assert.deepEqual(offset, 1);
                assert.equal(context.getLineContent(), 'def');
            });
            lineTokens = switchingModeTokenize('ghi jkl', mode, lineTokens.endState);
            assertTokens(lineTokens.tokens, [
                { startIndex: 0, type: 'B.ghi' },
                { startIndex: 3, type: '' },
                { startIndex: 4, type: 'B.jkl' }
            ]);
            assertModeTransitions(lineTokens.modeTransitions, [
                { startIndex: 0, id: 'B' }
            ]);
            lineTokens = switchingModeTokenize(')pqr', mode, lineTokens.endState);
            assertTokens(lineTokens.tokens, [
                { startIndex: 0, type: 'A.)' },
                { startIndex: 1, type: 'A.pqr' }
            ]);
            assertModeTransitions(lineTokens.modeTransitions, [
                { startIndex: 0, id: 'A' }
            ]);
        });
        test('Two embedded in breadth', function () {
            var lineTokens = switchingModeTokenize('abc (def) [ghi] jkl');
            assertTokens(lineTokens.tokens, [
                { startIndex: 0, type: 'A.abc' },
                { startIndex: 3, type: '' },
                { startIndex: 4, type: 'A.(' },
                { startIndex: 5, type: 'B.def' },
                { startIndex: 8, type: 'A.)' },
                { startIndex: 9, type: '' },
                { startIndex: 10, type: 'A.[' },
                { startIndex: 11, type: 'C.ghi' },
                { startIndex: 14, type: 'A.]' },
                { startIndex: 15, type: '' },
                { startIndex: 16, type: 'A.jkl' }
            ]);
            assert.equal(lineTokens.endState.lastWord, 'jkl');
            assertModeTransitions(lineTokens.modeTransitions, [
                { startIndex: 0, id: 'A' },
                { startIndex: 5, id: 'B' },
                { startIndex: 8, id: 'A' },
                { startIndex: 11, id: 'C' },
                { startIndex: 14, id: 'A' }
            ]);
        });
        test('Two embedded in breadth tightly', function () {
            var lineTokens = switchingModeTokenize('abc(def)[ghi]jkl');
            assertTokens(lineTokens.tokens, [
                { startIndex: 0, type: 'A.abc' },
                { startIndex: 3, type: 'A.(' },
                { startIndex: 4, type: 'B.def' },
                { startIndex: 7, type: 'A.)' },
                { startIndex: 8, type: 'A.[' },
                { startIndex: 9, type: 'C.ghi' },
                { startIndex: 12, type: 'A.]' },
                { startIndex: 13, type: 'A.jkl' }
            ]);
            assert.equal(lineTokens.endState.lastWord, 'jkl');
            assertModeTransitions(lineTokens.modeTransitions, [
                { startIndex: 0, id: 'A' },
                { startIndex: 4, id: 'B' },
                { startIndex: 7, id: 'A' },
                { startIndex: 9, id: 'C' },
                { startIndex: 12, id: 'A' }
            ]);
        });
        test('Two embedded in depth tightly', function () {
            var lineTokens = switchingModeTokenize('abc{de(efg)hi}jkl');
            assertTokens(lineTokens.tokens, [
                { startIndex: 0, type: 'A.abc' },
                { startIndex: 3, type: 'A.{' },
                { startIndex: 4, type: 'D.de' },
                { startIndex: 6, type: 'D.(' },
                { startIndex: 7, type: 'B.efg' },
                { startIndex: 10, type: 'D.)' },
                { startIndex: 11, type: 'D.hi' },
                { startIndex: 13, type: 'A.}' },
                { startIndex: 14, type: 'A.jkl' }
            ]);
            assert.equal(lineTokens.endState.lastWord, 'jkl');
            assertModeTransitions(lineTokens.modeTransitions, [
                { startIndex: 0, id: 'A' },
                { startIndex: 4, id: 'D' },
                { startIndex: 7, id: 'B' },
                { startIndex: 10, id: 'D' },
                { startIndex: 13, id: 'A' }
            ]);
        });
    });
});
//# sourceMappingURL=tokenization.test.js.map