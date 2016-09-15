import { IHTMLContentElement } from 'vs/base/common/htmlContent';
import { Keybinding } from 'vs/base/common/keyCodes';
import { IEventService } from 'vs/platform/event/common/event';
import { KeybindingService } from 'vs/platform/keybinding/browser/keybindingServiceImpl';
import { IStatusbarService } from 'vs/platform/statusbar/common/statusbar';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IKeybindingItem } from 'vs/platform/keybinding/common/keybinding';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IMessageService } from 'vs/platform/message/common/message';
export declare class WorkbenchKeybindingService extends KeybindingService {
    private contextService;
    private eventService;
    private telemetryService;
    private toDispose;
    constructor(domNode: HTMLElement, commandService: ICommandService, configurationService: IConfigurationService, contextService: IWorkspaceContextService, eventService: IEventService, telemetryService: ITelemetryService, messageService: IMessageService, statusBarService: IStatusbarService);
    customKeybindingsCount(): number;
    protected _getExtraKeybindings(isFirstTime: boolean): IKeybindingItem[];
    private onOptionsChanged(e);
    dispose(): void;
    getLabelFor(keybinding: Keybinding): string;
    getHTMLLabelFor(keybinding: Keybinding): IHTMLContentElement[];
    getAriaLabelFor(keybinding: Keybinding): string;
    getElectronAcceleratorFor(keybinding: Keybinding): string;
    private _handleKeybindingsExtensionPointUser(isBuiltin, keybindings, collector);
    private _handleKeybinding(isBuiltin, idx, keybindings, collector);
    private _asCommandRule(isBuiltin, idx, binding);
}
