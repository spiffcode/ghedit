define(["require","exports","./extHost.protocol"],function(t,e,n){/*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
"use strict";var o=function(){function t(t){this._proxy=t.get(n.MainContext.MainThreadLanguages)}return t.prototype.getLanguages=function(){return this._proxy.$getLanguages()},t}();e.ExtHostLanguages=o});