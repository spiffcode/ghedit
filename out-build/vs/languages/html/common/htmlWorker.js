var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/uri', 'vs/base/common/winjs.base', 'vs/languages/lib/common/beautify-html', 'vs/languages/html/common/htmlTags', 'vs/base/common/network', 'vs/base/common/strings', 'vs/editor/common/core/position', 'vs/platform/workspace/common/workspace', 'vs/platform/markers/common/markers', 'vs/editor/common/services/resourceService', 'vs/languages/html/common/htmlScanner', 'vs/languages/html/common/htmlTokenTypes', 'vs/languages/html/common/htmlEmptyTagsShared', 'vs/editor/common/modes/supports/suggestSupport', 'vs/base/common/paths'], function (require, exports, uri_1, winjs, beautifyHTML, htmlTags, network, strings, position_1, workspace_1, markers_1, resourceService_1, htmlScanner_1, htmlTokenTypes_1, htmlEmptyTagsShared_1, suggestSupport_1, paths) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var LinkDetectionState;
    (function (LinkDetectionState) {
        LinkDetectionState[LinkDetectionState["LOOKING_FOR_HREF_OR_SRC"] = 1] = "LOOKING_FOR_HREF_OR_SRC";
        LinkDetectionState[LinkDetectionState["AFTER_HREF_OR_SRC"] = 2] = "AFTER_HREF_OR_SRC";
    })(LinkDetectionState || (LinkDetectionState = {}));
    var HTMLWorker = (function () {
        function HTMLWorker(modeId, resourceService, markerService, contextService) {
            this._modeId = modeId;
            this.resourceService = resourceService;
            this.markerService = markerService;
            this._contextService = contextService;
            this._tagProviders = [];
            this._tagProviders.push(htmlTags.getHTML5TagProvider());
            this.addCustomTagProviders(this._tagProviders);
        }
        HTMLWorker.prototype.addCustomTagProviders = function (providers) {
            providers.push(htmlTags.getAngularTagProvider());
            providers.push(htmlTags.getIonicTagProvider());
        };
        HTMLWorker.prototype.format = function (resource, range, options) {
            var _this = this;
            return this._delegateToModeAtPosition(resource, position_1.Position.startPosition(range), function (isEmbeddedMode, model) {
                if (isEmbeddedMode && model.getMode().formattingSupport) {
                    return model.getMode().formattingSupport.formatRange(model.getAssociatedResource(), range, options);
                }
                return _this.formatHTML(resource, range, options);
            });
        };
        HTMLWorker.prototype.formatHTML = function (resource, range, options) {
            var model = this.resourceService.get(resource);
            var value = range ? model.getValueInRange(range) : model.getValue();
            var htmlOptions = {
                indent_size: options.insertSpaces ? options.tabSize : 1,
                indent_char: options.insertSpaces ? ' ' : '\t',
                wrap_line_length: this.getFormatOption('wrapLineLength', 120),
                unformatted: this.getTagsFormatOption('unformatted', void 0),
                indent_inner_html: this.getFormatOption('indentInnerHtml', false),
                preserve_newlines: this.getFormatOption('preserveNewLines', false),
                max_preserve_newlines: this.getFormatOption('maxPreserveNewLines', void 0),
                indent_handlebars: this.getFormatOption('indentHandlebars', false),
                end_with_newline: this.getFormatOption('endWithNewline', false),
                extra_liners: this.getTagsFormatOption('extraLiners', void 0),
            };
            var result = beautifyHTML.html_beautify(value, htmlOptions);
            return winjs.TPromise.as([{
                    range: range,
                    text: result
                }]);
        };
        HTMLWorker.prototype.getFormatOption = function (key, dflt) {
            if (this.formatSettings && this.formatSettings.hasOwnProperty(key)) {
                var value = this.formatSettings[key];
                if (value !== null) {
                    return value;
                }
            }
            return dflt;
        };
        HTMLWorker.prototype.getTagsFormatOption = function (key, dflt) {
            var list = this.getFormatOption(key, null);
            if (list) {
                return list.split(',').map(function (t) { return t.trim().toLowerCase(); });
            }
            return dflt;
        };
        HTMLWorker.prototype._doConfigure = function (options) {
            this.formatSettings = options && options.format;
            return winjs.TPromise.as(null);
        };
        HTMLWorker.prototype._delegateToModeAtPosition = function (resource, position, callback) {
            var model = this.resourceService.get(resource);
            if (!model) {
                return null;
            }
            var modelAtPosition = model.getEmbeddedAtPosition(position);
            if (!modelAtPosition) {
                return callback(false, model);
            }
            var modeAtPosition = modelAtPosition.getMode();
            return callback(modeAtPosition.getId() !== this._modeId, modelAtPosition);
        };
        HTMLWorker.prototype._delegateToAllModes = function (resource, callback) {
            var model = this.resourceService.get(resource);
            if (!model) {
                return null;
            }
            return callback(model.getAllEmbedded());
        };
        HTMLWorker.prototype.computeInfo = function (resource, position) {
            return this._delegateToModeAtPosition(resource, position, function (isEmbeddedMode, model) {
                if (isEmbeddedMode && model.getMode().extraInfoSupport) {
                    return model.getMode().extraInfoSupport.computeInfo(model.getAssociatedResource(), position);
                }
            });
        };
        HTMLWorker.prototype.findReferences = function (resource, position, includeDeclaration) {
            return this._delegateToModeAtPosition(resource, position, function (isEmbeddedMode, model) {
                if (isEmbeddedMode && model.getMode().referenceSupport) {
                    return model.getMode().referenceSupport.findReferences(model.getAssociatedResource(), position, includeDeclaration);
                }
            });
        };
        HTMLWorker.prototype.getRangesToPosition = function (resource, position) {
            return this._delegateToModeAtPosition(resource, position, function (isEmbeddedMode, model) {
                if (isEmbeddedMode && model.getMode().logicalSelectionSupport) {
                    return model.getMode().logicalSelectionSupport.getRangesToPosition(model.getAssociatedResource(), position);
                }
            });
        };
        HTMLWorker.prototype.findDeclaration = function (resource, position) {
            return this._delegateToModeAtPosition(resource, position, function (isEmbeddedMode, model) {
                if (isEmbeddedMode && model.getMode().declarationSupport) {
                    return model.getMode().declarationSupport.findDeclaration(model.getAssociatedResource(), position);
                }
            });
        };
        HTMLWorker.prototype.findColorDeclarations = function (resource) {
            return this._delegateToAllModes(resource, function (models) {
                var allPromises = [];
                allPromises = models
                    .filter(function (model) { return (typeof model.getMode()['findColorDeclarations'] === 'function'); })
                    .map(function (model) { return model.getMode()['findColorDeclarations'](model.getAssociatedResource()); });
                return winjs.TPromise.join(allPromises).then(function (results) {
                    var result = [];
                    results.forEach(function (oneResult) { return result = result.concat(oneResult); });
                    return result;
                });
            });
        };
        HTMLWorker.prototype.getParameterHints = function (resource, position) {
            return this._delegateToModeAtPosition(resource, position, function (isEmbeddedMode, model) {
                if (isEmbeddedMode && model.getMode().parameterHintsSupport) {
                    return model.getMode().parameterHintsSupport.getParameterHints(model.getAssociatedResource(), position);
                }
            });
        };
        HTMLWorker.prototype.findMatchingOpenTag = function (scanner) {
            var closedTags = {};
            var tagClosed = false;
            while (scanner.scanBack()) {
                if (htmlTokenTypes_1.isTag(scanner.getTokenType()) && !tagClosed) {
                    var tag = scanner.getTokenContent();
                    scanner.scanBack();
                    if (scanner.getTokenType() === htmlTokenTypes_1.DELIM_END) {
                        closedTags[tag] = (closedTags[tag] || 0) + 1;
                    }
                    else if (!htmlEmptyTagsShared_1.isEmptyElement(tag)) {
                        if (closedTags[tag]) {
                            closedTags[tag]--;
                        }
                        else {
                            return tag;
                        }
                    }
                }
                else if (scanner.getTokenType() === htmlTokenTypes_1.DELIM_START) {
                    tagClosed = scanner.getTokenContent() === '/>';
                }
            }
            return null;
        };
        HTMLWorker.prototype.collectTagSuggestions = function (scanner, position, suggestions) {
            var _this = this;
            var model = scanner.getModel();
            var contentAfter = model.getLineContent(position.lineNumber).substr(position.column - 1);
            var closeTag = isWhiteSpace(contentAfter) || strings.startsWith(contentAfter, '<') ? '>' : '';
            var collectClosingTagSuggestion = function (overwriteBefore) {
                var endPosition = scanner.getTokenPosition();
                var matchingTag = _this.findMatchingOpenTag(scanner);
                if (matchingTag) {
                    var suggestion = {
                        label: '/' + matchingTag,
                        codeSnippet: '/' + matchingTag + closeTag,
                        overwriteBefore: overwriteBefore,
                        type: 'property'
                    };
                    suggestions.suggestions.push(suggestion);
                    // use indent from start tag
                    var startPosition = scanner.getTokenPosition();
                    if (endPosition.lineNumber !== startPosition.lineNumber) {
                        var startIndent = model.getLineContent(startPosition.lineNumber).substring(0, startPosition.column - 1);
                        var endIndent = model.getLineContent(endPosition.lineNumber).substring(0, endPosition.column - 1);
                        if (isWhiteSpace(startIndent) && isWhiteSpace(endIndent)) {
                            suggestion.overwriteBefore = position.column - 1; // replace from start of line
                            suggestion.codeSnippet = startIndent + '</' + matchingTag + closeTag;
                        }
                    }
                    return true;
                }
                return false;
            };
            if (scanner.getTokenType() === htmlTokenTypes_1.DELIM_END) {
                var hasClose = collectClosingTagSuggestion(suggestions.currentWord.length + 1);
                if (!hasClose) {
                    this._tagProviders.forEach(function (provider) {
                        provider.collectTags(function (tag, label) {
                            suggestions.suggestions.push({
                                label: '/' + tag,
                                overwriteBefore: suggestions.currentWord.length + 1,
                                codeSnippet: '/' + tag + closeTag,
                                type: 'property',
                                documentationLabel: label
                            });
                        });
                    });
                }
            }
            else {
                collectClosingTagSuggestion(suggestions.currentWord.length);
                this._tagProviders.forEach(function (provider) {
                    provider.collectTags(function (tag, label) {
                        suggestions.suggestions.push({
                            label: tag,
                            codeSnippet: tag,
                            type: 'property',
                            documentationLabel: label
                        });
                    });
                });
            }
        };
        HTMLWorker.prototype.collectContentSuggestions = function (suggestions) {
            // disable the simple snippets in favor of the emmet templates
        };
        HTMLWorker.prototype.collectAttributeSuggestions = function (scanner, suggestions) {
            var parentTag = null;
            do {
                if (htmlTokenTypes_1.isTag(scanner.getTokenType())) {
                    parentTag = scanner.getTokenContent();
                    break;
                }
                if (scanner.getTokenType() === htmlTokenTypes_1.DELIM_START) {
                    break;
                }
            } while (scanner.scanBack());
            this._tagProviders.forEach(function (provider) {
                provider.collectAttributes(parentTag, function (attribute, type) {
                    var codeSnippet = attribute;
                    if (type !== 'v') {
                        codeSnippet = codeSnippet + '="{{}}"';
                    }
                    suggestions.suggestions.push({
                        label: attribute,
                        codeSnippet: codeSnippet,
                        type: type === 'handler' ? 'function' : 'value'
                    });
                });
            });
        };
        HTMLWorker.prototype.collectAttributeValueSuggestions = function (scanner, suggestions) {
            var needsQuotes = scanner.getTokenType() === htmlTokenTypes_1.DELIM_ASSIGN;
            var attribute = null;
            var parentTag = null;
            while (scanner.scanBack()) {
                if (scanner.getTokenType() === htmlTokenTypes_1.ATTRIB_NAME) {
                    attribute = scanner.getTokenContent();
                    break;
                }
            }
            while (scanner.scanBack()) {
                if (htmlTokenTypes_1.isTag(scanner.getTokenType())) {
                    parentTag = scanner.getTokenContent();
                    break;
                }
                if (scanner.getTokenType() === htmlTokenTypes_1.DELIM_START) {
                    return;
                }
            }
            this._tagProviders.forEach(function (provider) {
                provider.collectValues(parentTag, attribute, function (value) {
                    suggestions.suggestions.push({
                        label: value,
                        codeSnippet: needsQuotes ? '"' + value + '"' : value,
                        type: 'unit'
                    });
                });
            });
        };
        HTMLWorker.prototype.suggest = function (resource, position, triggerCharacter) {
            var _this = this;
            return this._delegateToModeAtPosition(resource, position, function (isEmbeddedMode, model) {
                if (isEmbeddedMode && model.getMode().suggestSupport) {
                    return model.getMode().suggestSupport.suggest(model.getAssociatedResource(), position, triggerCharacter);
                }
                return _this.suggestHTML(resource, position);
            });
        };
        HTMLWorker.prototype.suggestHTML = function (resource, position) {
            return this.doSuggest(resource, position).then(function (value) { return suggestSupport_1.filterSuggestions(value); });
        };
        HTMLWorker.prototype.doSuggest = function (resource, position) {
            var model = this.resourceService.get(resource), currentWord = model.getWordUntilPosition(position).word;
            var suggestions = {
                currentWord: currentWord,
                suggestions: [],
            };
            var scanner = htmlScanner_1.getScanner(model, position);
            switch (scanner.getTokenType()) {
                case htmlTokenTypes_1.DELIM_START:
                case htmlTokenTypes_1.DELIM_END:
                    if (scanner.isOpenBrace()) {
                        this.collectTagSuggestions(scanner, position, suggestions);
                    }
                    else {
                        this.collectContentSuggestions(suggestions);
                    }
                    break;
                case htmlTokenTypes_1.ATTRIB_NAME:
                    this.collectAttributeSuggestions(scanner, suggestions);
                    break;
                case htmlTokenTypes_1.ATTRIB_VALUE:
                    this.collectAttributeValueSuggestions(scanner, suggestions);
                    break;
                case htmlTokenTypes_1.DELIM_ASSIGN:
                    if (scanner.isAtTokenEnd()) {
                        this.collectAttributeValueSuggestions(scanner, suggestions);
                    }
                    break;
                case '':
                    if (isWhiteSpace(scanner.getTokenContent()) && scanner.scanBack()) {
                        switch (scanner.getTokenType()) {
                            case htmlTokenTypes_1.ATTRIB_VALUE:
                            case htmlTokenTypes_1.ATTRIB_NAME:
                                this.collectAttributeSuggestions(scanner, suggestions);
                                break;
                            case htmlTokenTypes_1.DELIM_ASSIGN:
                                this.collectAttributeValueSuggestions(scanner, suggestions);
                                break;
                            case htmlTokenTypes_1.DELIM_START:
                            case htmlTokenTypes_1.DELIM_END:
                                if (scanner.isOpenBrace()) {
                                    this.collectTagSuggestions(scanner, position, suggestions);
                                }
                                else {
                                    this.collectContentSuggestions(suggestions);
                                }
                                break;
                            default:
                                if (htmlTokenTypes_1.isTag(scanner.getTokenType())) {
                                    this.collectAttributeSuggestions(scanner, suggestions);
                                }
                        }
                    }
                    else {
                        this.collectContentSuggestions(suggestions);
                    }
                    break;
                default:
                    if (htmlTokenTypes_1.isTag(scanner.getTokenType())) {
                        scanner.scanBack(); // one back to the end/start bracket
                        this.collectTagSuggestions(scanner, position, suggestions);
                    }
            }
            return winjs.TPromise.as(suggestions);
        };
        HTMLWorker.prototype.findMatchingBracket = function (tagname, scanner) {
            if (htmlEmptyTagsShared_1.isEmptyElement(tagname)) {
                return null;
            }
            var tagCount = 0;
            scanner.scanBack(); // one back to the end/start bracket
            if (scanner.getTokenType() === htmlTokenTypes_1.DELIM_END) {
                // find the opening tag
                var tagClosed = false;
                while (scanner.scanBack()) {
                    if (htmlTokenTypes_1.isTag(scanner.getTokenType()) && scanner.getTokenContent() === tagname && !tagClosed) {
                        var range = scanner.getTokenRange();
                        scanner.scanBack(); // one back to the end/start bracket
                        if (scanner.getTokenType() === htmlTokenTypes_1.DELIM_START) {
                            if (tagCount === 0) {
                                return range;
                            }
                            else {
                                tagCount--;
                            }
                        }
                        else {
                            tagCount++;
                        }
                    }
                    else if (scanner.getTokenType() === htmlTokenTypes_1.DELIM_START) {
                        tagClosed = scanner.getTokenContent() === '/>';
                    }
                }
            }
            else {
                var isTagEnd = false;
                while (scanner.scanForward()) {
                    if (htmlTokenTypes_1.isTag(scanner.getTokenType()) && scanner.getTokenContent() === tagname) {
                        if (!isTagEnd) {
                            scanner.scanForward();
                            if (scanner.getTokenType() === htmlTokenTypes_1.DELIM_START && scanner.getTokenContent() === '/>') {
                                if (tagCount <= 0) {
                                    return null;
                                }
                            }
                            else {
                                tagCount++;
                            }
                        }
                        else {
                            tagCount--;
                            if (tagCount <= 0) {
                                return scanner.getTokenRange();
                            }
                        }
                    }
                    else if (scanner.getTokenType() === htmlTokenTypes_1.DELIM_START) {
                        isTagEnd = false;
                    }
                    else if (scanner.getTokenType() === htmlTokenTypes_1.DELIM_END) {
                        isTagEnd = true;
                    }
                }
            }
            return null;
        };
        HTMLWorker.prototype.findOccurrences = function (resource, position, strict) {
            var _this = this;
            if (strict === void 0) { strict = false; }
            return this._delegateToModeAtPosition(resource, position, function (isEmbeddedMode, model) {
                if (isEmbeddedMode && model.getMode().occurrencesSupport) {
                    return model.getMode().occurrencesSupport.findOccurrences(model.getAssociatedResource(), position, strict);
                }
                return _this.findOccurrencesHTML(resource, position, strict);
            });
        };
        HTMLWorker.prototype.findOccurrencesHTML = function (resource, position, strict) {
            var model = this.resourceService.get(resource), wordAtPosition = model.getWordAtPosition(position), currentWord = (wordAtPosition ? wordAtPosition.word : ''), result = [];
            var scanner = htmlScanner_1.getScanner(model, position);
            if (htmlTokenTypes_1.isTag(scanner.getTokenType())) {
                var tagname = scanner.getTokenContent();
                result.push({
                    range: scanner.getTokenRange()
                });
                var range = this.findMatchingBracket(tagname, scanner);
                if (range) {
                    result.push({
                        range: range
                    });
                }
            }
            else {
                var words = model.getAllWordsWithRange(), upperBound = Math.min(1000, words.length); // Limit find occurences to 1000 occurences
                for (var i = 0; i < upperBound; i++) {
                    if (words[i].text === currentWord) {
                        result.push({
                            range: words[i].range
                        });
                    }
                }
            }
            return winjs.TPromise.as(result);
        };
        HTMLWorker._stripQuotes = function (url) {
            return url
                .replace(/^'([^']+)'$/, function (substr, match1) { return match1; })
                .replace(/^"([^"]+)"$/, function (substr, match1) { return match1; });
        };
        HTMLWorker._getWorkspaceUrl = function (modelAbsoluteUri, rootAbsoluteUri, tokenContent) {
            tokenContent = HTMLWorker._stripQuotes(tokenContent);
            if (/^\s*javascript\:/i.test(tokenContent) || /^\s*\#/i.test(tokenContent)) {
                return null;
            }
            if (/^\s*https?:\/\//i.test(tokenContent) || /^\s*file:\/\//i.test(tokenContent)) {
                // Absolute link that needs no treatment
                return tokenContent.replace(/^\s*/g, '');
            }
            if (/^\s*\/\//i.test(tokenContent)) {
                // Absolute link (that does not name the protocol)
                var pickedScheme = network.Schemas.http;
                if (modelAbsoluteUri.scheme === network.Schemas.https) {
                    pickedScheme = network.Schemas.https;
                }
                return pickedScheme + ':' + tokenContent.replace(/^\s*/g, '');
            }
            var modelPath = paths.dirname(modelAbsoluteUri.path);
            var alternativeResultPath = null;
            if (tokenContent.length > 0 && tokenContent.charAt(0) === '/') {
                alternativeResultPath = tokenContent;
            }
            else {
                alternativeResultPath = paths.join(modelPath, tokenContent);
                alternativeResultPath = alternativeResultPath.replace(/^(\/\.\.)+/, '');
            }
            var potentialResult = modelAbsoluteUri.withPath(alternativeResultPath).toString();
            var rootAbsoluteUrlStr = (rootAbsoluteUri ? rootAbsoluteUri.toString() : null);
            if (rootAbsoluteUrlStr && strings.startsWith(modelAbsoluteUri.toString(), rootAbsoluteUrlStr)) {
                // The `rootAbsoluteUrl` is set and matches our current model
                // We need to ensure that this `potentialResult` does not escape `rootAbsoluteUrl`
                var commonPrefixLength = strings.commonPrefixLength(rootAbsoluteUrlStr, potentialResult);
                if (strings.endsWith(rootAbsoluteUrlStr, '/')) {
                    commonPrefixLength = potentialResult.lastIndexOf('/', commonPrefixLength) + 1;
                }
                return rootAbsoluteUrlStr + potentialResult.substr(commonPrefixLength);
            }
            return potentialResult;
        };
        HTMLWorker.prototype.createLink = function (modelAbsoluteUrl, rootAbsoluteUrl, tokenContent, lineNumber, startColumn, endColumn) {
            var workspaceUrl = HTMLWorker._getWorkspaceUrl(modelAbsoluteUrl, rootAbsoluteUrl, tokenContent);
            if (!workspaceUrl) {
                return null;
            }
            //		console.info('workspaceUrl: ' + workspaceUrl);
            return {
                range: {
                    startLineNumber: lineNumber,
                    startColumn: startColumn,
                    endLineNumber: lineNumber,
                    endColumn: endColumn
                },
                url: workspaceUrl
            };
        };
        HTMLWorker.prototype._computeHTMLLinks = function (model) {
            var lineCount = model.getLineCount(), newLinks = [], state = LinkDetectionState.LOOKING_FOR_HREF_OR_SRC, modelAbsoluteUrl = model.getAssociatedResource(), lineNumber, lineContent, lineContentLength, tokens, tokenType, tokensLength, i, nextTokenEndIndex, tokenContent, link;
            var rootAbsoluteUrl = null;
            var workspace = this._contextService.getWorkspace();
            if (workspace) {
                // The workspace can be null in the no folder opened case
                var strRootAbsoluteUrl = String(workspace.resource);
                if (strRootAbsoluteUrl.charAt(strRootAbsoluteUrl.length - 1) === '/') {
                    rootAbsoluteUrl = uri_1.default.parse(strRootAbsoluteUrl);
                }
                else {
                    rootAbsoluteUrl = uri_1.default.parse(strRootAbsoluteUrl + '/');
                }
            }
            for (lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
                lineContent = model.getLineContent(lineNumber);
                lineContentLength = lineContent.length;
                tokens = model.getLineTokens(lineNumber);
                for (i = 0, tokensLength = tokens.getTokenCount(); i < tokensLength; i++) {
                    tokenType = tokens.getTokenType(i);
                    switch (tokenType) {
                        case htmlTokenTypes_1.DELIM_ASSIGN:
                        case '':
                            break;
                        case htmlTokenTypes_1.ATTRIB_NAME:
                            nextTokenEndIndex = tokens.getTokenEndIndex(i, lineContentLength);
                            tokenContent = lineContent.substring(tokens.getTokenStartIndex(i), nextTokenEndIndex).toLowerCase();
                            if (tokenContent === 'src' || tokenContent === 'href') {
                                state = LinkDetectionState.AFTER_HREF_OR_SRC;
                            }
                            else {
                                state = LinkDetectionState.LOOKING_FOR_HREF_OR_SRC;
                            }
                            break;
                        case htmlTokenTypes_1.ATTRIB_VALUE:
                            if (state === LinkDetectionState.AFTER_HREF_OR_SRC) {
                                nextTokenEndIndex = tokens.getTokenEndIndex(i, lineContentLength);
                                tokenContent = lineContent.substring(tokens.getTokenStartIndex(i), nextTokenEndIndex);
                                link = this.createLink(modelAbsoluteUrl, rootAbsoluteUrl, tokenContent, lineNumber, tokens.getTokenStartIndex(i) + 2, nextTokenEndIndex);
                                if (link) {
                                    newLinks.push(link);
                                }
                                state = LinkDetectionState.LOOKING_FOR_HREF_OR_SRC;
                            }
                        default:
                            if (htmlTokenTypes_1.isTag(tokenType)) {
                                state = LinkDetectionState.LOOKING_FOR_HREF_OR_SRC;
                            }
                            else if (state === LinkDetectionState.AFTER_HREF_OR_SRC) {
                                state = LinkDetectionState.LOOKING_FOR_HREF_OR_SRC;
                            }
                    }
                }
            }
            return newLinks;
        };
        HTMLWorker.prototype.computeLinks = function (resource) {
            var model = this.resourceService.get(resource);
            return winjs.TPromise.as(this._computeHTMLLinks(model));
        };
        HTMLWorker = __decorate([
            __param(1, resourceService_1.IResourceService),
            __param(2, markers_1.IMarkerService),
            __param(3, workspace_1.IWorkspaceContextService)
        ], HTMLWorker);
        return HTMLWorker;
    }());
    exports.HTMLWorker = HTMLWorker;
    function isWhiteSpace(s) {
        return /^\s*$/.test(s);
    }
});
//# sourceMappingURL=htmlWorker.js.map