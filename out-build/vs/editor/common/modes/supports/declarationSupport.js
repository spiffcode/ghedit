define(["require", "exports", 'vs/editor/common/modes/supports'], function (require, exports, supports_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var DeclarationSupport = (function () {
        /**
         * Provide the token type postfixes for the tokens where a declaration can be found in the 'tokens' argument.
         */
        function DeclarationSupport(modeId, contribution) {
            this._modeId = modeId;
            this.contribution = contribution;
        }
        DeclarationSupport.prototype.canFindDeclaration = function (context, offset) {
            var _this = this;
            return supports_1.handleEvent(context, offset, function (nestedMode, context, offset) {
                if (_this._modeId === nestedMode.getId()) {
                    return (!Array.isArray(_this.contribution.tokens) ||
                        _this.contribution.tokens.length < 1 ||
                        supports_1.isLineToken(context, offset, _this.contribution.tokens));
                }
                else if (nestedMode.declarationSupport) {
                    return nestedMode.declarationSupport.canFindDeclaration(context, offset);
                }
                else {
                    return false;
                }
            });
        };
        DeclarationSupport.prototype.findDeclaration = function (resource, position) {
            return this.contribution.findDeclaration(resource, position);
        };
        return DeclarationSupport;
    }());
    exports.DeclarationSupport = DeclarationSupport;
});
//# sourceMappingURL=declarationSupport.js.map