import { TPromise } from 'vs/base/common/winjs.base';
import { Range } from 'vs/editor/common/core/range';
import * as editorCommon from 'vs/editor/common/editorCommon';
import { ILineMarker } from 'vs/editor/common/model/modelLine';
import { TextModelWithMarkers } from 'vs/editor/common/model/textModelWithMarkers';
import { IRetokenizeRequest } from 'vs/editor/common/model/textModelWithTokens';
import { IMode } from 'vs/editor/common/modes';
export declare class TextModelWithTrackedRanges extends TextModelWithMarkers implements editorCommon.ITextModelWithTrackedRanges {
    private _rangeIdGenerator;
    private _ranges;
    private _markerIdToRangeId;
    private _multiLineTrackedRanges;
    constructor(allowedEventTypes: string[], rawText: editorCommon.IRawText, modeOrPromise: IMode | TPromise<IMode>);
    _createRetokenizer(retokenizePromise: TPromise<void>, lineNumber: number): IRetokenizeRequest;
    dispose(): void;
    _resetValue(e: editorCommon.IModelContentChangedFlushEvent, newValue: editorCommon.IRawText): void;
    private _setRangeIsMultiLine(rangeId, rangeIsMultiLine);
    private _shouldStartMarkerSticksToPreviousCharacter(stickiness);
    private _shouldEndMarkerSticksToPreviousCharacter(stickiness);
    _getTrackedRangesCount(): number;
    addTrackedRange(textRange: editorCommon.IRange, stickiness: editorCommon.TrackedRangeStickiness): string;
    protected _addTrackedRanges(textRanges: editorCommon.IRange[], stickinessArr: editorCommon.TrackedRangeStickiness[]): string[];
    changeTrackedRange(rangeId: string, newTextRange: editorCommon.IRange): void;
    changeTrackedRangeStickiness(rangeId: string, newStickiness: editorCommon.TrackedRangeStickiness): void;
    isValidTrackedRange(rangeId: string): boolean;
    removeTrackedRange(rangeId: string): void;
    protected removeTrackedRanges(ids: string[]): void;
    private _newEditorRange(startPosition, endPosition);
    getTrackedRange(rangeId: string): Range;
    /**
     * Fetch only multi-line ranges that intersect with the given line number range
     */
    private _getMultiLineTrackedRanges(filterStartLineNumber, filterEndLineNumber);
    getLinesTrackedRanges(startLineNumber: number, endLineNumber: number): editorCommon.IModelTrackedRange[];
    _onChangedMarkers(changedMarkers: ILineMarker[]): editorCommon.IChangedTrackedRanges;
}
