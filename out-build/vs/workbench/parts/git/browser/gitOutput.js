var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/workbench/parts/git/common/git', 'vs/workbench/parts/output/common/output'], function (require, exports, git_1, output_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var GitOutput = (function () {
        function GitOutput(gitService, outputService) {
            var _this = this;
            this.gitService = gitService;
            this.outputService = outputService;
            // we must make sure onOutput is the first thing the git service is asked,
            // so before any service operation, we call onOutput first
            gitService.addListener2(git_1.ServiceEvents.OPERATION_START, function () { return _this.setup(); });
        }
        GitOutput.prototype.getId = function () {
            return GitOutput.ID;
        };
        GitOutput.prototype.setup = function () {
            var _this = this;
            if (this.promise) {
                return;
            }
            this.promise = this.gitService.onOutput().then(function () {
                _this.promise = null;
            }, function (e) {
                if (e && e.name === 'Canceled') {
                    _this.promise = null;
                }
                else {
                    console.error(e);
                }
            }, function (o) { return _this.onOutput(o); });
        };
        GitOutput.prototype.onOutput = function (output) {
            this.outputService.getChannel('Git').append(output);
        };
        GitOutput.prototype.dispose = function () {
            if (this.promise) {
                this.promise.cancel();
                this.promise = null;
            }
        };
        GitOutput.ID = 'Monaco.IDE.UI.Viewlets.GitViewlet.Workbench.GitOutput';
        GitOutput = __decorate([
            __param(0, git_1.IGitService),
            __param(1, output_1.IOutputService)
        ], GitOutput);
        return GitOutput;
    }());
    exports.GitOutput = GitOutput;
});
//# sourceMappingURL=gitOutput.js.map