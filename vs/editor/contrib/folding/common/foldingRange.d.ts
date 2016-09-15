export interface IFoldingRange {
    startLineNumber: number;
    endLineNumber: number;
    indent: number;
    isCollapsed?: boolean;
}
export declare function toString(range: IFoldingRange): string;
