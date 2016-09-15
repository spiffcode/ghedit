/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require","exports","vs/base/common/platform"],function(o,n,r){"use strict";function e(o,n){return void 0===n&&(n=!1),r.globals.MonacoEnvironment&&r.globals.MonacoEnvironment.hasOwnProperty(o)?r.globals.MonacoEnvironment[o]:n}n.getCrossOriginWorkerScriptUrl=e("getWorkerUrl",null)});