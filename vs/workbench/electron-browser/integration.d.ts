import { IPartService } from 'vs/workbench/services/part/common/partService';
import { IMessageService } from 'vs/platform/message/common/message';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IWorkspaceContextService } from 'vs/workbench/services/workspace/common/contextService';
import { IWindowService } from 'vs/workbench/services/window/electron-browser/windowService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
export declare class ElectronIntegration {
    private instantiationService;
    private windowService;
    private partService;
    private contextService;
    private telemetryService;
    private configurationService;
    private commandService;
    private keybindingService;
    private messageService;
    private contextMenuService;
    constructor(instantiationService: IInstantiationService, windowService: IWindowService, partService: IPartService, contextService: IWorkspaceContextService, telemetryService: ITelemetryService, configurationService: IConfigurationService, commandService: ICommandService, keybindingService: IKeybindingService, messageService: IMessageService, contextMenuService: IContextMenuService);
    integrate(shellContainer: HTMLElement): void;
    private resolveKeybindings(actionIds);
}
