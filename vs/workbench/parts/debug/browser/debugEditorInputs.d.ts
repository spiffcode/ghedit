import strinput = require('vs/workbench/common/editor/stringEditorInput');
import uri from 'vs/base/common/uri';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
export declare class DebugStringEditorInput extends strinput.StringEditorInput {
    private resourceUrl;
    constructor(name: string, resourceUrl: uri, description: string, value: string, mimeType: string, singleton: boolean, instantiationService: IInstantiationService);
    getResource(): uri;
}
