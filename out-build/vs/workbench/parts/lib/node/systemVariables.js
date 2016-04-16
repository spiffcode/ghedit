var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/paths', 'vs/base/common/parsers', 'vs/workbench/common/editor'], function (require, exports, Paths, parsers_1, WorkbenchEditorCommon) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var SystemVariables = (function (_super) {
        __extends(SystemVariables, _super);
        // Optional workspaceRoot there to be used in tests.
        function SystemVariables(editorService, contextService, workspaceRoot) {
            var _this = this;
            if (workspaceRoot === void 0) { workspaceRoot = null; }
            _super.call(this);
            this.editorService = editorService;
            var fsPath = workspaceRoot ? workspaceRoot.fsPath : contextService.getWorkspace().resource.fsPath;
            this._workspaceRoot = Paths.normalize(fsPath, true);
            this._execPath = contextService ? contextService.getConfiguration().env.execPath : null;
            Object.keys(process.env).forEach(function (key) {
                _this[("env." + key)] = process.env[key];
            });
        }
        Object.defineProperty(SystemVariables.prototype, "execPath", {
            get: function () {
                return this._execPath;
            },
            set: function (value) {
                this._execPath = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SystemVariables.prototype, "cwd", {
            get: function () {
                return this.workspaceRoot;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SystemVariables.prototype, "workspaceRoot", {
            get: function () {
                return this._workspaceRoot;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SystemVariables.prototype, "file", {
            get: function () {
                return this.getFilePath();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SystemVariables.prototype, "fileBasename", {
            get: function () {
                return Paths.basename(this.getFilePath());
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SystemVariables.prototype, "fileDirname", {
            get: function () {
                return Paths.dirname(this.getFilePath());
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SystemVariables.prototype, "fileExtname", {
            get: function () {
                return Paths.extname(this.getFilePath());
            },
            enumerable: true,
            configurable: true
        });
        SystemVariables.prototype.getFilePath = function () {
            var input = this.editorService.getActiveEditorInput();
            if (!input) {
                return '';
            }
            var fei = WorkbenchEditorCommon.asFileEditorInput(input);
            if (!fei) {
                return '';
            }
            var resource = fei.getResource();
            return Paths.normalize(resource.fsPath, true);
        };
        return SystemVariables;
    }(parsers_1.AbstractSystemVariables));
    exports.SystemVariables = SystemVariables;
});
//# sourceMappingURL=systemVariables.js.map