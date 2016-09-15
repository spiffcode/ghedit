import uri from 'vs/base/common/uri';
export interface ILabelProvider {
    /**
     * Given an element returns a label for it to display in the UI.
     */
    getLabel(element: any): string;
}
export interface IWorkspaceProvider {
    getWorkspace(): {
        resource: uri;
    };
}
export declare class PathLabelProvider implements ILabelProvider {
    private root;
    constructor(arg1?: uri | string | IWorkspaceProvider);
    getLabel(arg1: uri | string | IWorkspaceProvider): string;
}
export declare function getPathLabel(arg1: uri | string, arg2?: uri | string | IWorkspaceProvider): string;
