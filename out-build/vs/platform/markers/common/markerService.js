var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", 'vs/base/common/arrays', 'vs/base/common/network', 'vs/base/common/strings', 'vs/base/common/collections', 'vs/base/common/uri', 'vs/base/common/event', 'vs/base/common/severity', 'vs/platform/thread/common/thread', './markers'], function (require, exports, arrays, network, strings, collections, uri_1, event_1, severity_1, thread_1, markers_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var Key;
    (function (Key) {
        function fromValue(value) {
            var regexp = /^(.*)→(.*)$/.exec(value);
            return {
                owner: regexp[1],
                resource: uri_1.default.parse(regexp[2])
            };
        }
        Key.fromValue = fromValue;
        function valueOf(k) {
            return k.owner + '→' + k.resource;
        }
        Key.valueOf = valueOf;
        var _selectorPattern = '^({0})→({1})$';
        function selector(owner, resource) {
            return new RegExp(strings.format(_selectorPattern, owner ? strings.escapeRegExpCharacters(owner) : '.*', resource ? strings.escapeRegExpCharacters(resource.toString()) : '.*'));
        }
        Key.selector = selector;
        function raw(owner, resource) {
            return owner + '→' + resource;
        }
        Key.raw = raw;
    })(Key || (Key = {}));
    var MarkerService = (function () {
        function MarkerService() {
            this.serviceId = markers_1.IMarkerService;
            this._data = Object.create(null);
            this._stats = this._emptyStats();
            this._onMarkerChanged = new event_1.Emitter();
        }
        MarkerService.prototype.getStatistics = function () {
            return this._stats;
        };
        Object.defineProperty(MarkerService.prototype, "onMarkerChanged", {
            // ---- IMarkerService ------------------------------------------
            get: function () {
                return this._onMarkerChanged ? this._onMarkerChanged.event : null;
            },
            enumerable: true,
            configurable: true
        });
        MarkerService.prototype.changeOne = function (owner, resource, markers) {
            if (this._doChangeOne(owner, resource, markers)) {
                this._onMarkerChanged.fire([resource]);
            }
        };
        MarkerService.prototype.remove = function (owner, resources) {
            if (arrays.isFalsyOrEmpty(resources)) {
                return;
            }
            var changedResources;
            for (var _i = 0, resources_1 = resources; _i < resources_1.length; _i++) {
                var resource = resources_1[_i];
                if (this._doChangeOne(owner, resource, undefined)) {
                    if (!changedResources) {
                        changedResources = [];
                    }
                    changedResources.push(resource);
                }
            }
            if (changedResources) {
                this._onMarkerChanged.fire(changedResources);
            }
        };
        MarkerService.prototype._doChangeOne = function (owner, resource, markers) {
            var key = Key.raw(owner, resource), oldMarkers = this._data[key], hasOldMarkers = !arrays.isFalsyOrEmpty(oldMarkers), getsNewMarkers = !arrays.isFalsyOrEmpty(markers), oldStats = this._computeStats(oldMarkers), newStats = this._computeStats(markers);
            if (!hasOldMarkers && !getsNewMarkers) {
                return;
            }
            if (getsNewMarkers) {
                this._data[key] = markers;
            }
            else if (hasOldMarkers) {
                delete this._data[key];
            }
            if (this._isStatRelevant(resource)) {
                this._updateStatsMinus(oldStats);
                this._updateStatsPlus(newStats);
            }
            return true;
        };
        MarkerService.prototype.changeAll = function (owner, data) {
            var _this = this;
            var changedResources = Object.create(null);
            // remove and record old markers
            var oldStats = this._emptyStats();
            this._forEach(owner, undefined, undefined, -1, function (e, r) {
                var resource = Key.fromValue(e.key).resource;
                if (_this._isStatRelevant(resource)) {
                    _this._updateStatsPlus(oldStats, _this._computeStats(e.value));
                }
                changedResources[resource.toString()] = resource;
                r();
            });
            this._updateStatsMinus(oldStats);
            // add and record new markers
            if (!arrays.isFalsyOrEmpty(data)) {
                var newStats_1 = this._emptyStats();
                data.forEach(function (d) {
                    changedResources[d.resource.toString()] = d.resource;
                    collections.lookupOrInsert(_this._data, Key.raw(owner, d.resource), []).push(d.marker);
                    if (_this._isStatRelevant(d.resource)) {
                        _this._updateStatsMarker(newStats_1, d.marker);
                    }
                });
                this._updateStatsPlus(newStats_1);
            }
            this._onMarkerChanged.fire(collections.values(changedResources));
        };
        MarkerService.prototype.read = function (filter) {
            var _this = this;
            if (filter === void 0) { filter = Object.create(null); }
            var ret = [];
            this._forEach(filter.owner, filter.resource, filter.selector, filter.take, function (entry) { return _this._fromEntry(entry, ret); });
            return ret;
        };
        MarkerService.prototype._isStatRelevant = function (resource) {
            //TODO@Dirk this is a hack
            return resource.scheme !== network.Schemas.inMemory;
        };
        MarkerService.prototype._forEach = function (owner, resource, regexp, take, callback) {
            //TODO@Joh: be smart and use an index
            var selector = regexp || Key.selector(owner, resource), took = 0;
            collections.forEach(this._data, function (entry, remove) {
                if (selector.test(entry.key)) {
                    callback(entry, remove);
                    if (take > 0 && took++ >= take) {
                        return false;
                    }
                }
            });
        };
        MarkerService.prototype._fromEntry = function (entry, bucket) {
            var key = Key.fromValue(entry.key);
            entry.value.forEach(function (data) {
                // before reading, we sanitize the data
                MarkerService._sanitize(data);
                bucket.push({
                    owner: key.owner,
                    resource: key.resource,
                    code: data.code,
                    message: data.message,
                    source: data.source,
                    severity: data.severity,
                    startLineNumber: data.startLineNumber,
                    startColumn: data.startColumn,
                    endLineNumber: data.endLineNumber,
                    endColumn: data.endColumn
                });
            });
        };
        MarkerService.prototype._computeStats = function (markers) {
            var errors = 0, warnings = 0, infos = 0, unknwons = 0;
            if (markers) {
                for (var i = 0; i < markers.length; i++) {
                    var marker = markers[i];
                    if (marker.severity) {
                        switch (marker.severity) {
                            case severity_1.default.Error:
                                errors++;
                                break;
                            case severity_1.default.Warning:
                                warnings++;
                                break;
                            case severity_1.default.Info:
                                infos++;
                                break;
                            default:
                                unknwons++;
                                break;
                        }
                    }
                    else {
                        unknwons++;
                    }
                }
            }
            return {
                errors: errors,
                warnings: warnings,
                infos: infos,
                unknwons: unknwons
            };
        };
        MarkerService.prototype._emptyStats = function () {
            return { errors: 0, warnings: 0, infos: 0, unknwons: 0 };
        };
        MarkerService.prototype._updateStatsPlus = function (toUpdate, toAdd) {
            if (!toAdd) {
                toAdd = toUpdate;
                toUpdate = this._stats;
            }
            toUpdate.errors += toAdd.errors;
            toUpdate.warnings += toAdd.warnings;
            toUpdate.infos += toAdd.infos;
            toUpdate.unknwons += toAdd.unknwons;
        };
        MarkerService.prototype._updateStatsMinus = function (toUpdate, toSubtract) {
            if (!toSubtract) {
                toSubtract = toUpdate;
                toUpdate = this._stats;
            }
            toUpdate.errors -= toSubtract.errors;
            toUpdate.warnings -= toSubtract.warnings;
            toUpdate.infos -= toSubtract.infos;
            toUpdate.unknwons -= toSubtract.unknwons;
        };
        MarkerService.prototype._updateStatsMarker = function (toUpdate, marker) {
            switch (marker.severity) {
                case severity_1.default.Error:
                    toUpdate.errors++;
                    break;
                case severity_1.default.Warning:
                    toUpdate.warnings++;
                    break;
                case severity_1.default.Info:
                    toUpdate.infos++;
                    break;
                default:
                    toUpdate.unknwons++;
                    break;
            }
        };
        MarkerService._sanitize = function (data) {
            data.code = data.code || null;
            data.startLineNumber = data.startLineNumber > 0 ? data.startLineNumber : 1;
            data.startColumn = data.startColumn > 0 ? data.startColumn : 1;
            data.endLineNumber = data.endLineNumber >= data.startLineNumber ? data.endLineNumber : data.startLineNumber;
            data.endColumn = data.endColumn > 0 ? data.endColumn : data.startColumn;
        };
        return MarkerService;
    }());
    exports.MarkerService = MarkerService;
    var SecondaryMarkerService = (function (_super) {
        __extends(SecondaryMarkerService, _super);
        function SecondaryMarkerService(threadService) {
            _super.call(this);
            this._proxy = threadService.getRemotable(MainProcessMarkerService);
        }
        SecondaryMarkerService.prototype.changeOne = function (owner, resource, markers) {
            this._proxy.changeOne(owner, resource, markers);
        };
        SecondaryMarkerService.prototype.changeAll = function (owner, data) {
            this._proxy.changeAll(owner, data);
        };
        return SecondaryMarkerService;
    }(MarkerService));
    exports.SecondaryMarkerService = SecondaryMarkerService;
    var MainProcessMarkerService = (function (_super) {
        __extends(MainProcessMarkerService, _super);
        function MainProcessMarkerService(threadService) {
            _super.call(this);
            threadService.registerRemotableInstance(MainProcessMarkerService, this);
        }
        MainProcessMarkerService.prototype.changeOne = function (owner, resource, markers) {
            _super.prototype.changeOne.call(this, owner, resource, markers);
        };
        MainProcessMarkerService.prototype.changeAll = function (owner, data) {
            _super.prototype.changeAll.call(this, owner, data);
        };
        MainProcessMarkerService = __decorate([
            thread_1.Remotable.MainContext('MainProcessMarkerService')
        ], MainProcessMarkerService);
        return MainProcessMarkerService;
    }(MarkerService));
    exports.MainProcessMarkerService = MainProcessMarkerService;
});
