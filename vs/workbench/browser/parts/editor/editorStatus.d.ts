import 'vs/css!./media/editorstatus';
import { TPromise } from 'vs/base/common/winjs.base';
import { IStatusbarItem } from 'vs/workbench/browser/parts/statusbar/statusbar';
import { Action } from 'vs/base/common/actions';
import { IDisposable } from 'vs/base/common/lifecycle';
import { IMessageService } from 'vs/platform/message/common/message';
import { EndOfLineSequence } from 'vs/editor/common/editorCommon';
import { IWorkbenchEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IQuickOpenService, IPickOpenEntry } from 'vs/workbench/services/quickopen/common/quickOpenService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEventService } from 'vs/platform/event/common/event';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IModeService } from 'vs/editor/common/services/modeService';
import { IEditorGroupService } from 'vs/workbench/services/group/common/groupService';
export declare class EditorStatus implements IStatusbarItem {
    private editorService;
    private editorGroupService;
    private quickOpenService;
    private instantiationService;
    private eventService;
    private modeService;
    private configurationService;
    private state;
    private element;
    private tabFocusModeElement;
    private indentationElement;
    private selectionElement;
    private encodingElement;
    private eolElement;
    private modeElement;
    private toDispose;
    private activeEditorListeners;
    private delayedRender;
    private toRender;
    constructor(editorService: IWorkbenchEditorService, editorGroupService: IEditorGroupService, quickOpenService: IQuickOpenService, instantiationService: IInstantiationService, eventService: IEventService, modeService: IModeService, configurationService: IConfigurationService);
    render(container: HTMLElement): IDisposable;
    private updateState(update);
    private _renderNow(changed);
    private getSelectionLabel(info);
    private onModeClick();
    private onIndentationClick();
    private onSelectionClick();
    private onEOLClick();
    private onEncodingClick();
    private onTabFocusModeClick();
    private onEditorsChanged();
    private onModeChange(editorWidget?);
    private onIndentationChange(editorWidget?);
    private onSelectionChange(editorWidget?);
    private onEOLChange(editorWidget?);
    private onEncodingChange(e);
    private onResourceEncodingChange(resource);
    private onTabFocusModeChange();
    private isActiveEditor(e);
}
export declare class ChangeModeAction extends Action {
    private modeService;
    private editorService;
    private messageService;
    private instantiationService;
    private quickOpenService;
    static ID: string;
    static LABEL: string;
    constructor(actionId: string, actionLabel: string, modeService: IModeService, editorService: IWorkbenchEditorService, messageService: IMessageService, instantiationService: IInstantiationService, quickOpenService: IQuickOpenService);
    run(): TPromise<any>;
}
export interface IChangeEOLEntry extends IPickOpenEntry {
    eol: EndOfLineSequence;
}
export declare class ChangeEOLAction extends Action {
    private editorService;
    private quickOpenService;
    static ID: string;
    static LABEL: string;
    constructor(actionId: string, actionLabel: string, editorService: IWorkbenchEditorService, quickOpenService: IQuickOpenService);
    run(): TPromise<any>;
}
export declare class ChangeEncodingAction extends Action {
    private editorService;
    private quickOpenService;
    private configurationService;
    static ID: string;
    static LABEL: string;
    constructor(actionId: string, actionLabel: string, editorService: IWorkbenchEditorService, quickOpenService: IQuickOpenService, configurationService: IConfigurationService);
    run(): TPromise<any>;
}
