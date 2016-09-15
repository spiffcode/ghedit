import { PPromise } from 'vs/base/common/winjs.base';
import glob = require('vs/base/common/glob');
import { IProgress, ILineMatch, IPatternInfo, ISearchStats } from 'vs/platform/search/common/search';
export interface IRawSearch {
    rootFolders: string[];
    extraFiles?: string[];
    filePattern?: string;
    excludePattern?: glob.IExpression;
    includePattern?: glob.IExpression;
    contentPattern?: IPatternInfo;
    maxResults?: number;
    maxFilesize?: number;
    fileEncoding?: string;
}
export interface IRawSearchService {
    fileSearch(search: IRawSearch): PPromise<ISerializedSearchComplete, ISerializedSearchProgressItem>;
    textSearch(search: IRawSearch): PPromise<ISerializedSearchComplete, ISerializedSearchProgressItem>;
}
export interface ISearchEngine {
    search: (onResult: (match: ISerializedFileMatch) => void, onProgress: (progress: IProgress) => void, done: (error: Error, complete: ISerializedSearchComplete) => void) => void;
    cancel: () => void;
}
export interface ISerializedSearchComplete {
    limitHit: boolean;
    stats: ISearchStats;
}
export interface ISerializedFileMatch {
    path?: string;
    lineMatches?: ILineMatch[];
}
export declare type ISerializedSearchProgressItem = ISerializedFileMatch | ISerializedFileMatch[] | IProgress;
