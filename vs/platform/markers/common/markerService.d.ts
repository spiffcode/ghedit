import URI from 'vs/base/common/uri';
import Event from 'vs/base/common/event';
import { IMarkerService, IMarkerData, IResourceMarker, IMarker, MarkerStatistics } from './markers';
export interface MarkerData {
    [k: string]: IMarkerData[];
}
export declare class MarkerService implements IMarkerService {
    _serviceBrand: any;
    private _data;
    private _stats;
    private _onMarkerChanged;
    constructor();
    getStatistics(): MarkerStatistics;
    onMarkerChanged: Event<URI[]>;
    changeOne(owner: string, resource: URI, markers: IMarkerData[]): void;
    remove(owner: string, resources: URI[]): void;
    private _doChangeOne(owner, resource, markers);
    changeAll(owner: string, data: IResourceMarker[]): void;
    read(filter?: {
        owner?: string;
        resource?: URI;
        selector?: RegExp;
        take?: number;
    }): IMarker[];
    private _isStatRelevant(resource);
    private _forEach(owner, resource, regexp, take, callback);
    private _fromEntry(entry, bucket);
    private _computeStats(markers);
    private _emptyStats();
    private _updateStatsPlus(toAdd);
    private _updateStatsPlus(toUpdate, toAdd);
    private _updateStatsMinus(toSubtract);
    private _updateStatsMinus(toUpdate, toSubtract);
    private _updateStatsMarker(toUpdate, marker);
    private static _sanitize(data);
}
