import { IAction } from 'vs/base/common/actions';
import { IXHRResponse } from 'vs/base/common/http';
import Severity from 'vs/base/common/severity';
import { TPromise } from 'vs/base/common/winjs.base';
export interface ErrorListenerCallback {
    (error: any): void;
}
export interface ErrorListenerUnbind {
    (): void;
}
export declare class ErrorHandler {
    private unexpectedErrorHandler;
    private listeners;
    constructor();
    addListener(listener: ErrorListenerCallback): ErrorListenerUnbind;
    private emit(e);
    private _removeListener(listener);
    setUnexpectedErrorHandler(newUnexpectedErrorHandler: (e: any) => void): void;
    getUnexpectedErrorHandler(): (e: any) => void;
    onUnexpectedError(e: any): void;
}
export declare let errorHandler: ErrorHandler;
export declare function setUnexpectedErrorHandler(newUnexpectedErrorHandler: (e: any) => void): void;
export declare function onUnexpectedError(e: any): void;
export declare function onUnexpectedPromiseError<T>(promise: TPromise<T>): TPromise<T>;
export interface IConnectionErrorData {
    status: number;
    statusText?: string;
    responseText?: string;
}
export declare function transformErrorForSerialization(error: any): any;
/**
 * The base class for all connection errors originating from XHR requests.
 */
export declare class ConnectionError implements Error {
    status: number;
    statusText: string;
    responseText: string;
    errorMessage: string;
    errorCode: string;
    errorObject: any;
    name: string;
    constructor(mixin: IConnectionErrorData);
    constructor(request: IXHRResponse);
    message: string;
    verboseMessage: string;
    private connectionErrorDetailsToMessage(error, verbose);
    private connectionErrorToMessage(error, verbose);
}
/**
 * Tries to generate a human readable error message out of the error. If the verbose parameter
 * is set to true, the error message will include stacktrace details if provided.
 * @returns A string containing the error message.
 */
export declare function toErrorMessage(error?: any, verbose?: boolean): string;
/**
 * Checks if the given error is a promise in canceled state
 */
export declare function isPromiseCanceledError(error: any): boolean;
/**
 * Returns an error that signals cancellation.
 */
export declare function canceled(): Error;
/**
 * Returns an error that signals something is not implemented.
 */
export declare function notImplemented(): Error;
export declare function illegalArgument(name?: string): Error;
export declare function illegalState(name?: string): Error;
export declare function readonly(name?: string): Error;
export declare function loaderError(err: Error): Error;
export interface IErrorOptions {
    severity?: Severity;
    actions?: IAction[];
}
export declare function create(message: string, options?: IErrorOptions): Error;
