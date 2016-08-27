/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Forked from c212f0908f3d29933317bbc3233568fbca7944b1:./vs/workbench/workbench.main.js
// This is a port of vs/workbench/workbench.main.js with Electron
// and Node dependencies removed/replaced.

require.config({
	ignoreDuplicateModules: [
		'vs/workbench/parts/search/common/searchModel',
		'vs/workbench/parts/search/common/searchQuery'
	]
});

define([
	'lib/github',

	// Base
	'vs/base/common/strings',
	'vs/base/common/errors',

	// Editor
// TODO:	'vs/editor/contrib/selectionClipboard/electron-browser/selectionClipboard',
	'vs/editor/browser/editor.all',

	// Languages
	'vs/languages/languages.main',

	// Workbench
	'vs/workbench/browser/actions/toggleSidebarVisibility',
	'vs/workbench/browser/actions/toggleSidebarPosition',
	'vs/workbench/browser/actions/triggerQuickOpen',
	'vs/workbench/browser/actions/triggerEditorActions',
	'vs/workbench/browser/actions/triggerNavigation',
	'vs/workbench/browser/actions/showPerformanceBox',
	'vs/workbench/browser/actions/openSettings',
	'vs/workbench/browser/actions/configureLocale',

	'vs/workbench/parts/quickopen/browser/quickopen.contribution',

	'vs/workbench/parts/files/browser/explorerViewlet',
	'vs/workbench/parts/files/browser/workingFilesPicker',
	//'vs/workbench/parts/files/browser/fileActions.contribution',
	'forked/fileActions.contribution',
	'vs/workbench/parts/files/browser/files.contribution',
// TODO:	'vs/workbench/parts/files/electron-browser/files.electron.contribution',

//	'vs/workbench/parts/search/browser/search.contribution',
	'forked/search.contribution',

// TODO:	'vs/workbench/parts/git/electron-browser/git.contribution',
	'vs/workbench/parts/git/browser/gitQuickOpen',
// TODO:	'vs/workbench/parts/git/browser/gitActions.contribution',

// TODO:	'vs/workbench/parts/debug/electron-browser/debug.contribution',

	'vs/workbench/parts/errorList/browser/errorList.contribution',

	'vs/workbench/parts/html/browser/html.contribution',

// TODO:	'vs/workbench/parts/extensions/electron-browser/extensions.contribution',
// TODO:	'vs/workbench/parts/extensions/electron-browser/extensionsQuickOpen',

	'vs/workbench/parts/output/browser/output.contribution',

	'vs/workbench/parts/markdown/browser/markdown.contribution',
	'vs/workbench/parts/markdown/browser/markdownActions.contribution',

	'vs/workbench/browser/workbench',

// TODO:	'vs/workbench/parts/tasks/electron-browser/task.contribution',

// TODO:	'vs/workbench/parts/emmet/node/emmet.contribution',

// TODO:	'vs/workbench/parts/execution/electron-browser/execution.contribution',
// TODO:	'vs/workbench/parts/execution/electron-browser/terminal.contribution',

// TODO:	'vs/workbench/parts/snippets/electron-browser/snippets.contribution',

	'vs/workbench/parts/contentprovider/common/contentprovider.contribution',

// TODO:	'vs/workbench/parts/telemetry/node/appInsights.telemetry.contribution',

	'vs/workbench/parts/themes/electron-browser/themes.contribution',

// TODO:	'vs/workbench/parts/feedback/electron-browser/feedback.contribution',

// TODO:	'vs/workbench/parts/gettingStarted/electron-browser/electronGettingStarted.contribution',

// TODO:	'vs/workbench/parts/update/electron-browser/update.contribution',

// TODO:	'vs/workbench/electron-browser/darwin/cli.contribution',

// TODO:	'vs/workbench/api/node/extHost.contribution',

// TODO:	'vs/workbench/electron-browser/main.contribution',
	// TODO: How is Electron-browser getting this css?
	'vs/css!vs/editor/browser/standalone/media/standalone-tokens',

	// 'vs/nls!vs/workbench/workbench.main',
	'vs/css!vs/workbench/workbench.main',
	'forked/main' // Replaces 'vs/workbench/electron-browser/main'

// TODO:	'vs/workbench/parts/themes/test/electron-browser/themes.test.contribution'

], function() {
	'use strict';
});
