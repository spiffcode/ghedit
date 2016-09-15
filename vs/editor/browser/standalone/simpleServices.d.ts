import { EventEmitter } from 'vs/base/common/eventEmitter';
import Severity from 'vs/base/common/severity';
import URI from 'vs/base/common/uri';
import { TPromise } from 'vs/base/common/winjs.base';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ConfigurationService, IContent, IStat } from 'vs/platform/configuration/common/configurationService';
import { IEditor, IEditorInput, IEditorOptions, IEditorService, IResourceInput, ITextEditorModel, Position } from 'vs/platform/editor/common/editor';
import { AbstractExtensionService, ActivatedExtension } from 'vs/platform/extensions/common/abstractExtensionService';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { ICommandService, ICommandHandler } from 'vs/platform/commands/common/commands';
import { KeybindingService } from 'vs/platform/keybinding/browser/keybindingServiceImpl';
import { IKeybindingItem } from 'vs/platform/keybinding/common/keybinding';
import { IConfirmation, IMessageService } from 'vs/platform/message/common/message';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import * as editorCommon from 'vs/editor/common/editorCommon';
import { ICodeEditor, IDiffEditor } from 'vs/editor/browser/editorBrowser';
import { Selection } from 'vs/editor/common/core/selection';
import { IEventService } from 'vs/platform/event/common/event';
export declare class SimpleEditor implements IEditor {
    input: IEditorInput;
    options: IEditorOptions;
    position: Position;
    _widget: editorCommon.IEditor;
    constructor(editor: editorCommon.IEditor);
    getId(): string;
    getControl(): editorCommon.IEditor;
    getSelection(): Selection;
    focus(): void;
    withTypedEditor<T>(codeEditorCallback: (editor: ICodeEditor) => T, diffEditorCallback: (editor: IDiffEditor) => T): T;
}
export declare class SimpleModel extends EventEmitter implements ITextEditorModel {
    private model;
    constructor(model: editorCommon.IModel);
    textEditorModel: editorCommon.IModel;
}
export interface IOpenEditorDelegate {
    (url: string): boolean;
}
export declare class SimpleEditorService implements IEditorService {
    _serviceBrand: any;
    private editor;
    private openEditorDelegate;
    constructor();
    setEditor(editor: editorCommon.IEditor): void;
    setOpenEditorDelegate(openEditorDelegate: IOpenEditorDelegate): void;
    openEditor(typedData: IResourceInput, sideBySide?: boolean): TPromise<IEditor>;
    private doOpenEditor(editor, data);
    private findModel(editor, data);
    resolveEditorModel(typedData: IResourceInput, refresh?: boolean): TPromise<ITextEditorModel>;
}
export declare class SimpleMessageService implements IMessageService {
    _serviceBrand: any;
    private static Empty;
    show(sev: Severity, message: any): () => void;
    hideAll(): void;
    confirm(confirmation: IConfirmation): boolean;
}
export declare class StandaloneKeybindingService extends KeybindingService {
    private static LAST_GENERATED_ID;
    private _dynamicKeybindings;
    private _dynamicCommands;
    constructor(commandService: ICommandService, configurationService: IConfigurationService, messageService: IMessageService, domNode: HTMLElement);
    addDynamicKeybinding(keybinding: number, handler: ICommandHandler, when: string, commandId?: string): string;
    protected _getExtraKeybindings(isFirstTime: boolean): IKeybindingItem[];
    protected _getCommandHandler(commandId: string): ICommandHandler;
}
export declare class SimpleExtensionService extends AbstractExtensionService<ActivatedExtension> {
    constructor();
    protected _showMessage(severity: Severity, msg: string): void;
    protected _createFailedExtension(): ActivatedExtension;
    protected _actualActivateExtension(extensionDescription: IExtensionDescription): TPromise<ActivatedExtension>;
}
export declare class SimpleConfigurationService extends ConfigurationService {
    constructor(contextService: IWorkspaceContextService, eventService: IEventService);
    protected resolveContents(resources: URI[]): TPromise<IContent[]>;
    protected resolveContent(resource: URI): TPromise<IContent>;
    protected resolveStat(resource: URI): TPromise<IStat>;
    setUserConfiguration(key: any, value: any): Thenable<void>;
}
