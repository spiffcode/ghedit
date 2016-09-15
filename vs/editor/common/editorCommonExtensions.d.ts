import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindings, KbExpr } from 'vs/platform/keybinding/common/keybinding';
import { ICommandHandler } from 'vs/platform/commands/common/commands';
import { Position } from 'vs/editor/common/core/position';
import * as editorCommon from 'vs/editor/common/editorCommon';
import { MenuId } from 'vs/platform/actions/common/actions';
export declare enum ContextKey {
    None = 0,
    EditorTextFocus = 1,
    EditorFocus = 2,
}
export interface IEditorActionKeybindingOptions extends IKeybindings {
    handler?: ICommandHandler;
    context: ContextKey;
    kbExpr?: KbExpr;
}
export interface IEditorCommandKeybindingOptions extends IKeybindings {
    context: ContextKey;
}
export interface IEditorCommandMenuOptions {
    kbExpr: KbExpr;
    menu?: MenuId;
    group?: string;
    order?: number;
}
export declare class EditorActionDescriptor {
    ctor: editorCommon.IEditorActionContributionCtor;
    id: string;
    label: string;
    alias: string;
    kbOpts: IEditorActionKeybindingOptions;
    menuOpts: IEditorCommandMenuOptions;
    constructor(ctor: editorCommon.IEditorActionContributionCtor, id: string, label: string, kbOpts?: IEditorActionKeybindingOptions, alias?: string);
}
export interface IEditorCommandHandler {
    (accessor: ServicesAccessor, editor: editorCommon.ICommonCodeEditor, args: any): void;
}
export declare module CommonEditorRegistry {
    function registerEditorAction(desc: EditorActionDescriptor): void;
    function registerEditorContribution(ctor: editorCommon.ICommonEditorContributionCtor): void;
    function getEditorContributions(): editorCommon.ICommonEditorContributionDescriptor[];
    function commandWeight(importance?: number): number;
    function registerEditorCommand(commandId: string, weight: number, keybinding: IKeybindings, needsTextFocus: boolean, needsKey: string, handler: IEditorCommandHandler): void;
    function registerLanguageCommand(id: string, handler: (accessor: ServicesAccessor, args: {
        [n: string]: any;
    }) => any): void;
    function registerDefaultLanguageCommand(id: string, handler: (model: editorCommon.IModel, position: Position, args: {
        [n: string]: any;
    }) => any): void;
}
export declare var defaultEditorActionKeybindingOptions: IEditorActionKeybindingOptions;
