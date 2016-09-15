/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require","exports","vs/base/common/types"],function(n,r,t){"use strict";function u(n,r,u){var e,o;t.isNumber(r)?(e=n,o=r):(e=0,o=n,u=r);for(var i=e<=o?function(n){return n+1}:function(n){return n-1},c=e<=o?function(n,r){return n<r}:function(n,r){return n>r},f=e;c(f,o);f=i(f))u(f)}function e(n,r){var e=[],o=function(n){return e.push(n)};return t.isUndefined(r)?u(n,o):u(n,r,o),e}r.count=u,r.countToArray=e});