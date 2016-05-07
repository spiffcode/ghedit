/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    'use strict';
    function toString(range) {
        return (range ? range.startLineNumber + '/' + range.endLineNumber : 'null') + (range.isCollapsed ? ' (collapsed)' : '') + ' - ' + range.indent;
    }
    exports.toString = toString;
});
//# sourceMappingURL=foldingRange.js.map