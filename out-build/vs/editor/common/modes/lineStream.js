define(["require", "exports"], function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var LineStream = (function () {
        function LineStream(source) {
            this._source = source;
            this.sourceLength = source.length;
            this._pos = 0;
            this.whitespace = '\t \u00a0';
            this.whitespaceArr = this.stringToArray(this.whitespace);
            this.separators = '';
            this.separatorsArr = this.stringToArray(this.separators);
            this.tokenStart = -1;
            this.tokenEnd = -1;
        }
        LineStream.prototype.stringToArray = function (str) {
            if (!LineStream.STRING_TO_ARRAY_CACHE.hasOwnProperty(str)) {
                LineStream.STRING_TO_ARRAY_CACHE[str] = this.actualStringToArray(str);
            }
            return LineStream.STRING_TO_ARRAY_CACHE[str];
        };
        LineStream.prototype.actualStringToArray = function (str) {
            var maxCharCode = 0;
            for (var i = 0; i < str.length; i++) {
                maxCharCode = Math.max(maxCharCode, str.charCodeAt(i));
            }
            var r = [];
            for (var i = 0; i <= maxCharCode; i++) {
                r[i] = false;
            }
            for (var i = 0; i < str.length; i++) {
                r[str.charCodeAt(i)] = true;
            }
            return r;
        };
        LineStream.prototype.pos = function () {
            return this._pos;
        };
        LineStream.prototype.eos = function () {
            return this._pos >= this.sourceLength;
        };
        LineStream.prototype.peek = function () {
            // Check EOS
            if (this._pos >= this.sourceLength) {
                throw new Error('Stream is at the end');
            }
            return this._source[this._pos];
        };
        LineStream.prototype.next = function () {
            // Check EOS
            if (this._pos >= this.sourceLength) {
                throw new Error('Stream is at the end');
            }
            // Reset peeked token
            this.tokenStart = -1;
            this.tokenEnd = -1;
            return this._source[this._pos++];
        };
        LineStream.prototype.next2 = function () {
            // Check EOS
            if (this._pos >= this.sourceLength) {
                throw new Error('Stream is at the end');
            }
            // Reset peeked token
            this.tokenStart = -1;
            this.tokenEnd = -1;
            this._pos++;
        };
        LineStream.prototype.advance = function (n) {
            if (n === 0) {
                return '';
            }
            var oldPos = this._pos;
            this._pos += n;
            // Reset peeked token
            this.tokenStart = -1;
            this.tokenEnd = -1;
            return this._source.substring(oldPos, this._pos);
        };
        LineStream.prototype._advance2 = function (n) {
            if (n === 0) {
                return n;
            }
            this._pos += n;
            // Reset peeked token
            this.tokenStart = -1;
            this.tokenEnd = -1;
            return n;
        };
        LineStream.prototype.advanceToEOS = function () {
            var oldPos = this._pos;
            this._pos = this.sourceLength;
            this.resetPeekedToken();
            return this._source.substring(oldPos, this._pos);
        };
        LineStream.prototype.goBack = function (n) {
            this._pos -= n;
            this.resetPeekedToken();
        };
        LineStream.prototype.createPeeker = function (condition) {
            var _this = this;
            if (condition instanceof RegExp) {
                return function () {
                    var result = condition.exec(_this._source.substr(_this._pos));
                    if (result === null) {
                        return 0;
                    }
                    else if (result.index !== 0) {
                        throw new Error('Regular expression must begin with the character "^"');
                    }
                    return result[0].length;
                };
            }
            else if ((condition instanceof String || (typeof condition) === 'string') && condition) {
                return function () {
                    var len = condition.length, match = _this._pos + len <= _this.sourceLength;
                    for (var i = 0; match && i < len; i++) {
                        match = _this._source.charCodeAt(_this._pos + i) === condition.charCodeAt(i);
                    }
                    return match ? len : 0;
                };
            }
            throw new Error('Condition must be either a regular expression, function or a non-empty string');
        };
        // --- BEGIN `_advanceIfStringCaseInsensitive`
        LineStream.prototype._advanceIfStringCaseInsensitive = function (condition) {
            var oldPos = this._pos, source = this._source, len = condition.length, i;
            if (len < 1 || oldPos + len > this.sourceLength) {
                return 0;
            }
            for (i = 0; i < len; i++) {
                if (source.charAt(oldPos + i).toLowerCase() !== condition.charAt(i).toLowerCase()) {
                    return 0;
                }
            }
            return len;
        };
        LineStream.prototype.advanceIfStringCaseInsensitive = function (condition) {
            return this.advance(this._advanceIfStringCaseInsensitive(condition));
        };
        LineStream.prototype.advanceIfStringCaseInsensitive2 = function (condition) {
            return this._advance2(this._advanceIfStringCaseInsensitive(condition));
        };
        // --- END
        // --- BEGIN `advanceIfString`
        LineStream.prototype._advanceIfString = function (condition) {
            var oldPos = this._pos, source = this._source, len = condition.length, i;
            if (len < 1 || oldPos + len > this.sourceLength) {
                return 0;
            }
            for (i = 0; i < len; i++) {
                if (source.charCodeAt(oldPos + i) !== condition.charCodeAt(i)) {
                    return 0;
                }
            }
            return len;
        };
        LineStream.prototype.advanceIfString = function (condition) {
            return this.advance(this._advanceIfString(condition));
        };
        LineStream.prototype.advanceIfString2 = function (condition) {
            return this._advance2(this._advanceIfString(condition));
        };
        // --- END
        // --- BEGIN `advanceIfString`
        LineStream.prototype._advanceIfCharCode = function (charCode) {
            if (this._pos < this.sourceLength && this._source.charCodeAt(this._pos) === charCode) {
                return 1;
            }
            return 0;
        };
        LineStream.prototype.advanceIfCharCode = function (charCode) {
            return this.advance(this._advanceIfCharCode(charCode));
        };
        LineStream.prototype.advanceIfCharCode2 = function (charCode) {
            return this._advance2(this._advanceIfCharCode(charCode));
        };
        // --- END
        // --- BEGIN `advanceIfRegExp`
        LineStream.prototype._advanceIfRegExp = function (condition) {
            if (this._pos >= this.sourceLength) {
                return 0;
            }
            if (!condition.test(this._source.substr(this._pos))) {
                return 0;
            }
            return RegExp.lastMatch.length;
        };
        LineStream.prototype.advanceIfRegExp = function (condition) {
            return this.advance(this._advanceIfRegExp(condition));
        };
        LineStream.prototype.advanceIfRegExp2 = function (condition) {
            return this._advance2(this._advanceIfRegExp(condition));
        };
        // --- END
        LineStream.prototype.advanceLoop = function (condition, isWhile, including) {
            if (this.eos()) {
                return '';
            }
            var peeker = this.createPeeker(condition);
            var oldPos = this._pos;
            var n = 0;
            var f = null;
            if (isWhile) {
                f = function (n) {
                    return n > 0;
                };
            }
            else {
                f = function (n) {
                    return n === 0;
                };
            }
            while (!this.eos() && f(n = peeker())) {
                if (n > 0) {
                    this.advance(n);
                }
                else {
                    this.next();
                }
            }
            if (including && !this.eos()) {
                this.advance(n);
            }
            return this._source.substring(oldPos, this._pos);
        };
        LineStream.prototype.advanceWhile = function (condition) {
            return this.advanceLoop(condition, true, false);
        };
        LineStream.prototype.advanceUntil = function (condition, including) {
            return this.advanceLoop(condition, false, including);
        };
        // --- BEGIN `advanceUntilString`
        LineStream.prototype._advanceUntilString = function (condition, including) {
            if (this.eos() || condition.length === 0) {
                return 0;
            }
            var oldPos = this._pos;
            var index = this._source.indexOf(condition, oldPos);
            if (index === -1) {
                // String was not found => advanced to `eos`
                return (this.sourceLength - oldPos);
            }
            if (including) {
                // String was found => advance to include `condition`
                return (index + condition.length - oldPos);
            }
            // String was found => advance right before `condition`
            return (index - oldPos);
        };
        LineStream.prototype.advanceUntilString = function (condition, including) {
            return this.advance(this._advanceUntilString(condition, including));
        };
        LineStream.prototype.advanceUntilString2 = function (condition, including) {
            return this._advance2(this._advanceUntilString(condition, including));
        };
        // --- END
        LineStream.prototype.resetPeekedToken = function () {
            this.tokenStart = -1;
            this.tokenEnd = -1;
        };
        LineStream.prototype.setTokenRules = function (separators, whitespace) {
            if (this.separators !== separators || this.whitespace !== whitespace) {
                this.separators = separators;
                this.separatorsArr = this.stringToArray(this.separators);
                this.whitespace = whitespace;
                this.whitespaceArr = this.stringToArray(this.whitespace);
                this.resetPeekedToken();
            }
        };
        // --- tokens
        LineStream.prototype.peekToken = function () {
            if (this.tokenStart !== -1) {
                return this._source.substring(this.tokenStart, this.tokenEnd);
            }
            var source = this._source, sourceLength = this.sourceLength, whitespaceArr = this.whitespaceArr, separatorsArr = this.separatorsArr, tokenStart = this._pos;
            // Check EOS
            if (tokenStart >= sourceLength) {
                throw new Error('Stream is at the end');
            }
            // Skip whitespace
            while (whitespaceArr[source.charCodeAt(tokenStart)] && tokenStart < sourceLength) {
                tokenStart++;
            }
            var tokenEnd = tokenStart;
            // If a separator is hit, it is a token
            if (separatorsArr[source.charCodeAt(tokenEnd)] && tokenEnd < sourceLength) {
                tokenEnd++;
            }
            else {
                // Advance until a separator or a whitespace is hit
                while (!separatorsArr[source.charCodeAt(tokenEnd)] && !whitespaceArr[source.charCodeAt(tokenEnd)] && tokenEnd < sourceLength) {
                    tokenEnd++;
                }
            }
            // Cache peeked token
            this.tokenStart = tokenStart;
            this.tokenEnd = tokenEnd;
            return source.substring(tokenStart, tokenEnd);
        };
        LineStream.prototype.nextToken = function () {
            // Check EOS
            if (this._pos >= this.sourceLength) {
                throw new Error('Stream is at the end');
            }
            // Peek token if necessary
            var result;
            if (this.tokenStart === -1) {
                result = this.peekToken();
            }
            else {
                result = this._source.substring(this.tokenStart, this.tokenEnd);
            }
            // Advance to tokenEnd
            this._pos = this.tokenEnd;
            // Reset peeked token
            this.tokenStart = -1;
            this.tokenEnd = -1;
            return result;
        };
        // -- whitespace
        LineStream.prototype.peekWhitespace = function () {
            var source = this._source, sourceLength = this.sourceLength, whitespaceArr = this.whitespaceArr, peek = this._pos;
            while (whitespaceArr[source.charCodeAt(peek)] && peek < sourceLength) {
                peek++;
            }
            return source.substring(this._pos, peek);
        };
        // --- BEGIN `advanceIfRegExp`
        LineStream.prototype._skipWhitespace = function () {
            var source = this._source, sourceLength = this.sourceLength, whitespaceArr = this.whitespaceArr, oldPos = this._pos, peek = this._pos;
            while (whitespaceArr[source.charCodeAt(peek)] && peek < sourceLength) {
                peek++;
            }
            return (peek - oldPos);
        };
        LineStream.prototype.skipWhitespace = function () {
            return this.advance(this._skipWhitespace());
        };
        LineStream.prototype.skipWhitespace2 = function () {
            return this._advance2(this._skipWhitespace());
        };
        LineStream.STRING_TO_ARRAY_CACHE = {};
        return LineStream;
    }());
    exports.LineStream = LineStream;
});
//# sourceMappingURL=lineStream.js.map