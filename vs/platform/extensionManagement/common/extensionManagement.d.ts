import { TPromise } from 'vs/base/common/winjs.base';
import Event from 'vs/base/common/event';
import { IPager } from 'vs/base/common/paging';
export interface IExtensionManifest {
    name: string;
    publisher: string;
    version: string;
    engines: {
        vscode: string;
    };
    displayName?: string;
    description?: string;
    main?: string;
    icon?: string;
}
export interface IGalleryVersion {
    version: string;
    date: string;
    manifestUrl: string;
    readmeUrl: string;
    downloadUrl: string;
    iconUrl: string;
    downloadHeaders: {
        [key: string]: string;
    };
}
export interface IExtensionIdentity {
    name: string;
    publisher: string;
}
export interface IGalleryExtension {
    id: string;
    name: string;
    displayName: string;
    publisherId: string;
    publisher: string;
    publisherDisplayName: string;
    description: string;
    installCount: number;
    rating: number;
    ratingCount: number;
    versions: IGalleryVersion[];
}
export interface IGalleryMetadata {
    id: string;
    publisherId: string;
    publisherDisplayName: string;
}
export interface ILocalExtension {
    id: string;
    manifest: IExtensionManifest;
    metadata: IGalleryMetadata;
    path: string;
    readmeUrl: string;
}
export declare const IExtensionManagementService: {
    (...args: any[]): void;
    type: IExtensionManagementService;
};
export declare const IExtensionGalleryService: {
    (...args: any[]): void;
    type: IExtensionGalleryService;
};
export declare enum SortBy {
    NoneOrRelevance = 0,
    LastUpdatedDate = 1,
    Title = 2,
    PublisherName = 3,
    InstallCount = 4,
    PublishedDate = 5,
    AverageRating = 6,
}
export declare enum SortOrder {
    Default = 0,
    Ascending = 1,
    Descending = 2,
}
export interface IQueryOptions {
    text?: string;
    ids?: string[];
    names?: string[];
    pageSize?: number;
    sortBy?: SortBy;
    sortOrder?: SortOrder;
}
export interface IExtensionGalleryService {
    _serviceBrand: any;
    isEnabled(): boolean;
    query(options?: IQueryOptions): TPromise<IPager<IGalleryExtension>>;
}
export declare type InstallExtensionEvent = {
    id: string;
    gallery?: IGalleryExtension;
};
export declare type DidInstallExtensionEvent = {
    id: string;
    local?: ILocalExtension;
    error?: Error;
};
export interface IExtensionManagementService {
    _serviceBrand: any;
    onInstallExtension: Event<InstallExtensionEvent>;
    onDidInstallExtension: Event<DidInstallExtensionEvent>;
    onUninstallExtension: Event<string>;
    onDidUninstallExtension: Event<string>;
    install(extension: IGalleryExtension): TPromise<void>;
    install(zipPath: string): TPromise<void>;
    uninstall(extension: ILocalExtension): TPromise<void>;
    getInstalled(includeDuplicateVersions?: boolean): TPromise<ILocalExtension[]>;
}
export declare const IExtensionTipsService: {
    (...args: any[]): void;
    type: IExtensionTipsService;
};
export interface IExtensionTipsService {
    _serviceBrand: any;
    getRecommendations(): TPromise<IGalleryExtension[]>;
}
export declare const ExtensionsLabel: string;
export declare const ExtensionsChannelId: string;
