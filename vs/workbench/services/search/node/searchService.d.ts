import { PPromise } from 'vs/base/common/winjs.base';
import { ISearchComplete, ISearchProgressItem, ISearchQuery, ISearchService } from 'vs/platform/search/common/search';
import { IUntitledEditorService } from 'vs/workbench/services/untitled/common/untitledEditorService';
import { IModelService } from 'vs/editor/common/services/modelService';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ISerializedSearchComplete, ISerializedSearchProgressItem } from './search';
export declare class SearchService implements ISearchService {
    private modelService;
    private untitledEditorService;
    private contextService;
    private configurationService;
    _serviceBrand: any;
    private diskSearch;
    constructor(modelService: IModelService, untitledEditorService: IUntitledEditorService, contextService: IWorkspaceContextService, configurationService: IConfigurationService);
    search(query: ISearchQuery): PPromise<ISearchComplete, ISearchProgressItem>;
    private getLocalResults(query);
    private matches(resource, filePattern, includePattern, excludePattern);
}
export declare class DiskSearch {
    private raw;
    constructor(verboseLogging: boolean);
    search(query: ISearchQuery): PPromise<ISearchComplete, ISearchProgressItem>;
    static collectResults(request: PPromise<ISerializedSearchComplete, ISerializedSearchProgressItem>): PPromise<ISearchComplete, ISearchProgressItem>;
    private static createFileMatch(data);
}
