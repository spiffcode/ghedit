/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
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
define(["require", "exports", 'vs/nls', 'vs/base/common/winjs.base', 'vs/base/common/actions', 'vs/workbench/services/quickopen/common/quickOpenService', 'vs/platform/platform', 'vs/platform/actions/common/actions', 'vs/workbench/common/actionRegistry', 'githubService', 'vs/platform/message/common/message'], function (require, exports, nls, winjs_base_1, actions_1, quickOpenService_1, platform_1, actions_2, actionRegistry_1, githubService_1, message_1) {
    'use strict';
    var AboutGHCodeAction = (function (_super) {
        __extends(AboutGHCodeAction, _super);
        function AboutGHCodeAction(actionId, actionLabel, githubService, messageService) {
            _super.call(this, actionId, actionLabel);
            this.githubService = githubService;
            this.messageService = messageService;
        }
        AboutGHCodeAction.prototype.run = function () {
            // TODO: Show better about UI
            var s = [];
            if (this.githubService.isAuthenticated() && this.githubService.isTag) {
                s.push('Note: GHCode is in read only mode because you are viewing a tag.');
            }
            s.push('Welcome to GHCode, brought to you by Spiffcode, Inc.');
            this.messageService.show(message_1.Severity.Info, s);
            return winjs_base_1.TPromise.as(true);
        };
        AboutGHCodeAction.ID = 'workbench.action.ghcode.welcome';
        AboutGHCodeAction.LABEL = 'About GHCode';
        AboutGHCodeAction = __decorate([
            __param(2, githubService_1.IGithubService),
            __param(3, message_1.IMessageService)
        ], AboutGHCodeAction);
        return AboutGHCodeAction;
    }(actions_1.Action));
    exports.AboutGHCodeAction = AboutGHCodeAction;
    var ChooseRepositoryAction = (function (_super) {
        __extends(ChooseRepositoryAction, _super);
        function ChooseRepositoryAction(actionId, actionLabel, quickOpenService, githubService) {
            _super.call(this, actionId, actionLabel);
            this.quickOpenService = quickOpenService;
            this.githubService = githubService;
        }
        ChooseRepositoryAction.prototype.run = function () {
            var _this = this;
            var choices = new winjs_base_1.TPromise(function (c, e) {
                // By default this api sorts by 'updated', which results in unexpected sort orders.
                // Instead sort by last push time.
                _this.githubService.github.getUser().repos({ sort: 'pushed', per_page: 1000 }, function (err, repos) {
                    if (err) {
                        e('Error contacting service.');
                    }
                    else {
                        // Put the current repo at the top
                        var choices_1 = repos.map(function (repo) { return repo.full_name; }).filter(function (name) { return name !== _this.githubService.repoName; });
                        if (_this.githubService.repoName)
                            choices_1.splice(0, 0, _this.githubService.repoName);
                        c(choices_1);
                    }
                });
            });
            var options = {
                placeHolder: nls.localize('chooseRepository', 'Choose Repository'),
                autoFocus: { autoFocusFirstEntry: true }
            };
            return this.quickOpenService.pick(choices, options).then(function (result) {
                if (result && result !== _this.githubService.repoName) {
                    githubService_1.openRepository(result);
                }
            });
        };
        ChooseRepositoryAction.ID = 'workbench.action.github.chooseRepository';
        ChooseRepositoryAction.LABEL = 'Choose Repository';
        ChooseRepositoryAction = __decorate([
            __param(2, quickOpenService_1.IQuickOpenService),
            __param(3, githubService_1.IGithubService)
        ], ChooseRepositoryAction);
        return ChooseRepositoryAction;
    }(actions_1.Action));
    exports.ChooseRepositoryAction = ChooseRepositoryAction;
    var ChooseReferenceAction = (function (_super) {
        __extends(ChooseReferenceAction, _super);
        function ChooseReferenceAction(actionId, actionLabel, quickOpenService, githubService) {
            _super.call(this, actionId, actionLabel);
            this.quickOpenService = quickOpenService;
            this.githubService = githubService;
        }
        ChooseReferenceAction.prototype.run = function () {
            var _this = this;
            var repo = this.githubService.github.getRepo(this.githubService.repoName);
            // Get branches as IPickOpenEntry[]        
            var branches = new winjs_base_1.TPromise(function (c, e) {
                repo.listBranches(function (err, results) {
                    if (err) {
                        e('Error contacting service.');
                    }
                    else {
                        var items = results;
                        if (!_this.githubService.isTag) {
                            items = results.filter(function (branch) { return branch !== _this.githubService.ref; });
                            items.splice(0, 0, _this.githubService.ref);
                        }
                        var choices = items.map(function (item) { return { id: 'branch', label: item, description: nls.localize('gitBranch', 'branch') }; });
                        c(choices);
                    }
                });
            });
            // Get tags as IPickOpenEntry[]
            var tags = new winjs_base_1.TPromise(function (c, e) {
                repo.listTags(function (err, tags) {
                    if (err) {
                        e('Error contacting service.');
                    }
                    else {
                        var items = tags.map(function (tag) { return tag.name; });
                        if (_this.githubService.isTag) {
                            items = items.filter(function (name) { return name !== _this.githubService.ref; });
                            items.splice(0, 0, _this.githubService.ref);
                        }
                        var choices = items.map(function (item) { return { id: 'tag', label: item, description: nls.localize('gitTag', 'tag') }; });
                        c(choices);
                    }
                });
            });
            // Wrap these in a promise that returns a single array
            var promise = new winjs_base_1.TPromise(function (c, e) {
                // Execute the tag and branch promises at once
                winjs_base_1.TPromise.join([branches, tags]).then(function (results) {
                    // The order of the results is unknown. Figure that out.
                    var indexBranches = -1;
                    for (var i = 0; i < 2; i++) {
                        // Find out which index is branches, which is tags
                        if (indexBranches < 0) {
                            if (results[i].length > 0) {
                                if (results[i][0].id === 'branch') {
                                    indexBranches = i;
                                }
                            }
                        }
                    }
                    var indexOrderFirst = !_this.githubService.isTag ? indexBranches : indexBranches ^ 1;
                    var choices = results[indexOrderFirst].concat(results[indexOrderFirst ^ 1]);
                    c(choices);
                }, function (err) {
                    e(err);
                });
            });
            var options = {
                placeHolder: nls.localize('chooseBranchOrTag', 'Choose Branch or Tag'),
                autoFocus: { autoFocusFirstEntry: true }
            };
            return this.quickOpenService.pick(promise, options).then(function (result) {
                if (result && result.label !== _this.githubService.ref) {
                    githubService_1.openRepository(_this.githubService.repoName, result.label, result.id === 'tag');
                }
            });
        };
        ChooseReferenceAction.ID = 'workbench.action.github.chooseReference';
        ChooseReferenceAction.LABEL = 'Choose Branch or Tag';
        ChooseReferenceAction = __decorate([
            __param(2, quickOpenService_1.IQuickOpenService),
            __param(3, githubService_1.IGithubService)
        ], ChooseReferenceAction);
        return ChooseReferenceAction;
    }(actions_1.Action));
    exports.ChooseReferenceAction = ChooseReferenceAction;
    // Register these actions
    var registry = platform_1.Registry.as(actionRegistry_1.Extensions.WorkbenchActions);
    registry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(AboutGHCodeAction, AboutGHCodeAction.ID, null), null);
    registry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(ChooseRepositoryAction, ChooseRepositoryAction.ID, null), null);
    registry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(ChooseReferenceAction, ChooseReferenceAction.ID, null), null);
});
//# sourceMappingURL=githubActions.js.map