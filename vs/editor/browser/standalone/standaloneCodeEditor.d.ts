import { IDisposable } from 'vs/base/common/lifecycle';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IKeybindingContextKey, IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ICommandHandler } from 'vs/platform/commands/common/commands';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IActionDescriptor, ICodeEditorWidgetCreationOptions, IDiffEditorOptions, IModel } from 'vs/editor/common/editorCommon';
import { ICodeEditorService } from 'vs/editor/common/services/codeEditorService';
import { IEditorWorkerService } from 'vs/editor/common/services/editorWorkerService';
import { IEditorOverrideServices } from 'vs/editor/browser/standalone/standaloneServices';
import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';
import { DiffEditorWidget } from 'vs/editor/browser/widget/diffEditorWidget';
import { ICodeEditor, IDiffEditor } from 'vs/editor/browser/editorBrowser';
/**
 * The options to create an editor.
 */
export interface IEditorConstructionOptions extends ICodeEditorWidgetCreationOptions {
    /**
     * The initial value of the auto created model in the editor.
     * To not create automatically a model, use `model: null`.
     */
    value?: string;
    /**
     * The initial language of the auto created model in the editor.
     * To not create automatically a model, use `model: null`.
     */
    language?: string;
}
/**
 * The options to create a diff editor.
 */
export interface IDiffEditorConstructionOptions extends IDiffEditorOptions {
}
export interface IStandaloneCodeEditor extends ICodeEditor {
    addCommand(keybinding: number, handler: ICommandHandler, context: string): string;
    createContextKey<T>(key: string, defaultValue: T): IKeybindingContextKey<T>;
    addAction(descriptor: IActionDescriptor): void;
}
export interface IStandaloneDiffEditor extends IDiffEditor {
    addCommand(keybinding: number, handler: ICommandHandler, context: string): string;
    createContextKey<T>(key: string, defaultValue: T): IKeybindingContextKey<T>;
    addAction(descriptor: IActionDescriptor): void;
}
export declare class StandaloneEditor extends CodeEditorWidget implements IStandaloneCodeEditor {
    private _standaloneKeybindingService;
    private _contextViewService;
    private _ownsModel;
    private _toDispose2;
    constructor(domElement: HTMLElement, options: IEditorConstructionOptions, toDispose: IDisposable[], instantiationService: IInstantiationService, codeEditorService: ICodeEditorService, commandService: ICommandService, keybindingService: IKeybindingService, telemetryService: ITelemetryService, contextViewService: IContextViewService);
    dispose(): void;
    destroy(): void;
    addCommand(keybinding: number, handler: ICommandHandler, context: string): string;
    createContextKey<T>(key: string, defaultValue: T): IKeybindingContextKey<T>;
    addAction(descriptor: IActionDescriptor): void;
    _attachModel(model: IModel): void;
    _postDetachModelCleanup(detachedModel: IModel): void;
}
export declare class StandaloneDiffEditor extends DiffEditorWidget implements IStandaloneDiffEditor {
    private _contextViewService;
    private _standaloneKeybindingService;
    private _toDispose2;
    constructor(domElement: HTMLElement, options: IDiffEditorConstructionOptions, toDispose: IDisposable[], instantiationService: IInstantiationService, keybindingService: IKeybindingService, contextViewService: IContextViewService, editorWorkerService: IEditorWorkerService);
    dispose(): void;
    destroy(): void;
    addCommand(keybinding: number, handler: ICommandHandler, context: string): string;
    createContextKey<T>(key: string, defaultValue: T): IKeybindingContextKey<T>;
    addAction(descriptor: IActionDescriptor): void;
}
export declare var startup: {
    initStaticServicesIfNecessary: () => void;
    setupServices: (services: IEditorOverrideServices) => IEditorOverrideServices;
};
