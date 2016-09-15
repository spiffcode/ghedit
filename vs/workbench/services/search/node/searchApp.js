/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require","exports","vs/base/parts/ipc/node/ipc.cp","./searchIpc","./rawSearchService"],function(e,r,c,a,n){"use strict";var i=new c.Server,s=new n.SearchService,h=new a.SearchChannel(s);i.registerChannel("search",h)});