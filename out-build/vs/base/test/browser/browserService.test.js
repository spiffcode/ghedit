define(["require", "exports", 'assert', 'vs/base/browser/browserService', 'vs/base/test/browser/mockBrowserService'], function (require, exports, assert, BrowserService, mockBrowserService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('BrowserService', function () {
        test('Mocking of Window', function () {
            try {
                var service = BrowserService.getService();
                service.mock(new mockBrowserService_1.MockBrowserServiceData());
                var w = service.window;
                w.testValue = 42;
                service.restore();
                w = service.window;
                assert.strictEqual(w.testValue, undefined);
            }
            finally {
                if (service) {
                    service.restore();
                }
            }
        });
    });
});
//# sourceMappingURL=browserService.test.js.map