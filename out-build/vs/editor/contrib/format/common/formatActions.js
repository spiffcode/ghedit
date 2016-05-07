var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls!vs/editor/contrib/format/common/formatActions', 'vs/base/common/arrays', 'vs/base/common/keyCodes', 'vs/base/common/lifecycle', 'vs/base/common/winjs.base', 'vs/editor/common/editorAction', 'vs/editor/common/editorActionEnablement', 'vs/editor/common/editorCommon', 'vs/editor/common/editorCommonExtensions', 'vs/editor/common/modes', '../common/format', './formatCommand'], function (require, exports, nls, arrays, keyCodes_1, lifecycle_1, winjs_base_1, editorAction_1, editorActionEnablement_1, editorCommon, editorCommonExtensions_1, modes_1, format_1, formatCommand_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var FormatOnType = (function () {
        function FormatOnType(editor) {
            var _this = this;
            this.editor = editor;
            this.callOnDispose = [];
            this.callOnModel = [];
            this.callOnDispose.push(editor.addListener2(editorCommon.EventType.ConfigurationChanged, function () { return _this.update(); }));
            this.callOnDispose.push(editor.addListener2(editorCommon.EventType.ModelChanged, function () { return _this.update(); }));
            this.callOnDispose.push(editor.addListener2(editorCommon.EventType.ModelModeChanged, function () { return _this.update(); }));
            this.callOnDispose.push(editor.addListener2(editorCommon.EventType.ModelModeSupportChanged, function (e) {
                if (e.formattingSupport) {
                    _this.update();
                }
            }));
            this.callOnDispose.push(modes_1.FormatOnTypeRegistry.onDidChange(this.update, this));
        }
        FormatOnType.prototype.update = function () {
            var _this = this;
            // clean up
            this.callOnModel = lifecycle_1.cAll(this.callOnModel);
            // we are disabled
            if (!this.editor.getConfiguration().formatOnType) {
                return;
            }
            // no model
            if (!this.editor.getModel()) {
                return;
            }
            var model = this.editor.getModel();
            // no support
            var support = modes_1.FormatOnTypeRegistry.ordered(model)[0];
            if (!support || !support.autoFormatTriggerCharacters) {
                return;
            }
            // register typing listeners that will trigger the format
            support.autoFormatTriggerCharacters.forEach(function (ch) {
                _this.callOnModel.push(_this.editor.addTypingListener(ch, _this.trigger.bind(_this, ch)));
            });
        };
        FormatOnType.prototype.trigger = function (ch) {
            var _this = this;
            if (this.editor.getSelections().length > 1) {
                return;
            }
            var model = this.editor.getModel(), position = this.editor.getPosition(), canceled = false;
            // install a listener that checks if edits happens before the
            // position on which we format right now. Iff so, we won't
            // apply the format edits
            var unbind = this.editor.addListener(editorCommon.EventType.ModelContentChanged, function (e) {
                if (e.changeType === editorCommon.EventType.ModelContentChangedFlush) {
                    // a model.setValue() was called
                    canceled = true;
                }
                else if (e.changeType === editorCommon.EventType.ModelContentChangedLineChanged) {
                    var changedLine = e.lineNumber;
                    canceled = changedLine <= position.lineNumber;
                }
                else if (e.changeType === editorCommon.EventType.ModelContentChangedLinesInserted) {
                    var insertLine = e.fromLineNumber;
                    canceled = insertLine <= position.lineNumber;
                }
                else if (e.changeType === editorCommon.EventType.ModelContentChangedLinesDeleted) {
                    var deleteLine2 = e.toLineNumber;
                    canceled = deleteLine2 <= position.lineNumber;
                }
                if (canceled) {
                    // cancel only once
                    unbind();
                }
            });
            var modelOpts = model.getOptions();
            format_1.formatAfterKeystroke(model, position, ch, {
                tabSize: modelOpts.tabSize,
                insertSpaces: modelOpts.insertSpaces
            }).then(function (edits) {
                unbind();
                if (canceled || arrays.isFalsyOrEmpty(edits)) {
                    return;
                }
                _this.editor.executeCommand(_this.getId(), new formatCommand_1.EditOperationsCommand(edits, _this.editor.getSelection()));
            }, function (err) {
                unbind();
                throw err;
            });
        };
        FormatOnType.prototype.getId = function () {
            return FormatOnType.ID;
        };
        FormatOnType.prototype.dispose = function () {
            this.callOnDispose = lifecycle_1.dispose(this.callOnDispose);
            while (this.callOnModel.length > 0) {
                this.callOnModel.pop()();
            }
        };
        FormatOnType.ID = 'editor.contrib.autoFormat';
        return FormatOnType;
    }());
    var FormatAction = (function (_super) {
        __extends(FormatAction, _super);
        function FormatAction(descriptor, editor) {
            var _this = this;
            _super.call(this, descriptor, editor, editorActionEnablement_1.Behaviour.WidgetFocus | editorActionEnablement_1.Behaviour.Writeable | editorActionEnablement_1.Behaviour.UpdateOnModelChange | editorActionEnablement_1.Behaviour.ShowInContextMenu);
            this._disposable = modes_1.FormatRegistry.onDidChange(function () { return _this.resetEnablementState(); });
        }
        FormatAction.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this._disposable.dispose();
        };
        FormatAction.prototype.getGroupId = function () {
            return '2_change/2_format';
        };
        FormatAction.prototype.isSupported = function () {
            return modes_1.FormatRegistry.has(this.editor.getModel()) && _super.prototype.isSupported.call(this);
        };
        FormatAction.prototype.run = function () {
            var _this = this;
            var model = this.editor.getModel(), editorSelection = this.editor.getSelection(), modelOpts = model.getOptions(), options = {
                tabSize: modelOpts.tabSize,
                insertSpaces: modelOpts.insertSpaces,
            };
            var formattingPromise;
            if (editorSelection.isEmpty()) {
                formattingPromise = format_1.formatDocument(model, options);
            }
            else {
                formattingPromise = format_1.formatRange(model, editorSelection, options);
            }
            if (!formattingPromise) {
                return winjs_base_1.TPromise.as(false);
            }
            // Capture the state of the editor
            var state = this.editor.captureState(editorCommon.CodeEditorStateFlag.Value, editorCommon.CodeEditorStateFlag.Position);
            // Receive formatted value from worker
            return formattingPromise.then(function (result) {
                if (!state.validate(_this.editor)) {
                    return false;
                }
                if (!result || result.length === 0) {
                    return false;
                }
                _this.apply(_this.editor, editorSelection, result);
                _this.editor.focus();
                return true;
            });
        };
        FormatAction.prototype.apply = function (editor, editorSelection, value) {
            var state = null;
            if (editorSelection.isEmpty()) {
                state = editor.saveViewState();
            }
            var command = new formatCommand_1.EditOperationsCommand(value, editorSelection);
            editor.executeCommand(this.id, command);
            if (state) {
                editor.restoreViewState(state);
            }
        };
        FormatAction.ID = 'editor.action.format';
        return FormatAction;
    }(editorAction_1.EditorAction));
    exports.FormatAction = FormatAction;
    // register action
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(FormatAction, FormatAction.ID, nls.localize(0, null), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.Shift | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.KEY_F,
        linux: { primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.KEY_I }
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorContribution(FormatOnType);
});
//# sourceMappingURL=formatActions.js.map