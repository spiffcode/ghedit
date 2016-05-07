var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/editor/common/core/position', 'vs/editor/common/core/range', 'vs/editor/common/modes/supports', 'vs/editor/common/modes/supports/richEditBrackets'], function (require, exports, position_1, range_1, supports_1, richEditBrackets_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    (function (TokenTreeBracket) {
        TokenTreeBracket[TokenTreeBracket["None"] = 0] = "None";
        TokenTreeBracket[TokenTreeBracket["Open"] = 1] = "Open";
        TokenTreeBracket[TokenTreeBracket["Close"] = -1] = "Close";
    })(exports.TokenTreeBracket || (exports.TokenTreeBracket = {}));
    var TokenTreeBracket = exports.TokenTreeBracket;
    var Node = (function () {
        function Node() {
        }
        Object.defineProperty(Node.prototype, "range", {
            get: function () {
                return {
                    startLineNumber: this.start.lineNumber,
                    startColumn: this.start.column,
                    endLineNumber: this.end.lineNumber,
                    endColumn: this.end.column
                };
            },
            enumerable: true,
            configurable: true
        });
        return Node;
    }());
    exports.Node = Node;
    var NodeList = (function (_super) {
        __extends(NodeList, _super);
        function NodeList() {
            _super.apply(this, arguments);
        }
        Object.defineProperty(NodeList.prototype, "start", {
            get: function () {
                return this.hasChildren
                    ? this.children[0].start
                    : this.parent.start;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NodeList.prototype, "end", {
            get: function () {
                return this.hasChildren
                    ? this.children[this.children.length - 1].end
                    : this.parent.end;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NodeList.prototype, "hasChildren", {
            get: function () {
                return this.children && this.children.length > 0;
            },
            enumerable: true,
            configurable: true
        });
        NodeList.prototype.append = function (node) {
            if (!node) {
                return false;
            }
            node.parent = this;
            if (!this.children) {
                this.children = [];
            }
            if (node instanceof NodeList) {
                if (node.children) {
                    this.children.push.apply(this.children, node.children);
                }
            }
            else {
                this.children.push(node);
            }
            return true;
        };
        return NodeList;
    }(Node));
    exports.NodeList = NodeList;
    var Block = (function (_super) {
        __extends(Block, _super);
        function Block() {
            _super.call(this);
            this.elements = new NodeList();
            this.elements.parent = this;
        }
        Object.defineProperty(Block.prototype, "start", {
            get: function () {
                return this.open.start;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Block.prototype, "end", {
            get: function () {
                return this.close.end;
            },
            enumerable: true,
            configurable: true
        });
        return Block;
    }(Node));
    exports.Block = Block;
    function newNode(token) {
        var node = new Node();
        node.start = position_1.Position.startPosition(token.range);
        node.end = position_1.Position.endPosition(token.range);
        return node;
    }
    var TokenScanner = (function () {
        function TokenScanner(model) {
            this._model = model;
            this._versionId = model.getVersionId();
            this._currentLineNumber = 1;
        }
        TokenScanner.prototype.next = function () {
            if (this._versionId !== this._model.getVersionId()) {
                // model has been modified
                return null;
            }
            if (this._currentLineNumber >= this._model.getLineCount() + 1) {
                // all line visisted
                return null;
            }
            if (!this._currentLineTokens) {
                // no tokens for this line
                this._currentLineTokens = this._model.getLineTokens(this._currentLineNumber);
                this._currentLineText = this._model.getLineContent(this._currentLineNumber);
                this._currentLineModeTransitions = this._model._getLineModeTransitions(this._currentLineNumber);
                this._currentTokenIndex = 0;
                this._currentTokenStart = 0;
                this._currentModeIndex = -1;
                this._nextModeStart = 0;
            }
            if (this._currentTokenIndex >= this._currentLineTokens.getTokenCount()) {
                // last token of line visited
                this._currentLineNumber += 1;
                this._currentLineTokens = null;
                return this.next();
            }
            if (this._currentTokenStart >= this._nextModeStart) {
                this._currentModeIndex++;
                this._nextModeStart = (this._currentModeIndex + 1 < this._currentLineModeTransitions.length ? this._currentLineModeTransitions[this._currentModeIndex + 1].startIndex : this._currentLineText.length + 1);
                var mode = (this._currentModeIndex < this._currentLineModeTransitions.length ? this._currentLineModeTransitions[this._currentModeIndex] : null);
                this._currentModeBrackets = (mode && mode.mode.richEditSupport ? mode.mode.richEditSupport.brackets : null);
            }
            var tokenType = this._currentLineTokens.getTokenType(this._currentTokenIndex);
            var tokenEndIndex = this._currentLineTokens.getTokenEndIndex(this._currentTokenIndex, this._currentLineText.length);
            var tmpTokenEndIndex = tokenEndIndex;
            var nextBracket = null;
            if (this._currentModeBrackets && !supports_1.ignoreBracketsInToken(tokenType)) {
                nextBracket = richEditBrackets_1.BracketsUtils.findNextBracketInToken(this._currentModeBrackets.forwardRegex, this._currentLineNumber, this._currentLineText, this._currentTokenStart, tokenEndIndex);
            }
            if (nextBracket && this._currentTokenStart < nextBracket.startColumn - 1) {
                // found a bracket, but it is not at the beginning of the token
                tmpTokenEndIndex = nextBracket.startColumn - 1;
                nextBracket = null;
            }
            var bracketData = null;
            var bracketIsOpen = false;
            if (nextBracket) {
                var bracketText = this._currentLineText.substring(nextBracket.startColumn - 1, nextBracket.endColumn - 1);
                bracketData = this._currentModeBrackets.textIsBracket[bracketText];
                bracketIsOpen = this._currentModeBrackets.textIsOpenBracket[bracketText];
            }
            if (!bracketData) {
                var token_1 = {
                    type: tokenType,
                    bracket: TokenTreeBracket.None,
                    range: {
                        startLineNumber: this._currentLineNumber,
                        startColumn: 1 + this._currentTokenStart,
                        endLineNumber: this._currentLineNumber,
                        endColumn: 1 + tmpTokenEndIndex
                    }
                };
                // console.log('TOKEN: <<' + this._currentLineText.substring(this._currentTokenStart, tmpTokenEndIndex) + '>>');
                if (tmpTokenEndIndex < tokenEndIndex) {
                    // there is a bracket somewhere in this token...
                    this._currentTokenStart = tmpTokenEndIndex;
                }
                else {
                    this._currentTokenIndex += 1;
                    this._currentTokenStart = (this._currentTokenIndex < this._currentLineTokens.getTokenCount() ? this._currentLineTokens.getTokenStartIndex(this._currentTokenIndex) : 0);
                }
                return token_1;
            }
            var type = bracketData.modeId + ";" + bracketData.open + ";" + bracketData.close;
            var token = {
                type: type,
                bracket: bracketIsOpen ? TokenTreeBracket.Open : TokenTreeBracket.Close,
                range: {
                    startLineNumber: this._currentLineNumber,
                    startColumn: 1 + this._currentTokenStart,
                    endLineNumber: this._currentLineNumber,
                    endColumn: nextBracket.endColumn
                }
            };
            // console.log('BRACKET: <<' + this._currentLineText.substring(this._currentTokenStart, nextBracket.endColumn - 1) + '>>');
            if (nextBracket.endColumn - 1 < tokenEndIndex) {
                // found a bracket, but it is not at the end of the token
                this._currentTokenStart = nextBracket.endColumn - 1;
            }
            else {
                this._currentTokenIndex += 1;
                this._currentTokenStart = (this._currentTokenIndex < this._currentLineTokens.getTokenCount() ? this._currentLineTokens.getTokenStartIndex(this._currentTokenIndex) : 0);
            }
            return token;
        };
        return TokenScanner;
    }());
    var TokenTreeBuilder = (function () {
        function TokenTreeBuilder(model) {
            this._stack = [];
            this._scanner = new TokenScanner(model);
        }
        TokenTreeBuilder.prototype.build = function () {
            var node = new NodeList();
            while (node.append(this._line() || this._any())) {
            }
            return node;
        };
        TokenTreeBuilder.prototype._accept = function (condt) {
            var token = this._stack.pop() || this._scanner.next();
            if (!token) {
                return false;
            }
            var accepted = condt(token);
            if (!accepted) {
                this._stack.push(token);
                this._currentToken = null;
            }
            else {
                this._currentToken = token;
            }
            return accepted;
        };
        TokenTreeBuilder.prototype._peek = function (condt) {
            var ret = false;
            this._accept(function (info) {
                ret = condt(info);
                return false;
            });
            return ret;
        };
        TokenTreeBuilder.prototype._line = function () {
            var node = new NodeList(), lineNumber;
            // capture current linenumber
            this._peek(function (info) {
                lineNumber = info.range.startLineNumber;
                return false;
            });
            while (this._peek(function (info) { return info.range.startLineNumber === lineNumber; })
                && node.append(this._token() || this._block())) {
            }
            if (!node.children || node.children.length === 0) {
                return null;
            }
            else if (node.children.length === 1) {
                return node.children[0];
            }
            else {
                return node;
            }
        };
        TokenTreeBuilder.prototype._token = function () {
            if (!this._accept(function (token) { return token.bracket === TokenTreeBracket.None; })) {
                return null;
            }
            return newNode(this._currentToken);
        };
        TokenTreeBuilder.prototype._block = function () {
            var bracketType, accepted;
            accepted = this._accept(function (token) {
                bracketType = token.type;
                return token.bracket === TokenTreeBracket.Open;
            });
            if (!accepted) {
                return null;
            }
            var bracket = new Block();
            bracket.open = newNode(this._currentToken);
            while (bracket.elements.append(this._line())) {
            }
            if (!this._accept(function (token) { return token.bracket === TokenTreeBracket.Close && token.type === bracketType; })) {
                // missing closing bracket -> return just a node list
                var nodelist = new NodeList();
                nodelist.append(bracket.open);
                nodelist.append(bracket.elements);
                return nodelist;
            }
            bracket.close = newNode(this._currentToken);
            return bracket;
        };
        TokenTreeBuilder.prototype._any = function () {
            if (!this._accept(function (_) { return true; })) {
                return null;
            }
            return newNode(this._currentToken);
        };
        return TokenTreeBuilder;
    }());
    /**
     * Parses this grammar:
     *	grammer = { line }
     *	line = { block | "token" }
     *	block = "open_bracket" { line } "close_bracket"
     */
    function build(model) {
        var node = new TokenTreeBuilder(model).build();
        return node;
    }
    exports.build = build;
    function find(node, position) {
        if (!range_1.Range.containsPosition(node.range, position)) {
            return null;
        }
        var result;
        if (node instanceof NodeList) {
            for (var i = 0, len = node.children.length; i < len && !result; i++) {
                result = find(node.children[i], position);
            }
        }
        else if (node instanceof Block) {
            result = find(node.open, position) || find(node.elements, position) || find(node.close, position);
        }
        return result || node;
    }
    exports.find = find;
});
//# sourceMappingURL=tokenTree.js.map