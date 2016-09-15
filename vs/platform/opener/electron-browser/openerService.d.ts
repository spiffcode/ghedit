import URI from 'vs/base/common/uri';
import { TPromise } from 'vs/base/common/winjs.base';
import { IEditorService } from 'vs/platform/editor/common/editor';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IOpenerService } from '../common/opener';
export declare class OpenerService implements IOpenerService {
    private _editorService;
    private _commandService;
    _serviceBrand: any;
    constructor(_editorService: IEditorService, _commandService: ICommandService);
    open(resource: URI): TPromise<any>;
}
