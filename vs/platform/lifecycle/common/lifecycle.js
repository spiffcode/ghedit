define(["require","exports","vs/platform/instantiation/common/instantiation"],function(e,n,i){/*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
"use strict";n.ILifecycleService=i.createDecorator("lifecycleService"),n.NullLifecycleService={_serviceBrand:null,onWillShutdown:function(){return{dispose:function(){}}},onShutdown:function(){return{dispose:function(){}}}}});