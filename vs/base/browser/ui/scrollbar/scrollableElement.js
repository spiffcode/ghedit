define(["require", "exports"], function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    (function (Visibility) {
        Visibility[Visibility["Auto"] = 0] = "Auto";
        Visibility[Visibility["Hidden"] = 1] = "Hidden";
        Visibility[Visibility["Visible"] = 2] = "Visible";
    })(exports.Visibility || (exports.Visibility = {}));
    var Visibility = exports.Visibility;
    function visibilityFromString(visibility) {
        switch (visibility) {
            case 'hidden':
                return Visibility.Hidden;
            case 'visible':
                return Visibility.Visible;
            default:
                return Visibility.Auto;
        }
    }
    exports.visibilityFromString = visibilityFromString;
});
//# sourceMappingURL=scrollableElement.js.map