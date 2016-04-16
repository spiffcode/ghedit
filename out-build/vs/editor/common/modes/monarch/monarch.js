var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/editor/common/modes/abstractMode', 'vs/editor/common/modes/monarch/monarchDefinition', 'vs/editor/common/modes/monarch/monarchLexer', 'vs/editor/common/modes/supports/richEditSupport'], function (require, exports, abstractMode_1, monarchDefinition_1, monarchLexer_1, richEditSupport_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /**
     * The MonarchMode creates a Monaco language mode given a certain language description
     */
    var MonarchMode = (function (_super) {
        __extends(MonarchMode, _super);
        function MonarchMode(modeId, lexer, modeService, modelService, editorWorkerService) {
            _super.call(this, modeId);
            this.tokenizationSupport = monarchLexer_1.createTokenizationSupport(modeService, this, lexer);
            this.richEditSupport = new richEditSupport_1.RichEditSupport(this.getId(), null, monarchDefinition_1.createRichEditSupport(lexer));
            this.suggestSupport = monarchDefinition_1.createSuggestSupport(modelService, editorWorkerService, this.getId(), lexer);
        }
        return MonarchMode;
    }(abstractMode_1.AbstractMode));
    exports.MonarchMode = MonarchMode;
});
//# sourceMappingURL=monarch.js.map