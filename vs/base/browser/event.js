define(["require","exports","vs/base/common/event"],function(e,n,t){/*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
"use strict";n.domEvent=function(e,n,r){var i=function(e){return o.fire(e)},o=new t.Emitter({onFirstListenerAdd:function(){e.addEventListener(n,i)},onLastListenerRemove:function(){e.removeEventListener(n,i)}});return o.event}});