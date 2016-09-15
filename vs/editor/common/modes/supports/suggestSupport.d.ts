import { IReadOnlyModel } from 'vs/editor/common/editorCommon';
import { ISuggestResult, ISuggestSupport } from 'vs/editor/common/modes';
import { IFilter } from 'vs/base/common/filters';
import { IEditorWorkerService } from 'vs/editor/common/services/editorWorkerService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { CancellationToken } from 'vs/base/common/cancellation';
import { Position } from 'vs/editor/common/core/position';
export declare class TextualSuggestSupport implements ISuggestSupport {
    triggerCharacters: string[];
    filter: IFilter;
    private _editorWorkerService;
    private _configurationService;
    constructor(editorWorkerService: IEditorWorkerService, configurationService: IConfigurationService);
    provideCompletionItems(model: IReadOnlyModel, position: Position, token: CancellationToken): ISuggestResult[] | Thenable<ISuggestResult[]>;
}
export declare function filterSuggestions(value: ISuggestResult): ISuggestResult[];
