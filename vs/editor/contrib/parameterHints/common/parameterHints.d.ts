import { TPromise } from 'vs/base/common/winjs.base';
import { IReadOnlyModel } from 'vs/editor/common/editorCommon';
import { SignatureHelp } from 'vs/editor/common/modes';
import { Position } from 'vs/editor/common/core/position';
export declare const Context: {
    Visible: string;
    MultipleSignatures: string;
};
export declare function provideSignatureHelp(model: IReadOnlyModel, position: Position): TPromise<SignatureHelp>;
