define(["require", "exports", 'vs/editor/common/modes/supports'], function (require, exports, supports_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ReferenceSupport = (function () {
        /**
         * Provide the token type postfixes for the tokens where a reference can be found in the 'tokens' argument.
         */
        function ReferenceSupport(modeId, contribution) {
            this._modeId = modeId;
            this.contribution = contribution;
        }
        ReferenceSupport.prototype.canFindReferences = function (context, offset) {
            var _this = this;
            return supports_1.handleEvent(context, offset, function (nestedMode, context, offset) {
                if (_this._modeId === nestedMode.getId()) {
                    return (!Array.isArray(_this.contribution.tokens) ||
                        _this.contribution.tokens.length < 1 ||
                        supports_1.isLineToken(context, offset, _this.contribution.tokens));
                }
                else if (nestedMode.referenceSupport) {
                    return nestedMode.referenceSupport.canFindReferences(context, offset);
                }
                else {
                    return false;
                }
            });
        };
        ReferenceSupport.prototype.findReferences = function (resource, position, includeDeclaration) {
            return this.contribution.findReferences(resource, position, includeDeclaration);
        };
        return ReferenceSupport;
    }());
    exports.ReferenceSupport = ReferenceSupport;
});
//# sourceMappingURL=referenceSupport.js.map