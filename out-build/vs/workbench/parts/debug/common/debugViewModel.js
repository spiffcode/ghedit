var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/eventEmitter', 'vs/workbench/parts/debug/common/debug'], function (require, exports, ee, debug) {
    "use strict";
    var ViewModel = (function (_super) {
        __extends(ViewModel, _super);
        function ViewModel() {
            _super.apply(this, arguments);
        }
        ViewModel.prototype.getId = function () {
            return 'root';
        };
        ViewModel.prototype.getFocusedStackFrame = function () {
            return this.focusedStackFrame;
        };
        ViewModel.prototype.setFocusedStackFrame = function (focusedStackFrame) {
            this.focusedStackFrame = focusedStackFrame;
            this.emit(debug.ViewModelEvents.FOCUSED_STACK_FRAME_UPDATED);
        };
        ViewModel.prototype.getFocusedThreadId = function () {
            return this.focusedStackFrame ? this.focusedStackFrame.threadId : 0;
        };
        ViewModel.prototype.getSelectedExpression = function () {
            return this.selectedExpression;
        };
        ViewModel.prototype.setSelectedExpression = function (expression) {
            this.selectedExpression = expression;
            this.emit(debug.ViewModelEvents.SELECTED_EXPRESSION_UPDATED, expression);
        };
        ViewModel.prototype.getSelectedFunctionBreakpoint = function () {
            return this.selectedFunctionBreakpoint;
        };
        ViewModel.prototype.setSelectedFunctionBreakpoint = function (functionBreakpoint) {
            this.selectedFunctionBreakpoint = functionBreakpoint;
            this.emit(debug.ViewModelEvents.SELECTED_FUNCTION_BREAKPOINT_UPDATED, functionBreakpoint);
        };
        return ViewModel;
    }(ee.EventEmitter));
    exports.ViewModel = ViewModel;
});
//# sourceMappingURL=debugViewModel.js.map