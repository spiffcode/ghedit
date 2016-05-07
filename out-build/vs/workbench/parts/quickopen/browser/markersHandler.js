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
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/strings', 'vs/base/common/network', 'vs/base/common/errors', 'vs/base/browser/dom', 'vs/nls!vs/workbench/parts/quickopen/browser/markersHandler', 'vs/base/common/labels', 'vs/base/common/severity', 'vs/workbench/browser/quickopen', 'vs/workbench/browser/parts/editor/textEditor', 'vs/workbench/browser/actions/quickOpenAction', 'vs/base/parts/quickopen/common/quickOpen', 'vs/base/parts/quickopen/browser/quickOpenModel', 'vs/workbench/services/editor/common/editorService', 'vs/platform/markers/common/markers', 'vs/platform/workspace/common/workspace', 'vs/workbench/services/quickopen/common/quickOpenService', 'vs/editor/common/services/codeEditorService', 'vs/base/common/filters', 'vs/base/browser/ui/highlightedlabel/highlightedLabel', 'vs/css!./media/markerHandler'], function (require, exports, winjs_base_1, strings, network, errors, dom, nls, labels_1, severity_1, quickopen_1, textEditor_1, quickOpenAction_1, quickOpen_1, quickOpenModel_1, editorService_1, markers_1, workspace_1, quickOpenService_1, codeEditorService_1, filters_1, highlightedLabel_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var MarkerEntry = (function (_super) {
        __extends(MarkerEntry, _super);
        function MarkerEntry(editorService, codeEditorService, contextService, marker) {
            _super.call(this);
            this._editorService = editorService;
            this._codeEditorService = codeEditorService;
            this._labelProvider = new labels_1.PathLabelProvider(contextService);
            this._marker = marker;
            var message = marker.message, source = marker.source, resource = marker.resource, startLineNumber = marker.startLineNumber, startColumn = marker.startColumn;
            this._label = source ? nls.localize(0, null, source, message) : message;
            this._description = nls.localize(1, null, this._labelProvider.getLabel(resource.fsPath), startLineNumber, startColumn);
        }
        MarkerEntry.prototype.update = function (query) {
            if (this._marker.resource.scheme === network.Schemas.inMemory) {
                // ignore inmemory-models
                this.setHidden(true);
                return;
            }
            var labelHighlights = MarkerEntry._filter(query, this._label);
            var descHighlights = MarkerEntry._filter(query, this._description);
            this.setHighlights(labelHighlights, descHighlights);
            this.setHidden(!labelHighlights && !descHighlights);
        };
        MarkerEntry.prototype.getAriaLabel = function () {
            return nls.localize(2, null, this._label);
        };
        MarkerEntry.prototype.getHeight = function () {
            return 48;
        };
        MarkerEntry.prototype.render = function (tree, container, previousCleanupFn) {
            dom.clearNode(container);
            var _a = this.getHighlights(), labelHighlights = _a[0], descHighlights = _a[1];
            var row1 = document.createElement('div');
            dom.addClass(row1, 'row');
            var row2 = document.createElement('div');
            dom.addClass(row2, 'row');
            // fill first row with icon and label
            var icon = document.createElement('div');
            dom.addClass(icon, "severity " + severity_1.default.toString(this._marker.severity).toLowerCase());
            row1.appendChild(icon);
            var labelContainer = document.createElement('div');
            dom.addClass(labelContainer, 'inline');
            new highlightedLabel_1.HighlightedLabel(labelContainer).set(this._label, labelHighlights);
            row1.appendChild(labelContainer);
            // fill second row with descriptions
            var descContainer = document.createElement('div');
            dom.addClass(descContainer, 'inline description');
            new highlightedLabel_1.HighlightedLabel(descContainer).set(this._description, descHighlights);
            row2.appendChild(descContainer);
            container.appendChild(row1);
            container.appendChild(row2);
            return;
        };
        MarkerEntry.prototype.run = function (mode, context) {
            switch (mode) {
                case quickOpen_1.Mode.OPEN:
                    this._open();
                    return true;
                case quickOpen_1.Mode.PREVIEW:
                    this._preview();
                    return true;
                default:
                    return false;
            }
        };
        MarkerEntry.prototype._open = function () {
            this._editorService.openEditor({
                resource: this._marker.resource,
                options: {
                    selection: {
                        startLineNumber: this._marker.startLineNumber,
                        startColumn: this._marker.startColumn,
                        endLineNumber: this._marker.endLineNumber,
                        endColumn: this._marker.endColumn
                    }
                }
            }).done(null, errors.onUnexpectedError);
        };
        MarkerEntry.prototype._preview = function () {
            var editors = this._codeEditorService.listCodeEditors();
            var editor;
            for (var _i = 0, editors_1 = editors; _i < editors_1.length; _i++) {
                var candidate = editors_1[_i];
                if (!candidate.getModel()
                    || candidate.getModel().getAssociatedResource().toString() !== this._marker.resource.toString()) {
                    continue;
                }
                if (!editor || this._editorService.getActiveEditor()
                    && candidate === this._editorService.getActiveEditor().getControl()) {
                    editor = candidate;
                }
            }
            if (editor) {
                editor.revealRangeInCenter(this._marker);
            }
        };
        MarkerEntry._filter = filters_1.or(filters_1.matchesPrefix, filters_1.matchesContiguousSubString);
        return MarkerEntry;
    }(quickOpenModel_1.QuickOpenEntryItem));
    var MarkersHandler = (function (_super) {
        __extends(MarkersHandler, _super);
        function MarkersHandler(markerService, editorService, codeEditorService, contextService) {
            _super.call(this);
            this._markerService = markerService;
            this._editorService = editorService;
            this._codeEditorService = codeEditorService;
            this._contextService = contextService;
        }
        MarkersHandler.prototype.getAriaLabel = function () {
            return nls.localize(3, null);
        };
        MarkersHandler.prototype.getResults = function (searchValue) {
            var _this = this;
            if (!this._activeSession) {
                // 1st model
                var model_1 = new quickOpenModel_1.QuickOpenModel(this._markerService.read({ take: 500 })
                    .sort(MarkersHandler._sort)
                    .map(function (marker) { return new MarkerEntry(_this._editorService, _this._codeEditorService, _this._contextService, marker); }));
                // 2nd viewstate
                var editor = this._editorService.getActiveEditor();
                var viewState = void 0;
                if (editor instanceof textEditor_1.BaseTextEditor) {
                    viewState = editor.getControl().saveViewState();
                }
                this._activeSession = [model_1, viewState];
            }
            // filter
            searchValue = searchValue.trim();
            var model = this._activeSession[0];
            for (var _i = 0, _a = model.entries; _i < _a.length; _i++) {
                var entry = _a[_i];
                entry.update(searchValue);
            }
            return winjs_base_1.TPromise.as(model);
        };
        MarkersHandler.prototype.onClose = function (canceled) {
            if (this._activeSession) {
                if (canceled) {
                    var _a = this._activeSession, viewState = _a[1];
                    if (viewState) {
                        var editor = this._editorService.getActiveEditor();
                        editor.getControl().restoreViewState(viewState);
                    }
                }
                this._activeSession = undefined;
            }
        };
        MarkersHandler._sort = function (a, b) {
            var ret;
            // severity matters first
            ret = severity_1.default.compare(a.severity, b.severity);
            if (ret !== 0) {
                return ret;
            }
            // source matters
            if (a.source && b.source) {
                ret = a.source.localeCompare(b.source);
                if (ret !== 0) {
                    return ret;
                }
            }
            // file name matters for equal severity
            ret = strings.localeCompare(a.resource.fsPath, b.resource.fsPath);
            if (ret !== 0) {
                return ret;
            }
            // start line matters
            ret = a.startLineNumber - b.startLineNumber;
            if (ret !== 0) {
                return ret;
            }
            // start column matters
            ret = a.startColumn - b.startColumn;
            if (ret !== 0) {
                return ret;
            }
            return 0;
        };
        MarkersHandler.prototype.getClass = function () {
            return 'marker-handler';
        };
        MarkersHandler.prototype.getAutoFocus = function (searchValue) {
            return {
                autoFocusFirstEntry: !!searchValue
            };
        };
        MarkersHandler.prototype.getEmptyLabel = function (searchString) {
            if (searchString.length > 0) {
                return nls.localize(4, null);
            }
            return nls.localize(5, null);
        };
        MarkersHandler = __decorate([
            __param(0, markers_1.IMarkerService),
            __param(1, editorService_1.IWorkbenchEditorService),
            __param(2, codeEditorService_1.ICodeEditorService),
            __param(3, workspace_1.IWorkspaceContextService)
        ], MarkersHandler);
        return MarkersHandler;
    }(quickopen_1.QuickOpenHandler));
    exports.MarkersHandler = MarkersHandler;
    var GotoMarkerAction = (function (_super) {
        __extends(GotoMarkerAction, _super);
        function GotoMarkerAction(actionId, actionLabel, quickOpenService) {
            _super.call(this, actionId, actionLabel, GotoMarkerAction.Prefix, quickOpenService);
        }
        GotoMarkerAction.Prefix = '!';
        GotoMarkerAction.Id = 'workbench.action.showErrorsWarnings';
        GotoMarkerAction.Label = nls.localize(6, null);
        GotoMarkerAction = __decorate([
            __param(2, quickOpenService_1.IQuickOpenService)
        ], GotoMarkerAction);
        return GotoMarkerAction;
    }(quickOpenAction_1.QuickOpenAction));
    exports.GotoMarkerAction = GotoMarkerAction;
});
//# sourceMappingURL=markersHandler.js.map