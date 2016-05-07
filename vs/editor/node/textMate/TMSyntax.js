var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/nls!vs/editor/node/textMate/TMSyntax', 'vs/base/common/errors', 'vs/base/common/paths', 'vs/platform/extensions/common/extensionsRegistry', 'vs/editor/common/modes/TMState', 'vs/editor/common/modes/supports', 'vs/editor/common/services/modeService', 'vscode-textmate', 'vs/editor/common/core/modeTransition'], function (require, exports, nls, errors_1, paths, extensionsRegistry_1, TMState_1, supports_1, modeService_1, vscode_textmate_1, modeTransition_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var grammarsExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint('grammars', {
        description: nls.localize(0, null),
        type: 'array',
        defaultSnippets: [{ body: [{ id: '', extensions: [] }] }],
        items: {
            type: 'object',
            defaultSnippets: [{ body: { language: '{{id}}', scopeName: 'source.{{id}}', path: './syntaxes/{{id}}.tmLanguage.' } }],
            properties: {
                language: {
                    description: nls.localize(1, null),
                    type: 'string'
                },
                scopeName: {
                    description: nls.localize(2, null),
                    type: 'string'
                },
                path: {
                    description: nls.localize(3, null),
                    type: 'string'
                }
            }
        }
    });
    var MainProcessTextMateSyntax = (function () {
        function MainProcessTextMateSyntax(modeService) {
            var _this = this;
            this._modeService = modeService;
            this._grammarRegistry = new vscode_textmate_1.Registry({
                getFilePath: function (scopeName) {
                    return _this._scopeNameToFilePath[scopeName];
                }
            });
            this._scopeNameToFilePath = {};
            grammarsExtPoint.setHandler(function (extensions) {
                for (var i = 0; i < extensions.length; i++) {
                    var grammars = extensions[i].value;
                    for (var j = 0; j < grammars.length; j++) {
                        _this._handleGrammarExtensionPointUser(extensions[i].description.extensionFolderPath, grammars[j], extensions[i].collector);
                    }
                }
            });
        }
        MainProcessTextMateSyntax.prototype._handleGrammarExtensionPointUser = function (extensionFolderPath, syntax, collector) {
            var _this = this;
            if (syntax.language && ((typeof syntax.language !== 'string') || !this._modeService.isRegisteredMode(syntax.language))) {
                collector.error(nls.localize(4, null, grammarsExtPoint.name, String(syntax.language)));
                return;
            }
            if (!syntax.scopeName || (typeof syntax.scopeName !== 'string')) {
                collector.error(nls.localize(5, null, grammarsExtPoint.name, String(syntax.scopeName)));
                return;
            }
            if (!syntax.path || (typeof syntax.path !== 'string')) {
                collector.error(nls.localize(6, null, grammarsExtPoint.name, String(syntax.path)));
                return;
            }
            var normalizedAbsolutePath = paths.normalize(paths.join(extensionFolderPath, syntax.path));
            if (normalizedAbsolutePath.indexOf(extensionFolderPath) !== 0) {
                collector.warn(nls.localize(7, null, grammarsExtPoint.name, normalizedAbsolutePath, extensionFolderPath));
            }
            this._scopeNameToFilePath[syntax.scopeName] = normalizedAbsolutePath;
            var modeId = syntax.language;
            if (modeId) {
                var disposable_1 = this._modeService.onDidCreateMode(function (mode) {
                    if (mode.getId() !== modeId) {
                        return;
                    }
                    _this.registerDefinition(modeId, syntax.scopeName);
                    disposable_1.dispose();
                });
            }
        };
        MainProcessTextMateSyntax.prototype.registerDefinition = function (modeId, scopeName) {
            var _this = this;
            this._grammarRegistry.loadGrammar(scopeName, function (err, grammar) {
                if (err) {
                    errors_1.onUnexpectedError(err);
                    return;
                }
                _this._modeService.registerTokenizationSupport(modeId, function (mode) {
                    return createTokenizationSupport(mode, grammar);
                });
            });
        };
        MainProcessTextMateSyntax = __decorate([
            __param(0, modeService_1.IModeService)
        ], MainProcessTextMateSyntax);
        return MainProcessTextMateSyntax;
    }());
    exports.MainProcessTextMateSyntax = MainProcessTextMateSyntax;
    function createTokenizationSupport(mode, grammar) {
        var tokenizer = new Tokenizer(mode.getId(), grammar);
        return {
            shouldGenerateEmbeddedModels: false,
            getInitialState: function () { return new TMState_1.TMState(mode, null, null); },
            tokenize: function (line, state, offsetDelta, stopAtOffset) { return tokenizer.tokenize(line, state, offsetDelta, stopAtOffset); }
        };
    }
    var DecodeMap = (function () {
        function DecodeMap() {
            this.lastAssignedId = 0;
            this.scopeToTokenIds = Object.create(null);
            this.tokenToTokenId = Object.create(null);
            this.tokenIdToToken = [null];
            this.prevToken = new TMTokenDecodeData([], []);
        }
        DecodeMap.prototype.getTokenIds = function (scope) {
            var tokens = this.scopeToTokenIds[scope];
            if (tokens) {
                return tokens;
            }
            var tmpTokens = scope.split('.');
            tokens = [];
            for (var i = 0; i < tmpTokens.length; i++) {
                var token = tmpTokens[i];
                var tokenId = this.tokenToTokenId[token];
                if (!tokenId) {
                    tokenId = (++this.lastAssignedId);
                    this.tokenToTokenId[token] = tokenId;
                    this.tokenIdToToken[tokenId] = token;
                }
                tokens.push(tokenId);
            }
            this.scopeToTokenIds[scope] = tokens;
            return tokens;
        };
        DecodeMap.prototype.getToken = function (tokenMap) {
            var result = '';
            var isFirst = true;
            for (var i = 1; i <= this.lastAssignedId; i++) {
                if (tokenMap[i]) {
                    if (isFirst) {
                        isFirst = false;
                        result += this.tokenIdToToken[i];
                    }
                    else {
                        result += '.';
                        result += this.tokenIdToToken[i];
                    }
                }
            }
            return result;
        };
        return DecodeMap;
    }());
    exports.DecodeMap = DecodeMap;
    var TMTokenDecodeData = (function () {
        function TMTokenDecodeData(scopes, scopeTokensMaps) {
            this.scopes = scopes;
            this.scopeTokensMaps = scopeTokensMaps;
        }
        return TMTokenDecodeData;
    }());
    exports.TMTokenDecodeData = TMTokenDecodeData;
    var Tokenizer = (function () {
        function Tokenizer(modeId, grammar) {
            this._modeId = modeId;
            this._grammar = grammar;
            this._decodeMap = new DecodeMap();
        }
        Tokenizer.prototype.tokenize = function (line, state, offsetDelta, stopAtOffset) {
            if (offsetDelta === void 0) { offsetDelta = 0; }
            if (line.length >= 20000) {
                return new supports_1.LineTokens([new supports_1.Token(offsetDelta, '')], [new modeTransition_1.ModeTransition(offsetDelta, state.getMode())], offsetDelta, state);
            }
            var freshState = state.clone();
            var textMateResult = this._grammar.tokenizeLine(line, freshState.getRuleStack());
            freshState.setRuleStack(textMateResult.ruleStack);
            // Create the result early and fill in the tokens later
            var tokens = [];
            var lastTokenType = null;
            for (var tokenIndex = 0, len = textMateResult.tokens.length; tokenIndex < len; tokenIndex++) {
                var token = textMateResult.tokens[tokenIndex];
                var tokenStartIndex = token.startIndex;
                var tokenType = decodeTextMateToken(this._decodeMap, token.scopes);
                // do not push a new token if the type is exactly the same (also helps with ligatures)
                if (tokenType !== lastTokenType) {
                    tokens.push(new supports_1.Token(tokenStartIndex + offsetDelta, tokenType));
                    lastTokenType = tokenType;
                }
            }
            return new supports_1.LineTokens(tokens, [new modeTransition_1.ModeTransition(offsetDelta, freshState.getMode())], offsetDelta + line.length, freshState);
        };
        return Tokenizer;
    }());
    function decodeTextMateToken(decodeMap, scopes) {
        var prevTokenScopes = decodeMap.prevToken.scopes;
        var prevTokenScopesLength = prevTokenScopes.length;
        var prevTokenScopeTokensMaps = decodeMap.prevToken.scopeTokensMaps;
        var scopeTokensMaps = [];
        var prevScopeTokensMaps = [];
        var sameAsPrev = true;
        for (var level = 1; level < scopes.length; level++) {
            var scope = scopes[level];
            if (sameAsPrev) {
                if (level < prevTokenScopesLength && prevTokenScopes[level] === scope) {
                    prevScopeTokensMaps = prevTokenScopeTokensMaps[level];
                    scopeTokensMaps[level] = prevScopeTokensMaps;
                    continue;
                }
                sameAsPrev = false;
            }
            var tokens = decodeMap.getTokenIds(scope);
            prevScopeTokensMaps = prevScopeTokensMaps.slice(0);
            for (var i = 0; i < tokens.length; i++) {
                prevScopeTokensMaps[tokens[i]] = true;
            }
            scopeTokensMaps[level] = prevScopeTokensMaps;
        }
        decodeMap.prevToken = new TMTokenDecodeData(scopes, scopeTokensMaps);
        return decodeMap.getToken(prevScopeTokensMaps);
    }
    exports.decodeTextMateToken = decodeTextMateToken;
});
//# sourceMappingURL=TMSyntax.js.map