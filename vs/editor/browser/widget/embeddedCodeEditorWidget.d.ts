import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { ICodeEditorWidgetCreationOptions, IEditorOptions } from 'vs/editor/common/editorCommon';
import { ICodeEditorService } from 'vs/editor/common/services/codeEditorService';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';
export declare class EmbeddedCodeEditorWidget extends CodeEditorWidget {
    private _parentEditor;
    private _overwriteOptions;
    constructor(domElement: HTMLElement, options: ICodeEditorWidgetCreationOptions, parentEditor: ICodeEditor, instantiationService: IInstantiationService, codeEditorService: ICodeEditorService, commandService: ICommandService, keybindingService: IKeybindingService, telemetryService: ITelemetryService);
    getParentEditor(): ICodeEditor;
    private _onParentConfigurationChanged(e);
    updateOptions(newOptions: IEditorOptions): void;
}
