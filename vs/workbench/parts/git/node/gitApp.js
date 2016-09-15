/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require","exports","vs/base/parts/ipc/node/ipc.cp","./rawGitServiceBootstrap","vs/workbench/parts/git/common/gitIpc"],function(e,r,s,c,t){"use strict";var a=new s.Server,i=c.createRawGitService(process.argv[2],process.argv[3],process.argv[4],process.argv[5],process.argv[6]),o=new t.GitChannel(i);a.registerChannel("git",o)});