/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/nls!vs/editor/contrib/suggest/browser/suggestWidget', 'vs/base/common/strings', 'vs/base/common/errors', 'vs/base/common/event', 'vs/base/common/lifecycle', 'vs/base/common/winjs.base', 'vs/base/browser/dom', 'vs/base/browser/ui/highlightedlabel/highlightedLabel', 'vs/base/browser/ui/list/listWidget', 'vs/base/browser/ui/scrollbar/scrollableElementImpl', 'vs/platform/instantiation/common/instantiation', 'vs/platform/keybinding/common/keybindingService', 'vs/platform/telemetry/common/telemetry', 'vs/editor/common/editorCommon', 'vs/editor/common/modes', 'vs/editor/browser/editorBrowser', '../common/suggest', 'vs/base/browser/ui/aria/aria', 'vs/base/browser/ui/scrollbar/domNodeScrollable', 'vs/css!./suggest'], function (require, exports, nls, strings, errors_1, event_1, lifecycle_1, winjs_base_1, dom_1, highlightedLabel_1, listWidget_1, scrollableElementImpl_1, instantiation_1, keybindingService_1, telemetry_1, editorCommon_1, modes_1, editorBrowser_1, suggest_1, aria_1, domNodeScrollable_1) {
    'use strict';
    var Renderer = (function () {
        function Renderer(widget, keybindingService) {
            this.widget = widget;
            var keybindings = keybindingService.lookupKeybindings('editor.action.triggerSuggest');
            this.triggerKeybindingLabel = keybindings.length === 0 ? '' : " (" + keybindingService.getLabelFor(keybindings[0]) + ")";
        }
        Object.defineProperty(Renderer.prototype, "templateId", {
            get: function () {
                return 'suggestion';
            },
            enumerable: true,
            configurable: true
        });
        Renderer.prototype.renderTemplate = function (container) {
            var data = Object.create(null);
            data.root = container;
            data.icon = dom_1.append(container, dom_1.emmet('.icon'));
            data.colorspan = dom_1.append(data.icon, dom_1.emmet('span.colorspan'));
            var text = dom_1.append(container, dom_1.emmet('.text'));
            var main = dom_1.append(text, dom_1.emmet('.main'));
            data.highlightedLabel = new highlightedLabel_1.HighlightedLabel(main);
            data.typeLabel = dom_1.append(main, dom_1.emmet('span.type-label'));
            var docs = dom_1.append(text, dom_1.emmet('.docs'));
            data.documentation = dom_1.append(docs, dom_1.emmet('span.docs-text'));
            data.documentationDetails = dom_1.append(docs, dom_1.emmet('span.docs-details.octicon.octicon-info'));
            data.documentationDetails.title = nls.localize(0, null, this.triggerKeybindingLabel);
            return data;
        };
        Renderer.prototype.renderElement = function (element, index, templateData) {
            var _this = this;
            var data = templateData;
            var suggestion = element.suggestion;
            if (suggestion.documentationLabel) {
                data.root.setAttribute('aria-label', nls.localize(1, null, suggestion.label));
            }
            else {
                data.root.setAttribute('aria-label', nls.localize(2, null, suggestion.label));
            }
            if (suggestion.type === 'customcolor') {
                data.icon.className = 'icon customcolor';
                data.colorspan.style.backgroundColor = suggestion.label;
            }
            else {
                data.icon.className = 'icon ' + suggestion.type;
                data.colorspan.style.backgroundColor = '';
            }
            data.highlightedLabel.set(suggestion.label, element.highlights);
            data.typeLabel.textContent = suggestion.typeLabel || '';
            data.documentation.textContent = suggestion.documentationLabel || '';
            if (suggestion.documentationLabel) {
                dom_1.show(data.documentationDetails);
                data.documentationDetails.onmousedown = function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                };
                data.documentationDetails.onclick = function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    _this.widget.toggleDetails();
                };
            }
            else {
                dom_1.hide(data.documentationDetails);
                data.documentationDetails.onmousedown = null;
                data.documentationDetails.onclick = null;
            }
        };
        Renderer.prototype.disposeTemplate = function (templateData) {
            templateData.highlightedLabel.dispose();
        };
        Renderer = __decorate([
            __param(1, keybindingService_1.IKeybindingService)
        ], Renderer);
        return Renderer;
    }());
    var FocusHeight = 35;
    var UnfocusedHeight = 19;
    var Delegate = (function () {
        function Delegate(listProvider) {
            this.listProvider = listProvider;
        }
        Delegate.prototype.getHeight = function (element) {
            var focus = this.listProvider().getFocus()[0];
            if (element.suggestion.documentationLabel && element === focus) {
                return FocusHeight;
            }
            return UnfocusedHeight;
        };
        Delegate.prototype.getTemplateId = function (element) {
            return 'suggestion';
        };
        return Delegate;
    }());
    function computeScore(suggestion, currentWord, currentWordLowerCase) {
        var suggestionLowerCase = suggestion.toLowerCase();
        var score = 0;
        for (var i = 0; i < currentWord.length && i < suggestion.length; i++) {
            if (currentWord[i] === suggestion[i]) {
                score += 2;
            }
            else if (currentWordLowerCase[i] === suggestionLowerCase[i]) {
                score += 1;
            }
            else {
                break;
            }
        }
        return score;
    }
    var State;
    (function (State) {
        State[State["Hidden"] = 0] = "Hidden";
        State[State["Loading"] = 1] = "Loading";
        State[State["Empty"] = 2] = "Empty";
        State[State["Open"] = 3] = "Open";
        State[State["Frozen"] = 4] = "Frozen";
        State[State["Details"] = 5] = "Details";
    })(State || (State = {}));
    var SuggestionDetails = (function () {
        function SuggestionDetails(container, widget) {
            this.widget = widget;
            this.el = dom_1.append(container, dom_1.emmet('.details'));
            var header = dom_1.append(this.el, dom_1.emmet('.header'));
            this.title = dom_1.append(header, dom_1.emmet('span.title'));
            this.back = dom_1.append(header, dom_1.emmet('span.go-back.octicon.octicon-mail-reply'));
            this.back.title = nls.localize(3, null);
            this.body = dom_1.emmet('.body');
            this.scrollable = new domNodeScrollable_1.DomNodeScrollable(this.body);
            this.scrollbar = new scrollableElementImpl_1.ScrollableElement(this.body, this.scrollable, {});
            dom_1.append(this.el, this.scrollbar.getDomNode());
            this.type = dom_1.append(this.body, dom_1.emmet('p.type'));
            this.docs = dom_1.append(this.body, dom_1.emmet('p.docs'));
            this.ariaLabel = null;
        }
        Object.defineProperty(SuggestionDetails.prototype, "element", {
            get: function () {
                return this.el;
            },
            enumerable: true,
            configurable: true
        });
        SuggestionDetails.prototype.render = function (item) {
            var _this = this;
            if (!item) {
                this.title.textContent = '';
                this.type.textContent = '';
                this.docs.textContent = '';
                this.ariaLabel = null;
                return;
            }
            this.title.innerText = item.suggestion.label;
            this.type.innerText = item.suggestion.typeLabel || '';
            this.docs.innerText = item.suggestion.documentationLabel;
            this.back.onmousedown = function (e) {
                e.preventDefault();
                e.stopPropagation();
            };
            this.back.onclick = function (e) {
                e.preventDefault();
                e.stopPropagation();
                _this.widget.toggleDetails();
            };
            this.scrollbar.onElementDimensions();
            this.scrollable.onContentsDimensions();
            this.ariaLabel = strings.format('{0}\n{1}\n{2}', item.suggestion.label || '', item.suggestion.typeLabel || '', item.suggestion.documentationLabel || '');
        };
        SuggestionDetails.prototype.getAriaLabel = function () {
            return this.ariaLabel;
        };
        SuggestionDetails.prototype.scrollDown = function (much) {
            if (much === void 0) { much = 8; }
            this.body.scrollTop += much;
        };
        SuggestionDetails.prototype.scrollUp = function (much) {
            if (much === void 0) { much = 8; }
            this.body.scrollTop -= much;
        };
        SuggestionDetails.prototype.pageDown = function () {
            this.scrollDown(80);
        };
        SuggestionDetails.prototype.pageUp = function () {
            this.scrollUp(80);
        };
        SuggestionDetails.prototype.dispose = function () {
            this.scrollbar.dispose();
            this.scrollable.dispose();
            this.el.parentElement.removeChild(this.el);
            this.el = null;
        };
        return SuggestionDetails;
    }());
    var SuggestWidget = (function () {
        function SuggestWidget(editor, model, keybindingService, telemetryService, instantiationService) {
            var _this = this;
            this.editor = editor;
            this.model = model;
            this.allowEditorOverflow = true; // Editor.IContentWidget.allowEditorOverflow
            this._onDidVisibilityChange = new event_1.Emitter();
            this.isAuto = false;
            this.focusedItem = null;
            this.suggestionSupportsAutoAccept = keybindingService.createKey(suggest_1.CONTEXT_SUGGESTION_SUPPORTS_ACCEPT_ON_KEY, true);
            this.telemetryData = null;
            this.telemetryService = telemetryService;
            this.element = dom_1.emmet('.editor-widget.suggest-widget.monaco-editor-background');
            this.element.style.width = SuggestWidget.WIDTH + 'px';
            this.element.style.top = '0';
            this.element.style.left = '0';
            if (!this.editor.getConfiguration().iconsInSuggestions) {
                dom_1.addClass(this.element, 'no-icons');
            }
            this.messageElement = dom_1.append(this.element, dom_1.emmet('.message'));
            this.listElement = dom_1.append(this.element, dom_1.emmet('.tree'));
            this.details = new SuggestionDetails(this.element, this);
            var renderer = instantiationService.createInstance(Renderer, this);
            this.delegate = new Delegate(function () { return _this.list; });
            this.list = new listWidget_1.List(this.listElement, this.delegate, [renderer]);
            this.toDispose = [
                editor.addListener2(editorCommon_1.EventType.ModelChanged, function () { return _this.onModelModeChanged(); }),
                editor.addListener2(editorCommon_1.EventType.ModelModeChanged, function () { return _this.onModelModeChanged(); }),
                editor.addListener2(editorCommon_1.EventType.ModelModeSupportChanged, function (e) { return e.suggestSupport && _this.onModelModeChanged(); }),
                modes_1.SuggestRegistry.onDidChange(function () { return _this.onModelModeChanged(); }),
                editor.addListener2(editorCommon_1.EventType.EditorTextBlur, function () { return _this.onEditorBlur(); }),
                this.list.onSelectionChange(function (e) { return _this.onListSelection(e); }),
                this.list.onFocusChange(function (e) { return _this.onListFocus(e); }),
                this.editor.addListener2(editorCommon_1.EventType.CursorSelectionChanged, function () { return _this.onCursorSelectionChanged(); }),
                this.model.onDidTrigger(function (e) { return _this.onDidTrigger(e); }),
                this.model.onDidSuggest(function (e) { return _this.onDidSuggest(e); }),
                this.model.onDidCancel(function (e) { return _this.onDidCancel(e); })
            ];
            this.onModelModeChanged();
            this.editor.addContentWidget(this);
            this.setState(State.Hidden);
            // TODO@Alex: this is useful, but spammy
            // var isVisible = false;
            // this.onDidVisibilityChange((newIsVisible) => {
            // 	if (isVisible === newIsVisible) {
            // 		return;
            // 	}
            // 	isVisible = newIsVisible;
            // 	if (isVisible) {
            // 		alert(nls.localize('suggestWidgetAriaVisible', "Suggestions opened"));
            // 	} else {
            // 		alert(nls.localize('suggestWidgetAriaInvisible', "Suggestions closed"));
            // 	}
            // });
        }
        Object.defineProperty(SuggestWidget.prototype, "onDidVisibilityChange", {
            get: function () { return this._onDidVisibilityChange.event; },
            enumerable: true,
            configurable: true
        });
        SuggestWidget.prototype.onCursorSelectionChanged = function () {
            if (this.state === State.Hidden) {
                return;
            }
            this.editor.layoutContentWidget(this);
        };
        SuggestWidget.prototype.onEditorBlur = function () {
            var _this = this;
            this.editorBlurTimeout = winjs_base_1.TPromise.timeout(150).then(function () {
                if (!_this.editor.isFocused()) {
                    _this.setState(State.Hidden);
                }
            });
        };
        SuggestWidget.prototype.onListSelection = function (e) {
            if (!e.elements.length) {
                return;
            }
            this.telemetryData.selectedIndex = 0;
            this.telemetryData.wasCancelled = false;
            this.telemetryData.selectedIndex = e.indexes[0];
            this.submitTelemetryData();
            var item = e.elements[0];
            var container = item.container;
            var overwriteBefore = (typeof item.suggestion.overwriteBefore === 'undefined') ? container.currentWord.length : item.suggestion.overwriteBefore;
            var overwriteAfter = (typeof item.suggestion.overwriteAfter === 'undefined') ? 0 : Math.max(0, item.suggestion.overwriteAfter);
            this.model.accept(item.suggestion, overwriteBefore, overwriteAfter);
            aria_1.alert(nls.localize(6, null, item.suggestion.label));
            this.editor.focus();
        };
        SuggestWidget.prototype._getSuggestionAriaAlertLabel = function (item) {
            if (item.suggestion.documentationLabel) {
                return nls.localize(7, null, item.suggestion.label);
            }
            else {
                return nls.localize(8, null, item.suggestion.label);
            }
        };
        SuggestWidget.prototype._ariaAlert = function (newAriaAlertLabel) {
            if (this._lastAriaAlertLabel === newAriaAlertLabel) {
                return;
            }
            this._lastAriaAlertLabel = newAriaAlertLabel;
            if (this._lastAriaAlertLabel) {
                aria_1.alert(this._lastAriaAlertLabel);
            }
        };
        SuggestWidget.prototype.onListFocus = function (e) {
            var _this = this;
            if (this.currentSuggestionDetails) {
                this.currentSuggestionDetails.cancel();
                this.currentSuggestionDetails = null;
            }
            if (!e.elements.length) {
                this._ariaAlert(null);
                // TODO@Alex: Chromium bug
                // this.editor.setAriaActiveDescendant(null);
                return;
            }
            var item = e.elements[0];
            this._ariaAlert(this._getSuggestionAriaAlertLabel(item));
            // TODO@Alex: Chromium bug
            // // TODO@Alex: the list is not done rendering...
            // setTimeout(() => {
            // 	this.editor.setAriaActiveDescendant(this.list.getElementId(e.indexes[0]));
            // }, 100);
            if (item === this.focusedItem) {
                return;
            }
            var index = e.indexes[0];
            this.suggestionSupportsAutoAccept.set(!item.suggestion.noAutoAccept);
            this.focusedItem = item;
            this.list.setFocus(index);
            this.updateWidgetHeight();
            this.list.reveal(index);
            var resource = this.editor.getModel().getAssociatedResource();
            var position = this.model.getRequestPosition() || this.editor.getPosition();
            this.currentSuggestionDetails = item.resolveDetails(resource, position)
                .then(function (details) {
                item.updateDetails(details);
                _this.list.setFocus(index);
                _this.updateWidgetHeight();
                _this.list.reveal(index);
                _this._ariaAlert(_this._getSuggestionAriaAlertLabel(item));
            })
                .then(null, function (err) { return !errors_1.isPromiseCanceledError(err) && errors_1.onUnexpectedError(err); })
                .then(function () { return _this.currentSuggestionDetails = null; });
        };
        SuggestWidget.prototype.onModelModeChanged = function () {
            var model = this.editor.getModel();
            var supports = modes_1.SuggestRegistry.all(model);
            this.shouldShowEmptySuggestionList = supports.some(function (s) { return s.shouldShowEmptySuggestionList(); });
        };
        SuggestWidget.prototype.setState = function (state) {
            var stateChanged = this.state !== state;
            this.state = state;
            dom_1.toggleClass(this.element, 'frozen', state === State.Frozen);
            switch (state) {
                case State.Hidden:
                    dom_1.hide(this.messageElement, this.details.element);
                    dom_1.show(this.listElement);
                    this.hide();
                    if (stateChanged) {
                        this.list.splice(0, this.list.length);
                    }
                    break;
                case State.Loading:
                    this.messageElement.innerText = SuggestWidget.LOADING_MESSAGE;
                    dom_1.hide(this.listElement, this.details.element);
                    dom_1.show(this.messageElement);
                    this.show();
                    break;
                case State.Empty:
                    this.messageElement.innerText = SuggestWidget.NO_SUGGESTIONS_MESSAGE;
                    dom_1.hide(this.listElement, this.details.element);
                    dom_1.show(this.messageElement);
                    this.show();
                    break;
                case State.Open:
                    dom_1.hide(this.messageElement, this.details.element);
                    dom_1.show(this.listElement);
                    this.show();
                    break;
                case State.Frozen:
                    dom_1.hide(this.messageElement, this.details.element);
                    dom_1.show(this.listElement);
                    this.show();
                    break;
                case State.Details:
                    dom_1.hide(this.messageElement, this.listElement);
                    dom_1.show(this.details.element);
                    this.show();
                    this._ariaAlert(this.details.getAriaLabel());
                    break;
            }
            if (stateChanged) {
                this.editor.layoutContentWidget(this);
            }
        };
        SuggestWidget.prototype.onDidTrigger = function (e) {
            var _this = this;
            if (this.state !== State.Hidden) {
                return;
            }
            this.telemetryTimer = this.telemetryService.timedPublicLog('suggestWidgetLoadingTime');
            this.isAuto = !!e.auto;
            if (!this.isAuto) {
                this.loadingTimeout = setTimeout(function () {
                    _this.loadingTimeout = null;
                    _this.setState(State.Loading);
                }, 50);
            }
            if (!e.retrigger) {
                this.telemetryData = {
                    wasAutomaticallyTriggered: e.characterTriggered
                };
            }
        };
        SuggestWidget.prototype.onDidSuggest = function (e) {
            if (this.loadingTimeout) {
                clearTimeout(this.loadingTimeout);
                this.loadingTimeout = null;
            }
            this.completionModel = e.completionModel;
            if (e.isFrozen && this.state !== State.Empty) {
                this.setState(State.Frozen);
                return;
            }
            var visibleCount = this.completionModel.items.length;
            var isEmpty = visibleCount === 0;
            if (isEmpty) {
                if (e.auto) {
                    this.setState(State.Hidden);
                }
                else {
                    if (this.shouldShowEmptySuggestionList) {
                        this.setState(State.Empty);
                    }
                    else {
                        this.setState(State.Hidden);
                    }
                }
                this.completionModel = null;
            }
            else {
                var currentWord_1 = e.currentWord;
                var currentWordLowerCase_1 = currentWord_1.toLowerCase();
                var bestSuggestionIndex_1 = -1;
                var bestScore_1 = -1;
                this.completionModel.items.forEach(function (item, index) {
                    var score = computeScore(item.suggestion.label, currentWord_1, currentWordLowerCase_1);
                    if (score > bestScore_1) {
                        bestScore_1 = score;
                        bestSuggestionIndex_1 = index;
                    }
                });
                this.telemetryData = this.telemetryData || {};
                this.telemetryData.suggestionCount = this.completionModel.items.length;
                this.telemetryData.suggestedIndex = bestSuggestionIndex_1;
                this.telemetryData.hintLength = currentWord_1.length;
                (_a = this.list).splice.apply(_a, [0, this.list.length].concat(this.completionModel.items));
                this.list.setFocus(bestSuggestionIndex_1);
                this.list.reveal(bestSuggestionIndex_1, 0);
                this.setState(State.Open);
            }
            if (this.telemetryTimer) {
                this.telemetryTimer.data = { reason: isEmpty ? 'empty' : 'results' };
                this.telemetryTimer.stop();
                this.telemetryTimer = null;
            }
            var _a;
        };
        SuggestWidget.prototype.onDidCancel = function (e) {
            if (this.loadingTimeout) {
                clearTimeout(this.loadingTimeout);
                this.loadingTimeout = null;
            }
            if (!e.retrigger) {
                this.setState(State.Hidden);
                if (this.telemetryData) {
                    this.telemetryData.selectedIndex = -1;
                    this.telemetryData.wasCancelled = true;
                    this.submitTelemetryData();
                }
            }
            if (this.telemetryTimer) {
                this.telemetryTimer.data = { reason: 'cancel' };
                this.telemetryTimer.stop();
                this.telemetryTimer = null;
            }
        };
        SuggestWidget.prototype.selectNextPage = function () {
            switch (this.state) {
                case State.Hidden:
                    return false;
                case State.Details:
                    this.details.pageDown();
                    return true;
                case State.Loading:
                    return !this.isAuto;
                default:
                    this.list.focusNextPage();
                    return true;
            }
        };
        SuggestWidget.prototype.selectNext = function () {
            switch (this.state) {
                case State.Hidden:
                    return false;
                case State.Details:
                    this.details.scrollDown();
                    return true;
                case State.Loading:
                    return !this.isAuto;
                default:
                    this.list.focusNext(1, true);
                    return true;
            }
        };
        SuggestWidget.prototype.selectPreviousPage = function () {
            switch (this.state) {
                case State.Hidden:
                    return false;
                case State.Details:
                    this.details.pageUp();
                    return true;
                case State.Loading:
                    return !this.isAuto;
                default:
                    this.list.focusPreviousPage();
                    return true;
            }
        };
        SuggestWidget.prototype.selectPrevious = function () {
            switch (this.state) {
                case State.Hidden:
                    return false;
                case State.Details:
                    this.details.scrollUp();
                    return true;
                case State.Loading:
                    return !this.isAuto;
                default:
                    this.list.focusPrevious(1, true);
                    return true;
            }
        };
        SuggestWidget.prototype.acceptSelectedSuggestion = function () {
            switch (this.state) {
                case State.Hidden:
                    return false;
                case State.Loading:
                    return !this.isAuto;
                default:
                    var focus_1 = this.list.getFocus()[0];
                    if (focus_1) {
                        this.list.setSelection(this.completionModel.items.indexOf(focus_1));
                    }
                    else {
                        this.model.cancel();
                    }
                    return true;
            }
        };
        SuggestWidget.prototype.toggleDetails = function () {
            if (this.state === State.Details) {
                this.setState(State.Open);
                this.editor.focus();
                return;
            }
            if (this.state !== State.Open) {
                return;
            }
            var item = this.list.getFocus()[0];
            if (!item || !item.suggestion.documentationLabel) {
                return;
            }
            this.setState(State.Details);
            this.editor.focus();
        };
        SuggestWidget.prototype.show = function () {
            var _this = this;
            this.updateWidgetHeight();
            this._onDidVisibilityChange.fire(true);
            this.renderDetails();
            this.showTimeout = winjs_base_1.TPromise.timeout(100).then(function () {
                dom_1.addClass(_this.element, 'visible');
            });
        };
        SuggestWidget.prototype.hide = function () {
            this._onDidVisibilityChange.fire(false);
            dom_1.removeClass(this.element, 'visible');
        };
        SuggestWidget.prototype.cancel = function () {
            if (this.state === State.Details) {
                this.toggleDetails();
            }
            else {
                this.model.cancel();
            }
        };
        SuggestWidget.prototype.getPosition = function () {
            if (this.state === State.Hidden) {
                return null;
            }
            return {
                position: this.editor.getPosition(),
                preference: [editorBrowser_1.ContentWidgetPositionPreference.BELOW, editorBrowser_1.ContentWidgetPositionPreference.ABOVE]
            };
        };
        SuggestWidget.prototype.getDomNode = function () {
            return this.element;
        };
        SuggestWidget.prototype.getId = function () {
            return SuggestWidget.ID;
        };
        SuggestWidget.prototype.submitTelemetryData = function () {
            this.telemetryService.publicLog('suggestWidget', this.telemetryData);
            this.telemetryData = null;
        };
        SuggestWidget.prototype.updateWidgetHeight = function () {
            var height = 0;
            if (this.state === State.Empty || this.state === State.Loading) {
                height = UnfocusedHeight;
            }
            else if (this.state === State.Details) {
                height = 12 * UnfocusedHeight;
            }
            else {
                var focus_2 = this.list.getFocus()[0];
                var focusHeight = focus_2 ? this.delegate.getHeight(focus_2) : UnfocusedHeight;
                height = focusHeight;
                var suggestionCount = (this.list.contentHeight - focusHeight) / UnfocusedHeight;
                height += Math.min(suggestionCount, 11) * UnfocusedHeight;
            }
            this.element.style.height = height + 'px';
            this.list.layout(height);
            this.editor.layoutContentWidget(this);
            return height;
        };
        SuggestWidget.prototype.renderDetails = function () {
            if (this.state !== State.Details) {
                this.details.render(null);
            }
            else {
                this.details.render(this.list.getFocus()[0]);
            }
        };
        SuggestWidget.prototype.dispose = function () {
            this.state = null;
            this.suggestionSupportsAutoAccept = null;
            this.currentSuggestionDetails = null;
            this.focusedItem = null;
            this.telemetryData = null;
            this.telemetryService = null;
            this.telemetryTimer = null;
            this.element = null;
            this.messageElement = null;
            this.listElement = null;
            this.details.dispose();
            this.details = null;
            this.list.dispose();
            this.list = null;
            this.toDispose = lifecycle_1.dispose(this.toDispose);
            this._onDidVisibilityChange.dispose();
            this._onDidVisibilityChange = null;
            if (this.loadingTimeout) {
                clearTimeout(this.loadingTimeout);
                this.loadingTimeout = null;
            }
            if (this.editorBlurTimeout) {
                this.editorBlurTimeout.cancel();
                this.editorBlurTimeout = null;
            }
            if (this.showTimeout) {
                this.showTimeout.cancel();
                this.showTimeout = null;
            }
        };
        SuggestWidget.ID = 'editor.widget.suggestWidget';
        SuggestWidget.WIDTH = 438;
        SuggestWidget.LOADING_MESSAGE = nls.localize(4, null);
        SuggestWidget.NO_SUGGESTIONS_MESSAGE = nls.localize(5, null);
        SuggestWidget = __decorate([
            __param(2, keybindingService_1.IKeybindingService),
            __param(3, telemetry_1.ITelemetryService),
            __param(4, instantiation_1.IInstantiationService)
        ], SuggestWidget);
        return SuggestWidget;
    }());
    exports.SuggestWidget = SuggestWidget;
});
//# sourceMappingURL=suggestWidget.js.map