/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    'use strict';
    var SearchChannel = (function () {
        function SearchChannel(service) {
            this.service = service;
        }
        SearchChannel.prototype.call = function (command, arg) {
            switch (command) {
                case 'fileSearch': return this.service.fileSearch(arg);
                case 'textSearch': return this.service.textSearch(arg);
            }
        };
        return SearchChannel;
    }());
    exports.SearchChannel = SearchChannel;
    var SearchChannelClient = (function () {
        function SearchChannelClient(channel) {
            this.channel = channel;
        }
        SearchChannelClient.prototype.fileSearch = function (search) {
            return this.channel.call('fileSearch', search);
        };
        SearchChannelClient.prototype.textSearch = function (search) {
            return this.channel.call('textSearch', search);
        };
        return SearchChannelClient;
    }());
    exports.SearchChannelClient = SearchChannelClient;
});
//# sourceMappingURL=searchIpc.js.map