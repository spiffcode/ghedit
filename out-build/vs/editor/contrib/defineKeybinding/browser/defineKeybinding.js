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
define(["require", "exports", 'vs/nls!vs/editor/contrib/defineKeybinding/browser/defineKeybinding', 'vs/base/common/async', 'vs/base/common/keyCodes', 'vs/base/common/lifecycle', 'vs/base/common/winjs.base', 'vs/base/browser/dom', 'vs/base/browser/htmlContentRenderer', 'vs/base/browser/keyboardEvent', 'vs/base/browser/styleMutator', 'vs/platform/keybinding/common/keybindingResolver', 'vs/platform/keybinding/common/keybindingService', 'vs/editor/common/core/range', 'vs/editor/common/editorAction', 'vs/editor/common/editorActionEnablement', 'vs/editor/common/editorCommon', 'vs/editor/common/editorCommonExtensions', 'vs/editor/browser/editorBrowser', 'vs/editor/browser/editorBrowserExtensions', 'vs/editor/contrib/snippet/common/snippet', 'vs/css!./defineKeybinding'], function (require, exports, nls, async_1, keyCodes_1, lifecycle_1, winjs_base_1, dom, htmlContentRenderer_1, keyboardEvent_1, styleMutator_1, keybindingResolver_1, keybindingService_1, range_1, editorAction_1, editorActionEnablement_1, editorCommon, editorCommonExtensions_1, editorBrowser_1, editorBrowserExtensions_1, snippet_1) {
    'use strict';
    var NLS_LAUNCH_MESSAGE = nls.localize(0, null);
    var NLS_DEFINE_MESSAGE = nls.localize(1, null);
    var NLS_DEFINE_ACTION_LABEL = nls.localize(2, null);
    var NLS_KB_LAYOUT_INFO_MESSAGE = nls.localize(3, null);
    var NLS_KB_LAYOUT_ERROR_MESSAGE = nls.localize(4, null);
    var INTERESTING_FILE = /keybindings\.json$/;
    var DefineKeybindingController = (function () {
        function DefineKeybindingController(editor, keybindingService) {
            var _this = this;
            this._dec = [];
            this._editor = editor;
            this._keybindingService = keybindingService;
            this._toDispose = [];
            this._launchWidget = new DefineKeybindingLauncherWidget(this._editor, keybindingService, function () { return _this.launch(); });
            this._defineWidget = new DefineKeybindingWidget(this._editor, keybindingService, function (keybinding) { return _this._onAccepted(keybinding); });
            this._toDispose.push(this._editor.addListener2(editorCommon.EventType.ConfigurationChanged, function (e) {
                if (isInterestingEditorModel(_this._editor)) {
                    _this._launchWidget.show();
                }
                else {
                    _this._launchWidget.hide();
                }
            }));
            this._toDispose.push(this._editor.addListener2(editorCommon.EventType.ModelChanged, function (e) {
                if (isInterestingEditorModel(_this._editor)) {
                    _this._launchWidget.show();
                }
                else {
                    _this._launchWidget.hide();
                }
                _this._onModel();
            }));
            this._updateDecorations = new async_1.RunOnceScheduler(function () { return _this._updateDecorationsNow(); }, 500);
            this._toDispose.push(this._updateDecorations);
            this._modelToDispose = [];
            this._onModel();
        }
        DefineKeybindingController.get = function (editor) {
            return editor.getContribution(DefineKeybindingController.ID);
        };
        DefineKeybindingController.prototype.getId = function () {
            return DefineKeybindingController.ID;
        };
        DefineKeybindingController.prototype.dispose = function () {
            this._modelToDispose = lifecycle_1.dispose(this._modelToDispose);
            this._toDispose = lifecycle_1.dispose(this._toDispose);
            this._launchWidget.dispose();
            this._launchWidget = null;
            this._defineWidget.dispose();
            this._defineWidget = null;
        };
        DefineKeybindingController.prototype.launch = function () {
            if (isInterestingEditorModel(this._editor)) {
                this._defineWidget.start();
            }
        };
        DefineKeybindingController.prototype._onAccepted = function (keybinding) {
            var snippetText = [
                '{',
                '\t"key": "' + keybinding + '",',
                '\t"command": "{{commandId}}",',
                '\t"when": "{{editorTextFocus}}"',
                '}{{}}'
            ].join('\n');
            snippet_1.getSnippetController(this._editor).run(new snippet_1.CodeSnippet(snippetText), 0, 0);
        };
        DefineKeybindingController.prototype._onModel = function () {
            var _this = this;
            this._modelToDispose = lifecycle_1.dispose(this._modelToDispose);
            var model = this._editor.getModel();
            if (!model) {
                return;
            }
            var url = model.getAssociatedResource().toString();
            if (!INTERESTING_FILE.test(url)) {
                return;
            }
            this._modelToDispose.push(model.addListener2(editorCommon.EventType.ModelContentChanged2, function (e) { return _this._updateDecorations.schedule(); }));
            this._modelToDispose.push({
                dispose: function () {
                    _this._dec = _this._editor.deltaDecorations(_this._dec, []);
                    _this._updateDecorations.cancel();
                }
            });
            this._updateDecorations.schedule();
        };
        DefineKeybindingController.prototype._updateDecorationsNow = function () {
            var _this = this;
            var model = this._editor.getModel();
            var regex = keyCodes_1.Keybinding.getUserSettingsKeybindingRegex();
            var m = model.findMatches(regex, false, true, false, false);
            var data = m.map(function (range) {
                var text = model.getValueInRange(range);
                var strKeybinding = text.substring(1, text.length - 1);
                strKeybinding = strKeybinding.replace(/\\\\/g, '\\');
                var numKeybinding = keybindingResolver_1.IOSupport.readKeybinding(strKeybinding);
                var keybinding = new keyCodes_1.Keybinding(numKeybinding);
                return {
                    strKeybinding: strKeybinding,
                    keybinding: keybinding,
                    usLabel: keybinding._toUSLabel(),
                    label: _this._keybindingService.getLabelFor(keybinding),
                    range: range
                };
            });
            data = data.filter(function (entry) {
                return (entry.usLabel !== entry.label);
            });
            var newDecorations = [];
            data.forEach(function (item) {
                var msg;
                var className;
                var inlineClassName;
                var overviewRulerColor;
                if (!item.label) {
                    // this is the error case
                    msg = [{
                            tagName: 'span',
                            text: NLS_KB_LAYOUT_ERROR_MESSAGE
                        }];
                    className = 'keybindingError';
                    inlineClassName = 'inlineKeybindingError';
                    overviewRulerColor = 'rgba(250, 100, 100, 0.6)';
                }
                else {
                    // this is the info case
                    msg = [{
                            tagName: 'span',
                            text: NLS_KB_LAYOUT_INFO_MESSAGE
                        }];
                    msg = msg.concat(_this._keybindingService.getHTMLLabelFor(item.keybinding));
                    className = 'keybindingInfo';
                    inlineClassName = 'inlineKeybindingInfo';
                    overviewRulerColor = 'rgba(100, 100, 250, 0.6)';
                }
                // icon decoration
                newDecorations.push({
                    range: new range_1.Range(item.range.startLineNumber, item.range.startColumn, item.range.startLineNumber, item.range.startColumn + 1),
                    options: {
                        stickiness: editorCommon.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
                        inlineClassName: inlineClassName
                    }
                });
                // highlight + message decoration
                newDecorations.push({
                    range: item.range,
                    options: {
                        stickiness: editorCommon.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
                        className: className,
                        htmlMessage: msg,
                        overviewRuler: {
                            color: overviewRulerColor,
                            darkColor: overviewRulerColor,
                            position: editorCommon.OverviewRulerLane.Right
                        }
                    }
                });
            });
            this._dec = this._editor.deltaDecorations(this._dec, newDecorations);
        };
        DefineKeybindingController.ID = 'editor.contrib.defineKeybinding';
        DefineKeybindingController = __decorate([
            __param(1, keybindingService_1.IKeybindingService)
        ], DefineKeybindingController);
        return DefineKeybindingController;
    }());
    exports.DefineKeybindingController = DefineKeybindingController;
    var DefineKeybindingLauncherWidget = (function () {
        function DefineKeybindingLauncherWidget(editor, keybindingService, onLaunch) {
            this._editor = editor;
            this._domNode = document.createElement('div');
            this._domNode.className = 'defineKeybindingLauncher';
            this._domNode.style.display = 'none';
            this._isVisible = false;
            var keybinding = keybindingService.lookupKeybindings(DefineKeybindingAction.ID);
            var extra = '';
            if (keybinding.length > 0) {
                extra += ' (' + keybindingService.getLabelFor(keybinding[0]) + ')';
            }
            this._domNode.appendChild(document.createTextNode(NLS_LAUNCH_MESSAGE + extra));
            this._toDispose = [];
            this._toDispose.push(dom.addDisposableListener(this._domNode, 'click', function (e) {
                onLaunch();
            }));
            this._editor.addOverlayWidget(this);
        }
        DefineKeybindingLauncherWidget.prototype.dispose = function () {
            this._editor.removeOverlayWidget(this);
            this._toDispose = lifecycle_1.dispose(this._toDispose);
        };
        DefineKeybindingLauncherWidget.prototype.show = function () {
            if (this._isVisible) {
                return;
            }
            this._domNode.style.display = 'block';
            this._isVisible = true;
            this._editor.layoutOverlayWidget(this);
        };
        DefineKeybindingLauncherWidget.prototype.hide = function () {
            if (!this._isVisible) {
                return;
            }
            this._domNode.style.display = 'none';
            this._isVisible = false;
            this._editor.layoutOverlayWidget(this);
        };
        // ----- IOverlayWidget API
        DefineKeybindingLauncherWidget.prototype.getId = function () {
            return DefineKeybindingLauncherWidget.ID;
        };
        DefineKeybindingLauncherWidget.prototype.getDomNode = function () {
            return this._domNode;
        };
        DefineKeybindingLauncherWidget.prototype.getPosition = function () {
            return {
                preference: this._isVisible ? editorBrowser_1.OverlayWidgetPositionPreference.BOTTOM_RIGHT_CORNER : null
            };
        };
        DefineKeybindingLauncherWidget.ID = 'editor.contrib.defineKeybindingLauncherWidget';
        return DefineKeybindingLauncherWidget;
    }());
    var DefineKeybindingWidget = (function () {
        function DefineKeybindingWidget(editor, keybindingService, onAccepted) {
            var _this = this;
            this._editor = editor;
            this._keybindingService = keybindingService;
            this._onAccepted = onAccepted;
            this._toDispose = [];
            this._lastKeybinding = null;
            this._domNode = document.createElement('div');
            this._domNode.className = 'defineKeybindingWidget';
            styleMutator_1.StyleMutator.setWidth(this._domNode, DefineKeybindingWidget.WIDTH);
            styleMutator_1.StyleMutator.setHeight(this._domNode, DefineKeybindingWidget.HEIGHT);
            this._domNode.style.display = 'none';
            this._isVisible = false;
            this._messageNode = document.createElement('div');
            this._messageNode.className = 'message';
            this._messageNode.innerText = NLS_DEFINE_MESSAGE;
            this._domNode.appendChild(this._messageNode);
            this._inputNode = document.createElement('input');
            this._inputNode.className = 'input';
            this._inputNode.type = 'text';
            this._domNode.appendChild(this._inputNode);
            this._outputNode = document.createElement('div');
            this._outputNode.className = 'output';
            this._domNode.appendChild(this._outputNode);
            this._toDispose.push(dom.addDisposableListener(this._inputNode, 'keydown', function (e) {
                var keyEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                keyEvent.preventDefault();
                keyEvent.stopPropagation();
                var kb = new keyCodes_1.Keybinding(keyEvent.asKeybinding());
                switch (kb.value) {
                    case keyCodes_1.CommonKeybindings.ENTER:
                        if (_this._lastKeybinding) {
                            _this._onAccepted(_this._lastKeybinding.toUserSettingsLabel());
                        }
                        _this._stop();
                        return;
                    case keyCodes_1.CommonKeybindings.ESCAPE:
                        _this._stop();
                        return;
                }
                _this._lastKeybinding = kb;
                _this._inputNode.value = _this._lastKeybinding.toUserSettingsLabel().toLowerCase();
                _this._inputNode.title = 'keyCode: ' + keyEvent.browserEvent.keyCode;
                dom.clearNode(_this._outputNode);
                var htmlkb = _this._keybindingService.getHTMLLabelFor(_this._lastKeybinding);
                htmlkb.forEach(function (item) { return _this._outputNode.appendChild(htmlContentRenderer_1.renderHtml(item)); });
            }));
            this._toDispose.push(this._editor.addListener2(editorCommon.EventType.ConfigurationChanged, function (e) {
                if (_this._isVisible) {
                    _this._layout();
                }
            }));
            this._toDispose.push(dom.addDisposableListener(this._inputNode, 'blur', function (e) { return _this._stop(); }));
            this._editor.addOverlayWidget(this);
        }
        DefineKeybindingWidget.prototype.dispose = function () {
            this._editor.removeOverlayWidget(this);
            this._toDispose = lifecycle_1.dispose(this._toDispose);
        };
        DefineKeybindingWidget.prototype.getId = function () {
            return DefineKeybindingWidget.ID;
        };
        DefineKeybindingWidget.prototype.getDomNode = function () {
            return this._domNode;
        };
        DefineKeybindingWidget.prototype.getPosition = function () {
            return {
                preference: null
            };
        };
        DefineKeybindingWidget.prototype._show = function () {
            if (this._isVisible) {
                return;
            }
            this._isVisible = true;
            this._layout();
            this._domNode.style.display = 'block';
        };
        DefineKeybindingWidget.prototype._hide = function () {
            if (!this._isVisible) {
                return;
            }
            this._isVisible = false;
            this._domNode.style.display = 'none';
        };
        DefineKeybindingWidget.prototype._layout = function () {
            var editorLayout = this._editor.getLayoutInfo();
            var top = Math.round((editorLayout.height - DefineKeybindingWidget.HEIGHT) / 2);
            styleMutator_1.StyleMutator.setTop(this._domNode, top);
            var left = Math.round((editorLayout.width - DefineKeybindingWidget.WIDTH) / 2);
            styleMutator_1.StyleMutator.setLeft(this._domNode, left);
        };
        DefineKeybindingWidget.prototype.start = function () {
            this._editor.revealPositionInCenterIfOutsideViewport(this._editor.getPosition());
            this._show();
            this._lastKeybinding = null;
            this._inputNode.value = '';
            dom.clearNode(this._outputNode);
            this._inputNode.focus();
        };
        DefineKeybindingWidget.prototype._stop = function () {
            this._editor.focus();
            this._hide();
        };
        DefineKeybindingWidget.ID = 'editor.contrib.defineKeybindingWidget';
        DefineKeybindingWidget.WIDTH = 340;
        DefineKeybindingWidget.HEIGHT = 90;
        return DefineKeybindingWidget;
    }());
    var DefineKeybindingAction = (function (_super) {
        __extends(DefineKeybindingAction, _super);
        function DefineKeybindingAction(descriptor, editor) {
            _super.call(this, descriptor, editor, editorActionEnablement_1.Behaviour.WidgetFocus | editorActionEnablement_1.Behaviour.UpdateOnModelChange | editorActionEnablement_1.Behaviour.Writeable);
        }
        DefineKeybindingAction.prototype.isSupported = function () {
            if (!_super.prototype.isSupported.call(this)) {
                return false;
            }
            return isInterestingEditorModel(this.editor);
        };
        DefineKeybindingAction.prototype.run = function () {
            var controller = DefineKeybindingController.get(this.editor);
            controller.launch();
            return winjs_base_1.TPromise.as(true);
        };
        DefineKeybindingAction.ID = 'editor.action.defineKeybinding';
        return DefineKeybindingAction;
    }(editorAction_1.EditorAction));
    exports.DefineKeybindingAction = DefineKeybindingAction;
    function isInterestingEditorModel(editor) {
        if (editor.getConfiguration().readOnly) {
            return false;
        }
        var model = editor.getModel();
        if (!model) {
            return false;
        }
        var url = model.getAssociatedResource().toString();
        return INTERESTING_FILE.test(url);
    }
    editorBrowserExtensions_1.EditorBrowserRegistry.registerEditorContribution(DefineKeybindingController);
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(DefineKeybindingAction, DefineKeybindingAction.ID, NLS_DEFINE_ACTION_LABEL, {
        context: editorCommonExtensions_1.ContextKey.EditorFocus,
        primary: keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K, keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K)
    }));
});
//# sourceMappingURL=defineKeybinding.js.map