import * as editorCommon from 'vs/editor/common/editorCommon';
export declare class TokenIterator implements editorCommon.ITokenIterator {
    private _model;
    private _currentLineNumber;
    private _currentTokenIndex;
    private _currentLineTokens;
    private _next;
    private _prev;
    constructor(model: editorCommon.ITokenizedModel, position: editorCommon.IPosition);
    private _readLineTokens(lineNumber);
    private _advanceNext();
    private _advancePrev();
    private _current();
    hasNext(): boolean;
    next(): editorCommon.ITokenInfo;
    hasPrev(): boolean;
    prev(): editorCommon.ITokenInfo;
    _invalidate(): void;
}
