import { ILineTokens } from 'vs/editor/common/editorCommon';
import { ViewLineTokens } from 'vs/editor/common/core/viewLineToken';
export declare class FilteredLineTokens {
    /**
     * [startOffset; endOffset) (i.e. do not include endOffset)
     */
    static create(original: ILineTokens, startOffset: number, endOffset: number, deltaStartIndex: number): ViewLineTokens;
}
export declare class IdentityFilteredLineTokens {
    static create(original: ILineTokens, textLength: number): ViewLineTokens;
}
