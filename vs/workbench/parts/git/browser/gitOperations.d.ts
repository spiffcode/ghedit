import git = require('vs/workbench/parts/git/common/git');
import winjs = require('vs/base/common/winjs.base');
export declare class GitOperation implements git.IGitOperation {
    id: string;
    private fn;
    constructor(id: string, fn: () => winjs.Promise);
    run(): winjs.Promise;
    dispose(): void;
}
export declare class CommandOperation implements git.IGitOperation {
    input: string;
    id: string;
    constructor(input: string);
    run(): winjs.Promise;
    dispose(): void;
}
