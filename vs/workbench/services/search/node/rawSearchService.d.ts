import { PPromise } from 'vs/base/common/winjs.base';
import { IRawSearchService, IRawSearch, ISerializedSearchProgressItem, ISerializedSearchComplete, ISearchEngine } from './search';
export declare class SearchService implements IRawSearchService {
    private static BATCH_SIZE;
    fileSearch(config: IRawSearch): PPromise<ISerializedSearchComplete, ISerializedSearchProgressItem>;
    textSearch(config: IRawSearch): PPromise<ISerializedSearchComplete, ISerializedSearchProgressItem>;
    doSearch(engine: ISearchEngine, batchSize?: number): PPromise<ISerializedSearchComplete, ISerializedSearchProgressItem>;
}
