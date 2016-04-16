define(["require", "exports", 'vs/workbench/parts/git/browser/gitWorkbenchContributions', 'vs/workbench/parts/git/electron-browser/electronGitService', 'vs/workbench/parts/git/common/git', 'vs/platform/instantiation/common/extensions'], function (require, exports, gitWorkbenchContributions_1, electronGitService_1, git_1, extensions_1) {
    "use strict";
    gitWorkbenchContributions_1.registerContributions();
    // Register Service
    extensions_1.registerSingleton(git_1.IGitService, electronGitService_1.ElectronGitService);
});
//# sourceMappingURL=git.contribution.js.map