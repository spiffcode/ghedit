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
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/errors', 'vs/base/common/paths', 'vs/base/common/lifecycle', 'vs/base/common/severity', 'vs/base/browser/dom', 'vs/base/browser/ui/list/listWidget', 'vs/platform/markers/common/markers', 'vs/platform/telemetry/common/telemetry', 'vs/workbench/browser/panel', 'vs/workbench/parts/errorList/browser/errorListConstants', 'vs/workbench/services/editor/common/editorService', 'vs/css!./media/errorList'], function (require, exports, winjs_base_1, errors, paths, lifecycle, severity_1, dom_1, listWidget_1, markers_1, telemetry_1, panel_1, errorListConstants_1, editorService_1) {
    "use strict";
    var Renderer = (function () {
        function Renderer() {
        }
        Object.defineProperty(Renderer.prototype, "templateId", {
            get: function () {
                return 'errorListItem';
            },
            enumerable: true,
            configurable: true
        });
        Renderer.prototype.renderTemplate = function (container) {
            var data = Object.create(null);
            data.icon = dom_1.append(container, dom_1.emmet('.icon'));
            data.label = dom_1.append(container, dom_1.emmet('span.label'));
            data.location = dom_1.append(container, dom_1.emmet('.location'));
            return data;
        };
        Renderer.prototype.disposeTemplate = function (templateData) {
            // Nothing to do here
        };
        Renderer.prototype.renderElement = function (element, index, templateData) {
            templateData.icon.className = 'icon ' + Renderer.iconClassNameFor(element);
            templateData.label.textContent = element.message;
            templateData.location.textContent = paths.basename(element.resource.fsPath) + ":" + element.startLineNumber + ":" + element.startColumn;
        };
        Renderer.iconClassNameFor = function (element) {
            switch (element.severity) {
                case severity_1.default.Ignore:
                    return 'info';
                case severity_1.default.Info:
                    return 'info';
                case severity_1.default.Warning:
                    return 'warning';
                case severity_1.default.Error:
                    return 'error';
            }
            return '';
        };
        return Renderer;
    }());
    var Delegate = (function () {
        function Delegate(listProvider) {
            this.listProvider = listProvider;
        }
        Delegate.prototype.getHeight = function (element) {
            return 22;
        };
        Delegate.prototype.getTemplateId = function (element) {
            return 'errorListItem';
        };
        return Delegate;
    }());
    var ErrorList = (function (_super) {
        __extends(ErrorList, _super);
        function ErrorList(markerService, editorService, telemetryService) {
            _super.call(this, errorListConstants_1.ERROR_LIST_PANEL_ID, telemetryService);
            this.markerService = markerService;
            this.editorService = editorService;
            this.toDispose = [];
        }
        ErrorList.prototype.create = function (parent) {
            var _this = this;
            _super.prototype.create.call(this, parent);
            dom_1.addClass(parent.getHTMLElement(), 'new-error-list');
            var renderer = new Renderer();
            this.delegate = new Delegate(function () { return _this.list; });
            this.list = new listWidget_1.List(parent.getHTMLElement(), this.delegate, [renderer]);
            this.toDispose.push(this.markerService.onMarkerChanged(function (changedResources) {
                _this.onMarkersChanged();
            }));
            this.toDispose.push(this.list.onSelectionChange(function (e) {
                if (!e.elements.length) {
                    return;
                }
                var el = e.elements[0];
                _this.editorService.openEditor({
                    resource: el.resource,
                    options: {
                        selection: {
                            startLineNumber: el.startLineNumber,
                            startColumn: el.startColumn,
                            endLineNumber: el.endLineNumber,
                            endColumn: el.endColumn
                        }
                    }
                }).done(null, errors.onUnexpectedError);
            }));
            this.onMarkersChanged();
            return winjs_base_1.TPromise.as(null);
        };
        ErrorList.prototype.onMarkersChanged = function () {
            var allMarkers = this.markerService.read().slice(0);
            allMarkers.sort(function (a, b) {
                if (a.severity === b.severity) {
                    var aRes = a.resource.toString();
                    var bRes = b.resource.toString();
                    if (aRes === bRes) {
                        if (a.startLineNumber === b.startLineNumber) {
                            return a.startColumn - b.startColumn;
                        }
                        return a.startLineNumber - b.startLineNumber;
                    }
                    if (aRes < bRes) {
                        return -1;
                    }
                    if (aRes > bRes) {
                        return 1;
                    }
                }
                return b.severity - a.severity;
            });
            (_a = this.list).splice.apply(_a, [0, this.list.length].concat(allMarkers));
            var _a;
        };
        ErrorList.prototype.dispose = function () {
            this.toDispose = lifecycle.dispose(this.toDispose);
            this.list.dispose();
            _super.prototype.dispose.call(this);
        };
        ErrorList.prototype.layout = function (dimension) {
            this.list.layout(dimension.height);
        };
        ErrorList = __decorate([
            __param(0, markers_1.IMarkerService),
            __param(1, editorService_1.IWorkbenchEditorService),
            __param(2, telemetry_1.ITelemetryService)
        ], ErrorList);
        return ErrorList;
    }(panel_1.Panel));
    exports.ErrorList = ErrorList;
});
//# sourceMappingURL=errorList.js.map