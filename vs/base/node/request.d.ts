import { TPromise } from 'vs/base/common/winjs.base';
import http = require('http');
import { Stream } from 'stream';
export interface IRequestOptions {
    type?: string;
    url?: string;
    user?: string;
    password?: string;
    headers?: any;
    timeout?: number;
    data?: any;
    agent?: any;
    followRedirects?: number;
    strictSSL?: boolean;
}
export interface IRequestResult {
    req: http.ClientRequest;
    res: http.ClientResponse;
    stream: Stream;
}
export declare function request(options: IRequestOptions): TPromise<IRequestResult>;
export declare function download(filePath: string, opts: IRequestOptions): TPromise<void>;
export declare function text(opts: IRequestOptions): TPromise<string>;
export declare function json<T>(opts: IRequestOptions): TPromise<T>;
