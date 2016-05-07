/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls', 'vs/platform/platform', 'vs/base/common/filters', 'vs/base/common/types', 'vs/base/common/paths', 'vs/base/common/labels', 'vs/base/common/events', 'vs/base/parts/quickopen/common/quickOpen', 'vs/base/parts/quickopen/browser/quickOpenModel', 'vs/workbench/common/editor', 'vs/workbench/browser/parts/editor/baseEditor', 'vs/workbench/browser/quickopen'], function (require, exports, nls, platform_1, filters, types, paths, labels, events_1, quickOpen_1, quickOpenModel_1, editor_1, baseEditor_1, quickopen_1) {
    'use strict';
    var MAX_ENTRIES = 200;
    var EditorHistoryEntry = (function (_super) {
        __extends(EditorHistoryEntry, _super);
        function EditorHistoryEntry(editorService, contextService, input, labelHighlights, descriptionHighlights, model) {
            _super.call(this, editorService);
            this.contextService = contextService;
            this.input = input;
            this.model = model;
            this.resource = editor_1.getUntitledOrFileResource(input);
            this.setHighlights(labelHighlights, descriptionHighlights);
        }
        EditorHistoryEntry.prototype.clone = function (labelHighlights, descriptionHighlights) {
            return new EditorHistoryEntry(this.editorService, this.contextService, this.input, labelHighlights, descriptionHighlights, this.model);
        };
        EditorHistoryEntry.prototype.getPrefix = function () {
            var status = this.input.getStatus();
            if (status && status.decoration) {
                return status.decoration + " ";
            }
            return void 0;
        };
        EditorHistoryEntry.prototype.getLabel = function () {
            return this.input.getName();
        };
        EditorHistoryEntry.prototype.getAriaLabel = function () {
            return nls.localize('entryAriaLabel', "{0}, recently opened", this.getLabel());
        };
        EditorHistoryEntry.prototype.getDescription = function () {
            return this.input.getDescription();
        };
        EditorHistoryEntry.prototype.getResource = function () {
            return this.resource;
        };
        EditorHistoryEntry.prototype.getInput = function () {
            return this.input;
        };
        EditorHistoryEntry.prototype.matches = function (input) {
            return this.input.matches(input);
        };
        EditorHistoryEntry.prototype.run = function (mode, context) {
            var _this = this;
            if (mode === quickOpen_1.Mode.OPEN) {
                var event_1 = context.event;
                var sideBySide = !context.quickNavigateConfiguration && (event_1 && (event_1.ctrlKey || event_1.metaKey || (event_1.payload && event_1.payload.originalEvent && (event_1.payload.originalEvent.ctrlKey || event_1.payload.originalEvent.metaKey))));
                this.editorService.openEditor(this.input, null, sideBySide).done(function () {
                    // Automatically clean up stale history entries when the input can not be opened
                    if (!_this.input.matches(_this.editorService.getActiveEditorInput())) {
                        _this.model.remove(_this.input);
                    }
                });
                return true;
            }
            return false;
        };
        return EditorHistoryEntry;
    }(quickopen_1.EditorQuickOpenEntry));
    exports.EditorHistoryEntry = EditorHistoryEntry;
    var EditorHistoryModel = (function (_super) {
        __extends(EditorHistoryModel, _super);
        function EditorHistoryModel(editorService, instantiationService, contextService) {
            _super.call(this);
            this.editorService = editorService;
            this.instantiationService = instantiationService;
            this.contextService = contextService;
        }
        EditorHistoryModel.prototype.add = function (entry) {
            var _this = this;
            // Ensure we have at least a name to show
            if (!entry.getName()) {
                return;
            }
            // Remove on Dispose
            var unbind = entry.addListener(events_1.EventType.DISPOSE, function () {
                _this.remove(entry);
                unbind();
            });
            // Remove any existing entry and add to the beginning
            this.remove(entry);
            this.entries.unshift(new EditorHistoryEntry(this.editorService, this.contextService, entry, null, null, this));
            // Respect max entries setting
            if (this.entries.length > MAX_ENTRIES) {
                this.entries = this.entries.slice(0, MAX_ENTRIES);
            }
        };
        EditorHistoryModel.prototype.remove = function (entry) {
            var index = this.indexOf(entry);
            if (index >= 0) {
                this.entries.splice(index, 1);
            }
        };
        EditorHistoryModel.prototype.indexOf = function (entryToFind) {
            for (var i = 0; i < this.entries.length; i++) {
                var entry = this.entries[i];
                if (entry.matches(entryToFind)) {
                    return i;
                }
            }
            return -1;
        };
        EditorHistoryModel.prototype.saveTo = function (memento) {
            var registry = platform_1.Registry.as(baseEditor_1.Extensions.Editors);
            var entries = [];
            for (var i = this.entries.length - 1; i >= 0; i--) {
                var entry = this.entries[i];
                var input = entry.getInput();
                var factory = registry.getEditorInputFactory(input.getId());
                if (factory) {
                    var value = factory.serialize(input);
                    if (types.isString(value)) {
                        entries.push({
                            id: input.getId(),
                            value: value
                        });
                    }
                }
            }
            if (entries.length > 0) {
                memento.entries = entries;
            }
        };
        EditorHistoryModel.prototype.loadFrom = function (memento) {
            var registry = platform_1.Registry.as(baseEditor_1.Extensions.Editors);
            var entries = memento.entries;
            if (entries && entries.length > 0) {
                for (var i = 0; i < entries.length; i++) {
                    var entry = entries[i];
                    var factory = registry.getEditorInputFactory(entry.id);
                    if (factory && types.isString(entry.value)) {
                        var input = factory.deserialize(this.instantiationService, entry.value);
                        if (input) {
                            this.add(input);
                        }
                    }
                }
            }
        };
        EditorHistoryModel.prototype.getEntries = function () {
            return this.entries.slice(0);
        };
        EditorHistoryModel.prototype.getResults = function (searchValue) {
            searchValue = searchValue.trim();
            var searchInPath = searchValue.indexOf(paths.nativeSep) >= 0;
            var results = [];
            for (var i = 0; i < this.entries.length; i++) {
                var entry = this.entries[i];
                if (!entry.getResource()) {
                    continue; //For now, only support to match on inputs that provide resource information
                }
                // Check if this entry is a match for the search value
                var targetToMatch = searchInPath ? labels.getPathLabel(entry.getResource(), this.contextService) : entry.getLabel();
                if (!filters.matchesFuzzy(searchValue, targetToMatch)) {
                    continue;
                }
                // Apply highlights
                var _a = quickOpenModel_1.QuickOpenEntry.highlight(entry, searchValue), labelHighlights = _a.labelHighlights, descriptionHighlights = _a.descriptionHighlights;
                results.push(entry.clone(labelHighlights, descriptionHighlights));
            }
            // Sort
            return results.sort(function (elementA, elementB) { return quickOpenModel_1.QuickOpenEntry.compare(elementA, elementB, searchValue); });
        };
        return EditorHistoryModel;
    }(quickOpenModel_1.QuickOpenModel));
    exports.EditorHistoryModel = EditorHistoryModel;
});
//# sourceMappingURL=editorHistoryModel.js.map