define(["require", "exports", 'vs/platform/instantiation/common/instantiation'], function (require, exports, instantiation_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    exports.ID = 'searchService';
    exports.ISearchService = instantiation_1.createDecorator(exports.ID);
    (function (QueryType) {
        QueryType[QueryType["File"] = 1] = "File";
        QueryType[QueryType["Text"] = 2] = "Text";
    })(exports.QueryType || (exports.QueryType = {}));
    var QueryType = exports.QueryType;
    // ---- very simple implementation of the search model --------------------
    var FileMatch = (function () {
        function FileMatch(resource) {
            this.resource = resource;
            this.lineMatches = [];
            // empty
        }
        return FileMatch;
    }());
    exports.FileMatch = FileMatch;
    var LineMatch = (function () {
        function LineMatch(preview, lineNumber, offsetAndLengths) {
            this.preview = preview;
            this.lineNumber = lineNumber;
            this.offsetAndLengths = offsetAndLengths;
            // empty
        }
        return LineMatch;
    }());
    exports.LineMatch = LineMatch;
});
//# sourceMappingURL=search.js.map