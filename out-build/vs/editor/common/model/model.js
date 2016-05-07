var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/uri', 'vs/editor/common/editorCommon', 'vs/editor/common/model/editableTextModel', 'vs/editor/common/model/textModel'], function (require, exports, uri_1, editorCommon_1, editableTextModel_1, textModel_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    // The hierarchy is:
    // Model -> EditableTextModel -> TextModelWithDecorations -> TextModelWithTrackedRanges -> TextModelWithMarkers -> TextModelWithTokens -> TextModel
    var MODEL_ID = 0;
    var aliveModels = {};
    // var LAST_CNT = 0;
    // setInterval(() => {
    // 	var cnt = Object.keys(aliveModels).length;
    // 	if (cnt === LAST_CNT) {
    // 		return;
    // 	}
    // 	console.warn('ALIVE MODELS:');
    // 	console.log(Object.keys(aliveModels).join('\n'));
    // 	LAST_CNT = cnt;
    // }, 100);
    var Model = (function (_super) {
        __extends(Model, _super);
        /**
         * Instantiates a new model
         * @param rawText
         *   The raw text buffer. It may start with a UTF-16 BOM, which can be
         *   optionally preserved when doing a getValue call. The lines may be
         *   separated by different EOL combinations, such as \n or \r\n. These
         *   can also be preserved when doing a getValue call.
         * @param mode
         *   The language service name this model is bound to.
         * @param associatedResource
         *   The resource associated with this model. If the value is not provided an
         *   unique in memory URL is constructed as the associated resource.
         */
        function Model(rawText, options, modeOrPromise, associatedResource) {
            if (associatedResource === void 0) { associatedResource = null; }
            _super.call(this, [
                editorCommon_1.EventType.ModelDispose
            ], textModel_1.TextModel.toRawText(rawText, options), modeOrPromise);
            // Generate a new unique model id
            MODEL_ID++;
            this.id = '$model' + MODEL_ID;
            if (typeof associatedResource === 'undefined' || associatedResource === null) {
                this._associatedResource = uri_1.default.parse('inmemory://model/' + MODEL_ID);
            }
            else {
                this._associatedResource = associatedResource;
            }
            if (aliveModels[String(this._associatedResource)]) {
                throw new Error('Cannot instantiate a second Model with the same URI!');
            }
            this._attachedEditorCount = 0;
            aliveModels[String(this._associatedResource)] = true;
            // console.log('ALIVE MODELS: ' + Object.keys(aliveModels).join('\n'));
        }
        Model.prototype.getModeId = function () {
            return this.getMode().getId();
        };
        Model.prototype.destroy = function () {
            this.dispose();
        };
        Model.prototype.dispose = function () {
            this._isDisposing = true;
            delete aliveModels[String(this._associatedResource)];
            this.emit(editorCommon_1.EventType.ModelDispose);
            _super.prototype.dispose.call(this);
            this._isDisposing = false;
            // console.log('ALIVE MODELS: ' + Object.keys(aliveModels).join('\n'));
        };
        Model.prototype.onBeforeAttached = function () {
            this._attachedEditorCount++;
            // Warm up tokens for the editor
            this._warmUpTokens();
        };
        Model.prototype.onBeforeDetached = function () {
            this._attachedEditorCount--;
            // Intentional empty (for now)
        };
        Model.prototype.isAttachedToEditor = function () {
            return this._attachedEditorCount > 0;
        };
        Model.prototype.getAssociatedResource = function () {
            return this._associatedResource;
        };
        Model.DEFAULT_CREATION_OPTIONS = textModel_1.TextModel.DEFAULT_CREATION_OPTIONS;
        return Model;
    }(editableTextModel_1.EditableTextModel));
    exports.Model = Model;
});
//# sourceMappingURL=model.js.map