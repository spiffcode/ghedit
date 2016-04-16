define(["require", "exports", 'vs/editor/common/modes/supports'], function (require, exports, supports_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var CharacterPairSupport = (function () {
        function CharacterPairSupport(modeId, contribution) {
            this._modeId = modeId;
            this._autoClosingPairs = contribution.autoClosingPairs;
            this._surroundingPairs = Array.isArray(contribution.surroundingPairs) ? contribution.surroundingPairs : contribution.autoClosingPairs;
        }
        CharacterPairSupport.prototype.getAutoClosingPairs = function () {
            return this._autoClosingPairs;
        };
        CharacterPairSupport.prototype.shouldAutoClosePair = function (character, context, offset) {
            var _this = this;
            return supports_1.handleEvent(context, offset, function (nestedMode, context, offset) {
                if (_this._modeId === nestedMode.getId()) {
                    // Always complete on empty line
                    if (context.getTokenCount() === 0) {
                        return true;
                    }
                    var tokenIndex = context.findIndexOfOffset(offset - 1);
                    var tokenType = context.getTokenType(tokenIndex);
                    for (var i = 0; i < _this._autoClosingPairs.length; ++i) {
                        if (_this._autoClosingPairs[i].open === character) {
                            if (_this._autoClosingPairs[i].notIn) {
                                for (var notInIndex = 0; notInIndex < _this._autoClosingPairs[i].notIn.length; ++notInIndex) {
                                    if (tokenType.indexOf(_this._autoClosingPairs[i].notIn[notInIndex]) > -1) {
                                        return false;
                                    }
                                }
                            }
                            break;
                        }
                    }
                    return true;
                }
                else if (nestedMode.richEditSupport && nestedMode.richEditSupport.characterPair) {
                    return nestedMode.richEditSupport.characterPair.shouldAutoClosePair(character, context, offset);
                }
                else {
                    return null;
                }
            });
        };
        CharacterPairSupport.prototype.getSurroundingPairs = function () {
            return this._surroundingPairs;
        };
        return CharacterPairSupport;
    }());
    exports.CharacterPairSupport = CharacterPairSupport;
});
