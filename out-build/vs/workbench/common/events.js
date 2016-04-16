var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/events'], function (require, exports, events_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /**
     * All workbench events are listed here. For DOM events, see Monaco.Base.DomUtils.EventType.
     */
    var EventType = (function () {
        function EventType() {
        }
        /**
         * Event type for when an editor is opened. This event is only sent once for a specific editor type until another
         * editor type gets opened. For example, when the user opens a file, the editorOpened event will be sent. If another
         * file is opened, this event will not be fired again. If the user opens, e.g. the diff editor, editorOpened will be
         * fired, since another editor type opened.
         */
        EventType.EDITOR_OPENED = 'editorOpened';
        /**
         * Event type for when an editor is closed because another editor type is opened.
         */
        EventType.EDITOR_CLOSED = 'editorClosed';
        /**
         * Event to indciate that an editor input is about to open. This event can be prevented to do something else instead.
         */
        EventType.EDITOR_INPUT_OPENING = 'editorInputOpening';
        /**
         * Event type for when the editor input is about to change. This event is being sent before (!) the input is being set
         * to the active editor. Use EDITOR_INPUT_CHANGED to react after the input has been set and displayed by the editor.
         *
         * Note: This event will also be emitted when multiple editors are open and the user sets focus from the active editor
         * to another one. This allows to detect a focus change of the active editor.
         */
        EventType.EDITOR_INPUT_CHANGING = 'editorInputChanging';
        /**
         * Event type to indicate that the editor options of the current active editor are changing.
         */
        EventType.EDITOR_OPTIONS_CHANGING = 'editorOptionsChanging';
        /**
         * Event type for when the editor input has been changed in the currently active editor. This event is being sent after
         * the input has been set and displayed by the editor.
         *
         * Note: This event will also be emitted when multiple editors are open and the user sets focus from the active editor
         * to another one. This allows to detect a focus change of the active editor.
         */
        EventType.EDITOR_INPUT_CHANGED = 'editorInputChanged';
        /**
         * Event type for when the editor input state changed.
         */
        EventType.EDITOR_INPUT_STATE_CHANGED = 'editorInputStateChanged';
        /**
         * Event type for when the editor input failed to be set to the editor.
         */
        EventType.EDITOR_SET_INPUT_ERROR = 'editorSetInputError';
        /**
         * Event type for when the editor position has been changed
         */
        EventType.EDITOR_POSITION_CHANGED = 'editorPositionChanged';
        /**
         * An event type that fires when a text editor changes its selection.
         */
        EventType.TEXT_EDITOR_SELECTION_CHANGED = 'textEditorSelectionChanged';
        /**
         * An event type that fires when a text editor mode changes.
         */
        EventType.TEXT_EDITOR_MODE_CHANGED = 'textEditorModeChanged';
        /**
         * An event type that fires when a text editor content changes.
         */
        EventType.TEXT_EDITOR_CONTENT_CHANGED = 'textEditorContentChanged';
        /**
         * An event type that fires when a text editor content options changed.
         */
        EventType.TEXT_EDITOR_CONTENT_OPTIONS_CHANGED = 'textEditorContentOptionsChanged';
        /**
         * An event type that fires when a text editor's configuration changes.
         */
        EventType.TEXT_EDITOR_CONFIGURATION_CHANGED = 'textEditorOptionsChanged';
        /**
         * Event type for when a composite is about to open.
         */
        EventType.COMPOSITE_OPENING = 'compositeOpening';
        /**
         * Event type for when a composite is opened.
         */
        EventType.COMPOSITE_OPENED = 'compositeOpened';
        /**
         * Event type for when a composite is closed.
         */
        EventType.COMPOSITE_CLOSED = 'compositeClosed';
        /**
         * Event type for when the workbench has been fully created.
         */
        EventType.WORKBENCH_CREATED = 'workbenchCreated';
        /**
         * Event type for when the workbench is about to being disposed.
         */
        EventType.WORKBENCH_DISPOSING = 'workbenchDisposing';
        /**
         * Event type for when the workbench is fully disposed.
         */
        EventType.WORKBENCH_DISPOSED = 'workbenchDisposed';
        /**
         * Event type for when an untitled file is becoming dirty.
         */
        EventType.UNTITLED_FILE_DIRTY = 'untitledFileDirty';
        /**
         * Event type for when an untitled file is deleted.
         */
        EventType.UNTITLED_FILE_DELETED = 'untitledFileDeleted';
        /**
         * Event type for when a resources encoding changes.
         */
        EventType.RESOURCE_ENCODING_CHANGED = 'resourceEncodingChanged';
        /**
         * Event type for when the workbench options change. Listeners should refresh their
         * assumption on workbench options after this event is emitted.
         */
        EventType.WORKBENCH_OPTIONS_CHANGED = 'workbenchOptionsChanged';
        return EventType;
    }());
    exports.EventType = EventType;
    /**
     * Editor events are being emitted when the editor input changes, shows, is being saved or when the editor content changes.
     */
    var EditorEvent = (function (_super) {
        __extends(EditorEvent, _super);
        function EditorEvent(editor, editorId, editorInput, editorOptions, position, originalEvent) {
            _super.call(this, originalEvent);
            this.editor = editor;
            this.editorId = editorId;
            this.editorInput = editorInput;
            this.editorOptions = editorOptions;
            this.position = position;
        }
        EditorEvent.prototype.prevent = function () {
            this.prevented = true;
        };
        EditorEvent.prototype.isPrevented = function () {
            return this.prevented;
        };
        return EditorEvent;
    }(events_1.Event));
    exports.EditorEvent = EditorEvent;
    /**
     * Editor input events are being emitted when the editor input state changes.
     */
    var EditorInputEvent = (function (_super) {
        __extends(EditorInputEvent, _super);
        function EditorInputEvent(editorInput, originalEvent) {
            _super.call(this, originalEvent);
            this.editorInput = editorInput;
        }
        return EditorInputEvent;
    }(events_1.Event));
    exports.EditorInputEvent = EditorInputEvent;
    /**
     * A subclass of EditorEvent for text editor selection changes.
     */
    var TextEditorSelectionEvent = (function (_super) {
        __extends(TextEditorSelectionEvent, _super);
        function TextEditorSelectionEvent(selection, editor, editorId, editorInput, editorOptions, position, originalEvent) {
            _super.call(this, editor, editorId, editorInput, editorOptions, position, originalEvent);
            this.selection = selection;
        }
        return TextEditorSelectionEvent;
    }(EditorEvent));
    exports.TextEditorSelectionEvent = TextEditorSelectionEvent;
    /**
     * Option change events are send when the options in the running instance change.
     */
    var OptionsChangeEvent = (function (_super) {
        __extends(OptionsChangeEvent, _super);
        function OptionsChangeEvent(key, before, after, originalEvent) {
            _super.call(this, originalEvent);
            this.key = key;
            this.before = before;
            this.after = after;
        }
        return OptionsChangeEvent;
    }(events_1.Event));
    exports.OptionsChangeEvent = OptionsChangeEvent;
    /**
     * Command events are emitted when an action is being executed through a command handler (Keybinding).
     */
    var CommandEvent = (function (_super) {
        __extends(CommandEvent, _super);
        function CommandEvent(actionId, originalEvent) {
            _super.call(this, originalEvent);
            this.actionId = actionId;
        }
        return CommandEvent;
    }(events_1.Event));
    exports.CommandEvent = CommandEvent;
    /**
     * Composite events are emitted when a composite opens or closes in the sidebar or panel.
     */
    var CompositeEvent = (function (_super) {
        __extends(CompositeEvent, _super);
        function CompositeEvent(compositeId, originalEvent) {
            _super.call(this, originalEvent);
            this.compositeId = compositeId;
        }
        return CompositeEvent;
    }(events_1.Event));
    exports.CompositeEvent = CompositeEvent;
    var ResourceEvent = (function (_super) {
        __extends(ResourceEvent, _super);
        function ResourceEvent(resource, originalEvent) {
            _super.call(this, originalEvent);
            this.resource = resource;
        }
        return ResourceEvent;
    }(events_1.Event));
    exports.ResourceEvent = ResourceEvent;
    var UntitledEditorEvent = (function (_super) {
        __extends(UntitledEditorEvent, _super);
        function UntitledEditorEvent() {
            _super.apply(this, arguments);
        }
        return UntitledEditorEvent;
    }(ResourceEvent));
    exports.UntitledEditorEvent = UntitledEditorEvent;
});
