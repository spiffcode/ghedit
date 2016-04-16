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
define(["require", "exports", 'vs/nls!vs/workbench/parts/git/browser/views/gitless/gitlessView', 'vs/base/common/platform', 'vs/base/common/winjs.base', 'vs/base/common/eventEmitter', 'vs/base/browser/builder', 'vs/platform/workspace/common/workspace', 'vs/platform/selection/common/selection', 'vs/css!./gitlessView'], function (require, exports, nls, platform, winjs, ee, builder, workspace_1, selection_1) {
    'use strict';
    var $ = builder.$;
    var GitlessView = (function (_super) {
        __extends(GitlessView, _super);
        function GitlessView(contextService) {
            _super.call(this);
            this.ID = 'gitless';
            this._contextService = contextService;
        }
        Object.defineProperty(GitlessView.prototype, "element", {
            get: function () {
                if (!this._element) {
                    this.render();
                }
                return this._element;
            },
            enumerable: true,
            configurable: true
        });
        GitlessView.prototype.render = function () {
            var instructions;
            if (platform.isMacintosh) {
                instructions = nls.localize(0, null, '<a href="http://brew.sh/" tabindex="0" target="_blank">Homebrew</a>', '<a href="http://git-scm.com/download/mac" tabindex="0" target="_blank">git-scm.com</a>', '<a href="https://developer.apple.com/xcode/" tabindex="0" target="_blank">XCode</a>', '<code>git</code>');
            }
            else if (platform.isWindows) {
                instructions = nls.localize(1, null, '<a href="https://chocolatey.org/packages/git" tabindex="0" target="_blank">Chocolatey</a>', '<a href="http://git-scm.com/download/win" tabindex="0" target="_blank">git-scm.com</a>');
            }
            else if (platform.isLinux) {
                instructions = nls.localize(2, null, '<a href="http://git-scm.com/download/linux" tabindex="0" target="_blank">git-scm.com</a>');
            }
            else {
                instructions = nls.localize(3, null, '<a href="http://git-scm.com/download" tabindex="0" target="_blank">git-scm.com</a>');
            }
            this._element = $([
                '<div class="gitless-view">',
                '<p>', nls.localize(4, null), '</p>',
                '<p>', instructions, '</p>',
                '<p>', nls.localize(5, null, this._contextService.getConfiguration().env.appName), '</p>',
                '</div>'
            ].join('')).getHTMLElement();
        };
        GitlessView.prototype.focus = function () {
            return;
        };
        GitlessView.prototype.layout = function (dimension) {
            return;
        };
        GitlessView.prototype.setVisible = function (visible) {
            return winjs.TPromise.as(null);
        };
        GitlessView.prototype.getSelection = function () {
            return selection_1.Selection.EMPTY;
        };
        GitlessView.prototype.getControl = function () {
            return null;
        };
        GitlessView.prototype.getActions = function () {
            return [];
        };
        GitlessView.prototype.getSecondaryActions = function () {
            return [];
        };
        GitlessView = __decorate([
            __param(0, workspace_1.IWorkspaceContextService)
        ], GitlessView);
        return GitlessView;
    }(ee.EventEmitter));
    exports.GitlessView = GitlessView;
});
//# sourceMappingURL=gitlessView.js.map