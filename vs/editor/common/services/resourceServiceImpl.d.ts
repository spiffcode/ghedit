import { EventEmitter, ListenerCallback } from 'vs/base/common/eventEmitter';
import { IDisposable } from 'vs/base/common/lifecycle';
import URI from 'vs/base/common/uri';
import { IMirrorModel } from 'vs/editor/common/editorCommon';
import { IResourceService } from 'vs/editor/common/services/resourceService';
export declare class ResourceService extends EventEmitter implements IResourceService {
    _serviceBrand: any;
    private data;
    private unbinds;
    constructor();
    addListener2_(eventType: string, listener: ListenerCallback): IDisposable;
    private _anonymousModelId(input);
    insert(url: URI, element: IMirrorModel): void;
    get(url: URI): IMirrorModel;
    all(): IMirrorModel[];
    contains(url: URI): boolean;
    remove(url: URI): void;
}
