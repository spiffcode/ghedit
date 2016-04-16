var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/events', 'vs/base/common/mime', 'vs/workbench/common/editor', 'vs/platform/instantiation/common/instantiation', 'vs/workbench/parts/files/common/explorerViewModel'], function (require, exports, events_1, mime_1, editor_1, instantiation_1, explorerViewModel_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /**
     * Explorer viewlet id.
     */
    exports.VIEWLET_ID = 'workbench.view.explorer';
    /**
     * File editor input id.
     */
    exports.FILE_EDITOR_INPUT_ID = 'workbench.editors.files.fileEditorInput';
    /**
     * Text file editor id.
     */
    exports.TEXT_FILE_EDITOR_ID = 'workbench.editors.files.textFileEditor';
    /**
     * Binary file editor id.
     */
    exports.BINARY_FILE_EDITOR_ID = 'workbench.editors.files.binaryFileEditor';
    /**
     * Marker ID for model entries.
     */
    exports.WORKING_FILES_MODEL_ENTRY_CLASS_ID = 'workbench.workingFiles.model.entry.class';
    /**
     * API class to denote file editor inputs. Internal implementation is provided.
     *
     * Note: This class is not intended to be instantiated.
     */
    var FileEditorInput = (function (_super) {
        __extends(FileEditorInput, _super);
        function FileEditorInput() {
            _super.apply(this, arguments);
        }
        return FileEditorInput;
    }(editor_1.EditorInput));
    exports.FileEditorInput = FileEditorInput;
    /**
     * Helper to get a file resource from an object.
     */
    function asFileResource(obj) {
        if (obj instanceof explorerViewModel_1.FileStat) {
            var stat = obj;
            return {
                resource: stat.resource,
                mimes: stat.mime ? stat.mime.split(', ') : [],
                isDirectory: stat.isDirectory
            };
        }
        if (obj && obj.CLASS_ID === exports.WORKING_FILES_MODEL_ENTRY_CLASS_ID) {
            var entry = obj;
            if (entry.isFile) {
                return {
                    resource: entry.resource,
                    mimes: mime_1.guessMimeTypes(entry.resource.fsPath),
                    isDirectory: false
                };
            }
        }
        return null;
    }
    exports.asFileResource = asFileResource;
    /**
     * List of event types from files.
     */
    exports.EventType = {
        /**
         * Indicates that a file content has changed but not yet saved.
         */
        FILE_DIRTY: 'files:fileDirty',
        /**
         * Indicates that a file is being saved.
         */
        FILE_SAVING: 'files:fileSaving',
        /**
         * Indicates that a file save resulted in an error.
         */
        FILE_SAVE_ERROR: 'files:fileSaveError',
        /**
         * Indicates that a file content has been saved to the disk.
         */
        FILE_SAVED: 'files:fileSaved',
        /**
         * Indicates that a file content has been reverted to the state
         * on disk.
         */
        FILE_REVERTED: 'files:fileReverted'
    };
    /**
     * Local file change events are being emitted when a file is added, removed, moved or its contents got updated. These events
     * are being emitted from within the workbench and are not reflecting the truth on the disk file system. For that, please
     * use FileChangesEvent instead.
     */
    var LocalFileChangeEvent = (function (_super) {
        __extends(LocalFileChangeEvent, _super);
        function LocalFileChangeEvent(before, after, originalEvent) {
            _super.call(this, null, before, after, originalEvent);
        }
        /**
         * Returns the meta information of the file before the event occurred or null if the file is new.
         */
        LocalFileChangeEvent.prototype.getBefore = function () {
            return this.oldValue;
        };
        /**
         * Returns the meta information of the file after the event occurred or null if the file got deleted.
         */
        LocalFileChangeEvent.prototype.getAfter = function () {
            return this.newValue;
        };
        /**
         * Indicates if the file was added as a new file.
         */
        LocalFileChangeEvent.prototype.gotAdded = function () {
            return !this.oldValue && !!this.newValue;
        };
        /**
         * Indicates if the file was moved to a different path.
         */
        LocalFileChangeEvent.prototype.gotMoved = function () {
            return !!this.oldValue && !!this.newValue && this.oldValue.resource.toString() !== this.newValue.resource.toString();
        };
        /**
         * Indicates if the files metadata was updated.
         */
        LocalFileChangeEvent.prototype.gotUpdated = function () {
            return !!this.oldValue && !!this.newValue && !this.gotMoved() && this.oldValue !== this.newValue;
        };
        /**
         * Indicates if the file was deleted.
         */
        LocalFileChangeEvent.prototype.gotDeleted = function () {
            return !!this.oldValue && !this.newValue;
        };
        return LocalFileChangeEvent;
    }(events_1.PropertyChangeEvent));
    exports.LocalFileChangeEvent = LocalFileChangeEvent;
    /**
     * Text file change events are emitted when files are saved or reverted.
     */
    var TextFileChangeEvent = (function (_super) {
        __extends(TextFileChangeEvent, _super);
        function TextFileChangeEvent(model, before, after, originalEvent) {
            if (after === void 0) { after = before; }
            _super.call(this, before, after, originalEvent);
            this._model = model;
        }
        Object.defineProperty(TextFileChangeEvent.prototype, "model", {
            get: function () {
                return this._model;
            },
            enumerable: true,
            configurable: true
        });
        TextFileChangeEvent.prototype.setAutoSaved = function (autoSaved) {
            this._isAutoSaved = autoSaved;
        };
        Object.defineProperty(TextFileChangeEvent.prototype, "isAutoSaved", {
            get: function () {
                return this._isAutoSaved;
            },
            enumerable: true,
            configurable: true
        });
        return TextFileChangeEvent;
    }(LocalFileChangeEvent));
    exports.TextFileChangeEvent = TextFileChangeEvent;
    exports.TEXT_FILE_SERVICE_ID = 'textFileService';
    (function (ConfirmResult) {
        ConfirmResult[ConfirmResult["SAVE"] = 0] = "SAVE";
        ConfirmResult[ConfirmResult["DONT_SAVE"] = 1] = "DONT_SAVE";
        ConfirmResult[ConfirmResult["CANCEL"] = 2] = "CANCEL";
    })(exports.ConfirmResult || (exports.ConfirmResult = {}));
    var ConfirmResult = exports.ConfirmResult;
    (function (AutoSaveMode) {
        AutoSaveMode[AutoSaveMode["OFF"] = 0] = "OFF";
        AutoSaveMode[AutoSaveMode["AFTER_SHORT_DELAY"] = 1] = "AFTER_SHORT_DELAY";
        AutoSaveMode[AutoSaveMode["AFTER_LONG_DELAY"] = 2] = "AFTER_LONG_DELAY";
        AutoSaveMode[AutoSaveMode["ON_FOCUS_CHANGE"] = 3] = "ON_FOCUS_CHANGE";
    })(exports.AutoSaveMode || (exports.AutoSaveMode = {}));
    var AutoSaveMode = exports.AutoSaveMode;
    exports.ITextFileService = instantiation_1.createDecorator(exports.TEXT_FILE_SERVICE_ID);
});
