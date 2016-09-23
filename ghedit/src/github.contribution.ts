/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import nls = require('vs/nls');
import {Registry} from 'vs/platform/platform';
import {QuickOpenHandlerDescriptor, IQuickOpenRegistry, Extensions as QuickOpenExtensions} from 'vs/workbench/browser/quickopen';
import {OPEN_REPO_PREFIX} from 'ghedit/githubActions';
import "ghedit/openRepoHandler";

(<IQuickOpenRegistry>Registry.as(QuickOpenExtensions.Quickopen)).registerQuickOpenHandler(
	new QuickOpenHandlerDescriptor(
		'openRepoHandler',
		'OpenRepoHandler',
		OPEN_REPO_PREFIX,
		nls.localize('openRepoDescription', "Open Repository")
	)
);
