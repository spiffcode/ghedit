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
define(["require", "exports", 'vs/base/common/objects', 'vs/platform/thread/common/threadService', 'vs/languages/css/common/cssTokenTypes', 'vs/editor/common/modes/abstractMode', 'vs/editor/common/modes/abstractState', 'vs/platform/instantiation/common/instantiation', 'vs/platform/thread/common/thread', 'vs/editor/common/modes/supports/richEditSupport', 'vs/editor/common/modes/supports/tokenizationSupport', 'vs/editor/common/modes/supports/declarationSupport', 'vs/editor/common/modes/supports/referenceSupport', 'vs/editor/common/modes/supports/suggestSupport'], function (require, exports, objects, threadService_1, cssTokenTypes, abstractMode_1, abstractState_1, instantiation_1, thread_1, richEditSupport_1, tokenizationSupport_1, declarationSupport_1, referenceSupport_1, suggestSupport_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    exports.cssTokenTypes = cssTokenTypes;
    (function (States) {
        States[States["Selector"] = 0] = "Selector";
        States[States["Rule"] = 1] = "Rule";
        States[States["Value"] = 2] = "Value";
        States[States["ValuePostUrl"] = 3] = "ValuePostUrl";
        States[States["ValueInUrlFunction"] = 4] = "ValueInUrlFunction";
        States[States["Unit"] = 5] = "Unit";
        States[States["Meta"] = 6] = "Meta";
        States[States["MetaPostUrl"] = 7] = "MetaPostUrl";
        States[States["MetaInUrlFunction"] = 8] = "MetaInUrlFunction";
    })(exports.States || (exports.States = {}));
    var States = exports.States;
    var identRegEx = /^-?-?([a-zA-Z]|(\\(([0-9a-fA-F]{1,6}\s?)|[^[0-9a-fA-F])))([\w\-]|(\\(([0-9a-fA-F]{1,6}\s?)|[^[0-9a-fA-F])))*/;
    var State = (function (_super) {
        __extends(State, _super);
        function State(mode, kind, inComment, quote, inMeta, metaBraceCount) {
            _super.call(this, mode);
            this.kind = kind;
            this.inComment = inComment;
            this.quote = quote;
            this.inMeta = inMeta;
            this.metaBraceCount = metaBraceCount;
        }
        State.prototype.nextState = function (next, token) {
            this.kind = next;
            return token;
        };
        State.prototype.makeClone = function () {
            return new State(this.getMode(), this.kind, this.inComment, this.quote, this.inMeta, this.metaBraceCount);
        };
        State.prototype.equals = function (other) {
            return _super.prototype.equals.call(this, other) && objects.equals(this, other);
        };
        State.prototype.tokenizeInComment = function (stream) {
            if (/\*\/$/.test(stream.advanceUntilString('*/', true))) {
                this.inComment = false;
            }
            return { type: 'comment.css' };
        };
        State.prototype.tokenizeInString = function (stream) {
            var ch, afterBackslash = false, quote = this.quote;
            while (!stream.eos()) {
                ch = stream.next();
                if (afterBackslash) {
                    // Ignore any character after \
                    afterBackslash = false;
                }
                else if (ch === '\\') {
                    // Mark next character for ignoring
                    afterBackslash = true;
                }
                else if (ch === quote) {
                    // Matching quote found
                    this.quote = null;
                    break;
                }
            }
            return { type: 'string.css' };
        };
        State.prototype.consumeIdent = function (stream) {
            stream.goBack(1);
            if (stream.advanceIfRegExp2(identRegEx)) {
                return true;
            }
            stream.advance(1);
            return false;
        };
        State.prototype.tokenize = function (stream) {
            if (this.inComment) {
                return this.tokenizeInComment(stream);
            }
            if (this.quote !== null) {
                return this.tokenizeInString(stream);
            }
            if (stream.skipWhitespace2()) {
                return { type: '' };
            }
            if (stream.advanceIfString2('/*')) {
                this.inComment = true;
                return this.tokenizeInComment(stream);
            }
            if (stream.advanceIfString2('\'')) {
                this.quote = '\'';
                return this.tokenizeInString(stream);
            }
            if (stream.advanceIfString2('\"')) {
                this.quote = '\"';
                return this.tokenizeInString(stream);
            }
            var ch = stream.next();
            // These states can immediately transition to States.Value or Meta (without consuming ch), that's why they're handled above the switch stmt.
            switch (this.kind) {
                case States.ValuePostUrl:
                    if (ch === '(') {
                        return this.nextState(States.ValueInUrlFunction, { type: 'punctuation.parenthesis.css' });
                    }
                    this.kind = States.Value;
                    break;
                case States.MetaPostUrl:
                    if (ch === '(') {
                        return this.nextState(States.MetaInUrlFunction, { type: 'punctuation.parenthesis.css' });
                    }
                    this.kind = States.Meta;
                    break;
                case States.ValueInUrlFunction:
                case States.MetaInUrlFunction:
                    // This state is after 'url(' was encountered in the value
                    if (ch !== ')') {
                        stream.advanceIfRegExp2(/^[^\)]*/);
                        return { type: 'string.css' };
                    }
                    this.kind = (this.kind === States.ValueInUrlFunction) ? States.Value : States.Meta;
                    break;
            }
            switch (this.kind) {
                case States.Selector:
                    if (ch === '{') {
                        return this.nextState(States.Rule, { type: 'punctuation.bracket.css' });
                    }
                    if (ch === '(' || ch === ')') {
                        return { type: 'punctuation.parenthesis.css' };
                    }
                    if (ch === '@' && !this.inMeta) {
                        stream.advanceIfRegExp2(identRegEx);
                        return this.nextState(States.Meta, { type: cssTokenTypes.TOKEN_AT_KEYWORD + '.css' });
                    }
                    if (ch === '}' && this.inMeta) {
                        this.inMeta = false;
                        return this.nextState(States.Selector, { type: 'punctuation.bracket.css' });
                    }
                    if (/[\*\(\)\[\]\+>=\~\|;]/.test(ch)) {
                        return { type: 'punctuation.css' };
                    }
                    if (ch === '#') {
                        stream.advanceIfRegExp2(identRegEx);
                        return { type: cssTokenTypes.TOKEN_SELECTOR + '.id.css' };
                    }
                    if (ch === '.') {
                        stream.advanceIfRegExp2(identRegEx);
                        return { type: cssTokenTypes.TOKEN_SELECTOR + '.class.css' };
                    }
                    this.consumeIdent(stream);
                    return { type: cssTokenTypes.TOKEN_SELECTOR_TAG + '.css' };
                case States.Meta:
                    if (ch === '{') {
                        var nextState = States.Rule;
                        if (this.inMeta) {
                            nextState = States.Selector;
                        }
                        return this.nextState(nextState, { type: 'punctuation.bracket.css' });
                    }
                    if (ch === '(' || ch === ')') {
                        return { type: 'punctuation.parenthesis.css' };
                    }
                    if (ch === ';') {
                        if (this.metaBraceCount === 0) {
                            this.inMeta = false;
                        }
                        return this.nextState(States.Selector, { type: 'punctuation.css' });
                    }
                    if ((ch === 'u' || ch === 'U') && stream.advanceIfStringCaseInsensitive2('rl')) {
                        stream.advanceIfStringCaseInsensitive2('-prefix'); // support 'url-prefix' (part of @-mox-document)
                        return this.nextState(States.MetaPostUrl, { type: cssTokenTypes.TOKEN_VALUE + '.css' });
                    }
                    if (/[\*\(\)\[\]\+>=\~\|]/.test(ch)) {
                        return { type: 'punctuation.css' };
                    }
                    this.inMeta = true;
                    this.consumeIdent(stream);
                    return { type: cssTokenTypes.TOKEN_VALUE + '.css' };
                case States.Rule:
                    if (ch === '}') {
                        return this.nextState(States.Selector, { type: 'punctuation.bracket.css' });
                    }
                    if (ch === ':') {
                        return this.nextState(States.Value, { type: 'punctuation.css' });
                    }
                    if (ch === '(' || ch === ')') {
                        return { type: 'punctuation.parenthesis.css' };
                    }
                    this.consumeIdent(stream);
                    return { type: cssTokenTypes.TOKEN_PROPERTY + '.css' };
                case States.Value:
                    if (ch === '}') {
                        return this.nextState(States.Selector, { type: 'punctuation.bracket.css' });
                    }
                    if (ch === ';') {
                        return this.nextState(States.Rule, { type: 'punctuation.css' });
                    }
                    if ((ch === 'u' || ch === 'U') && stream.advanceIfStringCaseInsensitive2('rl')) {
                        return this.nextState(States.ValuePostUrl, { type: cssTokenTypes.TOKEN_VALUE + '.css' });
                    }
                    if (ch === '(' || ch === ')') {
                        return { type: 'punctuation.parenthesis.css' };
                    }
                    if (ch === ',') {
                        return { type: 'punctuation.css' };
                    }
                    if (ch === '#') {
                        stream.advanceIfRegExp2(/^[\w]*/);
                        return { type: cssTokenTypes.TOKEN_VALUE + '.hex.css' };
                    }
                    if (/\d/.test(ch) || (/-|\+/.test(ch) && !stream.eos() && /\d/.test(stream.peek()))) {
                        stream.advanceIfRegExp2(/^[\d\.]*/);
                        return this.nextState(States.Unit, { type: cssTokenTypes.TOKEN_VALUE + '.numeric.css' });
                    }
                    if (ch === '!') {
                        return { type: cssTokenTypes.TOKEN_VALUE + '.keyword.css' }; // !
                    }
                    if ((ch === 'i' || ch === 'I') && stream.advanceIfStringCaseInsensitive2('mportant')) {
                        return { type: cssTokenTypes.TOKEN_VALUE + '.keyword.css' }; // important
                    }
                    if (this.consumeIdent(stream)) {
                        return { type: cssTokenTypes.TOKEN_VALUE + '.css' };
                    }
                    break;
                case States.Unit:
                    // css units - see: http://www.w3.org/TR/css3-values/#font-relative-lengths
                    stream.goBack(1);
                    if (stream.advanceIfRegExp2(/^(em|ex|ch|rem|vw|vh|vm|cm|mm|in|px|pt|pc|deg|grad|rad|turn|s|ms|Hz|kHz|%)/)) {
                        return { type: cssTokenTypes.TOKEN_VALUE + '.unit.css' };
                    }
                    // no unit, back to value state
                    this.nextState(States.Value, null);
                    return this.tokenize(stream);
            }
            return { type: '' };
        };
        return State;
    }(abstractState_1.AbstractState));
    exports.State = State;
    var CSSMode = (function (_super) {
        __extends(CSSMode, _super);
        function CSSMode(descriptor, instantiationService, threadService) {
            var _this = this;
            _super.call(this, descriptor.id);
            this._modeWorkerManager = new abstractMode_1.ModeWorkerManager(descriptor, 'vs/languages/css/common/cssWorker', 'CSSWorker', null, instantiationService);
            this._threadService = threadService;
            this.tokenizationSupport = new tokenizationSupport_1.TokenizationSupport(this, {
                getInitialState: function () { return new State(_this, States.Selector, false, null, false, 0); }
            }, false, false);
            this.richEditSupport = new richEditSupport_1.RichEditSupport(this.getId(), null, {
                // TODO@Martin: This definition does not work with umlauts for example
                wordPattern: /(#?-?\d*\.\d\w*%?)|((::|[@#.!:])?[\w-?]+%?)|::|[@#.!:]/g,
                comments: {
                    blockComment: ['/*', '*/']
                },
                brackets: [
                    ['{', '}'],
                    ['[', ']'],
                    ['(', ')']
                ],
                __characterPairSupport: {
                    autoClosingPairs: [
                        { open: '{', close: '}' },
                        { open: '[', close: ']' },
                        { open: '(', close: ')' },
                        { open: '"', close: '"', notIn: ['string'] },
                        { open: '\'', close: '\'', notIn: ['string'] }
                    ]
                }
            });
            this.inplaceReplaceSupport = this;
            this.configSupport = this;
            this.occurrencesSupport = this;
            this.extraInfoSupport = this;
            this.referenceSupport = new referenceSupport_1.ReferenceSupport(this.getId(), {
                tokens: [cssTokenTypes.TOKEN_PROPERTY + '.css', cssTokenTypes.TOKEN_VALUE + '.css', cssTokenTypes.TOKEN_SELECTOR_TAG + '.css'],
                findReferences: function (resource, position, /*unused*/ includeDeclaration) { return _this.findReferences(resource, position); } });
            this.logicalSelectionSupport = this;
            this.outlineSupport = this;
            this.declarationSupport = new declarationSupport_1.DeclarationSupport(this.getId(), {
                tokens: [cssTokenTypes.TOKEN_VALUE + '.css'],
                findDeclaration: function (resource, position) { return _this.findDeclaration(resource, position); } });
            this.suggestSupport = new suggestSupport_1.SuggestSupport(this.getId(), {
                triggerCharacters: [' ', ':'],
                excludeTokens: ['comment.css', 'string.css'],
                suggest: function (resource, position) { return _this.suggest(resource, position); } });
            this.quickFixSupport = this;
        }
        CSSMode.prototype.creationDone = function () {
            if (this._threadService.isInMainThread) {
                // Pick a worker to do validation
                this._pickAWorkerToValidate();
            }
        };
        CSSMode.prototype._worker = function (runner) {
            return this._modeWorkerManager.worker(runner);
        };
        CSSMode.prototype.configure = function (options) {
            if (this._threadService.isInMainThread) {
                return this._configureWorkers(options);
            }
            else {
                return this._worker(function (w) { return w._doConfigure(options); });
            }
        };
        CSSMode.prototype._configureWorkers = function (options) {
            return this._worker(function (w) { return w._doConfigure(options); });
        };
        CSSMode.prototype.navigateValueSet = function (resource, position, up) {
            return this._worker(function (w) { return w.navigateValueSet(resource, position, up); });
        };
        CSSMode.prototype._pickAWorkerToValidate = function () {
            return this._worker(function (w) { return w.enableValidator(); });
        };
        CSSMode.prototype.findOccurrences = function (resource, position, strict) {
            if (strict === void 0) { strict = false; }
            return this._worker(function (w) { return w.findOccurrences(resource, position, strict); });
        };
        CSSMode.prototype.suggest = function (resource, position) {
            return this._worker(function (w) { return w.suggest(resource, position); });
        };
        CSSMode.prototype.findDeclaration = function (resource, position) {
            return this._worker(function (w) { return w.findDeclaration(resource, position); });
        };
        CSSMode.prototype.computeInfo = function (resource, position) {
            return this._worker(function (w) { return w.computeInfo(resource, position); });
        };
        CSSMode.prototype.findReferences = function (resource, position) {
            return this._worker(function (w) { return w.findReferences(resource, position); });
        };
        CSSMode.prototype.getRangesToPosition = function (resource, position) {
            return this._worker(function (w) { return w.getRangesToPosition(resource, position); });
        };
        CSSMode.prototype.getOutline = function (resource) {
            return this._worker(function (w) { return w.getOutline(resource); });
        };
        CSSMode.prototype.findColorDeclarations = function (resource) {
            return this._worker(function (w) { return w.findColorDeclarations(resource); });
        };
        CSSMode.prototype.getQuickFixes = function (resource, marker) {
            return this._worker(function (w) { return w.getQuickFixes(resource, marker); });
        };
        CSSMode.prototype.runQuickFixAction = function (resource, range, id) {
            return this._worker(function (w) { return w.runQuickFixAction(resource, range, id); });
        };
        CSSMode.$_configureWorkers = threadService_1.AllWorkersAttr(CSSMode, CSSMode.prototype._configureWorkers);
        CSSMode.$navigateValueSet = threadService_1.OneWorkerAttr(CSSMode, CSSMode.prototype.navigateValueSet);
        CSSMode.$_pickAWorkerToValidate = threadService_1.OneWorkerAttr(CSSMode, CSSMode.prototype._pickAWorkerToValidate, thread_1.ThreadAffinity.Group1);
        CSSMode.$findOccurrences = threadService_1.OneWorkerAttr(CSSMode, CSSMode.prototype.findOccurrences);
        CSSMode.$suggest = threadService_1.OneWorkerAttr(CSSMode, CSSMode.prototype.suggest);
        CSSMode.$findDeclaration = threadService_1.OneWorkerAttr(CSSMode, CSSMode.prototype.findDeclaration);
        CSSMode.$computeInfo = threadService_1.OneWorkerAttr(CSSMode, CSSMode.prototype.computeInfo);
        CSSMode.$findReferences = threadService_1.OneWorkerAttr(CSSMode, CSSMode.prototype.findReferences);
        CSSMode.$getRangesToPosition = threadService_1.OneWorkerAttr(CSSMode, CSSMode.prototype.getRangesToPosition);
        CSSMode.$getOutline = threadService_1.OneWorkerAttr(CSSMode, CSSMode.prototype.getOutline);
        CSSMode.$findColorDeclarations = threadService_1.OneWorkerAttr(CSSMode, CSSMode.prototype.findColorDeclarations);
        CSSMode.getQuickFixes = threadService_1.OneWorkerAttr(CSSMode, CSSMode.prototype.getQuickFixes);
        CSSMode.runQuickFixAction = threadService_1.OneWorkerAttr(CSSMode, CSSMode.prototype.runQuickFixAction);
        CSSMode = __decorate([
            __param(1, instantiation_1.IInstantiationService),
            __param(2, thread_1.IThreadService)
        ], CSSMode);
        return CSSMode;
    }(abstractMode_1.AbstractMode));
    exports.CSSMode = CSSMode;
});
//# sourceMappingURL=css.js.map