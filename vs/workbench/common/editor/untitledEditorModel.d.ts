import { TPromise } from 'vs/base/common/winjs.base';
import { EditorModel, IEncodingSupport } from 'vs/workbench/common/editor';
import { StringEditorModel } from 'vs/workbench/common/editor/stringEditorModel';
import URI from 'vs/base/common/uri';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEventService } from 'vs/platform/event/common/event';
import { IModeService } from 'vs/editor/common/services/modeService';
import { IModelService } from 'vs/editor/common/services/modelService';
export declare class UntitledEditorModel extends StringEditorModel implements IEncodingSupport {
    private eventService;
    private configurationService;
    private textModelChangeListener;
    private configurationChangeListener;
    private dirty;
    private configuredEncoding;
    private preferredEncoding;
    constructor(value: string, modeId: string, resource: URI, hasAssociatedFilePath: boolean, modeService: IModeService, modelService: IModelService, eventService: IEventService, configurationService: IConfigurationService);
    private registerListeners();
    private onConfigurationChange(configuration);
    getValue(): string;
    getModeId(): string;
    getEncoding(): string;
    setEncoding(encoding: string): void;
    isDirty(): boolean;
    revert(): void;
    load(): TPromise<EditorModel>;
    private onModelContentChanged();
    dispose(): void;
}
