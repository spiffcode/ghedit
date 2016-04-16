define(["require", "exports"], function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    (function (TokenType) {
        TokenType[TokenType["Ident"] = 0] = "Ident";
        TokenType[TokenType["AtKeyword"] = 1] = "AtKeyword";
        TokenType[TokenType["String"] = 2] = "String";
        TokenType[TokenType["BadString"] = 3] = "BadString";
        TokenType[TokenType["BadUri"] = 4] = "BadUri";
        TokenType[TokenType["Hash"] = 5] = "Hash";
        TokenType[TokenType["Num"] = 6] = "Num";
        TokenType[TokenType["Percentage"] = 7] = "Percentage";
        TokenType[TokenType["Dimension"] = 8] = "Dimension";
        TokenType[TokenType["URI"] = 9] = "URI";
        TokenType[TokenType["UnicodeRange"] = 10] = "UnicodeRange";
        TokenType[TokenType["CDO"] = 11] = "CDO";
        TokenType[TokenType["CDC"] = 12] = "CDC";
        TokenType[TokenType["Colon"] = 13] = "Colon";
        TokenType[TokenType["SemiColon"] = 14] = "SemiColon";
        TokenType[TokenType["CurlyL"] = 15] = "CurlyL";
        TokenType[TokenType["CurlyR"] = 16] = "CurlyR";
        TokenType[TokenType["ParenthesisL"] = 17] = "ParenthesisL";
        TokenType[TokenType["ParenthesisR"] = 18] = "ParenthesisR";
        TokenType[TokenType["BracketL"] = 19] = "BracketL";
        TokenType[TokenType["BracketR"] = 20] = "BracketR";
        TokenType[TokenType["Whitespace"] = 21] = "Whitespace";
        TokenType[TokenType["Includes"] = 22] = "Includes";
        TokenType[TokenType["Dashmatch"] = 23] = "Dashmatch";
        TokenType[TokenType["SubstringOperator"] = 24] = "SubstringOperator";
        TokenType[TokenType["PrefixOperator"] = 25] = "PrefixOperator";
        TokenType[TokenType["SuffixOperator"] = 26] = "SuffixOperator";
        TokenType[TokenType["Delim"] = 27] = "Delim";
        TokenType[TokenType["EMS"] = 28] = "EMS";
        TokenType[TokenType["EXS"] = 29] = "EXS";
        TokenType[TokenType["Length"] = 30] = "Length";
        TokenType[TokenType["Angle"] = 31] = "Angle";
        TokenType[TokenType["Time"] = 32] = "Time";
        TokenType[TokenType["Freq"] = 33] = "Freq";
        TokenType[TokenType["Exclamation"] = 34] = "Exclamation";
        TokenType[TokenType["Resolution"] = 35] = "Resolution";
        TokenType[TokenType["Comma"] = 36] = "Comma";
        TokenType[TokenType["Charset"] = 37] = "Charset";
        TokenType[TokenType["EscapedJavaScript"] = 38] = "EscapedJavaScript";
        TokenType[TokenType["BadEscapedJavaScript"] = 39] = "BadEscapedJavaScript";
        TokenType[TokenType["Comment"] = 40] = "Comment";
        TokenType[TokenType["SingleLineComment"] = 41] = "SingleLineComment";
        TokenType[TokenType["EOF"] = 42] = "EOF";
        TokenType[TokenType["CustomToken"] = 43] = "CustomToken";
    })(exports.TokenType || (exports.TokenType = {}));
    var TokenType = exports.TokenType;
    var MultiLineStream = (function () {
        function MultiLineStream(source) {
            this.source = source;
            this.len = source.length;
            this.position = 0;
        }
        MultiLineStream.prototype.substring = function (from, to) {
            if (to === void 0) { to = this.position; }
            return this.source.substring(from, to);
        };
        MultiLineStream.prototype.eos = function () {
            return this.len <= this.position;
        };
        MultiLineStream.prototype.pos = function () {
            return this.position;
        };
        MultiLineStream.prototype.goBackTo = function (pos) {
            this.position = pos;
        };
        MultiLineStream.prototype.goBack = function (n) {
            this.position -= n;
        };
        MultiLineStream.prototype.advance = function (n) {
            this.position += n;
        };
        MultiLineStream.prototype.nextChar = function () {
            return this.source.charCodeAt(this.position++) || 0;
        };
        MultiLineStream.prototype.peekChar = function (n) {
            if (n === void 0) { n = 0; }
            return this.source.charCodeAt(this.position + n) || 0;
        };
        MultiLineStream.prototype.lookbackChar = function (n) {
            if (n === void 0) { n = 0; }
            return this.source.charCodeAt(this.position - n) || 0;
        };
        MultiLineStream.prototype.advanceIfChar = function (ch) {
            if (ch === this.source.charCodeAt(this.position)) {
                this.position++;
                return true;
            }
            return false;
        };
        MultiLineStream.prototype.advanceIfChars = function (ch) {
            var i;
            if (this.position + ch.length > this.source.length) {
                return false;
            }
            for (i = 0; i < ch.length; i++) {
                if (this.source.charCodeAt(this.position + i) !== ch[i]) {
                    return false;
                }
            }
            this.advance(i);
            return true;
        };
        MultiLineStream.prototype.advanceWhileChar = function (condition) {
            var posNow = this.position;
            while (this.position < this.len && condition(this.source.charCodeAt(this.position))) {
                this.position++;
            }
            return this.position - posNow;
        };
        return MultiLineStream;
    }());
    exports.MultiLineStream = MultiLineStream;
    var _a = 'a'.charCodeAt(0);
    var _e = 'e'.charCodeAt(0);
    var _f = 'f'.charCodeAt(0);
    var _i = 'i'.charCodeAt(0);
    var _l = 'l'.charCodeAt(0);
    var _p = 'p'.charCodeAt(0);
    var _r = 'r'.charCodeAt(0);
    var _u = 'u'.charCodeAt(0);
    var _x = 'x'.charCodeAt(0);
    var _z = 'z'.charCodeAt(0);
    var _A = 'A'.charCodeAt(0);
    var _E = 'E'.charCodeAt(0);
    var _F = 'F'.charCodeAt(0);
    var _I = 'I'.charCodeAt(0);
    var _L = 'L'.charCodeAt(0);
    var _P = 'P'.charCodeAt(0);
    var _R = 'R'.charCodeAt(0);
    var _U = 'U'.charCodeAt(0);
    var _X = 'X'.charCodeAt(0);
    var _Z = 'Z'.charCodeAt(0);
    var _0 = '0'.charCodeAt(0);
    var _9 = '9'.charCodeAt(0);
    var _TLD = '~'.charCodeAt(0);
    var _HAT = '^'.charCodeAt(0);
    var _EQS = '='.charCodeAt(0);
    var _PIP = '|'.charCodeAt(0);
    var _MIN = '-'.charCodeAt(0);
    var _USC = '_'.charCodeAt(0);
    var _PRC = '%'.charCodeAt(0);
    var _MUL = '*'.charCodeAt(0);
    var _LPA = '('.charCodeAt(0);
    var _RPA = ')'.charCodeAt(0);
    var _LAN = '<'.charCodeAt(0);
    var _RAN = '>'.charCodeAt(0);
    var _ATS = '@'.charCodeAt(0);
    var _HSH = '#'.charCodeAt(0);
    var _DLR = '$'.charCodeAt(0);
    var _BSL = '\\'.charCodeAt(0);
    var _FSL = '/'.charCodeAt(0);
    var _NWL = '\n'.charCodeAt(0);
    var _CAR = '\r'.charCodeAt(0);
    var _LFD = '\f'.charCodeAt(0);
    var _DQO = '"'.charCodeAt(0);
    var _SQO = '\''.charCodeAt(0);
    var _WSP = ' '.charCodeAt(0);
    var _TAB = '\t'.charCodeAt(0);
    var _SEM = ';'.charCodeAt(0);
    var _COL = ':'.charCodeAt(0);
    var _CUL = '{'.charCodeAt(0);
    var _CUR = '}'.charCodeAt(0);
    var _BRL = '['.charCodeAt(0);
    var _BRR = ']'.charCodeAt(0);
    var _CMA = ','.charCodeAt(0);
    var _DOT = '.'.charCodeAt(0);
    var _BNG = '!'.charCodeAt(0);
    var _url = [_u, _U, _r, _R, _l, _L, _LPA, _LPA];
    var _url_prefix = [_u, _U, _r, _R, _l, _L, _MIN, _MIN, _p, _P, _r, _R, _e, _E, _f, _F, _i, _I, _x, _X, _LPA, _LPA];
    var staticTokenTable = {};
    staticTokenTable[_SEM] = TokenType.SemiColon;
    staticTokenTable[_COL] = TokenType.Colon;
    staticTokenTable[_CUL] = TokenType.CurlyL;
    staticTokenTable[_CUR] = TokenType.CurlyR;
    staticTokenTable[_BRR] = TokenType.BracketR;
    staticTokenTable[_BRL] = TokenType.BracketL;
    staticTokenTable[_LPA] = TokenType.ParenthesisL;
    staticTokenTable[_RPA] = TokenType.ParenthesisR;
    staticTokenTable[_CMA] = TokenType.Comma;
    var staticUnitTable = {};
    staticUnitTable['em'] = TokenType.EMS;
    staticUnitTable['ex'] = TokenType.EXS;
    staticUnitTable['px'] = TokenType.Length;
    staticUnitTable['cm'] = TokenType.Length;
    staticUnitTable['mm'] = TokenType.Length;
    staticUnitTable['in'] = TokenType.Length;
    staticUnitTable['pt'] = TokenType.Length;
    staticUnitTable['pc'] = TokenType.Length;
    staticUnitTable['deg'] = TokenType.Angle;
    staticUnitTable['rad'] = TokenType.Angle;
    staticUnitTable['grad'] = TokenType.Angle;
    staticUnitTable['ms'] = TokenType.Time;
    staticUnitTable['s'] = TokenType.Time;
    staticUnitTable['hz'] = TokenType.Freq;
    staticUnitTable['khz'] = TokenType.Freq;
    staticUnitTable['%'] = TokenType.Percentage;
    staticUnitTable['dpi'] = TokenType.Resolution;
    staticUnitTable['dpcm'] = TokenType.Resolution;
    var Scanner = (function () {
        function Scanner() {
            this.ignoreComment = true;
            this.ignoreWhitespace = true;
        }
        Scanner.prototype.setSource = function (input) {
            this.stream = new MultiLineStream(input);
        };
        Scanner.prototype.finishToken = function (offset, type, text) {
            return {
                offset: offset,
                len: this.stream.pos() - offset,
                type: type,
                text: text || this.stream.substring(offset)
            };
        };
        Scanner.prototype.substring = function (offset, len) {
            return this.stream.substring(offset, offset + len);
        };
        Scanner.prototype.pos = function () {
            return this.stream.pos();
        };
        Scanner.prototype.goBackTo = function (pos) {
            this.stream.goBackTo(pos);
        };
        Scanner.prototype.scan = function () {
            // processes all whitespaces and comments
            var triviaToken = this.trivia();
            if (triviaToken !== null) {
                return triviaToken;
            }
            var offset = this.stream.pos();
            // End of file/input
            if (this.stream.eos()) {
                return this.finishToken(offset, TokenType.EOF);
            }
            // CDO <!--
            if (this.stream.advanceIfChars([_LAN, _BNG, _MIN, _MIN])) {
                return this.finishToken(offset, TokenType.CDO);
            }
            // CDC -->
            if (this.stream.advanceIfChars([_MIN, _MIN, _RAN])) {
                return this.finishToken(offset, TokenType.CDC);
            }
            // URL
            var tokenType = this._url();
            if (tokenType !== null) {
                return this.finishToken(offset, tokenType);
            }
            var content = [];
            if (this.ident(content)) {
                return this.finishToken(offset, TokenType.Ident, content.join(''));
            }
            // at-keyword
            if (this.stream.advanceIfChar(_ATS)) {
                content = ['@'];
                if (this.ident(content)) {
                    var keywordText = content.join('');
                    if (keywordText === '@charset') {
                        return this.finishToken(offset, TokenType.Charset, keywordText);
                    }
                    return this.finishToken(offset, TokenType.AtKeyword, keywordText);
                }
                else {
                    return this.finishToken(offset, TokenType.Delim);
                }
            }
            // hash
            if (this.stream.advanceIfChar(_HSH)) {
                content = ['#'];
                if (this._name(content)) {
                    return this.finishToken(offset, TokenType.Hash, content.join(''));
                }
                else {
                    return this.finishToken(offset, TokenType.Delim);
                }
            }
            // Important
            if (this.stream.advanceIfChar(_BNG)) {
                return this.finishToken(offset, TokenType.Exclamation);
            }
            // Numbers
            if (this._number()) {
                var pos = this.stream.pos();
                content = [this.stream.substring(offset, pos)];
                if (this.stream.advanceIfChar(_PRC)) {
                    // Percentage 43%
                    return this.finishToken(offset, TokenType.Percentage);
                }
                else if (this.ident(content)) {
                    var dim = this.stream.substring(pos).toLowerCase();
                    tokenType = staticUnitTable[dim];
                    if (typeof tokenType !== 'undefined') {
                        // Known dimension 43px
                        return this.finishToken(offset, tokenType, content.join(''));
                    }
                    else {
                        // Unknown dimension 43ft
                        return this.finishToken(offset, TokenType.Dimension, content.join(''));
                    }
                }
                return this.finishToken(offset, TokenType.Num);
            }
            // String, BadString
            content = [];
            tokenType = this._string(content);
            if (tokenType !== null) {
                return this.finishToken(offset, tokenType, content.join(''));
            }
            // single character tokens
            tokenType = staticTokenTable[this.stream.peekChar()];
            if (typeof tokenType !== 'undefined') {
                this.stream.advance(1);
                return this.finishToken(offset, tokenType);
            }
            // includes ~=
            if (this.stream.peekChar(0) === _TLD && this.stream.peekChar(1) === _EQS) {
                this.stream.advance(2);
                return this.finishToken(offset, TokenType.Includes);
            }
            // DashMatch |=
            if (this.stream.peekChar(0) === _PIP && this.stream.peekChar(1) === _EQS) {
                this.stream.advance(2);
                return this.finishToken(offset, TokenType.Dashmatch);
            }
            // Substring operator *=
            if (this.stream.peekChar(0) === _MUL && this.stream.peekChar(1) === _EQS) {
                this.stream.advance(2);
                return this.finishToken(offset, TokenType.SubstringOperator);
            }
            // Substring operator ^=
            if (this.stream.peekChar(0) === _HAT && this.stream.peekChar(1) === _EQS) {
                this.stream.advance(2);
                return this.finishToken(offset, TokenType.PrefixOperator);
            }
            // Substring operator $=
            if (this.stream.peekChar(0) === _DLR && this.stream.peekChar(1) === _EQS) {
                this.stream.advance(2);
                return this.finishToken(offset, TokenType.SuffixOperator);
            }
            // Delim
            this.stream.nextChar();
            return this.finishToken(offset, TokenType.Delim);
        };
        Scanner.prototype._matchWordAnyCase = function (characters) {
            var index = 0;
            this.stream.advanceWhileChar(function (ch) {
                var result = characters[index] === ch || characters[index + 1] === ch;
                if (result) {
                    index += 2;
                }
                return result;
            });
            if (index === characters.length) {
                return true;
            }
            else {
                this.stream.goBack(index / 2);
                return false;
            }
        };
        Scanner.prototype.trivia = function () {
            while (true) {
                var offset = this.stream.pos();
                if (this._whitespace()) {
                    if (!this.ignoreWhitespace) {
                        return this.finishToken(offset, TokenType.Whitespace);
                    }
                }
                else if (this.comment()) {
                    if (!this.ignoreComment) {
                        return this.finishToken(offset, TokenType.Comment);
                    }
                }
                else {
                    return null;
                }
            }
        };
        Scanner.prototype.comment = function () {
            if (this.stream.advanceIfChars([_FSL, _MUL])) {
                var success_1 = false, hot_1 = false;
                this.stream.advanceWhileChar(function (ch) {
                    if (hot_1 && ch === _FSL) {
                        success_1 = true;
                        return false;
                    }
                    hot_1 = ch === _MUL;
                    return true;
                });
                if (success_1) {
                    this.stream.advance(1);
                }
                return true;
            }
            return false;
        };
        Scanner.prototype._number = function () {
            var npeek = 0, ch;
            if (this.stream.peekChar() === _DOT) {
                npeek = 1;
            }
            ch = this.stream.peekChar(npeek);
            if (ch >= _0 && ch <= _9) {
                this.stream.advance(npeek + 1);
                this.stream.advanceWhileChar(function (ch) {
                    return ch >= _0 && ch <= _9 || npeek === 0 && ch === _DOT;
                });
                return true;
            }
            return false;
        };
        Scanner.prototype._newline = function (result) {
            var ch = this.stream.peekChar();
            switch (ch) {
                case _CAR:
                case _LFD:
                case _NWL:
                    this.stream.advance(1);
                    result.push(String.fromCharCode(ch));
                    if (ch === _CAR && this.stream.advanceIfChar(_NWL)) {
                        result.push('\n');
                    }
                    return true;
            }
            return false;
        };
        Scanner.prototype._escape = function (result, includeNewLines) {
            var ch = this.stream.peekChar();
            if (ch === _BSL) {
                this.stream.advance(1);
                ch = this.stream.peekChar();
                var hexNumCount = 0;
                while (hexNumCount < 6 && (ch >= _0 && ch <= _9 || ch >= _a && ch <= _f || ch >= _A && ch <= _F)) {
                    this.stream.advance(1);
                    ch = this.stream.peekChar();
                    hexNumCount++;
                }
                if (hexNumCount > 0) {
                    try {
                        var hexVal = parseInt(this.stream.substring(this.stream.pos() - hexNumCount), 16);
                        if (hexVal) {
                            result.push(String.fromCharCode(hexVal));
                        }
                    }
                    catch (e) {
                    }
                    // optional whitespace or new line, not part of result text
                    if (ch === _WSP || ch === _TAB) {
                        this.stream.advance(1);
                    }
                    else {
                        this._newline([]);
                    }
                    return true;
                }
                if (ch !== _CAR && ch !== _LFD && ch !== _NWL) {
                    this.stream.advance(1);
                    result.push(String.fromCharCode(ch));
                    return true;
                }
                else if (includeNewLines) {
                    return this._newline(result);
                }
            }
            return false;
        };
        Scanner.prototype._stringChar = function (closeQuote, result) {
            // not closeQuote, not backslash, not newline
            var ch = this.stream.peekChar();
            if (ch !== 0 && ch !== closeQuote && ch !== _BSL && ch !== _CAR && ch !== _LFD && ch !== _NWL) {
                this.stream.advance(1);
                result.push(String.fromCharCode(ch));
                return true;
            }
            return false;
        };
        ;
        Scanner.prototype._string = function (result) {
            if (this.stream.peekChar() === _SQO || this.stream.peekChar() === _DQO) {
                var closeQuote = this.stream.nextChar();
                result.push(String.fromCharCode(closeQuote));
                while (this._stringChar(closeQuote, result) || this._escape(result, true)) {
                }
                if (this.stream.peekChar() === closeQuote) {
                    this.stream.nextChar();
                    result.push(String.fromCharCode(closeQuote));
                    return TokenType.String;
                }
                else {
                    return TokenType.BadString;
                }
            }
            return null;
        };
        Scanner.prototype._url = function () {
            if (this._matchWordAnyCase(_url) || this._matchWordAnyCase(_url_prefix)) {
                this._whitespace();
                var tokenType = TokenType.URI, stringType = this._string([]);
                if (stringType === TokenType.BadString) {
                    tokenType = TokenType.BadUri;
                }
                else if (stringType === null) {
                    this.stream.advanceWhileChar(function (ch) {
                        return ch !== _RPA;
                    });
                    tokenType = TokenType.URI;
                }
                this._whitespace();
                if (this.stream.advanceIfChar(_RPA)) {
                    return tokenType;
                }
                else {
                    return TokenType.BadUri;
                }
            }
            return null;
        };
        Scanner.prototype._whitespace = function () {
            var n = this.stream.advanceWhileChar(function (ch) {
                return ch === _WSP || ch === _TAB || ch === _NWL || ch === _LFD || ch === _CAR;
            });
            return n > 0;
        };
        Scanner.prototype._name = function (result) {
            var matched = false;
            while (this._identChar(result) || this._escape(result)) {
                matched = true;
            }
            return matched;
        };
        Scanner.prototype.ident = function (result) {
            var pos = this.stream.pos();
            var hasMinus = this._minus(result);
            if (hasMinus && this._minus(result) /* -- */) {
                var hasContent = false;
                while (this._identChar(result) || this._escape(result)) {
                    hasContent = true;
                }
                if (hasContent) {
                    return true;
                }
            }
            else if (this._identFirstChar(result) || this._escape(result)) {
                while (this._identChar(result) || this._escape(result)) {
                }
                return true;
            }
            this.stream.goBackTo(pos);
            return false;
        };
        Scanner.prototype._identFirstChar = function (result) {
            var ch = this.stream.peekChar();
            if (ch === _USC ||
                ch >= _a && ch <= _z ||
                ch >= _A && ch <= _Z ||
                ch >= 0x80 && ch <= 0xFFFF) {
                this.stream.advance(1);
                result.push(String.fromCharCode(ch));
                return true;
            }
            return false;
        };
        Scanner.prototype._minus = function (result) {
            var ch = this.stream.peekChar();
            if (ch === _MIN) {
                this.stream.advance(1);
                result.push(String.fromCharCode(ch));
                return true;
            }
            return false;
        };
        Scanner.prototype._identChar = function (result) {
            var ch = this.stream.peekChar();
            if (ch === _USC ||
                ch === _MIN ||
                ch >= _a && ch <= _z ||
                ch >= _A && ch <= _Z ||
                ch >= _0 && ch <= _9 ||
                ch >= 0x80 && ch <= 0xFFFF) {
                this.stream.advance(1);
                result.push(String.fromCharCode(ch));
                return true;
            }
            return false;
        };
        return Scanner;
    }());
    exports.Scanner = Scanner;
});
//# sourceMappingURL=cssScanner.js.map