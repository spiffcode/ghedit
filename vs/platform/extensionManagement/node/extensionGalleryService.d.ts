import { TPromise } from 'vs/base/common/winjs.base';
import { IGalleryExtension, IExtensionGalleryService, IQueryOptions } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IRequestService } from 'vs/platform/request/common/request';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IPager } from 'vs/base/common/paging';
export declare class ExtensionGalleryService implements IExtensionGalleryService {
    private requestService;
    private telemetryService;
    _serviceBrand: any;
    private extensionsGalleryUrl;
    private machineId;
    constructor(requestService: IRequestService, telemetryService: ITelemetryService);
    private api(path?);
    isEnabled(): boolean;
    query(options?: IQueryOptions): TPromise<IPager<IGalleryExtension>>;
    private queryGallery(query);
    private getRequestHeaders();
}
