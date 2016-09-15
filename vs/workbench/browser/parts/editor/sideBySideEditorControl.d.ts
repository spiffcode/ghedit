import 'vs/css!./media/sidebyside';
import Event from 'vs/base/common/event';
import { Dimension, Builder } from 'vs/base/browser/builder';
import { Sash, IVerticalSashLayoutProvider } from 'vs/base/browser/ui/sash/sash';
import { ProgressBar } from 'vs/base/browser/ui/progressbar/progressbar';
import { BaseEditor } from 'vs/workbench/browser/parts/editor/baseEditor';
import { IWorkbenchEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { Position } from 'vs/platform/editor/common/editor';
import { IEditorGroupService, GroupArrangement } from 'vs/workbench/services/group/common/groupService';
import { IEventService } from 'vs/platform/event/common/event';
import { IMessageService } from 'vs/platform/message/common/message';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IExtensionService } from 'vs/platform/extensions/common/extensions';
export declare enum Rochade {
    NONE = 0,
    CENTER_TO_LEFT = 1,
    RIGHT_TO_CENTER = 2,
    CENTER_AND_RIGHT_TO_LEFT = 3,
}
export declare enum ProgressState {
    INFINITE = 0,
    DONE = 1,
    STOP = 2,
}
export interface ISideBySideEditorControl {
    onGroupFocusChanged: Event<void>;
    show(editor: BaseEditor, position: Position, preserveActive: boolean, widthRatios?: number[]): void;
    hide(editor: BaseEditor, position: Position, layoutAndRochade: boolean): Rochade;
    setActive(editor: BaseEditor): void;
    getActiveEditor(): BaseEditor;
    getActivePosition(): Position;
    move(from: Position, to: Position): void;
    isDragging(): boolean;
    getInstantiationService(position: Position): IInstantiationService;
    getProgressBar(position: Position): ProgressBar;
    updateProgress(position: Position, state: ProgressState): void;
    layout(dimension: Dimension): void;
    layout(position: Position): void;
    arrangeGroups(arrangement: GroupArrangement): void;
    getWidthRatios(): number[];
    dispose(): void;
}
/**
 * Helper class to manage multiple side by side editors for the editor part.
 */
export declare class SideBySideEditorControl implements ISideBySideEditorControl, IVerticalSashLayoutProvider {
    private editorService;
    private editorGroupService;
    private messageService;
    private telemetryService;
    private contextMenuService;
    private eventService;
    private configurationService;
    private keybindingService;
    private extensionService;
    private instantiationService;
    private static TITLE_AREA_CONTROL_KEY;
    private static PROGRESS_BAR_CONTROL_KEY;
    private static INSTANTIATION_SERVICE_KEY;
    private static MIN_EDITOR_WIDTH;
    private static EDITOR_TITLE_HEIGHT;
    private static SNAP_TO_MINIMIZED_THRESHOLD;
    private stacks;
    private parent;
    private dimension;
    private dragging;
    private silos;
    private siloWidths;
    private siloInitialRatios;
    private leftSash;
    private startLeftContainerWidth;
    private rightSash;
    private startRightContainerWidth;
    private visibleEditors;
    private lastActiveEditor;
    private lastActivePosition;
    private visibleEditorFocusTrackers;
    private _onGroupFocusChanged;
    private onStacksChangeScheduler;
    private stacksChangedBuffer;
    private toDispose;
    constructor(parent: Builder, editorService: IWorkbenchEditorService, editorGroupService: IEditorGroupService, messageService: IMessageService, telemetryService: ITelemetryService, contextMenuService: IContextMenuService, eventService: IEventService, configurationService: IConfigurationService, keybindingService: IKeybindingService, extensionService: IExtensionService, instantiationService: IInstantiationService);
    private registerListeners();
    private onConfigurationUpdated(configuration);
    private onExtensionsReady();
    private onStacksChanged(e);
    private handleStacksChanged();
    onGroupFocusChanged: Event<void>;
    show(editor: BaseEditor, position: Position, preserveActive: boolean, widthRatios?: number[]): void;
    private getVisibleEditorCount();
    private trackFocus(editor, position);
    private onFocusGained(editor);
    setActive(editor: BaseEditor): void;
    private focusNextNonMinimized();
    hide(editor: BaseEditor, position: Position, layoutAndRochade: boolean): Rochade;
    private updateParentStyle();
    private doSetActive(editor, newActive);
    private clearPosition(position);
    private rochade(from, to);
    move(from: Position, to: Position): void;
    arrangeGroups(arrangement: GroupArrangement): void;
    getWidthRatios(): number[];
    getActiveEditor(): BaseEditor;
    getActivePosition(): Position;
    private create(parent);
    private enableDropTarget(node);
    private createTitleControl(context, silo, container, instantiationService);
    private findPosition(element);
    private hookTitleDragListener(titleContainer);
    private findMoveTarget(position, diffX);
    private centerSash(a, b);
    private onLeftSashDragStart();
    private onLeftSashDrag(e);
    private onLeftSashDragEnd();
    private onLeftSashReset();
    private onRightSashDragStart();
    private onRightSashDrag(e);
    private onRightSashDragEnd();
    private onRightSashReset();
    getVerticalSashTop(sash: Sash): number;
    getVerticalSashLeft(sash: Sash): number;
    getVerticalSashHeight(sash: Sash): number;
    isDragging(): boolean;
    layout(dimension: Dimension): void;
    layout(position: Position): void;
    private layoutControl(dimension);
    private layoutContainers();
    private layoutEditor(position);
    getInstantiationService(position: Position): IInstantiationService;
    getProgressBar(position: Position): ProgressBar;
    private getTitleAreaControl(position);
    private getFromContainer(position, key);
    updateProgress(position: Position, state: ProgressState): void;
    dispose(): void;
}
