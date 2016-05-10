define(["require", "exports", 'vs/platform/instantiation/common/instantiation'], function (require, exports, instantiation_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    exports.ILifecycleService = instantiation_1.createDecorator('lifecycleService');
    exports.NullLifecycleService = {
        serviceId: null,
        onWillShutdown: function () { return ({ dispose: function () { } }); },
        onShutdown: function () { return ({ dispose: function () { } }); }
    };
});
//# sourceMappingURL=lifecycle.js.map