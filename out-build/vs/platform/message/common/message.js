define(["require", "exports", 'vs/nls', 'vs/base/common/winjs.base', 'vs/base/common/severity', 'vs/platform/instantiation/common/instantiation', 'vs/base/common/actions'], function (require, exports, nls, winjs_base_1, severity_1, instantiation_1, actions_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    exports.CloseAction = new actions_1.Action('close.message', nls.localize('close', "Close"), null, true, function () { return winjs_base_1.TPromise.as(true); });
    exports.CancelAction = new actions_1.Action('close.message', nls.localize('cancel', "Cancel"), null, true, function () { return winjs_base_1.TPromise.as(true); });
    exports.IMessageService = instantiation_1.createDecorator('messageService');
    exports.Severity = severity_1.default;
});
