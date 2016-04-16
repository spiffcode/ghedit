var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/async', 'vs/base/common/errors', 'vs/base/common/eventEmitter', 'vs/base/common/lifecycle', 'vs/editor/common/editorCommon', 'vs/editor/common/modes', '../common/parameterHints'], function (require, exports, async_1, errors_1, eventEmitter_1, lifecycle_1, editorCommon_1, modes_1, parameterHints_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ParameterHintsModel = (function (_super) {
        __extends(ParameterHintsModel, _super);
        function ParameterHintsModel(editor) {
            var _this = this;
            _super.call(this, ['cancel', 'hint', 'destroy']);
            this.editor = editor;
            this.toDispose = [];
            this.triggerCharactersListeners = [];
            this.throttledDelayer = new async_1.ThrottledDelayer(ParameterHintsModel.DELAY);
            this.active = false;
            this.prevResult = null;
            this.event(this.editor, editorCommon_1.EventType.ModelChanged, function (e) { return _this.onModelChanged(); });
            this.event(this.editor, editorCommon_1.EventType.ModelModeChanged, function (encodeURI) { return _this.onModelChanged(); });
            this.event(this.editor, editorCommon_1.EventType.ModelModeSupportChanged, function (e) { return _this.onModeChanged(e); });
            this.event(this.editor, editorCommon_1.EventType.CursorSelectionChanged, function (e) { return _this.onCursorChange(e); });
            this.toDispose.push(modes_1.ParameterHintsRegistry.onDidChange(this.onModelChanged, this));
            this.onModelChanged();
        }
        ParameterHintsModel.prototype.cancel = function (silent, refresh) {
            if (silent === void 0) { silent = false; }
            if (refresh === void 0) { refresh = false; }
            this.active = false;
            if (!refresh) {
                this.prevResult = null;
            }
            this.throttledDelayer.cancel();
            if (!silent) {
                this.emit('cancel');
            }
        };
        ParameterHintsModel.prototype.trigger = function (triggerCharacter, delay) {
            var _this = this;
            if (delay === void 0) { delay = ParameterHintsModel.DELAY; }
            if (!modes_1.ParameterHintsRegistry.has(this.editor.getModel())) {
                return;
            }
            this.cancel(true, true);
            return this.throttledDelayer.trigger(function () { return _this.doTrigger(triggerCharacter); }, delay);
        };
        ParameterHintsModel.prototype.doTrigger = function (triggerCharacter) {
            var _this = this;
            return parameterHints_1.getParameterHints(this.editor.getModel(), this.editor.getPosition(), triggerCharacter)
                .then(null, errors_1.onUnexpectedError)
                .then(function (result) {
                if (!result || result.signatures.length === 0) {
                    _this.cancel();
                    _this.emit('cancel');
                    return false;
                }
                _this.active = true;
                _this.prevResult = result;
                var event = { hints: result };
                _this.emit('hint', event);
                return true;
            });
        };
        ParameterHintsModel.prototype.isTriggered = function () {
            return this.active || this.throttledDelayer.isTriggered();
        };
        ParameterHintsModel.prototype.onModelChanged = function () {
            var _this = this;
            this.triggerCharactersListeners = lifecycle_1.dispose(this.triggerCharactersListeners);
            var model = this.editor.getModel();
            if (!model) {
                return;
            }
            var support = modes_1.ParameterHintsRegistry.ordered(model)[0];
            if (!support) {
                return;
            }
            this.triggerCharactersListeners = support.getParameterHintsTriggerCharacters().map(function (ch) {
                var listener = _this.editor.addTypingListener(ch, function () {
                    var position = _this.editor.getPosition();
                    var lineContext = model.getLineContext(position.lineNumber);
                    if (!support.shouldTriggerParameterHints(lineContext, position.column - 1)) {
                        return;
                    }
                    _this.trigger(ch);
                });
                return { dispose: listener };
            });
        };
        ParameterHintsModel.prototype.onModeChanged = function (e) {
            if (e.parameterHintsSupport) {
                this.onModelChanged();
            }
        };
        ParameterHintsModel.prototype.onCursorChange = function (e) {
            if (e.source === 'mouse') {
                this.cancel();
            }
            else if (this.isTriggered()) {
                this.trigger();
            }
        };
        ParameterHintsModel.prototype.event = function (emitter, eventType, cb) {
            this.toDispose.push(emitter.addListener2(eventType, cb));
        };
        ParameterHintsModel.prototype.dispose = function () {
            this.cancel(true);
            this.triggerCharactersListeners = lifecycle_1.dispose(this.triggerCharactersListeners);
            this.toDispose = lifecycle_1.dispose(this.toDispose);
            this.emit('destroy', null);
            _super.prototype.dispose.call(this);
        };
        ParameterHintsModel.DELAY = 120; // ms
        return ParameterHintsModel;
    }(eventEmitter_1.EventEmitter));
    exports.ParameterHintsModel = ParameterHintsModel;
});
//# sourceMappingURL=parameterHintsModel.js.map