var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/platform/thread/common/thread', 'vs/workbench/services/quickopen/common/quickOpenService'], function (require, exports, winjs_base_1, thread_1, quickOpenService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ExtHostQuickOpen = (function () {
        function ExtHostQuickOpen(threadService) {
            this._proxy = threadService.getRemotable(MainThreadQuickOpen);
        }
        ExtHostQuickOpen.prototype.show = function (itemsOrItemsPromise, options) {
            var _this = this;
            // clear state from last invocation
            this._onDidSelectItem = undefined;
            var itemsPromise;
            if (!Array.isArray(itemsOrItemsPromise)) {
                itemsPromise = itemsOrItemsPromise;
            }
            else {
                itemsPromise = winjs_base_1.TPromise.as(itemsOrItemsPromise);
            }
            var quickPickWidget = this._proxy.$show({
                autoFocus: { autoFocusFirstEntry: true },
                placeHolder: options && options.placeHolder,
                matchOnDescription: options && options.matchOnDescription,
                matchOnDetail: options && options.matchOnDetail
            });
            return itemsPromise.then(function (items) {
                var pickItems = [];
                for (var handle = 0; handle < items.length; handle++) {
                    var item = items[handle];
                    var label = void 0;
                    var description = void 0;
                    var detail = void 0;
                    if (typeof item === 'string') {
                        label = item;
                    }
                    else {
                        label = item.label;
                        description = item.description;
                        detail = item.detail;
                    }
                    pickItems.push({
                        label: label,
                        description: description,
                        handle: handle,
                        detail: detail
                    });
                }
                // handle selection changes
                if (options && typeof options.onDidSelectItem === 'function') {
                    _this._onDidSelectItem = function (handle) {
                        options.onDidSelectItem(items[handle]);
                    };
                }
                // show items
                _this._proxy.$setItems(pickItems);
                return quickPickWidget.then(function (handle) {
                    if (typeof handle === 'number') {
                        return items[handle];
                    }
                });
            }, function (err) {
                _this._proxy.$setError(err);
                return winjs_base_1.TPromise.wrapError(err);
            });
        };
        ExtHostQuickOpen.prototype.$onItemSelected = function (handle) {
            if (this._onDidSelectItem) {
                this._onDidSelectItem(handle);
            }
        };
        // ---- input
        ExtHostQuickOpen.prototype.input = function (options) {
            this._validateInput = options.validateInput;
            return this._proxy.$input(options, typeof options.validateInput === 'function');
        };
        ExtHostQuickOpen.prototype.$validateInput = function (input) {
            if (this._validateInput) {
                return winjs_base_1.TPromise.as(this._validateInput(input));
            }
        };
        ExtHostQuickOpen = __decorate([
            thread_1.Remotable.ExtHostContext('ExtHostQuickOpen'),
            __param(0, thread_1.IThreadService)
        ], ExtHostQuickOpen);
        return ExtHostQuickOpen;
    }());
    exports.ExtHostQuickOpen = ExtHostQuickOpen;
    var MainThreadQuickOpen = (function () {
        function MainThreadQuickOpen(threadService, quickOpenService) {
            this._token = 0;
            this._proxy = threadService.getRemotable(ExtHostQuickOpen);
            this._quickOpenService = quickOpenService;
        }
        MainThreadQuickOpen.prototype.$show = function (options) {
            var _this = this;
            var myToken = ++this._token;
            this._contents = new winjs_base_1.TPromise(function (c, e) {
                _this._doSetItems = function (items) {
                    if (myToken === _this._token) {
                        c(items);
                    }
                };
                _this._doSetError = function (error) {
                    if (myToken === _this._token) {
                        e(error);
                    }
                };
            });
            return this._quickOpenService.pick(this._contents, options).then(function (item) {
                if (item) {
                    return item.handle;
                }
            }, undefined, function (progress) {
                if (progress) {
                    _this._proxy.$onItemSelected(progress.handle);
                }
            });
        };
        MainThreadQuickOpen.prototype.$setItems = function (items) {
            if (this._doSetItems) {
                this._doSetItems(items);
                return;
            }
        };
        MainThreadQuickOpen.prototype.$setError = function (error) {
            if (this._doSetError) {
                this._doSetError(error);
                return;
            }
        };
        // ---- input
        MainThreadQuickOpen.prototype.$input = function (options, validateInput) {
            var _this = this;
            var inputOptions = Object.create(null);
            if (options) {
                inputOptions.password = options.password;
                inputOptions.placeHolder = options.placeHolder;
                inputOptions.prompt = options.prompt;
                inputOptions.value = options.value;
            }
            if (validateInput) {
                inputOptions.validateInput = function (value) {
                    return _this._proxy.$validateInput(value);
                };
            }
            return this._quickOpenService.input(inputOptions);
        };
        MainThreadQuickOpen = __decorate([
            thread_1.Remotable.MainContext('MainThreadQuickOpen'),
            __param(0, thread_1.IThreadService),
            __param(1, quickOpenService_1.IQuickOpenService)
        ], MainThreadQuickOpen);
        return MainThreadQuickOpen;
    }());
    exports.MainThreadQuickOpen = MainThreadQuickOpen;
});
//# sourceMappingURL=extHostQuickOpen.js.map