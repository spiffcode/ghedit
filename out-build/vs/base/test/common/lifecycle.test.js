define(["require", "exports", 'assert', 'vs/base/common/lifecycle'], function (require, exports, assert, lifecycle_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var Disposable = (function () {
        function Disposable() {
            this.isDisposed = false;
        }
        Disposable.prototype.dispose = function () { this.isDisposed = true; };
        return Disposable;
    }());
    suite('Lifecycle', function () {
        test('dispose single disposable', function () {
            var disposable = new Disposable();
            assert(!disposable.isDisposed);
            lifecycle_1.dispose(disposable);
            assert(disposable.isDisposed);
        });
        test('dispose disposable array', function () {
            var disposable = new Disposable();
            var disposable2 = new Disposable();
            assert(!disposable.isDisposed);
            assert(!disposable2.isDisposed);
            lifecycle_1.dispose([disposable, disposable2]);
            assert(disposable.isDisposed);
            assert(disposable2.isDisposed);
        });
        test('dispose disposables', function () {
            var disposable = new Disposable();
            var disposable2 = new Disposable();
            assert(!disposable.isDisposed);
            assert(!disposable2.isDisposed);
            lifecycle_1.dispose(disposable, disposable2);
            assert(disposable.isDisposed);
            assert(disposable2.isDisposed);
        });
    });
});
//# sourceMappingURL=lifecycle.test.js.map