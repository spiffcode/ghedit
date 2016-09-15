export interface IExpression {
    [pattern: string]: boolean | SiblingClause | any;
}
export interface SiblingClause {
    when: string;
}
export declare function splitGlobAware(pattern: string, splitChar: string): string[];
/**
 * Simplified glob matching. Supports a subset of glob patterns:
 * - * matches anything inside a path segment
 * - ? matches 1 character inside a path segment
 * - ** matches anything including an empty path segment
 * - simple brace expansion ({js,ts} => js or ts)
 * - character ranges (using [...])
 */
export declare function match(pattern: string, path: string): boolean;
export declare function match(expression: IExpression, path: string, siblings?: string[]): string;
