var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", './lessScanner', 'vs/languages/css/common/parser/cssScanner', 'vs/languages/css/common/parser/cssParser', 'vs/languages/css/common/parser/cssNodes', 'vs/languages/css/common/parser/cssErrors'], function (require, exports, lessScanner, scanner, cssParser, nodes, errors) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /// <summary>
    /// A parser for LESS
    /// http://lesscss.org/
    /// </summary>
    var LessParser = (function (_super) {
        __extends(LessParser, _super);
        function LessParser() {
            _super.call(this, new lessScanner.LessScanner());
        }
        LessParser.prototype._parseStylesheetStatement = function () {
            return this._tryParseMixinDeclaration() || _super.prototype._parseStylesheetStatement.call(this) || this._parseVariableDeclaration();
        };
        LessParser.prototype._parseImport = function () {
            var node = this.create(nodes.Import);
            if (!this.accept(scanner.TokenType.AtKeyword, '@import') && !this.accept(scanner.TokenType.AtKeyword, '@import-once') /* deprecated in less 1.4.1 */) {
                return null;
            }
            // less 1.4.1: @import (css) "lib"
            if (this.accept(scanner.TokenType.ParenthesisL)) {
                if (!this.accept(scanner.TokenType.Ident)) {
                    return this.finish(node, errors.ParseError.IdentifierExpected, [scanner.TokenType.SemiColon]);
                }
                if (!this.accept(scanner.TokenType.ParenthesisR)) {
                    return this.finish(node, errors.ParseError.RightParenthesisExpected, [scanner.TokenType.SemiColon]);
                }
            }
            if (!this.accept(scanner.TokenType.URI) && !this.accept(scanner.TokenType.String)) {
                return this.finish(node, errors.ParseError.URIOrStringExpected, [scanner.TokenType.SemiColon]);
            }
            node.setMedialist(this._parseMediaList());
            return this.finish(node);
        };
        LessParser.prototype._parseMediaQuery = function (resyncStopToken) {
            var node = _super.prototype._parseMediaQuery.call(this, resyncStopToken);
            if (!node) {
                var node = this.create(nodes.MediaQuery);
                if (node.addChild(this._parseVariable())) {
                    return this.finish(node);
                }
                return null;
            }
            return node;
        };
        LessParser.prototype._parseVariableDeclaration = function (panic) {
            if (panic === void 0) { panic = []; }
            var node = this.create(nodes.VariableDeclaration);
            var mark = this.mark();
            if (!node.setVariable(this._parseVariable())) {
                return null;
            }
            if (this.accept(scanner.TokenType.Colon, ':')) {
                node.colonPosition = this.prevToken.offset;
                if (!node.setValue(this._parseExpr())) {
                    return this.finish(node, errors.ParseError.VariableValueExpected, [], panic);
                }
            }
            else {
                this.restoreAtMark(mark);
                return null; // at keyword, but no ':', not a variable declaration but some at keyword
            }
            return this.finish(node);
        };
        LessParser.prototype._parseVariable = function () {
            var node = this.create(nodes.Variable);
            var mark = this.mark();
            while (this.accept(scanner.TokenType.Delim, '@')) {
                if (this.hasWhitespace()) {
                    this.restoreAtMark(mark);
                    return null;
                }
            }
            if (!this.accept(scanner.TokenType.AtKeyword)) {
                this.restoreAtMark(mark);
                return null;
            }
            return node;
        };
        LessParser.prototype._parseTerm = function () {
            var term = _super.prototype._parseTerm.call(this);
            if (term) {
                return term;
            }
            term = this.create(nodes.Term);
            if (term.setExpression(this._parseVariable()) ||
                term.setExpression(this._parseEscaped())) {
                return this.finish(term);
            }
            return null;
        };
        LessParser.prototype._parseEscaped = function () {
            var node = this.createNode(nodes.NodeType.EscapedValue);
            if (this.accept(scanner.TokenType.EscapedJavaScript) ||
                this.accept(scanner.TokenType.BadEscapedJavaScript)) {
                return this.finish(node);
            }
            if (this.accept(scanner.TokenType.Delim, '~')) {
                return this.finish(node, this.accept(scanner.TokenType.String) ? null : errors.ParseError.TermExpected);
            }
            return null;
        };
        LessParser.prototype._parseOperator = function () {
            var node = this._parseGuardOperator();
            if (node) {
                return node;
            }
            else {
                return _super.prototype._parseOperator.call(this);
            }
        };
        LessParser.prototype._parseGuardOperator = function () {
            var node = this.createNode(nodes.NodeType.Operator);
            if (this.accept(scanner.TokenType.Delim, '>')) {
                this.accept(scanner.TokenType.Delim, '=');
                return node;
            }
            else if (this.accept(scanner.TokenType.Delim, '=')) {
                this.accept(scanner.TokenType.Delim, '<');
                return node;
            }
            else if (this.accept(scanner.TokenType.Delim, '<')) {
                return node;
            }
            return null;
        };
        LessParser.prototype._parseRuleSetDeclaration = function () {
            if (this.peek(scanner.TokenType.AtKeyword)) {
                return this._parseKeyframe()
                    || this._parseMedia()
                    || this._parseVariableDeclaration(); // Variable declarations
            }
            return this._tryParseMixinDeclaration()
                || this._tryParseRuleset(true) // nested ruleset
                || this._parseMixinReference() // less mixin reference
                || this._parseExtend() // less extend declaration
                || this._parseDeclaration(); // try declaration as the last option
        };
        LessParser.prototype._parseSimpleSelectorBody = function () {
            return this._parseSelectorCombinator() || _super.prototype._parseSimpleSelectorBody.call(this);
        };
        LessParser.prototype._parseSelectorCombinator = function () {
            var node = this.createNode(nodes.NodeType.SelectorCombinator);
            if (this.accept(scanner.TokenType.Delim, '&')) {
                while (!this.hasWhitespace() && (this.accept(scanner.TokenType.Delim, '-') || node.addChild(this._parseIdent()) || this.accept(scanner.TokenType.Delim, '&'))) {
                }
                return this.finish(node);
            }
            return null;
        };
        LessParser.prototype._parseSelectorIdent = function () {
            return this._parseIdent() || this._parseSelectorInterpolation();
        };
        LessParser.prototype._parseSelectorInterpolation = function () {
            // Selector interpolation;  old: ~"@{name}", new: @{name}
            var node = this.createNode(nodes.NodeType.SelectorInterpolation);
            if (this.accept(scanner.TokenType.Delim, '~')) {
                if (!this.hasWhitespace() && (this.accept(scanner.TokenType.String) || this.accept(scanner.TokenType.BadString))) {
                    return this.finish(node);
                }
                return this.finish(node, errors.ParseError.StringLiteralExpected);
            }
            else if (this.accept(scanner.TokenType.Delim, '@')) {
                if (this.hasWhitespace() || !this.accept(scanner.TokenType.CurlyL)) {
                    return this.finish(node, errors.ParseError.LeftCurlyExpected);
                }
                if (!node.addChild(this._parseIdent())) {
                    return this.finish(node, errors.ParseError.IdentifierExpected);
                }
                if (!this.accept(scanner.TokenType.CurlyR)) {
                    return this.finish(node, errors.ParseError.RightCurlyExpected);
                }
                return this.finish(node);
            }
            return null;
        };
        LessParser.prototype._tryParseMixinDeclaration = function () {
            if (!this.peek(scanner.TokenType.Delim, '.')) {
                return null;
            }
            var mark = this.mark();
            var node = this.create(nodes.MixinDeclaration);
            if (!node.setIdentifier(this._parseMixinDeclarationIdentifier()) || !this.accept(scanner.TokenType.ParenthesisL)) {
                this.restoreAtMark(mark);
                return null;
            }
            if (node.getParameters().addChild(this._parseMixinParameter())) {
                while (this.accept(scanner.TokenType.Comma) || this.accept(scanner.TokenType.SemiColon)) {
                    if (!node.getParameters().addChild(this._parseMixinParameter())) {
                        return this.finish(node, errors.ParseError.IdentifierExpected);
                    }
                }
            }
            if (!this.accept(scanner.TokenType.ParenthesisR)) {
                return this.finish(node, errors.ParseError.RightParenthesisExpected);
            }
            node.setGuard(this._parseGuard());
            if (!this.peek(scanner.TokenType.CurlyL)) {
                this.restoreAtMark(mark);
                return null;
            }
            return this._parseBody(node, this._parseRuleSetDeclaration.bind(this));
        };
        LessParser.prototype._parseMixinDeclarationIdentifier = function () {
            var identifier = this.create(nodes.Identifier); // identifier should contain dot
            this.consumeToken(); // .
            if (this.hasWhitespace() || !this.accept(scanner.TokenType.Ident)) {
                return null;
            }
            identifier.referenceTypes = [nodes.ReferenceType.Mixin];
            return this.finish(identifier);
        };
        LessParser.prototype._parseExtend = function () {
            if (!this.peek(scanner.TokenType.Delim, '&')) {
                return null;
            }
            var mark = this.mark();
            var node = this.create(nodes.ExtendsReference);
            this.consumeToken(); // &
            if (this.hasWhitespace() || !this.accept(scanner.TokenType.Colon) || !this.accept(scanner.TokenType.Ident, 'extend')) {
                this.restoreAtMark(mark);
                return null;
            }
            if (!this.accept(scanner.TokenType.ParenthesisL)) {
                return this.finish(node, errors.ParseError.LeftParenthesisExpected);
            }
            if (!node.setSelector(this._parseSimpleSelector())) {
                return this.finish(node, errors.ParseError.SelectorExpected);
            }
            if (!this.accept(scanner.TokenType.ParenthesisR)) {
                return this.finish(node, errors.ParseError.RightParenthesisExpected);
            }
            return this.finish(node);
        };
        LessParser.prototype._parseMixinReference = function () {
            if (!this.peek(scanner.TokenType.Delim, '.')) {
                return null;
            }
            var node = this.create(nodes.MixinReference);
            var identifier = this.create(nodes.Identifier);
            this.consumeToken(); // dot, part of the identifier
            if (this.hasWhitespace() || !this.accept(scanner.TokenType.Ident)) {
                return this.finish(node, errors.ParseError.IdentifierExpected);
            }
            node.setIdentifier(this.finish(identifier));
            if (!this.hasWhitespace() && this.accept(scanner.TokenType.ParenthesisL)) {
                if (node.getArguments().addChild(this._parseFunctionArgument())) {
                    while (this.accept(scanner.TokenType.Comma) || this.accept(scanner.TokenType.SemiColon)) {
                        if (!node.getArguments().addChild(this._parseExpr())) {
                            return this.finish(node, errors.ParseError.ExpressionExpected);
                        }
                    }
                }
                if (!this.accept(scanner.TokenType.ParenthesisR)) {
                    return this.finish(node, errors.ParseError.RightParenthesisExpected);
                }
                identifier.referenceTypes = [nodes.ReferenceType.Mixin];
            }
            else {
                identifier.referenceTypes = [nodes.ReferenceType.Mixin, nodes.ReferenceType.Rule];
            }
            node.addChild(this._parsePrio());
            return this.finish(node);
        };
        LessParser.prototype._parseMixinParameter = function () {
            var node = this.create(nodes.FunctionParameter);
            // special rest variable: @rest...
            if (this.peek(scanner.TokenType.AtKeyword, '@rest')) {
                var restNode = this.create(nodes.Node);
                this.consumeToken();
                if (!this.accept(lessScanner.Ellipsis)) {
                    return this.finish(node, errors.ParseError.DotExpected, [], [scanner.TokenType.Comma, scanner.TokenType.ParenthesisR]);
                }
                node.setIdentifier(this.finish(restNode));
                return this.finish(node);
            }
            // special var args: ...
            if (this.peek(lessScanner.Ellipsis)) {
                var varargsNode = this.create(nodes.Node);
                this.consumeToken();
                node.setIdentifier(this.finish(varargsNode));
                return this.finish(node);
            }
            // default variable declaration: @param: 12 or @name
            if (node.setIdentifier(this._parseVariable())) {
                this.accept(scanner.TokenType.Colon);
            }
            node.setDefaultValue(this._parseExpr(true));
            return this.finish(node);
        };
        LessParser.prototype._parseGuard = function () {
            var node = this.create(nodes.LessGuard);
            if (!this.accept(scanner.TokenType.Ident, 'when')) {
                return null;
            }
            node.isNegated = this.accept(scanner.TokenType.Ident, 'not');
            if (!node.getConditions().addChild(this._parseGuardCondition())) {
                return this.finish(node, errors.ParseError.ConditionExpected);
            }
            while (this.accept(scanner.TokenType.Ident, 'and') || this.accept(scanner.TokenType.Comma, ',')) {
                if (!node.getConditions().addChild(this._parseGuardCondition())) {
                    return this.finish(node, errors.ParseError.ConditionExpected);
                }
            }
            return this.finish(node);
        };
        LessParser.prototype._parseGuardCondition = function () {
            var node = this.create(nodes.GuardCondition);
            if (!this.accept(scanner.TokenType.ParenthesisL)) {
                return null;
            }
            if (!node.addChild(this._parseExpr())) {
            }
            if (!this.accept(scanner.TokenType.ParenthesisR)) {
                return this.finish(node, errors.ParseError.RightParenthesisExpected);
            }
            return this.finish(node);
        };
        LessParser.prototype._parseFunctionIdentifier = function () {
            if (this.peek(scanner.TokenType.Delim, '%')) {
                var node = this.create(nodes.Identifier);
                node.referenceTypes = [nodes.ReferenceType.Function];
                this.consumeToken();
                return this.finish(node);
            }
            return _super.prototype._parseFunctionIdentifier.call(this);
        };
        return LessParser;
    }(cssParser.Parser));
    exports.LessParser = LessParser;
});
//# sourceMappingURL=lessParser.js.map