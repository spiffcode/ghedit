define(["require", "exports"], function (require, exports) {
    "use strict";
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    function noop(value) {
        return value;
    }
    noop.Renderer = function () {
        // No-op
    };
    var mock = {
        marked: noop
    };
    return mock;
});
//# sourceMappingURL=marked.mock.js.map