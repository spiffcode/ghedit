/**
 * A token on a line.
 */
export declare class LineToken {
    _lineTokenBrand: void;
    startIndex: number;
    type: string;
    constructor(startIndex: number, type: string);
    equals(other: LineToken): boolean;
    static findIndexInSegmentsArray(arr: LineToken[], desiredIndex: number): number;
    static equalsArray(a: LineToken[], b: LineToken[]): boolean;
}
