define(["require","exports"],function(e,n){/*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
"use strict";function t(e,n,t,r){n[o.DI_TARGET]===n?n[o.DI_DEPENDENCIES].push({id:e,index:t,optional:r}):(n[o.DI_DEPENDENCIES]=[{id:e,index:t,optional:r}],n[o.DI_TARGET]=n)}function r(e){var n=function(e,r,i){if(3!==arguments.length)throw new Error("@IServiceName-decorator can only be used to decorate a parameter");t(n,e,i,!1)};return n.toString=function(){return e},n}function i(e){return function(n,r,i){if(3!==arguments.length)throw new Error("@optional-decorator can only be used to decorate a parameter");t(e,n,i,!0)}}var o;!function(e){function n(n){return n[e.DI_DEPENDENCIES]||[]}e.DI_TARGET="$di$target",e.DI_DEPENDENCIES="$di$dependencies",e.getServiceDependencies=n}(o=n._util||(n._util={})),n.IInstantiationService=r("instantiationService"),n.createDecorator=r,n.optional=i});