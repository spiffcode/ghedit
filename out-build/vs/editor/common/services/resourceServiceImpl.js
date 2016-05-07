var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/eventEmitter', 'vs/editor/common/services/resourceService'], function (require, exports, eventEmitter_1, resourceService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ResourceService = (function (_super) {
        __extends(ResourceService, _super);
        function ResourceService() {
            _super.call(this);
            this.serviceId = resourceService_1.IResourceService;
            this.data = {};
            this.unbinds = {};
        }
        ResourceService.prototype.addListener_ = function (eventType, listener) {
            return _super.prototype.addListener.call(this, eventType, listener);
        };
        ResourceService.prototype.addListener2_ = function (eventType, listener) {
            return _super.prototype.addListener2.call(this, eventType, listener);
        };
        ResourceService.prototype._anonymousModelId = function (input) {
            var r = '';
            for (var i = 0; i < input.length; i++) {
                var ch = input[i];
                if (ch >= '0' && ch <= '9') {
                    r += '0';
                    continue;
                }
                if (ch >= 'a' && ch <= 'z') {
                    r += 'a';
                    continue;
                }
                if (ch >= 'A' && ch <= 'Z') {
                    r += 'A';
                    continue;
                }
                r += ch;
            }
            return r;
        };
        ResourceService.prototype.insert = function (url, element) {
            var _this = this;
            // console.log('INSERT: ' + url.toString());
            if (this.contains(url)) {
                // There already exists a model with this id => this is a programmer error
                throw new Error('ResourceService: Cannot add model ' + this._anonymousModelId(url.toString()) + ' because it already exists!');
            }
            // add resource
            var key = url.toString();
            this.data[key] = element;
            this.unbinds[key] = [];
            this.unbinds[key].push(element.addBulkListener(function (value) {
                _this.emit(resourceService_1.ResourceEvents.CHANGED, { url: url, originalEvents: value });
            }));
            // event
            this.emit(resourceService_1.ResourceEvents.ADDED, { url: url, addedElement: element });
        };
        ResourceService.prototype.get = function (url) {
            if (!this.data[url.toString()]) {
                return null;
            }
            return this.data[url.toString()];
        };
        ResourceService.prototype.all = function () {
            var _this = this;
            return Object.keys(this.data).map(function (key) {
                return _this.data[key];
            });
        };
        ResourceService.prototype.contains = function (url) {
            return !!this.data[url.toString()];
        };
        ResourceService.prototype.remove = function (url) {
            // console.log('REMOVE: ' + url.toString());
            if (!this.contains(url)) {
                return;
            }
            var key = url.toString(), element = this.data[key];
            // stop listen
            while (this.unbinds[key].length > 0) {
                this.unbinds[key].pop()();
            }
            // removal
            delete this.unbinds[key];
            delete this.data[key];
            // event
            this.emit(resourceService_1.ResourceEvents.REMOVED, { url: url, removedElement: element });
        };
        return ResourceService;
    }(eventEmitter_1.EventEmitter));
    exports.ResourceService = ResourceService;
});
//# sourceMappingURL=resourceServiceImpl.js.map