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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/platform/thread/common/thread', 'vs/platform/markers/common/markers', 'vs/base/common/uri', 'vs/base/common/severity'], function (require, exports, thread_1, markers_1, uri_1, severity_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var DiagnosticCollection = (function () {
        function DiagnosticCollection(name, proxy) {
            this._isDisposed = false;
            this._data = Object.create(null);
            this._name = name;
            this._proxy = proxy;
        }
        DiagnosticCollection.prototype.dispose = function () {
            if (!this._isDisposed) {
                this._proxy.$clear(this.name);
                this._proxy = undefined;
                this._data = undefined;
                this._isDisposed = true;
            }
        };
        Object.defineProperty(DiagnosticCollection.prototype, "name", {
            get: function () {
                this._checkDisposed();
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        DiagnosticCollection.prototype.set = function (first, diagnostics) {
            if (!first) {
                // this set-call is a clear-call
                this.clear();
                return;
            }
            // the actual implementation for #set
            this._checkDisposed();
            var toSync;
            if (first instanceof uri_1.default) {
                if (!diagnostics) {
                    // remove this entry
                    this.delete(first);
                    return;
                }
                // update single row
                this._data[first.toString()] = diagnostics;
                toSync = [first];
            }
            else if (Array.isArray(first)) {
                // update many rows
                toSync = [];
                for (var _i = 0, first_1 = first; _i < first_1.length; _i++) {
                    var entry = first_1[_i];
                    var uri = entry[0], diagnostics_1 = entry[1];
                    this._data[uri.toString()] = diagnostics_1;
                    toSync.push(uri);
                }
            }
            // compute change and send to main side
            var entries = [];
            for (var _a = 0, toSync_1 = toSync; _a < toSync_1.length; _a++) {
                var uri = toSync_1[_a];
                var marker = void 0;
                var diagnostics_2 = this._data[uri.toString()];
                if (diagnostics_2) {
                    // no more than 250 diagnostics per file
                    if (diagnostics_2.length > DiagnosticCollection._maxDiagnosticsPerFile) {
                        console.warn('diagnostics for %s will be capped to %d (actually is %d)', uri.toString(), DiagnosticCollection._maxDiagnosticsPerFile, diagnostics_2.length);
                        diagnostics_2 = diagnostics_2.slice(0, DiagnosticCollection._maxDiagnosticsPerFile);
                    }
                    marker = diagnostics_2.map(DiagnosticCollection._toMarkerData);
                }
                entries.push([uri, marker]);
            }
            this._proxy.$changeMany(this.name, entries);
        };
        DiagnosticCollection.prototype.delete = function (uri) {
            this._checkDisposed();
            delete this._data[uri.toString()];
            this._proxy.$changeMany(this.name, [[uri, undefined]]);
        };
        DiagnosticCollection.prototype.clear = function () {
            this._checkDisposed();
            this._data = Object.create(null);
            this._proxy.$clear(this.name);
        };
        DiagnosticCollection.prototype.forEach = function (callback, thisArg) {
            this._checkDisposed();
            for (var key in this._data) {
                var uri = uri_1.default.parse(key);
                callback.apply(thisArg, [uri, this.get(uri), this]);
            }
        };
        DiagnosticCollection.prototype.get = function (uri) {
            this._checkDisposed();
            var result = this._data[uri.toString()];
            if (Array.isArray(result)) {
                return Object.freeze(result.slice(0));
            }
        };
        DiagnosticCollection.prototype.has = function (uri) {
            this._checkDisposed();
            return Array.isArray(this._data[uri.toString()]);
        };
        DiagnosticCollection.prototype._checkDisposed = function () {
            if (this._isDisposed) {
                throw new Error('illegal state - object is disposed');
            }
        };
        DiagnosticCollection._toMarkerData = function (diagnostic) {
            var range = diagnostic.range;
            return {
                startLineNumber: range.start.line + 1,
                startColumn: range.start.character + 1,
                endLineNumber: range.end.line + 1,
                endColumn: range.end.character + 1,
                message: diagnostic.message,
                source: diagnostic.source,
                severity: DiagnosticCollection._convertDiagnosticsSeverity(diagnostic.severity),
                code: String(diagnostic.code)
            };
        };
        DiagnosticCollection._convertDiagnosticsSeverity = function (severity) {
            switch (severity) {
                case 0: return severity_1.default.Error;
                case 1: return severity_1.default.Warning;
                case 2: return severity_1.default.Info;
                case 3: return severity_1.default.Ignore;
                default: return severity_1.default.Error;
            }
        };
        DiagnosticCollection._maxDiagnosticsPerFile = 250;
        return DiagnosticCollection;
    }());
    exports.DiagnosticCollection = DiagnosticCollection;
    var ExtHostDiagnostics = (function () {
        function ExtHostDiagnostics(threadService) {
            this._proxy = threadService.getRemotable(MainThreadDiagnostics);
            this._collections = [];
        }
        ExtHostDiagnostics.prototype.createDiagnosticCollection = function (name) {
            if (!name) {
                name = '_generated_diagnostic_collection_name_#' + ExtHostDiagnostics._idPool++;
            }
            var _a = this, _collections = _a._collections, _proxy = _a._proxy;
            var result = new (function (_super) {
                __extends(class_1, _super);
                function class_1() {
                    _super.call(this, name, _proxy);
                    _collections.push(this);
                }
                class_1.prototype.dispose = function () {
                    _super.prototype.dispose.call(this);
                    var idx = _collections.indexOf(this);
                    if (idx !== -1) {
                        _collections.splice(idx, 1);
                    }
                };
                return class_1;
            }(DiagnosticCollection));
            return result;
        };
        ExtHostDiagnostics.prototype.forEach = function (callback) {
            this._collections.forEach(callback);
        };
        ExtHostDiagnostics._idPool = 0;
        ExtHostDiagnostics = __decorate([
            thread_1.Remotable.ExtHostContext('ExtHostDiagnostics'),
            __param(0, thread_1.IThreadService)
        ], ExtHostDiagnostics);
        return ExtHostDiagnostics;
    }());
    exports.ExtHostDiagnostics = ExtHostDiagnostics;
    var MainThreadDiagnostics = (function () {
        function MainThreadDiagnostics(markerService) {
            this._markerService = markerService;
        }
        MainThreadDiagnostics.prototype.$changeMany = function (owner, entries) {
            for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                var entry = entries_1[_i];
                var uri = entry[0], markers = entry[1];
                this._markerService.changeOne(owner, uri, markers);
            }
            return undefined;
        };
        MainThreadDiagnostics.prototype.$clear = function (owner) {
            this._markerService.changeAll(owner, undefined);
            return undefined;
        };
        MainThreadDiagnostics = __decorate([
            thread_1.Remotable.MainContext('MainThreadDiagnostics'),
            __param(0, markers_1.IMarkerService)
        ], MainThreadDiagnostics);
        return MainThreadDiagnostics;
    }());
    exports.MainThreadDiagnostics = MainThreadDiagnostics;
});
//# sourceMappingURL=extHostDiagnostics.js.map