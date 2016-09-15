import 'vs/css!./gitlessView';
import winjs = require('vs/base/common/winjs.base');
import ee = require('vs/base/common/eventEmitter');
import view = require('vs/workbench/parts/git/browser/views/view');
import builder = require('vs/base/browser/builder');
import actions = require('vs/base/common/actions');
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
export declare class GitlessView extends ee.EventEmitter implements view.IView {
    ID: string;
    private _element;
    private _contextService;
    constructor(contextService: IWorkspaceContextService);
    element: HTMLElement;
    private render();
    focus(): void;
    layout(dimension: builder.Dimension): void;
    setVisible(visible: boolean): winjs.TPromise<void>;
    getControl(): ee.IEventEmitter;
    getActions(): actions.IAction[];
    getSecondaryActions(): actions.IAction[];
}
