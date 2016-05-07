/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/platform/platform', 'vs/platform/instantiation/common/extensions', 'vs/workbench/browser/parts/statusbar/statusbar', 'vs/workbench/parts/extensions/electron-browser/extensionsWidgets', 'vs/workbench/parts/extensions/common/extensions', 'vs/workbench/parts/extensions/common/vsoGalleryService', 'vs/workbench/common/contributions', 'vs/workbench/parts/extensions/electron-browser/extensionsWorkbenchExtension', 'vs/workbench/parts/output/common/output', 'vs/css!./media/extensions'], function (require, exports, platform_1, extensions_1, statusbar_1, extensionsWidgets_1, extensions_2, vsoGalleryService_1, contributions_1, extensionsWorkbenchExtension_1, output_1) {
    "use strict";
    extensions_1.registerSingleton(extensions_2.IGalleryService, vsoGalleryService_1.GalleryService);
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(extensionsWorkbenchExtension_1.ExtensionsWorkbenchExtension);
    platform_1.Registry.as(statusbar_1.Extensions.Statusbar)
        .registerStatusbarItem(new statusbar_1.StatusbarItemDescriptor(extensionsWidgets_1.ExtensionsStatusbarItem, statusbar_1.StatusbarAlignment.LEFT, 10000));
    platform_1.Registry.as(output_1.Extensions.OutputChannels)
        .registerChannel(extensions_2.ExtensionsChannelId, extensions_2.ExtensionsLabel);
});
//# sourceMappingURL=extensions.contribution.js.map