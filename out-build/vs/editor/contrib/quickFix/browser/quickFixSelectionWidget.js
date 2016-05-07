/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls!vs/editor/contrib/quickFix/browser/quickFixSelectionWidget', 'vs/base/common/errors', 'vs/base/common/winjs.base', 'vs/base/browser/dom', 'vs/base/parts/tree/browser/treeDefaults', 'vs/base/parts/tree/browser/treeImpl', 'vs/editor/common/editorCommon', 'vs/editor/browser/editorBrowser', 'vs/base/browser/ui/aria/aria', 'vs/css!./quickFix'], function (require, exports, nls, errors_1, winjs_base_1, dom, treeDefaults_1, treeImpl_1, editorCommon_1, editorBrowser_1, aria_1) {
    'use strict';
    var $ = dom.emmet;
    function isQuickFix(quickfix) {
        return quickfix
            && typeof quickfix.command === 'object'
            && typeof quickfix.command.title === 'string';
    }
    function getAriaAlertLabel(item) {
        return nls.localize(0, null, item.command.title);
    }
    // To be used as a tree element when we want to show a message
    var Message = (function () {
        function Message(parent, message) {
            this.parent = parent;
            this.message = message;
            // nothing to do
        }
        return Message;
    }());
    exports.Message = Message;
    var MessageRoot = (function () {
        function MessageRoot(message) {
            this.child = new Message(this, message);
        }
        return MessageRoot;
    }());
    exports.MessageRoot = MessageRoot;
    var DataSource = (function () {
        function DataSource() {
            this.root = null;
        }
        DataSource.prototype.isRoot = function (element) {
            if (element instanceof MessageRoot) {
                return true;
            }
            else if (element instanceof Message) {
                return false;
            }
            else if (Array.isArray(element)) {
                this.root = element;
                return true;
            }
            else {
                return false;
            }
        };
        DataSource.prototype.getId = function (tree, element) {
            if (element instanceof MessageRoot) {
                return 'messageroot';
            }
            else if (element instanceof Message) {
                return 'message' + element.message;
            }
            else if (Array.isArray(element)) {
                return 'root';
            }
            else if (isQuickFix(element)) {
                return element.id;
            }
            else {
                throw errors_1.illegalArgument('element');
            }
        };
        DataSource.prototype.getParent = function (tree, element) {
            if (element instanceof MessageRoot) {
                return winjs_base_1.TPromise.as(null);
            }
            else if (element instanceof Message) {
                return winjs_base_1.TPromise.as(element.parent);
            }
            return winjs_base_1.TPromise.as(this.isRoot(element) ? null : this.root);
        };
        DataSource.prototype.getChildren = function (tree, element) {
            if (element instanceof MessageRoot) {
                return winjs_base_1.TPromise.as([element.child]);
            }
            else if (element instanceof Message) {
                return winjs_base_1.TPromise.as([]);
            }
            return winjs_base_1.TPromise.as(this.isRoot(element) ? element : []);
        };
        DataSource.prototype.hasChildren = function (tree, element) {
            return this.isRoot(element);
        };
        return DataSource;
    }());
    var Controller = (function (_super) {
        __extends(Controller, _super);
        function Controller() {
            _super.apply(this, arguments);
        }
        /* protected */ Controller.prototype.onLeftClick = function (tree, element, event) {
            event.preventDefault();
            event.stopPropagation();
            if (!(element instanceof Message)) {
                tree.setSelection([element], { origin: 'mouse' });
            }
            return true;
        };
        return Controller;
    }(treeDefaults_1.DefaultController));
    var AccessibilityProvider = (function () {
        function AccessibilityProvider() {
        }
        AccessibilityProvider.prototype.getAriaLabel = function (tree, element) {
            if (isQuickFix(element)) {
                return getAriaAlertLabel(element);
            }
        };
        return AccessibilityProvider;
    }());
    exports.AccessibilityProvider = AccessibilityProvider;
    function getHeight(tree, element) {
        // var fix = <IQuickFix2>element;
        // if (!(element instanceof Message) && !!fix.documentation && tree.isFocused(fix)) {
        // 	return 35;
        // }
        return 19;
    }
    var Renderer = (function () {
        function Renderer() {
        }
        Renderer.prototype.getHeight = function (tree, element) {
            return getHeight(tree, element);
        };
        Renderer.prototype.getTemplateId = function (tree, element) {
            return element instanceof Message ? 'message' : 'default';
        };
        Renderer.prototype.renderTemplate = function (tree, templateId, container) {
            if (templateId === 'message') {
                var messageElement = dom.append(container, $('span'));
                messageElement.style.opacity = '0.7';
                messageElement.style.paddingLeft = '12px';
                return { element: messageElement };
            }
            var result = {};
            var text = dom.append(container, $('.text'));
            result['main'] = dom.append(text, $('.main'));
            var docs = dom.append(text, $('.docs'));
            result['documentationLabel'] = dom.append(docs, $('span.docs-label'));
            return result;
        };
        Renderer.prototype.renderElement = function (tree, element, templateId, templateData) {
            if (templateId === 'message') {
                templateData.element.textContent = element.message;
                return;
            }
            var quickFix = element;
            templateData.main.textContent = quickFix.command.title;
            templateData.documentationLabel.textContent = '';
        };
        Renderer.prototype.disposeTemplate = function (tree, templateId, templateData) {
            // noop
        };
        return Renderer;
    }());
    var QuickFixSelectionWidget = (function () {
        function QuickFixSelectionWidget(editor, telemetryService, onShown, onHidden) {
            var _this = this;
            // Editor.IContentWidget.allowEditorOverflow
            this.allowEditorOverflow = true;
            this.editor = editor;
            this._onShown = onShown;
            this._onHidden = onHidden;
            this.shouldShowEmptyList = true;
            this.isActive = false;
            this.isLoading = false;
            this.isAuto = false;
            this.modelListenersToRemove = [];
            this.model = null;
            this.telemetryData = Object.create(null);
            this.telemetryService = telemetryService;
            this.listenersToRemove = [];
            this.domnode = $('.editor-widget.quickfix-widget.monaco-editor-background.no-icons');
            this.domnode.style.width = QuickFixSelectionWidget.WIDTH + 'px';
            this.tree = new treeImpl_1.Tree(this.domnode, {
                dataSource: new DataSource(),
                renderer: new Renderer(),
                controller: new Controller(),
                accessibilityProvider: new AccessibilityProvider()
            }, {
                twistiePixels: 0,
                alwaysFocused: true,
                verticalScrollMode: 'visible',
                useShadows: false,
                ariaLabel: nls.localize(3, null)
            });
            this.listenersToRemove.push(this.tree.addListener('selection', function (e) {
                if (e.selection && e.selection.length > 0) {
                    var element = e.selection[0];
                    if (isQuickFix(element) && !(element instanceof MessageRoot) && !(element instanceof Message)) {
                        _this.telemetryData.selectedIndex = _this.tree.getInput().indexOf(element);
                        _this.telemetryData.wasCancelled = false;
                        _this.submitTelemetryData();
                        aria_1.alert(nls.localize(4, null, element.command.title));
                        _this.model.accept(element, _this.range);
                        _this.editor.focus();
                    }
                }
            }));
            var oldFocus = null;
            this.listenersToRemove.push(this.tree.addListener('focus', function (e) {
                var focus = e.focus;
                var payload = e.payload;
                if (focus === oldFocus) {
                    return;
                }
                var elementsToRefresh = [];
                if (oldFocus) {
                    elementsToRefresh.push(oldFocus);
                }
                if (focus) {
                    elementsToRefresh.push(focus);
                    _this._ariaAlert(getAriaAlertLabel(focus));
                }
                oldFocus = focus;
                _this.tree.refreshAll(elementsToRefresh).done(function () {
                    _this.updateWidgetHeight();
                    if (focus) {
                        return _this.tree.reveal(focus, (payload && payload.firstSuggestion) ? 0 : null);
                    }
                }, errors_1.onUnexpectedError);
            }));
            this.editor.addContentWidget(this);
            this.listenersToRemove.push(this.editor.addListener(editorCommon_1.EventType.CursorSelectionChanged, function (e) {
                if (_this.isActive) {
                    _this.editor.layoutContentWidget(_this);
                }
            }));
            this.hide();
        }
        QuickFixSelectionWidget.prototype._ariaAlert = function (newAriaAlertLabel) {
            if (this._lastAriaAlertLabel === newAriaAlertLabel) {
                return;
            }
            this._lastAriaAlertLabel = newAriaAlertLabel;
            if (this._lastAriaAlertLabel) {
                aria_1.alert(this._lastAriaAlertLabel);
            }
        };
        QuickFixSelectionWidget.prototype.setModel = function (newModel) {
            var _this = this;
            this.releaseModel();
            this.model = newModel;
            var timer = null, loadingHandle;
            this.modelListenersToRemove.push(this.model.addListener('loading', function (e) {
                if (!_this.isActive) {
                    timer = _this.telemetryService.timedPublicLog('QuickFixSelectionWidgetLoadingTime');
                    _this.isLoading = true;
                    _this.isAuto = !!e.auto;
                    if (!_this.isAuto) {
                        loadingHandle = setTimeout(function () {
                            dom.removeClass(_this.domnode, 'empty');
                            _this.tree.setInput(QuickFixSelectionWidget.LOADING_MESSAGE).done(null, errors_1.onUnexpectedError);
                            _this.updateWidgetHeight();
                            _this.show();
                        }, 50);
                    }
                    if (!e.retrigger) {
                        _this.telemetryData = {
                            wasAutomaticallyTriggered: e.characterTriggered
                        };
                    }
                }
            }));
            this.modelListenersToRemove.push(this.model.addListener('suggest', function (e) {
                _this.isLoading = false;
                if (typeof loadingHandle !== 'undefined') {
                    clearTimeout(loadingHandle);
                    loadingHandle = void 0;
                }
                var fixes = e.fixes;
                var bestFixIndex = -1;
                var bestFix = fixes[0];
                var bestScore = -1;
                for (var i = 0, len = fixes.length; i < len; i++) {
                    var fix = fixes[i];
                    var score = fix.score;
                    if (score > bestScore) {
                        bestScore = score;
                        bestFix = fix;
                        bestFixIndex = i;
                    }
                }
                dom.removeClass(_this.domnode, 'empty');
                _this.tree.setInput(fixes).done(null, errors_1.onUnexpectedError);
                _this.tree.setFocus(bestFix, { firstSuggestion: true });
                _this.updateWidgetHeight();
                _this.range = e.range;
                _this.show();
                _this.telemetryData = _this.telemetryData || {};
                _this.telemetryData.suggestionCount = fixes.length;
                _this.telemetryData.suggestedIndex = bestFixIndex;
                if (timer) {
                    timer.data = { reason: 'results' };
                    timer.stop();
                    timer = null;
                }
            }));
            this.modelListenersToRemove.push(this.model.addListener('empty', function (e) {
                var wasLoading = _this.isLoading;
                _this.isLoading = false;
                if (typeof loadingHandle !== 'undefined') {
                    clearTimeout(loadingHandle);
                    loadingHandle = void 0;
                }
                if (e.auto) {
                    _this.hide();
                }
                else if (wasLoading) {
                    if (_this.shouldShowEmptyList) {
                        dom.removeClass(_this.domnode, 'empty');
                        _this.tree.setInput(QuickFixSelectionWidget.NO_SUGGESTIONS_MESSAGE).done(null, errors_1.onUnexpectedError);
                        _this.updateWidgetHeight();
                        _this.show();
                    }
                    else {
                        _this.hide();
                    }
                }
                else {
                    dom.addClass(_this.domnode, 'empty');
                }
                if (timer) {
                    timer.data = { reason: 'empty' };
                    timer.stop();
                    timer = null;
                }
            }));
            this.modelListenersToRemove.push(this.model.addListener('cancel', function (e) {
                _this.isLoading = false;
                if (typeof loadingHandle !== 'undefined') {
                    clearTimeout(loadingHandle);
                    loadingHandle = void 0;
                }
                if (!e.retrigger) {
                    _this.hide();
                    if (_this.telemetryData) {
                        _this.telemetryData.selectedIndex = -1;
                        _this.telemetryData.wasCancelled = true;
                        _this.submitTelemetryData();
                    }
                }
                if (timer) {
                    timer.data = { reason: 'cancel' };
                    timer.stop();
                    timer = null;
                }
            }));
        };
        QuickFixSelectionWidget.prototype.selectNextPage = function () {
            if (this.isLoading) {
                return !this.isAuto;
            }
            if (this.isActive) {
                this.tree.focusNextPage();
                return true;
            }
            return false;
        };
        QuickFixSelectionWidget.prototype.selectNext = function () {
            if (this.isLoading) {
                return !this.isAuto;
            }
            if (this.isActive) {
                var focus = this.tree.getFocus();
                this.tree.focusNext(1);
                if (focus === this.tree.getFocus()) {
                    this.tree.focusFirst();
                }
                return true;
            }
            return false;
        };
        QuickFixSelectionWidget.prototype.selectPreviousPage = function () {
            if (this.isLoading) {
                return !this.isAuto;
            }
            if (this.isActive) {
                this.tree.focusPreviousPage();
                return true;
            }
            return false;
        };
        QuickFixSelectionWidget.prototype.selectPrevious = function () {
            if (this.isLoading) {
                return !this.isAuto;
            }
            if (this.isActive) {
                var focus = this.tree.getFocus();
                this.tree.focusPrevious(1);
                if (focus === this.tree.getFocus()) {
                    this.tree.focusLast();
                }
                return true;
            }
            return false;
        };
        QuickFixSelectionWidget.prototype.acceptSelectedSuggestion = function () {
            if (this.isLoading) {
                return !this.isAuto;
            }
            if (this.isActive) {
                var focus = this.tree.getFocus();
                if (focus) {
                    this.tree.setSelection([focus]);
                }
                else {
                    this.model.cancelDialog();
                }
                return true;
            }
            return false;
        };
        QuickFixSelectionWidget.prototype.releaseModel = function () {
            var listener;
            while (listener = this.modelListenersToRemove.pop()) {
                listener();
            }
            this.model = null;
        };
        QuickFixSelectionWidget.prototype.show = function () {
            this.isActive = true;
            this.tree.layout();
            this.editor.layoutContentWidget(this);
            this._onShown();
        };
        QuickFixSelectionWidget.prototype.hide = function () {
            this._onHidden();
            this.isActive = false;
            this.editor.layoutContentWidget(this);
        };
        QuickFixSelectionWidget.prototype.getPosition = function () {
            if (this.isActive) {
                return {
                    position: this.editor.getPosition(),
                    preference: [editorBrowser_1.ContentWidgetPositionPreference.BELOW, editorBrowser_1.ContentWidgetPositionPreference.ABOVE]
                };
            }
            return null;
        };
        QuickFixSelectionWidget.prototype.getDomNode = function () {
            return this.domnode;
        };
        QuickFixSelectionWidget.prototype.getId = function () {
            return QuickFixSelectionWidget.ID;
        };
        QuickFixSelectionWidget.prototype.submitTelemetryData = function () {
            this.telemetryService.publicLog('QuickFixSelectionWidget', this.telemetryData);
            this.telemetryData = Object.create(null);
        };
        QuickFixSelectionWidget.prototype.updateWidgetHeight = function () {
            var input = this.tree.getInput();
            var height;
            if (input === QuickFixSelectionWidget.LOADING_MESSAGE || input === QuickFixSelectionWidget.NO_SUGGESTIONS_MESSAGE) {
                height = 19;
            }
            else {
                var fixes = input;
                height = Math.min(fixes.length - 1, 11) * 19;
                var focus = this.tree.getFocus();
                height += focus ? getHeight(this.tree, focus) : 19;
            }
            this.domnode.style.height = height + 'px';
            this.tree.layout(height);
            this.editor.layoutContentWidget(this);
        };
        QuickFixSelectionWidget.prototype.destroy = function () {
            this.releaseModel();
            this.domnode = null;
            this.tree.dispose();
            this.tree = null;
            this.listenersToRemove.forEach(function (element) {
                element();
            });
            this.listenersToRemove = null;
        };
        QuickFixSelectionWidget.ID = 'editor.widget.QuickFixSelectionWidget';
        QuickFixSelectionWidget.WIDTH = 360;
        QuickFixSelectionWidget.LOADING_MESSAGE = new MessageRoot(nls.localize(1, null));
        QuickFixSelectionWidget.NO_SUGGESTIONS_MESSAGE = new MessageRoot(nls.localize(2, null));
        return QuickFixSelectionWidget;
    }());
    exports.QuickFixSelectionWidget = QuickFixSelectionWidget;
});
//# sourceMappingURL=quickFixSelectionWidget.js.map