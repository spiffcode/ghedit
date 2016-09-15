import { TPromise } from 'vs/base/common/winjs.base';
import { QuickOpenHandler } from 'vs/workbench/browser/quickopen';
import { QuickOpenModel } from 'vs/base/parts/quickopen/browser/quickOpenModel';
import { IAutoFocus } from 'vs/base/parts/quickopen/common/quickOpen';
import { IWorkbenchEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IModeService } from 'vs/editor/common/services/modeService';
export interface IOpenSymbolOptions {
    skipSorting: boolean;
    skipLocalSymbols: boolean;
    skipDelay: boolean;
}
export declare class OpenSymbolHandler extends QuickOpenHandler {
    private editorService;
    private modeService;
    private instantiationService;
    private contextService;
    private static SEARCH_DELAY;
    private delayer;
    private options;
    constructor(editorService: IWorkbenchEditorService, modeService: IModeService, instantiationService: IInstantiationService, contextService: IWorkspaceContextService);
    setOptions(options: IOpenSymbolOptions): void;
    canRun(): boolean | string;
    getResults(searchValue: string): TPromise<QuickOpenModel>;
    private doGetResults(searchValue);
    private toQuickOpenEntries(types, searchValue);
    private sort(searchValue, elementA, elementB);
    getGroupLabel(): string;
    getEmptyLabel(searchString: string): string;
    getAutoFocus(searchValue: string): IAutoFocus;
}
