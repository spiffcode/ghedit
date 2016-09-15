import { Range } from 'vs/editor/common/core/range';
import { IIdentifiedSingleEditOperation } from 'vs/editor/common/editorCommon';
import { Position } from 'vs/editor/common/core/position';
export declare class EditOperation {
    static insert(position: Position, text: string): IIdentifiedSingleEditOperation;
    static delete(range: Range): IIdentifiedSingleEditOperation;
    static replace(range: Range, text: string): IIdentifiedSingleEditOperation;
    static replaceMove(range: Range, text: string): IIdentifiedSingleEditOperation;
}
