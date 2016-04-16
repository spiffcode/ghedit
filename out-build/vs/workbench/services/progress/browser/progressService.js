var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/types', 'vs/workbench/common/events', 'vs/platform/progress/common/progress'], function (require, exports, winjs_base_1, types, events_1, progress_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ScopedService = (function () {
        function ScopedService(eventService, scopeId) {
            this._eventService = eventService;
            this.scopeId = scopeId;
            this.registerListeners();
        }
        Object.defineProperty(ScopedService.prototype, "eventService", {
            get: function () {
                return this._eventService;
            },
            enumerable: true,
            configurable: true
        });
        ScopedService.prototype.registerListeners = function () {
            var _this = this;
            this.eventService.addListener(events_1.EventType.EDITOR_CLOSED, function (e) {
                if (e.editorId === _this.scopeId) {
                    _this.onScopeDeactivated();
                }
            });
            this.eventService.addListener(events_1.EventType.EDITOR_OPENED, function (e) {
                if (e.editorId === _this.scopeId) {
                    _this.onScopeActivated();
                }
            });
            this.eventService.addListener(events_1.EventType.COMPOSITE_CLOSED, function (e) {
                if (e.compositeId === _this.scopeId) {
                    _this.onScopeDeactivated();
                }
            });
            this.eventService.addListener(events_1.EventType.COMPOSITE_OPENED, function (e) {
                if (e.compositeId === _this.scopeId) {
                    _this.onScopeActivated();
                }
            });
        };
        return ScopedService;
    }());
    exports.ScopedService = ScopedService;
    var WorkbenchProgressService = (function (_super) {
        __extends(WorkbenchProgressService, _super);
        function WorkbenchProgressService(eventService, progressbar, scopeId, isActive) {
            _super.call(this, eventService, scopeId);
            this.serviceId = progress_1.IProgressService;
            this.progressbar = progressbar;
            this.isActive = isActive || types.isUndefinedOrNull(scopeId); // If service is unscoped, enable by default
            this.progressState = {};
        }
        WorkbenchProgressService.prototype.onScopeDeactivated = function () {
            this.isActive = false;
        };
        WorkbenchProgressService.prototype.onScopeActivated = function () {
            this.isActive = true;
            // Return early if progress state indicates that progress is done
            if (this.progressState.done) {
                return;
            }
            // Replay Infinite Progress from Promise
            if (this.progressState.whilePromise) {
                this.doShowWhile();
            }
            else if (this.progressState.infinite) {
                this.progressbar.infinite().getContainer().show();
            }
            else {
                if (this.progressState.total) {
                    this.progressbar.total(this.progressState.total).getContainer().show();
                }
                if (this.progressState.worked) {
                    this.progressbar.worked(this.progressState.worked).getContainer().show();
                }
            }
        };
        WorkbenchProgressService.prototype.clearProgressState = function () {
            delete this.progressState.infinite;
            delete this.progressState.done;
            delete this.progressState.worked;
            delete this.progressState.total;
            delete this.progressState.whilePromise;
        };
        WorkbenchProgressService.prototype.show = function (infiniteOrTotal, delay) {
            var _this = this;
            var infinite;
            var total;
            // Sort out Arguments
            if (infiniteOrTotal === false || infiniteOrTotal === true) {
                infinite = infiniteOrTotal;
            }
            else {
                total = infiniteOrTotal;
            }
            // Reset State
            this.clearProgressState();
            // Keep in State
            this.progressState.infinite = infinite;
            this.progressState.total = total;
            // Active: Show Progress
            if (this.isActive) {
                // Infinite: Start Progressbar and Show after Delay
                if (!types.isUndefinedOrNull(infinite)) {
                    if (types.isUndefinedOrNull(delay)) {
                        this.progressbar.infinite().getContainer().show();
                    }
                    else {
                        this.progressbar.infinite().getContainer().showDelayed(delay);
                    }
                }
                else if (!types.isUndefinedOrNull(total)) {
                    if (types.isUndefinedOrNull(delay)) {
                        this.progressbar.total(total).getContainer().show();
                    }
                    else {
                        this.progressbar.total(total).getContainer().showDelayed(delay);
                    }
                }
            }
            return {
                total: function (total) {
                    _this.progressState.infinite = false;
                    _this.progressState.total = total;
                    if (_this.isActive) {
                        _this.progressbar.total(total);
                    }
                },
                worked: function (worked) {
                    // Verify first that we are either not active or the progressbar has a total set
                    if (!_this.isActive || _this.progressbar.hasTotal()) {
                        _this.progressState.infinite = false;
                        if (_this.progressState.worked) {
                            _this.progressState.worked += worked;
                        }
                        else {
                            _this.progressState.worked = worked;
                        }
                        if (_this.isActive) {
                            _this.progressbar.worked(worked);
                        }
                    }
                    else {
                        _this.progressState.infinite = true;
                        delete _this.progressState.worked;
                        delete _this.progressState.total;
                        _this.progressbar.infinite().getContainer().show();
                    }
                },
                done: function () {
                    _this.progressState.infinite = false;
                    _this.progressState.done = true;
                    if (_this.isActive) {
                        _this.progressbar.stop().getContainer().hide();
                    }
                }
            };
        };
        WorkbenchProgressService.prototype.showWhile = function (promise, delay) {
            var _this = this;
            var stack = !!this.progressState.whilePromise;
            // Reset State
            if (!stack) {
                this.clearProgressState();
            }
            else {
                promise = winjs_base_1.TPromise.join([promise, this.progressState.whilePromise]);
            }
            // Keep Promise in State
            this.progressState.whilePromise = promise;
            var stop = function () {
                // If this is not the last promise in the list of joined promises, return early
                if (!!_this.progressState.whilePromise && _this.progressState.whilePromise !== promise) {
                    return;
                }
                // The while promise is either null or equal the promise we last hooked on
                _this.clearProgressState();
                if (_this.isActive) {
                    _this.progressbar.stop().getContainer().hide();
                }
            };
            this.doShowWhile(delay);
            return promise.then(stop, stop);
        };
        WorkbenchProgressService.prototype.doShowWhile = function (delay) {
            // Show Progress when active
            if (this.isActive) {
                if (types.isUndefinedOrNull(delay)) {
                    this.progressbar.infinite().getContainer().show();
                }
                else {
                    this.progressbar.infinite().getContainer().showDelayed(delay);
                }
            }
        };
        return WorkbenchProgressService;
    }(ScopedService));
    exports.WorkbenchProgressService = WorkbenchProgressService;
});
//# sourceMappingURL=progressService.js.map