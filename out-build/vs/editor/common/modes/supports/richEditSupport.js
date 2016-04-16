define(["require", "exports", 'vs/editor/common/modes/nullMode', 'vs/editor/common/modes/supports/characterPair', 'vs/editor/common/modes/supports/electricCharacter', 'vs/editor/common/modes/supports/onEnter', 'vs/editor/common/modes/supports/richEditBrackets'], function (require, exports, nullMode_1, characterPair_1, electricCharacter_1, onEnter_1, richEditBrackets_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var RichEditSupport = (function () {
        function RichEditSupport(modeId, previous, rawConf) {
            var prev = null;
            if (previous instanceof RichEditSupport) {
                prev = previous._conf;
            }
            this._conf = RichEditSupport._mergeConf(prev, rawConf);
            if (this._conf.brackets) {
                this.brackets = new richEditBrackets_1.RichEditBrackets(modeId, this._conf.brackets);
            }
            this._handleOnEnter(modeId, this._conf);
            this._handleComments(modeId, this._conf);
            if (this._conf.__characterPairSupport) {
                this.characterPair = new characterPair_1.CharacterPairSupport(modeId, this._conf.__characterPairSupport);
            }
            if (this._conf.__electricCharacterSupport || this._conf.brackets) {
                this.electricCharacter = new electricCharacter_1.BracketElectricCharacterSupport(modeId, this.brackets, this._conf.__electricCharacterSupport);
            }
            this.wordDefinition = this._conf.wordPattern || nullMode_1.NullMode.DEFAULT_WORD_REGEXP;
        }
        RichEditSupport._mergeConf = function (prev, current) {
            return {
                comments: (prev ? current.comments || prev.comments : current.comments),
                brackets: (prev ? current.brackets || prev.brackets : current.brackets),
                wordPattern: (prev ? current.wordPattern || prev.wordPattern : current.wordPattern),
                indentationRules: (prev ? current.indentationRules || prev.indentationRules : current.indentationRules),
                onEnterRules: (prev ? current.onEnterRules || prev.onEnterRules : current.onEnterRules),
                __electricCharacterSupport: (prev ? current.__electricCharacterSupport || prev.__electricCharacterSupport : current.__electricCharacterSupport),
                __characterPairSupport: (prev ? current.__characterPairSupport || prev.__characterPairSupport : current.__characterPairSupport),
            };
        };
        RichEditSupport.prototype._handleOnEnter = function (modeId, conf) {
            // on enter
            var onEnter = {};
            var empty = true;
            if (conf.brackets) {
                empty = false;
                onEnter.brackets = conf.brackets;
            }
            if (conf.indentationRules) {
                empty = false;
                onEnter.indentationRules = conf.indentationRules;
            }
            if (conf.onEnterRules) {
                empty = false;
                onEnter.regExpRules = conf.onEnterRules;
            }
            if (!empty) {
                this.onEnter = new onEnter_1.OnEnterSupport(modeId, onEnter);
            }
        };
        RichEditSupport.prototype._handleComments = function (modeId, conf) {
            var commentRule = conf.comments;
            // comment configuration
            if (commentRule) {
                this.comments = {};
                if (commentRule.lineComment) {
                    this.comments.lineCommentToken = commentRule.lineComment;
                }
                if (commentRule.blockComment) {
                    var _a = commentRule.blockComment, blockStart = _a[0], blockEnd = _a[1];
                    this.comments.blockCommentStartToken = blockStart;
                    this.comments.blockCommentEndToken = blockEnd;
                }
            }
        };
        return RichEditSupport;
    }());
    exports.RichEditSupport = RichEditSupport;
});
