/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'vs/workbench/parts/debug/common/debugViewModel', 'vs/workbench/parts/debug/common/debugModel'], function (require, exports, assert, debugViewModel_1, debugModel_1) {
    "use strict";
    suite('Debug - View Model', function () {
        var model;
        setup(function () {
            model = new debugViewModel_1.ViewModel();
        });
        teardown(function () {
            model = null;
        });
        test('focused stack frame', function () {
            assert.equal(model.getFocusedStackFrame(), null);
            assert.equal(model.getFocusedThreadId(), 0);
            var frame = new debugModel_1.StackFrame(1, 1, null, 'app.js', 1, 1);
            model.setFocusedStackFrame(frame);
            assert.equal(model.getFocusedStackFrame(), frame);
            assert.equal(model.getFocusedThreadId(), 1);
        });
        test('selected expression', function () {
            assert.equal(model.getSelectedExpression(), null);
            var expression = new debugModel_1.Expression('my expression', false);
            model.setSelectedExpression(expression);
            assert.equal(model.getSelectedExpression(), expression);
        });
    });
});
//# sourceMappingURL=debugViewModel.test.js.map