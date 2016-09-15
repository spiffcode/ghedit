import { EventEmitter } from 'vs/base/common/eventEmitter';
import { IMarker, IMarkerService } from 'vs/platform/markers/common/markers';
import { IPosition, IRange } from 'vs/editor/common/editorCommon';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IQuickFix2 } from '../common/quickFix';
export declare class QuickFixModel extends EventEmitter {
    private editor;
    private onAccept;
    private markers;
    private lastMarker;
    private lightBulpPosition;
    private toDispose;
    private toLocalDispose;
    private lightBulpDecoration;
    private autoSuggestDelay;
    private enableAutoQuckFix;
    private triggerAutoSuggestPromise;
    private state;
    private quickFixRequestPromiseRange;
    private quickFixRequestPromise;
    private markerService;
    private updateScheduler;
    private lightBulp;
    constructor(editor: ICodeEditor, markerService: IMarkerService, onAccept: (fix: IQuickFix2, marker: IMarker) => void);
    private onModelChanged();
    private onLightBulpClicked(pos);
    private isSimilarMarker(marker1, marker2);
    private onMarkerChanged(changedResources);
    private setDecoration(pos);
    private updateDecoration();
    private onCursorPositionChanged();
    private computeFixes(range);
    /**
     * Returns all marker sorted by startLineNumber
     */
    private getMarkers();
    private findMarker(pos, findOnSameLine);
    cancelDialog(silent?: boolean): boolean;
    private isAutoSuggest();
    private triggerAutoSuggest(marker);
    triggerDialog(auto: boolean, pos: IPosition): void;
    accept(quickFix: IQuickFix2, range: IRange): boolean;
    private localDispose();
    dispose(): void;
}
