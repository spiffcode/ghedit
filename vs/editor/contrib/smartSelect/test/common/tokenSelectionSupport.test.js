var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'assert', 'vs/base/common/uri', 'vs/editor/common/core/range', 'vs/editor/common/modes', 'vs/editor/contrib/smartSelect/common/tokenSelectionSupport', 'vs/editor/test/common/servicesTestUtils', 'vs/editor/test/common/mocks/mockMode', 'vs/editor/common/modes/supports/richEditSupport'], function (require, exports, assert, uri_1, range_1, modes_1, tokenSelectionSupport_1, servicesTestUtils_1, mockMode_1, richEditSupport_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var MockJSMode = (function (_super) {
        __extends(MockJSMode, _super);
        function MockJSMode() {
            _super.call(this, 'js', 'mock-js');
            this.richEditSupport = new richEditSupport_1.RichEditSupport(this.getId(), null, {
                brackets: [
                    ['(', ')'],
                    ['{', '}'],
                    ['[', ']']
                ],
                onEnterRules: [
                    {
                        // e.g. /** | */
                        beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
                        afterText: /^\s*\*\/$/,
                        action: { indentAction: modes_1.IndentAction.IndentOutdent, appendText: ' * ' }
                    },
                    {
                        // e.g. /** ...|
                        beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
                        action: { indentAction: modes_1.IndentAction.None, appendText: ' * ' }
                    },
                    {
                        // e.g.  * ...|
                        beforeText: /^(\t|(\ \ ))*\ \*(\ ([^\*]|\*(?!\/))*)?$/,
                        action: { indentAction: modes_1.IndentAction.None, appendText: '* ' }
                    },
                    {
                        // e.g.  */|
                        beforeText: /^(\t|(\ \ ))*\ \*\/\s*$/,
                        action: { indentAction: modes_1.IndentAction.None, removeText: 1 }
                    }
                ]
            });
        }
        return MockJSMode;
    }(mockMode_1.MockTokenizingMode));
    suite('TokenSelectionSupport', function () {
        var modelService = servicesTestUtils_1.createMockModelService();
        var tokenSelectionSupport = new tokenSelectionSupport_1.TokenSelectionSupport(modelService);
        var _mode = new MockJSMode();
        function assertGetRangesToPosition(text, lineNumber, column, ranges) {
            var uri = uri_1.default.file('test.js');
            modelService.createModel(text.join('\n'), _mode, uri);
            var actual = tokenSelectionSupport.getRangesToPositionSync(uri, {
                lineNumber: lineNumber,
                column: column
            });
            var actualStr = actual.map(function (r) { return new range_1.Range(r.range.startLineNumber, r.range.startColumn, r.range.endLineNumber, r.range.endColumn).toString(); });
            var desiredStr = ranges.map(function (r) { return String(r); });
            assert.deepEqual(actualStr, desiredStr);
            modelService.destroyModel(uri);
        }
        test('getRangesToPosition #1', function () {
            assertGetRangesToPosition([
                'function a(bar, foo){',
                '\tif (bar) {',
                '\t\treturn (bar + (2 * foo))',
                '\t}',
                '}'
            ], 3, 20, [
                new range_1.Range(1, 1, 5, 2),
                new range_1.Range(1, 21, 5, 2),
                new range_1.Range(2, 1, 4, 3),
                new range_1.Range(2, 11, 4, 3),
                new range_1.Range(3, 1, 4, 2),
                new range_1.Range(3, 1, 3, 27),
                new range_1.Range(3, 10, 3, 27),
                new range_1.Range(3, 11, 3, 26),
                new range_1.Range(3, 17, 3, 26),
                new range_1.Range(3, 18, 3, 25),
            ]);
        });
    });
});
//# sourceMappingURL=tokenSelectionSupport.test.js.map