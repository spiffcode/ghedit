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
define(["require", "exports", 'vs/nls', 'vs/platform/thread/common/thread', 'vs/platform/message/common/message', 'vs/base/common/actions', 'vs/base/common/winjs.base'], function (require, exports, nls, thread_1, message_1, actions_1, winjs_base_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ExtHostMessageService = (function () {
        function ExtHostMessageService(threadService) {
            this._proxy = threadService.getRemotable(MainThreadMessageService);
        }
        ExtHostMessageService.prototype.showMessage = function (severity, message, commands) {
            var items = [];
            for (var handle = 0; handle < commands.length; handle++) {
                var command = commands[handle];
                if (typeof command === 'string') {
                    items.push({ title: command, handle: handle, isCloseAffordance: false });
                }
                else if (typeof command === 'object') {
                    var title = command.title, isCloseAffordance = command.isCloseAffordance;
                    items.push({ title: title, isCloseAffordance: isCloseAffordance, handle: handle });
                }
                else {
                    console.warn('Invalid message item:', command);
                }
            }
            return this._proxy.$showMessage(severity, message, items).then(function (handle) {
                if (typeof handle === 'number') {
                    return commands[handle];
                }
            });
        };
        ExtHostMessageService = __decorate([
            __param(0, thread_1.IThreadService)
        ], ExtHostMessageService);
        return ExtHostMessageService;
    }());
    exports.ExtHostMessageService = ExtHostMessageService;
    var MainThreadMessageService = (function () {
        function MainThreadMessageService(messageService) {
            this._messageService = messageService;
        }
        MainThreadMessageService.prototype.$showMessage = function (severity, message, commands) {
            var _this = this;
            return new winjs_base_1.TPromise(function (resolve) {
                var messageHide;
                var actions = [];
                var hasCloseAffordance = false;
                var MessageItemAction = (function (_super) {
                    __extends(MessageItemAction, _super);
                    function MessageItemAction(id, label, handle) {
                        _super.call(this, id, label, undefined, true, function () {
                            resolve(handle);
                            messageHide(); // triggers dispose! make sure promise is already resolved
                            return undefined;
                        });
                    }
                    MessageItemAction.prototype.dispose = function () {
                        resolve(undefined);
                    };
                    return MessageItemAction;
                }(actions_1.Action));
                commands.forEach(function (command) {
                    if (command.isCloseAffordance === true) {
                        hasCloseAffordance = true;
                    }
                    actions.push(new MessageItemAction('_extension_message_handle_' + command.handle, command.title, command.handle));
                });
                if (!hasCloseAffordance) {
                    actions.unshift(new MessageItemAction('__close', nls.localize('close', "Close"), undefined));
                }
                messageHide = _this._messageService.show(severity, {
                    message: message,
                    actions: actions
                });
            });
        };
        MainThreadMessageService = __decorate([
            thread_1.Remotable.MainContext('MainThreadMessageService'),
            __param(0, message_1.IMessageService)
        ], MainThreadMessageService);
        return MainThreadMessageService;
    }());
    exports.MainThreadMessageService = MainThreadMessageService;
});
//# sourceMappingURL=extHostMessageService.js.map