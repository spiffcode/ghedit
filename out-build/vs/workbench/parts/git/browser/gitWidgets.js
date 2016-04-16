/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/nls!vs/workbench/parts/git/browser/gitWidgets', 'vs/base/common/strings', 'vs/base/common/async', 'vs/base/browser/dom', 'vs/base/common/lifecycle', 'vs/workbench/parts/git/common/git', 'vs/workbench/services/quickopen/common/quickOpenService', 'vs/platform/instantiation/common/instantiation', './gitActions', 'vs/base/common/severity', 'vs/platform/message/common/message'], function (require, exports, nls, strings, async_1, dom_1, lifecycle_1, git_1, quickOpenService_1, instantiation_1, gitActions_1, severity_1, message_1) {
    "use strict";
    var DisablementDelay = 500;
    var GitStatusbarItem = (function () {
        function GitStatusbarItem(instantiationService, gitService, quickOpenService, messageService) {
            this.messageService = messageService;
            this.instantiationService = instantiationService;
            this.gitService = gitService;
            this.quickOpenService = quickOpenService;
            this.disablementDelayer = new async_1.Delayer(DisablementDelay);
            this.syncAction = instantiationService.createInstance(gitActions_1.SyncAction, gitActions_1.SyncAction.ID, gitActions_1.SyncAction.LABEL);
            this.publishAction = instantiationService.createInstance(gitActions_1.PublishAction, gitActions_1.PublishAction.ID, gitActions_1.PublishAction.LABEL);
            this.toDispose = [
                this.syncAction,
                this.publishAction
            ];
            this.state = {
                serviceState: git_1.ServiceState.NotInitialized,
                isBusy: false,
                isSyncing: false,
                HEAD: null,
                remotes: [],
                ps1: ''
            };
        }
        GitStatusbarItem.prototype.render = function (container) {
            var _this = this;
            this.element = dom_1.append(container, dom_1.emmet('.git-statusbar-group'));
            this.branchElement = dom_1.append(this.element, dom_1.emmet('a'));
            this.publishElement = dom_1.append(this.element, dom_1.emmet('a.octicon.octicon-cloud-upload'));
            this.publishElement.title = nls.localize(0, null);
            this.publishElement.onclick = function () { return _this.onPublishClick(); };
            this.syncElement = dom_1.append(this.element, dom_1.emmet('a.git-statusbar-sync-item'));
            this.syncElement.title = nls.localize(1, null);
            this.syncElement.onclick = function () { return _this.onSyncClick(); };
            dom_1.append(this.syncElement, dom_1.emmet('span.octicon.octicon-sync'));
            this.syncLabelElement = dom_1.append(this.syncElement, dom_1.emmet('span.ahead-behind'));
            this.setState(this.state);
            this.toDispose.push(this.gitService.addBulkListener2(function () { return _this.onGitServiceChange(); }));
            return lifecycle_1.combinedDisposable(this.toDispose);
        };
        GitStatusbarItem.prototype.onGitServiceChange = function () {
            var model = this.gitService.getModel();
            this.setState({
                serviceState: this.gitService.getState(),
                isBusy: this.gitService.getRunningOperations().some(function (op) { return op.id === git_1.ServiceOperations.CHECKOUT || op.id === git_1.ServiceOperations.BRANCH; }),
                isSyncing: this.gitService.getRunningOperations().some(function (op) { return op.id === git_1.ServiceOperations.SYNC; }),
                HEAD: model.getHEAD(),
                remotes: model.getRemotes(),
                ps1: model.getPS1()
            });
        };
        GitStatusbarItem.prototype.setState = function (state) {
            var _this = this;
            this.state = state;
            var isGitDisabled = false;
            var className = 'git-statusbar-branch-item';
            var textContent;
            var aheadBehindLabel = '';
            var title = '';
            var onclick = null;
            if (state.serviceState !== git_1.ServiceState.OK) {
                isGitDisabled = true;
                className += ' disabled';
                title = nls.localize(2, null);
                textContent = '\u00a0';
            }
            else {
                var HEAD = state.HEAD;
                if (state.isBusy) {
                    className += ' busy';
                }
                else {
                    onclick = function () { return _this.onBranchClick(); };
                }
                if (!HEAD) {
                    textContent = state.ps1;
                }
                else if (!HEAD.name) {
                    textContent = state.ps1;
                    className += ' headless';
                }
                else if (!HEAD.commit || !HEAD.upstream || (!HEAD.ahead && !HEAD.behind)) {
                    textContent = state.ps1;
                }
                else {
                    textContent = state.ps1;
                    aheadBehindLabel = strings.format('{0}↓ {1}↑', HEAD.behind, HEAD.ahead);
                }
            }
            this.branchElement.className = className;
            this.branchElement.title = title;
            this.branchElement.textContent = textContent;
            this.branchElement.onclick = onclick;
            this.syncLabelElement.textContent = aheadBehindLabel;
            if (isGitDisabled) {
                dom_1.hide(this.branchElement);
                dom_1.hide(this.publishElement);
                dom_1.hide(this.syncElement);
            }
            else {
                dom_1.show(this.branchElement);
                if (state.HEAD && !!state.HEAD.upstream) {
                    dom_1.show(this.syncElement);
                    dom_1.toggleClass(this.syncElement, 'syncing', this.state.isSyncing);
                    dom_1.toggleClass(this.syncElement, 'empty', !aheadBehindLabel);
                    this.disablementDelayer.trigger(function () { return dom_1.toggleClass(_this.syncElement, 'disabled', !_this.syncAction.enabled); }, this.syncAction.enabled ? 0 : DisablementDelay);
                    dom_1.hide(this.publishElement);
                }
                else if (state.remotes.length > 0) {
                    dom_1.hide(this.syncElement);
                    dom_1.show(this.publishElement);
                    this.disablementDelayer.trigger(function () { return dom_1.toggleClass(_this.publishElement, 'disabled', !_this.publishAction.enabled); }, this.publishAction.enabled ? 0 : DisablementDelay);
                }
                else {
                    dom_1.hide(this.syncElement);
                    dom_1.hide(this.publishElement);
                }
            }
        };
        GitStatusbarItem.prototype.onBranchClick = function () {
            this.quickOpenService.show('git checkout ');
        };
        GitStatusbarItem.prototype.onPublishClick = function () {
            var _this = this;
            if (!this.publishAction.enabled) {
                return;
            }
            this.publishAction.run()
                .done(null, function (err) { return _this.messageService.show(severity_1.default.Error, err); });
        };
        GitStatusbarItem.prototype.onSyncClick = function () {
            var _this = this;
            if (!this.syncAction.enabled) {
                return;
            }
            this.syncAction.run()
                .done(null, function (err) { return _this.messageService.show(severity_1.default.Error, err); });
        };
        GitStatusbarItem = __decorate([
            __param(0, instantiation_1.IInstantiationService),
            __param(1, git_1.IGitService),
            __param(2, quickOpenService_1.IQuickOpenService),
            __param(3, message_1.IMessageService)
        ], GitStatusbarItem);
        return GitStatusbarItem;
    }());
    exports.GitStatusbarItem = GitStatusbarItem;
});
//# sourceMappingURL=gitWidgets.js.map