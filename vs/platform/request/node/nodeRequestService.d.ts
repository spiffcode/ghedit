import { TPromise } from 'vs/base/common/winjs.base';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IRequestService } from 'vs/platform/request/common/request';
import { IXHROptions, IXHRResponse } from 'vs/base/common/http';
/**
 * TODO@joao: this is sort of duplicate to the existing request services...
 * we need to compose, not extend!!
 */
export declare class NodeRequestService implements IRequestService {
    _serviceBrand: any;
    private disposables;
    private proxyUrl;
    private strictSSL;
    constructor(configurationService: IConfigurationService);
    private configure(config);
    makeRequest(options: IXHROptions): TPromise<IXHRResponse>;
    dispose(): void;
}
