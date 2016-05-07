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
define(["require", "exports", 'vs/nls!vs/editor/contrib/accessibility/browser/accessibility', 'vs/base/common/keyCodes', 'vs/base/common/lifecycle', 'vs/base/common/strings', 'vs/base/common/winjs.base', 'vs/base/browser/dom', 'vs/base/browser/htmlContentRenderer', 'vs/base/browser/styleMutator', 'vs/base/browser/ui/widget', 'vs/platform/keybinding/common/keybindingService', 'vs/platform/keybinding/common/keybindingsRegistry', 'vs/editor/common/config/commonEditorConfig', 'vs/editor/common/editorAction', 'vs/editor/common/editorActionEnablement', 'vs/editor/common/editorCommon', 'vs/editor/common/editorCommonExtensions', 'vs/editor/browser/editorBrowserExtensions', 'vs/editor/contrib/toggleTabFocusMode/common/toggleTabFocusMode', 'vs/css!./accessibility'], function (require, exports, nls, keyCodes_1, lifecycle_1, strings, winjs_base_1, dom_1, htmlContentRenderer_1, styleMutator_1, widget_1, keybindingService_1, keybindingsRegistry_1, commonEditorConfig_1, editorAction_1, editorActionEnablement_1, editorCommon_1, editorCommonExtensions_1, editorBrowserExtensions_1, toggleTabFocusMode_1) {
    'use strict';
    var NLS_SHOW_ACCESSIBILITY_HELP_ACTION_LABEL = nls.localize(0, null);
    var CONTEXT_ACCESSIBILITY_WIDGET_VISIBLE = 'accessibilityHelpWidgetVisible';
    var TOGGLE_EXPERIMENTAL_SCREEN_READER_SUPPORT_COMMAND_ID = 'toggleExperimentalScreenReaderSupport';
    var AccessibilityHelpController = (function (_super) {
        __extends(AccessibilityHelpController, _super);
        function AccessibilityHelpController(editor, keybindingService) {
            _super.call(this);
            this._editor = editor;
            this._widget = this._register(new AccessibilityHelpWidget(this._editor, keybindingService));
        }
        AccessibilityHelpController.get = function (editor) {
            return editor.getContribution(AccessibilityHelpController.ID);
        };
        AccessibilityHelpController.prototype.getId = function () {
            return AccessibilityHelpController.ID;
        };
        AccessibilityHelpController.prototype.show = function () {
            this._widget.show();
        };
        AccessibilityHelpController.prototype.hide = function () {
            this._widget.hide();
        };
        AccessibilityHelpController.ID = 'editor.contrib.accessibilityHelpController';
        AccessibilityHelpController = __decorate([
            __param(1, keybindingService_1.IKeybindingService)
        ], AccessibilityHelpController);
        return AccessibilityHelpController;
    }(lifecycle_1.Disposable));
    var AccessibilityHelpWidget = (function (_super) {
        __extends(AccessibilityHelpWidget, _super);
        function AccessibilityHelpWidget(editor, keybindingService) {
            var _this = this;
            _super.call(this);
            this._editor = editor;
            this._keybindingService = keybindingService;
            this._isVisibleKey = keybindingService.createKey(CONTEXT_ACCESSIBILITY_WIDGET_VISIBLE, false);
            this._domNode = document.createElement('div');
            this._domNode.className = 'accessibilityHelpWidget';
            styleMutator_1.StyleMutator.setWidth(this._domNode, AccessibilityHelpWidget.WIDTH);
            styleMutator_1.StyleMutator.setHeight(this._domNode, AccessibilityHelpWidget.HEIGHT);
            this._domNode.style.display = 'none';
            this._domNode.setAttribute('role', 'tooltip');
            this._domNode.setAttribute('aria-hidden', 'true');
            this._isVisible = false;
            this._register(this._editor.addListener2(editorCommon_1.EventType.EditorLayout, function () {
                if (_this._isVisible) {
                    _this._layout();
                }
            }));
            this.onblur(this._domNode, function () {
                _this.hide();
            });
            this._editor.addOverlayWidget(this);
        }
        AccessibilityHelpWidget.prototype.dispose = function () {
            this._editor.removeOverlayWidget(this);
            _super.prototype.dispose.call(this);
        };
        AccessibilityHelpWidget.prototype.getId = function () {
            return AccessibilityHelpWidget.ID;
        };
        AccessibilityHelpWidget.prototype.getDomNode = function () {
            return this._domNode;
        };
        AccessibilityHelpWidget.prototype.getPosition = function () {
            return {
                preference: null
            };
        };
        AccessibilityHelpWidget.prototype.show = function () {
            if (this._isVisible) {
                return;
            }
            this._isVisible = true;
            this._isVisibleKey.set(true);
            this._layout();
            this._domNode.style.display = 'block';
            this._domNode.setAttribute('aria-hidden', 'false');
            this._domNode.tabIndex = 0;
            this._buildContent();
            this._domNode.focus();
        };
        AccessibilityHelpWidget.prototype._descriptionForCommand = function (commandId, msg, noKbMsg) {
            var keybindings = this._keybindingService.lookupKeybindings(commandId);
            if (keybindings.length > 0) {
                return strings.format(msg, this._keybindingService.getAriaLabelFor(keybindings[0]));
            }
            return strings.format(noKbMsg, commandId);
        };
        AccessibilityHelpWidget.prototype._buildContent = function () {
            var opts = this._editor.getConfiguration();
            var text = nls.localize(1, null);
            text += '\n\n' + nls.localize(2, null);
            var NLS_TAB_FOCUS_MODE_ON = nls.localize(3, null);
            var NLS_TAB_FOCUS_MODE_ON_NO_KB = nls.localize(4, null);
            var NLS_TAB_FOCUS_MODE_OFF = nls.localize(5, null);
            var NLS_TAB_FOCUS_MODE_OFF_NO_KB = nls.localize(6, null);
            if (opts.tabFocusMode) {
                text += '\n\n -' + this._descriptionForCommand(toggleTabFocusMode_1.ToggleTabFocusModeAction.ID, NLS_TAB_FOCUS_MODE_ON, NLS_TAB_FOCUS_MODE_ON_NO_KB);
            }
            else {
                text += '\n\n -' + this._descriptionForCommand(toggleTabFocusMode_1.ToggleTabFocusModeAction.ID, NLS_TAB_FOCUS_MODE_OFF, NLS_TAB_FOCUS_MODE_OFF_NO_KB);
            }
            var NLS_EXPERIMENTAL_SCREENREADER_OPTS_ON = nls.localize(7, null);
            var NLS_EXPERIMENTAL_SCREENREADER_SESSION_ON = nls.localize(8, null);
            var NLS_EXPERIMENTAL_SCREENREADER_SESSION_ON_NO_KB = nls.localize(9, null);
            var NLS_EXPERIMENTAL_SCREENREADER_SESSION_OFF = nls.localize(10, null);
            var NLS_EXPERIMENTAL_SCREENREADER_SESSION_OFF_NO_KB = nls.localize(11, null);
            if (opts.experimentalScreenReader) {
                text += '\n\n - ' + NLS_EXPERIMENTAL_SCREENREADER_OPTS_ON;
            }
            else {
                if (commonEditorConfig_1.GlobalScreenReaderNVDA.getValue()) {
                    text += '\n\n -' + this._descriptionForCommand(TOGGLE_EXPERIMENTAL_SCREEN_READER_SUPPORT_COMMAND_ID, NLS_EXPERIMENTAL_SCREENREADER_SESSION_ON, NLS_EXPERIMENTAL_SCREENREADER_SESSION_ON_NO_KB);
                }
                else {
                    text += '\n\n -' + this._descriptionForCommand(TOGGLE_EXPERIMENTAL_SCREEN_READER_SUPPORT_COMMAND_ID, NLS_EXPERIMENTAL_SCREENREADER_SESSION_OFF, NLS_EXPERIMENTAL_SCREENREADER_SESSION_OFF_NO_KB);
                }
            }
            text += '\n\n' + nls.localize(12, null);
            this._domNode.appendChild(htmlContentRenderer_1.renderHtml({
                formattedText: text
            }));
        };
        AccessibilityHelpWidget.prototype.hide = function () {
            if (!this._isVisible) {
                return;
            }
            this._isVisible = false;
            this._isVisibleKey.reset();
            this._domNode.style.display = 'none';
            this._domNode.setAttribute('aria-hidden', 'true');
            this._domNode.tabIndex = -1;
            dom_1.clearNode(this._domNode);
            this._editor.focus();
        };
        AccessibilityHelpWidget.prototype._layout = function () {
            var editorLayout = this._editor.getLayoutInfo();
            var top = Math.round((editorLayout.height - AccessibilityHelpWidget.HEIGHT) / 2);
            styleMutator_1.StyleMutator.setTop(this._domNode, top);
            var left = Math.round((editorLayout.width - AccessibilityHelpWidget.WIDTH) / 2);
            styleMutator_1.StyleMutator.setLeft(this._domNode, left);
        };
        AccessibilityHelpWidget.ID = 'editor.contrib.accessibilityHelpWidget';
        AccessibilityHelpWidget.WIDTH = 500;
        AccessibilityHelpWidget.HEIGHT = 300;
        return AccessibilityHelpWidget;
    }(widget_1.Widget));
    var ShowAccessibilityHelpAction = (function (_super) {
        __extends(ShowAccessibilityHelpAction, _super);
        function ShowAccessibilityHelpAction(descriptor, editor) {
            _super.call(this, descriptor, editor, editorActionEnablement_1.Behaviour.WidgetFocus);
        }
        ShowAccessibilityHelpAction.prototype.run = function () {
            var controller = AccessibilityHelpController.get(this.editor);
            controller.show();
            return winjs_base_1.TPromise.as(true);
        };
        return ShowAccessibilityHelpAction;
    }(editorAction_1.EditorAction));
    editorBrowserExtensions_1.EditorBrowserRegistry.registerEditorContribution(AccessibilityHelpController);
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(ShowAccessibilityHelpAction, editorCommon_1.SHOW_ACCESSIBILITY_HELP_ACTION_ID, NLS_SHOW_ACCESSIBILITY_HELP_ACTION_LABEL, {
        context: editorCommonExtensions_1.ContextKey.EditorFocus,
        primary: keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.F1
    }));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorCommand('closeAccessibilityHelp', editorCommonExtensions_1.CommonEditorRegistry.commandWeight(100), { primary: keyCodes_1.KeyCode.Escape, secondary: [keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.Escape] }, false, CONTEXT_ACCESSIBILITY_WIDGET_VISIBLE, function (ctx, editor, args) {
        AccessibilityHelpController.get(editor).hide();
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandDesc({
        id: TOGGLE_EXPERIMENTAL_SCREEN_READER_SUPPORT_COMMAND_ID,
        handler: function (accessor, args) {
            var currentValue = commonEditorConfig_1.GlobalScreenReaderNVDA.getValue();
            commonEditorConfig_1.GlobalScreenReaderNVDA.setValue(!currentValue);
        },
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        context: null,
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.KEY_R
    });
});
//# sourceMappingURL=accessibility.js.map