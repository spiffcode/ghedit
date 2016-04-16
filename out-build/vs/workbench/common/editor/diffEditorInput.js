var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/nls', 'vs/base/common/winjs.base', 'vs/base/common/types', 'vs/base/common/labels', 'vs/base/common/mime', 'vs/base/common/events', 'vs/workbench/common/editor', 'vs/workbench/common/editor/textEditorModel', 'vs/workbench/common/editor/diffEditorModel', 'vs/workbench/common/editor/textDiffEditorModel'], function (require, exports, nls, winjs_base_1, types, labels_1, mime_1, events_1, editor_1, textEditorModel_1, diffEditorModel_1, textDiffEditorModel_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /**
     * The base editor input for the diff editor. It is made up of two editor inputs, the original version
     * and the modified version.
     */
    var DiffEditorInput = (function (_super) {
        __extends(DiffEditorInput, _super);
        function DiffEditorInput(name, description, originalInput, modifiedInput, forceOpenAsBinary) {
            _super.call(this, originalInput, modifiedInput);
            this.name = name;
            this.description = description;
            this.forceOpenAsBinary = forceOpenAsBinary;
            this._toUnbind = [];
            this.registerListeners();
        }
        DiffEditorInput.prototype.registerListeners = function () {
            var _this = this;
            // When the original or modified input gets disposed, dispose this diff editor input
            this._toUnbind.push(this.originalInput.addListener(events_1.EventType.DISPOSE, function () {
                if (!_this.isDisposed()) {
                    _this.dispose();
                }
            }));
            this._toUnbind.push(this.modifiedInput.addListener(events_1.EventType.DISPOSE, function () {
                if (!_this.isDisposed()) {
                    _this.dispose();
                }
            }));
        };
        Object.defineProperty(DiffEditorInput.prototype, "toUnbind", {
            get: function () {
                return this._toUnbind;
            },
            enumerable: true,
            configurable: true
        });
        DiffEditorInput.prototype.getId = function () {
            return DiffEditorInput.ID;
        };
        DiffEditorInput.prototype.getName = function () {
            return this.name;
        };
        DiffEditorInput.prototype.getDescription = function () {
            return this.description;
        };
        DiffEditorInput.prototype.getStatus = function () {
            if (this.modifiedInput) {
                var modifiedStatus = this.modifiedInput.getStatus();
                if (modifiedStatus) {
                    return modifiedStatus;
                }
            }
            if (this.originalInput) {
                var originalStatus = this.originalInput.getStatus();
                if (originalStatus) {
                    return originalStatus;
                }
            }
            return _super.prototype.getStatus.call(this);
        };
        DiffEditorInput.prototype.setOriginalInput = function (input) {
            this.originalInput = input;
        };
        DiffEditorInput.prototype.setModifiedInput = function (input) {
            this.modifiedInput = input;
        };
        DiffEditorInput.prototype.resolve = function (refresh) {
            var _this = this;
            var modelPromise;
            // Use Cached Model
            if (this.cachedModel && !refresh) {
                modelPromise = winjs_base_1.TPromise.as(this.cachedModel);
            }
            else {
                modelPromise = this.createModel(refresh);
            }
            return modelPromise.then(function (resolvedModel) {
                if (_this.cachedModel) {
                    _this.cachedModel.dispose();
                }
                _this.cachedModel = resolvedModel;
                return _this.cachedModel;
            });
        };
        DiffEditorInput.prototype.getPreferredEditorId = function (candidates) {
            // Find the right diff editor for the given isBinary/isText state
            var useBinaryEditor = this.forceOpenAsBinary || this.isBinary(this.originalInput) || this.isBinary(this.modifiedInput);
            return !useBinaryEditor ? 'workbench.editors.textDiffEditor' : 'workbench.editors.binaryResourceDiffEditor';
        };
        DiffEditorInput.prototype.isBinary = function (input) {
            var mime;
            // Find mime by checking for IFileEditorInput implementors
            var fileInput = input;
            if (types.isFunction(fileInput.getMime)) {
                mime = fileInput.getMime();
            }
            return mime && mime_1.isBinaryMime(mime);
        };
        DiffEditorInput.prototype.createModel = function (refresh) {
            // Join resolve call over two inputs and build diff editor model
            return winjs_base_1.TPromise.join([
                this.originalInput.resolve(refresh),
                this.modifiedInput.resolve(refresh)
            ]).then(function (models) {
                var originalEditorModel = models[0];
                var modifiedEditorModel = models[1];
                // If both are text models, return textdiffeditor model
                if (modifiedEditorModel instanceof textEditorModel_1.BaseTextEditorModel && originalEditorModel instanceof textEditorModel_1.BaseTextEditorModel) {
                    return new textDiffEditorModel_1.TextDiffEditorModel(originalEditorModel, modifiedEditorModel);
                }
                // Otherwise return normal diff model
                return new diffEditorModel_1.DiffEditorModel(originalEditorModel, modifiedEditorModel);
            });
        };
        DiffEditorInput.prototype.matches = function (otherInput) {
            if (_super.prototype.matches.call(this, otherInput) === true) {
                return true;
            }
            if (otherInput) {
                if (!(otherInput instanceof DiffEditorInput)) {
                    return false;
                }
                var otherDiffInput = otherInput;
                return this.originalInput.matches(otherDiffInput.originalInput) && this.modifiedInput.matches(otherDiffInput.modifiedInput);
            }
            return false;
        };
        DiffEditorInput.prototype.dispose = function () {
            while (this._toUnbind.length) {
                this._toUnbind.pop()();
            }
            // Dispose Model
            if (this.cachedModel) {
                this.cachedModel.dispose();
                this.cachedModel = null;
            }
            // Delegate to Inputs
            this.originalInput.dispose();
            this.modifiedInput.dispose();
            _super.prototype.dispose.call(this);
        };
        DiffEditorInput.ID = 'workbench.editors.diffEditorInput';
        return DiffEditorInput;
    }(editor_1.BaseDiffEditorInput));
    exports.DiffEditorInput = DiffEditorInput;
    function toDiffLabel(res1, res2, context) {
        var leftName = labels_1.getPathLabel(res1.fsPath, context);
        var rightName = labels_1.getPathLabel(res2.fsPath, context);
        return nls.localize('compareLabels', "{0} ↔ {1}", leftName, rightName);
    }
    exports.toDiffLabel = toDiffLabel;
});
