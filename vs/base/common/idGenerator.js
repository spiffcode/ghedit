define(["require","exports"],function(t,e){/*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
"use strict";var r=function(){function t(t){this._prefix=t,this._lastId=0}return t.prototype.nextId=function(){return this._prefix+ ++this._lastId},t}();e.IdGenerator=r,e.defaultGenerator=new r("id#")});