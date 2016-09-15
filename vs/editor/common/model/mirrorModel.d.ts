import URI from 'vs/base/common/uri';
import { TPromise } from 'vs/base/common/winjs.base';
import * as editorCommon from 'vs/editor/common/editorCommon';
import { TextModelWithTokens } from 'vs/editor/common/model/textModelWithTokens';
import { IMode } from 'vs/editor/common/modes';
import { Range } from 'vs/editor/common/core/range';
import { Position } from 'vs/editor/common/core/position';
export interface IMirrorModelEvents {
    contentChanged: editorCommon.IModelContentChangedEvent[];
}
export declare class AbstractMirrorModel extends TextModelWithTokens implements editorCommon.IMirrorModel {
    _associatedResource: URI;
    constructor(allowedEventTypes: string[], versionId: number, value: editorCommon.IRawText, mode: IMode | TPromise<IMode>, associatedResource?: URI);
    getModeId(): string;
    _constructLines(rawText: editorCommon.IRawText): void;
    destroy(): void;
    dispose(): void;
    uri: URI;
    getRangeFromOffsetAndLength(offset: number, length: number): Range;
    getOffsetAndLengthFromRange(range: editorCommon.IRange): {
        offset: number;
        length: number;
    };
    getPositionFromOffset(offset: number): Position;
    getOffsetFromPosition(position: editorCommon.IPosition): number;
    getLineStart(lineNumber: number): number;
    getAllWordsWithRange(): editorCommon.IRangeWithText[];
    getAllWords(): string[];
    getAllUniqueWords(skipWordOnce?: string): string[];
    private wordenize(content);
}
export declare function createTestMirrorModelFromString(value: string, mode?: IMode, associatedResource?: URI): MirrorModel;
export declare class MirrorModel extends AbstractMirrorModel implements editorCommon.IMirrorModel {
    constructor(versionId: number, value: editorCommon.IRawText, mode: IMode | TPromise<IMode>, associatedResource?: URI);
    onEvents(events: IMirrorModelEvents): void;
    private _onLinesFlushed(e);
    private _onLineChanged(e);
    private _onLinesDeleted(e);
    private _onLinesInserted(e);
}
