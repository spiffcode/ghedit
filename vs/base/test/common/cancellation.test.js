define(["require", "exports", 'assert', 'vs/base/common/cancellation'], function (require, exports, assert, cancellation_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('CancellationToken', function () {
        test('None', function () {
            assert.equal(cancellation_1.CancellationToken.None.isCancellationRequested, false);
            assert.equal(typeof cancellation_1.CancellationToken.None.onCancellationRequested, 'function');
        });
        test('defaults cannot be messed with', function () {
            assert.throws(function () {
                cancellation_1.CancellationToken.Cancelled.isCancellationRequested = false;
            });
            assert.throws(function () {
                cancellation_1.CancellationToken.Cancelled.onCancellationRequested = null;
            });
            assert.throws(function () {
                cancellation_1.CancellationToken.None.isCancellationRequested = false;
            });
            assert.throws(function () {
                cancellation_1.CancellationToken.None.onCancellationRequested = null;
            });
        });
        test('cancel before token', function (done) {
            var source = new cancellation_1.CancellationTokenSource();
            assert.equal(source.token.isCancellationRequested, false);
            source.cancel();
            assert.equal(source.token.isCancellationRequested, true);
            source.token.onCancellationRequested(function () {
                assert.ok(true);
                done();
            });
        });
        test('cancel happens only once', function () {
            var source = new cancellation_1.CancellationTokenSource();
            assert.equal(source.token.isCancellationRequested, false);
            var cancelCount = 0;
            function onCancel() {
                cancelCount += 1;
            }
            source.token.onCancellationRequested(onCancel);
            source.cancel();
            source.cancel();
            assert.equal(cancelCount, 1);
        });
        test('cancel calls all listeners', function () {
            var count = 0;
            var source = new cancellation_1.CancellationTokenSource();
            source.token.onCancellationRequested(function () {
                count += 1;
            });
            source.token.onCancellationRequested(function () {
                count += 1;
            });
            source.token.onCancellationRequested(function () {
                count += 1;
            });
            source.cancel();
            assert.equal(count, 3);
        });
        test('token stays the same', function () {
            var source = new cancellation_1.CancellationTokenSource();
            var token = source.token;
            assert.ok(token === source.token); // doesn't change on get
            source.cancel();
            assert.ok(token === source.token); // doesn't change after cancel
            source.cancel();
            assert.ok(token === source.token); // doesn't change after 2nd cancel
            source = new cancellation_1.CancellationTokenSource();
            source.cancel();
            token = source.token;
            assert.ok(token === source.token); // doesn't change on get
        });
    });
});
//# sourceMappingURL=cancellation.test.js.map