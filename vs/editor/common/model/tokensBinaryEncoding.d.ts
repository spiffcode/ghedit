import { ViewLineToken } from 'vs/editor/common/core/viewLineToken';
import { LineToken } from 'vs/editor/common/model/lineToken';
export declare class TokensInflatorMap {
    _inflate: string[];
    _deflate: {
        [token: string]: number;
    };
    constructor();
}
export declare class TokensBinaryEncoding {
    static START_INDEX_MASK: number;
    static TYPE_MASK: number;
    static START_INDEX_OFFSET: number;
    static TYPE_OFFSET: number;
    static deflateArr(map: TokensInflatorMap, tokens: LineToken[]): number[];
    static getStartIndex(binaryEncodedToken: number): number;
    static getType(map: TokensInflatorMap, binaryEncodedToken: number): string;
    static inflateArr(map: TokensInflatorMap, binaryEncodedTokens: number[]): ViewLineToken[];
    static findIndexOfOffset(binaryEncodedTokens: number[], offset: number): number;
    static sliceAndInflate(map: TokensInflatorMap, binaryEncodedTokens: number[], startOffset: number, endOffset: number, deltaStartIndex: number): ViewLineToken[];
    private static findIndexInSegmentsArray(arr, desiredIndex);
}
