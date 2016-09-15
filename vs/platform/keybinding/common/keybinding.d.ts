import { IHTMLContentElement } from 'vs/base/common/htmlContent';
import { Keybinding } from 'vs/base/common/keyCodes';
import Event from 'vs/base/common/event';
export interface IUserFriendlyKeybinding {
    key: string;
    command: string;
    when?: string;
}
export interface IKeybindings {
    primary: number;
    secondary?: number[];
    win?: {
        primary: number;
        secondary?: number[];
    };
    linux?: {
        primary: number;
        secondary?: number[];
    };
    mac?: {
        primary: number;
        secondary?: number[];
    };
}
export declare enum KbExprType {
    KbDefinedExpression = 1,
    KbNotExpression = 2,
    KbEqualsExpression = 3,
    KbNotEqualsExpression = 4,
    KbAndExpression = 5,
}
export interface KbExpr {
    getType(): KbExprType;
    equals(other: KbExpr): boolean;
    evaluate(context: any): boolean;
    normalize(): KbExpr;
    serialize(): string;
    keys(): string[];
}
export declare class KbDefinedExpression implements KbExpr {
    private key;
    constructor(key: string);
    getType(): KbExprType;
    cmp(other: KbDefinedExpression): number;
    equals(other: KbExpr): boolean;
    evaluate(context: any): boolean;
    normalize(): KbExpr;
    serialize(): string;
    keys(): string[];
}
export declare class KbEqualsExpression implements KbExpr {
    private key;
    private value;
    constructor(key: string, value: any);
    getType(): KbExprType;
    cmp(other: KbEqualsExpression): number;
    equals(other: KbExpr): boolean;
    evaluate(context: any): boolean;
    normalize(): KbExpr;
    serialize(): string;
    keys(): string[];
}
export declare class KbNotEqualsExpression implements KbExpr {
    private key;
    private value;
    constructor(key: string, value: any);
    getType(): KbExprType;
    cmp(other: KbNotEqualsExpression): number;
    equals(other: KbExpr): boolean;
    evaluate(context: any): boolean;
    normalize(): KbExpr;
    serialize(): string;
    keys(): string[];
}
export declare class KbNotExpression implements KbExpr {
    private key;
    constructor(key: string);
    getType(): KbExprType;
    cmp(other: KbNotExpression): number;
    equals(other: KbExpr): boolean;
    evaluate(context: any): boolean;
    normalize(): KbExpr;
    serialize(): string;
    keys(): string[];
}
export declare class KbAndExpression implements KbExpr {
    private expr;
    constructor(expr: KbExpr[]);
    getType(): KbExprType;
    equals(other: KbExpr): boolean;
    evaluate(context: any): boolean;
    private static _normalizeArr(arr);
    normalize(): KbExpr;
    serialize(): string;
    keys(): string[];
}
export declare let KbExpr: {
    has: (key: string) => KbDefinedExpression;
    equals: (key: string, value: any) => KbEqualsExpression;
    notEquals: (key: string, value: any) => KbNotEqualsExpression;
    not: (key: string) => KbNotExpression;
    and: (...expr: KbExpr[]) => KbAndExpression;
    deserialize: (serialized: string) => KbExpr;
    _deserializeOne: (serializedOne: string) => KbExpr;
    _deserializeValue: (serializedValue: string) => any;
};
export interface IKeybindingItem {
    keybinding: number;
    command: string;
    when: KbExpr;
    weight1: number;
    weight2: number;
}
export interface IKeybindingContextKey<T> {
    set(value: T): void;
    reset(): void;
}
export declare let IKeybindingService: {
    (...args: any[]): void;
    type: IKeybindingService;
};
export interface IKeybindingScopeLocation {
    setAttribute(attr: string, value: string): void;
    removeAttribute(attr: string): void;
}
export interface IKeybindingService {
    _serviceBrand: any;
    dispose(): void;
    onDidChangeContext: Event<string[]>;
    createKey<T>(key: string, defaultValue: T): IKeybindingContextKey<T>;
    contextMatchesRules(rules: KbExpr): boolean;
    getContextValue<T>(key: string): T;
    createScoped(domNode: IKeybindingScopeLocation): IKeybindingService;
    getDefaultKeybindings(): string;
    lookupKeybindings(commandId: string): Keybinding[];
    customKeybindingsCount(): number;
    getLabelFor(keybinding: Keybinding): string;
    getAriaLabelFor(keybinding: Keybinding): string;
    getHTMLLabelFor(keybinding: Keybinding): IHTMLContentElement[];
    getElectronAcceleratorFor(keybinding: Keybinding): string;
}
export declare const SET_CONTEXT_COMMAND_ID: string;
