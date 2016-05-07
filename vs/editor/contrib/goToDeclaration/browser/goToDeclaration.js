/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/nls!vs/editor/contrib/goToDeclaration/browser/goToDeclaration', 'vs/base/common/arrays', 'vs/base/common/async', 'vs/base/common/errors', 'vs/base/common/keyCodes', 'vs/base/common/platform', 'vs/base/common/severity', 'vs/base/common/strings', 'vs/base/common/winjs.base', 'vs/base/browser/browser', 'vs/platform/editor/common/editor', 'vs/platform/message/common/message', 'vs/platform/request/common/request', 'vs/editor/common/core/range', 'vs/editor/common/editorAction', 'vs/editor/common/editorActionEnablement', 'vs/editor/common/editorCommon', 'vs/editor/common/editorCommonExtensions', 'vs/editor/common/modes', 'vs/editor/common/modes/textToHtmlTokenizer', 'vs/editor/browser/editorBrowserExtensions', 'vs/editor/contrib/goToDeclaration/common/goToDeclaration', 'vs/editor/contrib/referenceSearch/browser/referenceSearch', 'vs/css!./goToDeclaration'], function (require, exports, nls, arrays_1, async_1, errors_1, keyCodes_1, platform, severity_1, strings, winjs_base_1, browser, editor_1, message_1, request_1, range_1, editorAction_1, editorActionEnablement_1, editorCommon, editorCommonExtensions_1, modes_1, textToHtmlTokenizer_1, editorBrowserExtensions_1, goToDeclaration_1, referenceSearch_1) {
    'use strict';
    var DEFAULT_BEHAVIOR = editorActionEnablement_1.Behaviour.WidgetFocus | editorActionEnablement_1.Behaviour.ShowInContextMenu | editorActionEnablement_1.Behaviour.UpdateOnCursorPositionChange;
    function metaTitle(references) {
        if (references.length > 1) {
            return nls.localize(0, null, references.length);
        }
    }
    var GoToTypeAction = (function (_super) {
        __extends(GoToTypeAction, _super);
        function GoToTypeAction(descriptor, editor, _messageService, _editorService, condition) {
            if (condition === void 0) { condition = DEFAULT_BEHAVIOR; }
            _super.call(this, descriptor, editor, condition);
            this._messageService = _messageService;
            this._editorService = _editorService;
        }
        GoToTypeAction.prototype.run = function () {
            var _this = this;
            var model = this.editor.getModel();
            var position = this.editor.getPosition();
            var promise = this._resolve(model.getAssociatedResource(), { lineNumber: position.lineNumber, column: position.column });
            return promise.then(function (references) {
                // remove falsy entries
                references = arrays_1.coalesce(references);
                if (!references || references.length === 0) {
                    return;
                }
                // only use the start position
                references = references.map(function (reference) {
                    return {
                        resource: reference.resource,
                        range: range_1.Range.collapseToStart(reference.range)
                    };
                });
                // open and reveal
                if (references.length === 1 && !_this._showSingleReferenceInPeek()) {
                    return _this._editorService.openEditor({
                        resource: references[0].resource,
                        options: { selection: references[0].range }
                    }, _this.openToTheSide);
                }
                else {
                    var controller = referenceSearch_1.FindReferencesController.getController(_this.editor);
                    return controller.processRequest(_this.editor.getSelection(), winjs_base_1.TPromise.as(references), metaTitle);
                }
            }, function (err) {
                // report an error
                _this._messageService.show(severity_1.default.Error, err);
                return false;
            });
        };
        Object.defineProperty(GoToTypeAction.prototype, "openToTheSide", {
            get: function () {
                return false;
            },
            enumerable: true,
            configurable: true
        });
        GoToTypeAction.prototype._showSingleReferenceInPeek = function () {
            return false;
        };
        return GoToTypeAction;
    }(editorAction_1.EditorAction));
    exports.GoToTypeAction = GoToTypeAction;
    var GoToTypeDeclarationActions = (function (_super) {
        __extends(GoToTypeDeclarationActions, _super);
        function GoToTypeDeclarationActions(descriptor, editor, messageService, editorService) {
            _super.call(this, descriptor, editor, messageService, editorService);
        }
        GoToTypeDeclarationActions.prototype.getGroupId = function () {
            return '1_goto/3_visitTypeDefinition';
        };
        GoToTypeDeclarationActions.prototype.isSupported = function () {
            return !!this.editor.getModel().getMode().typeDeclarationSupport && _super.prototype.isSupported.call(this);
        };
        GoToTypeDeclarationActions.prototype.getEnablementState = function () {
            if (!_super.prototype.getEnablementState.call(this)) {
                return false;
            }
            var model = this.editor.getModel(), position = this.editor.getSelection().getStartPosition();
            return model.getMode().typeDeclarationSupport.canFindTypeDeclaration(model.getLineContext(position.lineNumber), position.column - 1);
        };
        GoToTypeDeclarationActions.prototype._resolve = function (resource, position) {
            var typeDeclarationSupport = this.editor.getModel().getMode().typeDeclarationSupport;
            if (typeDeclarationSupport) {
                return typeDeclarationSupport.findTypeDeclaration(resource, position).then(function (value) { return [value]; });
            }
        };
        GoToTypeDeclarationActions.ID = 'editor.action.goToTypeDeclaration';
        GoToTypeDeclarationActions = __decorate([
            __param(2, message_1.IMessageService),
            __param(3, editor_1.IEditorService)
        ], GoToTypeDeclarationActions);
        return GoToTypeDeclarationActions;
    }(GoToTypeAction));
    exports.GoToTypeDeclarationActions = GoToTypeDeclarationActions;
    var BaseGoToDeclarationAction = (function (_super) {
        __extends(BaseGoToDeclarationAction, _super);
        function BaseGoToDeclarationAction(descriptor, editor, messageService, editorService, condition) {
            _super.call(this, descriptor, editor, messageService, editorService, condition);
        }
        BaseGoToDeclarationAction.prototype.getGroupId = function () {
            return '1_goto/2_visitDefinition';
        };
        BaseGoToDeclarationAction.prototype.isSupported = function () {
            return modes_1.DeclarationRegistry.has(this.editor.getModel()) && _super.prototype.isSupported.call(this);
        };
        BaseGoToDeclarationAction.prototype.getEnablementState = function () {
            if (!_super.prototype.getEnablementState.call(this)) {
                return false;
            }
            var model = this.editor.getModel(), position = this.editor.getSelection().getStartPosition();
            return modes_1.DeclarationRegistry.all(model).some(function (provider) {
                return provider.canFindDeclaration(model.getLineContext(position.lineNumber), position.column - 1);
            });
        };
        BaseGoToDeclarationAction.prototype._resolve = function (resource, position) {
            return goToDeclaration_1.getDeclarationsAtPosition(this.editor.getModel(), this.editor.getPosition());
        };
        return BaseGoToDeclarationAction;
    }(GoToTypeAction));
    exports.BaseGoToDeclarationAction = BaseGoToDeclarationAction;
    var GoToDeclarationAction = (function (_super) {
        __extends(GoToDeclarationAction, _super);
        function GoToDeclarationAction(descriptor, editor, messageService, editorService) {
            _super.call(this, descriptor, editor, messageService, editorService, DEFAULT_BEHAVIOR);
        }
        GoToDeclarationAction.ID = 'editor.action.goToDeclaration';
        GoToDeclarationAction = __decorate([
            __param(2, message_1.IMessageService),
            __param(3, editor_1.IEditorService)
        ], GoToDeclarationAction);
        return GoToDeclarationAction;
    }(BaseGoToDeclarationAction));
    exports.GoToDeclarationAction = GoToDeclarationAction;
    var OpenDeclarationToTheSideAction = (function (_super) {
        __extends(OpenDeclarationToTheSideAction, _super);
        function OpenDeclarationToTheSideAction(descriptor, editor, messageService, editorService) {
            _super.call(this, descriptor, editor, messageService, editorService, editorActionEnablement_1.Behaviour.WidgetFocus | editorActionEnablement_1.Behaviour.UpdateOnCursorPositionChange);
        }
        Object.defineProperty(OpenDeclarationToTheSideAction.prototype, "openToTheSide", {
            get: function () {
                return true;
            },
            enumerable: true,
            configurable: true
        });
        OpenDeclarationToTheSideAction.ID = 'editor.action.openDeclarationToTheSide';
        OpenDeclarationToTheSideAction = __decorate([
            __param(2, message_1.IMessageService),
            __param(3, editor_1.IEditorService)
        ], OpenDeclarationToTheSideAction);
        return OpenDeclarationToTheSideAction;
    }(BaseGoToDeclarationAction));
    exports.OpenDeclarationToTheSideAction = OpenDeclarationToTheSideAction;
    var PreviewDeclarationAction = (function (_super) {
        __extends(PreviewDeclarationAction, _super);
        function PreviewDeclarationAction(descriptor, editor, messageService, editorService) {
            _super.call(this, descriptor, editor, messageService, editorService, DEFAULT_BEHAVIOR);
        }
        PreviewDeclarationAction.prototype._showSingleReferenceInPeek = function () {
            return true;
        };
        PreviewDeclarationAction.ID = 'editor.action.previewDeclaration';
        PreviewDeclarationAction = __decorate([
            __param(2, message_1.IMessageService),
            __param(3, editor_1.IEditorService)
        ], PreviewDeclarationAction);
        return PreviewDeclarationAction;
    }(BaseGoToDeclarationAction));
    exports.PreviewDeclarationAction = PreviewDeclarationAction;
    // --- Editor Contribution to goto definition using the mouse and a modifier key
    var GotoDefinitionWithMouseEditorContribution = (function () {
        function GotoDefinitionWithMouseEditorContribution(editor, requestService, messageService, editorService) {
            var _this = this;
            this.requestService = requestService;
            this.messageService = messageService;
            this.editorService = editorService;
            this.hasRequiredServices = !!this.messageService && !!this.requestService && !!this.editorService;
            this.toUnhook = [];
            this.decorations = [];
            this.editor = editor;
            this.throttler = new async_1.Throttler();
            this.toUnhook.push(this.editor.addListener(editorCommon.EventType.MouseDown, function (e) { return _this.onEditorMouseDown(e); }));
            this.toUnhook.push(this.editor.addListener(editorCommon.EventType.MouseUp, function (e) { return _this.onEditorMouseUp(e); }));
            this.toUnhook.push(this.editor.addListener(editorCommon.EventType.MouseMove, function (e) { return _this.onEditorMouseMove(e); }));
            this.toUnhook.push(this.editor.addListener(editorCommon.EventType.KeyDown, function (e) { return _this.onEditorKeyDown(e); }));
            this.toUnhook.push(this.editor.addListener(editorCommon.EventType.KeyUp, function (e) { return _this.onEditorKeyUp(e); }));
            this.toUnhook.push(this.editor.addListener(editorCommon.EventType.ModelChanged, function (e) { return _this.resetHandler(); }));
            this.toUnhook.push(this.editor.addListener('change', function (e) { return _this.resetHandler(); }));
            this.toUnhook.push(this.editor.addListener('scroll', function () { return _this.resetHandler(); }));
        }
        GotoDefinitionWithMouseEditorContribution.prototype.onEditorMouseMove = function (mouseEvent, withKey) {
            this.lastMouseMoveEvent = mouseEvent;
            this.startFindDefinition(mouseEvent, withKey);
        };
        GotoDefinitionWithMouseEditorContribution.prototype.startFindDefinition = function (mouseEvent, withKey) {
            var _this = this;
            if (!this.isEnabled(mouseEvent, withKey)) {
                this.currentWordUnderMouse = null;
                this.removeDecorations();
                return;
            }
            // Find word at mouse position
            var position = mouseEvent.target.position;
            var word = position ? this.editor.getModel().getWordAtPosition(position) : null;
            if (!word) {
                this.currentWordUnderMouse = null;
                this.removeDecorations();
                return;
            }
            // Return early if word at position is still the same
            if (this.currentWordUnderMouse && this.currentWordUnderMouse.startColumn === word.startColumn && this.currentWordUnderMouse.endColumn === word.endColumn && this.currentWordUnderMouse.word === word.word) {
                return;
            }
            this.currentWordUnderMouse = word;
            // Find definition and decorate word if found
            var state = this.editor.captureState(editorCommon.CodeEditorStateFlag.Position, editorCommon.CodeEditorStateFlag.Value, editorCommon.CodeEditorStateFlag.Selection, editorCommon.CodeEditorStateFlag.Scroll);
            this.throttler.queue(function () {
                return state.validate(_this.editor)
                    ? _this.findDefinition(mouseEvent.target)
                    : winjs_base_1.TPromise.as(null);
            }).then(function (results) {
                if (!results || !results.length || !state.validate(_this.editor)) {
                    _this.removeDecorations();
                    return;
                }
                // Multiple results
                if (results.length > 1) {
                    _this.addDecoration({
                        startLineNumber: position.lineNumber,
                        startColumn: word.startColumn,
                        endLineNumber: position.lineNumber,
                        endColumn: word.endColumn
                    }, nls.localize(1, null, results.length), false);
                }
                else {
                    var result_1 = results[0];
                    _this.editorService.resolveEditorModel({ resource: result_1.resource }).then(function (model) {
                        var source;
                        if (model && model.textEditorModel) {
                            var from = Math.max(1, result_1.range.startLineNumber), to = void 0, editorModel = void 0;
                            editorModel = model.textEditorModel;
                            // if we have a range, take that into consideration for the "to" position, otherwise fallback to MAX_SOURCE_PREVIEW_LINES
                            if (result_1.range.startLineNumber !== result_1.range.endLineNumber || result_1.range.startColumn !== result_1.range.endColumn) {
                                to = Math.min(result_1.range.endLineNumber, result_1.range.startLineNumber + GotoDefinitionWithMouseEditorContribution.MAX_SOURCE_PREVIEW_LINES, editorModel.getLineCount());
                            }
                            else {
                                to = Math.min(from + GotoDefinitionWithMouseEditorContribution.MAX_SOURCE_PREVIEW_LINES, editorModel.getLineCount());
                            }
                            source = editorModel.getValueInRange({
                                startLineNumber: from,
                                startColumn: 1,
                                endLineNumber: to,
                                endColumn: editorModel.getLineMaxColumn(to)
                            }).trim();
                            // remove common leading whitespace
                            var min = Number.MAX_VALUE, regexp = /^[ \t]*/, match = void 0, contents = void 0;
                            while (from <= to && min > 0) {
                                contents = editorModel.getLineContent(from++);
                                if (contents.trim().length === 0) {
                                    // empty or whitespace only
                                    continue;
                                }
                                match = regexp.exec(contents);
                                min = Math.min(min, match[0].length);
                            }
                            source = source.replace(new RegExp("^([ \\t]{" + min + "})", 'gm'), strings.empty);
                            if (result_1.range.endLineNumber - result_1.range.startLineNumber > GotoDefinitionWithMouseEditorContribution.MAX_SOURCE_PREVIEW_LINES) {
                                source += '\n\u2026';
                            }
                        }
                        _this.addDecoration({
                            startLineNumber: position.lineNumber,
                            startColumn: word.startColumn,
                            endLineNumber: position.lineNumber,
                            endColumn: word.endColumn
                        }, source, true);
                    });
                }
            }).done(undefined, errors_1.onUnexpectedError);
        };
        GotoDefinitionWithMouseEditorContribution.prototype.addDecoration = function (range, text, isCode) {
            var model = this.editor.getModel();
            if (!model) {
                return;
            }
            var htmlMessage = {
                tagName: 'div',
                className: 'goto-definition-link-hover',
                style: "tab-size: " + model.getOptions().tabSize
            };
            if (text && text.trim().length > 0) {
                // not whitespace only
                htmlMessage.children = [isCode ? textToHtmlTokenizer_1.tokenizeToHtmlContent(text, model.getMode()) : { tagName: 'span', text: text }];
            }
            var newDecorations = {
                range: range,
                options: {
                    inlineClassName: 'goto-definition-link',
                    htmlMessage: [htmlMessage]
                }
            };
            this.decorations = this.editor.deltaDecorations(this.decorations, [newDecorations]);
        };
        GotoDefinitionWithMouseEditorContribution.prototype.removeDecorations = function () {
            if (this.decorations.length > 0) {
                this.decorations = this.editor.deltaDecorations(this.decorations, []);
            }
        };
        GotoDefinitionWithMouseEditorContribution.prototype.onEditorKeyDown = function (e) {
            if (this.lastMouseMoveEvent && (e.keyCode === GotoDefinitionWithMouseEditorContribution.TRIGGER_KEY_VALUE ||
                e.keyCode === GotoDefinitionWithMouseEditorContribution.TRIGGER_SIDEBYSIDE_KEY_VALUE && e[GotoDefinitionWithMouseEditorContribution.TRIGGER_MODIFIER] // User pressed Ctrl/Cmd+Alt (goto definition to the side)
            )) {
                this.startFindDefinition(this.lastMouseMoveEvent, e);
            }
            else if (e[GotoDefinitionWithMouseEditorContribution.TRIGGER_MODIFIER]) {
                this.removeDecorations(); // remove decorations if user holds another key with ctrl/cmd to prevent accident goto declaration
            }
        };
        GotoDefinitionWithMouseEditorContribution.prototype.resetHandler = function () {
            this.lastMouseMoveEvent = null;
            this.removeDecorations();
        };
        GotoDefinitionWithMouseEditorContribution.prototype.onEditorMouseDown = function (mouseEvent) {
            // We need to record if we had the trigger key on mouse down because someone might select something in the editor
            // holding the mouse down and then while mouse is down start to press Ctrl/Cmd to start a copy operation and then
            // release the mouse button without wanting to do the navigation.
            // With this flag we prevent goto definition if the mouse was down before the trigger key was pressed.
            this.hasTriggerKeyOnMouseDown = !!mouseEvent.event[GotoDefinitionWithMouseEditorContribution.TRIGGER_MODIFIER];
        };
        GotoDefinitionWithMouseEditorContribution.prototype.onEditorMouseUp = function (mouseEvent) {
            var _this = this;
            if (this.isEnabled(mouseEvent) && this.hasTriggerKeyOnMouseDown) {
                this.gotoDefinition(mouseEvent.target, mouseEvent.event.altKey).done(function () {
                    _this.removeDecorations();
                }, function (error) {
                    _this.removeDecorations();
                    errors_1.onUnexpectedError(error);
                });
            }
        };
        GotoDefinitionWithMouseEditorContribution.prototype.onEditorKeyUp = function (e) {
            if (e.keyCode === GotoDefinitionWithMouseEditorContribution.TRIGGER_KEY_VALUE) {
                this.removeDecorations();
                this.currentWordUnderMouse = null;
            }
        };
        GotoDefinitionWithMouseEditorContribution.prototype.isEnabled = function (mouseEvent, withKey) {
            return this.hasRequiredServices &&
                this.editor.getModel() &&
                (browser.isIE11orEarlier || mouseEvent.event.detail <= 1) &&
                mouseEvent.target.type === editorCommon.MouseTargetType.CONTENT_TEXT &&
                (mouseEvent.event[GotoDefinitionWithMouseEditorContribution.TRIGGER_MODIFIER] || (withKey && withKey.keyCode === GotoDefinitionWithMouseEditorContribution.TRIGGER_KEY_VALUE)) &&
                modes_1.DeclarationRegistry.has(this.editor.getModel());
        };
        GotoDefinitionWithMouseEditorContribution.prototype.findDefinition = function (target) {
            var model = this.editor.getModel();
            if (!model) {
                return winjs_base_1.TPromise.as(null);
            }
            return goToDeclaration_1.getDeclarationsAtPosition(this.editor.getModel(), target.position);
        };
        GotoDefinitionWithMouseEditorContribution.prototype.gotoDefinition = function (target, sideBySide) {
            var _this = this;
            var state = this.editor.captureState(editorCommon.CodeEditorStateFlag.Position, editorCommon.CodeEditorStateFlag.Value, editorCommon.CodeEditorStateFlag.Selection, editorCommon.CodeEditorStateFlag.Scroll);
            return this.findDefinition(target).then(function (results) {
                if (!results || !results.length || !state.validate(_this.editor)) {
                    return;
                }
                var position = target.position;
                var word = _this.editor.getModel().getWordAtPosition(position);
                // Find valid target (and not the same position as the current hovered word)
                var validResults = results
                    .filter(function (result) { return result.range && !(word && result.range.startColumn === word.startColumn && result.range.startLineNumber === target.position.lineNumber); })
                    .map(function (result) {
                    return {
                        resource: result.resource,
                        range: range_1.Range.collapseToStart(result.range)
                    };
                });
                if (!validResults.length) {
                    return;
                }
                // Muli result: Show in references UI
                if (validResults.length > 1) {
                    var controller = referenceSearch_1.FindReferencesController.getController(_this.editor);
                    return controller.processRequest(_this.editor.getSelection(), winjs_base_1.TPromise.as(validResults), metaTitle);
                }
                // Single result: Open
                return _this.editorService.openEditor({
                    resource: validResults[0].resource,
                    options: {
                        selection: validResults[0].range
                    }
                }, sideBySide);
            });
        };
        GotoDefinitionWithMouseEditorContribution.prototype.getId = function () {
            return GotoDefinitionWithMouseEditorContribution.ID;
        };
        GotoDefinitionWithMouseEditorContribution.prototype.dispose = function () {
            while (this.toUnhook.length > 0) {
                this.toUnhook.pop()();
            }
        };
        GotoDefinitionWithMouseEditorContribution.ID = 'editor.contrib.gotodefinitionwithmouse';
        GotoDefinitionWithMouseEditorContribution.TRIGGER_MODIFIER = platform.isMacintosh ? 'metaKey' : 'ctrlKey';
        GotoDefinitionWithMouseEditorContribution.TRIGGER_SIDEBYSIDE_KEY_VALUE = keyCodes_1.KeyCode.Alt;
        GotoDefinitionWithMouseEditorContribution.TRIGGER_KEY_VALUE = platform.isMacintosh ? keyCodes_1.KeyCode.Meta : keyCodes_1.KeyCode.Ctrl;
        GotoDefinitionWithMouseEditorContribution.MAX_SOURCE_PREVIEW_LINES = 7;
        GotoDefinitionWithMouseEditorContribution = __decorate([
            __param(1, request_1.IRequestService),
            __param(2, message_1.IMessageService),
            __param(3, editor_1.IEditorService)
        ], GotoDefinitionWithMouseEditorContribution);
        return GotoDefinitionWithMouseEditorContribution;
    }());
    // register actions
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(PreviewDeclarationAction, PreviewDeclarationAction.ID, nls.localize(2, null), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.F12,
        linux: { primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.F10 },
    }));
    var goToDeclarationKb;
    if (platform.isWeb) {
        goToDeclarationKb = keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.F12;
    }
    else {
        goToDeclarationKb = keyCodes_1.KeyCode.F12;
    }
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(GoToDeclarationAction, GoToDeclarationAction.ID, nls.localize(3, null), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: goToDeclarationKb
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(OpenDeclarationToTheSideAction, OpenDeclarationToTheSideAction.ID, nls.localize(4, null), {
        context: editorCommonExtensions_1.ContextKey.EditorTextFocus,
        primary: keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K, goToDeclarationKb)
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(GoToTypeDeclarationActions, GoToTypeDeclarationActions.ID, nls.localize(5, null)));
    editorBrowserExtensions_1.EditorBrowserRegistry.registerEditorContribution(GotoDefinitionWithMouseEditorContribution);
});
//# sourceMappingURL=goToDeclaration.js.map