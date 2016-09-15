/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require","exports"],function(e,r){"use strict";var t=function(){function e(){this.debugViews=[]}return e.prototype.registerDebugView=function(e,r){this.debugViews.push({view:e,order:r})},e.prototype.getDebugViews=function(){return this.debugViews.sort(function(e,r){return e.order-r.order}).map(function(e){return e.view})},e}();r.DebugViewRegistry=new t});