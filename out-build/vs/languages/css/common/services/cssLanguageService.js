var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/editor/common/services/resourceService'], function (require, exports, winjs, resourceService) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var PromiseWithTrigger = (function (_super) {
        __extends(PromiseWithTrigger, _super);
        function PromiseWithTrigger() {
            var _this = this;
            _super.call(this, function (c, e, p) {
                _this._valueCallback = c;
                _this._errorCallback = e;
            });
        }
        PromiseWithTrigger.prototype.resolve = function (data) {
            this._valueCallback(data);
            return this;
        };
        PromiseWithTrigger.prototype.reject = function (err) {
            this._errorCallback(err);
            return this;
        };
        return PromiseWithTrigger;
    }(winjs.TPromise));
    var CSSLanguageService = (function () {
        function CSSLanguageService(service, createParser, _cssModeId) {
            var _this = this;
            this._cssModeId = _cssModeId;
            this.resourceService = service;
            this.entries = {};
            this.callOnDispose = [];
            this.createParser = createParser;
            this.updateResources();
            this.callOnDispose.push(this.resourceService.addListener_(resourceService.ResourceEvents.ADDED, function (e) { return _this.onResourceAdded(e); }));
            this.callOnDispose.push(this.resourceService.addListener_(resourceService.ResourceEvents.REMOVED, function (e) { return _this.onResourceRemoved(e); }));
            this.callOnDispose.push(this.resourceService.addListener_(resourceService.ResourceEvents.CHANGED, function (e) { return _this.onResourceChange(e); }));
        }
        CSSLanguageService.prototype.dispose = function () {
            while (this.callOnDispose.length > 0) {
                this.callOnDispose.pop()();
            }
            clearTimeout(this.onChangeHandle);
            this.onChangeHandle = null;
            this.entries = null;
        };
        CSSLanguageService.prototype.onResourceAdded = function (e) {
            if (this._isMyMirrorModel(e.addedElement)) {
                this._scheduleRefreshLanguageService();
            }
        };
        CSSLanguageService.prototype.onResourceRemoved = function (e) {
            var url = e.url.toString();
            if (this.entries.hasOwnProperty(url)) {
                delete this.entries[url];
            }
        };
        CSSLanguageService.prototype.onResourceChange = function (e) {
            if (this._isMyModel(e.url)) {
                this._scheduleRefreshLanguageService();
            }
        };
        CSSLanguageService.prototype._scheduleRefreshLanguageService = function () {
            var _this = this;
            if (!this.activeDelay) {
                this.activeDelay = new PromiseWithTrigger();
            }
            if (this.onChangeHandle) {
                clearTimeout(this.onChangeHandle);
            }
            this.onChangeHandle = setTimeout(function () {
                _this.updateResources();
                _this.activeDelay.resolve(null);
                _this.activeDelay = null;
                _this.onChangeHandle = null;
            }, 50);
        };
        CSSLanguageService.prototype.join = function () {
            return (this.activeDelay || winjs.TPromise.as(null));
        };
        CSSLanguageService.prototype._isMyMirrorModel = function (resource) {
            return resource.getMode().getId() === this._cssModeId;
        };
        CSSLanguageService.prototype._isMyModel = function (url) {
            return this._isMyMirrorModel(this.resourceService.get(url));
        };
        CSSLanguageService.prototype.updateResources = function () {
            var _this = this;
            var n = 0;
            this.resourceService.all().filter(function (element) { return _this._isMyMirrorModel(element); }).forEach(function (model) {
                // Reparse changes or new models
                var url = model.getAssociatedResource().toString(), entry = _this.entries[url], hasEntry = typeof entry !== 'undefined';
                if (!hasEntry || entry.version !== model.getVersionId()) {
                    if (!hasEntry) {
                        entry = { node: null, version: -1 };
                        _this.entries[url] = entry;
                    }
                    entry.node = _this.createParser().parseStylesheet(model);
                    entry.node.setName(url);
                    entry.version = model.getVersionId();
                    n += 1;
                }
            });
            //		console.info('[less] updating ' + n + ' resources took ms' + (new Date().getTime() - t1));
        };
        CSSLanguageService.prototype.getStylesheet = function (resource) {
            if (this.entries.hasOwnProperty(resource.toString())) {
                return this.entries[resource.toString()].node;
            }
            return null;
        };
        return CSSLanguageService;
    }());
    exports.CSSLanguageService = CSSLanguageService;
});
//# sourceMappingURL=cssLanguageService.js.map