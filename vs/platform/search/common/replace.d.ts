import { IPatternInfo } from 'vs/platform/search/common/search';
export declare class ReplacePattern {
    private replaceString;
    private searchPatternInfo;
    private _replacePattern;
    private _searchRegExp;
    private _hasParameters;
    constructor(replaceString: string, searchPatternInfo: IPatternInfo);
    hasParameters: boolean;
    pattern: string;
    getReplaceString(matchedString: string): string;
    /**
     * \n => LF
     * \t => TAB
     * \\ => \
     * $0 => $& (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter)
     * everything else stays untouched
     */
    private parseReplaceString(replaceString);
    private between(value, from, to);
}
