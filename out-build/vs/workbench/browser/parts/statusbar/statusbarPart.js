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
define(["require", "exports", 'vs/base/browser/dom', 'vs/base/common/types', 'vs/nls', 'vs/base/common/errors', 'vs/base/common/winjs.base', 'vs/base/common/lifecycle', 'vs/base/browser/builder', 'vs/base/browser/ui/octiconLabel/octiconLabel', 'vs/platform/platform', 'vs/platform/keybinding/common/keybindingService', 'vs/workbench/services/editor/common/editorService', 'vs/workbench/browser/part', 'vs/workbench/common/actionRegistry', 'vs/workbench/browser/parts/statusbar/statusbar', 'vs/platform/instantiation/common/instantiation', 'vs/platform/telemetry/common/telemetry', 'vs/platform/message/common/message', 'vs/workbench/services/statusbar/common/statusbarService', 'vs/css!./media/statusbarPart'], function (require, exports, dom, types, nls, errors_1, winjs_base_1, lifecycle_1, builder_1, octiconLabel_1, platform_1, keybindingService_1, editorService_1, part_1, actionRegistry_1, statusbar_1, instantiation_1, telemetry_1, message_1, statusbarService_1) {
    'use strict';
    var StatusbarPart = (function (_super) {
        __extends(StatusbarPart, _super);
        function StatusbarPart(id) {
            _super.call(this, id);
            this.serviceId = statusbarService_1.IStatusbarService;
            this.toDispose = [];
        }
        StatusbarPart.prototype.setInstantiationService = function (service) {
            this.instantiationService = service;
        };
        StatusbarPart.prototype.addEntry = function (entry, alignment, priority) {
            if (priority === void 0) { priority = 0; }
            // Render entry in status bar
            var el = this.doCreateStatusItem(alignment, priority);
            var item = this.instantiationService.createInstance(StatusBarEntryItem, entry);
            var toDispose = item.render(el);
            // Insert according to priority
            var container = this.statusItemsContainer.getHTMLElement();
            var neighbours = this.getEntries(alignment);
            var inserted = false;
            for (var i = 0; i < neighbours.length; i++) {
                var neighbour = neighbours[i];
                var nPriority = builder_1.$(neighbour).getProperty(StatusbarPart.PRIORITY_PROP);
                if (alignment === statusbar_1.StatusbarAlignment.LEFT && nPriority < priority ||
                    alignment === statusbar_1.StatusbarAlignment.RIGHT && nPriority > priority) {
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
        StatusbarPart.prototype.getEntries = function (alignment) {
            var entries = [];
            var container = this.statusItemsContainer.getHTMLElement();
            var children = container.children;
            for (var i = 0; i < children.length; i++) {
                var childElement = children.item(i);
                if (builder_1.$(childElement).getProperty(StatusbarPart.ALIGNMENT_PROP) === alignment) {
                    entries.push(childElement);
                }
            }
            return entries;
        };
        StatusbarPart.prototype.createContentArea = function (parent) {
            var _this = this;
            this.statusItemsContainer = builder_1.$(parent);
            // Fill in initial items that were contributed from the registry
            var registry = platform_1.Registry.as(statusbar_1.Extensions.Statusbar);
            var leftDescriptors = registry.items.filter(function (d) { return d.alignment === statusbar_1.StatusbarAlignment.LEFT; }).sort(function (a, b) { return b.priority - a.priority; });
            var rightDescriptors = registry.items.filter(function (d) { return d.alignment === statusbar_1.StatusbarAlignment.RIGHT; }).sort(function (a, b) { return a.priority - b.priority; });
            var descriptors = rightDescriptors.concat(leftDescriptors); // right first because they float
            (_a = this.toDispose).push.apply(_a, descriptors.map(function (descriptor) {
                var item = _this.instantiationService.createInstance(descriptor.syncDescriptor);
                var el = _this.doCreateStatusItem(descriptor.alignment, descriptor.priority);
                var dispose = item.render(el);
                _this.statusItemsContainer.append(el);
                return dispose;
            }));
            return this.statusItemsContainer;
            var _a;
        };
        StatusbarPart.prototype.doCreateStatusItem = function (alignment, priority) {
            if (priority === void 0) { priority = 0; }
            var el = document.createElement('div');
            dom.addClass(el, 'statusbar-item');
            if (alignment === statusbar_1.StatusbarAlignment.RIGHT) {
                dom.addClass(el, 'right');
            }
            else {
                dom.addClass(el, 'left');
            }
            builder_1.$(el).setProperty(StatusbarPart.PRIORITY_PROP, priority);
            builder_1.$(el).setProperty(StatusbarPart.ALIGNMENT_PROP, alignment);
            return el;
        };
        StatusbarPart.prototype.dispose = function () {
            this.toDispose = lifecycle_1.dispose(this.toDispose);
            _super.prototype.dispose.call(this);
        };
        StatusbarPart.PRIORITY_PROP = 'priority';
        StatusbarPart.ALIGNMENT_PROP = 'alignment';
        return StatusbarPart;
    }(part_1.Part));
    exports.StatusbarPart = StatusbarPart;
    var StatusBarEntryItem = (function () {
        function StatusBarEntryItem(entry, keybindingService, instantiationService, messageService, telemetryService, editorService) {
            this.keybindingService = keybindingService;
            this.instantiationService = instantiationService;
            this.messageService = messageService;
            this.telemetryService = telemetryService;
            this.editorService = editorService;
            this.entry = entry;
        }
        StatusBarEntryItem.prototype.render = function (el) {
            var _this = this;
            var toDispose = [];
            dom.addClass(el, 'statusbar-entry');
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
        StatusBarEntryItem.prototype.executeCommand = function (id) {
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
                    this.telemetryService.publicLog('workbenchActionExecuted', { id: action.id, from: 'status bar' });
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
        StatusBarEntryItem = __decorate([
            __param(1, keybindingService_1.IKeybindingService),
            __param(2, instantiation_1.IInstantiationService),
            __param(3, message_1.IMessageService),
            __param(4, telemetry_1.ITelemetryService),
            __param(5, editorService_1.IWorkbenchEditorService)
        ], StatusBarEntryItem);
        return StatusBarEntryItem;
    }());
});
