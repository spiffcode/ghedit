define(["require", "exports", 'vs/nls!vs/languages/sass/common/parser/sassErrors'], function (require, exports, nls) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var SassIssueType = (function () {
        function SassIssueType(id, message) {
            this.id = id;
            this.message = message;
        }
        return SassIssueType;
    }());
    exports.SassIssueType = SassIssueType;
    exports.ParseError = {
        FromExpected: new SassIssueType('sass-fromexpected', nls.localize(0, null)),
        ThroughOrToExpected: new SassIssueType('sass-throughexpected', nls.localize(1, null)),
        InExpected: new SassIssueType('sass-fromexpected', nls.localize(2, null)),
    };
});
//# sourceMappingURL=sassErrors.js.map