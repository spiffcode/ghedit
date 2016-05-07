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
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/actions', 'vs/nls', 'vs/base/common/paths', 'vs/base/common/labels', 'vs/base/common/platform', 'vs/base/common/severity', 'vs/workbench/services/editor/common/editorService', 'vs/workbench/common/editor', 'vs/platform/message/common/message', 'electron'], function (require, exports, winjs_base_1, actions_1, nls, paths, labels, platform, severity_1, editorService_1, editor_1, message_1, electron_1) {
    'use strict';
    var RevealInOSAction = (function (_super) {
        __extends(RevealInOSAction, _super);
        function RevealInOSAction(resource) {
            _super.call(this, 'workbench.action.files.revealInWindows', platform.isWindows ? nls.localize('revealInWindows', "Reveal in Explorer") : (platform.isMacintosh ? nls.localize('revealInMac', "Reveal in Finder") : nls.localize('openContainer', "Open Containing Folder")));
            this.resource = resource;
            this.order = 45;
        }
        RevealInOSAction.prototype.run = function () {
            electron_1.shell.showItemInFolder(paths.normalize(this.resource.fsPath, true));
            return winjs_base_1.TPromise.as(true);
        };
        return RevealInOSAction;
    }(actions_1.Action));
    exports.RevealInOSAction = RevealInOSAction;
    var GlobalRevealInOSAction = (function (_super) {
        __extends(GlobalRevealInOSAction, _super);
        function GlobalRevealInOSAction(id, label, editorService, messageService) {
            _super.call(this, id, label);
            this.editorService = editorService;
            this.messageService = messageService;
        }
        GlobalRevealInOSAction.prototype.run = function () {
            var fileInput = editor_1.asFileEditorInput(this.editorService.getActiveEditorInput(), true);
            if (fileInput) {
                electron_1.shell.showItemInFolder(paths.normalize(fileInput.getResource().fsPath, true));
            }
            else {
                this.messageService.show(severity_1.default.Info, nls.localize('openFileToReveal', "Open a file first to reveal"));
            }
            return winjs_base_1.TPromise.as(true);
        };
        GlobalRevealInOSAction.ID = 'workbench.action.files.revealActiveFileInWindows';
        GlobalRevealInOSAction.LABEL = platform.isWindows ? nls.localize('revealActiveFileInWindows', "Reveal Active File in Windows Explorer") : (platform.isMacintosh ? nls.localize('revealActiveFileInMac', "Reveal Active File in Finder") : nls.localize('openActiveFileContainer', "Open Containing Folder of Active File"));
        GlobalRevealInOSAction = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, message_1.IMessageService)
        ], GlobalRevealInOSAction);
        return GlobalRevealInOSAction;
    }(actions_1.Action));
    exports.GlobalRevealInOSAction = GlobalRevealInOSAction;
    var CopyPathAction = (function (_super) {
        __extends(CopyPathAction, _super);
        function CopyPathAction(resource) {
            _super.call(this, 'workbench.action.files.copyPath', nls.localize('copyPath', "Copy Path"));
            this.resource = resource;
            this.order = 140;
        }
        CopyPathAction.prototype.run = function () {
            electron_1.clipboard.writeText(labels.getPathLabel(this.resource));
            return winjs_base_1.TPromise.as(true);
        };
        return CopyPathAction;
    }(actions_1.Action));
    exports.CopyPathAction = CopyPathAction;
    var GlobalCopyPathAction = (function (_super) {
        __extends(GlobalCopyPathAction, _super);
        function GlobalCopyPathAction(id, label, editorService, messageService) {
            _super.call(this, id, label);
            this.editorService = editorService;
            this.messageService = messageService;
        }
        GlobalCopyPathAction.prototype.run = function () {
            var fileInput = editor_1.asFileEditorInput(this.editorService.getActiveEditorInput(), true);
            if (fileInput) {
                electron_1.clipboard.writeText(labels.getPathLabel(fileInput.getResource()));
                this.editorService.focusEditor(); // focus back to editor
            }
            else {
                this.messageService.show(severity_1.default.Info, nls.localize('openFileToCopy', "Open a file first to copy its path"));
            }
            return winjs_base_1.TPromise.as(true);
        };
        GlobalCopyPathAction.ID = 'workbench.action.files.copyPathOfActiveFile';
        GlobalCopyPathAction.LABEL = nls.localize('copyPathOfActive', "Copy Path of Active File");
        GlobalCopyPathAction = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, message_1.IMessageService)
        ], GlobalCopyPathAction);
        return GlobalCopyPathAction;
    }(actions_1.Action));
    exports.GlobalCopyPathAction = GlobalCopyPathAction;
    var BaseOpenAction = (function (_super) {
        __extends(BaseOpenAction, _super);
        function BaseOpenAction(id, label, ipcMsg) {
            _super.call(this, id, label);
            this.ipcMsg = ipcMsg;
        }
        BaseOpenAction.prototype.run = function () {
            electron_1.ipcRenderer.send(this.ipcMsg); // Handle in browser process
            return winjs_base_1.TPromise.as(true);
        };
        return BaseOpenAction;
    }(actions_1.Action));
    exports.BaseOpenAction = BaseOpenAction;
    exports.OPEN_FILE_ID = 'workbench.action.files.openFile';
    exports.OPEN_FILE_LABEL = nls.localize('openFile', "Open File...");
    var OpenFileAction = (function (_super) {
        __extends(OpenFileAction, _super);
        function OpenFileAction(id, label) {
            _super.call(this, id, label, 'vscode:openFilePicker');
        }
        return OpenFileAction;
    }(BaseOpenAction));
    exports.OpenFileAction = OpenFileAction;
    exports.OPEN_FOLDER_ID = 'workbench.action.files.openFolder';
    exports.OPEN_FOLDER_LABEL = nls.localize('openFolder', "Open Folder...");
    var OpenFolderAction = (function (_super) {
        __extends(OpenFolderAction, _super);
        function OpenFolderAction(id, label) {
            _super.call(this, id, label, 'vscode:openFolderPicker');
        }
        return OpenFolderAction;
    }(BaseOpenAction));
    exports.OpenFolderAction = OpenFolderAction;
    exports.OPEN_FILE_FOLDER_ID = 'workbench.action.files.openFileFolder';
    exports.OPEN_FILE_FOLDER_LABEL = nls.localize('openFileFolder', "Open...");
    var OpenFileFolderAction = (function (_super) {
        __extends(OpenFileFolderAction, _super);
        function OpenFileFolderAction(id, label) {
            _super.call(this, id, label, 'vscode:openFileFolderPicker');
        }
        return OpenFileFolderAction;
    }(BaseOpenAction));
    exports.OpenFileFolderAction = OpenFileFolderAction;
    var ShowOpenedFileInNewWindow = (function (_super) {
        __extends(ShowOpenedFileInNewWindow, _super);
        function ShowOpenedFileInNewWindow(id, label, editorService, messageService) {
            _super.call(this, id, label);
            this.editorService = editorService;
            this.messageService = messageService;
        }
        ShowOpenedFileInNewWindow.prototype.run = function () {
            var fileInput = editor_1.asFileEditorInput(this.editorService.getActiveEditorInput(), true);
            if (fileInput) {
                electron_1.ipcRenderer.send('vscode:windowOpen', [fileInput.getResource().fsPath], true /* force new window */); // handled from browser process
            }
            else {
                this.messageService.show(severity_1.default.Info, nls.localize('openFileToShow', "Open a file first to open in new window"));
            }
            return winjs_base_1.TPromise.as(true);
        };
        ShowOpenedFileInNewWindow.ID = 'workbench.action.files.showOpenedFileInNewWindow';
        ShowOpenedFileInNewWindow.LABEL = nls.localize('openFileInNewWindow', "Open Active File in New Window");
        ShowOpenedFileInNewWindow = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, message_1.IMessageService)
        ], ShowOpenedFileInNewWindow);
        return ShowOpenedFileInNewWindow;
    }(actions_1.Action));
    exports.ShowOpenedFileInNewWindow = ShowOpenedFileInNewWindow;
});
//# sourceMappingURL=electronFileActions.js.map