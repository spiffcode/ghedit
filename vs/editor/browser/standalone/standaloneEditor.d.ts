import './standaloneSchemas';
import 'vs/css!./media/standalone-tokens';
import { IStandaloneCodeEditor, IStandaloneDiffEditor, IEditorConstructionOptions, IDiffEditorConstructionOptions } from 'vs/editor/browser/standalone/standaloneCodeEditor';
import { IEditorOverrideServices } from 'vs/editor/browser/standalone/standaloneServices';
import { IDisposable } from 'vs/base/common/lifecycle';
import URI from 'vs/base/common/uri';
import { TPromise } from 'vs/base/common/winjs.base';
import { IModel } from 'vs/editor/common/editorCommon';
import { IModelService } from 'vs/editor/common/services/modelService';
import { IColorizerElementOptions, IColorizerOptions } from 'vs/editor/browser/standalone/colorizer';
import * as modes from 'vs/editor/common/modes';
import { EditorWorkerClient } from 'vs/editor/common/services/editorWorkerServiceImpl';
import { IMarkerData } from 'vs/platform/markers/common/markers';
/**
 * @internal
 */
export declare function setupServices(services: IEditorOverrideServices): IEditorOverrideServices;
/**
 * Create a new editor under `domElement`.
 * `domElement` should be empty (not contain other dom nodes).
 * The editor will read the size of `domElement`.
 */
export declare function create(domElement: HTMLElement, options?: IEditorConstructionOptions, services?: IEditorOverrideServices): IStandaloneCodeEditor;
/**
 * Create a new diff editor under `domElement`.
 * `domElement` should be empty (not contain other dom nodes).
 * The editor will read the size of `domElement`.
 */
export declare function createDiffEditor(domElement: HTMLElement, options?: IDiffEditorConstructionOptions, services?: IEditorOverrideServices): IStandaloneDiffEditor;
export interface IDiffNavigator {
    canNavigate(): boolean;
    next(): void;
    previous(): void;
    dispose(): void;
}
export interface IDiffNavigatorOptions {
    followsCaret?: boolean;
    ignoreCharChanges?: boolean;
    alwaysRevealFirst?: boolean;
}
export declare function createDiffNavigator(diffEditor: IStandaloneDiffEditor, opts?: IDiffNavigatorOptions): IDiffNavigator;
/**
 * Create a new editor model.
 * You can specify the language that should be set for this model or let the language be inferred from the `uri`.
 */
export declare function createModel(value: string, language?: string, uri?: URI): IModel;
/**
 * Change the language for a model.
 */
export declare function setModelLanguage(model: IModel, language: string): void;
/**
 * Set the markers for a model.
 */
export declare function setModelMarkers(model: IModel, owner: string, markers: IMarkerData[]): void;
/**
 * Get the model that has `uri` if it exists.
 */
export declare function getModel(uri: URI): IModel;
/**
 * Get all the created models.
 */
export declare function getModels(): IModel[];
/**
 * Emitted when a model is created.
 */
export declare function onDidCreateModel(listener: (model: IModel) => void): IDisposable;
/**
 * Emitted right before a model is disposed.
 */
export declare function onWillDisposeModel(listener: (model: IModel) => void): IDisposable;
/**
 * Emitted when a different language is set to a model.
 */
export declare function onDidChangeModelLanguage(listener: (e: {
    model: IModel;
    oldLanguage: string;
}) => void): IDisposable;
/**
 * @internal
 */
export declare function getOrCreateMode(modeId: string): TPromise<modes.IMode>;
/**
 * @internal
 */
export declare function configureMode(modeId: string, options: any): void;
/**
 * A web worker that can provide a proxy to an arbitrary file.
 */
export interface MonacoWebWorker<T> {
    /**
     * Terminate the web worker, thus invalidating the returned proxy.
     */
    dispose(): void;
    /**
     * Get a proxy to the arbitrary loaded code.
     */
    getProxy(): TPromise<T>;
    /**
     * Synchronize (send) the models at `resources` to the web worker,
     * making them available in the monaco.worker.getMirrorModels().
     */
    withSyncedResources(resources: URI[]): TPromise<T>;
}
/**
 * @internal
 */
export declare class MonacoWebWorkerImpl<T> extends EditorWorkerClient implements MonacoWebWorker<T> {
    private _foreignModuleId;
    private _foreignModuleCreateData;
    private _foreignProxy;
    /**
     * @internal
     */
    constructor(modelService: IModelService, opts: IWebWorkerOptions);
    private _getForeignProxy();
    getProxy(): TPromise<T>;
    withSyncedResources(resources: URI[]): TPromise<T>;
}
export interface IWebWorkerOptions {
    /**
     * The AMD moduleId to load.
     * It should export a function `create` that should return the exported proxy.
     */
    moduleId: string;
    /**
     * The data to send over when calling create on the module.
     */
    createData?: any;
}
/**
 * Create a new web worker that has model syncing capabilities built in.
 * Specify an AMD module to load that will `create` an object that will be proxied.
 */
export declare function createWebWorker<T>(opts: IWebWorkerOptions): MonacoWebWorker<T>;
/**
 * Colorize the contents of `domNode` using attribute `data-lang`.
 */
export declare function colorizeElement(domNode: HTMLElement, options: IColorizerElementOptions): TPromise<void>;
/**
 * Colorize `text` using language `languageId`.
 */
export declare function colorize(text: string, languageId: string, options: IColorizerOptions): TPromise<string>;
/**
 * Colorize a line in a model.
 */
export declare function colorizeModelLine(model: IModel, lineNumber: number, tabSize?: number): string;
/**
 * @internal
 */
export declare function createMonacoEditorAPI(): typeof monaco.editor;
