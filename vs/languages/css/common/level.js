define(["require", "exports"], function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    (function (Level) {
        Level[Level["Ignore"] = 1] = "Ignore";
        Level[Level["Warning"] = 2] = "Warning";
        Level[Level["Error"] = 4] = "Error";
    })(exports.Level || (exports.Level = {}));
    var Level = exports.Level;
    function toLevel(level) {
        switch (level) {
            case 'ignore': return Level.Ignore;
            case 'warning': return Level.Warning;
            case 'error': return Level.Error;
        }
        return null;
    }
    exports.toLevel = toLevel;
});
//# sourceMappingURL=level.js.map