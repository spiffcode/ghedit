import { TPromise } from 'vs/base/common/winjs.base';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IExtensionService } from 'vs/platform/extensions/common/extensions';
export declare class CommandService implements ICommandService {
    private _instantiationService;
    private _extensionService;
    _serviceBrand: any;
    constructor(_instantiationService: IInstantiationService, _extensionService: IExtensionService);
    executeCommand<T>(id: string, ...args: any[]): TPromise<T>;
}
