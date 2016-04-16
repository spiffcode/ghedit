var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/editor/common/modes', 'vs/editor/common/modes/abstractMode', 'vs/editor/common/modes/abstractState', 'vs/platform/thread/common/threadService', 'vs/editor/common/services/modeService', 'vs/platform/instantiation/common/instantiation', 'vs/languages/html/common/htmlTokenTypes', 'vs/languages/html/common/htmlEmptyTagsShared', 'vs/editor/common/modes/supports/richEditSupport', 'vs/editor/common/modes/supports/tokenizationSupport', 'vs/editor/common/modes/supports/referenceSupport', 'vs/editor/common/modes/supports/parameterHintsSupport', 'vs/editor/common/modes/supports/suggestSupport', 'vs/platform/thread/common/thread'], function (require, exports, winjs, Modes, abstractMode_1, abstractState_1, threadService_1, modeService_1, instantiation_1, htmlTokenTypes, htmlEmptyTagsShared_1, richEditSupport_1, tokenizationSupport_1, referenceSupport_1, parameterHintsSupport_1, suggestSupport_1, thread_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    exports.htmlTokenTypes = htmlTokenTypes;
    exports.EMPTY_ELEMENTS = htmlEmptyTagsShared_1.EMPTY_ELEMENTS;
     // export to be used by Razor. We are the main module, so Razor should get ot from use.
     // export to be used by Razor. We are the main module, so Razor should get ot from use.
    (function (States) {
        States[States["Content"] = 0] = "Content";
        States[States["OpeningStartTag"] = 1] = "OpeningStartTag";
        States[States["OpeningEndTag"] = 2] = "OpeningEndTag";
        States[States["WithinDoctype"] = 3] = "WithinDoctype";
        States[States["WithinTag"] = 4] = "WithinTag";
        States[States["WithinComment"] = 5] = "WithinComment";
        States[States["WithinEmbeddedContent"] = 6] = "WithinEmbeddedContent";
        States[States["AttributeName"] = 7] = "AttributeName";
        States[States["AttributeValue"] = 8] = "AttributeValue";
    })(exports.States || (exports.States = {}));
    var States = exports.States;
    // list of elements that embed other content
    var tagsEmbeddingContent = ['script', 'style'];
    var State = (function (_super) {
        __extends(State, _super);
        function State(mode, kind, lastTagName, lastAttributeName, embeddedContentType, attributeValueQuote, attributeValue) {
            _super.call(this, mode);
            this.kind = kind;
            this.lastTagName = lastTagName;
            this.lastAttributeName = lastAttributeName;
            this.embeddedContentType = embeddedContentType;
            this.attributeValueQuote = attributeValueQuote;
            this.attributeValue = attributeValue;
        }
        State.escapeTagName = function (s) {
            return htmlTokenTypes.getTag(s.replace(/[:_.]/g, '-'));
        };
        State.prototype.makeClone = function () {
            return new State(this.getMode(), this.kind, this.lastTagName, this.lastAttributeName, this.embeddedContentType, this.attributeValueQuote, this.attributeValue);
        };
        State.prototype.equals = function (other) {
            if (other instanceof State) {
                return (_super.prototype.equals.call(this, other) &&
                    this.kind === other.kind &&
                    this.lastTagName === other.lastTagName &&
                    this.lastAttributeName === other.lastAttributeName &&
                    this.embeddedContentType === other.embeddedContentType &&
                    this.attributeValueQuote === other.attributeValueQuote &&
                    this.attributeValue === other.attributeValue);
            }
            return false;
        };
        State.prototype.nextName = function (stream) {
            return stream.advanceIfRegExp(/^[_:\w][_:\w-.\d]*/).toLowerCase();
        };
        State.prototype.tokenize = function (stream) {
            switch (this.kind) {
                case States.WithinComment:
                    if (stream.advanceUntilString2('-->', false)) {
                        return { type: htmlTokenTypes.COMMENT };
                    }
                    else if (stream.advanceIfString2('-->')) {
                        this.kind = States.Content;
                        return { type: htmlTokenTypes.DELIM_COMMENT, dontMergeWithPrev: true };
                    }
                    break;
                case States.WithinDoctype:
                    if (stream.advanceUntilString2('>', false)) {
                        return { type: htmlTokenTypes.DOCTYPE };
                    }
                    else if (stream.advanceIfString2('>')) {
                        this.kind = States.Content;
                        return { type: htmlTokenTypes.DELIM_DOCTYPE, dontMergeWithPrev: true };
                    }
                    break;
                case States.Content:
                    if (stream.advanceIfCharCode2('<'.charCodeAt(0))) {
                        if (!stream.eos() && stream.peek() === '!') {
                            if (stream.advanceIfString2('!--')) {
                                this.kind = States.WithinComment;
                                return { type: htmlTokenTypes.DELIM_COMMENT, dontMergeWithPrev: true };
                            }
                            if (stream.advanceIfStringCaseInsensitive2('!DOCTYPE')) {
                                this.kind = States.WithinDoctype;
                                return { type: htmlTokenTypes.DELIM_DOCTYPE, dontMergeWithPrev: true };
                            }
                        }
                        if (stream.advanceIfCharCode2('/'.charCodeAt(0))) {
                            this.kind = States.OpeningEndTag;
                            return { type: htmlTokenTypes.DELIM_END, dontMergeWithPrev: true };
                        }
                        this.kind = States.OpeningStartTag;
                        return { type: htmlTokenTypes.DELIM_START, dontMergeWithPrev: true };
                    }
                    break;
                case States.OpeningEndTag:
                    var tagName = this.nextName(stream);
                    if (tagName.length > 0) {
                        return {
                            type: State.escapeTagName(tagName),
                        };
                    }
                    else if (stream.advanceIfString2('>')) {
                        this.kind = States.Content;
                        return { type: htmlTokenTypes.DELIM_END, dontMergeWithPrev: true };
                    }
                    else {
                        stream.advanceUntilString2('>', false);
                        return { type: '' };
                    }
                case States.OpeningStartTag:
                    this.lastTagName = this.nextName(stream);
                    if (this.lastTagName.length > 0) {
                        this.lastAttributeName = null;
                        if ('script' === this.lastTagName || 'style' === this.lastTagName) {
                            this.lastAttributeName = null;
                            this.embeddedContentType = null;
                        }
                        this.kind = States.WithinTag;
                        return {
                            type: State.escapeTagName(this.lastTagName),
                        };
                    }
                    break;
                case States.WithinTag:
                    if (stream.skipWhitespace2() || stream.eos()) {
                        return { type: '' };
                    }
                    else {
                        var name = this.nextName(stream);
                        if (name.length > 0) {
                            this.lastAttributeName = name;
                            this.kind = States.AttributeName;
                            return { type: htmlTokenTypes.ATTRIB_NAME };
                        }
                        else if (stream.advanceIfString2('/>')) {
                            this.kind = States.Content;
                            return { type: htmlTokenTypes.DELIM_START, dontMergeWithPrev: true };
                        }
                        if (stream.advanceIfCharCode2('>'.charCodeAt(0))) {
                            if (tagsEmbeddingContent.indexOf(this.lastTagName) !== -1) {
                                this.kind = States.WithinEmbeddedContent;
                                return { type: htmlTokenTypes.DELIM_START, dontMergeWithPrev: true };
                            }
                            else {
                                this.kind = States.Content;
                                return { type: htmlTokenTypes.DELIM_START, dontMergeWithPrev: true };
                            }
                        }
                        else {
                            stream.next2();
                            return { type: '' };
                        }
                    }
                case States.AttributeName:
                    if (stream.skipWhitespace2() || stream.eos()) {
                        return { type: '' };
                    }
                    if (stream.advanceIfCharCode2('='.charCodeAt(0))) {
                        this.kind = States.AttributeValue;
                        return { type: htmlTokenTypes.DELIM_ASSIGN };
                    }
                    else {
                        this.kind = States.WithinTag;
                        return this.tokenize(stream); // no advance yet - jump to WithinTag
                    }
                case States.AttributeValue:
                    if (stream.eos()) {
                        return { type: '' };
                    }
                    if (stream.skipWhitespace2()) {
                        if (this.attributeValueQuote === '"' || this.attributeValueQuote === '\'') {
                            // We are inside the quotes of an attribute value
                            return { type: htmlTokenTypes.ATTRIB_VALUE };
                        }
                        return { type: '' };
                    }
                    // We are in a attribute value
                    if (this.attributeValueQuote === '"' || this.attributeValueQuote === '\'') {
                        if (this.attributeValue === this.attributeValueQuote && ('script' === this.lastTagName || 'style' === this.lastTagName) && 'type' === this.lastAttributeName) {
                            this.attributeValue = stream.advanceUntilString(this.attributeValueQuote, true);
                            if (this.attributeValue.length > 0) {
                                this.embeddedContentType = this.unquote(this.attributeValue);
                                this.kind = States.WithinTag;
                                this.attributeValue = '';
                                this.attributeValueQuote = '';
                                return { type: htmlTokenTypes.ATTRIB_VALUE };
                            }
                        }
                        else {
                            if (stream.advanceIfCharCode2(this.attributeValueQuote.charCodeAt(0))) {
                                this.kind = States.WithinTag;
                                this.attributeValue = '';
                                this.attributeValueQuote = '';
                            }
                            else {
                                var part = stream.next();
                                this.attributeValue += part;
                            }
                            return { type: htmlTokenTypes.ATTRIB_VALUE };
                        }
                    }
                    else {
                        var ch = stream.peek();
                        if (ch === '\'' || ch === '"') {
                            this.attributeValueQuote = ch;
                            this.attributeValue = ch;
                            stream.next2();
                            return { type: htmlTokenTypes.ATTRIB_VALUE };
                        }
                        else {
                            this.kind = States.WithinTag;
                            return this.tokenize(stream); // no advance yet - jump to WithinTag
                        }
                    }
            }
            stream.next2();
            this.kind = States.Content;
            return { type: '' };
        };
        State.prototype.unquote = function (value) {
            var start = 0;
            var end = value.length;
            if ('"' === value[0]) {
                start++;
            }
            if ('"' === value[end - 1]) {
                end--;
            }
            return value.substring(start, end);
        };
        return State;
    }(abstractState_1.AbstractState));
    exports.State = State;
    var HTMLMode = (function (_super) {
        __extends(HTMLMode, _super);
        function HTMLMode(descriptor, instantiationService, modeService, threadService) {
            var _this = this;
            _super.call(this, descriptor.id);
            this._modeWorkerManager = this._createModeWorkerManager(descriptor, instantiationService);
            this.modeService = modeService;
            this.threadService = threadService;
            this.tokenizationSupport = new tokenizationSupport_1.TokenizationSupport(this, this, true, true);
            this.linkSupport = this;
            this.configSupport = this;
            this.formattingSupport = this;
            this.extraInfoSupport = this;
            this.occurrencesSupport = this;
            this.referenceSupport = new referenceSupport_1.ReferenceSupport(this.getId(), {
                tokens: ['invalid'],
                findReferences: function (resource, position, includeDeclaration) { return _this.findReferences(resource, position, includeDeclaration); } });
            this.logicalSelectionSupport = this;
            this.parameterHintsSupport = new parameterHintsSupport_1.ParameterHintsSupport(this.getId(), {
                triggerCharacters: ['(', ','],
                excludeTokens: ['*'],
                getParameterHints: function (resource, position) { return _this.getParameterHints(resource, position); } });
            // TODO@Alex TODO@Joh: there is something off about declaration support of embedded JS in HTML
            // this.declarationSupport = new DeclarationSupport(this, {
            // 		tokens: ['invalid'],
            // 		findDeclaration: (resource, position) => this.findDeclaration(resource, position)});
            this.suggestSupport = new suggestSupport_1.SuggestSupport(this.getId(), {
                triggerCharacters: ['.', ':', '<', '"', '=', '/'],
                excludeTokens: ['comment'],
                suggest: function (resource, position) { return _this.suggest(resource, position); } });
            this.richEditSupport = this._createRichEditSupport();
        }
        HTMLMode.prototype.asyncCtor = function () {
            return winjs.Promise.join([
                this.modeService.getOrCreateMode('text/css'),
                this.modeService.getOrCreateMode('text/javascript'),
            ]);
        };
        HTMLMode.prototype._createModeWorkerManager = function (descriptor, instantiationService) {
            return new abstractMode_1.ModeWorkerManager(descriptor, 'vs/languages/html/common/htmlWorker', 'HTMLWorker', null, instantiationService);
        };
        HTMLMode.prototype._worker = function (runner) {
            return this._modeWorkerManager.worker(runner);
        };
        HTMLMode.prototype._createRichEditSupport = function () {
            return new richEditSupport_1.RichEditSupport(this.getId(), null, {
                wordPattern: abstractMode_1.createWordRegExp('#-?%'),
                comments: {
                    blockComment: ['<!--', '-->']
                },
                brackets: [
                    ['<!--', '-->'],
                    ['<', '>'],
                ],
                __electricCharacterSupport: {
                    caseInsensitive: true,
                    embeddedElectricCharacters: ['*', '}', ']', ')']
                },
                __characterPairSupport: {
                    autoClosingPairs: [
                        { open: '{', close: '}' },
                        { open: '[', close: ']' },
                        { open: '(', close: ')' },
                        { open: '"', close: '"' },
                        { open: '\'', close: '\'' }
                    ],
                    surroundingPairs: [
                        { open: '"', close: '"' },
                        { open: '\'', close: '\'' }
                    ]
                },
                onEnterRules: [
                    {
                        beforeText: new RegExp("<(?!(?:" + htmlEmptyTagsShared_1.EMPTY_ELEMENTS.join('|') + "))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$", 'i'),
                        afterText: /^<\/(\w[\w\d]*)\s*>$/i,
                        action: { indentAction: Modes.IndentAction.IndentOutdent }
                    },
                    {
                        beforeText: new RegExp("<(?!(?:" + htmlEmptyTagsShared_1.EMPTY_ELEMENTS.join('|') + "))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$", 'i'),
                        action: { indentAction: Modes.IndentAction.Indent }
                    }
                ],
            });
        };
        // TokenizationSupport
        HTMLMode.prototype.getInitialState = function () {
            return new State(this, States.Content, '', '', '', '', '');
        };
        HTMLMode.prototype.enterNestedMode = function (state) {
            return state instanceof State && state.kind === States.WithinEmbeddedContent;
        };
        HTMLMode.prototype.getNestedMode = function (state) {
            var result = null;
            var htmlState = state;
            var missingModePromise = null;
            if (htmlState.embeddedContentType !== null) {
                if (this.modeService.isRegisteredMode(htmlState.embeddedContentType)) {
                    result = this.modeService.getMode(htmlState.embeddedContentType);
                    if (!result) {
                        missingModePromise = this.modeService.getOrCreateMode(htmlState.embeddedContentType);
                    }
                }
            }
            else {
                var mimeType = null;
                if ('script' === htmlState.lastTagName) {
                    mimeType = 'text/javascript';
                }
                else if ('style' === htmlState.lastTagName) {
                    mimeType = 'text/css';
                }
                else {
                    mimeType = 'text/plain';
                }
                result = this.modeService.getMode(mimeType);
            }
            if (result === null) {
                result = this.modeService.getMode('text/plain');
            }
            return {
                mode: result,
                missingModePromise: missingModePromise
            };
        };
        HTMLMode.prototype.getLeavingNestedModeData = function (line, state) {
            var tagName = state.lastTagName;
            var regexp = new RegExp('<\\/' + tagName + '\\s*>', 'i');
            var match = regexp.exec(line);
            if (match !== null) {
                return {
                    nestedModeBuffer: line.substring(0, match.index),
                    bufferAfterNestedMode: line.substring(match.index),
                    stateAfterNestedMode: new State(this, States.Content, '', '', '', '', '')
                };
            }
            return null;
        };
        HTMLMode.prototype.configure = function (options) {
            if (this.threadService.isInMainThread) {
                return this._configureWorkers(options);
            }
            else {
                return this._worker(function (w) { return w._doConfigure(options); });
            }
        };
        HTMLMode.prototype._configureWorkers = function (options) {
            return this._worker(function (w) { return w._doConfigure(options); });
        };
        HTMLMode.prototype.computeLinks = function (resource) {
            return this._worker(function (w) { return w.computeLinks(resource); });
        };
        HTMLMode.prototype.formatRange = function (resource, range, options) {
            return this._worker(function (w) { return w.format(resource, range, options); });
        };
        HTMLMode.prototype.computeInfo = function (resource, position) {
            return this._worker(function (w) { return w.computeInfo(resource, position); });
        };
        HTMLMode.prototype.findReferences = function (resource, position, includeDeclaration) {
            return this._worker(function (w) { return w.findReferences(resource, position, includeDeclaration); });
        };
        HTMLMode.prototype.getRangesToPosition = function (resource, position) {
            return this._worker(function (w) { return w.getRangesToPosition(resource, position); });
        };
        HTMLMode.prototype.findDeclaration = function (resource, position) {
            return this._worker(function (w) { return w.findDeclaration(resource, position); });
        };
        HTMLMode.prototype.findOccurrences = function (resource, position, strict) {
            if (strict === void 0) { strict = false; }
            return this._worker(function (w) { return w.findOccurrences(resource, position, strict); });
        };
        HTMLMode.prototype.suggest = function (resource, position) {
            return this._worker(function (w) { return w.suggest(resource, position); });
        };
        HTMLMode.prototype.findColorDeclarations = function (resource) {
            return this._worker(function (w) { return w.findColorDeclarations(resource); });
        };
        HTMLMode.prototype.getParameterHints = function (resource, position) {
            return this._worker(function (w) { return w.getParameterHints(resource, position); });
        };
        HTMLMode.$_configureWorkers = threadService_1.AllWorkersAttr(HTMLMode, HTMLMode.prototype._configureWorkers);
        HTMLMode.$computeLinks = threadService_1.OneWorkerAttr(HTMLMode, HTMLMode.prototype.computeLinks);
        HTMLMode.$formatRange = threadService_1.OneWorkerAttr(HTMLMode, HTMLMode.prototype.formatRange);
        HTMLMode.$computeInfo = threadService_1.OneWorkerAttr(HTMLMode, HTMLMode.prototype.computeInfo);
        HTMLMode.$findReferences = threadService_1.OneWorkerAttr(HTMLMode, HTMLMode.prototype.findReferences);
        HTMLMode.$getRangesToPosition = threadService_1.OneWorkerAttr(HTMLMode, HTMLMode.prototype.getRangesToPosition);
        HTMLMode.$findDeclaration = threadService_1.OneWorkerAttr(HTMLMode, HTMLMode.prototype.findDeclaration);
        HTMLMode.$findOccurrences = threadService_1.OneWorkerAttr(HTMLMode, HTMLMode.prototype.findOccurrences);
        HTMLMode.$suggest = threadService_1.OneWorkerAttr(HTMLMode, HTMLMode.prototype.suggest);
        HTMLMode.$findColorDeclarations = threadService_1.OneWorkerAttr(HTMLMode, HTMLMode.prototype.findColorDeclarations);
        HTMLMode.$getParameterHints = threadService_1.OneWorkerAttr(HTMLMode, HTMLMode.prototype.getParameterHints);
        HTMLMode = __decorate([
            __param(1, instantiation_1.IInstantiationService),
            __param(2, modeService_1.IModeService),
            __param(3, thread_1.IThreadService)
        ], HTMLMode);
        return HTMLMode;
    }(abstractMode_1.AbstractMode));
    exports.HTMLMode = HTMLMode;
});
//# sourceMappingURL=html.js.map