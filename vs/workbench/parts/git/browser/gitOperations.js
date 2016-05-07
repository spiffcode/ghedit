define(["require", "exports", 'vs/workbench/parts/git/common/git', 'vs/base/common/winjs.base'], function (require, exports, git, winjs) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var GitOperation = (function () {
        function GitOperation(id, fn) {
            this.id = id;
            this.fn = fn;
            // noop
        }
        GitOperation.prototype.run = function () {
            return this.fn();
        };
        GitOperation.prototype.dispose = function () {
            // noop
        };
        return GitOperation;
    }());
    exports.GitOperation = GitOperation;
    var CommandOperation = (function () {
        function CommandOperation(input) {
            this.input = input;
            this.id = git.ServiceOperations.COMMAND;
            // noop
        }
        CommandOperation.prototype.run = function () {
            return winjs.TPromise.as(null);
        };
        CommandOperation.prototype.dispose = function () {
            this.id = null;
            this.input = null;
        };
        return CommandOperation;
    }());
    exports.CommandOperation = CommandOperation;
});
//# sourceMappingURL=gitOperations.js.map