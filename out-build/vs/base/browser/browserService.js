define(["require", "exports", 'vs/base/browser/browser'], function (require, exports, browser_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function regularIsHTMLElement(o) {
        if (typeof HTMLElement === 'object') {
            return o instanceof HTMLElement;
        }
        return o && typeof o === 'object' && o.nodeType === 1 && typeof o.nodeName === 'string';
    }
    exports.regularIsHTMLElement = regularIsHTMLElement;
    var BrowserService = (function () {
        function BrowserService() {
            this.restore();
        }
        BrowserService.prototype.mock = function (source) {
            this.document = source.document;
            this.window = source.window;
            this.isHTMLElement = source.isHTMLElement;
        };
        BrowserService.prototype.restore = function () {
            this.isHTMLElement = regularIsHTMLElement;
            if (browser_1.isInWebWorker()) {
                this.document = null;
                this.window = null;
            }
            else {
                this.document = window.document;
                this.window = window;
            }
        };
        return BrowserService;
    }());
    var browserService = new BrowserService();
    function getService() {
        return browserService;
    }
    exports.getService = getService;
});
//# sourceMappingURL=browserService.js.map