import uri from 'vs/base/common/uri';
import { IModel } from 'vs/workbench/parts/debug/common/debug';
export declare class Source {
    raw: DebugProtocol.Source;
    uri: uri;
    available: boolean;
    private static INTERNAL_URI_PREFIX;
    constructor(raw: DebugProtocol.Source, available?: boolean);
    name: string;
    origin: string;
    reference: number;
    inMemory: boolean;
    static toRawSource(uri: uri, model: IModel): DebugProtocol.Source;
    private static isInMemory(uri);
}
