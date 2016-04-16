define(["require", "exports", 'assert', 'vs/editor/test/common/servicesTestUtils', 'vs/languages/html/common/html.contribution'], function (require, exports, assert, servicesTestUtils_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('Editor Modes - Modes Registry', function () {
        test('Bug 12104: [f12] createModel not successfully handling mime type list?', function () {
            var modeService = servicesTestUtils_1.createMockModeService();
            assert.equal(modeService.getModeId('text/html,text/plain'), 'html');
        });
    });
});
//# sourceMappingURL=modesRegistry.test.js.map