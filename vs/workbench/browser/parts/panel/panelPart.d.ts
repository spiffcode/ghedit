import 'vs/css!./media/panelpart';
import { TPromise } from 'vs/base/common/winjs.base';
import { IAction } from 'vs/base/common/actions';
import { Builder } from 'vs/base/browser/builder';
import { IPanel } from 'vs/workbench/common/panel';
import { CompositePart } from 'vs/workbench/browser/parts/compositePart';
import { Panel } from 'vs/workbench/browser/panel';
import { IPanelService } from 'vs/workbench/services/panel/common/panelService';
import { IPartService } from 'vs/workbench/services/part/common/partService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IEventService } from 'vs/platform/event/common/event';
import { IMessageService } from 'vs/platform/message/common/message';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
export declare class PanelPart extends CompositePart<Panel> implements IPanelService {
    static activePanelSettingsKey: string;
    _serviceBrand: any;
    private blockOpeningPanel;
    constructor(id: string, messageService: IMessageService, storageService: IStorageService, eventService: IEventService, telemetryService: ITelemetryService, contextMenuService: IContextMenuService, partService: IPartService, keybindingService: IKeybindingService, instantiationService: IInstantiationService);
    create(parent: Builder): void;
    openPanel(id: string, focus?: boolean): TPromise<Panel>;
    protected getActions(): IAction[];
    getActivePanel(): IPanel;
    getLastActivePanelId(): string;
    hideActivePanel(): TPromise<void>;
}
