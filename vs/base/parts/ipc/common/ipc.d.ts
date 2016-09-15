import { TPromise } from 'vs/base/common/winjs.base';
import Event from 'vs/base/common/event';
export interface IMessagePassingProtocol {
    send(request: any): void;
    onMessage(callback: (response: any) => void): void;
}
export interface IChannel {
    call(command: string, arg: any): TPromise<any>;
}
export interface IServer {
    registerChannel(channelName: string, channel: IChannel): void;
}
export interface IClient {
    getChannel<T extends IChannel>(channelName: string): T;
}
export declare class Server {
    private protocol;
    private channels;
    private activeRequests;
    constructor(protocol: IMessagePassingProtocol);
    registerChannel(channelName: string, channel: IChannel): void;
    private onMessage(request);
    private onCommonRequest(request);
    private onCancelRequest(request);
    dispose(): void;
}
export declare class Client implements IClient {
    private protocol;
    private state;
    private bufferedRequests;
    private handlers;
    private lastRequestId;
    constructor(protocol: IMessagePassingProtocol);
    getChannel<T extends IChannel>(channelName: string): T;
    private request(channelName, name, arg);
    private doRequest(request);
    private bufferRequest(request);
    private onMessage(response);
    private send(raw);
}
export declare function getDelayedChannel<T extends IChannel>(promise: TPromise<IChannel>): T;
export declare function getNextTickChannel<T extends IChannel>(channel: T): T;
export declare function eventToCall(event: Event<any>): TPromise<any>;
export declare function eventFromCall<T>(channel: IChannel, name: string): Event<T>;
