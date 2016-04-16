var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/event', 'vs/base/common/lifecycle'], function (require, exports, event_1, lifecycle_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var MockTextAreaWrapper = (function (_super) {
        __extends(MockTextAreaWrapper, _super);
        function MockTextAreaWrapper() {
            _super.call(this);
            this._onKeyDown = this._register(new event_1.Emitter());
            this.onKeyDown = this._onKeyDown.event;
            this._onKeyUp = this._register(new event_1.Emitter());
            this.onKeyUp = this._onKeyUp.event;
            this._onKeyPress = this._register(new event_1.Emitter());
            this.onKeyPress = this._onKeyPress.event;
            this._onCompositionStart = this._register(new event_1.Emitter());
            this.onCompositionStart = this._onCompositionStart.event;
            this._onCompositionEnd = this._register(new event_1.Emitter());
            this.onCompositionEnd = this._onCompositionEnd.event;
            this._onInput = this._register(new event_1.Emitter());
            this.onInput = this._onInput.event;
            this._onCut = this._register(new event_1.Emitter());
            this.onCut = this._onCut.event;
            this._onCopy = this._register(new event_1.Emitter());
            this.onCopy = this._onCopy.event;
            this._onPaste = this._register(new event_1.Emitter());
            this.onPaste = this._onPaste.event;
            this._value = '';
            this._selectionStart = 0;
            this._selectionEnd = 0;
            this._isInOverwriteMode = false;
        }
        MockTextAreaWrapper.prototype.getValue = function () {
            return this._value;
        };
        MockTextAreaWrapper.prototype.setValue = function (reason, value) {
            this._value = value;
            this._selectionStart = this._value.length;
            this._selectionEnd = this._value.length;
        };
        MockTextAreaWrapper.prototype.getSelectionStart = function () {
            return this._selectionStart;
        };
        MockTextAreaWrapper.prototype.getSelectionEnd = function () {
            return this._selectionEnd;
        };
        MockTextAreaWrapper.prototype.setSelectionRange = function (selectionStart, selectionEnd) {
            if (selectionStart < 0) {
                selectionStart = 0;
            }
            if (selectionStart > this._value.length) {
                selectionStart = this._value.length;
            }
            if (selectionEnd < 0) {
                selectionEnd = 0;
            }
            if (selectionEnd > this._value.length) {
                selectionEnd = this._value.length;
            }
            this._selectionStart = selectionStart;
            this._selectionEnd = selectionEnd;
        };
        MockTextAreaWrapper.prototype.isInOverwriteMode = function () {
            return this._isInOverwriteMode;
        };
        return MockTextAreaWrapper;
    }(lifecycle_1.Disposable));
    exports.MockTextAreaWrapper = MockTextAreaWrapper;
});
//# sourceMappingURL=mockTextAreaWrapper.js.map