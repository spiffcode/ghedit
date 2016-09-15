import { ILifecycleService, ShutdownEvent } from 'vs/platform/lifecycle/common/lifecycle';
import { IMessageService } from 'vs/platform/message/common/message';
import { IWindowService } from 'vs/workbench/services/window/electron-browser/windowService';
import Event from 'vs/base/common/event';
export declare class LifecycleService implements ILifecycleService {
    private messageService;
    private windowService;
    _serviceBrand: any;
    private _onWillShutdown;
    private _onShutdown;
    constructor(messageService: IMessageService, windowService: IWindowService);
    onWillShutdown: Event<ShutdownEvent>;
    onShutdown: Event<void>;
    private registerListeners();
    private onBeforeUnload();
}
