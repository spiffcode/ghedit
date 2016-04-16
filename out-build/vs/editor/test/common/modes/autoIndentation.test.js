define(["require", "exports", 'assert', 'vs/editor/common/modes/supports/electricCharacter', 'vs/editor/test/common/modesTestUtils'], function (require, exports, assert, electricCharacter_1, modesTestUtils_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('Editor Modes - Auto Indentation', function () {
        test('Doc comments', function () {
            var brackets = new electricCharacter_1.Brackets('test', null, { scope: 'doc', open: '/**', lineStart: ' * ', close: ' */' });
            assert.equal(brackets.onElectricCharacter(modesTestUtils_1.createLineContextFromTokenText([
                { text: '/**', type: 'doc' },
            ]), 2).appendText, ' */');
            assert.equal(brackets.onElectricCharacter(modesTestUtils_1.createLineContextFromTokenText([
                { text: '/**', type: 'doc' },
                { text: ' ', type: 'doc' },
                { text: '*/', type: 'doc' },
            ]), 2), null);
        });
    });
});
//# sourceMappingURL=autoIndentation.test.js.map