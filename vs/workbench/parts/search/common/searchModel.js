var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/async', 'vs/base/common/strings', 'vs/base/common/paths', 'vs/base/common/lifecycle', 'vs/base/common/collections', 'vs/base/common/eventEmitter', 'vs/editor/common/editorCommon', 'vs/editor/common/core/range', 'vs/editor/common/services/modelService'], function (require, exports, async_1, strings, paths, lifecycle, collections, eventEmitter_1, editorCommon_1, range_1, modelService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var Match = (function () {
        function Match(parent, text, lineNumber, offset, length) {
            this._parent = parent;
            this._lineText = text;
            this._id = parent.id() + '>' + lineNumber + '>' + offset;
            this._range = new range_1.Range(1 + lineNumber, 1 + offset, 1 + lineNumber, 1 + offset + length);
        }
        Match.prototype.id = function () {
            return this._id;
        };
        Match.prototype.parent = function () {
            return this._parent;
        };
        Match.prototype.text = function () {
            return this._lineText;
        };
        Match.prototype.range = function () {
            return this._range;
        };
        Match.prototype.preview = function () {
            var before = this._lineText.substring(0, this._range.startColumn - 1), inside = this._lineText.substring(this._range.startColumn - 1, this._range.endColumn - 1), after = this._lineText.substring(this._range.endColumn - 1, Math.min(this._range.endColumn + 150, this._lineText.length));
            before = strings.lcut(before, 26);
            return {
                before: before,
                inside: inside,
                after: after,
            };
        };
        return Match;
    }());
    exports.Match = Match;
    var EmptyMatch = (function (_super) {
        __extends(EmptyMatch, _super);
        function EmptyMatch(parent) {
            _super.call(this, parent, null, Date.now(), Date.now(), Date.now());
        }
        return EmptyMatch;
    }(Match));
    exports.EmptyMatch = EmptyMatch;
    var FileMatch = (function () {
        function FileMatch(parent, resource) {
            this._resource = resource;
            this._parent = parent;
            this._matches = Object.create(null);
        }
        FileMatch.prototype.dispose = function () {
            // nothing
        };
        FileMatch.prototype.id = function () {
            return this.resource().toString();
        };
        FileMatch.prototype.parent = function () {
            return this._parent;
        };
        FileMatch.prototype.add = function (match) {
            this._matches[match.id()] = match;
        };
        FileMatch.prototype.remove = function (match) {
            delete this._matches[match.id()];
        };
        FileMatch.prototype.matches = function () {
            return collections.values(this._matches);
        };
        FileMatch.prototype.count = function () {
            var result = 0;
            for (var key in this._matches) {
                if (!(this._matches[key] instanceof EmptyMatch)) {
                    result += 1;
                }
            }
            return result;
        };
        FileMatch.prototype.resource = function () {
            return this._resource;
        };
        FileMatch.prototype.name = function () {
            return paths.basename(this.resource().fsPath);
        };
        return FileMatch;
    }());
    exports.FileMatch = FileMatch;
    var LiveFileMatch = (function (_super) {
        __extends(LiveFileMatch, _super);
        function LiveFileMatch(parent, resource, query, model, fileMatch) {
            var _this = this;
            _super.call(this, parent, resource);
            this._modelDecorations = [];
            this._unbind = [];
            this._query = query;
            this._model = model;
            this._diskFileMatch = fileMatch;
            this._updateScheduler = new async_1.RunOnceScheduler(this._updateMatches.bind(this), 250);
            this._unbind.push(this._model.addListener(editorCommon_1.EventType.ModelContentChanged, function (_) { return _this._updateScheduler.schedule(); }));
            this._updateMatches();
        }
        LiveFileMatch.prototype.dispose = function () {
            this._unbind = lifecycle.cAll(this._unbind);
            if (!this._isTextModelDisposed()) {
                this._model.deltaDecorations(this._modelDecorations, []);
            }
        };
        LiveFileMatch.prototype._updateMatches = function () {
            var _this = this;
            // this is called from a timeout and might fire
            // after the model has been disposed
            if (this._isTextModelDisposed()) {
                return;
            }
            this._matches = Object.create(null);
            var matches = this._model
                .findMatches(this._query.pattern, this._model.getFullModelRange(), this._query.isRegExp, this._query.isCaseSensitive, this._query.isWordMatch);
            if (matches.length === 0) {
                this.add(new EmptyMatch(this));
            }
            else {
                matches.forEach(function (range) { return _this.add(new Match(_this, _this._model.getLineContent(range.startLineNumber), range.startLineNumber - 1, range.startColumn - 1, range.endColumn - range.startColumn)); });
            }
            this.parent().emit('changed', this);
            this.updateHighlights();
        };
        LiveFileMatch.prototype.updateHighlights = function () {
            if (this._model.isDisposed()) {
                return;
            }
            if (this.parent()._showHighlights) {
                this._modelDecorations = this._model.deltaDecorations(this._modelDecorations, this.matches().filter(function (match) { return !(match instanceof EmptyMatch); }).map(function (match) { return {
                    range: match.range(),
                    options: LiveFileMatch.DecorationOption
                }; }));
            }
            else {
                this._modelDecorations = this._model.deltaDecorations(this._modelDecorations, []);
            }
        };
        LiveFileMatch.prototype._isTextModelDisposed = function () {
            return !this._model || this._model.isDisposed();
        };
        LiveFileMatch.DecorationOption = {
            stickiness: editorCommon_1.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            className: 'findMatch',
            overviewRuler: {
                color: 'rgba(246, 185, 77, 0.7)',
                darkColor: 'rgba(246, 185, 77, 0.7)',
                position: editorCommon_1.OverviewRulerLane.Center
            }
        };
        return LiveFileMatch;
    }(FileMatch));
    exports.LiveFileMatch = LiveFileMatch;
    var SearchResult = (function (_super) {
        __extends(SearchResult, _super);
        function SearchResult(query, modelService) {
            _super.call(this);
            this._disposables = [];
            this._matches = Object.create(null);
            this._modelService = modelService;
            this._query = query;
            if (this._query) {
                this._modelService.onModelAdded(this._onModelAdded, this, this._disposables);
                this._modelService.onModelRemoved(this._onModelRemoved, this, this._disposables);
            }
        }
        SearchResult.prototype._onModelAdded = function (model) {
            var resource = model.getAssociatedResource(), fileMatch = this._matches[resource.toString()];
            if (fileMatch) {
                var liveMatch = new LiveFileMatch(this, resource, this._query, model, fileMatch);
                liveMatch.updateHighlights();
                this._matches[resource.toString()] = liveMatch;
                this.emit('changed', this);
            }
        };
        SearchResult.prototype._onModelRemoved = function (model) {
            var _this = this;
            var resource = model.getAssociatedResource(), fileMatch = this._matches[resource.toString()];
            if (fileMatch instanceof LiveFileMatch) {
                this.deferredEmit(function () {
                    _this.remove(fileMatch);
                    _this._matches[resource.toString()] = fileMatch._diskFileMatch;
                });
            }
        };
        SearchResult.prototype.append = function (raw) {
            var _this = this;
            raw.forEach(function (rawFileMatch) {
                var fileMatch = _this._getOrAdd(rawFileMatch);
                if (fileMatch instanceof LiveFileMatch) {
                    fileMatch = fileMatch._diskFileMatch;
                }
                rawFileMatch.lineMatches.forEach(function (rawLineMatch) {
                    rawLineMatch.offsetAndLengths.forEach(function (offsetAndLength) {
                        var match = new Match(fileMatch, rawLineMatch.preview, rawLineMatch.lineNumber, offsetAndLength[0], offsetAndLength[1]);
                        fileMatch.add(match);
                    });
                });
            });
        };
        SearchResult.prototype._getOrAdd = function (raw) {
            var _this = this;
            return collections.lookupOrInsert(this._matches, raw.resource.toString(), function () {
                var model = _this._modelService.getModel(raw.resource), fileMatch = new FileMatch(_this, raw.resource);
                if (model && _this._query) {
                    fileMatch = new LiveFileMatch(_this, raw.resource, _this._query, model, fileMatch);
                }
                return fileMatch;
            });
        };
        SearchResult.prototype.remove = function (match) {
            delete this._matches[match.resource().toString()];
            match.dispose();
            this.emit('changed', this);
        };
        SearchResult.prototype.matches = function () {
            return collections.values(this._matches);
        };
        SearchResult.prototype.isEmpty = function () {
            return this.fileCount() === 0;
        };
        SearchResult.prototype.fileCount = function () {
            return Object.keys(this._matches).length;
        };
        SearchResult.prototype.count = function () {
            return this.matches().reduce(function (prev, match) { return prev + match.count(); }, 0);
        };
        SearchResult.prototype.toggleHighlights = function (value) {
            if (this._showHighlights === value) {
                return;
            }
            this._showHighlights = value;
            for (var resource in this._matches) {
                var match = this._matches[resource];
                if (match instanceof LiveFileMatch) {
                    match.updateHighlights();
                }
            }
        };
        SearchResult.prototype.dispose = function () {
            this._disposables = lifecycle.dispose(this._disposables);
            lifecycle.dispose(this.matches());
            _super.prototype.dispose.call(this);
        };
        SearchResult = __decorate([
            __param(1, modelService_1.IModelService)
        ], SearchResult);
        return SearchResult;
    }(eventEmitter_1.EventEmitter));
    exports.SearchResult = SearchResult;
});
//# sourceMappingURL=searchModel.js.map