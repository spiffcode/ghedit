/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/nls', 'vs/base/browser/builder', 'vs/base/common/strings', 'vs/base/common/filters', 'vs/base/common/uuid', 'vs/base/common/types', 'vs/base/parts/quickopen/common/quickOpen', 'vs/base/parts/quickopen/browser/quickOpenModel', 'vs/base/parts/quickopen/browser/quickOpenWidget', 'vs/workbench/browser/actionBarRegistry', 'vs/platform/platform', 'vs/workbench/common/component', 'vs/workbench/common/events', 'vs/base/common/event', 'vs/workbench/common/constants', 'vs/workbench/common/memento', 'vs/workbench/browser/quickopen', 'vs/workbench/browser/parts/quickopen/editorHistoryModel', 'vs/base/common/errors', 'vs/workbench/services/quickopen/common/quickOpenService', 'vs/platform/message/common/message', 'vs/css!./media/quickopen'], function (require, exports, winjs_base_1, nls, builder_1, strings, filters, uuid, types, quickOpen_1, quickOpenModel_1, quickOpenWidget_1, actionBarRegistry_1, platform_1, component_1, events_1, event_1, constants_1, memento_1, quickopen_1, editorHistoryModel_1, errors, quickOpenService_1, message_1) {
    'use strict';
    var ID = 'workbench.component.quickopen';
    var EDITOR_HISTORY_STORAGE_KEY = 'quickopen.editorhistory';
    var HELP_PREFIX = '?';
    var AUTO_SAVE_HISTORY_THRESHOLD = 5;
    var QUICK_OPEN_MODE = 'inQuickOpen';
    var QuickOpenController = (function (_super) {
        __extends(QuickOpenController, _super);
        function QuickOpenController(eventService, storageService, editorService, viewletService, messageService, telemetryService, contextService, keybindingService) {
            _super.call(this, ID);
            this.eventService = eventService;
            this.storageService = storageService;
            this.editorService = editorService;
            this.viewletService = viewletService;
            this.messageService = messageService;
            this.telemetryService = telemetryService;
            this.contextService = contextService;
            this.serviceId = quickOpenService_1.IQuickOpenService;
            this.actionProvider = new actionBarRegistry_1.ContributableActionProvider();
            this.previousValue = '';
            this.mapResolvedHandlersToPrefix = {};
            this.autoSaveHistoryCounter = 0;
            this.promisesToCompleteOnHide = [];
            this.inQuickOpenMode = keybindingService.createKey(QUICK_OPEN_MODE, false);
            this._onShow = new event_1.Emitter();
            this._onHide = new event_1.Emitter();
        }
        Object.defineProperty(QuickOpenController.prototype, "onShow", {
            get: function () {
                return this._onShow.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(QuickOpenController.prototype, "onHide", {
            get: function () {
                return this._onHide.event;
            },
            enumerable: true,
            configurable: true
        });
        QuickOpenController.prototype.setInstantiationService = function (service) {
            this.instantiationService = service;
        };
        QuickOpenController.prototype.getEditorHistoryModel = function () {
            return this.editorHistoryModel;
        };
        QuickOpenController.prototype.create = function () {
            var _this = this;
            // Listen on Editor Input Changes to show in MRU List
            this.toUnbind.push(this.eventService.addListener(events_1.EventType.EDITOR_INPUT_CHANGING, function (e) { return _this.onEditorInputChanging(e); }));
            this.toUnbind.push(this.eventService.addListener(events_1.EventType.EDITOR_SET_INPUT_ERROR, function (e) { return _this.onEditorInputSetError(e); }));
            // Editor History Model
            this.editorHistoryModel = new editorHistoryModel_1.EditorHistoryModel(this.editorService, this.instantiationService, this.contextService);
            this.memento = this.getMemento(this.storageService, memento_1.Scope.WORKSPACE);
            if (this.memento[EDITOR_HISTORY_STORAGE_KEY]) {
                this.editorHistoryModel.loadFrom(this.memento[EDITOR_HISTORY_STORAGE_KEY]);
            }
        };
        QuickOpenController.prototype.onEditorInputChanging = function (e) {
            if (e.editorInput) {
                // If an active editor is set, but is different from the one from the event, return early
                var activeEditor = this.editorService.getActiveEditor();
                if (activeEditor && e.editor && activeEditor !== e.editor) {
                    return;
                }
                // Add to History
                this.editorHistoryModel.add(e.editorInput);
                // Save to Local Storage periodically
                if (this.autoSaveHistoryCounter++ >= AUTO_SAVE_HISTORY_THRESHOLD) {
                    this.saveEditorHistory(true);
                    this.autoSaveHistoryCounter = 0;
                }
            }
        };
        QuickOpenController.prototype.onEditorInputSetError = function (e) {
            if (e.editorInput) {
                this.removeEditorHistoryEntry(e.editorInput); // make sure this input does not show up in history if it failed to open
            }
        };
        QuickOpenController.prototype.getEditorHistory = function () {
            return this.editorHistoryModel ? this.editorHistoryModel.getEntries().map(function (entry) { return entry.getInput(); }) : [];
        };
        QuickOpenController.prototype.removeEditorHistoryEntry = function (input) {
            this.editorHistoryModel.remove(input);
        };
        QuickOpenController.prototype.quickNavigate = function (configuration, next) {
            if (this.quickOpenWidget) {
                this.quickOpenWidget.quickNavigate(configuration, next);
            }
        };
        QuickOpenController.prototype.input = function (options) {
            var _this = this;
            var defaultMessage = options && options.prompt
                ? nls.localize('inputModeEntryDescription', "{0} (Press 'Enter' to confirm or 'Escape' to cancel)", options.prompt)
                : nls.localize('inputModeEntry', "Press 'Enter' to confirm your input or 'Escape' to cancel");
            var currentPick = defaultMessage;
            var currentValidation = winjs_base_1.TPromise.as(true);
            var currentDecoration;
            var lastValue = options && options.value || '';
            var init = function (resolve, reject) {
                // open quick pick with just one choise. we will recurse whenever
                // the validation/success message changes
                _this.doPick(winjs_base_1.TPromise.as([{ label: currentPick }]), {
                    ignoreFocusLost: true,
                    autoFocus: { autoFocusFirstEntry: true },
                    password: options.password,
                    placeHolder: options.placeHolder,
                    value: options.value,
                    inputDecoration: currentDecoration,
                    onDidType: function (value) {
                        lastValue = value;
                        if (options.validateInput) {
                            if (currentValidation) {
                                currentValidation.cancel();
                            }
                            currentValidation = winjs_base_1.TPromise.timeout(100).then(function () {
                                return options.validateInput(value).then(function (message) {
                                    currentDecoration = !!message ? message_1.Severity.Error : void 0;
                                    var newPick = message || defaultMessage;
                                    if (newPick !== currentPick) {
                                        currentPick = newPick;
                                        resolve(new winjs_base_1.TPromise(init));
                                    }
                                    return !message;
                                });
                            }, function (err) {
                                // ignore
                            });
                        }
                    }
                }).then(resolve, reject);
            };
            return new winjs_base_1.TPromise(init).then(function (item) {
                return currentValidation.then(function (valid) {
                    if (valid && item) {
                        return lastValue;
                    }
                });
            });
        };
        QuickOpenController.prototype.pick = function (arg1, options) {
            var _this = this;
            if (!options) {
                options = Object.create(null);
            }
            var arrayPromise;
            if (Array.isArray(arg1)) {
                arrayPromise = winjs_base_1.TPromise.as(arg1);
            }
            else if (winjs_base_1.TPromise.is(arg1)) {
                arrayPromise = arg1;
            }
            else {
                throw new Error('illegal input');
            }
            var isAboutStrings = false;
            var entryPromise = arrayPromise.then(function (elements) {
                return elements.map(function (element) {
                    if (typeof element === 'string') {
                        isAboutStrings = true;
                        return { label: element };
                    }
                    else {
                        return element;
                    }
                });
            });
            return new winjs_base_1.TPromise(function (resolve, reject, progress) {
                function onItem(item) {
                    return item && isAboutStrings ? item.label : item;
                }
                _this.doPick(entryPromise, options).then(function (item) { return resolve(onItem(item)); }, function (err) { return reject(err); }, function (item) { return progress(onItem(item)); });
            });
        };
        QuickOpenController.prototype.doPick = function (picksPromise, options) {
            var _this = this;
            var autoFocus = options.autoFocus;
            // Use a generated token to avoid race conditions from long running promises
            var currentPickerToken = uuid.generateUuid();
            this.currentPickerToken = currentPickerToken;
            // Create upon first open
            if (!this.pickOpenWidget) {
                this.pickOpenWidget = new quickOpenWidget_1.QuickOpenWidget(builder_1.withElementById(constants_1.Identifiers.WORKBENCH_CONTAINER).getHTMLElement(), {
                    onOk: function () { },
                    onCancel: function () { },
                    onType: function (value) { },
                    onShow: function () { return _this.emitQuickOpenVisibilityChange(true); },
                    onHide: function () {
                        _this.restoreFocus(); // focus back to editor or viewlet
                        _this.emitQuickOpenVisibilityChange(false); // event
                    }
                }, {
                    inputPlaceHolder: options.placeHolder || ''
                }, this.telemetryService);
                this.pickOpenWidget.create();
            }
            else {
                this.pickOpenWidget.setPlaceHolder(options.placeHolder || '');
            }
            // Respect input value
            if (options.value) {
                this.pickOpenWidget.setValue(options.value);
            }
            // Respect password
            this.pickOpenWidget.setPassword(options.password);
            // Input decoration
            if (!types.isUndefinedOrNull(options.inputDecoration)) {
                this.pickOpenWidget.showInputDecoration(options.inputDecoration);
            }
            else {
                this.pickOpenWidget.clearInputDecoration();
            }
            // Layout
            if (this.layoutDimensions) {
                this.pickOpenWidget.layout(this.layoutDimensions);
            }
            return new winjs_base_1.TPromise(function (complete, error, progress) {
                var picksPromiseDone = false;
                // Resolve picks
                picksPromise.then(function (picks) {
                    if (_this.currentPickerToken !== currentPickerToken) {
                        return; // Return if another request came after
                    }
                    picksPromiseDone = true;
                    // Reset Progress
                    _this.pickOpenWidget.getProgressBar().stop().getContainer().hide();
                    // Model
                    var model = new quickOpenModel_1.QuickOpenModel();
                    var entries = picks.map(function (e) {
                        var entry = e;
                        if (entry.height && entry.render) {
                            return new PickOpenItem(entry.label, entry.description, entry.height, entry.render.bind(entry), function () { return progress(e); });
                        }
                        return new PickOpenEntry(entry.label, entry.description, entry.detail, function () { return progress(e); }, entry.separator && entry.separator.border, entry.separator && entry.separator.label);
                    });
                    if (picks.length === 0) {
                        entries.push(new PickOpenEntry(nls.localize('emptyPicks', "There are no entries to pick from")));
                    }
                    model.setEntries(entries);
                    // Handlers
                    _this.pickOpenWidget.setCallbacks({
                        onOk: function () {
                            if (picks.length === 0) {
                                return complete(null);
                            }
                            var index = -1;
                            entries.forEach(function (entry, i) {
                                if (entry.selected) {
                                    index = i;
                                }
                            });
                            complete(picks[index] || null);
                        },
                        onCancel: function () { return complete(void 0); },
                        onFocusLost: function () { return options.ignoreFocusLost; },
                        onType: function (value) {
                            // the caller takes care of all input
                            if (options.onDidType) {
                                options.onDidType(value);
                                return;
                            }
                            if (picks.length === 0) {
                                return;
                            }
                            value = value ? strings.trim(value) : value;
                            // Reset filtering
                            if (!value) {
                                entries.forEach(function (e) {
                                    e.setHighlights(null);
                                    e.setHidden(false);
                                });
                            }
                            else {
                                entries.forEach(function (entry) {
                                    var labelHighlights = filters.matchesFuzzy(value, entry.getLabel());
                                    var descriptionHighlights = options.matchOnDescription
                                        && filters.matchesFuzzy(value, entry.getDescription());
                                    var detailHighlights = options.matchOnDetail && entry.getDetail()
                                        && filters.matchesFuzzy(value, entry.getDetail());
                                    if (labelHighlights || descriptionHighlights || detailHighlights) {
                                        entry.setHighlights(labelHighlights, descriptionHighlights, detailHighlights);
                                        entry.setHidden(false);
                                    }
                                    else {
                                        entry.setHighlights(null, null, null);
                                        entry.setHidden(true);
                                    }
                                });
                            }
                            _this.pickOpenWidget.refresh(model, value ? { autoFocusFirstEntry: true } : autoFocus);
                        },
                        onShow: function () {
                            _this.emitQuickOpenVisibilityChange(true); // event
                        },
                        onHide: function () {
                            _this.restoreFocus(); // focus back to editor or viewlet
                            _this.emitQuickOpenVisibilityChange(false); // event
                        }
                    });
                    // Set input
                    if (!_this.pickOpenWidget.isVisible()) {
                        _this.pickOpenWidget.show(model, autoFocus);
                    }
                    else {
                        _this.pickOpenWidget.setInput(model, autoFocus);
                    }
                }, function (err) {
                    _this.pickOpenWidget.hide();
                    error(err);
                });
                // Progress if task takes a long time
                winjs_base_1.TPromise.timeout(800).then(function () {
                    if (!picksPromiseDone && _this.currentPickerToken === currentPickerToken) {
                        _this.pickOpenWidget.getProgressBar().infinite().getContainer().show();
                    }
                });
                // Show picker empty if resolving takes a while
                if (!picksPromiseDone) {
                    _this.pickOpenWidget.show(new quickOpenModel_1.QuickOpenModel());
                }
            });
        };
        QuickOpenController.prototype.emitQuickOpenVisibilityChange = function (isVisible) {
            var _this = this;
            if (this.visibilityChangeTimeoutHandle) {
                window.clearTimeout(this.visibilityChangeTimeoutHandle);
            }
            this.visibilityChangeTimeoutHandle = setTimeout(function () {
                if (isVisible) {
                    _this._onShow.fire();
                }
                else {
                    _this._onHide.fire();
                }
                _this.visibilityChangeTimeoutHandle = void 0;
            }, 100 /* to prevent flashing, we accumulate visibility changes over a timeout of 100ms */);
        };
        QuickOpenController.prototype.refresh = function (input) {
            if (!this.quickOpenWidget.isVisible()) {
                return winjs_base_1.TPromise.as(null);
            }
            if (input && this.previousValue !== input) {
                return winjs_base_1.TPromise.as(null);
            }
            return this.show(this.previousValue);
        };
        QuickOpenController.prototype.show = function (prefix, quickNavigateConfiguration) {
            var _this = this;
            this.previousValue = prefix;
            var promiseCompletedOnHide = new winjs_base_1.TPromise(function (c) {
                _this.promisesToCompleteOnHide.push(c);
            });
            // Telemetry: log that quick open is shown and log the mode
            var registry = platform_1.Registry.as(quickopen_1.Extensions.Quickopen);
            var handlerDescriptor = registry.getQuickOpenHandler(prefix);
            if (!handlerDescriptor) {
                var defaultHandlerDescriptors = registry.getDefaultQuickOpenHandlers();
                if (defaultHandlerDescriptors.length > 0) {
                    handlerDescriptor = defaultHandlerDescriptors[0];
                }
            }
            if (handlerDescriptor) {
                this.telemetryService.publicLog('quickOpenWidgetShown', { mode: handlerDescriptor.getId(), quickNavigate: !!quickNavigateConfiguration });
            }
            // Create upon first open
            if (!this.quickOpenWidget) {
                this.quickOpenWidget = new quickOpenWidget_1.QuickOpenWidget(builder_1.withElementById(constants_1.Identifiers.WORKBENCH_CONTAINER).getHTMLElement(), {
                    onOk: function () { return _this.onClose(false); },
                    onCancel: function () { return _this.onCancel(); },
                    onType: function (value) { return _this.onType(value || ''); },
                    onShow: function () {
                        _this.inQuickOpenMode.set(true);
                        _this.emitQuickOpenVisibilityChange(true);
                    },
                    onHide: function () {
                        _this.inQuickOpenMode.reset();
                        // Complete promises that are waiting
                        while (_this.promisesToCompleteOnHide.length) {
                            _this.promisesToCompleteOnHide.pop()(true);
                        }
                        _this.restoreFocus(); // focus back to editor or viewlet
                        _this.emitQuickOpenVisibilityChange(false);
                    }
                }, {
                    inputPlaceHolder: this.hasHandler(HELP_PREFIX) ? nls.localize('quickOpenInput', "Type '?' to get help on the actions you can take from here") : ''
                }, this.telemetryService);
                this.quickOpenWidget.create();
            }
            // Layout
            if (this.layoutDimensions) {
                this.quickOpenWidget.layout(this.layoutDimensions);
            }
            // Show quick open with prefix or editor history
            if (!this.quickOpenWidget.isVisible() || quickNavigateConfiguration) {
                if (prefix) {
                    this.quickOpenWidget.show(prefix);
                }
                else {
                    var editorHistory = this.getEditorHistoryModelWithGroupLabel();
                    if (editorHistory.getEntries().length < 2) {
                        quickNavigateConfiguration = null; // If no entries can be shown, default to normal quick open mode
                    }
                    var autoFocus = void 0;
                    if (!quickNavigateConfiguration) {
                        autoFocus = { autoFocusFirstEntry: true };
                    }
                    else {
                        var visibleEditorCount = this.editorService.getVisibleEditors().length;
                        autoFocus = { autoFocusFirstEntry: visibleEditorCount === 0, autoFocusSecondEntry: visibleEditorCount !== 0 };
                    }
                    this.quickOpenWidget.show(editorHistory, autoFocus, quickNavigateConfiguration);
                }
            }
            else {
                this.quickOpenWidget.show(prefix || '');
            }
            return promiseCompletedOnHide;
        };
        QuickOpenController.prototype.hasHandler = function (prefix) {
            return !!platform_1.Registry.as(quickopen_1.Extensions.Quickopen).getQuickOpenHandler(prefix);
        };
        QuickOpenController.prototype.getEditorHistoryModelWithGroupLabel = function () {
            var entries = this.editorHistoryModel.getEntries();
            // Apply label to first entry
            if (entries.length > 0) {
                entries[0] = new quickOpenModel_1.QuickOpenEntryGroup(entries[0], nls.localize('historyMatches', "recently opened"), false);
            }
            return new quickOpenModel_1.QuickOpenModel(entries, this.actionProvider);
        };
        QuickOpenController.prototype.onCancel = function (notifyHandlers) {
            if (notifyHandlers === void 0) { notifyHandlers = true; }
            // Indicate to handlers
            if (notifyHandlers) {
                this.onClose(true);
            }
        };
        QuickOpenController.prototype.onClose = function (canceled) {
            // Clear state
            this.previousActiveHandlerDescriptor = null;
            // Pass to handlers
            for (var prefix in this.mapResolvedHandlersToPrefix) {
                if (this.mapResolvedHandlersToPrefix.hasOwnProperty(prefix)) {
                    var handler = this.mapResolvedHandlersToPrefix[prefix];
                    handler.onClose(canceled);
                }
            }
        };
        QuickOpenController.prototype.restoreFocus = function () {
            // Try to focus active editor
            var editor = this.editorService.getActiveEditor();
            if (editor) {
                editor.focus();
            }
        };
        QuickOpenController.prototype.onType = function (value) {
            var _this = this;
            this.previousValue = value;
            // look for a handler
            var registry = platform_1.Registry.as(quickopen_1.Extensions.Quickopen);
            var handlerDescriptor = registry.getQuickOpenHandler(value);
            var instantProgress = handlerDescriptor && handlerDescriptor.instantProgress;
            // Use a generated token to avoid race conditions from long running promises
            var currentResultToken = uuid.generateUuid();
            this.currentResultToken = currentResultToken;
            // Reset Progress
            if (!instantProgress) {
                this.quickOpenWidget.getProgressBar().stop().getContainer().hide();
            }
            // Reset Extra Class
            this.quickOpenWidget.setExtraClass(null);
            // Remove leading and trailing whitespace
            var trimmedValue = strings.trim(value);
            // If no value provided, default to editor history
            if (!trimmedValue) {
                this.quickOpenWidget.setInput(this.getEditorHistoryModelWithGroupLabel(), { autoFocusFirstEntry: true });
                return;
            }
            var resultPromise;
            var resultPromiseDone = false;
            if (handlerDescriptor) {
                resultPromise = this.handleSpecificHandler(handlerDescriptor, value, currentResultToken);
            }
            else {
                var defaultHandlers = registry.getDefaultQuickOpenHandlers();
                resultPromise = this.handleDefaultHandlers(defaultHandlers, value, currentResultToken);
            }
            // Remember as the active one
            this.previousActiveHandlerDescriptor = handlerDescriptor;
            // Progress if task takes a long time
            winjs_base_1.TPromise.timeout(instantProgress ? 0 : 800).then(function () {
                if (!resultPromiseDone && currentResultToken === _this.currentResultToken) {
                    _this.quickOpenWidget.getProgressBar().infinite().getContainer().show();
                }
            });
            // Promise done handling
            resultPromise.done(function () {
                resultPromiseDone = true;
                if (currentResultToken === _this.currentResultToken) {
                    _this.quickOpenWidget.getProgressBar().getContainer().hide();
                }
            }, function (error) {
                resultPromiseDone = true;
                errors.onUnexpectedError(error);
                _this.messageService.show(message_1.Severity.Error, types.isString(error) ? new Error(error) : error);
            });
        };
        QuickOpenController.prototype.handleDefaultHandlers = function (defaultHandlers, value, currentResultToken) {
            var _this = this;
            // Fill in history results if matching
            var matchingHistoryEntries = this.editorHistoryModel.getResults(value);
            if (matchingHistoryEntries.length > 0) {
                matchingHistoryEntries[0] = new quickOpenModel_1.QuickOpenEntryGroup(matchingHistoryEntries[0], nls.localize('historyMatches', "recently opened"), false);
            }
            var quickOpenModel = new quickOpenModel_1.QuickOpenModel(matchingHistoryEntries, this.actionProvider);
            // Set input and await additional results from handlers coming in later
            this.quickOpenWidget.setInput(quickOpenModel, { autoFocusFirstEntry: true });
            // If no handler present, return early
            if (defaultHandlers.length === 0) {
                return winjs_base_1.TPromise.as(null);
            }
            // Resolve all default handlers
            var resolvePromises = [];
            defaultHandlers.forEach(function (defaultHandler) {
                resolvePromises.push(_this.resolveHandler(defaultHandler));
            });
            return winjs_base_1.TPromise.join(resolvePromises).then(function (resolvedHandlers) {
                var resultPromises = [];
                resolvedHandlers.forEach(function (resolvedHandler) {
                    // Return early if the handler can not run in the current environment
                    var canRun = resolvedHandler.canRun();
                    if (types.isUndefinedOrNull(canRun) || (typeof canRun === 'boolean' && !canRun) || typeof canRun === 'string') {
                        return;
                    }
                    // Receive Results from Handler and apply
                    resultPromises.push(resolvedHandler.getResults(value).then(function (result) {
                        if (_this.currentResultToken === currentResultToken) {
                            var handlerResults = result && result.entries;
                            if (!handlerResults) {
                                handlerResults = []; // guard against handler returning nothing
                            }
                            _this.mergeResults(quickOpenModel, handlerResults, resolvedHandler.getGroupLabel());
                        }
                    }));
                });
                return winjs_base_1.TPromise.join(resultPromises).then(function () { return void 0; });
            });
        };
        QuickOpenController.prototype.mergeResults = function (quickOpenModel, handlerResults, groupLabel) {
            // Remove results already showing by checking for a "resource" property
            var mapEntryToResource = this.mapEntriesToResource(quickOpenModel);
            var additionalHandlerResults = [];
            for (var i = 0; i < handlerResults.length; i++) {
                var result = handlerResults[i];
                var resource = result.getResource();
                if (!resource || !mapEntryToResource[resource.toString()]) {
                    additionalHandlerResults.push(result);
                }
            }
            // Show additional handler results below any existing results
            if (additionalHandlerResults.length > 0) {
                var useTopBorder = quickOpenModel.getEntries().length > 0;
                additionalHandlerResults[0] = new quickOpenModel_1.QuickOpenEntryGroup(additionalHandlerResults[0], groupLabel, useTopBorder);
                quickOpenModel.addEntries(additionalHandlerResults);
                this.quickOpenWidget.refresh(quickOpenModel, { autoFocusFirstEntry: true });
            }
            else if (quickOpenModel.getEntries().length === 0) {
                quickOpenModel.addEntries([new PlaceholderQuickOpenEntry(nls.localize('noResultsFound1', "No results found"))]);
                this.quickOpenWidget.refresh(quickOpenModel, { autoFocusFirstEntry: true });
            }
        };
        QuickOpenController.prototype.handleSpecificHandler = function (handlerDescriptor, value, currentResultToken) {
            var _this = this;
            return this.resolveHandler(handlerDescriptor).then(function (resolvedHandler) {
                // Remove handler prefix from search value
                value = value.substr(handlerDescriptor.prefix.length);
                // Return early if the handler can not run in the current environment and inform the user
                var canRun = resolvedHandler.canRun();
                if (types.isUndefinedOrNull(canRun) || (typeof canRun === 'boolean' && !canRun) || typeof canRun === 'string') {
                    var placeHolderLabel = (typeof canRun === 'string') ? canRun : nls.localize('canNotRunPlaceholder', "This quick open handler can not be used in the current context");
                    var model = new quickOpenModel_1.QuickOpenModel([new PlaceholderQuickOpenEntry(placeHolderLabel)], _this.actionProvider);
                    _this.showModel(model, resolvedHandler.getAutoFocus(value), resolvedHandler.getAriaLabel());
                    return winjs_base_1.TPromise.as(null);
                }
                // Support extra class from handler
                var extraClass = resolvedHandler.getClass();
                if (extraClass) {
                    _this.quickOpenWidget.setExtraClass(extraClass);
                }
                // When handlers change, clear the result list first before loading the new results
                if (_this.previousActiveHandlerDescriptor !== handlerDescriptor) {
                    _this.clearModel();
                }
                // Receive Results from Handler and apply
                return resolvedHandler.getResults(value).then(function (result) {
                    if (_this.currentResultToken === currentResultToken) {
                        if (!result || !result.entries.length) {
                            var model = new quickOpenModel_1.QuickOpenModel([new PlaceholderQuickOpenEntry(resolvedHandler.getEmptyLabel(value))]);
                            _this.showModel(model, resolvedHandler.getAutoFocus(value), resolvedHandler.getAriaLabel());
                        }
                        else {
                            _this.showModel(result, resolvedHandler.getAutoFocus(value), resolvedHandler.getAriaLabel());
                        }
                    }
                });
            });
        };
        QuickOpenController.prototype.showModel = function (model, autoFocus, ariaLabel) {
            // If the given model is already set in the widget, refresh and return early
            if (this.quickOpenWidget.getInput() === model) {
                this.quickOpenWidget.refresh(model, autoFocus);
                return;
            }
            // Otherwise just set it
            this.quickOpenWidget.setInput(model, autoFocus, ariaLabel);
        };
        QuickOpenController.prototype.clearModel = function () {
            this.showModel(new quickOpenModel_1.QuickOpenModel(), null);
        };
        QuickOpenController.prototype.mapEntriesToResource = function (model) {
            var entries = model.getEntries();
            var mapEntryToPath = {};
            entries.forEach(function (entry) {
                if (entry.getResource()) {
                    mapEntryToPath[entry.getResource().toString()] = entry;
                }
            });
            return mapEntryToPath;
        };
        QuickOpenController.prototype.resolveHandler = function (handler) {
            var _this = this;
            var id = handler.getId();
            // Return Cached
            if (this.mapResolvedHandlersToPrefix[id]) {
                return winjs_base_1.TPromise.as(this.mapResolvedHandlersToPrefix[id]);
            }
            // Otherwise load and create
            return this.instantiationService.createInstance(handler).then(function (resolvedHandler) {
                _this.mapResolvedHandlersToPrefix[id] = resolvedHandler;
                return resolvedHandler;
            }, function (error) {
                return winjs_base_1.TPromise.wrapError('Unable to instanciate quick open handler ' + handler.moduleName + ' - ' + handler.ctorName + ': ' + JSON.stringify(error));
            });
        };
        QuickOpenController.prototype.shutdown = function () {
            // Save Editor Input History
            this.saveEditorHistory(false);
            // Call Super
            _super.prototype.shutdown.call(this);
        };
        QuickOpenController.prototype.saveEditorHistory = function (toLocalStorage) {
            if (!this.memento[EDITOR_HISTORY_STORAGE_KEY]) {
                this.memento[EDITOR_HISTORY_STORAGE_KEY] = {};
            }
            this.editorHistoryModel.saveTo(this.memento[EDITOR_HISTORY_STORAGE_KEY]);
            if (toLocalStorage) {
                this.saveMemento();
            }
        };
        QuickOpenController.prototype.layout = function (dimension) {
            this.layoutDimensions = dimension;
            if (this.quickOpenWidget) {
                this.quickOpenWidget.layout(this.layoutDimensions);
            }
            if (this.pickOpenWidget) {
                this.pickOpenWidget.layout(this.layoutDimensions);
            }
        };
        QuickOpenController.prototype.dispose = function () {
            if (this.quickOpenWidget) {
                this.quickOpenWidget.dispose();
            }
            if (this.pickOpenWidget) {
                this.pickOpenWidget.dispose();
            }
            _super.prototype.dispose.call(this);
        };
        return QuickOpenController;
    }(component_1.WorkbenchComponent));
    exports.QuickOpenController = QuickOpenController;
    var PlaceholderQuickOpenEntry = (function (_super) {
        __extends(PlaceholderQuickOpenEntry, _super);
        function PlaceholderQuickOpenEntry(placeHolderLabel) {
            _super.call(this);
            this.placeHolderLabel = placeHolderLabel;
        }
        PlaceholderQuickOpenEntry.prototype.getLabel = function () {
            return this.placeHolderLabel;
        };
        return PlaceholderQuickOpenEntry;
    }(quickOpenModel_1.QuickOpenEntryGroup));
    var PickOpenEntry = (function (_super) {
        __extends(PickOpenEntry, _super);
        function PickOpenEntry(label, description, detail, onPreview, hasSeparator, separatorLabel) {
            _super.call(this, label);
            this.onPreview = onPreview;
            this.hasSeparator = hasSeparator;
            this.separatorLabel = separatorLabel;
            this.description = description;
            this.detail = detail;
        }
        Object.defineProperty(PickOpenEntry.prototype, "selected", {
            get: function () {
                return this._selected;
            },
            enumerable: true,
            configurable: true
        });
        PickOpenEntry.prototype.getDescription = function () {
            return this.description;
        };
        PickOpenEntry.prototype.getDetail = function () {
            return this.detail;
        };
        PickOpenEntry.prototype.showBorder = function () {
            return this.hasSeparator;
        };
        PickOpenEntry.prototype.getGroupLabel = function () {
            return this.separatorLabel;
        };
        PickOpenEntry.prototype.run = function (mode, context) {
            if (mode === quickOpen_1.Mode.OPEN) {
                this._selected = true;
                return true;
            }
            if (mode === quickOpen_1.Mode.PREVIEW && this.onPreview) {
                this.onPreview();
            }
            return false;
        };
        return PickOpenEntry;
    }(PlaceholderQuickOpenEntry));
    var PickOpenItem = (function (_super) {
        __extends(PickOpenItem, _super);
        function PickOpenItem(label, description, height, renderFn, onPreview) {
            _super.call(this);
            this.label = label;
            this.description = description;
            this.height = height;
            this.renderFn = renderFn;
            this.onPreview = onPreview;
        }
        PickOpenItem.prototype.getHeight = function () {
            return this.height;
        };
        PickOpenItem.prototype.render = function (tree, container, previousCleanupFn) {
            return this.renderFn(tree, container, previousCleanupFn);
        };
        Object.defineProperty(PickOpenItem.prototype, "selected", {
            get: function () {
                return this._selected;
            },
            enumerable: true,
            configurable: true
        });
        PickOpenItem.prototype.getLabel = function () {
            return this.label;
        };
        PickOpenItem.prototype.getDescription = function () {
            return this.description;
        };
        PickOpenItem.prototype.run = function (mode, context) {
            if (mode === quickOpen_1.Mode.OPEN) {
                this._selected = true;
                return true;
            }
            if (mode === quickOpen_1.Mode.PREVIEW && this.onPreview) {
                this.onPreview();
            }
            return false;
        };
        return PickOpenItem;
    }(quickOpenModel_1.QuickOpenEntryItem));
});
//# sourceMappingURL=quickOpenController.js.map