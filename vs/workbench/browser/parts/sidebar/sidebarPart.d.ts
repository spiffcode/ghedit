import 'vs/css!./media/sidebarpart';
import { TPromise } from 'vs/base/common/winjs.base';
import { CompositePart } from 'vs/workbench/browser/parts/compositePart';
import { Viewlet } from 'vs/workbench/browser/viewlet';
import { IViewletService } from 'vs/workbench/services/viewlet/common/viewletService';
import { IPartService } from 'vs/workbench/services/part/common/partService';
import { IViewlet } from 'vs/workbench/common/viewlet';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IEventService } from 'vs/platform/event/common/event';
import { IMessageService } from 'vs/platform/message/common/message';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import Event from 'vs/base/common/event';
export declare class SidebarPart extends CompositePart<Viewlet> implements IViewletService {
    static activeViewletSettingsKey: string;
    private _onDidActiveViewletChange;
    onDidActiveViewletChange: Event<IViewlet>;
    _serviceBrand: any;
    private blockOpeningViewlet;
    constructor(id: string, messageService: IMessageService, storageService: IStorageService, eventService: IEventService, telemetryService: ITelemetryService, contextMenuService: IContextMenuService, partService: IPartService, keybindingService: IKeybindingService, instantiationService: IInstantiationService);
    openViewlet(id: string, focus?: boolean): TPromise<Viewlet>;
    getActiveViewlet(): IViewlet;
    getLastActiveViewletId(): string;
    hideActiveViewlet(): TPromise<void>;
}
