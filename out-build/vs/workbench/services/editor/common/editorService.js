define(["require", "exports", 'vs/platform/instantiation/common/instantiation'], function (require, exports, instantiation_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    (function (EditorArrangement) {
        EditorArrangement[EditorArrangement["MINIMIZE_OTHERS"] = 0] = "MINIMIZE_OTHERS";
        EditorArrangement[EditorArrangement["EVEN_WIDTH"] = 1] = "EVEN_WIDTH";
    })(exports.EditorArrangement || (exports.EditorArrangement = {}));
    var EditorArrangement = exports.EditorArrangement;
    exports.IWorkbenchEditorService = instantiation_1.createDecorator('editorService');
});
