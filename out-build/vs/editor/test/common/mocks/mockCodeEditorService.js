var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/editor/common/services/abstractCodeEditorService'], function (require, exports, abstractCodeEditorService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var MockCodeEditorService = (function (_super) {
        __extends(MockCodeEditorService, _super);
        function MockCodeEditorService() {
            _super.apply(this, arguments);
        }
        MockCodeEditorService.prototype.registerDecorationType = function (key, options) { };
        MockCodeEditorService.prototype.removeDecorationType = function (key) { };
        MockCodeEditorService.prototype.resolveDecorationType = function (key) { return null; };
        return MockCodeEditorService;
    }(abstractCodeEditorService_1.AbstractCodeEditorService));
    exports.MockCodeEditorService = MockCodeEditorService;
});
//# sourceMappingURL=mockCodeEditorService.js.map