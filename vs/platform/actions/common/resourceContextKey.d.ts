import URI from 'vs/base/common/uri';
import { IKeybindingService, IKeybindingContextKey } from 'vs/platform/keybinding/common/keybinding';
import { IModeService } from 'vs/editor/common/services/modeService';
export declare class ResourceContextKey implements IKeybindingContextKey<URI> {
    private _modeService;
    static Scheme: string;
    static LangId: string;
    static Resource: string;
    private _resourceKey;
    private _schemeKey;
    private _langIdKey;
    constructor(keybindingService: IKeybindingService, _modeService: IModeService);
    set(value: URI): void;
    reset(): void;
}
