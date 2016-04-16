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
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/workbench/common/memento', 'vs/workbench/parts/files/common/files', 'vs/workbench/browser/viewlet', 'vs/base/browser/ui/splitview/splitview', 'vs/workbench/parts/files/browser/views/explorerViewer', 'vs/workbench/parts/files/browser/views/explorerView', 'vs/workbench/parts/files/browser/views/emptyView', 'vs/workbench/parts/files/browser/views/workingFilesView', 'vs/platform/storage/common/storage', 'vs/platform/instantiation/common/instantiation', 'vs/platform/workspace/common/workspace', 'vs/platform/telemetry/common/telemetry', 'vs/css!./media/explorerviewlet'], function (require, exports, winjs_base_1, memento_1, files_1, viewlet_1, splitview_1, explorerViewer_1, explorerView_1, emptyView_1, workingFilesView_1, storage_1, instantiation_1, workspace_1, telemetry_1) {
    'use strict';
    var ExplorerViewlet = (function (_super) {
        __extends(ExplorerViewlet, _super);
        function ExplorerViewlet(telemetryService, contextService, storageService, instantiationService) {
            _super.call(this, files_1.VIEWLET_ID, telemetryService);
            this.contextService = contextService;
            this.storageService = storageService;
            this.instantiationService = instantiationService;
            this.views = [];
            this.viewletState = new explorerViewer_1.FileViewletState();
            this.viewletSettings = this.getMemento(storageService, memento_1.Scope.WORKSPACE);
        }
        ExplorerViewlet.prototype.create = function (parent) {
            var _this = this;
            _super.prototype.create.call(this, parent);
            this.viewletContainer = parent.div().addClass('explorer-viewlet');
            this.splitView = new splitview_1.SplitView(this.viewletContainer.getHTMLElement());
            // Working files view
            this.addWorkingFilesView();
            // Explorer view
            this.addExplorerView();
            // Track focus
            this.focusListener = this.splitView.onFocus(function (view) {
                _this.lastFocusedView = view;
            });
            return winjs_base_1.TPromise.join(this.views.map(function (view) { return view.create(); })).then(function () { return void 0; });
        };
        ExplorerViewlet.prototype.addWorkingFilesView = function () {
            this.workingFilesView = this.instantiationService.createInstance(workingFilesView_1.WorkingFilesView, this.getActionRunner(), this.viewletSettings);
            this.splitView.addView(this.workingFilesView);
            this.views.push(this.workingFilesView);
        };
        ExplorerViewlet.prototype.addExplorerView = function () {
            var explorerView;
            // With a Workspace
            if (this.contextService.getWorkspace()) {
                this.explorerView = explorerView = this.instantiationService.createInstance(explorerView_1.ExplorerView, this.viewletState, this.getActionRunner(), this.viewletSettings);
            }
            else {
                explorerView = this.instantiationService.createInstance(emptyView_1.EmptyView);
            }
            this.splitView.addView(explorerView);
            this.views.push(explorerView);
        };
        ExplorerViewlet.prototype.getExplorerView = function () {
            return this.explorerView;
        };
        ExplorerViewlet.prototype.getWorkingFilesView = function () {
            return this.workingFilesView;
        };
        ExplorerViewlet.prototype.setVisible = function (visible) {
            var _this = this;
            return _super.prototype.setVisible.call(this, visible).then(function () {
                return winjs_base_1.TPromise.join(_this.views.map(function (view) { return view.setVisible(visible); })).then(function () { return void 0; });
            });
        };
        ExplorerViewlet.prototype.focus = function () {
            _super.prototype.focus.call(this);
            if (this.lastFocusedView && this.lastFocusedView.isExpanded() && this.hasSelectionOrFocus(this.lastFocusedView)) {
                this.lastFocusedView.focusBody();
                return;
            }
            if (this.hasSelectionOrFocus(this.workingFilesView)) {
                return this.workingFilesView.focusBody();
            }
            if (this.hasSelectionOrFocus(this.explorerView)) {
                return this.explorerView.focusBody();
            }
            if (this.workingFilesView && this.workingFilesView.isExpanded()) {
                return this.workingFilesView.focusBody();
            }
            if (this.explorerView && this.explorerView.isExpanded()) {
                return this.explorerView.focusBody();
            }
            return this.workingFilesView.focus();
        };
        ExplorerViewlet.prototype.hasSelectionOrFocus = function (view) {
            if (!view) {
                return false;
            }
            if (!view.isExpanded()) {
                return false;
            }
            if (view instanceof explorerView_1.ExplorerView || view instanceof workingFilesView_1.WorkingFilesView) {
                var viewer = view.getViewer();
                if (!viewer) {
                    return false;
                }
                return !!viewer.getFocus() || (viewer.getSelection() && viewer.getSelection().length > 0);
            }
            return false;
        };
        ExplorerViewlet.prototype.layout = function (dimension) {
            this.splitView.layout(dimension.height);
        };
        ExplorerViewlet.prototype.getSelection = function () {
            return this.explorerView ? this.explorerView.getSelection() : this.workingFilesView.getSelection();
        };
        ExplorerViewlet.prototype.getActionRunner = function () {
            if (!this.actionRunner) {
                this.actionRunner = new explorerViewer_1.ActionRunner(this.viewletState);
            }
            return this.actionRunner;
        };
        ExplorerViewlet.prototype.getOptimalWidth = function () {
            var additionalMargin = 16;
            var workingFilesViewWidth = this.getWorkingFilesView().getOptimalWidth();
            var explorerView = this.getExplorerView();
            var explorerViewWidth = explorerView ? explorerView.getOptimalWidth() : 0;
            var optimalWidth = Math.max(workingFilesViewWidth, explorerViewWidth);
            return optimalWidth + additionalMargin;
        };
        ExplorerViewlet.prototype.shutdown = function () {
            this.views.forEach(function (view) { return view.shutdown(); });
            _super.prototype.shutdown.call(this);
        };
        ExplorerViewlet.prototype.dispose = function () {
            if (this.splitView) {
                this.splitView.dispose();
                this.splitView = null;
            }
            if (this.focusListener) {
                this.focusListener.dispose();
                this.focusListener = null;
            }
        };
        ExplorerViewlet = __decorate([
            __param(0, telemetry_1.ITelemetryService),
            __param(1, workspace_1.IWorkspaceContextService),
            __param(2, storage_1.IStorageService),
            __param(3, instantiation_1.IInstantiationService)
        ], ExplorerViewlet);
        return ExplorerViewlet;
    }(viewlet_1.Viewlet));
    exports.ExplorerViewlet = ExplorerViewlet;
});
//# sourceMappingURL=explorerViewlet.js.map