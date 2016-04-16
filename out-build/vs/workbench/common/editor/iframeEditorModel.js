var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/workbench/common/editor'], function (require, exports, editor_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /**
     * An editor model that represents the resolved state for an iframe editor input. After the model has been
     * resolved it knows which content to pass to the iframe editor. The contents will be set directly into the
     * iframe. The contents have to ensure that e.g. a base URL is set so that relative links or images can be
     * resolved.
     */
    var IFrameEditorModel = (function (_super) {
        __extends(IFrameEditorModel, _super);
        function IFrameEditorModel(resource) {
            _super.call(this);
            this._resource = resource;
        }
        Object.defineProperty(IFrameEditorModel.prototype, "resource", {
            get: function () {
                return this._resource;
            },
            enumerable: true,
            configurable: true
        });
        IFrameEditorModel.prototype.setContents = function (head, body, tail) {
            this.head = head;
            this.body = body;
            this.tail = tail;
        };
        IFrameEditorModel.prototype.getContents = function () {
            return {
                head: this.head,
                body: this.body,
                tail: this.tail
            };
        };
        return IFrameEditorModel;
    }(editor_1.EditorModel));
    exports.IFrameEditorModel = IFrameEditorModel;
});
//# sourceMappingURL=iframeEditorModel.js.map