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
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/nls!vs/workbench/parts/search/browser/searchViewlet', 'vs/editor/common/editorCommon', 'vs/base/common/lifecycle', 'vs/base/common/errors', 'vs/base/browser/ui/aria/aria', 'vs/base/common/glob', 'vs/base/common/types', 'vs/base/common/strings', 'vs/base/common/paths', 'vs/base/browser/dom', 'vs/base/common/actions', 'vs/base/browser/keyboardEvent', 'vs/base/common/timer', 'vs/base/browser/builder', 'vs/base/browser/ui/filelabel/fileLabel', 'vs/base/browser/ui/findinput/findInput', 'vs/base/browser/ui/leftRightWidget/leftRightWidget', 'vs/base/browser/ui/countBadge/countBadge', 'vs/base/parts/tree/browser/treeImpl', 'vs/base/parts/tree/browser/treeDefaults', 'vs/base/parts/tree/browser/actionsRenderer', 'vs/workbench/browser/actionBarRegistry', 'vs/workbench/common/memento', 'vs/workbench/browser/actions/openSettings', 'vs/workbench/common/events', 'vs/workbench/parts/files/common/files', 'vs/platform/files/common/files', 'vs/workbench/browser/viewlet', 'vs/workbench/parts/search/common/searchModel', 'vs/workbench/parts/search/common/searchQuery', 'vs/base/browser/ui/checkbox/checkbox', 'vs/workbench/parts/search/browser/search.contribution', 'vs/base/browser/ui/inputbox/inputBox', 'vs/workbench/services/editor/common/editorService', 'vs/workbench/services/viewlet/common/viewletService', 'vs/editor/common/core/range', 'vs/platform/storage/common/storage', 'vs/platform/configuration/common/configuration', 'vs/platform/contextview/browser/contextView', 'vs/platform/event/common/event', 'vs/platform/instantiation/common/instantiation', 'vs/platform/message/common/message', 'vs/platform/search/common/search', 'vs/platform/progress/common/progress', 'vs/platform/workspace/common/workspace', 'vs/platform/selection/common/selection', 'vs/platform/keybinding/common/keybindingService', 'vs/platform/telemetry/common/telemetry', 'vs/base/common/keyCodes', 'vs/css!./media/searchviewlet'], function (require, exports, winjs_base_1, nls, editorCommon_1, lifecycle, errors, aria, glob_1, types_1, strings, paths, dom, actions_1, keyboardEvent_1, timer, builder_1, fileLabel_1, findInput_1, leftRightWidget_1, countBadge_1, treeImpl_1, treeDefaults_1, actionsRenderer_1, actionBarRegistry_1, memento_1, openSettings_1, events_1, files_1, files_2, viewlet_1, searchModel_1, searchQuery_1, checkbox_1, search_contribution_1, inputBox_1, editorService_1, viewletService_1, range_1, storage_1, configuration_1, contextView_1, event_1, instantiation_1, message_1, search_1, progress_1, workspace_1, selection_1, keybindingService_1, telemetry_1, keyCodes_1) {
    'use strict';
    var ID = search_contribution_1.VIEWLET_ID;
    var FindInFolderAction = (function (_super) {
        __extends(FindInFolderAction, _super);
        function FindInFolderAction(resource, viewletService) {
            _super.call(this, 'workbench.search.action.findInFolder', nls.localize(0, null));
            this.viewletService = viewletService;
            this.resource = resource;
        }
        FindInFolderAction.prototype.run = function (event) {
            var _this = this;
            return this.viewletService.openViewlet(ID, true).then(function (viewlet) {
                viewlet.searchInFolder(_this.resource);
            });
        };
        FindInFolderAction = __decorate([
            __param(1, viewletService_1.IViewletService)
        ], FindInFolderAction);
        return FindInFolderAction;
    }(actions_1.Action));
    exports.FindInFolderAction = FindInFolderAction;
    var SearchDataSource = (function () {
        function SearchDataSource() {
        }
        SearchDataSource.prototype.getId = function (tree, element) {
            if (element instanceof searchModel_1.FileMatch) {
                return element.id();
            }
            if (element instanceof searchModel_1.Match) {
                return element.id();
            }
            return 'root';
        };
        SearchDataSource.prototype.getChildren = function (tree, element) {
            var value = [];
            if (element instanceof searchModel_1.FileMatch) {
                value = element.matches();
            }
            else if (element instanceof searchModel_1.SearchResult) {
                value = element.matches();
            }
            return winjs_base_1.TPromise.as(value);
        };
        SearchDataSource.prototype.hasChildren = function (tree, element) {
            return element instanceof searchModel_1.FileMatch || element instanceof searchModel_1.SearchResult;
        };
        SearchDataSource.prototype.getParent = function (tree, element) {
            var value = null;
            if (element instanceof searchModel_1.Match) {
                value = element.parent();
            }
            else if (element instanceof searchModel_1.FileMatch) {
                value = element.parent();
            }
            return winjs_base_1.TPromise.as(value);
        };
        return SearchDataSource;
    }());
    exports.SearchDataSource = SearchDataSource;
    var SearchSorter = (function () {
        function SearchSorter() {
        }
        SearchSorter.prototype.compare = function (tree, elementA, elementB) {
            if (elementA instanceof searchModel_1.FileMatch && elementB instanceof searchModel_1.FileMatch) {
                return strings.localeCompare(elementA.resource().fsPath, elementB.resource().fsPath) || strings.localeCompare(elementA.name(), elementB.name());
            }
            if (elementA instanceof searchModel_1.Match && elementB instanceof searchModel_1.Match) {
                return range_1.Range.compareRangesUsingStarts(elementA.range(), elementB.range());
            }
        };
        return SearchSorter;
    }());
    exports.SearchSorter = SearchSorter;
    var SearchAccessibilityProvider = (function () {
        function SearchAccessibilityProvider(contextService) {
            this.contextService = contextService;
        }
        SearchAccessibilityProvider.prototype.getAriaLabel = function (tree, element) {
            if (element instanceof searchModel_1.FileMatch) {
                var path = this.contextService.toWorkspaceRelativePath(element.resource()) || element.resource().fsPath;
                return nls.localize(1, null, element.count(), element.name(), paths.dirname(path));
            }
            if (element instanceof searchModel_1.Match) {
                return nls.localize(2, null, element.text());
            }
        };
        SearchAccessibilityProvider = __decorate([
            __param(0, workspace_1.IWorkspaceContextService)
        ], SearchAccessibilityProvider);
        return SearchAccessibilityProvider;
    }());
    exports.SearchAccessibilityProvider = SearchAccessibilityProvider;
    var SearchController = (function (_super) {
        __extends(SearchController, _super);
        function SearchController(viewlet) {
            var _this = this;
            _super.call(this, { clickBehavior: treeDefaults_1.ClickBehavior.ON_MOUSE_DOWN });
            this.viewlet = viewlet;
            this.downKeyBindingDispatcher.set(keyCodes_1.CommonKeybindings.DELETE, function (tree, event) { _this.onDelete(tree, event); });
            this.downKeyBindingDispatcher.set(keyCodes_1.CommonKeybindings.ESCAPE, function (tree, event) { _this.onEscape(tree, event); });
        }
        SearchController.prototype.onEscape = function (tree, event) {
            if (this.viewlet.cancelSearch()) {
                return true;
            }
            return _super.prototype.onEscape.call(this, tree, event);
        };
        SearchController.prototype.onDelete = function (tree, event) {
            var result = false;
            var elements = tree.getSelection();
            for (var i = 0; i < elements.length; i++) {
                var element = elements[i];
                if (element instanceof searchModel_1.FileMatch) {
                    new RemoveAction(tree, element).run().done(null, errors.onUnexpectedError);
                    result = true;
                }
            }
            return result;
        };
        return SearchController;
    }(treeDefaults_1.DefaultController));
    var SearchFilter = (function () {
        function SearchFilter() {
        }
        SearchFilter.prototype.isVisible = function (tree, element) {
            return !(element instanceof searchModel_1.FileMatch) || element.matches().length > 0;
        };
        return SearchFilter;
    }());
    var SearchActionProvider = (function (_super) {
        __extends(SearchActionProvider, _super);
        function SearchActionProvider() {
            _super.apply(this, arguments);
        }
        SearchActionProvider.prototype.hasActions = function (tree, element) {
            return element instanceof searchModel_1.FileMatch || _super.prototype.hasActions.call(this, tree, element);
        };
        SearchActionProvider.prototype.getActions = function (tree, element) {
            return _super.prototype.getActions.call(this, tree, element).then(function (actions) {
                if (element instanceof searchModel_1.FileMatch) {
                    actions.unshift(new RemoveAction(tree, element));
                }
                return actions;
            });
        };
        return SearchActionProvider;
    }(actionBarRegistry_1.ContributableActionProvider));
    var RemoveAction = (function (_super) {
        __extends(RemoveAction, _super);
        function RemoveAction(viewer, element) {
            _super.call(this, 'remove', nls.localize(3, null), 'action-remove');
            this.viewer = viewer;
            this.fileMatch = element;
        }
        RemoveAction.prototype.run = function () {
            var parent = this.fileMatch.parent();
            parent.remove(this.fileMatch);
            return this.viewer.refresh(parent);
        };
        return RemoveAction;
    }(actions_1.Action));
    var SearchRenderer = (function (_super) {
        __extends(SearchRenderer, _super);
        function SearchRenderer(actionRunner, contextService) {
            _super.call(this, {
                actionProvider: new SearchActionProvider(),
                actionRunner: actionRunner
            });
            this.contextService = contextService;
        }
        SearchRenderer.prototype.getContentHeight = function (tree, element) {
            return 22;
        };
        SearchRenderer.prototype.renderContents = function (tree, element, domElement, previousCleanupFn) {
            var _this = this;
            // File
            if (element instanceof searchModel_1.FileMatch) {
                var fileMatch_1 = element;
                var container = builder_1.$('.filematch');
                var leftRenderer = void 0;
                var rightRenderer = void 0;
                var widget = void 0;
                leftRenderer = function (left) {
                    new fileLabel_1.FileLabel(left, fileMatch_1.resource(), _this.contextService);
                    return null;
                };
                rightRenderer = function (right) {
                    var len = fileMatch_1.count();
                    return new countBadge_1.CountBadge(right, len, len > 1 ? nls.localize(4, null, len) : nls.localize(5, null, len));
                };
                widget = new leftRightWidget_1.LeftRightWidget(container, leftRenderer, rightRenderer);
                container.appendTo(domElement);
                return widget.dispose.bind(widget);
            }
            else if (element instanceof searchModel_1.EmptyMatch) {
                dom.addClass(domElement, 'linematch');
                builder_1.$('a.plain.label').innerHtml(nls.localize(6, null)).appendTo(domElement);
            }
            else if (element instanceof searchModel_1.Match) {
                dom.addClass(domElement, 'linematch');
                var elements = [];
                var preview = element.preview();
                elements.push('<span>');
                elements.push(strings.escape(preview.before));
                elements.push('</span><span class="findInFileMatch">');
                elements.push(strings.escape(preview.inside));
                elements.push('</span><span>');
                elements.push(strings.escape(preview.after));
                elements.push('</span>');
                builder_1.$('a.plain').innerHtml(elements.join(strings.empty)).appendTo(domElement);
            }
            return null;
        };
        SearchRenderer = __decorate([
            __param(1, workspace_1.IWorkspaceContextService)
        ], SearchRenderer);
        return SearchRenderer;
    }(actionsRenderer_1.ActionsRenderer));
    var RefreshAction = (function (_super) {
        __extends(RefreshAction, _super);
        function RefreshAction(viewlet) {
            _super.call(this, 'refresh');
            this.label = nls.localize(7, null);
            this.enabled = false;
            this.class = 'search-action refresh';
            this.viewlet = viewlet;
        }
        RefreshAction.prototype.run = function () {
            this.viewlet.onQueryChanged(true);
            return winjs_base_1.TPromise.as(null);
        };
        return RefreshAction;
    }(actions_1.Action));
    exports.RefreshAction = RefreshAction;
    var SelectOrRemoveAction = (function (_super) {
        __extends(SelectOrRemoveAction, _super);
        function SelectOrRemoveAction(viewlet) {
            _super.call(this, 'selectOrRemove');
            this.label = nls.localize(8, null);
            this.enabled = false;
            this.selectMode = true;
            this.viewlet = viewlet;
        }
        SelectOrRemoveAction.prototype.run = function () {
            var result;
            if (this.selectMode) {
                result = this.runAsSelect();
            }
            else {
                result = this.runAsRemove();
            }
            this.selectMode = !this.selectMode;
            this.label = this.selectMode ? nls.localize(9, null) : nls.localize(10, null);
            return result;
        };
        SelectOrRemoveAction.prototype.runAsSelect = function () {
            this.viewlet.getResults().addClass('select');
            return winjs_base_1.TPromise.as(null);
        };
        SelectOrRemoveAction.prototype.runAsRemove = function () {
            var elements = [];
            var tree = this.viewlet.getControl();
            tree.getInput().matches().forEach(function (fileMatch) {
                fileMatch.matches().filter(function (lineMatch) {
                    return lineMatch.$checked;
                }).forEach(function (lineMatch) {
                    lineMatch.parent().remove(lineMatch);
                    elements.push(lineMatch.parent());
                });
            });
            this.viewlet.getResults().removeClass('select');
            if (elements.length > 0) {
                return tree.refreshAll(elements).then(function () {
                    return tree.refresh();
                });
            }
            return winjs_base_1.TPromise.as(null);
        };
        return SelectOrRemoveAction;
    }(actions_1.Action));
    exports.SelectOrRemoveAction = SelectOrRemoveAction;
    var CollapseAllAction = (function (_super) {
        __extends(CollapseAllAction, _super);
        function CollapseAllAction(viewlet) {
            _super.call(this, 'collapseAll');
            this.label = nls.localize(11, null);
            this.enabled = false;
            this.class = 'search-action collapse';
            this.viewlet = viewlet;
        }
        CollapseAllAction.prototype.run = function () {
            var tree = this.viewlet.getControl();
            if (tree) {
                tree.collapseAll();
                tree.clearSelection();
                tree.clearFocus();
                tree.DOMFocus();
                tree.focusFirst();
            }
            return winjs_base_1.TPromise.as(null);
        };
        return CollapseAllAction;
    }(actions_1.Action));
    exports.CollapseAllAction = CollapseAllAction;
    var ClearSearchResultsAction = (function (_super) {
        __extends(ClearSearchResultsAction, _super);
        function ClearSearchResultsAction(viewlet) {
            _super.call(this, 'clearSearchResults');
            this.label = nls.localize(12, null);
            this.enabled = false;
            this.class = 'search-action clear-search-results';
            this.viewlet = viewlet;
        }
        ClearSearchResultsAction.prototype.run = function () {
            this.viewlet.clearSearchResults();
            return winjs_base_1.TPromise.as(null);
        };
        return ClearSearchResultsAction;
    }(actions_1.Action));
    exports.ClearSearchResultsAction = ClearSearchResultsAction;
    var ConfigureGlobalExclusionsAction = (function (_super) {
        __extends(ConfigureGlobalExclusionsAction, _super);
        function ConfigureGlobalExclusionsAction(instantiationService) {
            _super.call(this, 'configureGlobalExclusionsAction');
            this.instantiationService = instantiationService;
            this.label = nls.localize(13, null);
            this.enabled = true;
            this.class = 'search-configure-exclusions';
        }
        ConfigureGlobalExclusionsAction.prototype.run = function () {
            var action = this.instantiationService.createInstance(openSettings_1.OpenGlobalSettingsAction, openSettings_1.OpenGlobalSettingsAction.ID, openSettings_1.OpenGlobalSettingsAction.LABEL);
            action.run().done(function () { return action.dispose(); }, errors.onUnexpectedError);
            return winjs_base_1.TPromise.as(null);
        };
        ConfigureGlobalExclusionsAction = __decorate([
            __param(0, instantiation_1.IInstantiationService)
        ], ConfigureGlobalExclusionsAction);
        return ConfigureGlobalExclusionsAction;
    }(actions_1.Action));
    var PatternInput = (function () {
        function PatternInput(parent, contextViewProvider, options) {
            if (options === void 0) { options = Object.create(null); }
            this.contextViewProvider = contextViewProvider;
            this.onOptionChange = null;
            this.width = options.width || 100;
            this.placeholder = options.placeholder || '';
            this.ariaLabel = options.ariaLabel || nls.localize(14, null);
            this.listenersToRemove = [];
            this.pattern = null;
            this.domNode = null;
            this.inputNode = null;
            this.inputBox = null;
            this.buildDomNode();
            if (Boolean(parent)) {
                parent.appendChild(this.domNode);
            }
        }
        PatternInput.prototype.destroy = function () {
            this.pattern.dispose();
            this.listenersToRemove.forEach(function (element) {
                element();
            });
            this.listenersToRemove = [];
        };
        PatternInput.prototype.on = function (eventType, handler) {
            switch (eventType) {
                case 'keydown':
                case 'keyup':
                    builder_1.$(this.inputBox.inputElement).on(eventType, handler);
                    break;
                case PatternInput.OPTION_CHANGE:
                    this.onOptionChange = handler;
                    break;
            }
            return this;
        };
        PatternInput.prototype.setWidth = function (newWidth) {
            this.width = newWidth;
            this.domNode.style.width = this.width + 'px';
            this.contextViewProvider.layout();
            this.setInputWidth();
        };
        PatternInput.prototype.getValue = function () {
            return this.inputBox.value;
        };
        PatternInput.prototype.setValue = function (value) {
            if (this.inputBox.value !== value) {
                this.inputBox.value = value;
            }
        };
        PatternInput.prototype.getGlob = function () {
            var pattern = this.getValue();
            var isGlobPattern = this.isGlobPattern();
            if (!pattern) {
                return void 0;
            }
            var glob = Object.create(null);
            var segments;
            if (isGlobPattern) {
                segments = glob_1.splitGlobAware(pattern, ',').map(function (s) { return s.trim(); }).filter(function (s) { return !!s.length; });
            }
            else {
                segments = pattern.split(',').map(function (s) { return strings.trim(s.trim(), '/'); }).filter(function (s) { return !!s.length; }).map(function (p) {
                    if (p[0] === '.') {
                        p = '*' + p; // convert ".js" to "*.js"
                    }
                    return strings.format('{{0}/**,**/{1}}', p, p); // convert foo to {foo/**,**/foo} to cover files and folders
                });
            }
            return segments.reduce(function (prev, cur) { glob[cur] = true; return glob; }, glob);
        };
        PatternInput.prototype.select = function () {
            this.inputBox.select();
        };
        PatternInput.prototype.focus = function () {
            this.inputBox.focus();
        };
        PatternInput.prototype.isGlobPattern = function () {
            return this.pattern.checked;
        };
        PatternInput.prototype.setIsGlobPattern = function (value) {
            this.pattern.checked = value;
            this.setInputWidth();
        };
        PatternInput.prototype.setInputWidth = function () {
            var w = this.width - this.pattern.width();
            this.inputBox.width = w;
        };
        PatternInput.prototype.buildDomNode = function () {
            var _this = this;
            this.domNode = document.createElement('div');
            this.domNode.style.width = this.width + 'px';
            builder_1.$(this.domNode).addClass('monaco-findInput');
            this.inputBox = new inputBox_1.InputBox(this.domNode, this.contextViewProvider, {
                placeholder: this.placeholder || '',
                ariaLabel: this.ariaLabel || '',
                validationOptions: {
                    validation: null,
                    showMessage: true
                }
            });
            this.pattern = new checkbox_1.Checkbox({
                actionClassName: 'pattern',
                title: nls.localize(15, null),
                isChecked: false,
                onChange: function (viaKeyboard) {
                    _this.onOptionChange(null);
                    if (!viaKeyboard) {
                        _this.inputBox.focus();
                    }
                    _this.setInputWidth();
                    if (_this.isGlobPattern()) {
                        _this.showGlobHelp();
                    }
                    else {
                        _this.inputBox.hideMessage();
                    }
                }
            });
            builder_1.$(this.pattern.domNode).on('mouseover', function () {
                if (_this.isGlobPattern()) {
                    _this.showGlobHelp();
                }
            });
            builder_1.$(this.pattern.domNode).on(['mouseleave', 'mouseout'], function () {
                _this.inputBox.hideMessage();
            });
            this.setInputWidth();
            var controls = document.createElement('div');
            controls.className = 'controls';
            controls.appendChild(this.pattern.domNode);
            this.domNode.appendChild(controls);
        };
        PatternInput.prototype.showGlobHelp = function () {
            this.inputBox.showMessage({
                type: inputBox_1.MessageType.INFO,
                formatContent: true,
                content: nls.localize(16, null)
            }, true);
        };
        PatternInput.OPTION_CHANGE = 'optionChange';
        return PatternInput;
    }());
    var SearchViewlet = (function (_super) {
        __extends(SearchViewlet, _super);
        function SearchViewlet(telemetryService, eventService, editorService, progressService, messageService, storageService, contextViewService, instantiationService, configurationService, contextService, searchService, textFileService, keybindingService) {
            var _this = this;
            _super.call(this, ID, telemetryService);
            this.eventService = eventService;
            this.editorService = editorService;
            this.progressService = progressService;
            this.messageService = messageService;
            this.storageService = storageService;
            this.contextViewService = contextViewService;
            this.instantiationService = instantiationService;
            this.configurationService = configurationService;
            this.contextService = contextService;
            this.searchService = searchService;
            this.textFileService = textFileService;
            this.viewletVisible = keybindingService.createKey('searchViewletVisible', true);
            this.callOnModelChange = [];
            this.queryBuilder = this.instantiationService.createInstance(searchQuery_1.QueryBuilder);
            this.viewletSettings = this.getMemento(storageService, memento_1.Scope.WORKSPACE);
            this.toUnbind.push(this.eventService.addListener(files_2.EventType.FILE_CHANGES, function (e) { return _this.onFilesChanged(e); }));
            this.toUnbind.push(this.eventService.addListener(events_1.EventType.UNTITLED_FILE_DELETED, function (e) { return _this.onUntitledFileDeleted(e); }));
            this.toUnbind.push(this.configurationService.addListener(configuration_1.ConfigurationServiceEventTypes.UPDATED, function (e) { return _this.onConfigurationUpdated(e.config); }));
        }
        SearchViewlet.prototype.onConfigurationUpdated = function (configuration) {
            this.updateGlobalPatternExclusions(configuration);
        };
        SearchViewlet.prototype.getResults = function () {
            return this.results;
        };
        SearchViewlet.prototype.create = function (parent) {
            var _this = this;
            _super.prototype.create.call(this, parent);
            var filePatterns = this.viewletSettings['query.filePatterns'] || '';
            var patternExclusions = this.viewletSettings['query.folderExclusions'] || '';
            var exclusionsUsePattern = this.viewletSettings['query.exclusionsUsePattern'];
            var includesUsePattern = this.viewletSettings['query.includesUsePattern'];
            var patternIncludes = this.viewletSettings['query.folderIncludes'] || '';
            var contentPattern = this.viewletSettings['query.contentPattern'] || '';
            var isRegex = this.viewletSettings['query.regex'] === true;
            var isWholeWords = this.viewletSettings['query.wholeWords'] === true;
            var isCaseSensitive = this.viewletSettings['query.caseSensitive'] === true;
            var builder;
            this.domNode = parent.div({
                'class': 'search-viewlet'
            }, function (div) {
                builder = div;
            });
            var onStandardKeyUp = function (keyboardEvent) {
                if (keyboardEvent.keyCode === keyCodes_1.KeyCode.Enter) {
                    _this.onQueryChanged(true);
                }
                else if (keyboardEvent.keyCode === keyCodes_1.KeyCode.Escape) {
                    _this.cancelSearch();
                }
            };
            var onKeyUp = function (e) {
                onStandardKeyUp(new keyboardEvent_1.StandardKeyboardEvent(e));
            };
            this.queryBox = builder.div({ 'class': 'query-box' }, function (div) {
                var options = {
                    label: nls.localize(17, null),
                    validation: function (value) {
                        if (value.length === 0) {
                            return null;
                        }
                        if (!_this.findInput.getRegex()) {
                            return null;
                        }
                        var regExp;
                        try {
                            regExp = new RegExp(value);
                        }
                        catch (e) {
                            return { content: e.message };
                        }
                        if (strings.regExpLeadsToEndlessLoop(regExp)) {
                            return { content: nls.localize(18, null) };
                        }
                    },
                    placeholder: nls.localize(19, null)
                };
                _this.findInput = new findInput_1.FindInput(div.getHTMLElement(), _this.contextViewService, options);
                _this.findInput.onKeyUp(onStandardKeyUp);
                _this.findInput.onKeyDown(function (keyboardEvent) {
                    if (keyboardEvent.keyCode === keyCodes_1.KeyCode.DownArrow) {
                        dom.EventHelper.stop(keyboardEvent);
                        if (_this.showsFileTypes()) {
                            _this.toggleFileTypes(true, true);
                        }
                        else {
                            _this.selectTreeIfNotSelected(keyboardEvent);
                        }
                    }
                });
                _this.findInput.onDidOptionChange(function (viaKeyboard) {
                    _this.onQueryChanged(true, viaKeyboard);
                });
                _this.findInput.setValue(contentPattern);
                _this.findInput.setRegex(isRegex);
                _this.findInput.setCaseSensitive(isCaseSensitive);
                _this.findInput.setWholeWords(isWholeWords);
            }).style({ position: 'relative' }).getHTMLElement();
            this.queryDetails = builder.div({ 'class': ['query-details', 'separator'] }, function (builder) {
                builder.div({ 'class': 'more', 'tabindex': 0, 'role': 'button', 'title': nls.localize(20, null) })
                    .on(dom.EventType.CLICK, function (e) {
                    dom.EventHelper.stop(e);
                    _this.toggleFileTypes(true);
                }).on(dom.EventType.KEY_UP, function (e) {
                    var event = new keyboardEvent_1.StandardKeyboardEvent(e);
                    if (event.equals(keyCodes_1.CommonKeybindings.ENTER) || event.equals(keyCodes_1.CommonKeybindings.SPACE)) {
                        dom.EventHelper.stop(e);
                        _this.toggleFileTypes();
                    }
                });
                //folder includes list
                builder.div({ 'class': 'file-types' }, function (builder) {
                    var title = nls.localize(21, null);
                    builder.element('h4', { text: title });
                    _this.inputPatternIncludes = new PatternInput(builder.getContainer(), _this.contextViewService, {
                        ariaLabel: nls.localize(22, null)
                    });
                    _this.inputPatternIncludes.setIsGlobPattern(includesUsePattern);
                    _this.inputPatternIncludes.setValue(patternIncludes);
                    _this.inputPatternIncludes
                        .on(dom.EventType.KEY_UP, onKeyUp)
                        .on(dom.EventType.KEY_DOWN, function (e) {
                        var keyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                        if (keyboardEvent.equals(keyCodes_1.CommonKeybindings.UP_ARROW)) {
                            dom.EventHelper.stop(e);
                            _this.findInput.focus();
                            _this.findInput.select();
                        }
                        else if (keyboardEvent.equals(keyCodes_1.CommonKeybindings.DOWN_ARROW)) {
                            dom.EventHelper.stop(e);
                            _this.inputPatternExclusions.focus();
                            _this.inputPatternExclusions.select();
                        }
                    }).on(findInput_1.FindInput.OPTION_CHANGE, function (e) {
                        _this.onQueryChanged(false);
                    });
                });
                //pattern exclusion list
                builder.div({ 'class': 'file-types' }, function (builder) {
                    var title = nls.localize(23, null);
                    builder.element('h4', { text: title });
                    _this.inputPatternExclusions = new PatternInput(builder.getContainer(), _this.contextViewService, {
                        ariaLabel: nls.localize(24, null)
                    });
                    _this.inputPatternExclusions.setIsGlobPattern(exclusionsUsePattern);
                    _this.inputPatternExclusions.setValue(patternExclusions);
                    _this.inputPatternExclusions
                        .on(dom.EventType.KEY_UP, onKeyUp)
                        .on(dom.EventType.KEY_DOWN, function (e) {
                        var keyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                        if (keyboardEvent.equals(keyCodes_1.CommonKeybindings.UP_ARROW)) {
                            dom.EventHelper.stop(e);
                            _this.inputPatternIncludes.focus();
                            _this.inputPatternIncludes.select();
                        }
                        else if (keyboardEvent.equals(keyCodes_1.CommonKeybindings.DOWN_ARROW)) {
                            dom.EventHelper.stop(e);
                            _this.selectTreeIfNotSelected(keyboardEvent);
                        }
                    }).on(findInput_1.FindInput.OPTION_CHANGE, function (e) {
                        _this.onQueryChanged(false);
                    });
                });
                // add hint if we have global exclusion
                _this.inputPatternGlobalExclusionsContainer = builder.div({ 'class': 'file-types global-exclude disabled' }, function (builder) {
                    var title = nls.localize(25, null);
                    builder.element('h4', { text: title });
                    _this.inputPatternGlobalExclusions = new inputBox_1.InputBox(builder.getContainer(), _this.contextViewService, {
                        actions: [_this.instantiationService.createInstance(ConfigureGlobalExclusionsAction)],
                        ariaLabel: nls.localize(26, null)
                    });
                    _this.inputPatternGlobalExclusions.inputElement.readOnly = true;
                    builder_1.$(_this.inputPatternGlobalExclusions.inputElement).attr('aria-readonly', 'true');
                    builder_1.$(_this.inputPatternGlobalExclusions.inputElement).addClass('disabled');
                }).hide();
            }).getHTMLElement();
            this.messages = builder.div({ 'class': 'messages' }).hide().clone();
            builder.div({ 'class': 'results' }, function (div) {
                _this.results = div;
                var dataSource = new SearchDataSource();
                var renderer = _this.instantiationService.createInstance(SearchRenderer, _this.getActionRunner());
                _this.tree = new treeImpl_1.Tree(div.getHTMLElement(), {
                    dataSource: dataSource,
                    renderer: renderer,
                    sorter: new SearchSorter(),
                    filter: new SearchFilter(),
                    controller: new SearchController(_this),
                    accessibilityProvider: _this.instantiationService.createInstance(SearchAccessibilityProvider)
                }, {
                    ariaLabel: nls.localize(27, null)
                });
                _this.toUnbind.push(function () { return renderer.dispose(); });
                _this.toUnbind.push(_this.tree.addListener('selection', function (event) {
                    var element, keyboard = event.payload && event.payload.origin === 'keyboard';
                    if (keyboard) {
                        element = _this.tree.getFocus();
                    }
                    else {
                        element = event.selection[0];
                    }
                    var originalEvent = event.payload && event.payload.originalEvent;
                    var doubleClick = (event.payload && event.payload.origin === 'mouse' && originalEvent && originalEvent.detail === 2);
                    if (doubleClick) {
                        originalEvent.preventDefault(); // focus moves to editor, we need to prevent default
                    }
                    var sideBySide = (originalEvent && (originalEvent.ctrlKey || originalEvent.metaKey));
                    _this.onFocus(element, !keyboard && !doubleClick, sideBySide);
                }));
            });
            this.actionRegistry = {};
            var actions = [new CollapseAllAction(this), new RefreshAction(this), new ClearSearchResultsAction(this), new SelectOrRemoveAction(this)];
            actions.forEach(function (action) {
                _this.actionRegistry[action.id] = action;
            });
            if (filePatterns !== '' || patternExclusions !== '' || patternIncludes !== '') {
                this.toggleFileTypes(true, true, true);
            }
            this.updateGlobalPatternExclusions(this.configurationService.getConfiguration());
            return winjs_base_1.TPromise.as(null);
        };
        SearchViewlet.prototype.updateGlobalPatternExclusions = function (configuration) {
            if (this.inputPatternGlobalExclusionsContainer) {
                var excludes_1 = searchQuery_1.getExcludes(configuration);
                if (excludes_1) {
                    var exclusions = Object.getOwnPropertyNames(excludes_1).filter(function (exclude) { return excludes_1[exclude] === true || typeof excludes_1[exclude].when === 'string'; }).map(function (exclude) {
                        if (excludes_1[exclude] === true) {
                            return exclude;
                        }
                        return nls.localize(28, null, exclude, excludes_1[exclude].when);
                    });
                    if (exclusions.length) {
                        var values = exclusions.join(', ');
                        this.inputPatternGlobalExclusions.value = values;
                        this.inputPatternGlobalExclusions.inputElement.title = values;
                        this.inputPatternGlobalExclusionsContainer.show();
                    }
                    else {
                        this.inputPatternGlobalExclusionsContainer.hide();
                    }
                }
            }
        };
        SearchViewlet.prototype.setVisible = function (visible) {
            var promise;
            this.viewletVisible.set(visible);
            if (visible) {
                promise = _super.prototype.setVisible.call(this, visible);
                this.tree.onVisible();
            }
            else {
                this.tree.onHidden();
                promise = _super.prototype.setVisible.call(this, visible);
            }
            // Enable highlights if there are searchresults
            if (this.viewModel) {
                this.viewModel.toggleHighlights(visible);
            }
            // Open focused element from results in case the editor area is otherwise empty
            if (visible && !this.editorService.getActiveEditorInput()) {
                var focus_1 = this.tree.getFocus();
                if (focus_1) {
                    this.onFocus(focus_1, false, false);
                }
            }
            return promise;
        };
        SearchViewlet.prototype.focus = function () {
            _super.prototype.focus.call(this);
            var selectedText = this.getSelectionFromEditor();
            if (selectedText) {
                this.findInput.setValue(selectedText);
            }
            this.findInput.focus();
            this.findInput.select();
        };
        SearchViewlet.prototype.reLayout = function () {
            if (this.isDisposed) {
                return;
            }
            this.findInput.setWidth(this.size.width - 34 /* container margin */);
            this.inputPatternExclusions.setWidth(this.size.width - 42 /* container margin */);
            this.inputPatternIncludes.setWidth(this.size.width - 42 /* container margin */);
            this.inputPatternGlobalExclusions.width = this.size.width - 42 /* container margin */ - 24 /* actions */;
            var queryBoxHeight = dom.getTotalHeight(this.queryBox);
            var queryDetailsHeight = dom.getTotalHeight(this.queryDetails);
            var searchResultContainerSize = this.size.height - queryBoxHeight - queryDetailsHeight;
            this.results.style({ height: searchResultContainerSize + 'px' });
            this.tree.layout(searchResultContainerSize);
        };
        SearchViewlet.prototype.layout = function (dimension) {
            this.size = dimension;
            this.reLayout();
        };
        SearchViewlet.prototype.getControl = function () {
            return this.tree;
        };
        SearchViewlet.prototype.clearSearchResults = function () {
            this.disposeModel();
            this.showEmptyStage();
            this.findInput.clear();
            if (this.currentRequest) {
                this.currentRequest.cancel();
                this.currentRequest = null;
            }
        };
        SearchViewlet.prototype.cancelSearch = function () {
            if (this.currentRequest) {
                this.findInput.focus();
                this.findInput.select();
                this.currentRequest.cancel();
                this.currentRequest = null;
                return true;
            }
            return false;
        };
        SearchViewlet.prototype.selectTreeIfNotSelected = function (keyboardEvent) {
            if (this.tree.getInput()) {
                this.tree.DOMFocus();
                var selection = this.tree.getSelection();
                if (selection.length === 0) {
                    this.tree.focusNext();
                }
            }
        };
        SearchViewlet.prototype.getSelectionFromEditor = function () {
            if (!this.editorService.getActiveEditor()) {
                return null;
            }
            var editor = this.editorService.getActiveEditor().getControl();
            if (!editor || !types_1.isFunction(editor.getEditorType) || editor.getEditorType() !== editorCommon_1.EditorType.ICodeEditor) {
                return null;
            }
            var range = editor.getSelection();
            if (range && !range.isEmpty() && range.startLineNumber === range.endLineNumber) {
                var r = editor.getModel().getLineContent(range.startLineNumber);
                r = r.substring(range.startColumn - 1, range.endColumn - 1);
                return r;
            }
            return null;
        };
        SearchViewlet.prototype.showsFileTypes = function () {
            return dom.hasClass(this.queryDetails, 'more');
        };
        SearchViewlet.prototype.toggleFileTypes = function (moveFocus, show, skipLayout) {
            var cls = 'more';
            show = typeof show === 'undefined' ? !dom.hasClass(this.queryDetails, cls) : Boolean(show);
            skipLayout = Boolean(skipLayout);
            if (show) {
                dom.addClass(this.queryDetails, cls);
                if (moveFocus) {
                    this.inputPatternIncludes.focus();
                    this.inputPatternIncludes.select();
                }
            }
            else {
                dom.removeClass(this.queryDetails, cls);
                if (moveFocus) {
                    this.findInput.focus();
                    this.findInput.select();
                }
            }
            if (!skipLayout && this.size) {
                this.layout(this.size);
            }
        };
        SearchViewlet.prototype.searchInFolder = function (resource) {
            if (!this.showsFileTypes()) {
                this.toggleFileTypes(true, true);
            }
            var workspaceRelativePath = this.contextService.toWorkspaceRelativePath(resource);
            if (workspaceRelativePath) {
                this.inputPatternIncludes.setIsGlobPattern(false);
                this.inputPatternIncludes.setValue(workspaceRelativePath);
                this.findInput.focus();
            }
        };
        SearchViewlet.prototype.onQueryChanged = function (rerunQuery, preserveFocus) {
            var isRegex = this.findInput.getRegex();
            var isWholeWords = this.findInput.getWholeWords();
            var isCaseSensitive = this.findInput.getCaseSensitive();
            var contentPattern = this.findInput.getValue();
            var patternExcludes = this.inputPatternExclusions.getValue().trim();
            var exclusionsUsePattern = this.inputPatternExclusions.isGlobPattern();
            var patternIncludes = this.inputPatternIncludes.getValue().trim();
            var includesUsePattern = this.inputPatternIncludes.isGlobPattern();
            // store memento
            this.viewletSettings['query.contentPattern'] = contentPattern;
            this.viewletSettings['query.regex'] = isRegex;
            this.viewletSettings['query.wholeWords'] = isWholeWords;
            this.viewletSettings['query.caseSensitive'] = isCaseSensitive;
            this.viewletSettings['query.folderExclusions'] = patternExcludes;
            this.viewletSettings['query.exclusionsUsePattern'] = exclusionsUsePattern;
            this.viewletSettings['query.folderIncludes'] = patternIncludes;
            this.viewletSettings['query.includesUsePattern'] = includesUsePattern;
            if (!rerunQuery) {
                return;
            }
            if (contentPattern.length === 0) {
                return;
            }
            // Validate regex is OK
            if (isRegex) {
                var regExp = void 0;
                try {
                    regExp = new RegExp(contentPattern);
                }
                catch (e) {
                    return; // malformed regex
                }
                if (strings.regExpLeadsToEndlessLoop(regExp)) {
                    return; // endless regex
                }
            }
            var content = {
                pattern: contentPattern,
                isRegExp: isRegex,
                isCaseSensitive: isCaseSensitive,
                isWordMatch: isWholeWords
            };
            var excludes = this.inputPatternExclusions.getGlob();
            var includes = this.inputPatternIncludes.getGlob();
            var options = {
                folderResources: this.contextService.getWorkspace() ? [this.contextService.getWorkspace().resource] : [],
                extraFileResources: this.textFileService.getWorkingFilesModel().getOutOfWorkspaceContextEntries().map(function (e) { return e.resource; }),
                excludePattern: excludes,
                includePattern: includes,
                maxResults: SearchViewlet.MAX_TEXT_RESULTS,
            };
            this.onQueryTriggered(this.queryBuilder.text(content, options), patternExcludes, patternIncludes);
            if (!preserveFocus) {
                this.findInput.focus(); // focus back to input field
            }
        };
        SearchViewlet.prototype.onQueryTriggered = function (query, excludePattern, includePattern) {
            var _this = this;
            if (this.currentRequest) {
                this.currentRequest.cancel();
                this.currentRequest = null;
            }
            var progressTimer = this.telemetryService.timedPublicLog('searchResultsFirstRender');
            var doneTimer = this.telemetryService.timedPublicLog('searchResultsFinished');
            // Progress total is 100%
            var progressTotal = 100;
            var progressRunner = this.progressService.show(progressTotal);
            var progressWorked = 0;
            this.loading = true;
            this.findInput.clearMessage();
            this.disposeModel();
            this.showEmptyStage();
            var handledMatches = Object.create(null);
            var autoExpand = function (alwaysExpandIfOneResult) {
                // Auto-expand / collapse based on number of matches:
                // - alwaysExpandIfOneResult: expand file results if we have just one file result and less than 50 matches on a file
                // - expand file results if we have more than one file result and less than 10 matches on a file
                if (_this.viewModel) {
                    var matches_1 = _this.viewModel.matches();
                    matches_1.forEach(function (match) {
                        if (handledMatches[match.id()]) {
                            return; // if we once handled a result, do not do it again to keep results stable (the user might have expanded/collapsed meanwhile)
                        }
                        handledMatches[match.id()] = true;
                        var length = match.matches().length;
                        if (length < 10 || (alwaysExpandIfOneResult && matches_1.length === 1 && length < 50)) {
                            _this.tree.expand(match).done(null, errors.onUnexpectedError);
                        }
                        else {
                            _this.tree.collapse(match).done(null, errors.onUnexpectedError);
                        }
                    });
                }
            };
            var timerEvent = timer.start(timer.Topic.WORKBENCH, 'Search');
            var isDone = false;
            var onComplete = function (completed) {
                timerEvent.stop();
                isDone = true;
                // Complete up to 100% as needed
                if (completed) {
                    progressRunner.worked(progressTotal - progressWorked);
                    setTimeout(function () { return progressRunner.done(); }, 200);
                }
                else {
                    progressRunner.done();
                }
                // Show the final results
                if (!_this.viewModel) {
                    _this.viewModel = _this.instantiationService.createInstance(searchModel_1.SearchResult, query.contentPattern);
                    if (completed) {
                        _this.viewModel.append(completed.results);
                    }
                }
                _this.tree.refresh().then(function () {
                    autoExpand(true);
                }).done(undefined, errors.onUnexpectedError);
                var hasResults = !_this.viewModel.isEmpty();
                _this.loading = false;
                _this.telemetryService.publicLog('searchResultsShown', { count: _this.viewModel.count(), fileCount: _this.viewModel.fileCount() });
                _this.actionRegistry['refresh'].enabled = true;
                _this.actionRegistry['selectOrRemove'].enabled = hasResults;
                _this.actionRegistry['collapseAll'].enabled = hasResults;
                _this.actionRegistry['clearSearchResults'].enabled = hasResults;
                if (completed && completed.limitHit) {
                    _this.findInput.showMessage({
                        content: nls.localize(29, null),
                        type: inputBox_1.MessageType.WARNING
                    });
                }
                if (!hasResults) {
                    var hasExcludes = !!excludePattern;
                    var hasIncludes = !!includePattern;
                    var message = void 0;
                    if (!completed) {
                        message = nls.localize(30, null);
                    }
                    else if (hasIncludes && hasExcludes) {
                        message = nls.localize(31, null, includePattern, excludePattern);
                    }
                    else if (hasIncludes) {
                        message = nls.localize(32, null, includePattern);
                    }
                    else if (hasExcludes) {
                        message = nls.localize(33, null, excludePattern);
                    }
                    else {
                        message = nls.localize(34, null);
                    }
                    // Indicate as status to ARIA
                    aria.status(message);
                    _this.tree.onHidden();
                    _this.results.hide();
                    var div = _this.messages.empty().show().asContainer().div({ 'class': 'message', text: message });
                    if (!completed) {
                        builder_1.$(div).a({
                            'class': ['pointer', 'prominent'],
                            text: nls.localize(35, null)
                        }).on(dom.EventType.CLICK, function (e) {
                            dom.EventHelper.stop(e, false);
                            _this.onQueryChanged(true);
                        });
                    }
                    else if (hasIncludes || hasExcludes) {
                        builder_1.$(div).a({
                            'class': ['pointer', 'prominent'],
                            'tabindex': '0',
                            text: nls.localize(36, null)
                        }).on(dom.EventType.CLICK, function (e) {
                            dom.EventHelper.stop(e, false);
                            _this.inputPatternExclusions.setValue('');
                            _this.inputPatternIncludes.setValue('');
                            _this.onQueryChanged(true);
                        });
                    }
                    else {
                        builder_1.$(div).a({
                            'class': ['pointer', 'prominent'],
                            'tabindex': '0',
                            text: nls.localize(37, null)
                        }).on(dom.EventType.CLICK, function (e) {
                            dom.EventHelper.stop(e, false);
                            var action = _this.instantiationService.createInstance(openSettings_1.OpenGlobalSettingsAction, openSettings_1.OpenGlobalSettingsAction.ID, openSettings_1.OpenGlobalSettingsAction.LABEL);
                            action.run().done(function () { return action.dispose(); }, errors.onUnexpectedError);
                        });
                    }
                }
                else {
                    _this.viewModel.toggleHighlights(true); // show highlights
                    // Indicate as status to ARIA
                    aria.status(nls.localize(38, null, _this.viewModel.count(), _this.viewModel.fileCount()));
                }
                doneTimer.stop();
            };
            var onError = function (e) {
                if (errors.isPromiseCanceledError(e)) {
                    onComplete(null);
                }
                else {
                    _this.loading = false;
                    isDone = true;
                    progressRunner.done();
                    progressTimer.stop();
                    doneTimer.stop();
                    _this.messageService.show(2 /* ERROR */, e);
                }
            };
            var total = 0;
            var worked = 0;
            var visibleMatches = 0;
            var matches = [];
            var onProgress = function (p) {
                // Progress
                if (p.total) {
                    total = p.total;
                }
                if (p.worked) {
                    worked = p.worked;
                }
                // Results
                if (p.resource) {
                    matches.push(p);
                    // Create view model
                    if (!_this.viewModel) {
                        _this.viewModel = _this.instantiationService.createInstance(searchModel_1.SearchResult, query.contentPattern);
                        _this.tree.setInput(_this.viewModel).then(function () {
                            autoExpand(false);
                            _this.callOnModelChange.push(_this.viewModel.addListener('changed', function (e) { return _this.tree.refresh(e, true); }));
                        }).done(null, errors.onUnexpectedError);
                    }
                    _this.viewModel.append([p]);
                    progressTimer.stop();
                }
            };
            // Handle UI updates in an interval to show frequent progress and results
            var uiRefreshHandle = setInterval(function () {
                if (isDone) {
                    window.clearInterval(uiRefreshHandle);
                    return;
                }
                // Progress bar update
                var fakeProgress = true;
                if (total > 0 && worked > 0) {
                    var ratio = Math.round((worked / total) * 100);
                    if (ratio > progressWorked) {
                        progressRunner.worked(ratio - progressWorked);
                        progressWorked = ratio;
                        fakeProgress = false;
                    }
                }
                // Fake progress up to 90%
                if (fakeProgress && progressWorked < 90) {
                    progressWorked++;
                    progressRunner.worked(1);
                }
                // Search result tree update
                if (visibleMatches !== matches.length) {
                    visibleMatches = matches.length;
                    _this.tree.refresh().then(function () {
                        autoExpand(false);
                    }).done(null, errors.onUnexpectedError);
                    // since we have results now, enable some actions
                    if (!_this.actionRegistry['collapseAll'].enabled) {
                        _this.actionRegistry['collapseAll'].enabled = true;
                    }
                }
            }, 200);
            this.currentRequest = this.searchService.search(query);
            this.currentRequest.then(onComplete, onError, onProgress);
        };
        SearchViewlet.prototype.showEmptyStage = function () {
            // disable 'result'-actions
            this.actionRegistry['refresh'].enabled = false;
            this.actionRegistry['selectOrRemove'].enabled = false;
            this.actionRegistry['collapseAll'].enabled = false;
            this.actionRegistry['clearSearchResults'].enabled = false;
            // clean up ui
            this.messages.hide();
            this.tree.setInput(this.instantiationService.createInstance(searchModel_1.SearchResult, null)).done(null, errors.onUnexpectedError);
            this.results.show();
            this.tree.onVisible();
        };
        SearchViewlet.prototype.onFocus = function (lineMatch, preserveFocus, sideBySide) {
            if (!(lineMatch instanceof searchModel_1.Match)) {
                return winjs_base_1.TPromise.as(true);
            }
            this.telemetryService.publicLog('searchResultChosen');
            return this.editorService.openEditor({
                resource: lineMatch.parent().resource(),
                options: {
                    preserveFocus: preserveFocus,
                    selection: lineMatch instanceof searchModel_1.EmptyMatch ? void 0 : lineMatch.range()
                }
            }, sideBySide);
        };
        SearchViewlet.prototype.onUntitledFileDeleted = function (e) {
            if (!this.viewModel) {
                return;
            }
            var matches = this.viewModel.matches();
            for (var i = 0, len = matches.length; i < len; i++) {
                if (e.resource.toString() === matches[i].resource().toString()) {
                    this.viewModel.remove(matches[i]);
                }
            }
        };
        SearchViewlet.prototype.onFilesChanged = function (e) {
            if (!this.viewModel) {
                return;
            }
            var matches = this.viewModel.matches();
            for (var i = 0, len = matches.length; i < len; i++) {
                if (e.contains(matches[i].resource(), files_2.FileChangeType.DELETED)) {
                    this.viewModel.remove(matches[i]);
                }
            }
        };
        SearchViewlet.prototype.getSelection = function () {
            return new selection_1.StructuredSelection(this.tree.getSelection());
        };
        SearchViewlet.prototype.getActions = function () {
            return [
                this.actionRegistry['refresh'],
                this.actionRegistry['collapseAll'],
                this.actionRegistry['clearSearchResults']
            ];
        };
        SearchViewlet.prototype.dispose = function () {
            this.isDisposed = true;
            if (this.tree) {
                this.tree.dispose();
            }
            this.disposeModel();
            _super.prototype.dispose.call(this);
        };
        SearchViewlet.prototype.disposeModel = function () {
            if (this.viewModel) {
                this.viewModel.dispose();
                this.viewModel = null;
            }
            lifecycle.cAll(this.callOnModelChange);
        };
        SearchViewlet.MAX_TEXT_RESULTS = 2048;
        SearchViewlet = __decorate([
            __param(0, telemetry_1.ITelemetryService),
            __param(1, event_1.IEventService),
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, progress_1.IProgressService),
            __param(4, message_1.IMessageService),
            __param(5, storage_1.IStorageService),
            __param(6, contextView_1.IContextViewService),
            __param(7, instantiation_1.IInstantiationService),
            __param(8, configuration_1.IConfigurationService),
            __param(9, workspace_1.IWorkspaceContextService),
            __param(10, search_1.ISearchService),
            __param(11, files_1.ITextFileService),
            __param(12, keybindingService_1.IKeybindingService)
        ], SearchViewlet);
        return SearchViewlet;
    }(viewlet_1.Viewlet));
    exports.SearchViewlet = SearchViewlet;
});
//# sourceMappingURL=searchViewlet.js.map