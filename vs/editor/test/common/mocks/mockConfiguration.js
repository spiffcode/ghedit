var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/editor/common/config/commonEditorConfig'], function (require, exports, commonEditorConfig_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var MockConfiguration = (function (_super) {
        __extends(MockConfiguration, _super);
        function MockConfiguration(opts) {
            _super.call(this, opts);
        }
        MockConfiguration.prototype._getEditorClassName = function (theme, fontLigatures) {
            return '';
        };
        MockConfiguration.prototype.getOuterWidth = function () {
            return 100;
        };
        MockConfiguration.prototype.getOuterHeight = function () {
            return 100;
        };
        MockConfiguration.prototype.readConfiguration = function (editorClassName, fontFamily, fontSize, lineHeight) {
            // Doesn't really matter
            return {
                typicalHalfwidthCharacterWidth: 10,
                typicalFullwidthCharacterWidth: 20,
                spaceWidth: 10,
                maxDigitWidth: 10,
                lineHeight: 20,
                font: 'mockFont',
                fontSize: 20
            };
        };
        return MockConfiguration;
    }(commonEditorConfig_1.CommonEditorConfiguration));
    exports.MockConfiguration = MockConfiguration;
});
//# sourceMappingURL=mockConfiguration.js.map