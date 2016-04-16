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
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/lifecycle', 'vs/workbench/browser/viewlet', 'vs/workbench/parts/git/common/git', 'vs/workbench/parts/git/browser/gitWorkbenchContributions', 'vs/workbench/parts/git/browser/views/changes/changesView', 'vs/workbench/parts/git/browser/views/empty/emptyView', 'vs/workbench/parts/git/browser/views/gitless/gitlessView', 'vs/workbench/parts/git/browser/views/notroot/notrootView', 'vs/workbench/parts/git/browser/views/noworkspace/noworkspaceView', './views/disabled/disabledView', 'vs/platform/instantiation/common/instantiation', 'vs/platform/progress/common/progress', 'vs/platform/selection/common/selection', 'vs/platform/telemetry/common/telemetry', 'vs/css!./media/gitViewlet'], function (require, exports, winjs, lifecycle, viewlet, git, contrib, changes, empty, gitless, notroot, noworkspace, disabledView_1, instantiation_1, progress_1, selection_1, telemetry_1) {
    'use strict';
    var IGitService = git.IGitService;
    var GitViewlet = (function (_super) {
        __extends(GitViewlet, _super);
        function GitViewlet(telemetryService, progressService, instantiationService, gitService) {
            var _this = this;
            _super.call(this, contrib.VIEWLET_ID, telemetryService);
            this.progressService = progressService;
            this.instantiationService = instantiationService;
            this.gitService = gitService;
            this.progressRunner = null;
            this.views = {};
            this.toDispose = [];
            var views = [
                this.instantiationService.createInstance(changes.ChangesView, this.getActionRunner()),
                this.instantiationService.createInstance(empty.EmptyView, this, this.getActionRunner()),
                this.instantiationService.createInstance(gitless.GitlessView),
                new notroot.NotRootView(),
                new noworkspace.NoWorkspaceView(),
                new disabledView_1.DisabledView()
            ];
            views.forEach(function (v) {
                _this.views[v.ID] = v;
                _this.toDispose.push(v);
            });
            this.toUnbind.push(this.gitService.addBulkListener(function () { return _this.onGitServiceChanges(); }));
        }
        // GitView.IController
        GitViewlet.prototype.setView = function (id) {
            if (!this.$el) {
                return winjs.TPromise.as(null);
            }
            var view = this.views[id];
            if (!view) {
                return winjs.Promise.wrapError(new Error('Could not find view.'));
            }
            if (this.currentView === view) {
                return winjs.TPromise.as(null);
            }
            var promise = winjs.TPromise.as(null);
            if (this.currentView) {
                promise = this.currentView.setVisible(false);
            }
            var element = view.element;
            this.currentView = view;
            this.updateTitleArea();
            var el = this.$el.getHTMLElement();
            while (el.firstChild) {
                el.removeChild(el.firstChild);
            }
            el.appendChild(element);
            view.layout(this.currentDimension);
            return promise.then(function () { return view.setVisible(true); });
        };
        // Viewlet
        GitViewlet.prototype.create = function (parent) {
            _super.prototype.create.call(this, parent);
            this.$el = parent.div().addClass('git-viewlet');
            return winjs.TPromise.as(null);
        };
        GitViewlet.prototype.setVisible = function (visible) {
            var _this = this;
            if (visible) {
                this.onGitServiceChanges();
                this.gitService.status().done();
                return _super.prototype.setVisible.call(this, visible).then(function () {
                    if (_this.currentView) {
                        return _this.currentView.setVisible(visible);
                    }
                });
            }
            else {
                return (this.currentView ? this.currentView.setVisible(visible) : winjs.TPromise.as(null)).then(function () {
                    _super.prototype.setVisible.call(_this, visible);
                });
            }
        };
        GitViewlet.prototype.focus = function () {
            _super.prototype.focus.call(this);
            if (this.currentView) {
                this.currentView.focus();
            }
        };
        GitViewlet.prototype.layout = function (dimension) {
            if (dimension === void 0) { dimension = this.currentDimension; }
            this.currentDimension = dimension;
            if (this.currentView) {
                this.currentView.layout(dimension);
            }
        };
        GitViewlet.prototype.getActions = function () {
            return this.currentView ? this.currentView.getActions() : [];
        };
        GitViewlet.prototype.getSecondaryActions = function () {
            return this.currentView ? this.currentView.getSecondaryActions() : [];
        };
        GitViewlet.prototype.getSelection = function () {
            if (!this.currentView) {
                return selection_1.Selection.EMPTY;
            }
            return this.currentView.getSelection();
        };
        GitViewlet.prototype.getControl = function () {
            if (!this.currentView) {
                return null;
            }
            return this.currentView.getControl();
        };
        // Event handlers
        GitViewlet.prototype.onGitServiceChanges = function () {
            if (this.progressRunner) {
                this.progressRunner.done();
            }
            if (this.gitService.getState() === git.ServiceState.NoGit) {
                this.setView('gitless');
                this.progressRunner = null;
            }
            else if (this.gitService.getState() === git.ServiceState.Disabled) {
                this.setView('disabled');
                this.progressRunner = null;
            }
            else if (this.gitService.getState() === git.ServiceState.NotARepo) {
                this.setView('empty');
                this.progressRunner = null;
            }
            else if (this.gitService.getState() === git.ServiceState.NotAWorkspace) {
                this.setView('noworkspace');
                this.progressRunner = null;
            }
            else if (this.gitService.getState() === git.ServiceState.NotAtRepoRoot) {
                this.setView('notroot');
                this.progressRunner = null;
            }
            else if (this.gitService.isIdle()) {
                this.setView('changes');
                this.progressRunner = null;
            }
            else {
                this.progressRunner = this.progressService.show(true);
            }
        };
        GitViewlet.prototype.dispose = function () {
            this.toDispose = lifecycle.dispose(this.toDispose);
            this.views = null;
            _super.prototype.dispose.call(this);
        };
        GitViewlet = __decorate([
            __param(0, telemetry_1.ITelemetryService),
            __param(1, progress_1.IProgressService),
            __param(2, instantiation_1.IInstantiationService),
            __param(3, IGitService)
        ], GitViewlet);
        return GitViewlet;
    }(viewlet.Viewlet));
    exports.GitViewlet = GitViewlet;
});
//# sourceMappingURL=gitViewlet.js.map