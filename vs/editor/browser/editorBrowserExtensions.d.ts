import { IEditorContributionDescriptor, ISimpleEditorContributionCtor } from 'vs/editor/browser/editorBrowser';
export declare namespace EditorBrowserRegistry {
    function registerEditorContribution(ctor: ISimpleEditorContributionCtor): void;
    function getEditorContributions(): IEditorContributionDescriptor[];
}
