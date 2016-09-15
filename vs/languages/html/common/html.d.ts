import URI from 'vs/base/common/uri';
import winjs = require('vs/base/common/winjs.base');
import editorCommon = require('vs/editor/common/editorCommon');
import modes = require('vs/editor/common/modes');
import htmlWorker = require('vs/languages/html/common/htmlWorker');
import { CompatMode, ModeWorkerManager } from 'vs/editor/common/modes/abstractMode';
import { AbstractState } from 'vs/editor/common/modes/abstractState';
import { IModeService } from 'vs/editor/common/services/modeService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import * as htmlTokenTypes from 'vs/languages/html/common/htmlTokenTypes';
import { EMPTY_ELEMENTS } from 'vs/languages/html/common/htmlEmptyTagsShared';
import { LanguageConfiguration } from 'vs/editor/common/modes/languageConfigurationRegistry';
import { IEnteringNestedModeData, ILeavingNestedModeData, ITokenizationCustomization } from 'vs/editor/common/modes/supports/tokenizationSupport';
import { ICompatWorkerService } from 'vs/editor/common/services/compatWorkerService';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
export { htmlTokenTypes };
export { EMPTY_ELEMENTS };
export declare enum States {
    Content = 0,
    OpeningStartTag = 1,
    OpeningEndTag = 2,
    WithinDoctype = 3,
    WithinTag = 4,
    WithinComment = 5,
    WithinEmbeddedContent = 6,
    AttributeName = 7,
    AttributeValue = 8,
}
export declare class State extends AbstractState {
    kind: States;
    lastTagName: string;
    lastAttributeName: string;
    embeddedContentType: string;
    attributeValueQuote: string;
    attributeValueLength: number;
    constructor(mode: modes.IMode, kind: States, lastTagName: string, lastAttributeName: string, embeddedContentType: string, attributeValueQuote: string, attributeValueLength: number);
    static escapeTagName(s: string): string;
    makeClone(): State;
    equals(other: modes.IState): boolean;
    private nextElementName(stream);
    private nextAttributeName(stream);
    tokenize(stream: modes.IStream): modes.ITokenizationResult;
    private unquote(value);
}
export declare class HTMLMode<W extends htmlWorker.HTMLWorker> extends CompatMode implements ITokenizationCustomization {
    private workspaceContextService;
    static LANG_CONFIG: LanguageConfiguration;
    tokenizationSupport: modes.ITokenizationSupport;
    configSupport: modes.IConfigurationSupport;
    private modeService;
    private _modeWorkerManager;
    constructor(descriptor: modes.IModeDescriptor, instantiationService: IInstantiationService, modeService: IModeService, compatWorkerService: ICompatWorkerService, workspaceContextService: IWorkspaceContextService);
    protected _registerSupports(): void;
    protected _createModeWorkerManager(descriptor: modes.IModeDescriptor, instantiationService: IInstantiationService): ModeWorkerManager<W>;
    private _worker<T>(runner);
    getInitialState(): modes.IState;
    enterNestedMode(state: modes.IState): boolean;
    getNestedMode(state: modes.IState): IEnteringNestedModeData;
    getLeavingNestedModeData(line: string, state: modes.IState): ILeavingNestedModeData;
    configure(options: any): winjs.TPromise<void>;
    static $_configureWorker: void;
    private _configureWorker(options);
    protected provideLinks(resource: URI): winjs.TPromise<modes.ILink[]>;
    static $_provideLinks: void;
    private _provideLinks(resource, workspaceResource);
    static $_provideDocumentRangeFormattingEdits: void;
    private _provideDocumentRangeFormattingEdits(resource, range, options);
    static $_provideDocumentHighlights: void;
    protected _provideDocumentHighlights(resource: URI, position: editorCommon.IPosition, strict?: boolean): winjs.TPromise<modes.DocumentHighlight[]>;
    static $_provideCompletionItems: void;
    protected _provideCompletionItems(resource: URI, position: editorCommon.IPosition): winjs.TPromise<modes.ISuggestResult[]>;
}
