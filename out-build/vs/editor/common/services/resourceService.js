define(["require", "exports", 'vs/platform/instantiation/common/instantiation'], function (require, exports, instantiation_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    // Resource Service
    exports.ResourceEvents = {
        ADDED: 'resource.added',
        REMOVED: 'resource.removed',
        CHANGED: 'resource.changed'
    };
    exports.IResourceService = instantiation_1.createDecorator('resourceService');
});
//# sourceMappingURL=resourceService.js.map