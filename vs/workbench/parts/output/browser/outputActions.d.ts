import { TPromise } from 'vs/base/common/winjs.base';
import { IAction, Action } from 'vs/base/common/actions';
import { IOutputService } from 'vs/workbench/parts/output/common/output';
import { SelectActionItem } from 'vs/base/browser/ui/actionbar/actionbar';
import { IPartService } from 'vs/workbench/services/part/common/partService';
import { IPanelService } from 'vs/workbench/services/panel/common/panelService';
export declare class ToggleOutputAction extends Action {
    private partService;
    private panelService;
    private outputService;
    static ID: string;
    static LABEL: string;
    constructor(id: string, label: string, partService: IPartService, panelService: IPanelService, outputService: IOutputService);
    run(event?: any): TPromise<any>;
}
export declare class ClearOutputAction extends Action {
    private outputService;
    private panelService;
    constructor(outputService: IOutputService, panelService: IPanelService);
    run(): TPromise<any>;
}
export declare class SwitchOutputAction extends Action {
    private outputService;
    static ID: string;
    constructor(outputService: IOutputService);
    run(channelId?: string): TPromise<any>;
}
export declare class SwitchOutputActionItem extends SelectActionItem {
    private outputService;
    constructor(action: IAction, outputService: IOutputService);
    protected getActionContext(option: string): string;
    private onOutputChannel();
    private static getChannelLabels(outputService);
}
