import { TPromise } from 'vs/base/common/winjs.base';
import { IResourceService } from 'vs/editor/common/services/resourceService';
import URI from 'vs/base/common/uri';
import { ILink } from 'vs/editor/common/modes';
export interface IResourceCreator {
    toResource: (workspaceRelativePath: string) => URI;
}
/**
 * A base class of text editor worker that helps with detecting links in the text that point to files in the workspace.
 */
export declare class OutputWorker {
    private _workspaceResource;
    private patterns;
    private resourceService;
    private _modeId;
    constructor(modeId: string, resourceService: IResourceService);
    configure(workspaceResource: URI): TPromise<void>;
    provideLinks(resource: URI): TPromise<ILink[]>;
    static createPatterns(workspaceResource: URI): RegExp[];
    /**
     * Detect links. Made public static to allow for tests.
     */
    static detectLinks(line: string, lineIndex: number, patterns: RegExp[], contextService: IResourceCreator): ILink[];
}
