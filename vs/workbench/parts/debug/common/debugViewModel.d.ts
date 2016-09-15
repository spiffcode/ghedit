import Event from 'vs/base/common/event';
import debug = require('vs/workbench/parts/debug/common/debug');
export declare class ViewModel implements debug.IViewModel {
    private focusedStackFrame;
    private focusedThread;
    private selectedExpression;
    private selectedFunctionBreakpoint;
    private _onDidFocusStackFrame;
    private _onDidSelectExpression;
    private _onDidSelectFunctionBreakpoint;
    changedWorkbenchViewState: boolean;
    constructor();
    getId(): string;
    getFocusedStackFrame(): debug.IStackFrame;
    setFocusedStackFrame(focusedStackFrame: debug.IStackFrame, focusedThread: debug.IThread): void;
    onDidFocusStackFrame: Event<debug.IStackFrame>;
    getFocusedThreadId(): number;
    getSelectedExpression(): debug.IExpression;
    setSelectedExpression(expression: debug.IExpression): void;
    onDidSelectExpression: Event<debug.IExpression>;
    getSelectedFunctionBreakpoint(): debug.IFunctionBreakpoint;
    setSelectedFunctionBreakpoint(functionBreakpoint: debug.IFunctionBreakpoint): void;
    onDidSelectFunctionBreakpoint: Event<debug.IFunctionBreakpoint>;
}
