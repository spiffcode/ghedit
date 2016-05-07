define(["require", "exports", 'vs/platform/platform', 'vs/base/common/flags', 'vs/workbench/browser/parts/statusbar/statusbar', 'vs/workbench/parts/feedback/electron-browser/feedbackStatusbarItem'], function (require, exports, platform_1, Flags, statusbar_1, feedbackStatusbarItem_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    // Register Statusbar item
    if (Flags.enableSendASmile) {
        platform_1.Registry.as(statusbar_1.Extensions.Statusbar).registerStatusbarItem(new statusbar_1.StatusbarItemDescriptor(feedbackStatusbarItem_1.FeedbackStatusbarItem, statusbar_1.StatusbarAlignment.RIGHT, -100 /* Low Priority */));
    }
});
//# sourceMappingURL=feedback.contribution.js.map