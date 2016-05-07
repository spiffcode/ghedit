/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/workbench/parts/extensions/common/extensions', 'vs/base/common/winjs.base', 'semver'], function (require, exports, extensions_1, winjs_base_1, semver) {
    'use strict';
    function getExtensionId(extension) {
        return extension.publisher + "." + extension.name;
    }
    exports.getExtensionId = getExtensionId;
    function extensionEquals(one, other) {
        return one.publisher === other.publisher && one.name === other.name;
    }
    exports.extensionEquals = extensionEquals;
    function getTelemetryData(extension) {
        return {
            id: getExtensionId(extension),
            name: extension.name,
            galleryId: extension.galleryInformation ? extension.galleryInformation.id : null,
            publisherId: extension.galleryInformation ? extension.galleryInformation.publisherId : null,
            publisherName: extension.publisher,
            publisherDisplayName: extension.galleryInformation ? extension.galleryInformation.publisherDisplayName : null
        };
    }
    exports.getTelemetryData = getTelemetryData;
    function getOutdatedExtensions(accessor) {
        var extensionsService = accessor.get(extensions_1.IExtensionsService);
        var galleryService = accessor.get(extensions_1.IGalleryService);
        if (!galleryService.isEnabled()) {
            return winjs_base_1.TPromise.as([]);
        }
        return extensionsService.getInstalled().then(function (installed) {
            var ids = installed.map(getExtensionId);
            return galleryService.query({ ids: ids, pageSize: 1000 }).then(function (result) {
                var available = result.firstPage;
                return available.filter(function (extension) {
                    var local = installed.filter(function (local) { return extensionEquals(local, extension); })[0];
                    return local && semver.lt(local.version, extension.version);
                });
            });
        });
    }
    exports.getOutdatedExtensions = getOutdatedExtensions;
});
//# sourceMappingURL=extensionsUtil.js.map