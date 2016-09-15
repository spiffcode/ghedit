/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require","exports","vs/base/common/uri"],function(t,a,e){"use strict";var r=e["default"].parse(t.toUrl("paths")).fsPath,s=t.__$__nodeRequire(r);a.getAppDataPath=s.getAppDataPath,a.getUserDataPath=s.getUserDataPath});