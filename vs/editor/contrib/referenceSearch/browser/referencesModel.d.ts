import { EventEmitter } from 'vs/base/common/eventEmitter';
import Event from 'vs/base/common/event';
import URI from 'vs/base/common/uri';
import { TPromise } from 'vs/base/common/winjs.base';
import { IEditorService } from 'vs/platform/editor/common/editor';
import { IModel, IPosition, IRange } from 'vs/editor/common/editorCommon';
import { Location } from 'vs/editor/common/modes';
export declare class OneReference {
    private _parent;
    private _range;
    private _eventBus;
    private _id;
    constructor(_parent: FileReferences, _range: IRange, _eventBus: EventEmitter);
    id: string;
    model: FileReferences;
    parent: FileReferences;
    uri: URI;
    name: string;
    directory: string;
    range: IRange;
}
export declare class FilePreview {
    private _value;
    constructor(_value: IModel);
    preview(range: IRange, n?: number): {
        before: string;
        inside: string;
        after: string;
    };
}
export declare class FileReferences {
    private _parent;
    private _uri;
    private _children;
    private _preview;
    private _resolved;
    private _loadFailure;
    constructor(_parent: ReferencesModel, _uri: URI);
    id: string;
    parent: ReferencesModel;
    children: OneReference[];
    uri: URI;
    name: string;
    directory: string;
    preview: FilePreview;
    failure: any;
    resolve(editorService: IEditorService): TPromise<FileReferences>;
}
export declare class ReferencesModel {
    private _groups;
    private _references;
    private _eventBus;
    onDidChangeReferenceRange: Event<OneReference>;
    constructor(references: Location[]);
    empty: boolean;
    references: OneReference[];
    groups: FileReferences[];
    nextReference(reference: OneReference): OneReference;
    nearestReference(resource: URI, position: IPosition): OneReference;
    private static _compareReferences(a, b);
}
