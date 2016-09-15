import { Promise } from 'vs/base/common/winjs.base';
import { IDataSource, ITree, IRenderer, IAccessibilityProvider } from 'vs/base/parts/tree/browser/tree';
import { IActionRunner } from 'vs/base/common/actions';
import { IWorkspaceContextService } from 'vs/workbench/services/workspace/common/contextService';
import { ActionProvider } from 'vs/workbench/parts/markers/browser/markersActionProvider';
export declare class DataSource implements IDataSource {
    getId(tree: ITree, element: any): string;
    hasChildren(tree: ITree, element: any): boolean;
    getChildren(tree: ITree, element: any): Promise;
    getParent(tree: ITree, element: any): Promise;
}
export declare class Renderer implements IRenderer {
    private actionRunner;
    private actionProvider;
    private contextService;
    private static RESOURCE_TEMPLATE_ID;
    private static MARKER_TEMPLATE_ID;
    constructor(actionRunner: IActionRunner, actionProvider: ActionProvider, contextService: IWorkspaceContextService);
    getHeight(tree: ITree, element: any): number;
    getTemplateId(tree: ITree, element: any): string;
    renderTemplate(tree: ITree, templateId: string, container: HTMLElement): any;
    private renderResourceTemplate(container);
    private renderMarkerTemplate(container);
    renderElement(tree: ITree, element: any, templateId: string, templateData: any): void;
    private renderResourceElement(tree, element, templateData);
    private renderMarkerElement(tree, element, templateData);
    private static iconClassNameFor(element);
    disposeTemplate(tree: ITree, templateId: string, templateData: any): void;
}
export declare class MarkersTreeAccessibilityProvider implements IAccessibilityProvider {
    getAriaLabel(tree: ITree, element: any): string;
}
