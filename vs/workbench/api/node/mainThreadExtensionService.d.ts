import Severity from 'vs/base/common/severity';
import { TPromise } from 'vs/base/common/winjs.base';
import { AbstractExtensionService, ActivatedExtension } from 'vs/platform/extensions/common/abstractExtensionService';
import { IMessage, IExtensionDescription, IExtensionsStatus } from 'vs/platform/extensions/common/extensions';
import { IMessageService } from 'vs/platform/message/common/message';
import { IThreadService } from 'vs/workbench/services/thread/common/threadService';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
export declare class MainProcessExtensionService extends AbstractExtensionService<ActivatedExtension> {
    private _threadService;
    private _messageService;
    private _proxy;
    private _isDev;
    private _extensionsStatus;
    /**
     * This class is constructed manually because it is a service, so it doesn't use any ctor injection
     */
    constructor(contextService: IWorkspaceContextService, threadService: IThreadService, messageService: IMessageService);
    private _handleMessage(msg);
    $localShowMessage(severity: Severity, msg: string): void;
    getExtensionsStatus(): {
        [id: string]: IExtensionsStatus;
    };
    protected _showMessage(severity: Severity, msg: string): void;
    protected _createFailedExtension(): ActivatedExtension;
    protected _actualActivateExtension(extensionDescription: IExtensionDescription): TPromise<ActivatedExtension>;
    $onExtensionHostReady(extensionDescriptions: IExtensionDescription[], messages: IMessage[]): TPromise<void>;
    $onExtensionActivated(extensionId: string): void;
    $onExtensionActivationFailed(extensionId: string): void;
}
