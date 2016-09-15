define(["require","exports","./descriptors"],function(e,r,i){/*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
"use strict";function s(e,r){n.push({id:e,descriptor:new i.SyncDescriptor(r)})}function t(){return n}r.Services="di.services";var n=[];r.registerSingleton=s,r.getServices=t});