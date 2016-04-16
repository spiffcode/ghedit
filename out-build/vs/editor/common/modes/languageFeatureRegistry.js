/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/arrays', 'vs/base/common/event', 'vs/editor/common/modes/languageSelector'], function (require, exports, arrays_1, event_1, languageSelector_1) {
    'use strict';
    var LanguageFeatureRegistry = (function () {
        function LanguageFeatureRegistry(supportName) {
            this._clock = 0;
            this._entries = [];
            this._onDidChange = new event_1.Emitter();
            this._supportName = supportName;
        }
        Object.defineProperty(LanguageFeatureRegistry.prototype, "onDidChange", {
            get: function () {
                return this._onDidChange.event;
            },
            enumerable: true,
            configurable: true
        });
        LanguageFeatureRegistry.prototype.register = function (selector, provider) {
            var _this = this;
            var entry = {
                selector: selector,
                provider: provider,
                _score: -1,
                _time: this._clock++
            };
            this._entries.push(entry);
            this._lastCandidate = undefined;
            this._onDidChange.fire(this._entries.length);
            return {
                dispose: function () {
                    if (entry) {
                        var idx = _this._entries.indexOf(entry);
                        if (idx >= 0) {
                            _this._entries.splice(idx, 1);
                            _this._lastCandidate = undefined;
                            _this._onDidChange.fire(_this._entries.length);
                            entry = undefined;
                        }
                    }
                }
            };
        };
        LanguageFeatureRegistry.prototype.has = function (model) {
            return this.all(model).length > 0;
        };
        LanguageFeatureRegistry.prototype.all = function (model) {
            if (!model || model.isTooLargeForHavingAMode()) {
                return [];
            }
            this._updateScores(model);
            var result = [];
            // (1) from registry
            for (var _i = 0, _a = this._entries; _i < _a.length; _i++) {
                var entry = _a[_i];
                if (entry._score > 0) {
                    result.push(entry.provider);
                }
            }
            // (2) from mode
            if (model.getMode() && model.getMode()[this._supportName]) {
                result.push(model.getMode()[this._supportName]);
            }
            return result;
        };
        LanguageFeatureRegistry.prototype.ordered = function (model) {
            var result = [];
            this._orderedForEach(model, function (entry) { return result.push(entry.provider); });
            return result;
        };
        LanguageFeatureRegistry.prototype.orderedGroups = function (model) {
            var result = [];
            var lastBucket;
            var lastBucketScore;
            this._orderedForEach(model, function (entry) {
                if (lastBucket && lastBucketScore === entry._score) {
                    lastBucket.push(entry.provider);
                }
                else {
                    lastBucketScore = entry._score;
                    lastBucket = [entry.provider];
                    result.push(lastBucket);
                }
            });
            return result;
        };
        LanguageFeatureRegistry.prototype._orderedForEach = function (model, callback) {
            if (!model || model.isTooLargeForHavingAMode()) {
                return;
            }
            this._updateScores(model);
            var supportIndex = -1;
            var supportEntry;
            if (model.getMode() && model.getMode()[this._supportName]) {
                supportEntry = {
                    selector: undefined,
                    provider: model.getMode()[this._supportName],
                    _score: .5,
                    _time: -1
                };
                supportIndex = ~arrays_1.binarySearch(this._entries, supportEntry, LanguageFeatureRegistry._compareByScoreAndTime);
            }
            var to = Math.max(supportIndex + 1, this._entries.length);
            for (var from = 0; from < to; from++) {
                if (from === supportIndex) {
                    callback(supportEntry);
                }
                else {
                    var entry = this._entries[from];
                    if (entry._score > 0) {
                        callback(entry);
                    }
                }
            }
        };
        LanguageFeatureRegistry.prototype._updateScores = function (model) {
            var candidate = {
                uri: model.getAssociatedResource().toString(),
                language: model.getModeId()
            };
            if (this._lastCandidate
                && this._lastCandidate.language === candidate.language
                && this._lastCandidate.uri === candidate.uri) {
                // nothing has changed
                return;
            }
            this._lastCandidate = candidate;
            for (var _i = 0, _a = this._entries; _i < _a.length; _i++) {
                var entry = _a[_i];
                entry._score = languageSelector_1.score(entry.selector, model.getAssociatedResource(), model.getModeId());
            }
            // needs sorting
            this._entries.sort(LanguageFeatureRegistry._compareByScoreAndTime);
        };
        LanguageFeatureRegistry._compareByScoreAndTime = function (a, b) {
            if (a._score < b._score) {
                return 1;
            }
            else if (a._score > b._score) {
                return -1;
            }
            else if (a._time < b._time) {
                return 1;
            }
            else if (a._time > b._time) {
                return -1;
            }
            else {
                return 0;
            }
        };
        return LanguageFeatureRegistry;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = LanguageFeatureRegistry;
});
