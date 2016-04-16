/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls!vs/workbench/services/message/electron-browser/messageService', 'vs/workbench/services/message/browser/messageService', 'vs/base/common/platform'], function (require, exports, nls, messageService_1, platform_1) {
    'use strict';
    var MessageService = (function (_super) {
        __extends(MessageService, _super);
        function MessageService(contextService, windowService, telemetryService, keybindingService) {
            _super.call(this, telemetryService, keybindingService);
            this.contextService = contextService;
            this.windowService = windowService;
        }
        MessageService.prototype.confirm = function (confirmation) {
            if (!confirmation.primaryButton) {
                confirmation.primaryButton = nls.localize(0, null);
            }
            if (!confirmation.secondaryButton) {
                confirmation.secondaryButton = nls.localize(1, null);
            }
            var opts = {
                title: confirmation.title || this.contextService.getConfiguration().env.appName,
                message: confirmation.message,
                buttons: [
                    platform_1.isLinux ? this.mnemonicLabel(confirmation.secondaryButton) : this.mnemonicLabel(confirmation.primaryButton),
                    platform_1.isLinux ? this.mnemonicLabel(confirmation.primaryButton) : this.mnemonicLabel(confirmation.secondaryButton)
                ],
                noLink: true,
                cancelId: 1
            };
            if (platform_1.isLinux) {
                opts.defaultId = 1; // Linux: buttons are swapped
            }
            if (confirmation.detail) {
                opts.detail = confirmation.detail;
            }
            var result = this.windowService.getWindow().showMessageBox(opts);
            if (platform_1.isLinux) {
                return result === 1 ? true : false; // Linux: buttons are swapped
            }
            return result === 0 ? true : false;
        };
        MessageService.prototype.mnemonicLabel = function (label) {
            if (!platform_1.isWindows) {
                return label.replace(/&&/g, ''); // no mnemonic support on mac/linux in buttons yet
            }
            return label.replace(/&&/g, '&');
        };
        return MessageService;
    }(messageService_1.WorkbenchMessageService));
    exports.MessageService = MessageService;
});
//# sourceMappingURL=messageService.js.map