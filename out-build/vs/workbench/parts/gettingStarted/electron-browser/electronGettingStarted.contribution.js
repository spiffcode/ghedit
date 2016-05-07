define(["require", "exports", 'vs/platform/platform', 'vs/workbench/parts/gettingStarted/electron-browser/electronGettingStarted', 'vs/workbench/common/contributions'], function (require, exports, platform_1, electronGettingStarted_1, contributions_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(electronGettingStarted_1.ElectronGettingStarted);
});
//# sourceMappingURL=electronGettingStarted.contribution.js.map