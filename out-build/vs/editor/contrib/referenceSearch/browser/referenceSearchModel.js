var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/collections', 'vs/base/common/eventEmitter', 'vs/base/common/paths', 'vs/base/common/strings', 'vs/base/common/uuid', 'vs/base/common/winjs.base', 'vs/editor/common/core/range'], function (require, exports, collections, eventEmitter_1, paths_1, strings, uuid_1, winjs_base_1, range_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var EventType;
    (function (EventType) {
        EventType.OnReferenceRangeChanged = 'refrence.rangeChanged';
        EventType.CurrentReferenceChanged = 'reference.currentChanged';
    })(EventType = exports.EventType || (exports.EventType = {}));
    var OneReference = (function () {
        function OneReference(_parent, reference) {
            this._parent = _parent;
            this._id = uuid_1.generateUuid();
            this._range = reference.range;
        }
        Object.defineProperty(OneReference.prototype, "id", {
            get: function () {
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OneReference.prototype, "model", {
            get: function () {
                return this._parent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OneReference.prototype, "parent", {
            get: function () {
                return this._parent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OneReference.prototype, "resource", {
            get: function () {
                return this._parent.resource;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OneReference.prototype, "name", {
            get: function () {
                return this._parent.name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OneReference.prototype, "directory", {
            get: function () {
                return this._parent.directory;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OneReference.prototype, "range", {
            get: function () {
                return this._range;
            },
            set: function (value) {
                this._range = value;
                this.parent.parent.emit(EventType.OnReferenceRangeChanged, this);
            },
            enumerable: true,
            configurable: true
        });
        return OneReference;
    }());
    exports.OneReference = OneReference;
    var FilePreview = (function () {
        function FilePreview(value) {
            this._value = value;
            this._lineStarts = strings.computeLineStarts(value);
        }
        FilePreview.prototype.preview = function (range, n) {
            if (n === void 0) { n = 8; }
            var lineStart = this._lineStarts[range.startLineNumber - 1], rangeStart = lineStart + range.startColumn - 1, rangeEnd = this._lineStarts[range.endLineNumber - 1] + range.endColumn - 1, lineEnd = range.endLineNumber >= this._lineStarts.length ? this._value.length : this._lineStarts[range.endLineNumber];
            var ret = {
                before: this._value.substring(lineStart, rangeStart).replace(/^\s+/, strings.empty),
                inside: this._value.substring(rangeStart, rangeEnd),
                after: this._value.substring(rangeEnd, lineEnd).replace(/\s+$/, strings.empty)
            };
            // long before parts will be cut at the best position
            ret.before = strings.lcut(ret.before, n);
            return ret;
        };
        return FilePreview;
    }());
    exports.FilePreview = FilePreview;
    var FileReferences = (function () {
        function FileReferences(_parent, _resource, _editorService) {
            this._parent = _parent;
            this._resource = _resource;
            this._editorService = _editorService;
            this._children = [];
        }
        Object.defineProperty(FileReferences.prototype, "id", {
            get: function () {
                return this._resource.toString();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileReferences.prototype, "parent", {
            get: function () {
                return this._parent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileReferences.prototype, "children", {
            get: function () {
                return this._children;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileReferences.prototype, "resource", {
            get: function () {
                return this._resource;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileReferences.prototype, "name", {
            get: function () {
                return paths_1.basename(this.resource.fsPath);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileReferences.prototype, "directory", {
            get: function () {
                return paths_1.dirname(this.resource.fsPath);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileReferences.prototype, "preview", {
            get: function () {
                return this._preview;
            },
            enumerable: true,
            configurable: true
        });
        FileReferences.prototype.resolve = function () {
            var _this = this;
            if (this._resolved) {
                return winjs_base_1.TPromise.as(this);
            }
            return this._editorService.resolveEditorModel({ resource: this._resource }).then(function (model) {
                _this._preview = new FilePreview(model.textEditorModel.getValue());
                _this._resolved = true;
                return _this;
            });
        };
        return FileReferences;
    }());
    exports.FileReferences = FileReferences;
    var ReferencesModel = (function (_super) {
        __extends(ReferencesModel, _super);
        function ReferencesModel(references, editorService) {
            var _this = this;
            _super.call(this, [
                EventType.CurrentReferenceChanged,
                EventType.OnReferenceRangeChanged
            ]);
            var referencesByFile = Object.create(null);
            var seen = Object.create(null);
            references.forEach(function (reference) {
                var hash = ReferencesModel._hash(reference);
                if (!seen[hash]) {
                    seen[hash] = true;
                    var resource = reference.resource;
                    var fileReferences = new FileReferences(_this, resource, editorService);
                    fileReferences = collections.lookupOrInsert(referencesByFile, fileReferences.id, fileReferences);
                    fileReferences.children.push(new OneReference(fileReferences, reference));
                }
            });
            this._references = collections.values(referencesByFile);
            this._references.sort(ReferencesModel._compare);
        }
        Object.defineProperty(ReferencesModel.prototype, "children", {
            get: function () {
                return this._references;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReferencesModel.prototype, "currentReference", {
            get: function () {
                return this._currentReference;
            },
            set: function (reference) {
                this._currentReference = reference;
                this.emit(EventType.CurrentReferenceChanged, this);
            },
            enumerable: true,
            configurable: true
        });
        ReferencesModel.prototype.nextReference = function (reference) {
            var idx = reference.parent.children.indexOf(reference), len = reference.parent.children.length, totalLength = reference.parent.parent.children.length;
            if (idx + 1 < len || totalLength === 1) {
                return reference.parent.children[(idx + 1) % len];
            }
            idx = reference.parent.parent.children.indexOf(reference.parent);
            idx = (idx + 1) % totalLength;
            return reference.parent.parent.children[idx].children[0];
        };
        ReferencesModel.prototype.findReference = function (resource, position) {
            for (var i = 0, len = this._references.length; i < len; i++) {
                var reference = this._references[i];
                if (reference.resource.toString() !== resource.toString()) {
                    continue;
                }
                var result;
                reference.children.some(function (element) {
                    if (range_1.Range.containsPosition(element.range, position)) {
                        result = element;
                        return true;
                    }
                    return false;
                });
                if (result) {
                    return result;
                }
            }
            if (this._references.length > 0) {
                return this._references[0].children[0];
            }
            return null;
        };
        ReferencesModel._hash = function (reference) {
            var _a = reference.range, startLineNumber = _a.startLineNumber, startColumn = _a.startColumn, endLineNumber = _a.endLineNumber, endColumn = _a.endColumn;
            return [reference.resource.toString(),
                startLineNumber, startColumn, endLineNumber, endColumn].join(',');
        };
        ReferencesModel._compare = function (a, b) {
            return strings.localeCompare(a.directory, b.directory) || strings.localeCompare(a.name, b.name);
        };
        return ReferencesModel;
    }(eventEmitter_1.EventEmitter));
    exports.ReferencesModel = ReferencesModel;
});
//# sourceMappingURL=referenceSearchModel.js.map