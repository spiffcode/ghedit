import URI from 'vs/base/common/uri';
import { Event } from 'vs/base/common/events';
/**
 * All workbench events are listed here.
 */
export declare class EventType {
    /**
     * Event type for when a composite is about to open.
     */
    static COMPOSITE_OPENING: string;
    /**
     * Event type for when a composite is opened.
     */
    static COMPOSITE_OPENED: string;
    /**
     * Event type for when a composite is closed.
     */
    static COMPOSITE_CLOSED: string;
    /**
     * Event type for when an untitled file is becoming dirty.
     */
    static UNTITLED_FILE_DIRTY: string;
    /**
     * Event type for when an untitled file is saved.
     */
    static UNTITLED_FILE_SAVED: string;
    /**
     * Event type for when a resources encoding changes.
     */
    static RESOURCE_ENCODING_CHANGED: string;
    /**
     * Event type for when the workbench options change. Listeners should refresh their
     * assumption on workbench options after this event is emitted.
     */
    static WORKBENCH_OPTIONS_CHANGED: string;
}
/**
 * Option change events are send when the options in the running instance change.
 */
export declare class OptionsChangeEvent extends Event {
    key: string;
    before: any;
    after: any;
    constructor(key: string, before: any, after: any, originalEvent?: any);
}
/**
 * Composite events are emitted when a composite opens or closes in the sidebar or panel.
 */
export declare class CompositeEvent extends Event {
    compositeId: string;
    constructor(compositeId: string, originalEvent?: any);
}
export declare class ResourceEvent extends Event {
    resource: URI;
    constructor(resource: URI, originalEvent?: any);
}
export declare class UntitledEditorEvent extends ResourceEvent {
}
