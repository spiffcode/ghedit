import { Socket, Server as NetServer } from 'net';
import { TPromise } from 'vs/base/common/winjs.base';
import { IDisposable } from 'vs/base/common/lifecycle';
import Event from 'vs/base/common/event';
import { IServer, IClient, IChannel } from 'vs/base/parts/ipc/common/ipc';
export declare class Server implements IServer, IDisposable {
    private server;
    private channels;
    constructor(server: NetServer);
    registerChannel(channelName: string, channel: IChannel): void;
    dispose(): void;
}
export declare class Client implements IClient, IDisposable {
    private socket;
    private ipcClient;
    private _onClose;
    onClose: Event<void>;
    constructor(socket: Socket);
    getChannel<T extends IChannel>(channelName: string): T;
    dispose(): void;
}
export declare function serve(port: number): TPromise<Server>;
export declare function serve(namedPipe: string): TPromise<Server>;
export declare function connect(port: number): TPromise<Client>;
export declare function connect(namedPipe: string): TPromise<Client>;
