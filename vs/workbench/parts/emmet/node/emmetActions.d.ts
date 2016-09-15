/// <reference path="emmet.d.ts" />
import { TPromise } from 'vs/base/common/winjs.base';
import { IEditorActionDescriptorData, ICommonCodeEditor } from 'vs/editor/common/editorCommon';
import { EditorAction } from 'vs/editor/common/editorAction';
import { EditorAccessor } from 'vs/workbench/parts/emmet/node/editorAccessor';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import * as emmet from 'emmet';
export declare abstract class EmmetEditorAction extends EditorAction {
    protected editorAccessor: EditorAccessor;
    private configurationService;
    constructor(descriptor: IEditorActionDescriptorData, editor: ICommonCodeEditor, configurationService: IConfigurationService);
    private updateEmmetPreferences(_emmet);
    private resetEmmetPreferences(_emmet);
    abstract runEmmetAction(_emmet: typeof emmet): any;
    protected noExpansionOccurred(): void;
    run(): TPromise<boolean>;
    private _withEmmet();
    private _withEmmetPreferences(_emmet, callback);
}
export declare class BasicEmmetEditorAction extends EmmetEditorAction {
    private emmetActionName;
    constructor(descriptor: IEditorActionDescriptorData, editor: ICommonCodeEditor, configurationService: IConfigurationService, actionName: string);
    runEmmetAction(_emmet: typeof emmet): void;
}
