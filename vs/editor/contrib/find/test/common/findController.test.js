var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'assert', 'vs/editor/common/core/editOperation', 'vs/editor/common/core/position', 'vs/editor/common/core/range', 'vs/editor/contrib/find/common/findController', 'vs/editor/test/common/mocks/mockCodeEditor'], function (require, exports, assert, editOperation_1, position_1, range_1, findController_1, mockCodeEditor_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var TestFindController = (function (_super) {
        __extends(TestFindController, _super);
        function TestFindController() {
            _super.apply(this, arguments);
        }
        TestFindController.prototype._start = function (opts) {
            _super.prototype._start.call(this, opts);
            if (opts.shouldFocus !== findController_1.FindStartFocusAction.NoFocusChange) {
                this.hasFocus = true;
            }
        };
        return TestFindController;
    }(findController_1.CommonFindController));
    suite('FindController', function () {
        function fromRange(rng) {
            return [rng.startLineNumber, rng.startColumn, rng.endLineNumber, rng.endColumn];
        }
        test('issue #1857: F3, Find Next, acts like "Find Under Cursor"', function () {
            mockCodeEditor_1.withMockCodeEditor([
                'ABC',
                'ABC',
                'XYZ',
                'ABC'
            ], {}, function (editor, cursor) {
                // The cursor is at the very top, of the file, at the first ABC
                var findController = editor.registerAndInstantiateContribution(TestFindController);
                var findState = findController.getState();
                var startFindAction = new findController_1.StartFindAction({ id: '', label: '' }, editor);
                var nextMatchFindAction = new findController_1.NextMatchFindAction({ id: '', label: '' }, editor);
                // I hit Ctrl+F to show the Find dialog
                startFindAction.run();
                // I type ABC.
                findState.change({ searchString: 'A' }, true);
                findState.change({ searchString: 'AB' }, true);
                findState.change({ searchString: 'ABC' }, true);
                // The first ABC is highlighted.
                assert.deepEqual(fromRange(editor.getSelection()), [1, 1, 1, 4]);
                // I hit Esc to exit the Find dialog.
                findController.closeFindWidget();
                findController.hasFocus = false;
                // The cursor is now at end of the first line, with ABC on that line highlighted.
                assert.deepEqual(fromRange(editor.getSelection()), [1, 1, 1, 4]);
                // I hit delete to remove it and change the text to XYZ.
                editor.executeEdits('test', [editOperation_1.EditOperation.delete(new range_1.Range(1, 1, 1, 4))]);
                editor.executeEdits('test', [editOperation_1.EditOperation.insert(new position_1.Position(1, 1), 'XYZ')]);
                // At this point the text editor looks like this:
                //   XYZ
                //   ABC
                //   XYZ
                //   ABC
                assert.equal(editor.getModel().getLineContent(1), 'XYZ');
                // The cursor is at end of the first line.
                assert.deepEqual(fromRange(editor.getSelection()), [1, 4, 1, 4]);
                // I hit F3 to "Find Next" to find the next occurrence of ABC, but instead it searches for XYZ.
                nextMatchFindAction.run();
                assert.equal(findState.searchString, 'ABC');
                assert.equal(findController.hasFocus, false);
                findController.dispose();
                startFindAction.dispose();
                nextMatchFindAction.dispose();
            });
        });
        test('issue #3090: F3 does not loop with two matches on a single line', function () {
            mockCodeEditor_1.withMockCodeEditor([
                'import nls = require(\'vs/nls\');'
            ], {}, function (editor, cursor) {
                // The cursor is at the very top, of the file, at the first ABC
                var findController = editor.registerAndInstantiateContribution(TestFindController);
                var nextMatchFindAction = new findController_1.NextMatchFindAction({ id: '', label: '' }, editor);
                editor.setPosition({
                    lineNumber: 1,
                    column: 9
                });
                nextMatchFindAction.run();
                assert.deepEqual(fromRange(editor.getSelection()), [1, 26, 1, 29]);
                nextMatchFindAction.run();
                assert.deepEqual(fromRange(editor.getSelection()), [1, 8, 1, 11]);
                findController.dispose();
                nextMatchFindAction.dispose();
            });
        });
    });
});
//# sourceMappingURL=findController.test.js.map