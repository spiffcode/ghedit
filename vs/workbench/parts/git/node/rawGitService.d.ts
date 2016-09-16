import { TPromise } from 'vs/base/common/winjs.base';
import { Repository } from 'vs/workbench/parts/git/node/git.lib';
import { IRawGitService, RawServiceState, IRawStatus, IPushOptions } from 'vs/workbench/parts/git/common/git';
import Event from 'vs/base/common/event';
export declare class RawGitService implements IRawGitService {
    private repo;
    private _repositoryRoot;
    private _onOutput;
    onOutput: Event<string>;
    constructor(repo: Repository);
    getVersion(): TPromise<string>;
    private getRepositoryRoot();
    serviceState(): TPromise<RawServiceState>;
    statusCount(): TPromise<number>;
    status(): TPromise<IRawStatus>;
    init(): TPromise<IRawStatus>;
    add(filePaths?: string[]): TPromise<IRawStatus>;
    stage(filePath: string, content: string): TPromise<IRawStatus>;
    branch(name: string, checkout?: boolean): TPromise<IRawStatus>;
    checkout(treeish?: string, filePaths?: string[]): TPromise<IRawStatus>;
    clean(filePaths: string[]): TPromise<IRawStatus>;
    undo(): TPromise<IRawStatus>;
    reset(treeish: string, hard?: boolean): TPromise<IRawStatus>;
    revertFiles(treeish: string, filePaths?: string[]): TPromise<IRawStatus>;
    fetch(): TPromise<IRawStatus>;
    pull(rebase?: boolean): TPromise<IRawStatus>;
    push(remote?: string, name?: string, options?: IPushOptions): TPromise<IRawStatus>;
    sync(): TPromise<IRawStatus>;
    commit(message: string, amend?: boolean, stage?: boolean): TPromise<IRawStatus>;
    detectMimetypes(filePath: string, treeish?: string): TPromise<string[]>;
    show(filePath: string, treeish?: string): TPromise<string>;
    getCommitTemplate(): TPromise<string>;
}
export declare class DelayedRawGitService implements IRawGitService {
    private raw;
    constructor(raw: TPromise<IRawGitService>);
    onOutput: Event<string>;
    getVersion(): TPromise<string>;
    serviceState(): TPromise<RawServiceState>;
    statusCount(): TPromise<number>;
    status(): TPromise<IRawStatus>;
    init(): TPromise<IRawStatus>;
    add(filesPaths?: string[]): TPromise<IRawStatus>;
    stage(filePath: string, content: string): TPromise<IRawStatus>;
    branch(name: string, checkout?: boolean): TPromise<IRawStatus>;
    checkout(treeish?: string, filePaths?: string[]): TPromise<IRawStatus>;
    clean(filePaths: string[]): TPromise<IRawStatus>;
    undo(): TPromise<IRawStatus>;
    reset(treeish: string, hard?: boolean): TPromise<IRawStatus>;
    revertFiles(treeish: string, filePaths?: string[]): TPromise<IRawStatus>;
    fetch(): TPromise<IRawStatus>;
    pull(rebase?: boolean): TPromise<IRawStatus>;
    push(remote?: string, name?: string, options?: IPushOptions): TPromise<IRawStatus>;
    sync(): TPromise<IRawStatus>;
    commit(message: string, amend?: boolean, stage?: boolean): TPromise<IRawStatus>;
    detectMimetypes(path: string, treeish?: string): TPromise<string[]>;
    show(path: string, treeish?: string): TPromise<string>;
    getCommitTemplate(): TPromise<string>;
}