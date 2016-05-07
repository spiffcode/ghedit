define(["require", "exports", 'vs/base/common/json', 'vs/languages/json/common/features/jsonTokenTypes'], function (require, exports, json, jsonTokenTypes) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function createTokenizationSupport(mode, supportComments) {
        return {
            shouldGenerateEmbeddedModels: false,
            getInitialState: function () { return new JSONState(mode, null, null, false); },
            tokenize: function (line, state, offsetDelta, stopAtOffset) { return tokenize(mode, supportComments, line, state, offsetDelta, stopAtOffset); }
        };
    }
    exports.createTokenizationSupport = createTokenizationSupport;
    var JSONState = (function () {
        function JSONState(mode, state, scanError, lastWasColon) {
            this._mode = mode;
            this._state = state;
            this.scanError = scanError;
            this.lastWasColon = lastWasColon;
        }
        JSONState.prototype.clone = function () {
            return new JSONState(this._mode, this._state, this.scanError, this.lastWasColon);
        };
        JSONState.prototype.equals = function (other) {
            if (other === this) {
                return true;
            }
            if (!other || !(other instanceof JSONState)) {
                return false;
            }
            return this.scanError === other.scanError &&
                this.lastWasColon === other.lastWasColon;
        };
        JSONState.prototype.getMode = function () {
            return this._mode;
        };
        JSONState.prototype.tokenize = function (stream) {
            throw new Error();
        };
        JSONState.prototype.getStateData = function () {
            return this._state;
        };
        JSONState.prototype.setStateData = function (state) {
            this._state = state;
        };
        return JSONState;
    }());
    function tokenize(mode, comments, line, state, offsetDelta, stopAtOffset) {
        if (offsetDelta === void 0) { offsetDelta = 0; }
        // handle multiline strings and block comments
        var numberOfInsertedCharacters = 0, adjustOffset = false;
        switch (state.scanError) {
            case json.ScanError.UnexpectedEndOfString:
                line = '"' + line;
                numberOfInsertedCharacters = 1;
                break;
            case json.ScanError.UnexpectedEndOfComment:
                line = '/*' + line;
                numberOfInsertedCharacters = 2;
                break;
        }
        var scanner = json.createScanner(line), kind, ret, lastWasColon = state.lastWasColon;
        ret = {
            tokens: [],
            actualStopOffset: line.length,
            endState: state.clone(),
            modeTransitions: [{ startIndex: 0, mode: mode }],
        };
        while (true) {
            var offset = offsetDelta + scanner.getPosition(), type = '';
            kind = scanner.scan();
            if (kind === json.SyntaxKind.EOF) {
                break;
            }
            // Check that the scanner has advanced
            if (offset === offsetDelta + scanner.getPosition()) {
                throw new Error('Scanner did not advance, next 3 characters are: ' + line.substr(scanner.getPosition(), 3));
            }
            // In case we inserted /* or " character, we need to
            // adjust the offset of all tokens (except the first)
            if (adjustOffset) {
                offset -= numberOfInsertedCharacters;
            }
            adjustOffset = numberOfInsertedCharacters > 0;
            // brackets and type
            switch (kind) {
                case json.SyntaxKind.OpenBraceToken:
                    type = jsonTokenTypes.TOKEN_DELIM_OBJECT;
                    lastWasColon = false;
                    break;
                case json.SyntaxKind.CloseBraceToken:
                    type = jsonTokenTypes.TOKEN_DELIM_OBJECT;
                    lastWasColon = false;
                    break;
                case json.SyntaxKind.OpenBracketToken:
                    type = jsonTokenTypes.TOKEN_DELIM_ARRAY;
                    lastWasColon = false;
                    break;
                case json.SyntaxKind.CloseBracketToken:
                    type = jsonTokenTypes.TOKEN_DELIM_ARRAY;
                    lastWasColon = false;
                    break;
                case json.SyntaxKind.ColonToken:
                    type = jsonTokenTypes.TOKEN_DELIM_COLON;
                    lastWasColon = true;
                    break;
                case json.SyntaxKind.CommaToken:
                    type = jsonTokenTypes.TOKEN_DELIM_COMMA;
                    lastWasColon = false;
                    break;
                case json.SyntaxKind.TrueKeyword:
                case json.SyntaxKind.FalseKeyword:
                    type = jsonTokenTypes.TOKEN_VALUE_BOOLEAN;
                    lastWasColon = false;
                    break;
                case json.SyntaxKind.NullKeyword:
                    type = jsonTokenTypes.TOKEN_VALUE_NULL;
                    lastWasColon = false;
                    break;
                case json.SyntaxKind.StringLiteral:
                    type = lastWasColon ? jsonTokenTypes.TOKEN_VALUE_STRING : jsonTokenTypes.TOKEN_PROPERTY_NAME;
                    lastWasColon = false;
                    break;
                case json.SyntaxKind.NumericLiteral:
                    type = jsonTokenTypes.TOKEN_VALUE_NUMBER;
                    lastWasColon = false;
                    break;
            }
            // comments, iff enabled
            if (comments) {
                switch (kind) {
                    case json.SyntaxKind.LineCommentTrivia:
                        type = jsonTokenTypes.TOKEN_COMMENT_LINE;
                        break;
                    case json.SyntaxKind.BlockCommentTrivia:
                        type = jsonTokenTypes.TOKEN_COMMENT_BLOCK;
                        break;
                }
            }
            ret.endState = new JSONState(state.getMode(), state.getStateData(), scanner.getTokenError(), lastWasColon);
            ret.tokens.push({
                startIndex: offset,
                type: type
            });
        }
        return ret;
    }
});
//# sourceMappingURL=tokenization.js.map