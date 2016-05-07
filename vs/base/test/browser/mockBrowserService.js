define(["require", "exports", 'vs/base/test/browser/mockDom'], function (require, exports, mockDom_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function mockedIsHTMLElement(o) {
        if (typeof HTMLElement === 'object') {
            return o instanceof HTMLElement || o instanceof mockDom_1.MockElement;
        }
        return o && typeof o === 'object' && o.nodeType === 1 && typeof o.nodeName === 'string';
    }
    var MockBrowserServiceData = (function () {
        function MockBrowserServiceData() {
            this.document = new mockDom_1.MockDocument();
            this.window = new mockDom_1.MockWindow();
            this.isHTMLElement = mockedIsHTMLElement;
        }
        return MockBrowserServiceData;
    }());
    exports.MockBrowserServiceData = MockBrowserServiceData;
});
//# sourceMappingURL=mockBrowserService.js.map