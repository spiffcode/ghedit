/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
define(["require", "exports", 'vs/nls!vs/editor/contrib/links/browser/links', 'vs/base/common/errors', 'vs/base/common/keyCodes', 'vs/base/common/platform', 'vs/base/common/severity', 'vs/base/common/uri', 'vs/base/common/winjs.base', 'vs/platform/editor/common/editor', 'vs/platform/message/common/message', 'vs/editor/common/core/range', 'vs/editor/common/editorAction', 'vs/editor/common/editorActionEnablement', 'vs/editor/common/editorCommon', 'vs/editor/common/editorCommonExtensions', 'vs/editor/common/services/editorWorkerService', 'vs/css!./links'], function (require, exports, nls, errors_1, keyCodes_1, platform, severity_1, uri_1, winjs_base_1, editor_1, message_1, range_1, editorAction_1, editorActionEnablement_1, editorCommon, editorCommonExtensions_1, editorWorkerService_1) {
    'use strict';
    var LinkOccurence = (function () {
        function LinkOccurence(link, decorationId /*, changeAccessor:editorCommon.IModelDecorationsChangeAccessor*/) {
            this.link = link;
            this.decorationId = decorationId;
        }
        LinkOccurence.decoration = function (link) {
            return {
                range: {
                    startLineNumber: link.range.startLineNumber,
                    startColumn: link.range.startColumn,
                    endLineNumber: link.range.startLineNumber,
                    endColumn: link.range.endColumn
                },
                options: LinkOccurence._getOptions(link, false)
            };
        };
        LinkOccurence._getOptions = function (link, isActive) {
            var result = '';
            if (link.extraInlineClassName) {
                result = link.extraInlineClassName + ' ';
            }
            if (isActive) {
                result += LinkDetector.CLASS_NAME_ACTIVE;
            }
            else {
                result += LinkDetector.CLASS_NAME;
            }
            return {
                stickiness: editorCommon.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
                inlineClassName: result,
                hoverMessage: LinkDetector.HOVER_MESSAGE_GENERAL
            };
        };
        LinkOccurence.prototype.activate = function (changeAccessor) {
            changeAccessor.changeDecorationOptions(this.decorationId, LinkOccurence._getOptions(this.link, true));
        };
        LinkOccurence.prototype.deactivate = function (changeAccessor) {
            changeAccessor.changeDecorationOptions(this.decorationId, LinkOccurence._getOptions(this.link, false));
        };
        return LinkOccurence;
    }());
    var Link = (function () {
        function Link(source) {
            this.range = new range_1.Range(source.range.startLineNumber, source.range.startColumn, source.range.endLineNumber, source.range.endColumn);
            this.url = source.url;
            this.extraInlineClassName = source.extraInlineClassName || null;
        }
        return Link;
    }());
    var LinkDetector = (function () {
        function LinkDetector(editor, editorService, messageService, editorWorkerService) {
            var _this = this;
            this.editor = editor;
            this.editorService = editorService;
            this.messageService = messageService;
            this.editorWorkerService = editorWorkerService;
            this.listenersToRemove = [];
            this.listenersToRemove.push(editor.addListener('change', function (e) { return _this.onChange(); }));
            this.listenersToRemove.push(editor.addListener(editorCommon.EventType.ModelChanged, function (e) { return _this.onModelChanged(); }));
            this.listenersToRemove.push(editor.addListener(editorCommon.EventType.ModelModeChanged, function (e) { return _this.onModelModeChanged(); }));
            this.listenersToRemove.push(editor.addListener(editorCommon.EventType.ModelModeSupportChanged, function (e) {
                if (e.linkSupport) {
                    _this.onModelModeChanged();
                }
            }));
            this.listenersToRemove.push(this.editor.addListener(editorCommon.EventType.MouseUp, function (e) { return _this.onEditorMouseUp(e); }));
            this.listenersToRemove.push(this.editor.addListener(editorCommon.EventType.MouseMove, function (e) { return _this.onEditorMouseMove(e); }));
            this.listenersToRemove.push(this.editor.addListener(editorCommon.EventType.KeyDown, function (e) { return _this.onEditorKeyDown(e); }));
            this.listenersToRemove.push(this.editor.addListener(editorCommon.EventType.KeyUp, function (e) { return _this.onEditorKeyUp(e); }));
            this.timeoutPromise = null;
            this.computePromise = null;
            this.currentOccurences = {};
            this.activeLinkDecorationId = null;
            this.beginCompute();
        }
        LinkDetector.prototype.isComputing = function () {
            return winjs_base_1.TPromise.is(this.computePromise);
        };
        LinkDetector.prototype.onModelChanged = function () {
            this.lastMouseEvent = null;
            this.currentOccurences = {};
            this.activeLinkDecorationId = null;
            this.stop();
            this.beginCompute();
        };
        LinkDetector.prototype.onModelModeChanged = function () {
            this.stop();
            this.beginCompute();
        };
        LinkDetector.prototype.onChange = function () {
            var _this = this;
            if (!this.timeoutPromise) {
                this.timeoutPromise = winjs_base_1.TPromise.timeout(LinkDetector.RECOMPUTE_TIME);
                this.timeoutPromise.then(function () {
                    _this.timeoutPromise = null;
                    _this.beginCompute();
                });
            }
        };
        LinkDetector.prototype.beginCompute = function () {
            var _this = this;
            if (!this.editor.getModel()) {
                return;
            }
            var modePromise = winjs_base_1.TPromise.as(null);
            var mode = this.editor.getModel().getMode();
            if (mode.linkSupport) {
                modePromise = mode.linkSupport.computeLinks(this.editor.getModel().getAssociatedResource());
            }
            var standardPromise = this.editorWorkerService.computeLinks(this.editor.getModel().getAssociatedResource());
            this.computePromise = winjs_base_1.TPromise.join([modePromise, standardPromise]).then(function (r) {
                var a = r[0];
                var b = r[1];
                if (!a || a.length === 0) {
                    return b || [];
                }
                if (!b || b.length === 0) {
                    return a || [];
                }
                return LinkDetector._linksUnion(a.map(function (el) { return new Link(el); }), b.map(function (el) { return new Link(el); }));
            });
            this.computePromise.then(function (links) {
                _this.updateDecorations(links);
                _this.computePromise = null;
            });
        };
        LinkDetector._linksUnion = function (oldLinks, newLinks) {
            // reunite oldLinks with newLinks and remove duplicates
            var result = [], oldIndex, oldLen, newIndex, newLen, oldLink, newLink, comparisonResult;
            for (oldIndex = 0, newIndex = 0, oldLen = oldLinks.length, newLen = newLinks.length; oldIndex < oldLen && newIndex < newLen;) {
                oldLink = oldLinks[oldIndex];
                newLink = newLinks[newIndex];
                if (range_1.Range.areIntersectingOrTouching(oldLink.range, newLink.range)) {
                    // Remove the oldLink
                    oldIndex++;
                    continue;
                }
                comparisonResult = range_1.Range.compareRangesUsingStarts(oldLink.range, newLink.range);
                if (comparisonResult < 0) {
                    // oldLink is before
                    result.push(oldLink);
                    oldIndex++;
                }
                else {
                    // newLink is before
                    result.push(newLink);
                    newIndex++;
                }
            }
            for (; oldIndex < oldLen; oldIndex++) {
                result.push(oldLinks[oldIndex]);
            }
            for (; newIndex < newLen; newIndex++) {
                result.push(newLinks[newIndex]);
            }
            return result;
        };
        LinkDetector.prototype.updateDecorations = function (links) {
            var _this = this;
            this.editor.changeDecorations(function (changeAccessor) {
                var oldDecorations = [];
                var keys = Object.keys(_this.currentOccurences);
                for (var i_1 = 0, len = keys.length; i_1 < len; i_1++) {
                    var decorationId = keys[i_1];
                    var occurance_1 = _this.currentOccurences[decorationId];
                    oldDecorations.push(occurance_1.decorationId);
                }
                var newDecorations = [];
                if (links) {
                    // Not sure why this is sometimes null
                    for (var i = 0; i < links.length; i++) {
                        newDecorations.push(LinkOccurence.decoration(links[i]));
                    }
                }
                var decorations = changeAccessor.deltaDecorations(oldDecorations, newDecorations);
                _this.currentOccurences = {};
                _this.activeLinkDecorationId = null;
                for (var i_2 = 0, len = decorations.length; i_2 < len; i_2++) {
                    var occurance = new LinkOccurence(links[i_2], decorations[i_2]);
                    _this.currentOccurences[occurance.decorationId] = occurance;
                }
            });
        };
        LinkDetector.prototype.onEditorKeyDown = function (e) {
            if (e.keyCode === LinkDetector.TRIGGER_KEY_VALUE && this.lastMouseEvent) {
                this.onEditorMouseMove(this.lastMouseEvent, e);
            }
        };
        LinkDetector.prototype.onEditorKeyUp = function (e) {
            if (e.keyCode === LinkDetector.TRIGGER_KEY_VALUE) {
                this.cleanUpActiveLinkDecoration();
            }
        };
        LinkDetector.prototype.onEditorMouseMove = function (mouseEvent, withKey) {
            var _this = this;
            this.lastMouseEvent = mouseEvent;
            if (this.isEnabled(mouseEvent, withKey)) {
                this.cleanUpActiveLinkDecoration(); // always remove previous link decoration as their can only be one
                var occurence = this.getLinkOccurence(mouseEvent.target.position);
                if (occurence) {
                    this.editor.changeDecorations(function (changeAccessor) {
                        occurence.activate(changeAccessor);
                        _this.activeLinkDecorationId = occurence.decorationId;
                    });
                }
            }
            else {
                this.cleanUpActiveLinkDecoration();
            }
        };
        LinkDetector.prototype.cleanUpActiveLinkDecoration = function () {
            if (this.activeLinkDecorationId) {
                var occurence = this.currentOccurences[this.activeLinkDecorationId];
                if (occurence) {
                    this.editor.changeDecorations(function (changeAccessor) {
                        occurence.deactivate(changeAccessor);
                    });
                }
                this.activeLinkDecorationId = null;
            }
        };
        LinkDetector.prototype.onEditorMouseUp = function (mouseEvent) {
            if (!this.isEnabled(mouseEvent)) {
                return;
            }
            var occurence = this.getLinkOccurence(mouseEvent.target.position);
            if (!occurence) {
                return;
            }
            this.openLinkOccurence(occurence, mouseEvent.event.altKey);
        };
        LinkDetector.prototype.openLinkOccurence = function (occurence, openToSide) {
            if (!this.editorService) {
                return;
            }
            var link = occurence.link;
            var absoluteUrl = link.url;
            var hashIndex = absoluteUrl.indexOf('#');
            var lineNumber = -1;
            var column = -1;
            if (hashIndex >= 0) {
                var hash = absoluteUrl.substr(hashIndex + 1);
                var selection = hash.split(',');
                if (selection.length > 0) {
                    lineNumber = Number(selection[0]);
                }
                if (selection.length > 1) {
                    column = Number(selection[1]);
                }
                if (lineNumber >= 0 || column >= 0) {
                    absoluteUrl = absoluteUrl.substr(0, hashIndex);
                }
            }
            var url;
            try {
                url = uri_1.default.parse(absoluteUrl);
            }
            catch (err) {
                // invalid url
                this.messageService.show(severity_1.default.Warning, nls.localize(2, null, absoluteUrl));
                return;
            }
            var input = {
                resource: url
            };
            if (lineNumber >= 0) {
                input.options = {
                    selection: { startLineNumber: lineNumber, startColumn: column }
                };
            }
            this.editorService.openEditor(input, openToSide).done(null, errors_1.onUnexpectedError);
        };
        LinkDetector.prototype.getLinkOccurence = function (position) {
            var decorations = this.editor.getModel().getDecorationsInRange({
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber: position.lineNumber,
                endColumn: position.column
            }, null, true);
            for (var i = 0; i < decorations.length; i++) {
                var decoration = decorations[i];
                var currentOccurence = this.currentOccurences[decoration.id];
                if (currentOccurence) {
                    return currentOccurence;
                }
            }
            return null;
        };
        LinkDetector.prototype.isEnabled = function (mouseEvent, withKey) {
            return mouseEvent.target.type === editorCommon.MouseTargetType.CONTENT_TEXT &&
                (mouseEvent.event[LinkDetector.TRIGGER_MODIFIER] || (withKey && withKey.keyCode === LinkDetector.TRIGGER_KEY_VALUE));
        };
        LinkDetector.prototype.stop = function () {
            if (this.timeoutPromise) {
                this.timeoutPromise.cancel();
                this.timeoutPromise = null;
            }
            if (this.computePromise) {
                this.computePromise.cancel();
                this.computePromise = null;
            }
        };
        LinkDetector.prototype.dispose = function () {
            this.listenersToRemove.forEach(function (element) {
                element();
            });
            this.listenersToRemove = [];
            this.stop();
        };
        LinkDetector.RECOMPUTE_TIME = 1000; // ms
        LinkDetector.TRIGGER_KEY_VALUE = platform.isMacintosh ? keyCodes_1.KeyCode.Meta : keyCodes_1.KeyCode.Ctrl;
        LinkDetector.TRIGGER_MODIFIER = platform.isMacintosh ? 'metaKey' : 'ctrlKey';
        LinkDetector.HOVER_MESSAGE_GENERAL = platform.isMacintosh ? nls.localize(0, null) : nls.localize(1, null);
        LinkDetector.CLASS_NAME = 'detected-link';
        LinkDetector.CLASS_NAME_ACTIVE = 'detected-link-active';
        return LinkDetector;
    }());
    var OpenLinkAction = (function (_super) {
        __extends(OpenLinkAction, _super);
        function OpenLinkAction(descriptor, editor, editorService, messageService, editorWorkerService) {
            _super.call(this, descriptor, editor, editorActionEnablement_1.Behaviour.WidgetFocus | editorActionEnablement_1.Behaviour.UpdateOnCursorPositionChange);
            this._linkDetector = new LinkDetector(editor, editorService, messageService, editorWorkerService);
        }
        OpenLinkAction.prototype.dispose = function () {
            this._linkDetector.dispose();
            _super.prototype.dispose.call(this);
        };
        OpenLinkAction.prototype.getEnablementState = function () {
            if (this._linkDetector.isComputing()) {
                // optimistic enablement while state is being computed
                return true;
            }
            return !!this._linkDetector.getLinkOccurence(this.editor.getPosition());
        };
        OpenLinkAction.prototype.run = function () {
            var link = this._linkDetector.getLinkOccurence(this.editor.getPosition());
            if (link) {
                this._linkDetector.openLinkOccurence(link, false);
            }
            return winjs_base_1.TPromise.as(null);
        };
        OpenLinkAction.ID = 'editor.action.openLink';
        OpenLinkAction = __decorate([
            __param(2, editor_1.IEditorService),
            __param(3, message_1.IMessageService),
            __param(4, editorWorkerService_1.IEditorWorkerService)
        ], OpenLinkAction);
        return OpenLinkAction;
    }(editorAction_1.EditorAction));
    editorCommonExtensions_1.CommonEditorRegistry.registerEditorAction(new editorCommonExtensions_1.EditorActionDescriptor(OpenLinkAction, OpenLinkAction.ID, nls.localize(3, null)));
});
//# sourceMappingURL=links.js.map