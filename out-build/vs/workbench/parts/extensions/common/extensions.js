/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/nls!vs/workbench/parts/extensions/common/extensions', 'vs/platform/instantiation/common/instantiation'], function (require, exports, nls, instantiation_1) {
    'use strict';
    exports.IExtensionsService = instantiation_1.createDecorator('extensionsService');
    exports.IGalleryService = instantiation_1.createDecorator('galleryService');
    exports.IExtensionTipsService = instantiation_1.createDecorator('extensionTipsService');
    exports.ExtensionsLabel = nls.localize(0, null);
    exports.ExtensionsChannelId = 'extensions';
});
//# sourceMappingURL=extensions.js.map