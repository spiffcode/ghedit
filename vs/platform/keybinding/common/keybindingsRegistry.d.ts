import { IKeybindingItem, IKeybindings, KbExpr } from 'vs/platform/keybinding/common/keybinding';
import { ICommandHandler, ICommandHandlerDescription } from 'vs/platform/commands/common/commands';
export interface ICommandRule extends IKeybindings {
    id: string;
    weight: number;
    when: KbExpr;
}
export interface ICommandDescriptor extends ICommandRule {
    handler: ICommandHandler;
    description?: ICommandHandlerDescription;
}
export interface IKeybindingsRegistry {
    registerCommandRule(rule: ICommandRule): any;
    registerCommandDesc(desc: ICommandDescriptor): void;
    getDefaultKeybindings(): IKeybindingItem[];
    WEIGHT: {
        editorCore(importance?: number): number;
        editorContrib(importance?: number): number;
        workbenchContrib(importance?: number): number;
        builtinExtension(importance?: number): number;
        externalExtension(importance?: number): number;
    };
}
export declare let KeybindingsRegistry: IKeybindingsRegistry;
export declare let Extensions: {
    EditorModes: string;
};
