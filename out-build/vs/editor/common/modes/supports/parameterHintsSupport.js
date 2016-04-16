define(["require", "exports", 'vs/editor/common/modes/supports'], function (require, exports, supports_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ParameterHintsSupport = (function () {
        function ParameterHintsSupport(modeId, contribution) {
            this._modeId = modeId;
            this.contribution = contribution;
        }
        ParameterHintsSupport.prototype.getParameterHintsTriggerCharacters = function () {
            return this.contribution.triggerCharacters;
        };
        ParameterHintsSupport.prototype.shouldTriggerParameterHints = function (context, offset) {
            var _this = this;
            return supports_1.handleEvent(context, offset, function (nestedMode, context, offset) {
                if (_this._modeId === nestedMode.getId()) {
                    if (!Array.isArray(_this.contribution.excludeTokens)) {
                        return true;
                    }
                    if (_this.contribution.excludeTokens.length === 1 && _this.contribution.excludeTokens[0] === '*') {
                        return false;
                    }
                    return !supports_1.isLineToken(context, offset - 1, _this.contribution.excludeTokens);
                }
                else if (nestedMode.parameterHintsSupport) {
                    return nestedMode.parameterHintsSupport.shouldTriggerParameterHints(context, offset);
                }
                else {
                    return false;
                }
            });
        };
        ParameterHintsSupport.prototype.getParameterHints = function (resource, position) {
            return this.contribution.getParameterHints(resource, position);
        };
        return ParameterHintsSupport;
    }());
    exports.ParameterHintsSupport = ParameterHintsSupport;
});
//# sourceMappingURL=parameterHintsSupport.js.map