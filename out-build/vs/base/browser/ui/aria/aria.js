/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/nls', 'vs/base/common/platform', 'vs/base/browser/builder', 'vs/css!./aria'], function (require, exports, nls, platform_1, builder_1) {
    'use strict';
    var ariaContainer;
    var alertContainer;
    var statusContainer;
    function setARIAContainer(parent) {
        ariaContainer = builder_1.$('.aria-container').appendTo(parent);
        alertContainer = builder_1.$('.alert').appendTo(ariaContainer).attr({ 'role': 'alert', 'aria-atomic': 'true' });
        statusContainer = builder_1.$('.status').appendTo(ariaContainer).attr({ 'role': 'status', 'aria-atomic': 'true' });
    }
    exports.setARIAContainer = setARIAContainer;
    /**
     * Given the provided message, will make sure that it is read as alert to screen readers.
     */
    function alert(msg) {
        insertMessage(alertContainer, msg);
    }
    exports.alert = alert;
    /**
     * Given the provided message, will make sure that it is read as status to screen readers.
     */
    function status(msg) {
        if (platform_1.isMacintosh) {
            alert(msg); // VoiceOver does not seem to support status role
        }
        else {
            insertMessage(statusContainer, msg);
        }
    }
    exports.status = status;
    function insertMessage(target, msg) {
        if (!ariaContainer) {
            console.warn('ARIA support needs a container. Call setARIAContainer() first.');
            return;
        }
        if (target.getHTMLElement().textContent === msg) {
            msg = nls.localize('repeated', "{0} (occurred again)", msg);
        }
        builder_1.$(target).empty();
        builder_1.$(target).text(msg);
    }
});
//# sourceMappingURL=aria.js.map