define(["require", "exports", 'vs/base/common/types', './cssScanner', './cssNodes', 'vs/languages/css/common/level', './cssErrors', 'vs/languages/css/common/services/languageFacts'], function (require, exports, types, scanner, nodes, _level, errors, languageFacts) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /// <summary>
    /// A parser for the css core specification. See for reference:
    /// http://www.w3.org/TR/CSS21/syndata.html#tokenization
    /// </summary>
    var Parser = (function () {
        function Parser(scnr) {
            if (scnr === void 0) { scnr = new scanner.Scanner(); }
            this.scanner = scnr;
            this.token = null;
            this.prevToken = null;
        }
        Parser.prototype.peek = function (type, text, ignoreCase) {
            if (ignoreCase === void 0) { ignoreCase = true; }
            if (type !== this.token.type) {
                return false;
            }
            if (typeof text !== 'undefined') {
                if (ignoreCase) {
                    return text.toLowerCase() === this.token.text.toLowerCase();
                }
                else {
                    return text === this.token.text;
                }
            }
            return true;
        };
        Parser.prototype.peekRegEx = function (type, regEx) {
            if (type !== this.token.type) {
                return false;
            }
            return regEx.test(this.token.text);
        };
        Parser.prototype.hasWhitespace = function () {
            return this.prevToken && (this.prevToken.offset + this.prevToken.len !== this.token.offset);
        };
        Parser.prototype.consumeToken = function () {
            this.prevToken = this.token;
            this.token = this.scanner.scan();
        };
        Parser.prototype.mark = function () {
            return {
                prev: this.prevToken,
                curr: this.token,
                pos: this.scanner.pos()
            };
        };
        Parser.prototype.restoreAtMark = function (mark) {
            this.prevToken = mark.prev;
            this.token = mark.curr;
            this.scanner.goBackTo(mark.pos);
        };
        Parser.prototype.acceptOne = function (type, text, ignoreCase) {
            if (ignoreCase === void 0) { ignoreCase = true; }
            for (var i = 0; i < text.length; i++) {
                if (this.peek(type, text[i], ignoreCase)) {
                    this.consumeToken();
                    return true;
                }
            }
            return false;
        };
        Parser.prototype.accept = function (type, text, ignoreCase) {
            if (ignoreCase === void 0) { ignoreCase = true; }
            if (this.peek(type, text, ignoreCase)) {
                this.consumeToken();
                return true;
            }
            return false;
        };
        Parser.prototype.resync = function (resyncTokens, resyncStopTokens) {
            while (true) {
                if (resyncTokens && resyncTokens.indexOf(this.token.type) !== -1) {
                    this.consumeToken();
                    return true;
                }
                else if (resyncStopTokens && resyncStopTokens.indexOf(this.token.type) !== -1) {
                    return true;
                }
                else {
                    if (this.token.type === scanner.TokenType.EOF) {
                        return false;
                    }
                    this.token = this.scanner.scan();
                }
            }
        };
        Parser.prototype.createNode = function (nodeType) {
            return new nodes.Node(this.token.offset, this.token.len, nodeType);
        };
        Parser.prototype.create = function (ctor) {
            return types.create(ctor, this.token.offset, this.token.len);
        };
        Parser.prototype.finish = function (node, error, resyncTokens, resyncStopTokens) {
            // parseNumeric misuses error for boolean flagging (however the real error mustn't be a false)
            // + nodelist offsets mustn't be modified, because there is a offset hack in rulesets for smartselection
            if (!(node instanceof nodes.Nodelist)) {
                if (error) {
                    this.markError(node, error, resyncTokens, resyncStopTokens);
                }
                // set the node end position
                if (this.prevToken !== null) {
                    // length with more elements belonging together
                    var prevEnd = this.prevToken.offset + this.prevToken.len;
                    node.length = prevEnd > node.offset ? prevEnd - node.offset : 0; // offset is taken from current token, end from previous: Use 0 for empty nodes
                }
            }
            return node;
        };
        Parser.prototype.markError = function (node, error, resyncTokens, resyncStopTokens) {
            if (this.token !== this.lastErrorToken) {
                node.addIssue(new nodes.Marker(node, error, _level.Level.Error, null, this.token.offset, this.token.len));
                this.lastErrorToken = this.token;
            }
            if (resyncTokens || resyncStopTokens) {
                this.resync(resyncTokens, resyncStopTokens);
            }
        };
        Parser.prototype.parseStylesheet = function (model) {
            var versionId = model.getVersionId();
            var textProvider = function (offset, length) {
                if (model.getVersionId() !== versionId) {
                    throw new Error('Underlying model has changed, AST is no longer valid');
                }
                var range = model.getRangeFromOffsetAndLength(offset, length);
                return model.getValueInRange(range);
            };
            return this.internalParse(model.getValue(), this._parseStylesheet, textProvider);
        };
        Parser.prototype.internalParse = function (input, parseFunc, textProvider) {
            this.scanner.setSource(input);
            this.token = this.scanner.scan();
            var node = parseFunc.bind(this)();
            if (node) {
                if (textProvider) {
                    node.textProvider = textProvider;
                }
                else {
                    node.textProvider = function (offset, length) { return input.substr(offset, length); };
                }
            }
            return node;
        };
        Parser.prototype._parseStylesheet = function () {
            var node = this.create(nodes.Stylesheet);
            node.addChild(this._parseCharset());
            var inRecovery = false;
            do {
                var hasMatch = false;
                do {
                    hasMatch = false;
                    var statement = this._parseStylesheetStatement();
                    if (statement) {
                        node.addChild(statement);
                        hasMatch = true;
                        inRecovery = false;
                        if (!this.peek(scanner.TokenType.EOF) && this._needsSemicolonAfter(statement) && !this.accept(scanner.TokenType.SemiColon)) {
                            this.markError(node, errors.ParseError.SemiColonExpected);
                        }
                    }
                    while (this.accept(scanner.TokenType.SemiColon) || this.accept(scanner.TokenType.CDO) || this.accept(scanner.TokenType.CDC)) {
                        // accept empty statements
                        hasMatch = true;
                        inRecovery = false;
                    }
                } while (hasMatch);
                if (this.peek(scanner.TokenType.EOF)) {
                    break;
                }
                if (!inRecovery) {
                    if (this.peek(scanner.TokenType.AtKeyword)) {
                        this.markError(node, errors.ParseError.UnknownAtRule);
                    }
                    else {
                        this.markError(node, errors.ParseError.RuleOrSelectorExpected);
                    }
                    inRecovery = true;
                }
                this.consumeToken();
            } while (!this.peek(scanner.TokenType.EOF));
            return this.finish(node);
        };
        Parser.prototype._parseStylesheetStatement = function () {
            return this._parseRuleset(false)
                || this._parseImport()
                || this._parseMedia()
                || this._parsePage()
                || this._parseFontFace()
                || this._parseKeyframe()
                || this._parseMSViewPort()
                || this._parseNamespace()
                || this._parseDocument();
        };
        Parser.prototype._tryParseRuleset = function (isNested) {
            var mark = this.mark();
            if (this._parseSelector(isNested)) {
                while (this.accept(scanner.TokenType.Comma) && this._parseSelector(isNested)) {
                }
                if (this.accept(scanner.TokenType.CurlyL)) {
                    this.restoreAtMark(mark);
                    return this._parseRuleset(isNested);
                }
            }
            this.restoreAtMark(mark);
            return null;
        };
        Parser.prototype._parseRuleset = function (isNested) {
            if (isNested === void 0) { isNested = false; }
            var node = this.create(nodes.RuleSet);
            if (!node.getSelectors().addChild(this._parseSelector(isNested))) {
                return null;
            }
            while (this.accept(scanner.TokenType.Comma) && node.getSelectors().addChild(this._parseSelector(isNested))) {
            }
            return this._parseBody(node, this._parseRuleSetDeclaration.bind(this));
        };
        Parser.prototype._parseRuleSetDeclaration = function () {
            return this._parseDeclaration();
        };
        Parser.prototype._needsSemicolonAfter = function (node) {
            switch (node.type) {
                case nodes.NodeType.Keyframe:
                case nodes.NodeType.MSViewPort:
                case nodes.NodeType.Media:
                case nodes.NodeType.Ruleset:
                case nodes.NodeType.Namespace:
                case nodes.NodeType.If:
                case nodes.NodeType.For:
                case nodes.NodeType.Each:
                case nodes.NodeType.While:
                case nodes.NodeType.MixinDeclaration:
                case nodes.NodeType.FunctionDeclaration:
                    return false;
                case nodes.NodeType.VariableDeclaration:
                case nodes.NodeType.ExtendsReference:
                case nodes.NodeType.MixinContent:
                case nodes.NodeType.ReturnStatement:
                case nodes.NodeType.MediaQuery:
                case nodes.NodeType.Debug:
                case nodes.NodeType.Import:
                    return true;
                case nodes.NodeType.MixinReference:
                    return !node.getContent();
                case nodes.NodeType.Declaration:
                    return !node.getNestedProperties();
            }
            return false;
        };
        Parser.prototype._parseDeclarations = function (parseDeclaration) {
            var node = this.create(nodes.Declarations);
            if (!this.accept(scanner.TokenType.CurlyL)) {
                return null;
            }
            var decl = parseDeclaration();
            while (node.addChild(decl)) {
                if (this.peek(scanner.TokenType.CurlyR)) {
                    break;
                }
                if (this._needsSemicolonAfter(decl) && !this.accept(scanner.TokenType.SemiColon)) {
                    return this.finish(node, errors.ParseError.SemiColonExpected, [scanner.TokenType.SemiColon, scanner.TokenType.CurlyR]);
                }
                while (this.accept(scanner.TokenType.SemiColon)) {
                }
                decl = parseDeclaration();
            }
            if (!this.accept(scanner.TokenType.CurlyR)) {
                return this.finish(node, errors.ParseError.RightCurlyExpected, [scanner.TokenType.CurlyR, scanner.TokenType.SemiColon]);
            }
            return this.finish(node);
        };
        Parser.prototype._parseBody = function (node, parseDeclaration) {
            if (!node.setDeclarations(this._parseDeclarations(parseDeclaration))) {
                return this.finish(node, errors.ParseError.LeftCurlyExpected, [scanner.TokenType.CurlyR, scanner.TokenType.SemiColon]);
            }
            return this.finish(node);
        };
        Parser.prototype._parseSelector = function (isNested) {
            var node = this.create(nodes.Selector);
            var hasContent = false;
            if (isNested) {
                // nested selectors can start with a combinator
                hasContent = node.addChild(this._parseCombinator());
            }
            while (node.addChild(this._parseSimpleSelector())) {
                hasContent = true;
                node.addChild(this._parseCombinator()); // optional
            }
            return hasContent ? this.finish(node) : null;
        };
        Parser.prototype._parseDeclaration = function (resyncStopTokens) {
            var node = this.create(nodes.Declaration);
            if (!node.setProperty(this._parseProperty())) {
                return null;
            }
            if (!this.accept(scanner.TokenType.Colon)) {
                return this.finish(node, errors.ParseError.ColonExpected, [scanner.TokenType.Colon], resyncStopTokens);
            }
            node.colonPosition = this.prevToken.offset;
            if (!node.setValue(this._parseExpr())) {
                return this.finish(node, errors.ParseError.PropertyValueExpected);
            }
            node.addChild(this._parsePrio());
            if (this.peek(scanner.TokenType.SemiColon)) {
                node.semicolonPosition = this.token.offset; // not part of the declaration, but useful information for code assist
            }
            return this.finish(node);
        };
        Parser.prototype._tryToParseDeclaration = function () {
            var mark = this.mark();
            if (this._parseProperty() && this.accept(scanner.TokenType.Colon)) {
                // looks like a declaration, go ahead
                this.restoreAtMark(mark);
                return this._parseDeclaration();
            }
            this.restoreAtMark(mark);
            return null;
        };
        Parser.prototype._parseProperty = function () {
            var node = this.create(nodes.Property);
            var mark = this.mark();
            if (this.accept(scanner.TokenType.Delim, '*') || this.accept(scanner.TokenType.Delim, '_')) {
                // support for  IE 5.x, 6 and 7 star hack: see http://en.wikipedia.org/wiki/CSS_filter#Star_hack
                if (this.hasWhitespace()) {
                    this.restoreAtMark(mark);
                    return null;
                }
            }
            if (node.setIdentifier(this._parseIdent())) {
                return this.finish(node);
            }
            return null;
        };
        Parser.prototype._parseCharset = function () {
            var node = this.create(nodes.Node);
            if (!this.accept(scanner.TokenType.Charset)) {
                return null;
            }
            if (!this.accept(scanner.TokenType.String)) {
                return this.finish(node, errors.ParseError.IdentifierExpected);
            }
            if (!this.accept(scanner.TokenType.SemiColon)) {
                return this.finish(node, errors.ParseError.SemiColonExpected);
            }
            return this.finish(node);
        };
        Parser.prototype._parseImport = function () {
            var node = this.create(nodes.Import);
            if (!this.accept(scanner.TokenType.AtKeyword, '@import')) {
                return null;
            }
            if (!this.accept(scanner.TokenType.URI) && !this.accept(scanner.TokenType.String)) {
                return this.finish(node, errors.ParseError.URIOrStringExpected);
            }
            node.setMedialist(this._parseMediaList());
            return this.finish(node);
        };
        Parser.prototype._parseNamespace = function () {
            // http://www.w3.org/TR/css3-namespace/
            // namespace  : NAMESPACE_SYM S* [IDENT S*]? [STRING|URI] S* ';' S*
            var node = this.create(nodes.Namespace);
            if (!this.accept(scanner.TokenType.AtKeyword, '@namespace')) {
                return null;
            }
            node.addChild(this._parseIdent()); // optional prefix
            if (!this.accept(scanner.TokenType.URI) && !this.accept(scanner.TokenType.String)) {
                return this.finish(node, errors.ParseError.URIExpected, [scanner.TokenType.SemiColon]);
            }
            if (!this.accept(scanner.TokenType.SemiColon)) {
                return this.finish(node, errors.ParseError.SemiColonExpected);
            }
            return this.finish(node);
        };
        Parser.prototype._parseFontFace = function () {
            if (!this.peek(scanner.TokenType.AtKeyword, '@font-face')) {
                return null;
            }
            var node = this.create(nodes.FontFace);
            this.consumeToken(); // @font-face
            return this._parseBody(node, this._parseRuleSetDeclaration.bind(this));
        };
        Parser.prototype._parseMSViewPort = function () {
            if (!this.peek(scanner.TokenType.AtKeyword, '@-ms-viewport')) {
                return null;
            }
            var node = this.create(nodes.MSViewPort);
            this.consumeToken(); // @-ms-viewport
            return this._parseBody(node, this._parseRuleSetDeclaration.bind(this));
        };
        Parser.prototype._parseKeyframe = function () {
            var node = this.create(nodes.Keyframe);
            var atNode = this.create(nodes.Node);
            if (!this.accept(scanner.TokenType.AtKeyword, '@keyframes') &&
                !this.accept(scanner.TokenType.AtKeyword, '@-webkit-keyframes') &&
                !this.accept(scanner.TokenType.AtKeyword, '@-ms-keyframes') &&
                !this.accept(scanner.TokenType.AtKeyword, '@-moz-keyframes') &&
                !this.accept(scanner.TokenType.AtKeyword, '@-o-keyframes')) {
                return null;
            }
            node.setKeyword(this.finish(atNode));
            if (atNode.getText() === '@-ms-keyframes') {
                this.markError(atNode, errors.ParseError.UnknownKeyword);
            }
            if (!node.setIdentifier(this._parseIdent([nodes.ReferenceType.Keyframe]))) {
                return this.finish(node, errors.ParseError.IdentifierExpected, [scanner.TokenType.CurlyR]);
            }
            return this._parseBody(node, this._parseKeyframeSelector.bind(this));
        };
        Parser.prototype._parseKeyframeSelector = function () {
            var node = this.create(nodes.KeyframeSelector);
            if (!node.addChild(this._parseIdent()) && !this.accept(scanner.TokenType.Percentage)) {
                return null;
            }
            while (this.accept(scanner.TokenType.Comma)) {
                if (!node.addChild(this._parseIdent()) && !this.accept(scanner.TokenType.Percentage)) {
                    return this.finish(node, errors.ParseError.PercentageExpected);
                }
            }
            return this._parseBody(node, this._parseRuleSetDeclaration.bind(this));
        };
        Parser.prototype._parseMediaDeclaration = function () {
            return this._tryParseRuleset(false) || this._tryToParseDeclaration() || this._parseStylesheetStatement();
        };
        Parser.prototype._parseMedia = function () {
            // MEDIA_SYM S* media_query_list '{' S* ruleset* '}' S*
            // media_query_list : S* [media_query [ ',' S* media_query ]* ]?
            var node = this.create(nodes.Media);
            if (!this.accept(scanner.TokenType.AtKeyword, '@media')) {
                return null;
            }
            if (!node.addChild(this._parseMediaQuery([scanner.TokenType.CurlyL]))) {
                return this.finish(node, errors.ParseError.IdentifierExpected);
            }
            while (this.accept(scanner.TokenType.Comma)) {
                if (!node.addChild(this._parseMediaQuery([scanner.TokenType.CurlyL]))) {
                    return this.finish(node, errors.ParseError.IdentifierExpected);
                }
            }
            return this._parseBody(node, this._parseMediaDeclaration.bind(this));
        };
        Parser.prototype._parseMediaQuery = function (resyncStopToken) {
            // http://www.w3.org/TR/css3-mediaqueries/
            // media_query : [ONLY | NOT]? S* IDENT S* [ AND S* expression ]* | expression [ AND S* expression ]*
            // expression : '(' S* IDENT S* [ ':' S* expr ]? ')' S*
            var node = this.create(nodes.MediaQuery);
            var parseExpression = true;
            var hasContent = false;
            if (!this.peek(scanner.TokenType.ParenthesisL)) {
                if (this.accept(scanner.TokenType.Ident, 'only', true) || this.accept(scanner.TokenType.Ident, 'not', true)) {
                }
                if (!node.addChild(this._parseIdent())) {
                    return null;
                }
                hasContent = true;
                parseExpression = this.accept(scanner.TokenType.Ident, 'and', true);
            }
            while (parseExpression) {
                if (!this.accept(scanner.TokenType.ParenthesisL)) {
                    if (hasContent) {
                        return this.finish(node, errors.ParseError.LeftParenthesisExpected, [], resyncStopToken);
                    }
                    return null;
                }
                if (!node.addChild(this._parseMediaFeatureName())) {
                    return this.finish(node, errors.ParseError.IdentifierExpected, [], resyncStopToken);
                }
                if (this.accept(scanner.TokenType.Colon)) {
                    if (!node.addChild(this._parseExpr())) {
                        return this.finish(node, errors.ParseError.TermExpected, [], resyncStopToken);
                    }
                }
                if (!this.accept(scanner.TokenType.ParenthesisR)) {
                    return this.finish(node, errors.ParseError.RightParenthesisExpected, [], resyncStopToken);
                }
                parseExpression = this.accept(scanner.TokenType.Ident, 'and', true);
            }
            return node;
        };
        Parser.prototype._parseMediaFeatureName = function () {
            return this._parseIdent();
        };
        Parser.prototype._parseMediaList = function () {
            var node = this.create(nodes.Medialist);
            if (node.getMediums().addChild(this._parseMedium())) {
                while (this.accept(scanner.TokenType.Comma)) {
                    if (!node.getMediums().addChild(this._parseMedium())) {
                        return this.finish(node, errors.ParseError.IdentifierExpected);
                    }
                }
                return this.finish(node);
            }
            return null;
        };
        Parser.prototype._parseMedium = function () {
            var node = this.create(nodes.Node);
            if (node.addChild(this._parseIdent())) {
                return this.finish(node);
            }
            else {
                return null;
            }
        };
        Parser.prototype._parsePageDeclaration = function () {
            return this._parsePageMarginBox() || this._parseRuleSetDeclaration();
        };
        Parser.prototype._parsePage = function () {
            // http://www.w3.org/TR/css3-page/
            // page_rule : PAGE_SYM S* page_selector_list '{' S* page_body '}' S*
            // page_body :  /* Can be empty */ declaration? [ ';' S* page_body ]? | page_margin_box page_body
            var node = this.create(nodes.Page);
            if (!this.accept(scanner.TokenType.AtKeyword, '@Page')) {
                return null;
            }
            if (node.addChild(this._parsePageSelector())) {
                while (this.accept(scanner.TokenType.Comma)) {
                    if (!node.addChild(this._parsePageSelector())) {
                        return this.finish(node, errors.ParseError.IdentifierExpected);
                    }
                }
            }
            return this._parseBody(node, this._parsePageDeclaration.bind(this));
        };
        Parser.prototype._parsePageMarginBox = function () {
            // page_margin_box :  margin_sym S* '{' S* declaration? [ ';' S* declaration? ]* '}' S*
            var node = this.create(nodes.PageBoxMarginBox);
            if (!this.peek(scanner.TokenType.AtKeyword)) {
                return null;
            }
            if (!this.acceptOne(scanner.TokenType.AtKeyword, languageFacts.getPageBoxDirectives())) {
                this.markError(node, errors.ParseError.UnknownAtRule, [], [scanner.TokenType.CurlyL]);
            }
            return this._parseBody(node, this._parseRuleSetDeclaration.bind(this));
        };
        Parser.prototype._parsePageSelector = function () {
            // page_selector : pseudo_page+ | IDENT pseudo_page*
            // pseudo_page :  ':' [ "left" | "right" | "first" | "blank" ];
            var node = this.create(nodes.Node);
            if (!this.peek(scanner.TokenType.Ident) && !this.peek(scanner.TokenType.Colon)) {
                return null;
            }
            node.addChild(this._parseIdent()); // optional ident
            if (this.accept(scanner.TokenType.Colon)) {
                if (!node.addChild(this._parseIdent())) {
                    return this.finish(node, errors.ParseError.IdentifierExpected);
                }
            }
            return this.finish(node);
        };
        Parser.prototype._parseDocument = function () {
            // -moz-document is experimental but has been pushed to css4
            var node = this.create(nodes.Document);
            if (!this.accept(scanner.TokenType.AtKeyword, '@-moz-document')) {
                return null;
            }
            this.resync([], [scanner.TokenType.CurlyL]); // ignore all the rules
            return this._parseBody(node, this._parseStylesheetStatement.bind(this));
        };
        Parser.prototype._parseOperator = function () {
            // these are operators for binary expressions
            var node = this.createNode(nodes.NodeType.Operator);
            if (this.accept(scanner.TokenType.Delim, '/') ||
                this.accept(scanner.TokenType.Delim, '*') ||
                this.accept(scanner.TokenType.Delim, '+') ||
                this.accept(scanner.TokenType.Delim, '-') ||
                this.accept(scanner.TokenType.Dashmatch) ||
                this.accept(scanner.TokenType.Includes) ||
                this.accept(scanner.TokenType.SubstringOperator) ||
                this.accept(scanner.TokenType.PrefixOperator) ||
                this.accept(scanner.TokenType.SuffixOperator) ||
                this.accept(scanner.TokenType.Delim, '=')) {
                return this.finish(node);
            }
            else {
                return null;
            }
        };
        Parser.prototype._parseUnaryOperator = function () {
            var node = this.create(nodes.Node);
            if (this.accept(scanner.TokenType.Delim, '+') || this.accept(scanner.TokenType.Delim, '-')) {
                return this.finish(node);
            }
            else {
                return null;
            }
        };
        Parser.prototype._parseCombinator = function () {
            var node = this.create(nodes.Node);
            if (this.accept(scanner.TokenType.Delim, '>')) {
                node.type = nodes.NodeType.SelectorCombinatorParent;
                return this.finish(node);
            }
            else if (this.accept(scanner.TokenType.Delim, '+')) {
                node.type = nodes.NodeType.SelectorCombinatorSibling;
                return this.finish(node);
            }
            else if (this.accept(scanner.TokenType.Delim, '~')) {
                node.type = nodes.NodeType.SelectorCombinatorAllSiblings;
                return this.finish(node);
            }
            else {
                return null;
            }
        };
        Parser.prototype._parseSimpleSelector = function () {
            // simple_selector
            //  : element_name [ HASH | class | attrib | pseudo ]* | [ HASH | class | attrib | pseudo ]+ ;
            var node = this.create(nodes.SimpleSelector);
            var c = 0;
            if (node.addChild(this._parseElementName())) {
                c++;
            }
            while ((c === 0 || !this.hasWhitespace()) && node.addChild(this._parseSimpleSelectorBody())) {
                c++;
            }
            return c > 0 ? this.finish(node) : null;
        };
        Parser.prototype._parseSimpleSelectorBody = function () {
            return this._parsePseudo() || this._parseHash() || this._parseClass() || this._parseAttrib();
        };
        Parser.prototype._parseSelectorIdent = function () {
            return this._parseIdent();
        };
        Parser.prototype._parseHash = function () {
            if (!this.peek(scanner.TokenType.Hash) && !this.peek(scanner.TokenType.Delim, '#')) {
                return null;
            }
            var node = this.createNode(nodes.NodeType.IdentifierSelector);
            if (this.accept(scanner.TokenType.Delim, '#')) {
                if (this.hasWhitespace() || !node.addChild(this._parseSelectorIdent())) {
                    return this.finish(node, errors.ParseError.IdentifierExpected);
                }
            }
            else {
                this.consumeToken(); // TokenType.Hash
            }
            return this.finish(node);
        };
        Parser.prototype._parseClass = function () {
            // class: '.' IDENT ;
            if (!this.peek(scanner.TokenType.Delim, '.')) {
                return null;
            }
            var node = this.createNode(nodes.NodeType.ClassSelector);
            this.consumeToken(); // '.'
            if (this.hasWhitespace() || !node.addChild(this._parseSelectorIdent())) {
                return this.finish(node, errors.ParseError.IdentifierExpected);
            }
            return this.finish(node);
        };
        Parser.prototype._parseElementName = function () {
            // element_name: IDENT | '*';
            var node = this.createNode(nodes.NodeType.ElementNameSelector);
            if (node.addChild(this._parseSelectorIdent()) || this.accept(scanner.TokenType.Delim, '*')) {
                return this.finish(node);
            }
            return null;
        };
        Parser.prototype._parseAttrib = function () {
            // attrib : '[' S* IDENT S* [ [ '=' | INCLUDES | DASHMATCH ] S*   [ IDENT | STRING ] S* ]? ']'
            if (!this.peek(scanner.TokenType.BracketL)) {
                return null;
            }
            var node = this.createNode(nodes.NodeType.AttributeSelector);
            this.consumeToken(); // BracketL
            if (!node.addChild(this._parseBinaryExpr())) {
            }
            if (!this.accept(scanner.TokenType.BracketR)) {
                return this.finish(node, errors.ParseError.RightSquareBracketExpected);
            }
            return this.finish(node);
        };
        Parser.prototype._parsePseudo = function () {
            // pseudo: ':' [ IDENT | FUNCTION S* [IDENT S*]? ')' ]
            if (!this.peek(scanner.TokenType.Colon)) {
                return null;
            }
            var pos = this.mark();
            var node = this.createNode(nodes.NodeType.PseudoSelector);
            this.consumeToken(); // Colon
            if (!this.hasWhitespace() && this.accept(scanner.TokenType.Colon)) {
            }
            if (!this.hasWhitespace()) {
                if (!node.addChild(this._parseIdent())) {
                    return this.finish(node, errors.ParseError.IdentifierExpected);
                }
                if (!this.hasWhitespace() && this.accept(scanner.TokenType.ParenthesisL)) {
                    node.addChild(this._parseBinaryExpr() || this._parseSimpleSelector());
                    if (!this.accept(scanner.TokenType.ParenthesisR)) {
                        return this.finish(node, errors.ParseError.RightParenthesisExpected);
                    }
                }
                return this.finish(node);
            }
            this.restoreAtMark(pos);
            return null;
        };
        Parser.prototype._parsePrio = function () {
            if (!this.peek(scanner.TokenType.Exclamation)) {
                return null;
            }
            var node = this.createNode(nodes.NodeType.Prio);
            if (this.accept(scanner.TokenType.Exclamation) && this.accept(scanner.TokenType.Ident, 'important', true)) {
                return this.finish(node);
            }
            return null;
        };
        Parser.prototype._parseExpr = function (stopOnComma) {
            if (stopOnComma === void 0) { stopOnComma = false; }
            var node = this.create(nodes.Expression);
            if (!node.addChild(this._parseBinaryExpr())) {
                return null;
            }
            while (true) {
                if (this.peek(scanner.TokenType.Comma)) {
                    if (stopOnComma) {
                        return this.finish(node);
                    }
                    this.consumeToken();
                }
                if (!node.addChild(this._parseBinaryExpr())) {
                    break;
                }
            }
            return this.finish(node);
        };
        Parser.prototype._parseBinaryExpr = function (preparsedLeft, preparsedOper) {
            var node = this.create(nodes.BinaryExpression);
            if (!node.setLeft((preparsedLeft || this._parseTerm()))) {
                return null;
            }
            if (!node.setOperator(preparsedOper || this._parseOperator())) {
                return this.finish(node);
            }
            if (!node.setRight(this._parseTerm())) {
                return this.finish(node, errors.ParseError.TermExpected);
            }
            // things needed for multiple binary expressions
            node = this.finish(node);
            var operator = this._parseOperator();
            if (operator) {
                node = this._parseBinaryExpr(node, operator);
            }
            return this.finish(node);
        };
        Parser.prototype._parseTerm = function () {
            var node = this.create(nodes.Term);
            node.setOperator(this._parseUnaryOperator()); // optional
            if (node.setExpression(this._parseFunction()) ||
                node.setExpression(this._parseIdent()) ||
                node.setExpression(this._parseURILiteral()) ||
                node.setExpression(this._parseStringLiteral()) ||
                node.setExpression(this._parseNumeric()) ||
                node.setExpression(this._parseHexColor()) ||
                node.setExpression(this._parseOperation())) {
                return this.finish(node);
            }
            return null;
        };
        Parser.prototype._parseOperation = function () {
            var node = this.create(nodes.Node);
            if (!this.accept(scanner.TokenType.ParenthesisL)) {
                return null;
            }
            node.addChild(this._parseExpr());
            if (!this.accept(scanner.TokenType.ParenthesisR)) {
                return this.finish(node, errors.ParseError.RightParenthesisExpected);
            }
            return this.finish(node);
        };
        Parser.prototype._parseNumeric = function () {
            var node = this.create(nodes.NumericValue);
            if (this.accept(scanner.TokenType.Num) ||
                this.accept(scanner.TokenType.Percentage) ||
                this.accept(scanner.TokenType.Resolution) ||
                this.accept(scanner.TokenType.Length) ||
                this.accept(scanner.TokenType.EMS) ||
                this.accept(scanner.TokenType.EXS) ||
                this.accept(scanner.TokenType.Angle) ||
                this.accept(scanner.TokenType.Time) ||
                this.accept(scanner.TokenType.Dimension) ||
                this.accept(scanner.TokenType.Freq)) {
                return this.finish(node);
            }
            return null;
        };
        Parser.prototype._parseStringLiteral = function () {
            var node = this.createNode(nodes.NodeType.StringLiteral);
            if (this.accept(scanner.TokenType.String) || this.accept(scanner.TokenType.BadString)) {
                return this.finish(node);
            }
            return null;
        };
        Parser.prototype._parseURILiteral = function () {
            var node = this.createNode(nodes.NodeType.URILiteral);
            if (this.accept(scanner.TokenType.URI) || this.accept(scanner.TokenType.BadUri)) {
                return this.finish(node);
            }
            return null;
        };
        Parser.prototype._parseIdent = function (referenceTypes) {
            var node = this.create(nodes.Identifier);
            if (referenceTypes) {
                node.referenceTypes = referenceTypes;
            }
            if (this.accept(scanner.TokenType.Ident)) {
                return this.finish(node);
            }
            return null;
        };
        Parser.prototype._parseFunction = function () {
            var pos = this.mark();
            var node = this.create(nodes.Function);
            if (!node.setIdentifier(this._parseFunctionIdentifier())) {
                return null;
            }
            if (this.hasWhitespace() || !this.accept(scanner.TokenType.ParenthesisL)) {
                this.restoreAtMark(pos);
                return null;
            }
            // arguments
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
            return this.finish(node);
        };
        Parser.prototype._parseFunctionIdentifier = function () {
            var node = this.create(nodes.Identifier);
            node.referenceTypes = [nodes.ReferenceType.Function];
            if (this.accept(scanner.TokenType.Ident, 'progid')) {
                // support for IE7 specific filters: 'progid:DXImageTransform.Microsoft.MotionBlur(strength=13, direction=310)'
                if (this.accept(scanner.TokenType.Colon)) {
                    while (this.accept(scanner.TokenType.Ident) && this.accept(scanner.TokenType.Delim, '.')) {
                    }
                }
                return this.finish(node);
            }
            else if (this.accept(scanner.TokenType.Ident)) {
                return this.finish(node);
            }
            return null;
        };
        Parser.prototype._parseFunctionArgument = function () {
            var node = this.create(nodes.FunctionArgument);
            if (node.setValue(this._parseExpr(true))) {
                return this.finish(node);
            }
            return null;
        };
        Parser.prototype._parseHexColor = function () {
            var node = this.create(nodes.HexColorValue);
            if (this.peekRegEx(scanner.TokenType.Hash, /^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/g)) {
                this.consumeToken();
                return this.finish(node);
            }
            else {
                return null;
            }
        };
        return Parser;
    }());
    exports.Parser = Parser;
});
//# sourceMappingURL=cssParser.js.map