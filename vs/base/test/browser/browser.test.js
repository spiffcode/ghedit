define(["require", "exports", 'assert', 'vs/base/common/platform', 'vs/base/browser/browser'], function (require, exports, assert, platform_1, browser) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('Browsers', function () {
        test('all', function () {
            assert(!(platform_1.isWindows && platform_1.isMacintosh));
            var isOpera = browser.isOpera || navigator.userAgent.indexOf('OPR') >= 0;
            var isIE11orEarlier = browser.isIE11orEarlier;
            var isFirefox = browser.isFirefox;
            var isWebKit = browser.isWebKit;
            var isChrome = browser.isChrome;
            var isSafari = browser.isSafari;
            var canPushState = browser.canPushState();
            var hasCSSAnimations = browser.hasCSSAnimationSupport();
            var browserCount = 0;
            if (isOpera) {
                browserCount++;
                assert(canPushState);
            }
            if (isIE11orEarlier) {
                browserCount++;
            }
            if (isFirefox) {
                browserCount++;
                assert(canPushState);
                assert(hasCSSAnimations);
            }
            if (isWebKit) {
                browserCount++;
                assert(canPushState);
                assert(hasCSSAnimations);
            }
            if (isChrome) {
                browserCount++;
                assert(canPushState);
                assert(hasCSSAnimations);
            }
            if (isSafari) {
                browserCount++;
                assert(canPushState);
                assert(hasCSSAnimations);
            }
        });
    });
});
//# sourceMappingURL=browser.test.js.map