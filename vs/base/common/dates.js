/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/nls!vs/base/common/dates'], function (require, exports, nls) {
    "use strict";
    function since(date) {
        var seconds = (new Date().getTime() - date.getTime()) / 1000;
        if (seconds < 60) {
            return nls.localize(0, null);
        }
        var minutes = seconds / 60;
        if (minutes < 60) {
            return Math.floor(minutes) === 1 ? nls.localize(1, null) : nls.localize(2, null, Math.floor(minutes));
        }
        var hours = minutes / 60;
        if (hours < 24) {
            return Math.floor(hours) === 1 ? nls.localize(3, null) : nls.localize(4, null, Math.floor(hours));
        }
        var days = hours / 24;
        if (Math.floor(days) === 1) {
            return nls.localize(5, null);
        }
        if (days > 6 && days < 8) {
            return nls.localize(6, null);
        }
        if (days > 30 && days < 40) {
            return nls.localize(7, null);
        }
        return nls.localize(8, null, Math.floor(days));
    }
    exports.since = since;
});
//# sourceMappingURL=dates.js.map