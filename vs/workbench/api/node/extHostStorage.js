define(["require","exports","./extHost.protocol"],function(t,e,o){/*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
"use strict";var r=function(){function t(t){this._proxy=t.get(o.MainContext.MainThreadStorage)}return t.prototype.getValue=function(t,e,o){return this._proxy.$getValue(t,e).then(function(t){return t||o})},t.prototype.setValue=function(t,e,o){return this._proxy.$setValue(t,e,o)},t}();e.ExtHostStorage=r});