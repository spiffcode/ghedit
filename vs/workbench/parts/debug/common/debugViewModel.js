/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/event'], function (require, exports, event_1) {
    "use strict";
    var ViewModel = (function () {
        function ViewModel() {
            this._onDidFocusStackFrame = new event_1.Emitter();
            this._onDidSelectExpression = new event_1.Emitter();
            this._onDidSelectFunctionBreakpoint = new event_1.Emitter();
            this.changedWorkbenchViewState = false;
        }
        ViewModel.prototype.getId = function () {
            return 'root';
        };
        ViewModel.prototype.getFocusedStackFrame = function () {
            return this.focusedStackFrame;
        };
        ViewModel.prototype.setFocusedStackFrame = function (focusedStackFrame) {
            this.focusedStackFrame = focusedStackFrame;
            this._onDidFocusStackFrame.fire(focusedStackFrame);
        };
        Object.defineProperty(ViewModel.prototype, "onDidFocusStackFrame", {
            get: function () {
                return this._onDidFocusStackFrame.event;
            },
            enumerable: true,
            configurable: true
        });
        ViewModel.prototype.getFocusedThreadId = function () {
            return this.focusedStackFrame ? this.focusedStackFrame.threadId : 0;
        };
        ViewModel.prototype.getSelectedExpression = function () {
            return this.selectedExpression;
        };
        ViewModel.prototype.setSelectedExpression = function (expression) {
            this.selectedExpression = expression;
            this._onDidSelectExpression.fire(expression);
        };
        Object.defineProperty(ViewModel.prototype, "onDidSelectExpression", {
            get: function () {
                return this._onDidSelectExpression.event;
            },
            enumerable: true,
            configurable: true
        });
        ViewModel.prototype.getSelectedFunctionBreakpoint = function () {
            return this.selectedFunctionBreakpoint;
        };
        ViewModel.prototype.setSelectedFunctionBreakpoint = function (functionBreakpoint) {
            this.selectedFunctionBreakpoint = functionBreakpoint;
            this._onDidSelectFunctionBreakpoint.fire(functionBreakpoint);
        };
        Object.defineProperty(ViewModel.prototype, "onDidSelectFunctionBreakpoint", {
            get: function () {
                return this._onDidSelectFunctionBreakpoint.event;
            },
            enumerable: true,
            configurable: true
        });
        return ViewModel;
    }());
    exports.ViewModel = ViewModel;
});
//# sourceMappingURL=debugViewModel.js.map