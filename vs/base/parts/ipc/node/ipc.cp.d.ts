import { IDisposable } from 'vs/base/common/lifecycle';
import { Promise } from 'vs/base/common/winjs.base';
import { Server as IPCServer, IClient, IChannel } from 'vs/base/parts/ipc/common/ipc';
export declare class Server extends IPCServer {
    constructor();
}
export interface IIPCOptions {
    /**
     * A descriptive name for the server this connection is to. Used in logging.
     */
    serverName: string;
    /**
     * Time in millies before killing the ipc process. The next request after killing will start it again.
     */
    timeout?: number;
    /**
     * Arguments to the module to execute.
     */
    args?: string[];
    /**
     * Environment key-value pairs to be passed to the process that gets spawned for the ipc.
     */
    env?: any;
    /**
     * Allows to assign a debug port for debugging the application executed.
     */
    debug?: number;
    /**
     * Allows to assign a debug port for debugging the application and breaking it on the first line.
     */
    debugBrk?: number;
}
export declare class Client implements IClient, IDisposable {
    private modulePath;
    private options;
    private disposeDelayer;
    private activeRequests;
    private child;
    private _client;
    private channels;
    constructor(modulePath: string, options: IIPCOptions);
    getChannel<T extends IChannel>(channelName: string): T;
    protected request(channelName: string, name: string, arg: any): Promise;
    private client;
    private disposeClient();
    dispose(): void;
}
