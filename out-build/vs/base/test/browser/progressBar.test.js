define(["require", "exports", 'assert', 'vs/base/browser/ui/progressbar/progressbar', 'vs/base/browser/builder'], function (require, exports, assert, progressbar_1, builder_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('ProgressBar', function () {
        var fixture;
        setup(function () {
            fixture = document.createElement('div');
            document.body.appendChild(fixture);
        });
        teardown(function () {
            document.body.removeChild(fixture);
        });
        test('Progress Bar', function () {
            var b = new builder_1.Builder(fixture);
            var bar = new progressbar_1.ProgressBar(b);
            assert(bar.getContainer());
            assert(bar.infinite());
            assert(bar.total(100));
            assert(bar.worked(50));
            assert(bar.worked(50));
            assert(bar.done());
            bar.dispose();
        });
    });
});
//# sourceMappingURL=progressBar.test.js.map