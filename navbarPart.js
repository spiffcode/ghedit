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
define(["require", "exports", 'vs/base/browser/dom', 'vs/base/common/types', 'vs/nls', 'vs/base/common/errors', 'vs/base/common/winjs.base', 'vs/base/common/lifecycle', 'vs/base/browser/builder', 'vs/base/browser/ui/octiconLabel/octiconLabel', 'vs/platform/platform', 'vs/platform/keybinding/common/keybindingService', 'vs/workbench/services/editor/common/editorService', 'vs/workbench/browser/part', 'vs/workbench/common/actionRegistry', 'navbar', 'vs/platform/instantiation/common/instantiation', 'vs/platform/telemetry/common/telemetry', 'vs/platform/message/common/message', 'navbarService', 'vs/css!./navbarPart'], function (require, exports, dom, types, nls, errors_1, winjs_base_1, lifecycle_1, builder_1, octiconLabel_1, platform_1, keybindingService_1, editorService_1, part_1, actionRegistry_1, navbar_1, instantiation_1, telemetry_1, message_1, navbarService_1) {
    // Sort of forked from 31ce12f023580d67a66d14843e7f9983caadbe56:./vs/workbench/browser/parts/statusbar/statusbarPart.ts
    'use strict';
    var NavbarPart = (function (_super) {
        __extends(NavbarPart, _super);
        function NavbarPart(id, instantiationService) {
            _super.call(this, id);
            this.instantiationService = instantiationService;
            this.serviceId = navbarService_1.INavbarService;
            this.toDispose = [];
        }
        NavbarPart.prototype.addEntry = function (entry, alignment, priority) {
            if (priority === void 0) { priority = 0; }
            var item = this.instantiationService.createInstance(NavBarEntryItem, entry);
            return this.addItem(item, alignment, priority);
        };
        NavbarPart.prototype.addItem = function (item, alignment, priority) {
            if (priority === void 0) { priority = 0; }
            var el = this.doCreateNavItem(alignment, priority);
            // Render entry in nav bar
            var toDispose = item.render(el);
            // Insert according to priority
            var container = this.navItemsContainer.getHTMLElement();
            var neighbours = this.getEntries(alignment);
            var inserted = false;
            for (var i = 0; i < neighbours.length; i++) {
                var neighbour = neighbours[i];
                var nPriority = builder_1.$(neighbour).getProperty(NavbarPart.PRIORITY_PROP);
                if (alignment === navbar_1.NavbarAlignment.LEFT && nPriority < priority ||
                    alignment === navbar_1.NavbarAlignment.RIGHT && nPriority > priority) {
                    container.insertBefore(el, neighbour);
                    inserted = true;
                    break;
                }
            }
            if (!inserted) {
                container.appendChild(el);
            }
            return {
                dispose: function () {
                    builder_1.$(el).destroy();
                    if (toDispose) {
                        toDispose.dispose();
                    }
                }
            };
        };
        NavbarPart.prototype.getEntries = function (alignment) {
            var entries = [];
            var container = this.navItemsContainer.getHTMLElement();
            var children = container.children;
            for (var i = 0; i < children.length; i++) {
                var childElement = children.item(i);
                if (builder_1.$(childElement).getProperty(NavbarPart.ALIGNMENT_PROP) === alignment) {
                    entries.push(childElement);
                }
            }
            return entries;
        };
        NavbarPart.prototype.createContentArea = function (parent) {
            var _this = this;
            this.navItemsContainer = builder_1.$(parent);
            // Fill in initial items that were contributed from the registry
            var registry = platform_1.Registry.as(navbar_1.Extensions.Navbar);
            var leftDescriptors = registry.items.filter(function (d) { return d.alignment === navbar_1.NavbarAlignment.LEFT; }).sort(function (a, b) { return b.priority - a.priority; });
            var rightDescriptors = registry.items.filter(function (d) { return d.alignment === navbar_1.NavbarAlignment.RIGHT; }).sort(function (a, b) { return a.priority - b.priority; });
            var descriptors = rightDescriptors.concat(leftDescriptors); // right first because they float
            (_a = this.toDispose).push.apply(_a, descriptors.map(function (descriptor) {
                var item = _this.instantiationService.createInstance(descriptor.syncDescriptor);
                var el = _this.doCreateNavItem(descriptor.alignment, descriptor.priority);
                var dispose = item.render(el);
                _this.navItemsContainer.append(el);
                return dispose;
            }));
            return this.navItemsContainer;
            var _a;
        };
        NavbarPart.prototype.doCreateNavItem = function (alignment, priority) {
            if (priority === void 0) { priority = 0; }
            var el = document.createElement('div');
            dom.addClass(el, 'navbar-item');
            if (alignment === navbar_1.NavbarAlignment.RIGHT) {
                dom.addClass(el, 'right');
            }
            else {
                dom.addClass(el, 'left');
            }
            builder_1.$(el).setProperty(NavbarPart.PRIORITY_PROP, priority);
            builder_1.$(el).setProperty(NavbarPart.ALIGNMENT_PROP, alignment);
            return el;
        };
        NavbarPart.prototype.dispose = function () {
            this.toDispose = lifecycle_1.dispose(this.toDispose);
            _super.prototype.dispose.call(this);
        };
        NavbarPart.PRIORITY_PROP = 'priority';
        NavbarPart.ALIGNMENT_PROP = 'alignment';
        NavbarPart = __decorate([
            __param(1, instantiation_1.IInstantiationService)
        ], NavbarPart);
        return NavbarPart;
    }(part_1.Part));
    exports.NavbarPart = NavbarPart;
    var NavBarEntryItem = (function () {
        function NavBarEntryItem(entry, keybindingService, instantiationService, messageService, telemetryService, editorService) {
            this.keybindingService = keybindingService;
            this.instantiationService = instantiationService;
            this.messageService = messageService;
            this.telemetryService = telemetryService;
            this.editorService = editorService;
            this.entry = entry;
        }
        NavBarEntryItem.prototype.render = function (el) {
            var _this = this;
            var toDispose = [];
            dom.addClass(el, 'navbar-entry');
            // Text Container
            var textContainer;
            if (this.entry.command) {
                textContainer = document.createElement('a');
                builder_1.$(textContainer).on('click', function () { return _this.executeCommand(_this.entry.command); }, toDispose);
            }
            else {
                textContainer = document.createElement('span');
            }
            // Label
            new octiconLabel_1.OcticonLabel(textContainer).text = this.entry.text;
            // Tooltip
            if (this.entry.tooltip) {
                builder_1.$(textContainer).title(this.entry.tooltip);
            }
            // Color
            if (this.entry.color) {
                builder_1.$(textContainer).color(this.entry.color);
            }
            el.appendChild(textContainer);
            return {
                dispose: function () {
                    toDispose = lifecycle_1.dispose(toDispose);
                }
            };
        };
        NavBarEntryItem.prototype.executeCommand = function (id) {
            var _this = this;
            var action;
            var activeEditor = this.editorService.getActiveEditor();
            // Lookup built in commands
            var builtInActionDescriptor = platform_1.Registry.as(actionRegistry_1.Extensions.WorkbenchActions).getWorkbenchAction(id);
            if (builtInActionDescriptor) {
                action = this.instantiationService.createInstance(builtInActionDescriptor.syncDescriptor);
            }
            // Lookup editor commands
            if (!action) {
                var activeEditorControl = (activeEditor ? activeEditor.getControl() : null);
                if (activeEditorControl && types.isFunction(activeEditorControl.getAction)) {
                    action = activeEditorControl.getAction(id);
                }
            }
            // Some actions or commands might only be enabled for an active editor, so focus it first
            if (activeEditor) {
                activeEditor.focus();
            }
            // Run it if enabled
            if (action) {
                if (action.enabled) {
                    this.telemetryService.publicLog('workbenchActionExecuted', { id: action.id, from: 'nav bar' });
                    (action.run() || winjs_base_1.TPromise.as(null)).done(function () {
                        action.dispose();
                    }, function (err) { return _this.messageService.show(message_1.Severity.Error, errors_1.toErrorMessage(err)); });
                }
                else {
                    this.messageService.show(message_1.Severity.Warning, nls.localize('canNotRun', "Command '{0}' can not be run from here.", action.label || id));
                }
            }
            else {
                this.keybindingService.executeCommand(id).done(undefined, function (err) { return _this.messageService.show(message_1.Severity.Error, errors_1.toErrorMessage(err)); });
            }
        };
        NavBarEntryItem = __decorate([
            __param(1, keybindingService_1.IKeybindingService),
            __param(2, instantiation_1.IInstantiationService),
            __param(3, message_1.IMessageService),
            __param(4, telemetry_1.ITelemetryService),
            __param(5, editorService_1.IWorkbenchEditorService)
        ], NavBarEntryItem);
        return NavBarEntryItem;
    }());
});
//# sourceMappingURL=navbarPart.js.map