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
define(["require", "exports", 'vs/nls!vs/workbench/parts/files/electron-browser/files.electron.contribution', 'vs/platform/platform', 'vs/workbench/browser/actionBarRegistry', 'vs/workbench/common/actionRegistry', 'vs/platform/actions/common/actions', 'vs/base/common/platform', 'vs/workbench/parts/files/common/files', 'vs/workbench/common/contributions', 'vs/workbench/parts/files/browser/fileActions', 'vs/workbench/parts/files/electron-browser/electronFileTracker', 'vs/workbench/parts/files/electron-browser/textFileServices', 'vs/workbench/parts/files/electron-browser/electronFileActions', 'vs/platform/instantiation/common/instantiation', 'vs/platform/instantiation/common/extensions', 'vs/base/common/keyCodes'], function (require, exports, nls, platform_1, actionBarRegistry_1, actionRegistry_1, actions_1, env, files_1, contributions_1, fileActions_1, electronFileTracker_1, textFileServices_1, electronFileActions_1, instantiation_1, extensions_1, keyCodes_1) {
    'use strict';
    var FileViewerActionContributor = (function (_super) {
        __extends(FileViewerActionContributor, _super);
        function FileViewerActionContributor(instantiationService) {
            _super.call(this);
            this.instantiationService = instantiationService;
        }
        FileViewerActionContributor.prototype.hasSecondaryActions = function (context) {
            var element = context.element;
            // Contribute only on Files (File Explorer and Open Files Viewer)
            return !!files_1.asFileResource(element);
        };
        FileViewerActionContributor.prototype.getSecondaryActions = function (context) {
            var actions = [];
            if (this.hasSecondaryActions(context)) {
                var fileResource = files_1.asFileResource(context.element);
                // Reveal file in OS native explorer
                actions.push(this.instantiationService.createInstance(electronFileActions_1.RevealInOSAction, fileResource.resource));
                // Copy Path
                actions.push(this.instantiationService.createInstance(electronFileActions_1.CopyPathAction, fileResource.resource));
            }
            return actions;
        };
        FileViewerActionContributor = __decorate([
            __param(0, instantiation_1.IInstantiationService)
        ], FileViewerActionContributor);
        return FileViewerActionContributor;
    }(actionBarRegistry_1.ActionBarContributor));
    // Contribute Actions
    var category = nls.localize(0, null);
    var workbenchActionsRegistry = platform_1.Registry.as(actionRegistry_1.Extensions.WorkbenchActions);
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(fileActions_1.SaveFileAsAction, fileActions_1.SaveFileAsAction.ID, fileActions_1.SaveFileAsAction.LABEL, { primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.KEY_S }), category);
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(fileActions_1.GlobalNewFileAction, fileActions_1.GlobalNewFileAction.ID, fileActions_1.GlobalNewFileAction.LABEL, { primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_N }), category);
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(electronFileActions_1.GlobalCopyPathAction, electronFileActions_1.GlobalCopyPathAction.ID, electronFileActions_1.GlobalCopyPathAction.LABEL, { primary: keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K, keyCodes_1.KeyCode.KEY_P) }), category);
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(electronFileActions_1.GlobalRevealInOSAction, electronFileActions_1.GlobalRevealInOSAction.ID, electronFileActions_1.GlobalRevealInOSAction.LABEL, { primary: keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K, keyCodes_1.KeyCode.KEY_R) }), category);
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(electronFileActions_1.ShowOpenedFileInNewWindow, electronFileActions_1.ShowOpenedFileInNewWindow.ID, electronFileActions_1.ShowOpenedFileInNewWindow.LABEL, { primary: keyCodes_1.KeyMod.chord(keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_K, keyCodes_1.KeyCode.KEY_O) }), category);
    if (env.isMacintosh) {
        workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(electronFileActions_1.OpenFileFolderAction, electronFileActions_1.OPEN_FILE_FOLDER_ID, electronFileActions_1.OPEN_FILE_FOLDER_LABEL, { primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_O }), category);
    }
    else {
        workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(electronFileActions_1.OpenFileAction, electronFileActions_1.OPEN_FILE_ID, electronFileActions_1.OPEN_FILE_LABEL, { primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_O }), category);
        workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(electronFileActions_1.OpenFolderAction, electronFileActions_1.OPEN_FOLDER_ID, electronFileActions_1.OPEN_FOLDER_LABEL), category);
    }
    // Contribute to File Viewers
    var actionsRegistry = platform_1.Registry.as(actionBarRegistry_1.Extensions.Actionbar);
    actionsRegistry.registerActionBarContributor(actionBarRegistry_1.Scope.VIEWER, FileViewerActionContributor);
    // Register File Workbench Extension
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(electronFileTracker_1.FileTracker);
    // Register Service
    extensions_1.registerSingleton(files_1.ITextFileService, textFileServices_1.TextFileService);
});
//# sourceMappingURL=files.electron.contribution.js.map