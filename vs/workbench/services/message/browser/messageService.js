define(["require", "exports", 'vs/base/common/errors', 'vs/base/common/types', 'vs/base/browser/ui/messagelist/messageList', 'vs/workbench/common/constants', 'vs/workbench/browser/parts/statusbar/statusbar', 'vs/platform/message/common/message'], function (require, exports, errors, types, messageList_1, constants_1, statusbar_1, message_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var WorkbenchMessageService = (function () {
        function WorkbenchMessageService(telemetryService) {
            this.telemetryService = telemetryService;
            this.serviceId = message_1.IMessageService;
            this.handler = new messageList_1.MessageList(constants_1.Identifiers.WORKBENCH_CONTAINER, telemetryService);
            this.messageBuffer = [];
            this.canShowMessages = true;
            this.disposeables = [];
        }
        WorkbenchMessageService.prototype.setWorkbenchServices = function (statusbarService) {
            this.statusbarService = statusbarService;
        };
        Object.defineProperty(WorkbenchMessageService.prototype, "onMessagesShowing", {
            get: function () {
                return this.handler.onMessagesShowing;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkbenchMessageService.prototype, "onMessagesCleared", {
            get: function () {
                return this.handler.onMessagesCleared;
            },
            enumerable: true,
            configurable: true
        });
        WorkbenchMessageService.prototype.suspend = function () {
            this.canShowMessages = false;
            this.handler.hide();
        };
        WorkbenchMessageService.prototype.resume = function () {
            this.canShowMessages = true;
            this.handler.show();
            // Release messages from buffer
            while (this.messageBuffer.length) {
                var bufferedMessage = this.messageBuffer.pop();
                bufferedMessage.disposeFn = this.show(bufferedMessage.severity, bufferedMessage.message);
            }
        };
        WorkbenchMessageService.prototype.toBaseSeverity = function (severity) {
            switch (severity) {
                case message_1.Severity.Info:
                    return messageList_1.Severity.Info;
                case message_1.Severity.Warning:
                    return messageList_1.Severity.Warning;
            }
            return messageList_1.Severity.Error;
        };
        WorkbenchMessageService.prototype.show = function (sev, message) {
            var _this = this;
            if (!message) {
                return function () { return void 0; }; // guard against undefined messages
            }
            if (Array.isArray(message)) {
                var closeFns_1 = [];
                message.forEach(function (msg) { return closeFns_1.push(_this.show(sev, msg)); });
                return function () { return closeFns_1.forEach(function (fn) { return fn(); }); };
            }
            if (errors.isPromiseCanceledError(message)) {
                return function () { return void 0; }; // this kind of error should not be shown
            }
            if (types.isNumber(message.severity)) {
                sev = message.severity;
            }
            return this.doShow(sev, message);
        };
        WorkbenchMessageService.prototype.doShow = function (sev, message) {
            var _this = this;
            // Check flag if we can show a message now
            if (!this.canShowMessages) {
                var messageObj_1 = { severity: sev, message: message, disposeFn: function () { return _this.messageBuffer.splice(_this.messageBuffer.indexOf(messageObj_1), 1); } };
                this.messageBuffer.push(messageObj_1);
                // Return function that allows to remove message from buffer
                return function () { return messageObj_1.disposeFn(); };
            }
            // Show in Console
            if (sev === message_1.Severity.Error) {
                console.error(errors.toErrorMessage(message, true));
            }
            // Show in Global Handler
            return this.handler.showMessage(this.toBaseSeverity(sev), message);
        };
        WorkbenchMessageService.prototype.setStatusMessage = function (message, autoDisposeAfter, delayBy) {
            var _this = this;
            if (autoDisposeAfter === void 0) { autoDisposeAfter = -1; }
            if (delayBy === void 0) { delayBy = 0; }
            if (this.statusbarService) {
                if (this.statusMsgDispose) {
                    this.statusMsgDispose.dispose(); // dismiss any previous
                }
                // Create new
                var statusDispose_1;
                var showHandle_1 = setTimeout(function () {
                    statusDispose_1 = _this.statusbarService.addEntry({ text: message }, statusbar_1.StatusbarAlignment.LEFT, Number.MIN_VALUE);
                    showHandle_1 = null;
                }, delayBy);
                var hideHandle_1;
                // Dispose function takes care of timeouts and actual entry
                var dispose_1 = {
                    dispose: function () {
                        if (showHandle_1) {
                            clearTimeout(showHandle_1);
                        }
                        if (hideHandle_1) {
                            clearTimeout(hideHandle_1);
                        }
                        if (statusDispose_1) {
                            statusDispose_1.dispose();
                        }
                    }
                };
                this.statusMsgDispose = dispose_1;
                if (typeof autoDisposeAfter === 'number' && autoDisposeAfter > 0) {
                    hideHandle_1 = setTimeout(function () { return dispose_1.dispose(); }, autoDisposeAfter);
                }
                return dispose_1;
            }
            return { dispose: function () { } };
        };
        WorkbenchMessageService.prototype.hideAll = function () {
            if (this.handler) {
                this.handler.hideMessages();
            }
        };
        WorkbenchMessageService.prototype.confirm = function (confirmation) {
            var messageText = confirmation.message;
            if (confirmation.detail) {
                messageText = messageText + '\n\n' + confirmation.detail;
            }
            return window.confirm(messageText);
        };
        WorkbenchMessageService.prototype.dispose = function () {
            while (this.disposeables.length) {
                this.disposeables.pop().dispose();
            }
        };
        return WorkbenchMessageService;
    }());
    exports.WorkbenchMessageService = WorkbenchMessageService;
});
//# sourceMappingURL=messageService.js.map