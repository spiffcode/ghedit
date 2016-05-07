var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/severity', 'vs/platform/extensions/common/abstractExtensionService'], function (require, exports, severity_1, abstractExtensionService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var MockExtensionService = (function (_super) {
        __extends(MockExtensionService, _super);
        function MockExtensionService() {
            _super.call(this, true);
        }
        MockExtensionService.prototype._showMessage = function (severity, msg) {
            switch (severity) {
                case severity_1.default.Error:
                    console.error(msg);
                    break;
                case severity_1.default.Warning:
                    console.warn(msg);
                    break;
                case severity_1.default.Info:
                    console.info(msg);
                    break;
                default:
                    console.log(msg);
            }
        };
        MockExtensionService.prototype._createFailedExtension = function () {
            throw new Error('not implemented');
        };
        MockExtensionService.prototype._actualActivateExtension = function (extensionDescription) {
            throw new Error('not implemented');
        };
        return MockExtensionService;
    }(abstractExtensionService_1.AbstractExtensionService));
    exports.MockExtensionService = MockExtensionService;
});
//# sourceMappingURL=mockExtensionService.js.map