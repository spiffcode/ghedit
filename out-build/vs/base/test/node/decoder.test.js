/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'vs/base/node/decoder'], function (require, exports, assert, decoder) {
    'use strict';
    suite('Decoder', function () {
        test('decoding', function () {
            var lineDecoder = new decoder.LineDecoder();
            var res = lineDecoder.write(new Buffer('hello'));
            assert.equal(res.length, 0);
            res = lineDecoder.write(new Buffer('\nworld'));
            assert.equal(res[0], 'hello');
            assert.equal(res.length, 1);
            assert.equal(lineDecoder.end(), 'world');
        });
    });
});
//# sourceMappingURL=decoder.test.js.map