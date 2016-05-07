var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/platform/thread/common/thread', 'vs/workbench/services/statusbar/common/statusbarService', './extHostTypes'], function (require, exports, thread_1, statusbarService_1, extHostTypes_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ExtHostStatusBarEntry = (function () {
        function ExtHostStatusBarEntry(proxy, alignment, priority) {
            if (alignment === void 0) { alignment = extHostTypes_1.StatusBarAlignment.Left; }
            this._id = ExtHostStatusBarEntry.ID_GEN++;
            this._proxy = proxy;
            this._alignment = alignment;
            this._priority = priority;
        }
        Object.defineProperty(ExtHostStatusBarEntry.prototype, "id", {
            get: function () {
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostStatusBarEntry.prototype, "alignment", {
            get: function () {
                return this._alignment;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostStatusBarEntry.prototype, "priority", {
            get: function () {
                return this._priority;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostStatusBarEntry.prototype, "text", {
            get: function () {
                return this._text;
            },
            set: function (text) {
                this._text = text;
                this.update();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostStatusBarEntry.prototype, "tooltip", {
            get: function () {
                return this._tooltip;
            },
            set: function (tooltip) {
                this._tooltip = tooltip;
                this.update();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostStatusBarEntry.prototype, "color", {
            get: function () {
                return this._color;
            },
            set: function (color) {
                this._color = color;
                this.update();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostStatusBarEntry.prototype, "command", {
            get: function () {
                return this._command;
            },
            set: function (command) {
                this._command = command;
                this.update();
            },
            enumerable: true,
            configurable: true
        });
        ExtHostStatusBarEntry.prototype.show = function () {
            this._visible = true;
            this.update();
        };
        ExtHostStatusBarEntry.prototype.hide = function () {
            this._visible = false;
            this._proxy.dispose(this.id);
        };
        ExtHostStatusBarEntry.prototype.update = function () {
            var _this = this;
            if (this._disposed || !this._visible) {
                return;
            }
            if (this._timeoutHandle) {
                clearTimeout(this._timeoutHandle);
            }
            // Defer the update so that multiple changes to setters dont cause a redraw each
            this._timeoutHandle = setTimeout(function () {
                _this._timeoutHandle = null;
                // Set to status bar
                _this._proxy.setEntry(_this.id, _this.text, _this.tooltip, _this.command, _this.color, _this._alignment === extHostTypes_1.StatusBarAlignment.Left ? statusbarService_1.StatusbarAlignment.LEFT : statusbarService_1.StatusbarAlignment.RIGHT, _this._priority);
            }, 0);
        };
        ExtHostStatusBarEntry.prototype.dispose = function () {
            this.hide();
            this._disposed = true;
        };
        ExtHostStatusBarEntry.ID_GEN = 0;
        return ExtHostStatusBarEntry;
    }());
    exports.ExtHostStatusBarEntry = ExtHostStatusBarEntry;
    var StatusBarMessage = (function () {
        function StatusBarMessage(statusBar) {
            this._messages = [];
            this._item = statusBar.createStatusBarEntry(extHostTypes_1.StatusBarAlignment.Left, Number.MIN_VALUE);
        }
        StatusBarMessage.prototype.dispose = function () {
            this._messages.length = 0;
            this._item.dispose();
        };
        StatusBarMessage.prototype.setMessage = function (message) {
            var _this = this;
            var data = { message: message }; // use object to not confuse equal strings
            this._messages.unshift(data);
            this._update();
            return new extHostTypes_1.Disposable(function () {
                var idx = _this._messages.indexOf(data);
                if (idx >= 0) {
                    _this._messages.splice(idx, 1);
                    _this._update();
                }
            });
        };
        StatusBarMessage.prototype._update = function () {
            if (this._messages.length > 0) {
                this._item.text = this._messages[0].message;
                this._item.show();
            }
            else {
                this._item.hide();
            }
        };
        return StatusBarMessage;
    }());
    var ExtHostStatusBar = (function () {
        function ExtHostStatusBar(threadService) {
            this._proxy = threadService.getRemotable(MainThreadStatusBar);
            this._statusMessage = new StatusBarMessage(this);
        }
        ExtHostStatusBar.prototype.createStatusBarEntry = function (alignment, priority) {
            return new ExtHostStatusBarEntry(this._proxy, alignment, priority);
        };
        ExtHostStatusBar.prototype.setStatusBarMessage = function (text, timeoutOrThenable) {
            var d = this._statusMessage.setMessage(text);
            var handle;
            if (typeof timeoutOrThenable === 'number') {
                handle = setTimeout(function () { return d.dispose(); }, timeoutOrThenable);
            }
            else if (typeof timeoutOrThenable !== 'undefined') {
                timeoutOrThenable.then(function () { return d.dispose(); }, function () { return d.dispose(); });
            }
            return new extHostTypes_1.Disposable(function () {
                d.dispose();
                clearTimeout(handle);
            });
        };
        ExtHostStatusBar = __decorate([
            __param(0, thread_1.IThreadService)
        ], ExtHostStatusBar);
        return ExtHostStatusBar;
    }());
    exports.ExtHostStatusBar = ExtHostStatusBar;
    var MainThreadStatusBar = (function () {
        function MainThreadStatusBar(statusbarService) {
            this.statusbarService = statusbarService;
            this.mapIdToDisposable = Object.create(null);
        }
        MainThreadStatusBar.prototype.setEntry = function (id, text, tooltip, command, color, alignment, priority) {
            // Dispose any old
            this.dispose(id);
            // Add new
            var disposeable = this.statusbarService.addEntry({ text: text, tooltip: tooltip, command: command, color: color }, alignment, priority);
            this.mapIdToDisposable[id] = disposeable;
        };
        MainThreadStatusBar.prototype.dispose = function (id) {
            var disposeable = this.mapIdToDisposable[id];
            if (disposeable) {
                disposeable.dispose();
            }
            delete this.mapIdToDisposable[id];
        };
        MainThreadStatusBar = __decorate([
            thread_1.Remotable.MainContext('MainThreadStatusBar'),
            __param(0, statusbarService_1.IStatusbarService)
        ], MainThreadStatusBar);
        return MainThreadStatusBar;
    }());
    exports.MainThreadStatusBar = MainThreadStatusBar;
});
//# sourceMappingURL=extHostStatusBar.js.map