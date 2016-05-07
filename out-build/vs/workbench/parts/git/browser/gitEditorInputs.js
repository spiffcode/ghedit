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
define(["require", "exports", 'vs/base/common/lifecycle', 'vs/base/common/async', 'vs/workbench/common/editor/stringEditorInput', 'vs/workbench/common/editor/diffEditorInput', 'vs/workbench/parts/git/common/git', 'vs/workbench/services/editor/common/editorService', 'vs/platform/instantiation/common/instantiation'], function (require, exports, lifecycle, async, stringei, diffei, git, editorService_1, instantiation_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var IGitService = git.IGitService;
    function isGitEditorInput(input) {
        return input instanceof GitDiffEditorInput || input instanceof NativeGitIndexStringEditorInput;
    }
    exports.isGitEditorInput = isGitEditorInput;
    var GitDiffEditorInput = (function (_super) {
        __extends(GitDiffEditorInput, _super);
        function GitDiffEditorInput(name, description, originalInput, modifiedInput, status) {
            _super.call(this, name, description, originalInput, modifiedInput);
            this.status = status;
        }
        GitDiffEditorInput.prototype.getId = function () {
            throw new Error('To implement.');
        };
        GitDiffEditorInput.prototype.getFileStatus = function () {
            return this.status;
        };
        GitDiffEditorInput.prototype.contains = function (otherInput) {
            if (this.matches(otherInput)) {
                return true;
            }
            var originalInput = this.getOriginalInput();
            if (originalInput && originalInput.matches(otherInput)) {
                return true;
            }
            var modifiedInput = this.getModifiedInput();
            if (modifiedInput && modifiedInput.matches(otherInput)) {
                return true;
            }
            return false;
        };
        return GitDiffEditorInput;
    }(diffei.DiffEditorInput));
    exports.GitDiffEditorInput = GitDiffEditorInput;
    var GitWorkingTreeDiffEditorInput = (function (_super) {
        __extends(GitWorkingTreeDiffEditorInput, _super);
        function GitWorkingTreeDiffEditorInput(name, description, originalInput, modifiedInput, status) {
            _super.call(this, name, description, originalInput, modifiedInput, status);
        }
        GitWorkingTreeDiffEditorInput.prototype.getId = function () {
            return GitWorkingTreeDiffEditorInput.ID;
        };
        GitWorkingTreeDiffEditorInput.ID = 'Monaco.IDE.UI.Viewlets.GitViewlet.GitWorkingTreeDiffEditorInput';
        return GitWorkingTreeDiffEditorInput;
    }(GitDiffEditorInput));
    exports.GitWorkingTreeDiffEditorInput = GitWorkingTreeDiffEditorInput;
    var GitIndexDiffEditorInput = (function (_super) {
        __extends(GitIndexDiffEditorInput, _super);
        function GitIndexDiffEditorInput(name, description, originalInput, modifiedInput, status) {
            _super.call(this, name, description, originalInput, modifiedInput, status);
        }
        GitIndexDiffEditorInput.prototype.getId = function () {
            return GitIndexDiffEditorInput.ID;
        };
        GitIndexDiffEditorInput.ID = 'Monaco.IDE.UI.Viewlets.GitViewlet.GitIndexDiffEditorInput';
        return GitIndexDiffEditorInput;
    }(GitDiffEditorInput));
    exports.GitIndexDiffEditorInput = GitIndexDiffEditorInput;
    var NativeGitIndexStringEditorInput = (function (_super) {
        __extends(NativeGitIndexStringEditorInput, _super);
        function NativeGitIndexStringEditorInput(name, description, mime, status, path, treeish, gitService, editorService, instantiationService) {
            var _this = this;
            _super.call(this, name, description, null, mime, false, instantiationService);
            this.gitService = gitService;
            this.editorService = editorService;
            this.status = status;
            this.path = path;
            this.treeish = treeish;
            this.delayer = new async.ThrottledDelayer(1000);
            this.toDispose = [];
            this.toDispose.push(this.gitService.addListener2(git.ServiceEvents.STATE_CHANGED, function () { return _this.onGitServiceStateChange(); }));
            this.toDispose.push(this.gitService.addListener2(git.ServiceEvents.OPERATION_END, function () { return _this.onGitServiceStateChange(); }));
        }
        NativeGitIndexStringEditorInput.prototype.getId = function () {
            return NativeGitIndexStringEditorInput.ID;
        };
        NativeGitIndexStringEditorInput.prototype.getFileStatus = function () {
            return this.status;
        };
        NativeGitIndexStringEditorInput.prototype.resolve = function (refresh) {
            var _this = this;
            if (refresh || !this.getValue()) {
                return this.gitService.buffer(this.path, this.treeish).then(function (contents) {
                    if (_this.getValue() !== contents) {
                        _this.setValue(contents);
                    }
                    return _super.prototype.resolve.call(_this, refresh);
                });
            }
            else {
                return _super.prototype.resolve.call(this, refresh);
            }
        };
        NativeGitIndexStringEditorInput.prototype.onGitServiceStateChange = function () {
            var _this = this;
            var isVisible = this.editorService.isVisible(this, true);
            if (!isVisible) {
                return;
            }
            this.delayer.trigger(function () { return _this.resolve(true); });
        };
        NativeGitIndexStringEditorInput.prototype.dispose = function () {
            if (this.delayer) {
                this.delayer.cancel();
                this.delayer = null;
            }
            this.toDispose = lifecycle.dispose(this.toDispose);
            _super.prototype.dispose.call(this);
        };
        NativeGitIndexStringEditorInput.ID = 'Monaco.IDE.UI.Viewlets.GitViewlet.NativeGitIndexStringEditorInput';
        NativeGitIndexStringEditorInput = __decorate([
            __param(6, IGitService),
            __param(7, editorService_1.IWorkbenchEditorService),
            __param(8, instantiation_1.IInstantiationService)
        ], NativeGitIndexStringEditorInput);
        return NativeGitIndexStringEditorInput;
    }(stringei.StringEditorInput));
    exports.NativeGitIndexStringEditorInput = NativeGitIndexStringEditorInput;
});
//# sourceMappingURL=gitEditorInputs.js.map