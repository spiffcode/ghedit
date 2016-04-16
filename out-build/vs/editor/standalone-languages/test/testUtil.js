/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/editor/common/modes/monarch/monarchCompile', 'vs/editor/common/modes/monarch/monarchDefinition', 'vs/editor/common/modes/supports/richEditSupport', 'vs/editor/test/common/modesUtil'], function (require, exports, monarchCompile_1, monarchDefinition_1, richEditSupport_1, modesUtil_1) {
    'use strict';
    function testTokenization(name, language, tests) {
        suite(language.displayName || name, function () {
            test('Tokenization', function () {
                modesUtil_1.executeMonarchTokenizationTests(name, language, tests);
            });
        });
    }
    exports.testTokenization = testTokenization;
    function testOnEnter(name, language, callback) {
        suite(language.displayName || name, function () {
            test('onEnter', function () {
                var lexer = monarchCompile_1.compile(language);
                var richEditSupport = new richEditSupport_1.RichEditSupport('test', null, monarchDefinition_1.createRichEditSupport(lexer));
                callback(modesUtil_1.createOnEnterAsserter('test', richEditSupport));
            });
        });
    }
    exports.testOnEnter = testOnEnter;
});
//# sourceMappingURL=testUtil.js.map