/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/workbench/parts/extensions/common/extensions', 'vs/base/common/types', 'vs/base/common/objects', 'vs/platform/request/common/request', 'vs/workbench/services/workspace/common/contextService', 'vs/platform/telemetry/common/telemetry'], function (require, exports, winjs_base_1, extensions_1, types_1, objects_1, request_1, contextService_1, telemetry_1) {
    "use strict";
    var Flags;
    (function (Flags) {
        Flags[Flags["None"] = 0] = "None";
        Flags[Flags["IncludeVersions"] = 1] = "IncludeVersions";
        Flags[Flags["IncludeFiles"] = 2] = "IncludeFiles";
        Flags[Flags["IncludeCategoryAndTags"] = 4] = "IncludeCategoryAndTags";
        Flags[Flags["IncludeSharedAccounts"] = 8] = "IncludeSharedAccounts";
        Flags[Flags["IncludeVersionProperties"] = 16] = "IncludeVersionProperties";
        Flags[Flags["ExcludeNonValidated"] = 32] = "ExcludeNonValidated";
        Flags[Flags["IncludeInstallationTargets"] = 64] = "IncludeInstallationTargets";
        Flags[Flags["IncludeAssetUri"] = 128] = "IncludeAssetUri";
        Flags[Flags["IncludeStatistics"] = 256] = "IncludeStatistics";
        Flags[Flags["IncludeLatestVersionOnly"] = 512] = "IncludeLatestVersionOnly";
    })(Flags || (Flags = {}));
    var FilterType;
    (function (FilterType) {
        FilterType[FilterType["Tag"] = 1] = "Tag";
        FilterType[FilterType["ExtensionId"] = 4] = "ExtensionId";
        FilterType[FilterType["Category"] = 5] = "Category";
        FilterType[FilterType["ExtensionName"] = 7] = "ExtensionName";
        FilterType[FilterType["Target"] = 8] = "Target";
        FilterType[FilterType["Featured"] = 9] = "Featured";
        FilterType[FilterType["SearchText"] = 10] = "SearchText";
    })(FilterType || (FilterType = {}));
    var SortBy;
    (function (SortBy) {
        SortBy[SortBy["NoneOrRelevance"] = 0] = "NoneOrRelevance";
        SortBy[SortBy["LastUpdatedDate"] = 1] = "LastUpdatedDate";
        SortBy[SortBy["Title"] = 2] = "Title";
        SortBy[SortBy["PublisherName"] = 3] = "PublisherName";
        SortBy[SortBy["InstallCount"] = 4] = "InstallCount";
        SortBy[SortBy["PublishedDate"] = 5] = "PublishedDate";
        SortBy[SortBy["AverageRating"] = 6] = "AverageRating";
    })(SortBy || (SortBy = {}));
    var SortOrder;
    (function (SortOrder) {
        SortOrder[SortOrder["Default"] = 0] = "Default";
        SortOrder[SortOrder["Ascending"] = 1] = "Ascending";
        SortOrder[SortOrder["Descending"] = 2] = "Descending";
    })(SortOrder || (SortOrder = {}));
    var DefaultPageSize = 10;
    var DefaultQueryState = {
        pageNumber: 1,
        pageSize: DefaultPageSize,
        sortBy: SortBy.NoneOrRelevance,
        sortOrder: SortOrder.Default,
        flags: Flags.None,
        criteria: []
    };
    var Query = (function () {
        function Query(state) {
            if (state === void 0) { state = DefaultQueryState; }
            this.state = state;
        }
        Object.defineProperty(Query.prototype, "pageNumber", {
            get: function () { return this.state.pageNumber; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Query.prototype, "pageSize", {
            get: function () { return this.state.pageSize; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Query.prototype, "sortBy", {
            get: function () { return this.state.sortBy; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Query.prototype, "sortOrder", {
            get: function () { return this.state.sortOrder; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Query.prototype, "flags", {
            get: function () { return this.state.flags; },
            enumerable: true,
            configurable: true
        });
        Query.prototype.withPage = function (pageNumber, pageSize) {
            if (pageSize === void 0) { pageSize = this.state.pageSize; }
            return new Query(objects_1.assign({}, this.state, { pageNumber: pageNumber, pageSize: pageSize }));
        };
        Query.prototype.withFilter = function (filterType, value) {
            var criterium = { filterType: filterType };
            if (!types_1.isUndefined(value)) {
                criterium.value = value;
            }
            var criteria = this.state.criteria.slice();
            criteria.push(criterium);
            return new Query(objects_1.assign({}, this.state, { criteria: criteria }));
        };
        Query.prototype.withSort = function (sortBy, sortOrder) {
            if (sortOrder === void 0) { sortOrder = SortOrder.Default; }
            return new Query(objects_1.assign({}, this.state, { sortBy: sortBy, sortOrder: sortOrder }));
        };
        Query.prototype.withFlags = function () {
            var flags = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                flags[_i - 0] = arguments[_i];
            }
            return new Query(objects_1.assign({}, this.state, { flags: flags.reduce(function (r, f) { return r | f; }, 0) }));
        };
        Object.defineProperty(Query.prototype, "raw", {
            get: function () {
                return {
                    filters: [{
                            criteria: this.state.criteria,
                            pageNumber: this.state.pageNumber,
                            pageSize: this.state.pageSize,
                            sortBy: this.state.sortBy,
                            sortOrder: this.state.sortOrder
                        }],
                    flags: this.state.flags
                };
            },
            enumerable: true,
            configurable: true
        });
        return Query;
    }());
    function getInstallCount(statistics) {
        if (!statistics) {
            return 0;
        }
        var result = statistics.filter(function (s) { return s.statisticName === 'install'; })[0];
        return result ? result.value : 0;
    }
    function toExtension(galleryExtension, extensionsGalleryUrl, downloadHeaders) {
        var versions = galleryExtension.versions.map(function (v) { return ({
            version: v.version,
            date: v.lastUpdated,
            downloadHeaders: downloadHeaders,
            downloadUrl: v.assetUri + "/Microsoft.VisualStudio.Services.VSIXPackage?install=true",
            manifestUrl: v.assetUri + "/Microsoft.VisualStudio.Code.Manifest"
        }); });
        return {
            name: galleryExtension.extensionName,
            displayName: galleryExtension.displayName || galleryExtension.extensionName,
            publisher: galleryExtension.publisher.publisherName,
            version: versions[0].version,
            engines: { vscode: void 0 },
            description: galleryExtension.shortDescription || '',
            galleryInformation: {
                galleryApiUrl: extensionsGalleryUrl,
                id: galleryExtension.extensionId,
                publisherId: galleryExtension.publisher.publisherId,
                publisherDisplayName: galleryExtension.publisher.displayName,
                installCount: getInstallCount(galleryExtension.statistics),
                versions: versions
            }
        };
    }
    var GalleryService = (function () {
        function GalleryService(requestService, contextService, telemetryService) {
            this.requestService = requestService;
            this.serviceId = extensions_1.IGalleryService;
            var config = contextService.getConfiguration().env.extensionsGallery;
            this.extensionsGalleryUrl = config && config.serviceUrl;
            this.machineId = telemetryService.getTelemetryInfo().then(function (_a) {
                var machineId = _a.machineId;
                return machineId;
            });
        }
        GalleryService.prototype.api = function (path) {
            if (path === void 0) { path = ''; }
            return "" + this.extensionsGalleryUrl + path;
        };
        GalleryService.prototype.isEnabled = function () {
            return !!this.extensionsGalleryUrl;
        };
        GalleryService.prototype.query = function (options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            if (!this.isEnabled()) {
                return winjs_base_1.TPromise.wrapError(new Error('No extension gallery service configured.'));
            }
            var text = objects_1.getOrDefault(options, function (o) { return o.text; }, '');
            var pageSize = objects_1.getOrDefault(options, function (o) { return o.pageSize; }, 30);
            var query = new Query()
                .withFlags(Flags.IncludeVersions, Flags.IncludeCategoryAndTags, Flags.IncludeAssetUri, Flags.IncludeStatistics)
                .withPage(1, pageSize)
                .withFilter(FilterType.Target, 'Microsoft.VisualStudio.Code')
                .withSort(SortBy.InstallCount);
            if (text) {
                query = query.withFilter(FilterType.SearchText, text);
            }
            else if (options.ids) {
                options.ids.forEach(function (id) {
                    query = query.withFilter(FilterType.ExtensionName, id);
                });
            }
            return this.queryGallery(query).then(function (_a) {
                var galleryExtensions = _a.galleryExtensions, total = _a.total;
                return _this.getRequestHeaders().then(function (downloadHeaders) {
                    var extensions = galleryExtensions.map(function (e) { return toExtension(e, _this.extensionsGalleryUrl, downloadHeaders); });
                    var pageSize = query.pageSize;
                    var getPage = function (pageIndex) { return _this.queryGallery(query.withPage(pageIndex + 1))
                        .then(function (_a) {
                        var galleryExtensions = _a.galleryExtensions;
                        return galleryExtensions.map(function (e) { return toExtension(e, _this.extensionsGalleryUrl, downloadHeaders); });
                    }); };
                    return { firstPage: extensions, total: total, pageSize: pageSize, getPage: getPage };
                });
            });
        };
        GalleryService.prototype.queryGallery = function (query) {
            var _this = this;
            var data = JSON.stringify(query.raw);
            return this.getRequestHeaders()
                .then(function (headers) {
                headers = objects_1.assign(headers, {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json;api-version=3.0-preview.1',
                    'Content-Length': data.length
                });
                var request = {
                    type: 'POST',
                    url: _this.api('/extensionquery'),
                    data: data,
                    headers: headers
                };
                return _this.requestService.makeRequest(request);
            })
                .then(function (r) { return JSON.parse(r.responseText).results[0]; })
                .then(function (r) {
                var galleryExtensions = r.extensions;
                var resultCount = r.resultMetadata && r.resultMetadata.filter(function (m) { return m.metadataType === 'ResultCount'; })[0];
                var total = resultCount && resultCount.metadataItems.filter(function (i) { return i.name === 'TotalCount'; })[0].count || 0;
                return { galleryExtensions: galleryExtensions, total: total };
            });
        };
        GalleryService.prototype.getRequestHeaders = function () {
            return this.machineId.then(function (machineId) {
                var result = {
                    'X-Market-Client-Id': 'VSCode',
                    'User-Agent': 'VSCode'
                };
                if (machineId) {
                    result['X-Market-User-Id'] = machineId;
                }
                return result;
            });
        };
        GalleryService = __decorate([
            __param(0, request_1.IRequestService),
            __param(1, contextService_1.IWorkspaceContextService),
            __param(2, telemetry_1.ITelemetryService)
        ], GalleryService);
        return GalleryService;
    }());
    exports.GalleryService = GalleryService;
});
//# sourceMappingURL=vsoGalleryService.js.map