/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require","exports"],function(t,n){"use strict";var e=function(){function t(t){this.service=t}return t.prototype.call=function(t,n){switch(t){case"watch":return this.service.watch(n)}},t}();n.WatcherChannel=e;var c=function(){function t(t){this.channel=t}return t.prototype.watch=function(t){return this.channel.call("watch",t)},t}();n.WatcherChannelClient=c});