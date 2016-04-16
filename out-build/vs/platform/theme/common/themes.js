define(["require", "exports"], function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function isLightTheme(themeId) {
        return /vs($| )/.test(themeId);
    }
    exports.isLightTheme = isLightTheme;
    function getSyntaxThemeId(themeId) {
        return themeId.split(' ')[1];
    }
    exports.getSyntaxThemeId = getSyntaxThemeId;
    function getBaseThemeId(themeId) {
        return themeId.split(' ')[0];
    }
    exports.getBaseThemeId = getBaseThemeId;
});
//# sourceMappingURL=themes.js.map