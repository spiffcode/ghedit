/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

// Forked from vs/workbench/workbench.main.ts
// This is a port of vs/workbench/workbench.main.ts with Electron
// and Node dependencies removed/replaced.
import 'lib/github';

// Base
import 'vs/base/common/strings';
import 'vs/base/common/errors';

// Editor
// DESKTOP: import 'vs/editor/contrib/selectionClipboard/electron-browser/selectionClipboard';
// DESKTOP: import 'vs/editor/contrib/suggest/electron-browser/snippetCompletion';
import 'vs/editor/browser/editor.all';

// Languages
import 'vs/languages/languages.main';

// Menus/Actions
import 'vs/platform/actions/browser/menusExtensionPoint';

// Workbench
import 'vs/workbench/browser/actions/toggleStatusbarVisibility';
import 'vs/workbench/browser/actions/toggleSidebarVisibility';
import 'vs/workbench/browser/actions/toggleSidebarPosition';
import 'forked/openSettings';
import 'vs/workbench/browser/actions/configureLocale';

import 'vs/workbench/parts/quickopen/browser/quickopen.contribution';
import 'vs/workbench/browser/parts/editor/editorPicker';

import 'vs/workbench/parts/files/browser/explorerViewlet';
import 'forked/fileActions.contribution'; // Was 'vs/workbench/parts/files/browser/fileActions.contribution'
import 'vs/workbench/parts/files/browser/files.contribution';
// DESKTOP: import 'vs/workbench/parts/files/electron-browser/files.electron.contribution';

import 'forked/search.contribution'; // Was 'vs/workbench/parts/search/browser/search.contribution'


// DESKTOP: import 'vs/workbench/parts/git/electron-browser/git.contribution';
import 'vs/workbench/parts/git/browser/gitQuickOpen';
// DESKTOP: import 'vs/workbench/parts/git/browser/gitActions.contribution';

// DESKTOP: import 'vs/workbench/parts/debug/electron-browser/debug.contribution';

import 'vs/workbench/parts/markers/markers.contribution';

import 'vs/workbench/parts/html/browser/html.contribution';

// DESKTOP: import 'vs/workbench/parts/extensions/electron-browser/extensions.contribution';
// DESKTOP: import 'vs/workbench/parts/extensions/electron-browser/extensionsQuickOpen';


import 'vs/workbench/parts/output/browser/output.contribution';

// DESKTOP: import 'vs/workbench/parts/terminal/electron-browser/terminal.contribution';

// DESKTOP: import 'vs/workbench/electron-browser/workbench';

// DESKTOP: import 'vs/workbench/parts/tasks/electron-browser/task.contribution';

// DESKTOP: import 'vs/workbench/parts/emmet/node/emmet.contribution';

// DESKTOP: import 'vs/workbench/parts/execution/electron-browser/execution.contribution';
// DESKTOP: import 'vs/workbench/parts/execution/electron-browser/terminal.contribution';

// DESKTOP: import 'vs/workbench/parts/snippets/electron-browser/snippets.contribution';

import 'vs/workbench/parts/contentprovider/common/contentprovider.contribution';

import 'forked/themes.contribution';

// DESKTOP: import 'vs/workbench/parts/feedback/electron-browser/feedback.contribution';

// DESKTOP: import 'vs/workbench/parts/welcome/electron-browser/electronGettingStarted.contribution';

// DESKTOP: import 'vs/workbench/parts/update/electron-browser/update.contribution';

// DESKTOP: import 'vs/workbench/electron-browser/darwin/cli.contribution';
// DESKTOP: import 'vs/workbench/electron-browser/nps.contribution';

// DESKTOP: import 'vs/workbench/api/node/extHost.contribution';

// DESKTOP: import 'vs/workbench/electron-browser/main.contribution';
import 'forked/editor.main';
import 'forked/main'; // Replaces 'vs/workbench/electron-browser/main'

// DESKTOP: import 'vs/workbench/parts/themes/test/electron-browser/themes.test.contribution';
