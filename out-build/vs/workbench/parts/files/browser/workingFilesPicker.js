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
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/nls!vs/workbench/parts/files/browser/workingFilesPicker', 'vs/base/common/paths', 'vs/base/common/labels', 'vs/base/common/errors', 'vs/base/common/strings', 'vs/base/parts/quickopen/common/quickOpen', 'vs/base/parts/quickopen/browser/quickOpenModel', 'vs/workbench/parts/files/common/workingFilesModel', 'vs/base/common/scorer', 'vs/workbench/browser/quickopen', 'vs/workbench/parts/files/common/files', 'vs/workbench/services/editor/common/editorService', 'vs/platform/instantiation/common/instantiation', 'vs/platform/workspace/common/workspace'], function (require, exports, winjs_base_1, nls, paths, labels, errors, strings, quickOpen_1, quickOpenModel_1, workingFilesModel_1, scorer, quickopen_1, files_1, editorService_1, instantiation_1, workspace_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var WorkingFilePickerEntry = (function (_super) {
        __extends(WorkingFilePickerEntry, _super);
        function WorkingFilePickerEntry(name, description, entry, editorService) {
            _super.call(this);
            this.editorService = editorService;
            this.workingFilesEntry = entry;
            this.name = name;
            this.description = description;
        }
        WorkingFilePickerEntry.prototype.getPrefix = function () {
            if (this.workingFilesEntry.dirty) {
                return '\u25cf '; // dirty decoration
            }
            return void 0;
        };
        WorkingFilePickerEntry.prototype.getLabel = function () {
            return this.name;
        };
        WorkingFilePickerEntry.prototype.getAriaLabel = function () {
            return nls.localize(0, null, this.getLabel());
        };
        WorkingFilePickerEntry.prototype.getDescription = function () {
            return this.description;
        };
        WorkingFilePickerEntry.prototype.getResource = function () {
            return this.workingFilesEntry.resource;
        };
        WorkingFilePickerEntry.prototype.getWorkingFilesEntry = function () {
            return this.workingFilesEntry;
        };
        WorkingFilePickerEntry.prototype.run = function (mode, context) {
            if (mode === quickOpen_1.Mode.OPEN) {
                return this.runOpen(context);
            }
            return _super.prototype.run.call(this, mode, context);
        };
        WorkingFilePickerEntry.prototype.runOpen = function (context) {
            var event = context.event;
            var sideBySide = (event && (event.ctrlKey || event.metaKey || (event.payload && event.payload.originalEvent && (event.payload.originalEvent.ctrlKey || event.payload.originalEvent.metaKey))));
            this.editorService.openEditor({ resource: this.workingFilesEntry.resource }, sideBySide).done(null, errors.onUnexpectedError);
            return true;
        };
        WorkingFilePickerEntry = __decorate([
            __param(3, editorService_1.IWorkbenchEditorService)
        ], WorkingFilePickerEntry);
        return WorkingFilePickerEntry;
    }(quickOpenModel_1.QuickOpenEntryGroup));
    exports.WorkingFilePickerEntry = WorkingFilePickerEntry;
    var WorkingFilesPicker = (function (_super) {
        __extends(WorkingFilesPicker, _super);
        function WorkingFilesPicker(instantiationService, contextService, textFileService) {
            _super.call(this);
            this.instantiationService = instantiationService;
            this.contextService = contextService;
            this.textFileService = textFileService;
            this.scorerCache = Object.create(null);
        }
        WorkingFilesPicker.prototype.getResults = function (searchValue) {
            var _this = this;
            searchValue = searchValue.trim();
            var normalizedSearchValueLowercase = strings.stripWildcards(searchValue).toLowerCase();
            return winjs_base_1.TPromise.as(new quickOpenModel_1.QuickOpenModel(this.textFileService.getWorkingFilesModel().getEntries()
                .map(function (e) {
                var label = paths.basename(e.resource.fsPath);
                var description = labels.getPathLabel(paths.dirname(e.resource.fsPath), _this.contextService);
                if (description === '.') {
                    description = null; // for untitled files
                }
                return _this.instantiationService.createInstance(WorkingFilePickerEntry, label, description, e);
            })
                .filter(function (e) {
                if (!searchValue) {
                    return true;
                }
                var targetToMatch = labels.getPathLabel(e.getResource(), _this.contextService);
                if (!scorer.matches(targetToMatch, normalizedSearchValueLowercase)) {
                    return false;
                }
                var _a = quickOpenModel_1.QuickOpenEntry.highlight(e, searchValue, true /* fuzzy highlight */), labelHighlights = _a.labelHighlights, descriptionHighlights = _a.descriptionHighlights;
                e.setHighlights(labelHighlights, descriptionHighlights);
                return true;
            }).
                // Sort by search value score or natural order if not searching
                sort(function (e1, e2) {
                if (!searchValue) {
                    return workingFilesModel_1.WorkingFilesModel.compare(e1.getWorkingFilesEntry(), e2.getWorkingFilesEntry());
                }
                return quickOpenModel_1.QuickOpenEntry.compareByScore(e1, e2, searchValue, normalizedSearchValueLowercase, _this.scorerCache);
            }).
                // Apply group label
                map(function (e, index) {
                if (index === 0) {
                    e.setGroupLabel(nls.localize(1, null));
                }
                return e;
            })));
        };
        WorkingFilesPicker.prototype.getEmptyLabel = function (searchString) {
            if (searchString) {
                return nls.localize(2, null);
            }
            return nls.localize(3, null);
        };
        WorkingFilesPicker.prototype.getAutoFocus = function (searchValue) {
            if (searchValue) {
                return {
                    autoFocusFirstEntry: true
                };
            }
            return _super.prototype.getAutoFocus.call(this, searchValue);
        };
        WorkingFilesPicker.prototype.onClose = function (canceled) {
            this.scorerCache = Object.create(null);
        };
        WorkingFilesPicker = __decorate([
            __param(0, instantiation_1.IInstantiationService),
            __param(1, workspace_1.IWorkspaceContextService),
            __param(2, files_1.ITextFileService)
        ], WorkingFilesPicker);
        return WorkingFilesPicker;
    }(quickopen_1.QuickOpenHandler));
    exports.WorkingFilesPicker = WorkingFilesPicker;
});
//# sourceMappingURL=workingFilesPicker.js.map