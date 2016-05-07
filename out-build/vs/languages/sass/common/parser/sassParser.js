var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", './sassScanner', './sassErrors', 'vs/languages/css/common/parser/cssScanner', 'vs/languages/css/common/parser/cssParser', 'vs/languages/css/common/parser/cssNodes', 'vs/languages/css/common/parser/cssErrors'], function (require, exports, sassScanner, sassErrors, scanner, cssParser, nodes, errors) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /// <summary>
    /// A parser for Sass
    /// http://sass-lang.com/documentation/file.SASS_REFERENCE.html
    /// </summary>
    var SassParser = (function (_super) {
        __extends(SassParser, _super);
        function SassParser() {
            _super.call(this, new sassScanner.SassScanner());
        }
        SassParser.prototype._parseStylesheetStatement = function () {
            return _super.prototype._parseStylesheetStatement.call(this)
                || this._parseVariableDeclaration()
                || this._parseWarnAndDebug()
                || this._parseControlStatement()
                || this._parseMixinDeclaration()
                || this._parseMixinContent()
                || this._parseMixinReference() // @include
                || this._parseFunctionDeclaration();
        };
        SassParser.prototype._parseImport = function () {
            var node = this.create(nodes.Import);
            if (!this.accept(scanner.TokenType.AtKeyword, '@import')) {
                return null;
            }
            if (!this.accept(scanner.TokenType.URI) && !this.accept(scanner.TokenType.String)) {
                return this.finish(node, errors.ParseError.URIOrStringExpected);
            }
            while (this.accept(scanner.TokenType.Comma)) {
                if (!this.accept(scanner.TokenType.URI) && !this.accept(scanner.TokenType.String)) {
                    return this.finish(node, errors.ParseError.URIOrStringExpected);
                }
            }
            node.setMedialist(this._parseMediaList());
            return this.finish(node);
        };
        // Sass variables: $font-size: 12px;
        SassParser.prototype._parseVariableDeclaration = function (panic) {
            if (panic === void 0) { panic = []; }
            var node = this.create(nodes.VariableDeclaration);
            if (!node.setVariable(this._parseVariable())) {
                return null;
            }
            if (!this.accept(scanner.TokenType.Colon, ':')) {
                return this.finish(node, errors.ParseError.ColonExpected);
            }
            node.colonPosition = this.prevToken.offset;
            if (!node.setValue(this._parseExpr())) {
                return this.finish(node, errors.ParseError.VariableValueExpected, [], panic);
            }
            if (this.accept(scanner.TokenType.Exclamation)) {
                if (!this.accept(scanner.TokenType.Ident, 'default', true)) {
                    return this.finish(node, errors.ParseError.UnknownKeyword);
                }
            }
            return this.finish(node);
        };
        SassParser.prototype._parseMediaFeatureName = function () {
            return this._parseFunction() || this._parseIdent() || this._parseVariable(); // first function, the indent
        };
        SassParser.prototype._parseKeyframeSelector = function () {
            return _super.prototype._parseKeyframeSelector.call(this) || this._parseMixinContent();
        };
        SassParser.prototype._parseVariable = function () {
            var node = this.create(nodes.Variable);
            if (!this.accept(sassScanner.VariableName)) {
                return null;
            }
            return node;
        };
        SassParser.prototype._parseIdent = function (referenceTypes) {
            var node = this.create(nodes.Identifier);
            node.referenceTypes = referenceTypes;
            var hasContent = false;
            while (this.accept(scanner.TokenType.Ident) || node.addChild(this._parseInterpolation())) {
                hasContent = true;
                if (!this.hasWhitespace() && this.accept(scanner.TokenType.Delim, '-')) {
                }
                if (this.hasWhitespace()) {
                    break;
                }
            }
            return hasContent ? this.finish(node) : null;
        };
        SassParser.prototype._parseTerm = function () {
            var term = _super.prototype._parseTerm.call(this);
            if (term) {
                return term;
            }
            term = this.create(nodes.Term);
            if (term.setExpression(this._parseVariable())) {
                return this.finish(term);
            }
            return null;
        };
        SassParser.prototype._parseInterpolation = function () {
            var node = this.create(nodes.Interpolation);
            if (this.accept(sassScanner.InterpolationFunction)) {
                if (!node.addChild(this._parseBinaryExpr())) {
                    return this.finish(node, errors.ParseError.ExpressionExpected);
                }
                if (!this.accept(scanner.TokenType.CurlyR)) {
                    return this.finish(node, errors.ParseError.RightCurlyExpected);
                }
                return this.finish(node);
            }
            return null;
        };
        SassParser.prototype._parseOperator = function () {
            var node = this.createNode(nodes.NodeType.Operator);
            if (this.peek(sassScanner.EqualsOperator) || this.peek(sassScanner.NotEqualsOperator)
                || this.peek(sassScanner.GreaterEqualsOperator) || this.peek(sassScanner.SmallerEqualsOperator)
                || this.peek(scanner.TokenType.Delim, '>') || this.peek(scanner.TokenType.Delim, '<')
                || this.peek(scanner.TokenType.Ident, 'and') || this.peek(scanner.TokenType.Ident, 'or')
                || this.peek(scanner.TokenType.Delim, '%')) {
                var node = this.createNode(nodes.NodeType.Operator);
                this.consumeToken();
                return this.finish(node);
            }
            return _super.prototype._parseOperator.call(this);
        };
        SassParser.prototype._parseUnaryOperator = function () {
            if (this.peek(scanner.TokenType.Ident, 'not')) {
                var node = this.create(nodes.Node);
                this.consumeToken();
                return this.finish(node);
            }
            return _super.prototype._parseUnaryOperator.call(this);
        };
        SassParser.prototype._parseRuleSetDeclaration = function () {
            if (this.peek(scanner.TokenType.AtKeyword)) {
                return this._parseKeyframe() // nested @keyframe
                    || this._parseImport() // nested @import
                    || this._parseMedia() // nested @media
                    || this._parseFontFace() // nested @font-face
                    || this._parseWarnAndDebug() // @warn and @debug statements
                    || this._parseControlStatement() // @if, @while, @for, @each
                    || this._parseFunctionDeclaration() // @function
                    || this._parseExtends() // @extends
                    || this._parseMixinReference() // @include
                    || this._parseMixinContent() // @content
                    || this._parseMixinDeclaration(); // nested @mixin
            }
            return this._parseVariableDeclaration() // variable declaration
                || this._tryParseRuleset(true) // nested ruleset
                || this._parseDeclaration(); // try declaration as last so in the error case, the ast will contain a declaration
        };
        SassParser.prototype._parseDeclaration = function (resyncStopTokens) {
            var node = this.create(nodes.Declaration);
            if (!node.setProperty(this._parseProperty())) {
                return null;
            }
            if (!this.accept(scanner.TokenType.Colon, ':')) {
                return this.finish(node, errors.ParseError.ColonExpected, [scanner.TokenType.Colon], resyncStopTokens);
            }
            node.colonPosition = this.prevToken.offset;
            var hasContent = false;
            if (node.setValue(this._parseExpr())) {
                hasContent = true;
                node.addChild(this._parsePrio());
            }
            if (this.peek(scanner.TokenType.CurlyL)) {
                node.setNestedProperties(this._parseNestedProperties());
            }
            else {
                if (!hasContent) {
                    return this.finish(node, errors.ParseError.PropertyValueExpected);
                }
            }
            if (this.peek(scanner.TokenType.SemiColon)) {
                node.semicolonPosition = this.token.offset; // not part of the declaration, but useful information for code assist
            }
            return this.finish(node);
        };
        SassParser.prototype._parseNestedProperties = function () {
            var node = this.create(nodes.NestedProperties);
            return this._parseBody(node, this._parseDeclaration.bind(this));
        };
        SassParser.prototype._parseExtends = function () {
            var node = this.create(nodes.ExtendsReference);
            if (this.accept(scanner.TokenType.AtKeyword, '@extend')) {
                if (!node.setSelector(this._parseSimpleSelector())) {
                    return this.finish(node, errors.ParseError.SelectorExpected);
                }
                if (this.accept(scanner.TokenType.Exclamation)) {
                    if (!this.accept(scanner.TokenType.Ident, 'optional', true)) {
                        return this.finish(node, errors.ParseError.UnknownKeyword);
                    }
                }
                return this.finish(node);
            }
            return null;
        };
        SassParser.prototype._parseSimpleSelectorBody = function () {
            return this._parseSelectorCombinator() || this._parseSelectorPlaceholder() || _super.prototype._parseSimpleSelectorBody.call(this);
        };
        SassParser.prototype._parseSelectorCombinator = function () {
            var node = this.createNode(nodes.NodeType.SelectorCombinator);
            if (this.accept(scanner.TokenType.Delim, '&')) {
                while (!this.hasWhitespace() && (this.accept(scanner.TokenType.Delim, '-') || node.addChild(this._parseIdent()) || this.accept(scanner.TokenType.Delim, '&'))) {
                }
                return this.finish(node);
            }
            return null;
        };
        SassParser.prototype._parseSelectorPlaceholder = function () {
            var node = this.createNode(nodes.NodeType.SelectorPlaceholder);
            if (this.accept(scanner.TokenType.Delim, '%')) {
                this._parseIdent();
                return this.finish(node);
            }
            return null;
        };
        SassParser.prototype._parseWarnAndDebug = function () {
            if (!this.peek(scanner.TokenType.AtKeyword, '@debug') && !this.peek(scanner.TokenType.AtKeyword, '@warn')) {
                return null;
            }
            var node = this.createNode(nodes.NodeType.Debug);
            this.consumeToken(); // @debug or @warn
            node.addChild(this._parseExpr()); // optional
            return this.finish(node);
        };
        SassParser.prototype._parseControlStatement = function (parseStatement) {
            if (parseStatement === void 0) { parseStatement = this._parseRuleSetDeclaration.bind(this); }
            if (!this.peek(scanner.TokenType.AtKeyword)) {
                return null;
            }
            return this._parseIfStatement(parseStatement) || this._parseForStatement(parseStatement)
                || this._parseEachStatement(parseStatement) || this._parseWhileStatement(parseStatement);
        };
        SassParser.prototype._parseIfStatement = function (parseStatement) {
            if (!this.peek(scanner.TokenType.AtKeyword, '@if')) {
                return null;
            }
            return this._internalParseIfStatement(parseStatement);
        };
        SassParser.prototype._internalParseIfStatement = function (parseStatement) {
            var node = this.create(nodes.IfStatement);
            this.consumeToken(); // @if or if
            if (!node.setExpression(this._parseBinaryExpr())) {
                return this.finish(node, errors.ParseError.ExpressionExpected);
            }
            this._parseBody(node, parseStatement);
            if (this.accept(scanner.TokenType.AtKeyword, '@else')) {
                if (this.peek(scanner.TokenType.Ident, 'if')) {
                    node.setElseClause(this._internalParseIfStatement(parseStatement));
                }
                else if (this.peek(scanner.TokenType.CurlyL)) {
                    var elseNode = this.create(nodes.ElseStatement);
                    this._parseBody(elseNode, parseStatement);
                    node.setElseClause(elseNode);
                }
            }
            return this.finish(node);
        };
        SassParser.prototype._parseForStatement = function (parseStatement) {
            if (!this.peek(scanner.TokenType.AtKeyword, '@for')) {
                return null;
            }
            var node = this.create(nodes.ForStatement);
            this.consumeToken(); // @for
            if (!node.setVariable(this._parseVariable())) {
                return this.finish(node, errors.ParseError.VariableNameExpected, [scanner.TokenType.CurlyR]);
            }
            if (!this.accept(scanner.TokenType.Ident, 'from')) {
                return this.finish(node, sassErrors.ParseError.FromExpected, [scanner.TokenType.CurlyR]);
            }
            if (!node.addChild(this._parseBinaryExpr())) {
                return this.finish(node, errors.ParseError.ExpressionExpected, [scanner.TokenType.CurlyR]);
            }
            if (!this.accept(scanner.TokenType.Ident, 'to') && !this.accept(scanner.TokenType.Ident, 'through')) {
                return this.finish(node, sassErrors.ParseError.ThroughOrToExpected, [scanner.TokenType.CurlyR]);
            }
            if (!node.addChild(this._parseBinaryExpr())) {
                return this.finish(node, errors.ParseError.ExpressionExpected, [scanner.TokenType.CurlyR]);
            }
            return this._parseBody(node, parseStatement);
        };
        SassParser.prototype._parseEachStatement = function (parseStatement) {
            if (!this.peek(scanner.TokenType.AtKeyword, '@each')) {
                return null;
            }
            var node = this.create(nodes.EachStatement);
            this.consumeToken(); // @each
            if (!node.setVariable(this._parseVariable())) {
                return this.finish(node, errors.ParseError.VariableNameExpected, [scanner.TokenType.CurlyR]);
            }
            if (!this.accept(scanner.TokenType.Ident, 'in')) {
                return this.finish(node, sassErrors.ParseError.InExpected, [scanner.TokenType.CurlyR]);
            }
            if (!node.addChild(this._parseExpr())) {
                return this.finish(node, errors.ParseError.ExpressionExpected, [scanner.TokenType.CurlyR]);
            }
            return this._parseBody(node, parseStatement);
        };
        SassParser.prototype._parseWhileStatement = function (parseStatement) {
            if (!this.peek(scanner.TokenType.AtKeyword, '@while')) {
                return null;
            }
            var node = this.create(nodes.WhileStatement);
            this.consumeToken(); // @while
            if (!node.addChild(this._parseBinaryExpr())) {
                return this.finish(node, errors.ParseError.ExpressionExpected, [scanner.TokenType.CurlyR]);
            }
            return this._parseBody(node, parseStatement);
        };
        SassParser.prototype._parseFunctionBodyDeclaration = function () {
            return this._parseVariableDeclaration() || this._parseReturnStatement()
                || this._parseControlStatement(this._parseFunctionBodyDeclaration.bind(this));
        };
        SassParser.prototype._parseFunctionDeclaration = function () {
            if (!this.peek(scanner.TokenType.AtKeyword, '@function')) {
                return null;
            }
            var node = this.create(nodes.FunctionDeclaration);
            this.consumeToken(); // @function
            if (!node.setIdentifier(this._parseIdent([nodes.ReferenceType.Function]))) {
                return this.finish(node, errors.ParseError.IdentifierExpected, [scanner.TokenType.CurlyR]);
            }
            if (!this.accept(scanner.TokenType.ParenthesisL)) {
                return this.finish(node, errors.ParseError.LeftParenthesisExpected, [scanner.TokenType.CurlyR]);
            }
            if (node.getParameters().addChild(this._parseParameterDeclaration())) {
                while (this.accept(scanner.TokenType.Comma)) {
                    if (!node.getParameters().addChild(this._parseParameterDeclaration())) {
                        return this.finish(node, errors.ParseError.VariableNameExpected);
                    }
                }
            }
            if (!this.accept(scanner.TokenType.ParenthesisR)) {
                return this.finish(node, errors.ParseError.RightParenthesisExpected, [scanner.TokenType.CurlyR]);
            }
            return this._parseBody(node, this._parseFunctionBodyDeclaration.bind(this));
        };
        SassParser.prototype._parseReturnStatement = function () {
            if (!this.peek(scanner.TokenType.AtKeyword, '@return')) {
                return null;
            }
            var node = this.createNode(nodes.NodeType.ReturnStatement);
            this.consumeToken(); // @function
            if (!node.addChild(this._parseExpr())) {
                return this.finish(node, errors.ParseError.ExpressionExpected);
            }
            return this.finish(node);
        };
        SassParser.prototype._parseMixinDeclaration = function () {
            if (!this.peek(scanner.TokenType.AtKeyword, '@mixin')) {
                return null;
            }
            var node = this.create(nodes.MixinDeclaration);
            this.consumeToken();
            if (!node.setIdentifier(this._parseIdent([nodes.ReferenceType.Mixin]))) {
                return this.finish(node, errors.ParseError.IdentifierExpected, [scanner.TokenType.CurlyR]);
            }
            if (this.accept(scanner.TokenType.ParenthesisL)) {
                if (node.getParameters().addChild(this._parseParameterDeclaration())) {
                    while (this.accept(scanner.TokenType.Comma)) {
                        if (!node.getParameters().addChild(this._parseParameterDeclaration())) {
                            return this.finish(node, errors.ParseError.VariableNameExpected);
                        }
                    }
                }
                if (!this.accept(scanner.TokenType.ParenthesisR)) {
                    return this.finish(node, errors.ParseError.RightParenthesisExpected, [scanner.TokenType.CurlyR]);
                }
            }
            return this._parseBody(node, this._parseRuleSetDeclaration.bind(this));
        };
        SassParser.prototype._parseParameterDeclaration = function () {
            var node = this.create(nodes.FunctionParameter);
            if (!node.setIdentifier(this._parseVariable())) {
                return null;
            }
            if (this.accept(sassScanner.Ellipsis)) {
            }
            if (this.accept(scanner.TokenType.Colon)) {
                if (!node.setDefaultValue(this._parseExpr(true))) {
                    return this.finish(node, errors.ParseError.VariableValueExpected, [], [scanner.TokenType.Comma, scanner.TokenType.ParenthesisR]);
                }
            }
            return this.finish(node);
        };
        SassParser.prototype._parseMixinContent = function () {
            if (!this.peek(scanner.TokenType.AtKeyword, '@content')) {
                return null;
            }
            var node = this.createNode(nodes.NodeType.MixinContent);
            this.consumeToken();
            return this.finish(node);
        };
        SassParser.prototype._parseMixinReference = function () {
            if (!this.peek(scanner.TokenType.AtKeyword, '@include')) {
                return null;
            }
            var node = this.create(nodes.MixinReference);
            this.consumeToken();
            if (!node.setIdentifier(this._parseIdent([nodes.ReferenceType.Mixin]))) {
                return this.finish(node, errors.ParseError.IdentifierExpected, [scanner.TokenType.CurlyR]);
            }
            if (this.accept(scanner.TokenType.ParenthesisL)) {
                if (node.getArguments().addChild(this._parseFunctionArgument())) {
                    while (this.accept(scanner.TokenType.Comma)) {
                        if (!node.getArguments().addChild(this._parseFunctionArgument())) {
                            return this.finish(node, errors.ParseError.ExpressionExpected);
                        }
                    }
                }
                if (!this.accept(scanner.TokenType.ParenthesisR)) {
                    return this.finish(node, errors.ParseError.RightParenthesisExpected);
                }
            }
            if (this.peek(scanner.TokenType.CurlyL)) {
                var content = this.create(nodes.BodyDeclaration);
                this._parseBody(content, this._parseMixinReferenceBodyStatement.bind(this));
                node.setContent(content);
            }
            return this.finish(node);
        };
        SassParser.prototype._parseMixinReferenceBodyStatement = function () {
            return this._parseRuleSetDeclaration() || this._parseKeyframeSelector();
        };
        SassParser.prototype._parseFunctionArgument = function () {
            // [variableName ':'] expression | variableName '...'
            var node = this.create(nodes.FunctionArgument);
            var pos = this.mark();
            var argument = this._parseVariable();
            if (argument) {
                if (!this.accept(scanner.TokenType.Colon)) {
                    if (this.accept(sassScanner.Ellipsis)) {
                        node.setValue(argument);
                        return this.finish(node);
                    }
                    else {
                        this.restoreAtMark(pos);
                    }
                }
                else {
                    node.setIdentifier(argument);
                }
            }
            if (node.setValue(this._parseExpr(true))) {
                return this.finish(node);
            }
            return null;
        };
        return SassParser;
    }(cssParser.Parser));
    exports.SassParser = SassParser;
});
//# sourceMappingURL=sassParser.js.map