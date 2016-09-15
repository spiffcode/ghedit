import { PPromise } from 'vs/base/common/winjs.base';
import uri from 'vs/base/common/uri';
import glob = require('vs/base/common/glob');
import { IFilesConfiguration } from 'vs/platform/files/common/files';
export declare const ID: string;
export declare const ISearchService: {
    (...args: any[]): void;
    type: ISearchService;
};
/**
 * A service that enables to search for files or with in files.
 */
export interface ISearchService {
    _serviceBrand: any;
    search(query: ISearchQuery): PPromise<ISearchComplete, ISearchProgressItem>;
}
export interface IQueryOptions {
    folderResources?: uri[];
    extraFileResources?: uri[];
    filePattern?: string;
    excludePattern?: glob.IExpression;
    includePattern?: glob.IExpression;
    maxResults?: number;
    fileEncoding?: string;
}
export interface ISearchQuery extends IQueryOptions {
    type: QueryType;
    contentPattern?: IPatternInfo;
}
export declare enum QueryType {
    File = 1,
    Text = 2,
}
export interface IPatternInfo {
    pattern: string;
    isRegExp?: boolean;
    isWordMatch?: boolean;
    isCaseSensitive?: boolean;
}
export interface IFileMatch {
    resource?: uri;
    lineMatches?: ILineMatch[];
}
export interface ILineMatch {
    preview: string;
    lineNumber: number;
    offsetAndLengths: number[][];
}
export interface IProgress {
    total?: number;
    worked?: number;
}
export interface ISearchProgressItem extends IFileMatch, IProgress {
}
export interface ISearchComplete {
    limitHit?: boolean;
    results: IFileMatch[];
    stats: ISearchStats;
}
export interface ISearchStats {
    fileWalkStartTime: number;
    fileWalkResultTime: number;
    directoriesWalked: number;
    filesWalked: number;
}
export declare class FileMatch implements IFileMatch {
    resource: uri;
    lineMatches: LineMatch[];
    constructor(resource: uri);
}
export declare class LineMatch implements ILineMatch {
    preview: string;
    lineNumber: number;
    offsetAndLengths: number[][];
    constructor(preview: string, lineNumber: number, offsetAndLengths: number[][]);
}
export interface ISearchConfiguration extends IFilesConfiguration {
    search: {
        exclude: glob.IExpression;
    };
}
