var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/eventEmitter', 'vs/base/common/types', 'vs/base/common/objects'], function (require, exports, winjs_base_1, eventEmitter_1, types, objects) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /**
     * Editor inputs are lightweight objects that can be passed to the workbench API to open inside the editor part.
     * Each editor input is mapped to an editor that is capable of opening it through the Platform facade.
     */
    var EditorInput = (function (_super) {
        __extends(EditorInput, _super);
        function EditorInput() {
            _super.apply(this, arguments);
        }
        /**
         * Returns the name of this input that can be shown to the user. Examples include showing the name of the input
         * above the editor area when the input is shown.
         */
        EditorInput.prototype.getName = function () {
            return null;
        };
        /**
         * Returns the description of this input that can be shown to the user. Examples include showing the description of
         * the input above the editor area to the side of the name of the input.
         *
         * @param verbose controls if the description should be short or can contain additional details.
         */
        EditorInput.prototype.getDescription = function (verbose) {
            return null;
        };
        /**
         * Returns status information about this input that can be shown to the user. Examples include showing the status
         * of the input when hovering over the name of the input.
         */
        EditorInput.prototype.getStatus = function () {
            return null;
        };
        /**
         * Returns the preferred editor for this input. A list of candidate editors is passed in that whee registered
         * for the input. This allows subclasses to decide late which editor to use for the input on a case by case basis.
         */
        EditorInput.prototype.getPreferredEditorId = function (candidates) {
            if (candidates && candidates.length > 0) {
                return candidates[0];
            }
            return null;
        };
        /**
         * Returns true if this input is identical to the otherInput.
         */
        EditorInput.prototype.matches = function (otherInput) {
            return this === otherInput;
        };
        /**
         * Called when an editor input is no longer needed. Allows to free up any resources taken by
         * resolving the editor input.
         */
        EditorInput.prototype.dispose = function () {
            this.disposed = true;
            this.emit('dispose');
            _super.prototype.dispose.call(this);
        };
        /**
         * Returns whether this input was disposed or not.
         */
        EditorInput.prototype.isDisposed = function () {
            return this.disposed;
        };
        return EditorInput;
    }(eventEmitter_1.EventEmitter));
    exports.EditorInput = EditorInput;
    (function (EncodingMode) {
        /**
         * Instructs the encoding support to encode the current input with the provided encoding
         */
        EncodingMode[EncodingMode["Encode"] = 0] = "Encode";
        /**
         * Instructs the encoding support to decode the current input with the provided encoding
         */
        EncodingMode[EncodingMode["Decode"] = 1] = "Decode";
    })(exports.EncodingMode || (exports.EncodingMode = {}));
    var EncodingMode = exports.EncodingMode;
    /**
     * The base class of untitled editor inputs in the workbench.
     */
    var UntitledEditorInput = (function (_super) {
        __extends(UntitledEditorInput, _super);
        function UntitledEditorInput() {
            _super.apply(this, arguments);
        }
        return UntitledEditorInput;
    }(EditorInput));
    exports.UntitledEditorInput = UntitledEditorInput;
    /**
     * The base class of editor inputs that have an original and modified side.
     */
    var BaseDiffEditorInput = (function (_super) {
        __extends(BaseDiffEditorInput, _super);
        function BaseDiffEditorInput(originalInput, modifiedInput) {
            _super.call(this);
            this._originalInput = originalInput;
            this._modifiedInput = modifiedInput;
        }
        Object.defineProperty(BaseDiffEditorInput.prototype, "originalInput", {
            get: function () {
                return this._originalInput;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseDiffEditorInput.prototype, "modifiedInput", {
            get: function () {
                return this._modifiedInput;
            },
            enumerable: true,
            configurable: true
        });
        BaseDiffEditorInput.prototype.getOriginalInput = function () {
            return this.originalInput;
        };
        BaseDiffEditorInput.prototype.getModifiedInput = function () {
            return this.modifiedInput;
        };
        return BaseDiffEditorInput;
    }(EditorInput));
    exports.BaseDiffEditorInput = BaseDiffEditorInput;
    /**
     * The editor model is the heavyweight counterpart of editor input. Depending on the editor input, it
     * connects to the disk to retrieve content and may allow for saving it back or reverting it. Editor models
     * are typically cached for some while because they are expensive to construct.
     */
    var EditorModel = (function (_super) {
        __extends(EditorModel, _super);
        function EditorModel() {
            _super.apply(this, arguments);
        }
        /**
         * Causes this model to load returning a promise when loading is completed.
         */
        EditorModel.prototype.load = function () {
            return winjs_base_1.TPromise.as(this);
        };
        /**
         * Returns whether this model was loaded or not.
         */
        EditorModel.prototype.isResolved = function () {
            return true;
        };
        /**
         * Subclasses should implement to free resources that have been claimed through loading.
         */
        EditorModel.prototype.dispose = function () {
            this.emit('dispose');
            _super.prototype.dispose.call(this);
        };
        return EditorModel;
    }(eventEmitter_1.EventEmitter));
    exports.EditorModel = EditorModel;
    /**
     * The editor options is the base class of options that can be passed in when opening an editor.
     */
    var EditorOptions = (function () {
        function EditorOptions() {
        }
        /**
         * Helper to create EditorOptions inline.
         */
        EditorOptions.create = function (settings) {
            var options = new EditorOptions();
            options.preserveFocus = settings.preserveFocus;
            options.forceOpen = settings.forceOpen;
            return options;
        };
        /**
         * Returns true if this options is identical to the otherOptions.
         */
        EditorOptions.prototype.matches = function (otherOptions) {
            return this === otherOptions;
        };
        return EditorOptions;
    }());
    exports.EditorOptions = EditorOptions;
    /**
     * Base Text Editor Options.
     */
    var TextEditorOptions = (function (_super) {
        __extends(TextEditorOptions, _super);
        function TextEditorOptions() {
            _super.apply(this, arguments);
        }
        TextEditorOptions.from = function (input) {
            var options = null;
            if (input && input.options) {
                if (input.options.selection || input.options.forceOpen || input.options.preserveFocus) {
                    options = new TextEditorOptions();
                }
                if (input.options.selection) {
                    var selection = input.options.selection;
                    options.selection(selection.startLineNumber, selection.startColumn, selection.endLineNumber, selection.endColumn);
                }
                if (input.options.forceOpen) {
                    options.forceOpen = true;
                }
                if (input.options.preserveFocus) {
                    options.preserveFocus = true;
                }
            }
            return options;
        };
        /**
         * Helper to create TextEditorOptions inline.
         */
        TextEditorOptions.create = function (settings) {
            var options = new TextEditorOptions();
            options.preserveFocus = settings.preserveFocus;
            options.forceActive = settings.forceActive;
            options.forceOpen = settings.forceOpen;
            if (settings.selection) {
                options.startLineNumber = settings.selection.startLineNumber;
                options.startColumn = settings.selection.startColumn;
                options.endLineNumber = settings.selection.endLineNumber || settings.selection.startLineNumber;
                options.endColumn = settings.selection.endColumn || settings.selection.startColumn;
            }
            return options;
        };
        /**
         * Returns if this options object has objects defined for the editor.
         */
        TextEditorOptions.prototype.hasOptionsDefined = function () {
            return !!this.editorViewState || (!types.isUndefinedOrNull(this.startLineNumber) && !types.isUndefinedOrNull(this.startColumn));
        };
        /**
         * Tells the editor to set show the given selection when the editor is being opened.
         */
        TextEditorOptions.prototype.selection = function (startLineNumber, startColumn, endLineNumber, endColumn) {
            if (endLineNumber === void 0) { endLineNumber = startLineNumber; }
            if (endColumn === void 0) { endColumn = startColumn; }
            this.startLineNumber = startLineNumber;
            this.startColumn = startColumn;
            this.endLineNumber = endLineNumber;
            this.endColumn = endColumn;
            return this;
        };
        /**
         * Sets the view state to be used when the editor is opening.
         */
        TextEditorOptions.prototype.viewState = function (viewState) {
            this.editorViewState = viewState;
        };
        /**
         * Apply the view state or selection to the given editor.
         *
         * @return if something was applied
         */
        TextEditorOptions.prototype.apply = function (textEditor) {
            var gotApplied = false;
            // First try viewstate
            if (this.editorViewState) {
                textEditor.restoreViewState(this.editorViewState);
                gotApplied = true;
            }
            else if (!types.isUndefinedOrNull(this.startLineNumber) && !types.isUndefinedOrNull(this.startColumn)) {
                // Select
                if (!types.isUndefinedOrNull(this.endLineNumber) && !types.isUndefinedOrNull(this.endColumn)) {
                    var range = {
                        startLineNumber: this.startLineNumber,
                        startColumn: this.startColumn,
                        endLineNumber: this.endLineNumber,
                        endColumn: this.endColumn
                    };
                    textEditor.setSelection(range);
                    textEditor.revealRangeInCenter(range);
                }
                else {
                    var pos = {
                        lineNumber: this.startLineNumber,
                        column: this.startColumn
                    };
                    textEditor.setPosition(pos);
                    textEditor.revealPositionInCenter(pos);
                }
                gotApplied = true;
            }
            return gotApplied;
        };
        TextEditorOptions.prototype.matches = function (otherOptions) {
            if (_super.prototype.matches.call(this, otherOptions) === true) {
                return true;
            }
            if (otherOptions) {
                return otherOptions instanceof TextEditorOptions &&
                    otherOptions.startLineNumber === this.startLineNumber &&
                    otherOptions.startColumn === this.startColumn &&
                    otherOptions.endLineNumber === this.endLineNumber &&
                    otherOptions.endColumn === this.endColumn &&
                    otherOptions.preserveFocus === this.preserveFocus &&
                    otherOptions.forceOpen === this.forceOpen &&
                    objects.equals(otherOptions.editorViewState, this.editorViewState);
            }
            return false;
        };
        return TextEditorOptions;
    }(EditorOptions));
    exports.TextEditorOptions = TextEditorOptions;
    /**
     * Base Text Diff Editor Options.
     */
    var TextDiffEditorOptions = (function (_super) {
        __extends(TextDiffEditorOptions, _super);
        function TextDiffEditorOptions() {
            _super.apply(this, arguments);
        }
        /**
         * Helper to create TextDiffEditorOptions inline.
         */
        TextDiffEditorOptions.create = function (settings) {
            var options = new TextDiffEditorOptions();
            options.autoRevealFirstChange = settings.autoRevealFirstChange;
            options.preserveFocus = settings.preserveFocus;
            options.forceOpen = settings.forceOpen;
            return options;
        };
        return TextDiffEditorOptions;
    }(TextEditorOptions));
    exports.TextDiffEditorOptions = TextDiffEditorOptions;
    /**
     * Given an input, tries to get the associated URI for it (either file or untitled scheme).
     */
    function getUntitledOrFileResource(input, supportDiff) {
        if (!input) {
            return null;
        }
        // Untitled
        if (input instanceof UntitledEditorInput) {
            return input.getResource();
        }
        // File
        var fileInput = asFileEditorInput(input, supportDiff);
        return fileInput && fileInput.getResource();
    }
    exports.getUntitledOrFileResource = getUntitledOrFileResource;
    /**
     * Returns the object as IFileEditorInput only if it matches the signature.
     */
    function asFileEditorInput(obj, supportDiff) {
        if (!obj) {
            return null;
        }
        // Check for diff if we are asked to
        if (supportDiff && types.isFunction(obj.getModifiedInput)) {
            obj = obj.getModifiedInput();
        }
        var i = obj;
        return i instanceof EditorInput && types.areFunctions(i.setResource, i.setMime, i.setEncoding, i.getEncoding, i.getResource, i.getMime) ? i : null;
    }
    exports.asFileEditorInput = asFileEditorInput;
});
//# sourceMappingURL=editor.js.map