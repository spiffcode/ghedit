define(["require", "exports", 'vs/base/common/strings', 'vs/editor/common/modes/supports', 'vs/editor/common/modes/supports/richEditBrackets'], function (require, exports, strings, supports_1, richEditBrackets_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var BracketElectricCharacterSupport = (function () {
        function BracketElectricCharacterSupport(modeId, brackets, contribution) {
            this._modeId = modeId;
            this.contribution = contribution || {};
            this.brackets = new Brackets(modeId, brackets, this.contribution.docComment, this.contribution.caseInsensitive);
        }
        BracketElectricCharacterSupport.prototype.getElectricCharacters = function () {
            if (Array.isArray(this.contribution.embeddedElectricCharacters)) {
                return this.contribution.embeddedElectricCharacters.concat(this.brackets.getElectricCharacters());
            }
            return this.brackets.getElectricCharacters();
        };
        BracketElectricCharacterSupport.prototype.onElectricCharacter = function (context, offset) {
            var _this = this;
            return supports_1.handleEvent(context, offset, function (nestedMode, context, offset) {
                if (_this._modeId === nestedMode.getId()) {
                    return _this.brackets.onElectricCharacter(context, offset);
                }
                else if (nestedMode.richEditSupport && nestedMode.richEditSupport.electricCharacter) {
                    return nestedMode.richEditSupport.electricCharacter.onElectricCharacter(context, offset);
                }
                else {
                    return null;
                }
            });
        };
        return BracketElectricCharacterSupport;
    }());
    exports.BracketElectricCharacterSupport = BracketElectricCharacterSupport;
    var Brackets = (function () {
        function Brackets(modeId, richEditBrackets, docComment, caseInsensitive) {
            if (docComment === void 0) { docComment = null; }
            if (caseInsensitive === void 0) { caseInsensitive = false; }
            this._modeId = modeId;
            this._richEditBrackets = richEditBrackets;
            this._docComment = docComment ? docComment : null;
        }
        Brackets.prototype.getElectricCharacters = function () {
            var result = [];
            if (this._richEditBrackets) {
                for (var i = 0, len = this._richEditBrackets.brackets.length; i < len; i++) {
                    var bracketPair = this._richEditBrackets.brackets[i];
                    var lastChar = bracketPair.close.charAt(bracketPair.close.length - 1);
                    result.push(lastChar);
                }
            }
            // Doc comments
            if (this._docComment) {
                result.push(this._docComment.open.charAt(this._docComment.open.length - 1));
            }
            // Filter duplicate entries
            result = result.filter(function (item, pos, array) {
                return array.indexOf(item) === pos;
            });
            return result;
        };
        Brackets.prototype.onElectricCharacter = function (context, offset) {
            if (context.getTokenCount() === 0) {
                return null;
            }
            return (this._onElectricCharacterDocComment(context, offset) ||
                this._onElectricCharacterStandardBrackets(context, offset));
        };
        Brackets.prototype.containsTokenTypes = function (fullTokenSpec, tokensToLookFor) {
            var array = tokensToLookFor.split('.');
            for (var i = 0; i < array.length; ++i) {
                if (fullTokenSpec.indexOf(array[i]) < 0) {
                    return false;
                }
            }
            return true;
        };
        Brackets.prototype._onElectricCharacterStandardBrackets = function (context, offset) {
            if (!this._richEditBrackets || this._richEditBrackets.brackets.length === 0) {
                return null;
            }
            var reversedBracketRegex = this._richEditBrackets.reversedRegex;
            var lineText = context.getLineContent();
            var tokenIndex = context.findIndexOfOffset(offset);
            var tokenStart = context.getTokenStartIndex(tokenIndex);
            var tokenEnd = offset + 1;
            var firstNonWhitespaceIndex = strings.firstNonWhitespaceIndex(context.getLineContent());
            if (firstNonWhitespaceIndex !== -1 && firstNonWhitespaceIndex < tokenStart) {
                return null;
            }
            if (!supports_1.ignoreBracketsInToken(context.getTokenType(tokenIndex))) {
                var r = richEditBrackets_1.BracketsUtils.findPrevBracketInToken(reversedBracketRegex, 1, lineText, tokenStart, tokenEnd);
                if (r) {
                    var text = lineText.substring(r.startColumn - 1, r.endColumn - 1);
                    var isOpen = this._richEditBrackets.textIsOpenBracket[text];
                    if (!isOpen) {
                        return {
                            matchOpenBracket: text
                        };
                    }
                }
            }
            return null;
        };
        Brackets.prototype._onElectricCharacterDocComment = function (context, offset) {
            // We only auto-close, so do nothing if there is no closing part.
            if (!this._docComment || !this._docComment.close) {
                return null;
            }
            var line = context.getLineContent();
            var char = line[offset];
            // See if the right electric character was pressed
            if (char !== this._docComment.open.charAt(this._docComment.open.length - 1)) {
                return null;
            }
            // If this line already contains the closing tag, do nothing.
            if (line.indexOf(this._docComment.close, offset) >= 0) {
                return null;
            }
            // If we're not in a documentation comment, do nothing.
            var lastTokenIndex = context.findIndexOfOffset(offset);
            if (!this.containsTokenTypes(context.getTokenType(lastTokenIndex), this._docComment.scope)) {
                return null;
            }
            if (line.substring(context.getTokenStartIndex(lastTokenIndex), offset + 1 /* include electric char*/) !== this._docComment.open) {
                return null;
            }
            return { appendText: this._docComment.close };
        };
        return Brackets;
    }());
    exports.Brackets = Brackets;
});
