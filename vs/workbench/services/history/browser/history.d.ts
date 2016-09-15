import { IEditor as IBaseEditor } from 'vs/platform/editor/common/editor';
import { IWorkbenchEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IHistoryService } from 'vs/workbench/services/history/common/history';
import { Selection } from 'vs/editor/common/core/selection';
import { IEditorInput } from 'vs/platform/editor/common/editor';
import { IEventService } from 'vs/platform/event/common/event';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IDisposable } from 'vs/base/common/lifecycle';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ILifecycleService } from 'vs/platform/lifecycle/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IEditorGroupService } from 'vs/workbench/services/group/common/groupService';
/**
 * Stores the selection & view state of an editor and allows to compare it to other selection states.
 */
export declare class EditorState {
    private _editorInput;
    private _selection;
    private static EDITOR_SELECTION_THRESHOLD;
    constructor(_editorInput: IEditorInput, _selection: Selection);
    editorInput: IEditorInput;
    selection: Selection;
    justifiesNewPushState(other: EditorState): boolean;
}
export declare abstract class BaseHistoryService {
    private eventService;
    protected editorGroupService: IEditorGroupService;
    protected editorService: IWorkbenchEditorService;
    protected contextService: IWorkspaceContextService;
    protected toUnbind: IDisposable[];
    private activeEditorListeners;
    constructor(eventService: IEventService, editorGroupService: IEditorGroupService, editorService: IWorkbenchEditorService, contextService: IWorkspaceContextService);
    private onEditorsChanged();
    private onEditorEvent(editor);
    private updateWindowTitle(input?);
    protected abstract handleEditorSelectionChangeEvent(editor?: IBaseEditor): void;
    protected abstract handleActiveEditorChange(editor?: IBaseEditor): void;
    protected getWindowTitle(input?: IEditorInput): string;
    private doGetWindowTitle(input?);
    dispose(): void;
}
export declare class HistoryService extends BaseHistoryService implements IHistoryService {
    private storageService;
    private lifecycleService;
    private instantiationService;
    _serviceBrand: any;
    private static STORAGE_KEY;
    private static MAX_HISTORY_ITEMS;
    private static MAX_STACK_ITEMS;
    private static MAX_RECENTLY_CLOSED_EDITORS;
    private stack;
    private index;
    private blockStackChanges;
    private currentFileEditorState;
    private history;
    private recentlyClosed;
    private loaded;
    private registry;
    constructor(eventService: IEventService, editorService: IWorkbenchEditorService, editorGroupService: IEditorGroupService, contextService: IWorkspaceContextService, storageService: IStorageService, lifecycleService: ILifecycleService, instantiationService: IInstantiationService);
    private registerListeners();
    private onEditorClosed(event);
    popLastClosedEditor(): IEditorInput;
    forward(): void;
    back(): void;
    clear(): void;
    private navigate();
    protected handleEditorSelectionChangeEvent(editor?: IBaseEditor): void;
    protected handleActiveEditorChange(editor?: IBaseEditor): void;
    private handleEditorEventInHistory(editor?);
    private restoreInHistory(input);
    remove(input: IEditorInput): void;
    private removeFromHistory(input, index?);
    private indexOf(input);
    private handleEditorEventInStack(editor, storeSelection);
    private handleTextEditorEvent(editor, storeSelection);
    private handleNonTextEditorEvent(editor);
    private addToStack(input, options?);
    private restoreInStack(input);
    private restoreInRecentlyClosed(input);
    private restoreInput(input);
    private removeFromStack(input);
    private removeFromRecentlyClosed(input);
    getHistory(): IEditorInput[];
    private ensureLoaded();
    private save();
    private load();
}
