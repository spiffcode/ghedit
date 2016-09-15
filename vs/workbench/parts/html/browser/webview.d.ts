import URI from 'vs/base/common/uri';
export default class Webview {
    private _parent;
    private _styleElement;
    private _webview;
    private _ready;
    private _disposables;
    constructor(_parent: HTMLElement, _styleElement: Element, onDidClickLink: (uri: URI) => any);
    dispose(): void;
    private _send(channel, ...args);
    contents: string[];
    baseUrl: string;
    focus(): void;
    style(themeId: string): void;
}
