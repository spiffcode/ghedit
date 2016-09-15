define(["require","exports"],function(e,t){/*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
"use strict";function n(e){return/vs($| )/.test(e)}function r(e){return/vs-dark($| )/.test(e)}function i(e){return e.split(" ")[1]}function s(e){return e.split(" ")[0]}t.isLightTheme=n,t.isDarkTheme=r,t.getSyntaxThemeId=i,t.getBaseThemeId=s});