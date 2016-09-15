import { TPromise } from 'vs/base/common/winjs.base';
import { IModeService } from 'vs/editor/common/services/modeService';
export interface ISnippetsExtensionPoint {
    language: string;
    path: string;
}
export declare class MainProcessTextMateSnippet {
    private _modeService;
    constructor(modeService: IModeService);
    private _withSnippetContribution(extensionFolderPath, snippet, collector);
}
export declare function readAndRegisterSnippets(modeId: string, filePath: string): TPromise<void>;
