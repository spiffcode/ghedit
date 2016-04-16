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
define(["require", "exports", 'vs/editor/common/modes', 'vs/languages/html/common/html', 'vs/languages/razor/common/csharpTokenization', 'vs/editor/common/modes/abstractMode', 'vs/languages/razor/common/razorTokenTypes', 'vs/platform/instantiation/common/instantiation', 'vs/editor/common/services/modeService', 'vs/editor/common/modes/supports/richEditSupport', 'vs/platform/thread/common/thread'], function (require, exports, Modes, htmlMode, csharpTokenization, abstractMode_1, razorTokenTypes, instantiation_1, modeService_1, richEditSupport_1, thread_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    // for a brief description of the razor syntax see http://www.mikesdotnetting.com/Article/153/Inline-Razor-Syntax-Overview
    var RAZORState = (function (_super) {
        __extends(RAZORState, _super);
        function RAZORState(mode, kind, lastTagName, lastAttributeName, embeddedContentType, attributeValueQuote, attributeValue) {
            _super.call(this, mode, kind, lastTagName, lastAttributeName, embeddedContentType, attributeValueQuote, attributeValue);
        }
        RAZORState.prototype.makeClone = function () {
            return new RAZORState(this.getMode(), this.kind, this.lastTagName, this.lastAttributeName, this.embeddedContentType, this.attributeValueQuote, this.attributeValue);
        };
        RAZORState.prototype.equals = function (other) {
            if (other instanceof RAZORState) {
                return (_super.prototype.equals.call(this, other));
            }
            return false;
        };
        RAZORState.prototype.tokenize = function (stream) {
            if (!stream.eos() && stream.peek() === '@') {
                stream.next();
                if (!stream.eos() && stream.peek() === '*') {
                    return { nextState: new csharpTokenization.CSComment(this.getMode(), this, '@') };
                }
                if (stream.eos() || stream.peek() !== '@') {
                    return { type: razorTokenTypes.EMBED_CS, nextState: new csharpTokenization.CSStatement(this.getMode(), this, 0, 0, true, true, true, false) };
                }
            }
            return _super.prototype.tokenize.call(this, stream);
        };
        return RAZORState;
    }(htmlMode.State));
    var RAZORMode = (function (_super) {
        __extends(RAZORMode, _super);
        function RAZORMode(descriptor, instantiationService, modeService, threadService) {
            _super.call(this, descriptor, instantiationService, modeService, threadService);
            this.formattingSupport = null;
        }
        RAZORMode.prototype._createModeWorkerManager = function (descriptor, instantiationService) {
            return new abstractMode_1.ModeWorkerManager(descriptor, 'vs/languages/razor/common/razorWorker', 'RAZORWorker', 'vs/languages/html/common/htmlWorker', instantiationService);
        };
        RAZORMode.prototype._createRichEditSupport = function () {
            return new richEditSupport_1.RichEditSupport(this.getId(), null, {
                wordPattern: abstractMode_1.createWordRegExp('#?%'),
                comments: {
                    blockComment: ['<!--', '-->']
                },
                brackets: [
                    ['<!--', '-->'],
                    ['{', '}'],
                    ['(', ')']
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
                        beforeText: new RegExp("<(?!(?:" + htmlMode.EMPTY_ELEMENTS.join('|') + "))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$", 'i'),
                        afterText: /^<\/(\w[\w\d]*)\s*>$/i,
                        action: { indentAction: Modes.IndentAction.IndentOutdent }
                    },
                    {
                        beforeText: new RegExp("<(?!(?:" + htmlMode.EMPTY_ELEMENTS.join('|') + "))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$", 'i'),
                        action: { indentAction: Modes.IndentAction.Indent }
                    }
                ],
            });
        };
        RAZORMode.prototype.getInitialState = function () {
            return new RAZORState(this, htmlMode.States.Content, '', '', '', '', '');
        };
        RAZORMode.prototype.getLeavingNestedModeData = function (line, state) {
            var leavingNestedModeData = _super.prototype.getLeavingNestedModeData.call(this, line, state);
            if (leavingNestedModeData) {
                leavingNestedModeData.stateAfterNestedMode = new RAZORState(this, htmlMode.States.Content, '', '', '', '', '');
            }
            return leavingNestedModeData;
        };
        RAZORMode = __decorate([
            __param(1, instantiation_1.IInstantiationService),
            __param(2, modeService_1.IModeService),
            __param(3, thread_1.IThreadService)
        ], RAZORMode);
        return RAZORMode;
    }(htmlMode.HTMLMode));
    exports.RAZORMode = RAZORMode;
});
//# sourceMappingURL=razor.js.map