/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls', 'vs/base/common/timer', 'vs/base/common/uuid', 'vs/base/common/winjs.base', 'vs/platform/platform', 'vs/base/browser/builder', 'vs/base/common/events', 'vs/base/common/strings', 'vs/base/common/types', 'vs/base/common/errors', 'vs/base/browser/ui/toolbar/toolbar', 'vs/base/browser/ui/actionbar/actionbar', 'vs/base/browser/ui/progressbar/progressbar', 'vs/workbench/browser/actionBarRegistry', 'vs/workbench/browser/part', 'vs/workbench/common/events', 'vs/workbench/browser/composite', 'vs/workbench/services/progress/browser/progressService', 'vs/platform/storage/common/storage', 'vs/platform/message/common/message', 'vs/css!./media/compositePart'], function (require, exports, nls, timer, uuid, winjs_base_1, platform_1, builder_1, events, strings, types, errors, toolbar_1, actionbar_1, progressbar_1, actionBarRegistry_1, part_1, events_1, composite_1, progressService_1, storage_1, message_1) {
    "use strict";
    var CompositePart = (function (_super) {
        __extends(CompositePart, _super);
        function CompositePart(messageService, storageService, eventService, telemetryService, contextMenuService, partService, keybindingService, registry, activeCompositeSettingsKey, nameForTelemetry, compositeCssClass, actionContributionScope, id) {
            _super.call(this, id);
            this.messageService = messageService;
            this.storageService = storageService;
            this.eventService = eventService;
            this.telemetryService = telemetryService;
            this.contextMenuService = contextMenuService;
            this.partService = partService;
            this.keybindingService = keybindingService;
            this.registry = registry;
            this.activeCompositeSettingsKey = activeCompositeSettingsKey;
            this.nameForTelemetry = nameForTelemetry;
            this.compositeCssClass = compositeCssClass;
            this.actionContributionScope = actionContributionScope;
            this.activeCompositeListeners = [];
            this.instantiatedCompositeListeners = [];
            this.mapCompositeToCompositeContainer = {};
            this.mapActionsBindingToComposite = {};
            this.mapProgressServiceToComposite = {};
            this.activeComposite = null;
            this.instantiatedComposits = [];
            this.compositeLoaderPromises = {};
        }
        CompositePart.prototype.setInstantiationService = function (service) {
            this.instantiationService = service;
        };
        CompositePart.prototype.openComposite = function (id, focus) {
            // Check if composite already visible and just focus in that case
            if (this.activeComposite && this.activeComposite.getId() === id) {
                if (focus) {
                    this.activeComposite.focus();
                }
                // Fullfill promise with composite that is being opened
                return winjs_base_1.TPromise.as(this.activeComposite);
            }
            // Open
            return this.doOpenComposite(id, focus);
        };
        CompositePart.prototype.doOpenComposite = function (id, focus) {
            var _this = this;
            var timerEvent = timer.start(timer.Topic.WORKBENCH, strings.format('Open Composite {0}', id.substr(id.lastIndexOf('.') + 1)));
            // Use a generated token to avoid race conditions from long running promises
            var currentCompositeOpenToken = uuid.generateUuid();
            this.currentCompositeOpenToken = currentCompositeOpenToken;
            // Emit Composite Opening Event
            this.emit(events_1.EventType.COMPOSITE_OPENING, new events_1.CompositeEvent(id));
            // Hide current
            var hidePromise;
            if (this.activeComposite) {
                hidePromise = this.hideActiveComposite();
            }
            else {
                hidePromise = winjs_base_1.TPromise.as(null);
            }
            return hidePromise.then(function () {
                // Update Title
                _this.updateTitle(id);
                // Create composite
                return _this.createComposite(id, true).then(function (composite) {
                    // Check if another composite opened meanwhile and return in that case
                    if ((_this.currentCompositeOpenToken !== currentCompositeOpenToken) || (_this.activeComposite && _this.activeComposite.getId() !== composite.getId())) {
                        timerEvent.stop();
                        return winjs_base_1.TPromise.as(null);
                    }
                    // Check if composite already visible and just focus in that case
                    if (_this.activeComposite && _this.activeComposite.getId() === composite.getId()) {
                        if (focus) {
                            composite.focus();
                        }
                        timerEvent.stop();
                        // Fullfill promise with composite that is being opened
                        return winjs_base_1.TPromise.as(composite);
                    }
                    // Show Composite and Focus
                    return _this.showComposite(composite).then(function () {
                        if (focus) {
                            composite.focus();
                        }
                        timerEvent.stop();
                        // Fullfill promise with composite that is being opened
                        return composite;
                    });
                });
            });
        };
        CompositePart.prototype.createComposite = function (id, isActive) {
            var _this = this;
            // Check if composite is already created
            for (var i = 0; i < this.instantiatedComposits.length; i++) {
                if (this.instantiatedComposits[i].getId() === id) {
                    return winjs_base_1.TPromise.as(this.instantiatedComposits[i]);
                }
            }
            // Instantiate composite from registry otherwise
            var compositeDescriptor = this.registry.getComposite(id);
            if (compositeDescriptor) {
                var loaderPromise = this.compositeLoaderPromises[id];
                if (!loaderPromise) {
                    var progressService_2 = new progressService_1.WorkbenchProgressService(this.eventService, this.progressBar, compositeDescriptor.id, isActive);
                    var services = {
                        progressService: progressService_2
                    };
                    var compositeInstantiationService = this.instantiationService.createChild(services);
                    loaderPromise = compositeInstantiationService.createInstance(compositeDescriptor).then(function (composite) {
                        _this.mapProgressServiceToComposite[composite.getId()] = progressService_2;
                        // Remember as Instantiated
                        _this.instantiatedComposits.push(composite);
                        // Register to title area update events from the composite
                        _this.instantiatedCompositeListeners.push(composite.addListener(composite_1.EventType.INTERNAL_COMPOSITE_TITLE_AREA_UPDATE, function (e) { _this.onTitleAreaUpdate(e); }));
                        // Remove from Promises Cache since Loaded
                        delete _this.compositeLoaderPromises[id];
                        return composite;
                    });
                    // Report progress for slow loading composits
                    progressService_2.showWhile(loaderPromise, this.partService.isCreated() ? 800 : 3200 /* less ugly initial startup */);
                    // Add to Promise Cache until Loaded
                    this.compositeLoaderPromises[id] = loaderPromise;
                }
                return loaderPromise;
            }
            throw new Error(strings.format('Unable to find composite with id {0}', id));
        };
        CompositePart.prototype.showComposite = function (composite) {
            var _this = this;
            // Remember Composite
            this.activeComposite = composite;
            // Store in preferences
            this.storageService.store(this.activeCompositeSettingsKey, this.activeComposite.getId(), storage_1.StorageScope.WORKSPACE);
            // Remember
            this.lastActiveCompositeId = this.activeComposite.getId();
            // Register as Emitter to Workbench Bus
            this.activeCompositeListeners.push(this.eventService.addEmitter(this.activeComposite, this.activeComposite.getId()));
            var createCompositePromise;
            // Composits created for the first time
            var compositeContainer = this.mapCompositeToCompositeContainer[composite.getId()];
            if (!compositeContainer) {
                // Build Container off-DOM
                compositeContainer = builder_1.$().div({
                    'class': ['composite', this.compositeCssClass],
                    id: composite.getId()
                }, function (div) {
                    createCompositePromise = composite.create(div);
                });
                // Remember composite container
                this.mapCompositeToCompositeContainer[composite.getId()] = compositeContainer;
            }
            else {
                createCompositePromise = winjs_base_1.TPromise.as(null);
            }
            // Report progress for slow loading composits (but only if we did not create the composits before already)
            var progressService = this.mapProgressServiceToComposite[composite.getId()];
            if (progressService && !compositeContainer) {
                this.mapProgressServiceToComposite[composite.getId()].showWhile(createCompositePromise, this.partService.isCreated() ? 800 : 3200 /* less ugly initial startup */);
            }
            // Fill Content and Actions
            return createCompositePromise.then(function () {
                // Make sure that the user meanwhile did not open another composite or closed the part containing the composite
                if (!_this.activeComposite || composite.getId() !== _this.activeComposite.getId()) {
                    return;
                }
                // Take Composite on-DOM and show
                compositeContainer.build(_this.getContentArea());
                compositeContainer.show();
                // Setup action runner
                _this.toolBar.actionRunner = composite.getActionRunner();
                // Update title with composite title if it differs from descriptor
                var descriptor = _this.registry.getComposite(composite.getId());
                if (descriptor && descriptor.name !== composite.getTitle()) {
                    _this.updateTitle(composite.getId(), composite.getTitle());
                }
                // Handle Composite Actions
                var actionsBinding = _this.mapActionsBindingToComposite[composite.getId()];
                if (!actionsBinding) {
                    actionsBinding = _this.collectCompositeActions(composite);
                    _this.mapActionsBindingToComposite[composite.getId()] = actionsBinding;
                }
                actionsBinding();
                if (_this.telemetryActionsListener) {
                    _this.telemetryActionsListener.dispose();
                    _this.telemetryActionsListener = null;
                }
                // Action Run Handling
                _this.telemetryActionsListener = _this.toolBar.actionRunner.addListener2(events.EventType.RUN, function (e) {
                    // Check for Error
                    if (e.error && !errors.isPromiseCanceledError(e.error)) {
                        _this.messageService.show(message_1.Severity.Error, e.error);
                    }
                    // Log in telemetry
                    if (_this.telemetryService) {
                        _this.telemetryService.publicLog('workbenchActionExecuted', { id: e.action.id, from: _this.nameForTelemetry });
                    }
                });
                // Indicate to composite that it is now visible
                return composite.setVisible(true).then(function () {
                    // Make sure that the user meanwhile did not open another composite or closed the part containing the composite
                    if (!_this.activeComposite || composite.getId() !== _this.activeComposite.getId()) {
                        return;
                    }
                    // Make sure the composite is layed out
                    if (_this.contentAreaSize) {
                        composite.layout(_this.contentAreaSize);
                    }
                    // Emit Composite Opened Event
                    _this.emit(events_1.EventType.COMPOSITE_OPENED, new events_1.CompositeEvent(_this.activeComposite.getId()));
                });
            }, function (error) { return _this.onError(error); });
        };
        CompositePart.prototype.onTitleAreaUpdate = function (e) {
            // Active Composite
            if (this.activeComposite && this.activeComposite.getId() === e.compositeId) {
                // Title
                this.updateTitle(this.activeComposite.getId(), this.activeComposite.getTitle());
                // Actions
                var actionsBinding = this.collectCompositeActions(this.activeComposite);
                this.mapActionsBindingToComposite[this.activeComposite.getId()] = actionsBinding;
                actionsBinding();
            }
            else {
                delete this.mapActionsBindingToComposite[e.compositeId];
            }
        };
        CompositePart.prototype.updateTitle = function (compositeId, compositeTitle) {
            var _this = this;
            var compositeDescriptor = this.registry.getComposite(compositeId);
            if (!compositeDescriptor) {
                return;
            }
            if (!compositeTitle) {
                compositeTitle = compositeDescriptor.name;
            }
            var keybinding = null;
            var keys = this.keybindingService.lookupKeybindings(compositeId).map(function (k) { return _this.keybindingService.getLabelFor(k); });
            if (keys && keys.length) {
                keybinding = keys[0];
            }
            this.titleLabel.safeInnerHtml(compositeTitle);
            this.titleLabel.title(keybinding ? nls.localize('compositeTitleTooltip', "{0} ({1})", compositeTitle, keybinding) : compositeTitle);
            this.toolBar.setAriaLabel(nls.localize('ariaCompositeToolbarLabel', "{0} actions", compositeTitle));
        };
        CompositePart.prototype.collectCompositeActions = function (composite) {
            // From Composite
            var primaryActions = composite.getActions();
            var secondaryActions = composite.getSecondaryActions();
            // From Part
            primaryActions.push.apply(primaryActions, this.getActions());
            secondaryActions.push.apply(secondaryActions, this.getSecondaryActions());
            // From Contributions
            var actionBarRegistry = platform_1.Registry.as(actionBarRegistry_1.Extensions.Actionbar);
            primaryActions.push.apply(primaryActions, actionBarRegistry.getActionBarActionsForContext(this.actionContributionScope, composite));
            secondaryActions.push.apply(secondaryActions, actionBarRegistry.getSecondaryActionBarActionsForContext(this.actionContributionScope, composite));
            // Return fn to set into toolbar
            return this.toolBar.setActions(actionBarRegistry_1.prepareActions(primaryActions), actionBarRegistry_1.prepareActions(secondaryActions));
        };
        CompositePart.prototype.getActiveComposite = function () {
            return this.activeComposite;
        };
        CompositePart.prototype.getLastActiveCompositetId = function () {
            return this.lastActiveCompositeId;
        };
        CompositePart.prototype.hideActiveComposite = function () {
            var _this = this;
            if (!this.activeComposite) {
                return winjs_base_1.TPromise.as(null); // Nothing to do
            }
            var composite = this.activeComposite;
            this.activeComposite = null;
            var compositeContainer = this.mapCompositeToCompositeContainer[composite.getId()];
            // Indicate to Composite
            return composite.setVisible(false).then(function () {
                // Take Container Off-DOM and hide
                compositeContainer.offDOM();
                compositeContainer.hide();
                // Clear any running Progress
                _this.progressBar.stop().getContainer().hide();
                // Empty Actions
                _this.toolBar.setActions([])();
                // Clear Listeners
                while (_this.activeCompositeListeners.length) {
                    _this.activeCompositeListeners.pop()();
                }
                // Emit Composite Closed Event
                _this.emit(events_1.EventType.COMPOSITE_CLOSED, new events_1.CompositeEvent(composite.getId()));
            });
        };
        CompositePart.prototype.createTitleArea = function (parent) {
            var _this = this;
            // Title Area Container
            var titleArea = builder_1.$(parent).div({
                'class': ['composite', 'title']
            });
            // Left Title Label
            builder_1.$(titleArea).div({
                'class': 'title-label'
            }, function (div) {
                _this.titleLabel = div.span();
            });
            // Right Actions Container
            builder_1.$(titleArea).div({
                'class': 'title-actions'
            }, function (div) {
                // Toolbar
                _this.toolBar = new toolbar_1.ToolBar(div.getHTMLElement(), _this.contextMenuService, {
                    actionItemProvider: function (action) { return _this.actionItemProvider(action); },
                    orientation: actionbar_1.ActionsOrientation.HORIZONTAL
                });
            });
            return titleArea;
        };
        CompositePart.prototype.actionItemProvider = function (action) {
            var actionItem;
            // Check Active Composite
            if (this.activeComposite) {
                actionItem = this.activeComposite.getActionItem(action);
            }
            // Check Registry
            if (!actionItem) {
                var actionBarRegistry = platform_1.Registry.as(actionBarRegistry_1.Extensions.Actionbar);
                actionItem = actionBarRegistry.getActionItemForContext(this.actionContributionScope, toolbar_1.CONTEXT, action);
            }
            return actionItem;
        };
        CompositePart.prototype.createContentArea = function (parent) {
            var _this = this;
            return builder_1.$(parent).div({
                'class': 'content'
            }, function (div) {
                _this.progressBar = new progressbar_1.ProgressBar(div);
                _this.progressBar.getContainer().hide();
            });
        };
        CompositePart.prototype.onError = function (error) {
            this.messageService.show(message_1.Severity.Error, types.isString(error) ? new Error(error) : error);
        };
        CompositePart.prototype.getActions = function () {
            return [];
        };
        CompositePart.prototype.getSecondaryActions = function () {
            return [];
        };
        CompositePart.prototype.layout = function (dimension) {
            // Pass to super
            var sizes = _super.prototype.layout.call(this, dimension);
            // Pass Contentsize to composite
            this.contentAreaSize = sizes[1];
            if (this.activeComposite) {
                this.activeComposite.layout(this.contentAreaSize);
            }
            return sizes;
        };
        CompositePart.prototype.shutdown = function () {
            this.instantiatedComposits.forEach(function (i) { return i.shutdown(); });
            _super.prototype.shutdown.call(this);
        };
        CompositePart.prototype.dispose = function () {
            this.mapCompositeToCompositeContainer = null;
            this.mapProgressServiceToComposite = null;
            this.mapActionsBindingToComposite = null;
            for (var i = 0; i < this.instantiatedComposits.length; i++) {
                this.instantiatedComposits[i].dispose();
            }
            this.instantiatedComposits = [];
            while (this.activeCompositeListeners.length) {
                this.activeCompositeListeners.pop()();
            }
            while (this.instantiatedCompositeListeners.length) {
                this.instantiatedCompositeListeners.pop()();
            }
            this.progressBar.dispose();
            this.toolBar.dispose();
            // Super Dispose
            _super.prototype.dispose.call(this);
        };
        return CompositePart;
    }(part_1.Part));
    exports.CompositePart = CompositePart;
});
