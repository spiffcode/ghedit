import { TPromise as Promise } from 'vs/base/common/winjs.base';
import { IExtensionManagementService, IExtensionGalleryService, IExtensionTipsService, IGalleryExtension } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IModelService } from 'vs/editor/common/services/modelService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IMessageService } from 'vs/platform/message/common/message';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
export declare class ExtensionTipsService implements IExtensionTipsService {
    private _galleryService;
    private _modelService;
    private storageService;
    private messageService;
    private extensionsService;
    private instantiationService;
    _serviceBrand: any;
    private _recommendations;
    private _availableRecommendations;
    private importantRecommendations;
    private importantRecommendationsIgnoreList;
    private _disposables;
    constructor(_galleryService: IExtensionGalleryService, _modelService: IModelService, storageService: IStorageService, messageService: IMessageService, extensionsService: IExtensionManagementService, instantiationService: IInstantiationService);
    getRecommendations(): Promise<IGalleryExtension[]>;
    private _suggest(uri);
    dispose(): void;
}
