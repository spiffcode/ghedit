import { IHTMLContentElement } from 'vs/base/common/htmlContent';
import { IMode } from 'vs/editor/common/modes';
export declare function tokenizeToHtmlContent(text: string, mode: IMode): IHTMLContentElement;
export declare function tokenizeToString(text: string, mode: IMode, extraTokenClass?: string): string;
