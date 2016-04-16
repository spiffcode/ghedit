/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'fs', 'graceful-fs', 'vs/base/common/winjs.base', 'vs/platform/files/common/files', 'vs/workbench/services/search/node/fileSearch', 'vs/workbench/services/search/node/textSearch'], function (require, exports, fs, gracefulFs, winjs_base_1, files_1, fileSearch_1, textSearch_1) {
    'use strict';
    gracefulFs.gracefulify(fs);
    var SearchService = (function () {
        function SearchService() {
        }
        SearchService.prototype.fileSearch = function (config) {
            var engine = new fileSearch_1.Engine(config);
            return this.doSearch(engine);
        };
        SearchService.prototype.textSearch = function (config) {
            var engine = new textSearch_1.Engine(config, new fileSearch_1.FileWalker({
                rootFolders: config.rootFolders,
                extraFiles: config.extraFiles,
                includePattern: config.includePattern,
                excludePattern: config.excludePattern,
                filePattern: config.filePattern,
                maxFilesize: files_1.MAX_FILE_SIZE
            }));
            return this.doSearch(engine);
        };
        SearchService.prototype.doSearch = function (engine) {
            return new winjs_base_1.PPromise(function (c, e, p) {
                engine.search(function (match) {
                    if (match) {
                        p(match);
                    }
                }, function (progress) {
                    p(progress);
                }, function (error, isLimitHit) {
                    if (error) {
                        e(error);
                    }
                    else {
                        c({
                            limitHit: isLimitHit
                        });
                    }
                });
            }, function () { return engine.cancel(); });
        };
        return SearchService;
    }());
    exports.SearchService = SearchService;
});
//# sourceMappingURL=rawSearchService.js.map