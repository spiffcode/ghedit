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
define(["require", "exports", 'vs/editor/common/editorCommon', 'vs/workbench/parts/git/common/git', 'vs/platform/workspace/common/workspace', 'vs/base/common/lifecycle', 'vs/base/common/async'], function (require, exports, common, git, workspace_1, lifecycle_1, async_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var IGitService = git.IGitService;
    var MergeDecoratorBoundToModel = (function (_super) {
        __extends(MergeDecoratorBoundToModel, _super);
        function MergeDecoratorBoundToModel(editor, model, filePath, gitService) {
            var _this = this;
            _super.call(this);
            this._editor = editor;
            this._model = model;
            this._gitService = gitService;
            this._filePath = filePath;
            this._decorations = [];
            this._redecorateSoon = this._register(new async_1.RunOnceScheduler(function () { return _this.redecorate(); }, 300));
            this._register(this._model.addListener2(common.EventType.ModelContentChanged, function () { return _this._redecorateSoon.schedule(); }));
            this._register(this._gitService.addListener2(git.ServiceEvents.STATE_CHANGED, function () { return _this._redecorateSoon.schedule(); }));
            this._redecorateSoon.schedule();
        }
        MergeDecoratorBoundToModel.prototype.dispose = function () {
            this._setDecorations([]);
            _super.prototype.dispose.call(this);
        };
        MergeDecoratorBoundToModel.prototype._setDecorations = function (newDecorations) {
            this._decorations = this._editor.deltaDecorations(this._decorations, newDecorations);
        };
        MergeDecoratorBoundToModel.prototype.redecorate = function () {
            var gitModel = this._gitService.getModel();
            var mergeStatus = gitModel.getStatus().find(this._filePath, git.StatusType.MERGE);
            if (!mergeStatus) {
                return;
            }
            var decorations = [];
            var lineCount = this._model.getLineCount();
            for (var i = 1; i <= lineCount; i++) {
                var start = this._model.getLineContent(i).substr(0, 7);
                switch (start) {
                    case '<<<<<<<':
                    case '=======':
                    case '>>>>>>>':
                        decorations.push({
                            range: { startLineNumber: i, startColumn: 1, endLineNumber: i, endColumn: 1 },
                            options: MergeDecorator.DECORATION_OPTIONS
                        });
                        break;
                }
            }
            this._setDecorations(decorations);
        };
        return MergeDecoratorBoundToModel;
    }(lifecycle_1.Disposable));
    var MergeDecorator = (function () {
        function MergeDecorator(editor, gitService, contextService) {
            this.gitService = gitService;
            this.contextService = contextService;
            this.editor = editor;
            this.toUnbind = [this.editor.addListener(common.EventType.ModelChanged, this.onModelChanged.bind(this))];
            this.mergeDecorator = null;
        }
        MergeDecorator.prototype.getId = function () {
            return MergeDecorator.ID;
        };
        MergeDecorator.prototype.onModelChanged = function () {
            if (this.mergeDecorator) {
                this.mergeDecorator.dispose();
                this.mergeDecorator = null;
            }
            if (!this.contextService || !this.gitService) {
                return;
            }
            var model = this.editor.getModel();
            if (!model) {
                return;
            }
            var resource = model.getAssociatedResource();
            if (!resource) {
                return;
            }
            var path = this.contextService.toWorkspaceRelativePath(resource);
            if (!path) {
                return;
            }
            this.mergeDecorator = new MergeDecoratorBoundToModel(this.editor, model, path, this.gitService);
        };
        MergeDecorator.prototype.dispose = function () {
            if (this.mergeDecorator) {
                this.mergeDecorator.dispose();
                this.mergeDecorator = null;
            }
            while (this.toUnbind.length) {
                this.toUnbind.pop()();
            }
        };
        MergeDecorator.ID = 'Monaco.IDE.UI.Viewlets.GitViewlet.Editor.MergeDecorator';
        MergeDecorator.DECORATION_OPTIONS = {
            className: 'git-merge-control-decoration',
            isWholeLine: true,
            overviewRuler: {
                color: 'rgb(197, 118, 0)',
                darkColor: 'rgb(197, 118, 0)',
                position: common.OverviewRulerLane.Left
            },
            stickiness: common.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
        };
        MergeDecorator = __decorate([
            __param(1, IGitService),
            __param(2, workspace_1.IWorkspaceContextService)
        ], MergeDecorator);
        return MergeDecorator;
    }());
    exports.MergeDecorator = MergeDecorator;
});
//# sourceMappingURL=gitEditorContributions.js.map