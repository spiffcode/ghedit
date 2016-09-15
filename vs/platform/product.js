/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require","exports","path","vs/base/common/uri"],function(e,r,o,a){"use strict";var t=o.dirname(a["default"].parse(e.toUrl("")).fsPath),n=o.join(t,"product.json"),d=e.__$__nodeRequire(n);process.env.VSCODE_DEV&&(d.nameShort+=" Dev",d.nameLong+=" Dev",d.dataFolderName+="-dev"),Object.defineProperty(r,"__esModule",{value:!0}),r["default"]=d});