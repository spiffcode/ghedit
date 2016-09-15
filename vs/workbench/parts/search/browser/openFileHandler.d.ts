import { TPromise } from 'vs/base/common/winjs.base';
import URI from 'vs/base/common/uri';
import { IRange } from 'vs/editor/common/editorCommon';
import { IAutoFocus } from 'vs/base/parts/quickopen/common/quickOpen';
import { QuickOpenModel } from 'vs/base/parts/quickopen/browser/quickOpenModel';
import { QuickOpenHandler, EditorQuickOpenEntry } from 'vs/workbench/browser/quickopen';
import { EditorInput } from 'vs/workbench/common/editor';
import { IEditorGroupService } from 'vs/workbench/services/group/common/groupService';
import { IResourceInput } from 'vs/platform/editor/common/editor';
import { IWorkbenchEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ISearchService, ISearchStats } from 'vs/platform/search/common/search';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
export declare class FileEntry extends EditorQuickOpenEntry {
    private instantiationService;
    private configurationService;
    private name;
    private description;
    private resource;
    private range;
    constructor(name: string, description: string, resource: URI, editorService: IWorkbenchEditorService, instantiationService: IInstantiationService, configurationService: IConfigurationService, contextService: IWorkspaceContextService);
    getLabel(): string;
    getAriaLabel(): string;
    getDescription(): string;
    getIcon(): string;
    getResource(): URI;
    setRange(range: IRange): void;
    getInput(): IResourceInput | EditorInput;
}
export declare class OpenFileHandler extends QuickOpenHandler {
    private editorGroupService;
    private instantiationService;
    private contextService;
    private searchService;
    private queryBuilder;
    constructor(editorGroupService: IEditorGroupService, instantiationService: IInstantiationService, contextService: IWorkspaceContextService, searchService: ISearchService);
    getResults(searchValue: string): TPromise<QuickOpenModel>;
    getResultsWithStats(searchValue: string): TPromise<[QuickOpenModel, ISearchStats]>;
    private doFindResults(searchValue);
    getGroupLabel(): string;
    getAutoFocus(searchValue: string): IAutoFocus;
}
