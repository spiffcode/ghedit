/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'vs/base/common/mime', 'vs/base/node/mime'], function (require, exports, assert, mimeCommon, mime) {
    'use strict';
    suite('Mime', function () {
        test('detectMimesFromFile (JSON saved as PNG)', function (done) {
            var file = require.toUrl('./fixtures/some.json.png');
            mime.detectMimesFromFile(file, function (error, mimes) {
                assert.equal(error, null);
                assert.deepEqual(mimes.mimes, ['text/plain']);
                done();
            });
        });
        test('detectMimesFromFile (PNG saved as TXT)', function (done) {
            mimeCommon.registerTextMime({ mime: 'text/plain', extension: '.txt' });
            var file = require.toUrl('./fixtures/some.png.txt');
            mime.detectMimesFromFile(file, function (error, mimes) {
                assert.equal(error, null);
                assert.deepEqual(mimes.mimes, ['text/plain', 'application/octet-stream']);
                done();
            });
        });
        test('detectMimesFromFile (XML saved as PNG)', function (done) {
            var file = require.toUrl('./fixtures/some.xml.png');
            mime.detectMimesFromFile(file, function (error, mimes) {
                assert.equal(error, null);
                assert.deepEqual(mimes.mimes, ['text/plain']);
                done();
            });
        });
        test('detectMimesFromFile (QWOFF saved as TXT)', function (done) {
            var file = require.toUrl('./fixtures/some.qwoff.txt');
            mime.detectMimesFromFile(file, function (error, mimes) {
                assert.equal(error, null);
                assert.deepEqual(mimes.mimes, ['text/plain', 'application/octet-stream']);
                done();
            });
        });
        test('detectMimesFromFile (CSS saved as QWOFF)', function (done) {
            var file = require.toUrl('./fixtures/some.css.qwoff');
            mime.detectMimesFromFile(file, function (error, mimes) {
                assert.equal(error, null);
                assert.deepEqual(mimes.mimes, ['text/plain']);
                done();
            });
        });
        test('detectMimesFromFile (PDF)', function (done) {
            var file = require.toUrl('./fixtures/some.pdf');
            mime.detectMimesFromFile(file, function (error, mimes) {
                assert.equal(error, null);
                assert.deepEqual(mimes.mimes, ['application/octet-stream']);
                done();
            });
        });
    });
});
//# sourceMappingURL=mime.test.js.map