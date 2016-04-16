define(["require", "exports", 'vs/platform/instantiation/common/instantiation'], function (require, exports, instantiation_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    exports.IMarkerService = instantiation_1.createDecorator('markerService');
    (function (MarkerType) {
        MarkerType[MarkerType["transient"] = 1] = "transient";
        MarkerType[MarkerType["permanent"] = 2] = "permanent";
    })(exports.MarkerType || (exports.MarkerType = {}));
    var MarkerType = exports.MarkerType;
});
