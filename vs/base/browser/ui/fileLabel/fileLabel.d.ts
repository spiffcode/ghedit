import 'vs/css!./fileLabel';
import uri from 'vs/base/common/uri';
import { IMatch } from 'vs/base/common/filters';
import { IWorkspaceProvider } from 'vs/base/common/labels';
export declare class FileLabel {
    private domNode;
    private labelNode;
    private directoryNode;
    private basepath;
    private path;
    private labelHighlights;
    constructor(container: HTMLElement, arg2?: uri | string, arg3?: uri | string | IWorkspaceProvider);
    getHTMLElement(): HTMLElement;
    setValue(arg1: uri | string, labelHighlights?: IMatch[]): void;
    private render();
}
