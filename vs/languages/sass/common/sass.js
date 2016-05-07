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
define(["require", "exports", 'vs/editor/common/modes/monarch/monarch', 'vs/editor/common/modes/monarch/monarchCompile', 'vs/languages/sass/common/sassTokenTypes', 'vs/editor/common/modes/abstractMode', 'vs/platform/thread/common/threadService', 'vs/editor/common/services/modeService', 'vs/platform/instantiation/common/instantiation', 'vs/platform/thread/common/thread', 'vs/editor/common/services/modelService', 'vs/editor/common/modes/supports/declarationSupport', 'vs/editor/common/modes/supports/referenceSupport', 'vs/editor/common/modes/supports/suggestSupport', 'vs/editor/common/services/editorWorkerService'], function (require, exports, Monarch, Compile, sassTokenTypes, abstractMode_1, threadService_1, modeService_1, instantiation_1, thread_1, modelService_1, declarationSupport_1, referenceSupport_1, suggestSupport_1, editorWorkerService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    exports.language = {
        displayName: 'Sass',
        name: 'sass',
        // TODO@Martin: This definition does not work with umlauts for example
        wordDefinition: /(#?-?\d*\.\d\w*%?)|([$@#!.:]?[\w-?]+%?)|[$@#!.]/g,
        defaultToken: '',
        lineComment: '//',
        blockCommentStart: '/*',
        blockCommentEnd: '*/',
        ws: '[ \t\n\r\f]*',
        identifier: '-?-?([a-zA-Z]|(\\\\(([0-9a-fA-F]{1,6}\\s?)|[^[0-9a-fA-F])))([\\w\\-]|(\\\\(([0-9a-fA-F]{1,6}\\s?)|[^[0-9a-fA-F])))*',
        brackets: [
            { open: '{', close: '}', token: 'punctuation.curly' },
            { open: '[', close: ']', token: 'punctuation.bracket' },
            { open: '(', close: ')', token: 'punctuation.parenthesis' },
            { open: '<', close: '>', token: 'punctuation.angle' }
        ],
        tokenizer: {
            root: [
                { include: '@selector' },
                ['[@](charset|namespace)', { token: sassTokenTypes.TOKEN_AT_KEYWORD, next: '@declarationbody' }],
                ['[@](function)', { token: sassTokenTypes.TOKEN_AT_KEYWORD, next: '@functiondeclaration' }],
                ['[@](mixin)', { token: sassTokenTypes.TOKEN_AT_KEYWORD, next: '@mixindeclaration' }],
            ],
            selector: [
                { include: '@comments' },
                { include: '@import' },
                { include: '@variabledeclaration' },
                { include: '@warndebug' },
                ['[@](include)', { token: sassTokenTypes.TOKEN_AT_KEYWORD, next: '@includedeclaration' }],
                ['[@](keyframes|-webkit-keyframes|-moz-keyframes|-o-keyframes)', { token: sassTokenTypes.TOKEN_AT_KEYWORD, next: '@keyframedeclaration' }],
                ['[@](page|content|font-face|-moz-document)', { token: sassTokenTypes.TOKEN_AT_KEYWORD }],
                ['url(\\-prefix)?\\(', { token: 'support.function.name', bracket: '@open', next: '@urldeclaration' }],
                { include: '@controlstatement' },
                { include: '@selectorname' },
                ['[&\\*]', sassTokenTypes.TOKEN_SELECTOR_TAG],
                ['[>\\+,]', 'punctuation'],
                ['\\[', { token: 'punctuation.bracket', bracket: '@open', next: '@selectorattribute' }],
                ['{', { token: 'punctuation.curly', bracket: '@open', next: '@selectorbody' }],
            ],
            selectorbody: [
                ['[*_]?@identifier@ws:(?=(\\s|\\d|[^{;}]*[;}]))', sassTokenTypes.TOKEN_PROPERTY, '@rulevalue'],
                { include: '@selector' },
                ['[@](extend)', { token: sassTokenTypes.TOKEN_AT_KEYWORD, next: '@extendbody' }],
                ['[@](return)', { token: sassTokenTypes.TOKEN_AT_KEYWORD, next: '@declarationbody' }],
                ['}', { token: 'punctuation.curly', bracket: '@close', next: '@pop' }],
            ],
            selectorname: [
                ['#{', { token: 'support.function.interpolation', bracket: '@open', next: '@variableinterpolation' }],
                ['(\\.|#(?=[^{])|%|(@identifier)|:)+', sassTokenTypes.TOKEN_SELECTOR],
            ],
            selectorattribute: [
                { include: '@term' },
                [']', { token: 'punctuation.bracket', bracket: '@close', next: '@pop' }],
            ],
            term: [
                { include: '@comments' },
                ['url(\\-prefix)?\\(', { token: 'support.function.name', bracket: '@open', next: '@urldeclaration' }],
                { include: '@functioninvocation' },
                { include: '@numbers' },
                { include: '@strings' },
                { include: '@variablereference' },
                ['(and\\b|or\\b|not\\b)', 'keyword.operator'],
                { include: '@name' },
                ['([<>=\\+\\-\\*\\/\\^\\|\\~,])', 'keyword.operator'],
                [',', 'punctuation'],
                ['!default', 'literal'],
                ['\\(', { token: 'punctuation.parenthesis', bracket: '@open', next: '@parenthizedterm' }],
            ],
            rulevalue: [
                { include: '@term' },
                ['!important', 'literal'],
                [';', 'punctuation', '@pop'],
                ['{', { token: 'punctuation.curly', bracket: '@open', switchTo: '@nestedproperty' }],
                ['(?=})', { token: '', next: '@pop' }],
            ],
            nestedproperty: [
                ['[*_]?@identifier@ws:', sassTokenTypes.TOKEN_PROPERTY, '@rulevalue'],
                { include: '@comments' },
                ['}', { token: 'punctuation.curly', bracket: '@close', next: '@pop' }],
            ],
            warndebug: [
                ['[@](warn|debug)', { token: sassTokenTypes.TOKEN_AT_KEYWORD, next: '@declarationbody' }],
            ],
            import: [
                ['[@](import)', { token: sassTokenTypes.TOKEN_AT_KEYWORD, next: '@declarationbody' }],
            ],
            variabledeclaration: [
                ['\\$@identifier@ws:', 'variable.decl', '@declarationbody'],
            ],
            urldeclaration: [
                { include: '@strings' },
                ['[^)\r\n]+', 'string'],
                ['\\)', { token: 'support.function.name', bracket: '@close', next: '@pop' }],
            ],
            parenthizedterm: [
                { include: '@term' },
                ['\\)', { token: 'punctuation.parenthesis', bracket: '@close', next: '@pop' }],
            ],
            declarationbody: [
                { include: '@term' },
                [';', 'punctuation', '@pop'],
                ['(?=})', { token: '', next: '@pop' }],
            ],
            extendbody: [
                { include: '@selectorname' },
                ['!optional', 'literal'],
                [';', 'punctuation', '@pop'],
                ['(?=})', { token: '', next: '@pop' }],
            ],
            variablereference: [
                ['\\$@identifier', 'variable.ref'],
                ['\\.\\.\\.', 'keyword.operator'],
                ['#{', { token: 'support.function.interpolation', bracket: '@open', next: '@variableinterpolation' }],
            ],
            variableinterpolation: [
                { include: '@variablereference' },
                ['}', { token: 'support.function.interpolation', bracket: '@close', next: '@pop' }],
            ],
            comments: [
                ['\\/\\*', 'comment', '@comment'],
                ['\\/\\/+.*', 'comment'],
            ],
            comment: [
                ['\\*\\/', 'comment', '@pop'],
                ['.', 'comment'],
            ],
            name: [
                ['@identifier', sassTokenTypes.TOKEN_VALUE],
            ],
            numbers: [
                ['(\\d*\\.)?\\d+([eE][\\-+]?\\d+)?', { token: 'constant.numeric', next: '@units' }],
                ['#[0-9a-fA-F_]+(?!\\w)', 'constant.rgb-value'],
            ],
            units: [
                ['(em|ex|ch|rem|vw|vh|vm|cm|mm|in|px|pt|pc|deg|grad|rad|turn|s|ms|Hz|kHz|%)?', 'constant.numeric', '@pop']
            ],
            functiondeclaration: [
                ['@identifier@ws\\(', { token: 'support.function.name', bracket: '@open', next: '@parameterdeclaration' }],
                ['{', { token: 'punctuation.curly', bracket: '@open', switchTo: '@functionbody' }],
            ],
            mixindeclaration: [
                // mixin with parameters
                ['@identifier@ws\\(', { token: 'support.function.name', bracket: '@open', next: '@parameterdeclaration' }],
                // mixin without parameters
                ['@identifier', 'support.function.name'],
                ['{', { token: 'punctuation.curly', bracket: '@open', switchTo: '@selectorbody' }],
            ],
            parameterdeclaration: [
                ['\\$@identifier@ws:', sassTokenTypes.TOKEN_PROPERTY],
                ['\\.\\.\\.', 'keyword.operator'],
                [',', 'punctuation'],
                { include: '@term' },
                ['\\)', { token: 'support.function.name', bracket: '@close', next: '@pop' }],
            ],
            includedeclaration: [
                { include: '@functioninvocation' },
                ['@identifier', 'support.function.name'],
                [';', 'punctuation', '@pop'],
                ['(?=})', { token: '', next: '@pop' }],
                ['{', { token: 'punctuation.curly', bracket: '@open', switchTo: '@selectorbody' }],
            ],
            keyframedeclaration: [
                ['@identifier', 'support.function.name'],
                ['{', { token: 'punctuation.curly', bracket: '@open', switchTo: '@keyframebody' }],
            ],
            keyframebody: [
                { include: '@term' },
                ['{', { token: 'punctuation.curly', bracket: '@open', next: '@selectorbody' }],
                ['}', { token: 'punctuation.curly', bracket: '@close', next: '@pop' }],
            ],
            controlstatement: [
                ['[@](if|else|for|while|each|media)', { token: 'keyword.flow.control.at-rule', next: '@controlstatementdeclaration' }],
            ],
            controlstatementdeclaration: [
                ['(in|from|through|if|to)\\b', { token: 'keyword.flow.control.at-rule' }],
                { include: '@term' },
                ['{', { token: 'punctuation.curly', bracket: '@open', switchTo: '@selectorbody' }],
            ],
            functionbody: [
                ['[@](return)', { token: sassTokenTypes.TOKEN_AT_KEYWORD }],
                { include: '@variabledeclaration' },
                { include: '@term' },
                { include: '@controlstatement' },
                [';', 'punctuation'],
                ['}', { token: 'punctuation.curly', bracket: '@close', next: '@pop' }],
            ],
            functioninvocation: [
                ['@identifier\\(', { token: 'support.function.name', bracket: '@open', next: '@functionarguments' }],
            ],
            functionarguments: [
                ['\\$@identifier@ws:', sassTokenTypes.TOKEN_PROPERTY],
                ['[,]', 'punctuation'],
                { include: '@term' },
                ['\\)', { token: 'support.function.name', bracket: '@close', next: '@pop' }],
            ],
            strings: [
                ['~?"', { token: 'string.punctuation', bracket: '@open', next: '@stringenddoublequote' }],
                ['~?\'', { token: 'string.punctuation', bracket: '@open', next: '@stringendquote' }]
            ],
            stringenddoublequote: [
                ['\\\\.', 'string'],
                ['"', { token: 'string.punctuation', next: '@pop', bracket: '@close' }],
                ['.', 'string']
            ],
            stringendquote: [
                ['\\\\.', 'string'],
                ['\'', { token: 'string.punctuation', next: '@pop', bracket: '@close' }],
                ['.', 'string']
            ]
        }
    };
    var SASSMode = (function (_super) {
        __extends(SASSMode, _super);
        function SASSMode(descriptor, instantiationService, threadService, modeService, modelService, editorWorkerService) {
            var _this = this;
            _super.call(this, descriptor.id, Compile.compile(exports.language), modeService, modelService, editorWorkerService);
            this._modeWorkerManager = new abstractMode_1.ModeWorkerManager(descriptor, 'vs/languages/sass/common/sassWorker', 'SassWorker', 'vs/languages/css/common/cssWorker', instantiationService);
            this._threadService = threadService;
            this.modeService = modeService;
            this.extraInfoSupport = this;
            this.inplaceReplaceSupport = this;
            this.configSupport = this;
            this.referenceSupport = new referenceSupport_1.ReferenceSupport(this.getId(), {
                tokens: [sassTokenTypes.TOKEN_PROPERTY + '.sass', sassTokenTypes.TOKEN_VALUE + '.sass', 'variable.decl.sass', 'variable.ref.sass', 'support.function.name.sass', sassTokenTypes.TOKEN_PROPERTY + '.sass', sassTokenTypes.TOKEN_SELECTOR + '.sass'],
                findReferences: function (resource, position, /*unused*/ includeDeclaration) { return _this.findReferences(resource, position); } });
            this.logicalSelectionSupport = this;
            this.declarationSupport = new declarationSupport_1.DeclarationSupport(this.getId(), {
                tokens: ['variable.decl.sass', 'variable.ref.sass', 'support.function.name.sass', sassTokenTypes.TOKEN_PROPERTY + '.sass', sassTokenTypes.TOKEN_SELECTOR + '.sass'],
                findDeclaration: function (resource, position) { return _this.findDeclaration(resource, position); } });
            this.outlineSupport = this;
            this.suggestSupport = new suggestSupport_1.SuggestSupport(this.getId(), {
                triggerCharacters: [],
                excludeTokens: ['comment.sass', 'string.sass'],
                suggest: function (resource, position) { return _this.suggest(resource, position); } });
        }
        SASSMode.prototype.creationDone = function () {
            if (this._threadService.isInMainThread) {
                // Pick a worker to do validation
                this._pickAWorkerToValidate();
            }
        };
        SASSMode.prototype._worker = function (runner) {
            return this._modeWorkerManager.worker(runner);
        };
        SASSMode.prototype.configure = function (options) {
            if (this._threadService.isInMainThread) {
                return this._configureWorkers(options);
            }
            else {
                return this._worker(function (w) { return w._doConfigure(options); });
            }
        };
        SASSMode.prototype._configureWorkers = function (options) {
            return this._worker(function (w) { return w._doConfigure(options); });
        };
        SASSMode.prototype.navigateValueSet = function (resource, position, up) {
            return this._worker(function (w) { return w.navigateValueSet(resource, position, up); });
        };
        SASSMode.prototype._pickAWorkerToValidate = function () {
            return this._worker(function (w) { return w.enableValidator(); });
        };
        SASSMode.prototype.findReferences = function (resource, position) {
            return this._worker(function (w) { return w.findReferences(resource, position); });
        };
        SASSMode.prototype.suggest = function (resource, position) {
            return this._worker(function (w) { return w.suggest(resource, position); });
        };
        SASSMode.prototype.getRangesToPosition = function (resource, position) {
            return this._worker(function (w) { return w.getRangesToPosition(resource, position); });
        };
        SASSMode.prototype.computeInfo = function (resource, position) {
            return this._worker(function (w) { return w.computeInfo(resource, position); });
        };
        SASSMode.prototype.getOutline = function (resource) {
            return this._worker(function (w) { return w.getOutline(resource); });
        };
        SASSMode.prototype.findDeclaration = function (resource, position) {
            return this._worker(function (w) { return w.findDeclaration(resource, position); });
        };
        SASSMode.prototype.findColorDeclarations = function (resource) {
            return this._worker(function (w) { return w.findColorDeclarations(resource); });
        };
        SASSMode.$_configureWorkers = threadService_1.AllWorkersAttr(SASSMode, SASSMode.prototype._configureWorkers);
        SASSMode.$navigateValueSet = threadService_1.OneWorkerAttr(SASSMode, SASSMode.prototype.navigateValueSet);
        SASSMode.$_pickAWorkerToValidate = threadService_1.OneWorkerAttr(SASSMode, SASSMode.prototype._pickAWorkerToValidate, thread_1.ThreadAffinity.Group1);
        SASSMode.$findReferences = threadService_1.OneWorkerAttr(SASSMode, SASSMode.prototype.findReferences);
        SASSMode.$suggest = threadService_1.OneWorkerAttr(SASSMode, SASSMode.prototype.suggest);
        SASSMode.$getRangesToPosition = threadService_1.OneWorkerAttr(SASSMode, SASSMode.prototype.getRangesToPosition);
        SASSMode.$computeInfo = threadService_1.OneWorkerAttr(SASSMode, SASSMode.prototype.computeInfo);
        SASSMode.$getOutline = threadService_1.OneWorkerAttr(SASSMode, SASSMode.prototype.getOutline);
        SASSMode.$findDeclaration = threadService_1.OneWorkerAttr(SASSMode, SASSMode.prototype.findDeclaration);
        SASSMode.$findColorDeclarations = threadService_1.OneWorkerAttr(SASSMode, SASSMode.prototype.findColorDeclarations);
        SASSMode = __decorate([
            __param(1, instantiation_1.IInstantiationService),
            __param(2, thread_1.IThreadService),
            __param(3, modeService_1.IModeService),
            __param(4, modelService_1.IModelService),
            __param(5, editorWorkerService_1.IEditorWorkerService)
        ], SASSMode);
        return SASSMode;
    }(Monarch.MonarchMode));
    exports.SASSMode = SASSMode;
});
//# sourceMappingURL=sass.js.map