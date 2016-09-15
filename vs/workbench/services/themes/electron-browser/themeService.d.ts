import { TPromise } from 'vs/base/common/winjs.base';
import { IExtensionService } from 'vs/platform/extensions/common/extensions';
import { IThemeService, IThemeData } from 'vs/workbench/services/themes/common/themeService';
import { IWindowService } from 'vs/workbench/services/window/electron-browser/windowService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import Event from 'vs/base/common/event';
export declare class ThemeService implements IThemeService {
    private extensionService;
    private windowService;
    private storageService;
    private telemetryService;
    _serviceBrand: any;
    private knownThemes;
    private currentTheme;
    private container;
    private onThemeChange;
    constructor(extensionService: IExtensionService, windowService: IWindowService, storageService: IStorageService, telemetryService: ITelemetryService);
    onDidThemeChange: Event<string>;
    initialize(container: HTMLElement): TPromise<boolean>;
    setTheme(themeId: string, broadcastToAllWindows: boolean): TPromise<boolean>;
    getTheme(): string;
    private loadTheme(themeId, defaultId?);
    private applyThemeCSS(themeId, defaultId, onApply);
    getThemes(): TPromise<IThemeData[]>;
    private onThemes(extensionFolderPath, extensionId, themes, collector);
    private themeExtensionsActivated;
    private sendTelemetry(themeData);
}
