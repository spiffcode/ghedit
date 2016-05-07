define(["require", "exports", 'vs/base/common/errors', 'vs/base/common/event', 'vs/base/common/lifecycle', 'vs/base/common/strings', 'vs/base/common/winjs.base', 'vs/editor/common/editorCommon', 'vs/editor/common/modes', 'vs/editor/contrib/snippet/common/snippet', '../common/suggest', './completionModel'], function (require, exports, errors_1, event_1, lifecycle_1, strings_1, winjs_base_1, editorCommon_1, modes_1, snippet_1, suggest_1, completionModel_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var Context = (function () {
        function Context(editor, auto) {
            this.auto = auto;
            var model = editor.getModel();
            var position = editor.getPosition();
            var lineContent = model.getLineContent(position.lineNumber);
            var wordUnderCursor = model.getWordAtPosition(position);
            if (wordUnderCursor) {
                this.wordBefore = lineContent.substring(wordUnderCursor.startColumn - 1, position.column - 1);
                this.wordAfter = lineContent.substring(position.column - 1, wordUnderCursor.endColumn - 1);
            }
            else {
                this.wordBefore = '';
                this.wordAfter = '';
            }
            this.lineNumber = position.lineNumber;
            this.column = position.column;
            this.lineContentBefore = lineContent.substr(0, position.column - 1);
            this.lineContentAfter = lineContent.substr(position.column - 1);
            this.isInEditableRange = true;
            if (model.hasEditableRange()) {
                var editableRange = model.getEditableRange();
                if (!editableRange.containsPosition(position)) {
                    this.isInEditableRange = false;
                }
            }
            var lineContext = model.getLineContext(position.lineNumber);
            var character = model.getLineContent(position.lineNumber).charAt(position.column - 1);
            var supports = modes_1.SuggestRegistry.all(model);
            this.isAutoTriggerEnabled = supports.some(function (s) { return s.shouldAutotriggerSuggest(lineContext, position.column - 1, character); });
        }
        Context.prototype.shouldAutoTrigger = function () {
            if (!this.isAutoTriggerEnabled) {
                // Support disallows it
                return false;
            }
            if (this.wordBefore.length === 0) {
                // Word before position is empty
                return false;
            }
            if (!isNaN(Number(this.wordBefore))) {
                // Word before is number only
                return false;
            }
            if (this.wordAfter.length > 0) {
                // Word after position is non empty
                return false;
            }
            return true;
        };
        Context.prototype.isDifferentContext = function (context) {
            if (this.lineNumber !== context.lineNumber) {
                // Line number has changed
                return true;
            }
            if (context.column < this.column - this.wordBefore.length) {
                // column went before word start
                return true;
            }
            if (!strings_1.startsWith(context.lineContentBefore, this.lineContentBefore) || this.lineContentAfter !== context.lineContentAfter) {
                // Line has changed before position
                return true;
            }
            if (context.wordBefore === '' && context.lineContentBefore !== this.lineContentBefore) {
                // Most likely a space has been typed
                return true;
            }
            return false;
        };
        Context.prototype.shouldRetrigger = function (context) {
            if (!strings_1.startsWith(this.lineContentBefore, context.lineContentBefore) || this.lineContentAfter !== context.lineContentAfter) {
                // Doesn't look like the same line
                return false;
            }
            if (this.lineContentBefore.length > context.lineContentBefore.length && this.wordBefore.length === 0) {
                // Text was deleted and previous current word was empty
                return false;
            }
            if (this.auto && context.wordBefore.length === 0) {
                // Currently in auto mode and new current word is empty
                return false;
            }
            return true;
        };
        return Context;
    }());
    var State;
    (function (State) {
        State[State["Idle"] = 0] = "Idle";
        State[State["Manual"] = 1] = "Manual";
        State[State["Auto"] = 2] = "Auto";
    })(State || (State = {}));
    var SuggestModel = (function () {
        function SuggestModel(editor) {
            var _this = this;
            this.editor = editor;
            this._onDidCancel = new event_1.Emitter();
            this._onDidTrigger = new event_1.Emitter();
            this._onDidSuggest = new event_1.Emitter();
            this._onDidAccept = new event_1.Emitter();
            this.state = State.Idle;
            this.triggerAutoSuggestPromise = null;
            this.requestPromise = null;
            this.raw = null;
            this.completionModel = null;
            this.incomplete = false;
            this.context = null;
            this.toDispose = [];
            this.toDispose.push(this.editor.addListener2(editorCommon_1.EventType.ConfigurationChanged, function () { return _this.onEditorConfigurationChange(); }));
            this.toDispose.push(this.editor.addListener2(editorCommon_1.EventType.CursorSelectionChanged, function (e) { return _this.onCursorChange(e); }));
            this.toDispose.push(this.editor.addListener2(editorCommon_1.EventType.ModelChanged, function () { return _this.cancel(); }));
            this.onEditorConfigurationChange();
        }
        Object.defineProperty(SuggestModel.prototype, "onDidCancel", {
            get: function () { return this._onDidCancel.event; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SuggestModel.prototype, "onDidTrigger", {
            get: function () { return this._onDidTrigger.event; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SuggestModel.prototype, "onDidSuggest", {
            get: function () { return this._onDidSuggest.event; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SuggestModel.prototype, "onDidAccept", {
            get: function () { return this._onDidAccept.event; },
            enumerable: true,
            configurable: true
        });
        SuggestModel.prototype.cancel = function (silent, retrigger) {
            if (silent === void 0) { silent = false; }
            if (retrigger === void 0) { retrigger = false; }
            var actuallyCanceled = this.state !== State.Idle;
            if (this.triggerAutoSuggestPromise) {
                this.triggerAutoSuggestPromise.cancel();
                this.triggerAutoSuggestPromise = null;
            }
            if (this.requestPromise) {
                this.requestPromise.cancel();
                this.requestPromise = null;
            }
            this.state = State.Idle;
            this.raw = null;
            this.completionModel = null;
            this.incomplete = false;
            this.context = null;
            if (!silent) {
                this._onDidCancel.fire({ retrigger: retrigger });
            }
            return actuallyCanceled;
        };
        SuggestModel.prototype.getRequestPosition = function () {
            if (!this.context) {
                return null;
            }
            return {
                lineNumber: this.context.lineNumber,
                column: this.context.column
            };
        };
        SuggestModel.prototype.isAutoSuggest = function () {
            return this.state === State.Auto;
        };
        SuggestModel.prototype.onCursorChange = function (e) {
            var _this = this;
            if (!e.selection.isEmpty()) {
                this.cancel();
                return;
            }
            if (e.source !== 'keyboard' || e.reason !== '') {
                this.cancel();
                return;
            }
            if (!modes_1.SuggestRegistry.has(this.editor.getModel())) {
                return;
            }
            var isInactive = this.state === State.Idle;
            if (isInactive && !this.editor.getConfiguration().quickSuggestions) {
                return;
            }
            var ctx = new Context(this.editor, false);
            if (isInactive) {
                // trigger was not called or it was canceled
                this.cancel();
                if (ctx.shouldAutoTrigger()) {
                    this.triggerAutoSuggestPromise = winjs_base_1.TPromise.timeout(this.autoSuggestDelay);
                    this.triggerAutoSuggestPromise.then(function () {
                        _this.triggerAutoSuggestPromise = null;
                        _this.trigger(true);
                    });
                }
            }
            else if (this.raw && this.incomplete) {
                this.trigger(this.state === State.Auto, undefined, true);
            }
            else {
                this.onNewContext(ctx);
            }
        };
        SuggestModel.prototype.trigger = function (auto, triggerCharacter, retrigger, groups) {
            var _this = this;
            if (retrigger === void 0) { retrigger = false; }
            var model = this.editor.getModel();
            var characterTriggered = !!triggerCharacter;
            groups = groups || modes_1.SuggestRegistry.orderedGroups(model);
            if (groups.length === 0) {
                return;
            }
            var ctx = new Context(this.editor, auto);
            if (!ctx.isInEditableRange) {
                return;
            }
            // Cancel previous requests, change state & update UI
            this.cancel(false, retrigger);
            this.state = (auto || characterTriggered) ? State.Auto : State.Manual;
            this._onDidTrigger.fire({ auto: this.isAutoSuggest(), characterTriggered: characterTriggered, retrigger: retrigger });
            // Capture context when request was sent
            this.context = ctx;
            var position = this.editor.getPosition();
            this.requestPromise = suggest_1.suggest(model, position, triggerCharacter, groups).then(function (all) {
                _this.requestPromise = null;
                if (_this.state === State.Idle) {
                    return;
                }
                _this.raw = all;
                _this.incomplete = all.some(function (result) { return result.incomplete; });
                _this.onNewContext(new Context(_this.editor, auto));
            }).then(null, errors_1.onUnexpectedError);
        };
        SuggestModel.prototype.onNewContext = function (ctx) {
            if (this.context && this.context.isDifferentContext(ctx)) {
                if (this.context.shouldRetrigger(ctx)) {
                    this.trigger(this.state === State.Auto, undefined, true);
                }
                else {
                    this.cancel();
                }
                return;
            }
            if (this.raw) {
                var auto = this.isAutoSuggest();
                var isFrozen = false;
                if (this.completionModel && this.completionModel.raw === this.raw) {
                    var oldLineContext = this.completionModel.lineContext;
                    this.completionModel.lineContext = {
                        leadingLineContent: ctx.lineContentBefore,
                        characterCountDelta: this.context
                            ? ctx.column - this.context.column
                            : 0
                    };
                    if (!auto && this.completionModel.items.length === 0) {
                        this.completionModel.lineContext = oldLineContext;
                        isFrozen = true;
                    }
                }
                else {
                    this.completionModel = new completionModel_1.CompletionModel(this.raw, ctx.lineContentBefore);
                }
                this._onDidSuggest.fire({
                    completionModel: this.completionModel,
                    currentWord: ctx.wordBefore,
                    isFrozen: isFrozen,
                    auto: this.isAutoSuggest()
                });
            }
        };
        SuggestModel.prototype.accept = function (suggestion, overwriteBefore, overwriteAfter) {
            if (this.raw === null) {
                return false;
            }
            this._onDidAccept.fire({
                snippet: new snippet_1.CodeSnippet(suggestion.codeSnippet),
                overwriteBefore: overwriteBefore + (this.editor.getPosition().column - this.context.column),
                overwriteAfter: overwriteAfter
            });
            this.cancel();
            return true;
        };
        SuggestModel.prototype.onEditorConfigurationChange = function () {
            this.autoSuggestDelay = this.editor.getConfiguration().quickSuggestionsDelay;
            if (isNaN(this.autoSuggestDelay) || (!this.autoSuggestDelay && this.autoSuggestDelay !== 0) || this.autoSuggestDelay < 0) {
                this.autoSuggestDelay = 10;
            }
        };
        SuggestModel.prototype.dispose = function () {
            this.cancel(true);
            this.toDispose = lifecycle_1.dispose(this.toDispose);
        };
        return SuggestModel;
    }());
    exports.SuggestModel = SuggestModel;
});
//# sourceMappingURL=suggestModel.js.map