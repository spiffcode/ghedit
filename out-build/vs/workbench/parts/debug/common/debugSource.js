/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/uri', 'vs/base/common/paths'], function (require, exports, uri_1, paths) {
    "use strict";
    var Source = (function () {
        function Source(raw, available) {
            if (available === void 0) { available = true; }
            this.raw = raw;
            this.uri = raw.path ? uri_1.default.file(raw.path) : uri_1.default.parse(Source.INTERNAL_URI_PREFIX + raw.name);
            this.available = available;
        }
        Object.defineProperty(Source.prototype, "name", {
            get: function () {
                return this.raw.name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Source.prototype, "origin", {
            get: function () {
                return this.raw.origin;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Source.prototype, "reference", {
            get: function () {
                return this.raw.sourceReference;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Source.prototype, "inMemory", {
            get: function () {
                return Source.isInMemory(this.uri);
            },
            enumerable: true,
            configurable: true
        });
        Source.toRawSource = function (uri, model) {
            if (model) {
                // first try to find the raw source amongst the stack frames - since that represenation has more data (source reference),
                var threads = model.getThreads();
                for (var threadId in threads) {
                    if (threads.hasOwnProperty(threadId) && threads[threadId].getCachedCallStack()) {
                        var found = threads[threadId].getCachedCallStack().filter(function (sf) { return sf.source.uri.toString() === uri.toString(); }).pop();
                        if (found) {
                            return found.source.raw;
                        }
                    }
                }
            }
            // did not find the raw source amongst the stack frames, construct the raw stack frame from the limited data you have.
            return Source.isInMemory(uri) ? { name: Source.getName(uri) } :
                { path: paths.normalize(uri.fsPath, true) };
        };
        Source.getName = function (uri) {
            var uriStr = uri.toString();
            return uriStr.substr(uriStr.lastIndexOf('/') + 1);
        };
        Source.isInMemory = function (uri) {
            return uri.toString().indexOf(Source.INTERNAL_URI_PREFIX) === 0;
        };
        Source.INTERNAL_URI_PREFIX = 'debug://internal/';
        return Source;
    }());
    exports.Source = Source;
});
//# sourceMappingURL=debugSource.js.map