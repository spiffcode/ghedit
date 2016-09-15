import Event from 'vs/base/common/event';
export interface CancellationToken {
    isCancellationRequested: boolean;
    onCancellationRequested: Event<any>;
}
export declare namespace CancellationToken {
    const None: CancellationToken;
    const Cancelled: CancellationToken;
}
export declare class CancellationTokenSource {
    private _token;
    token: CancellationToken;
    cancel(): void;
    dispose(): void;
}
