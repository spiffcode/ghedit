import { TPromise } from 'vs/base/common/winjs.base';
import { IDisposable } from 'vs/base/common/lifecycle';
import { IRange } from 'vs/editor/common/editorCommon';
import URI from 'vs/base/common/uri';
/**
 * Interface used to navigate to types by value.
 */
export interface ITypeBearing {
    containerName: string;
    name: string;
    parameters: string;
    type: string;
    range: IRange;
    resourceUri: URI;
}
export interface INavigateTypesSupport {
    getNavigateToItems: (search: string) => TPromise<ITypeBearing[]>;
}
export declare namespace NavigateTypesSupportRegistry {
    function register(support: INavigateTypesSupport): IDisposable;
    function all(): INavigateTypesSupport[];
}
export declare function getNavigateToItems(query: string): TPromise<ITypeBearing[]>;
