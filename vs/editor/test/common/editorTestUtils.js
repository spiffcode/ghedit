define(["require", "exports", 'vs/editor/common/model/model'], function (require, exports, model_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function withEditorModel(text, callback) {
        var model = new model_1.Model(text.join('\n'), model_1.Model.DEFAULT_CREATION_OPTIONS, null);
        callback(model);
        model.dispose();
    }
    exports.withEditorModel = withEditorModel;
});
//# sourceMappingURL=editorTestUtils.js.map