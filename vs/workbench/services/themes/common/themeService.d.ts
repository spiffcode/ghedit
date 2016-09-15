import { TPromise } from 'vs/base/common/winjs.base';
import Event from 'vs/base/common/event';
export declare let IThemeService: {
    (...args: any[]): void;
    type: IThemeService;
};
export interface IThemeService {
    _serviceBrand: any;
    setTheme(themeId: string, broadcastToAllWindows: boolean): TPromise<boolean>;
    getTheme(): string;
    getThemes(): TPromise<IThemeData[]>;
    onDidThemeChange: Event<string>;
}
export interface IThemeData {
    id: string;
    label: string;
    description?: string;
    path: string;
}
