define(["require","exports","vs/editor/common/core/viewLineToken"],function(e,n,i){/*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
"use strict";var t=function(){function e(){}return e.create=function(e,n,t,r){var o=e.sliceAndInflate(n,t,r);return new i.ViewLineTokens(o,r,t-n+r)},e}();n.FilteredLineTokens=t;var r=function(){function e(){}return e.create=function(e,n){var t=e.inflate();return new i.ViewLineTokens(t,0,n)},e}();n.IdentityFilteredLineTokens=r});