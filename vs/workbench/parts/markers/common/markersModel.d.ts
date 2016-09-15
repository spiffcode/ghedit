import URI from 'vs/base/common/uri';
import { IMarker, MarkerStatistics } from 'vs/platform/markers/common/markers';
import { IFilter, IMatch } from 'vs/base/common/filters';
export declare class Resource {
    uri: URI;
    markers: Marker[];
    statistics: MarkerStatistics;
    matches: IMatch[];
    name: string;
    path: string;
    constructor(uri: URI, markers: Marker[], statistics: MarkerStatistics, matches?: IMatch[]);
}
export declare class Marker {
    id: string;
    marker: IMarker;
    labelMatches: IMatch[];
    sourceMatches: IMatch[];
    constructor(id: string, marker: IMarker, labelMatches?: IMatch[], sourceMatches?: IMatch[]);
}
export declare class FilterOptions {
    static _filter: IFilter;
    static _fuzzyFilter: IFilter;
    private _filterErrors;
    private _filterWarnings;
    private _filterInfos;
    private _filter;
    private _completeFilter;
    constructor(filter?: string);
    filterErrors: boolean;
    filterWarnings: boolean;
    filterInfos: boolean;
    filter: string;
    completeFilter: string;
    hasFilters(): boolean;
    private parse(filter);
    private matches(prefix, word);
}
export declare class MarkersModel {
    private markersByResource;
    private _filteredResources;
    private _nonFilteredResources;
    private _filterOptions;
    constructor(markers?: IMarker[]);
    filterOptions: FilterOptions;
    filteredResources: Resource[];
    hasFilteredResources(): boolean;
    hasResources(): boolean;
    hasResource(resource: URI): boolean;
    nonFilteredResources: Resource[];
    update(filterOptions: FilterOptions): any;
    update(resourceUri: URI, markers: IMarker[]): any;
    update(markers: IMarker[]): any;
    private refresh();
    private refreshResources();
    private updateResource(resourceUri, markers);
    private updateMarkers(markers);
    private toFilteredResource(entry);
    private toMarker(marker, index);
    private filterMarker(marker);
    private compareMarkers(a, b);
    private getStatistics(markers);
    dispose(): void;
    getTitle(markerStatistics: MarkerStatistics): string;
    getMessage(): string;
    static getStatisticsLabel(markerStatistics: MarkerStatistics, onlyErrors?: boolean): string;
    private static getLabel(title, markersCount, singleMarkerString, multipleMarkersFunction);
}
export interface IProblemsConfiguration {
    problems: {
        autoReveal: boolean;
    };
}
