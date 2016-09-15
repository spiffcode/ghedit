import { TPromise } from 'vs/base/common/winjs.base';
import { IThreadService } from 'vs/workbench/services/thread/common/threadService';
import { QuickPickOptions, QuickPickItem, InputBoxOptions } from 'vscode';
import { ExtHostQuickOpenShape } from './extHost.protocol';
export declare type Item = string | QuickPickItem;
export declare class ExtHostQuickOpen extends ExtHostQuickOpenShape {
    private _proxy;
    private _onDidSelectItem;
    private _validateInput;
    constructor(threadService: IThreadService);
    show(itemsOrItemsPromise: Item[] | Thenable<Item[]>, options?: QuickPickOptions): Thenable<Item>;
    $onItemSelected(handle: number): void;
    input(options?: InputBoxOptions): Thenable<string>;
    $validateInput(input: string): TPromise<string>;
}
