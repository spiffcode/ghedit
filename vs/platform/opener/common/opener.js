define(["require","exports","vs/base/common/winjs.base","vs/platform/instantiation/common/instantiation"],function(e,n,r,i){/*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
"use strict";n.IOpenerService=i.createDecorator("openerService"),n.NullOpenerService=Object.freeze({_serviceBrand:void 0,open:function(){return r.TPromise.as(void 0)}})});