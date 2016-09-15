import { TPromise } from 'vs/base/common/winjs.base';
import { IReadOnlyModel } from 'vs/editor/common/editorCommon';
import { ILink } from 'vs/editor/common/modes';
export declare function getLinks(model: IReadOnlyModel): TPromise<ILink[]>;
