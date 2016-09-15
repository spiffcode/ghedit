import { IProgress, ISearchStats } from 'vs/platform/search/common/search';
import { ISerializedFileMatch, ISerializedSearchComplete, IRawSearch, ISearchEngine } from './search';
export declare class FileWalker {
    private config;
    private filePattern;
    private normalizedFilePatternLowercase;
    private excludePattern;
    private includePattern;
    private maxResults;
    private maxFilesize;
    private isLimitHit;
    private resultCount;
    private isCanceled;
    private fileWalkStartTime;
    private directoriesWalked;
    private filesWalked;
    private walkedPaths;
    constructor(config: IRawSearch);
    cancel(): void;
    walk(rootFolders: string[], extraFiles: string[], onResult: (result: ISerializedFileMatch, size: number) => void, done: (error: Error, isLimitHit: boolean) => void): void;
    getStats(): ISearchStats;
    private checkFilePatternAbsoluteMatch(clb);
    private checkFilePatternRelativeMatch(basePath, clb);
    private doWalk(absolutePath, relativeParentPathWithSlashes, files, onResult, done);
    private matchFile(onResult, absolutePath, relativePathWithSlashes, size?);
    private isFilePatternMatch(path);
    private statLinkIfNeeded(path, lstat, clb);
    private realPathIfNeeded(path, lstat, clb);
}
export declare class Engine implements ISearchEngine {
    private rootFolders;
    private extraFiles;
    private walker;
    constructor(config: IRawSearch);
    search(onResult: (result: ISerializedFileMatch) => void, onProgress: (progress: IProgress) => void, done: (error: Error, complete: ISerializedSearchComplete) => void): void;
    cancel(): void;
}
