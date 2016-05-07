define(["require", "exports", 'vs/nls'], function (require, exports, nls) {
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
        FromExpected: new SassIssueType('sass-fromexpected', nls.localize('expected.from', "'from' expected")),
        ThroughOrToExpected: new SassIssueType('sass-throughexpected', nls.localize('expected.through', "'through' or 'to' expected")),
        InExpected: new SassIssueType('sass-fromexpected', nls.localize('expected.in', "'in' expected")),
    };
});
//# sourceMappingURL=sassErrors.js.map