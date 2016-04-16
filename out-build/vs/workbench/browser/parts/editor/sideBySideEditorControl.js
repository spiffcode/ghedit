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
define(["require", "exports", 'vs/nls', 'vs/platform/platform', 'vs/workbench/browser/actionBarRegistry', 'vs/base/common/actions', 'vs/base/common/arrays', 'vs/base/common/eventEmitter', 'vs/base/browser/mouseEvent', 'vs/base/common/errors', 'vs/base/common/platform', 'vs/base/common/types', 'vs/base/browser/builder', 'vs/base/browser/ui/sash/sash', 'vs/base/browser/ui/progressbar/progressbar', 'vs/workbench/common/editor', 'vs/workbench/common/editor/diffEditorInput', 'vs/base/common/events', 'vs/workbench/common/events', 'vs/base/browser/dom', 'vs/base/browser/ui/actionbar/actionbar', 'vs/base/browser/ui/toolbar/toolbar', 'vs/workbench/services/editor/common/editorService', 'vs/workbench/services/quickopen/common/quickOpenService', 'vs/workbench/services/workspace/common/contextService', 'vs/platform/contextview/browser/contextView', 'vs/platform/editor/common/editor', 'vs/platform/event/common/event', 'vs/platform/message/common/message', 'vs/platform/telemetry/common/telemetry', 'vs/css!./media/sidebyside'], function (require, exports, nls, platform_1, actionBarRegistry_1, actions_1, arrays, eventEmitter_1, mouseEvent_1, errors, platform_2, types, builder_1, sash_1, progressbar_1, editor_1, diffEditorInput_1, events_1, events_2, DOM, actionbar_1, toolbar_1, editorService_1, quickOpenService_1, contextService_1, contextView_1, editor_2, event_1, message_1, telemetry_1) {
    'use strict';
    (function (Rochade) {
        Rochade[Rochade["NONE"] = 0] = "NONE";
        Rochade[Rochade["CENTER_TO_LEFT"] = 1] = "CENTER_TO_LEFT";
        Rochade[Rochade["RIGHT_TO_CENTER"] = 2] = "RIGHT_TO_CENTER";
        Rochade[Rochade["CENTER_AND_RIGHT_TO_LEFT"] = 3] = "CENTER_AND_RIGHT_TO_LEFT";
    })(exports.Rochade || (exports.Rochade = {}));
    var Rochade = exports.Rochade;
    exports.EventType = {
        EDITOR_FOCUS_CHANGED: 'editorFocusChanged'
    };
    /**
     * Helper class to manage multiple side by side editors for the editor part.
     */
    var SideBySideEditorControl = (function (_super) {
        __extends(SideBySideEditorControl, _super);
        function SideBySideEditorControl(parent, editorService, messageService, quickOpenService, telemetryService, contextViewService, contextMenuService, eventService, contextService) {
            var _this = this;
            _super.call(this);
            this.editorService = editorService;
            this.messageService = messageService;
            this.quickOpenService = quickOpenService;
            this.telemetryService = telemetryService;
            this.contextViewService = contextViewService;
            this.contextMenuService = contextMenuService;
            this.eventService = eventService;
            this.contextService = contextService;
            this.parent = parent;
            this.dimension = new builder_1.Dimension(0, 0);
            this.containers = [];
            this.containerWidth = [];
            this.titleContainer = [];
            this.titleLabel = [];
            this.titleDescription = [];
            this.editorInputStateDescription = [];
            this.editorActionsToolbar = [];
            this.progressBar = [];
            this.visibleEditors = [];
            this.visibleEditorContainers = [];
            this.visibleEditorFocusTrackers = [];
            this.closeEditorAction = editor_2.POSITIONS.map(function (position) {
                return _this.makeCloseEditorAction(position);
            });
            this.splitEditorAction = this.makeSplitEditorAction();
            this.initStyles();
            this.registerListeners();
            // Create
            this.create(this.parent);
        }
        SideBySideEditorControl.prototype.registerListeners = function () {
            var _this = this;
            // Update editor input state indicators on state changes
            this.editorInputStateChangeListener = this.eventService.addListener(events_2.EventType.EDITOR_INPUT_STATE_CHANGED, function (event) {
                _this.updateEditorInputStateIndicator(event);
            });
        };
        SideBySideEditorControl.prototype.initStyles = function () {
            var grabCursor = platform_2.isWindows ? 'cursor: url("' + require.toUrl('vs/workbench/browser/parts/editor/media/grab.cur') + '"), move;' : 'cursor: -webkit-grab;';
            var grabbingCursor = platform_2.isWindows ? 'cursor: url("' + require.toUrl('vs/workbench/browser/parts/editor/media/grabbing.cur') + '"), move;' : 'cursor: -webkit-grabbing;';
            DOM.createCSSRule('.monaco-workbench > .part.editor > .content.multiple-editors .one-editor-container .title, ' +
                '.monaco-workbench > .part.editor > .content.multiple-editors .one-editor-container .title .title-label a, ' +
                '.monaco-workbench > .part.editor > .content.multiple-editors .one-editor-container .title .title-label span', grabCursor);
            DOM.createCSSRule('#monaco-workbench-editor-move-overlay, ' +
                '.monaco-workbench > .part.editor > .content.multiple-editors .one-editor-container.dragged, ' +
                '.monaco-workbench > .part.editor > .content.multiple-editors .one-editor-container.dragged .title, ' +
                '.monaco-workbench > .part.editor > .content.multiple-editors .one-editor-container.dragged .title .title-label a, ' +
                '.monaco-workbench > .part.editor > .content.multiple-editors .one-editor-container.dragged .title .title-label span, ' +
                '.monaco-workbench > .part.editor > .content.multiple-editors .one-editor-container.dragged .monaco-editor .view-lines', grabbingCursor);
        };
        SideBySideEditorControl.prototype.makeCloseEditorAction = function (position) {
            var _this = this;
            return new actions_1.Action('close.editor.action', nls.localize('close', "Close"), 'close-editor-action', true, function () {
                return _this.editorService.closeEditor(position);
            });
        };
        SideBySideEditorControl.prototype.makeSplitEditorAction = function () {
            var _this = this;
            return new actions_1.Action('split.editor.action', nls.localize('splitEditor', "Split Editor"), 'split-editor-action', true, function () {
                var activeEditor = _this.editorService.getActiveEditor();
                var editorCount = _this.getVisibleEditorCount();
                // Special case: If the user wants to split the left hand editor with 2 editors open, push the center one to the right
                if (editorCount > 1 && activeEditor.position === editor_2.Position.LEFT) {
                    var centerInput_1 = _this.visibleEditors[editor_2.Position.CENTER].input;
                    var options_1 = new editor_1.TextEditorOptions();
                    options_1.preserveFocus = true;
                    return _this.editorService.openEditor(activeEditor.input, options_1, editor_2.Position.CENTER).then(function () {
                        return _this.editorService.openEditor(centerInput_1, options_1, editor_2.Position.RIGHT).then(function () {
                            return _this.editorService.focusEditor(editor_2.Position.CENTER);
                        });
                    });
                }
                // Otherwise just continue to open to the side
                return _this.editorService.openEditor(activeEditor.input, null, true);
            });
        };
        SideBySideEditorControl.prototype.show = function (editor, container, position, preserveActive, widthRatios) {
            var visibleEditorCount = this.getVisibleEditorCount();
            // Store into editor bucket
            this.visibleEditors[position] = editor;
            this.visibleEditorContainers[position] = container;
            // Store as active unless preserveActive is set
            if (!preserveActive || !this.lastActiveEditor) {
                this.doSetActive(editor, position);
            }
            // Track focus
            this.trackFocus(editor, position);
            // Find target container and build into
            var target = this.containers[position];
            container.build(target);
            // Adjust layout according to provided ratios (used when restoring multiple editors at once)
            if (widthRatios && (widthRatios.length === 2 || widthRatios.length === 3)) {
                var hasLayoutInfo = this.dimension && this.dimension.width;
                // We received width ratios but were not layouted yet. So we keep these ratios for when we layout()
                if (!hasLayoutInfo) {
                    this.containerInitialRatios = widthRatios;
                }
                // Adjust layout: -> [!][!]
                if (widthRatios.length === 2) {
                    if (hasLayoutInfo) {
                        this.containerWidth[position] = this.dimension.width * widthRatios[position];
                    }
                }
                else if (widthRatios.length === 3) {
                    if (hasLayoutInfo) {
                        this.containerWidth[position] = this.dimension.width * widthRatios[position];
                    }
                    if (this.rightSash.isHidden()) {
                        this.rightSash.show();
                        this.rightSash.layout();
                    }
                }
                if (this.leftSash.isHidden()) {
                    this.leftSash.show();
                    this.leftSash.layout();
                }
                if (hasLayoutInfo) {
                    this.layoutContainers();
                }
            }
            else if (visibleEditorCount === 0 && this.dimension) {
                this.containerWidth[position] = this.dimension.width;
                this.layoutContainers();
            }
            else if (position === editor_2.Position.CENTER && this.leftSash.isHidden() && this.rightSash.isHidden() && this.dimension) {
                this.containerWidth[editor_2.Position.LEFT] = this.dimension.width / 2;
                this.containerWidth[editor_2.Position.CENTER] = this.dimension.width - this.containerWidth[editor_2.Position.LEFT];
                this.leftSash.show();
                this.leftSash.layout();
                this.layoutContainers();
            }
            else if (position === editor_2.Position.RIGHT && this.rightSash.isHidden() && this.dimension) {
                this.containerWidth[editor_2.Position.LEFT] = this.dimension.width / 3;
                this.containerWidth[editor_2.Position.CENTER] = this.dimension.width / 3;
                this.containerWidth[editor_2.Position.RIGHT] = this.dimension.width - this.containerWidth[editor_2.Position.LEFT] - this.containerWidth[editor_2.Position.CENTER];
                this.leftSash.layout();
                this.rightSash.show();
                this.rightSash.layout();
                this.layoutContainers();
            }
            // Show editor container
            container.show();
            // Styles
            this.updateParentStyle();
        };
        SideBySideEditorControl.prototype.getVisibleEditorCount = function () {
            var c = 0;
            this.visibleEditors.forEach(function (editor) {
                if (editor) {
                    c++;
                }
            });
            return c;
        };
        SideBySideEditorControl.prototype.indexOf = function (editor) {
            return this.visibleEditors.indexOf(editor);
        };
        SideBySideEditorControl.prototype.trackFocus = function (editor, position) {
            var _this = this;
            // In case there is a previous tracker on the position, dispose it first
            if (this.visibleEditorFocusTrackers[position]) {
                this.visibleEditorFocusTrackers[position].dispose();
            }
            // Track focus on editor container
            this.visibleEditorFocusTrackers[position] = DOM.trackFocus(editor.getContainer().getHTMLElement());
            this.visibleEditorFocusTrackers[position].addFocusListener(function () {
                _this.onFocusGained(editor);
            });
        };
        SideBySideEditorControl.prototype.onFocusGained = function (editor) {
            this.setActive(editor);
        };
        SideBySideEditorControl.prototype.setActive = function (editor) {
            var _this = this;
            // Update active editor and position
            if (this.lastActiveEditor !== editor) {
                this.doSetActive(editor, this.indexOf(editor));
                // Automatically maximize this position if it has min editor width
                if (this.containerWidth[this.lastActivePosition] === SideBySideEditorControl.MIN_EDITOR_WIDTH) {
                    // Log this fact in telemetry
                    if (this.telemetryService) {
                        this.telemetryService.publicLog('workbenchEditorMaximized');
                    }
                    var remainingWidth_1 = this.dimension.width;
                    // Minimize all other positions to min width
                    editor_2.POSITIONS.forEach(function (p) {
                        if (_this.lastActivePosition !== p && !!_this.visibleEditors[p]) {
                            _this.containerWidth[p] = SideBySideEditorControl.MIN_EDITOR_WIDTH;
                            remainingWidth_1 -= _this.containerWidth[p];
                        }
                    });
                    // Grow focussed position if there is more width to spend
                    if (remainingWidth_1 > SideBySideEditorControl.MIN_EDITOR_WIDTH) {
                        this.containerWidth[this.lastActivePosition] = remainingWidth_1;
                        if (!this.leftSash.isHidden()) {
                            this.leftSash.layout();
                        }
                        if (!this.rightSash.isHidden()) {
                            this.rightSash.layout();
                        }
                        this.layoutContainers();
                    }
                }
                // Re-emit to outside
                this.emit(exports.EventType.EDITOR_FOCUS_CHANGED);
            }
        };
        SideBySideEditorControl.prototype.focusNextNonMinimized = function () {
            var _this = this;
            // If the current focussed editor is minimized, try to focus the next largest editor
            if (!types.isUndefinedOrNull(this.lastActivePosition) && this.containerWidth[this.lastActivePosition] === SideBySideEditorControl.MIN_EDITOR_WIDTH) {
                var candidate_1 = null;
                var currentWidth_1 = SideBySideEditorControl.MIN_EDITOR_WIDTH;
                editor_2.POSITIONS.forEach(function (position) {
                    // Skip current active position and check if the editor is larger than min width
                    if (position !== _this.lastActivePosition) {
                        if (_this.visibleEditors[position] && _this.containerWidth[position] > currentWidth_1) {
                            candidate_1 = position;
                            currentWidth_1 = _this.containerWidth[position];
                        }
                    }
                });
                // Focus editor if a candidate has been found
                if (!types.isUndefinedOrNull(candidate_1)) {
                    this.editorService.focusEditor(this.visibleEditors[candidate_1]).done(null, errors.onUnexpectedError);
                }
            }
        };
        SideBySideEditorControl.prototype.hide = function (editor, container, position, layoutAndRochade) {
            var result = Rochade.NONE;
            var visibleEditorCount = this.getVisibleEditorCount();
            var hasCenter = !!this.visibleEditors[editor_2.Position.CENTER];
            var hasRight = !!this.visibleEditors[editor_2.Position.RIGHT];
            // If editor is not showing for position, return
            if (editor !== this.visibleEditors[position]) {
                return result;
            }
            // Clear Position
            this.clearPosition(position);
            // Take editor container offdom and hide
            container.offDOM();
            container.hide();
            // Adjust layout and rochade if instructed to do so
            if (layoutAndRochade) {
                // Adjust layout: [x] ->
                if (visibleEditorCount === 1) {
                    this.containerWidth[position] = 0;
                    this.leftSash.hide();
                    this.rightSash.hide();
                    this.layoutContainers();
                }
                else if (hasCenter && !hasRight) {
                    this.containerWidth[editor_2.Position.LEFT] = this.dimension.width;
                    this.containerWidth[editor_2.Position.CENTER] = 0;
                    this.leftSash.hide();
                    this.rightSash.hide();
                    // Move CENTER to LEFT ([x]|[] -> [])
                    if (position === editor_2.Position.LEFT) {
                        this.rochade(editor_2.Position.CENTER, editor_2.Position.LEFT);
                        result = Rochade.CENTER_TO_LEFT;
                        this.clearTitle(editor_2.Position.CENTER); // center closes so clear title
                    }
                    this.layoutContainers();
                }
                else if (hasCenter && hasRight) {
                    this.containerWidth[editor_2.Position.LEFT] = this.dimension.width / 2;
                    this.containerWidth[editor_2.Position.CENTER] = this.dimension.width - this.containerWidth[editor_2.Position.LEFT];
                    this.containerWidth[editor_2.Position.RIGHT] = 0;
                    this.leftSash.layout();
                    this.rightSash.hide();
                    // Move RIGHT to CENTER ([]|[x]|[] -> [ ]|[ ])
                    if (position === editor_2.Position.CENTER) {
                        this.rochade(editor_2.Position.RIGHT, editor_2.Position.CENTER);
                        result = Rochade.RIGHT_TO_CENTER;
                        this.clearTitle(editor_2.Position.RIGHT); // right closes so clear title
                    }
                    else if (position === editor_2.Position.LEFT) {
                        this.rochade(editor_2.Position.CENTER, editor_2.Position.LEFT);
                        this.rochade(editor_2.Position.RIGHT, editor_2.Position.CENTER);
                        result = Rochade.CENTER_AND_RIGHT_TO_LEFT;
                        this.clearTitle(editor_2.Position.RIGHT); // right closes so clear title
                    }
                    this.layoutContainers();
                }
            }
            // Automatically pick the next editor as active if any
            if (this.lastActiveEditor === editor) {
                // Clear old
                this.doSetActive(null, null);
                // Find new active position by taking the next one close to the closed one to the left
                if (layoutAndRochade) {
                    var newActivePosition = void 0;
                    switch (position) {
                        case editor_2.Position.LEFT:
                            newActivePosition = hasCenter ? editor_2.Position.LEFT : null;
                            break;
                        case editor_2.Position.CENTER:
                            newActivePosition = editor_2.Position.LEFT;
                            break;
                        case editor_2.Position.RIGHT:
                            newActivePosition = editor_2.Position.CENTER;
                            break;
                    }
                    if (!types.isUndefinedOrNull(newActivePosition)) {
                        this.doSetActive(this.visibleEditors[newActivePosition], newActivePosition);
                    }
                }
            }
            // Styles
            this.updateParentStyle();
            return result;
        };
        SideBySideEditorControl.prototype.updateParentStyle = function () {
            var editorCount = this.getVisibleEditorCount();
            if (editorCount > 1) {
                this.parent.addClass('multiple-editors');
            }
            else {
                this.parent.removeClass('multiple-editors');
            }
        };
        SideBySideEditorControl.prototype.doSetActive = function (editor, newActive) {
            var oldActive = this.lastActivePosition;
            this.lastActivePosition = newActive;
            this.lastActiveEditor = editor;
            if (!types.isUndefinedOrNull(oldActive)) {
                this.containers[oldActive].addClass('inactive');
                this.containers[oldActive].removeClass('active');
            }
            if (!types.isUndefinedOrNull(newActive)) {
                this.containers[newActive].removeClass('inactive');
                this.containers[newActive].addClass('active');
            }
        };
        SideBySideEditorControl.prototype.clearPosition = function (position) {
            // Unregister Listeners
            if (this.visibleEditorFocusTrackers[position]) {
                this.visibleEditorFocusTrackers[position].dispose();
                this.visibleEditorFocusTrackers[position] = null;
            }
            // Clear from active editors
            this.visibleEditors[position] = null;
            this.visibleEditorContainers[position] = null;
        };
        SideBySideEditorControl.prototype.rochade = function (from, to) {
            // Move editor to new position
            var editorContainer = this.visibleEditorContainers[from];
            var editor = this.visibleEditors[from];
            editorContainer.offDOM();
            editorContainer.build(this.containers[to]);
            editor.changePosition(to);
            // Change data structures
            var listeners = this.visibleEditorFocusTrackers[from];
            this.visibleEditorContainers[to] = editorContainer;
            this.visibleEditors[to] = editor;
            this.visibleEditorFocusTrackers[to] = listeners;
            this.visibleEditorContainers[from] = null;
            this.visibleEditors[from] = null;
            this.visibleEditorFocusTrackers[from] = null;
            // Update last active position
            if (this.lastActivePosition === from) {
                this.doSetActive(this.lastActiveEditor, to);
            }
        };
        SideBySideEditorControl.prototype.move = function (from, to) {
            var editorContainerPos1;
            var editorPos1;
            var editorContainerPos2;
            var editorPos2;
            // Distance 1: Swap Editors
            if (Math.abs(from - to) === 1) {
                // Move editors to new position
                editorContainerPos1 = this.visibleEditorContainers[from];
                editorPos1 = this.visibleEditors[from];
                editorContainerPos1.offDOM();
                editorContainerPos1.build(this.containers[to]);
                editorPos1.changePosition(to);
                editorContainerPos2 = this.visibleEditorContainers[to];
                editorPos2 = this.visibleEditors[to];
                editorContainerPos2.offDOM();
                editorContainerPos2.build(this.containers[from]);
                editorPos2.changePosition(from);
                // Update last active position accordingly
                if (this.lastActivePosition === from) {
                    this.doSetActive(this.lastActiveEditor, to);
                }
                else if (this.lastActivePosition === to) {
                    this.doSetActive(this.lastActiveEditor, from);
                }
            }
            else {
                // Find new positions
                var newLeftPosition = void 0;
                var newCenterPosition = void 0;
                var newRightPosition = void 0;
                if (from === editor_2.Position.LEFT) {
                    newLeftPosition = editor_2.Position.RIGHT;
                    newCenterPosition = editor_2.Position.LEFT;
                    newRightPosition = editor_2.Position.CENTER;
                }
                else {
                    newLeftPosition = editor_2.Position.CENTER;
                    newCenterPosition = editor_2.Position.RIGHT;
                    newRightPosition = editor_2.Position.LEFT;
                }
                // Move editors to new position
                editorContainerPos1 = this.visibleEditorContainers[editor_2.Position.LEFT];
                editorPos1 = this.visibleEditors[editor_2.Position.LEFT];
                editorContainerPos1.offDOM();
                editorContainerPos1.build(this.containers[newLeftPosition]);
                editorPos1.changePosition(newLeftPosition);
                editorContainerPos2 = this.visibleEditorContainers[editor_2.Position.CENTER];
                editorPos2 = this.visibleEditors[editor_2.Position.CENTER];
                editorContainerPos2.offDOM();
                editorContainerPos2.build(this.containers[newCenterPosition]);
                editorPos2.changePosition(newCenterPosition);
                var editorContainerPos3 = this.visibleEditorContainers[editor_2.Position.RIGHT];
                var editorPos3 = this.visibleEditors[editor_2.Position.RIGHT];
                editorContainerPos3.offDOM();
                editorContainerPos3.build(this.containers[newRightPosition]);
                editorPos3.changePosition(newRightPosition);
                // Update last active position accordingly
                if (this.lastActivePosition === editor_2.Position.LEFT) {
                    this.doSetActive(this.lastActiveEditor, newLeftPosition);
                }
                else if (this.lastActivePosition === editor_2.Position.CENTER) {
                    this.doSetActive(this.lastActiveEditor, newCenterPosition);
                }
                else if (this.lastActivePosition === editor_2.Position.RIGHT) {
                    this.doSetActive(this.lastActiveEditor, newRightPosition);
                }
            }
            // Change data structures
            arrays.move(this.visibleEditorContainers, from, to);
            arrays.move(this.visibleEditors, from, to);
            arrays.move(this.visibleEditorFocusTrackers, from, to);
            arrays.move(this.containerWidth, from, to);
            // Layout
            if (!this.leftSash.isHidden()) {
                this.leftSash.layout();
            }
            if (!this.rightSash.isHidden()) {
                this.rightSash.layout();
            }
            this.layoutContainers();
        };
        SideBySideEditorControl.prototype.arrangeEditors = function (arrangement) {
            var _this = this;
            if (!this.dimension) {
                return; // too early
            }
            var availableWidth = this.dimension.width;
            var visibleEditors = this.getVisibleEditorCount();
            if (visibleEditors <= 1) {
                return; // need more editors
            }
            // Minimize Others
            if (arrangement === editorService_1.EditorArrangement.MINIMIZE_OTHERS) {
                editor_2.POSITIONS.forEach(function (position) {
                    if (_this.visibleEditors[position]) {
                        if (position !== _this.lastActivePosition) {
                            _this.containerWidth[position] = SideBySideEditorControl.MIN_EDITOR_WIDTH;
                            availableWidth -= SideBySideEditorControl.MIN_EDITOR_WIDTH;
                        }
                    }
                });
                this.containerWidth[this.lastActivePosition] = availableWidth;
            }
            else if (arrangement === editorService_1.EditorArrangement.EVEN_WIDTH) {
                editor_2.POSITIONS.forEach(function (position) {
                    if (_this.visibleEditors[position]) {
                        _this.containerWidth[position] = availableWidth / visibleEditors;
                    }
                });
            }
            this.layoutControl(this.dimension);
        };
        SideBySideEditorControl.prototype.getWidthRatios = function () {
            var _this = this;
            var ratio = [];
            if (this.dimension) {
                var fullWidth_1 = this.dimension.width;
                editor_2.POSITIONS.forEach(function (position) {
                    if (_this.visibleEditors[position]) {
                        ratio.push(_this.containerWidth[position] / fullWidth_1);
                    }
                });
            }
            return ratio;
        };
        SideBySideEditorControl.prototype.getActiveEditor = function () {
            return this.lastActiveEditor;
        };
        SideBySideEditorControl.prototype.getActivePosition = function () {
            return this.lastActivePosition;
        };
        SideBySideEditorControl.prototype.create = function (parent) {
            var _this = this;
            // Left Container
            this.containers[editor_2.Position.LEFT] = builder_1.$(parent).div({ class: 'one-editor-container editor-left monaco-editor-background' });
            // Left Sash
            this.leftSash = new sash_1.Sash(parent.getHTMLElement(), this, { baseSize: 5 });
            this.leftSash.addListener('start', function () { return _this.onLeftSashDragStart(); });
            this.leftSash.addListener('change', function (e) { return _this.onLeftSashDrag(e); });
            this.leftSash.addListener('end', function () { return _this.onLeftSashDragEnd(); });
            this.leftSash.addListener('reset', function () { return _this.onLeftSashReset(); });
            this.leftSash.hide();
            // Center Container
            this.containers[editor_2.Position.CENTER] = builder_1.$(parent).div({ class: 'one-editor-container editor-center monaco-editor-background' });
            // Right Sash
            this.rightSash = new sash_1.Sash(parent.getHTMLElement(), this, { baseSize: 5 });
            this.rightSash.addListener('start', function () { return _this.onRightSashDragStart(); });
            this.rightSash.addListener('change', function (e) { return _this.onRightSashDrag(e); });
            this.rightSash.addListener('end', function () { return _this.onRightSashDragEnd(); });
            this.rightSash.addListener('reset', function () { return _this.onRightSashReset(); });
            this.rightSash.hide();
            // Right Container
            this.containers[editor_2.Position.RIGHT] = builder_1.$(parent).div({ class: 'one-editor-container editor-right monaco-editor-background' });
            // Title containers
            editor_2.POSITIONS.forEach(function (position) {
                _this.titleContainer[position] = builder_1.$(_this.containers[position]).div({ 'class': 'title' });
                _this.fillTitleArea(builder_1.$(_this.titleContainer[position]), position);
            });
            // Progress Bars per position
            editor_2.POSITIONS.forEach(function (position) {
                _this.progressBar[position] = new progressbar_1.ProgressBar(builder_1.$(_this.containers[position]));
                _this.progressBar[position].getContainer().hide();
            });
        };
        SideBySideEditorControl.prototype.updateEditorInputStateIndicator = function (inputEvent) {
            var _this = this;
            editor_2.POSITIONS.forEach(function (position) {
                if (_this.visibleEditors[position]) {
                    if (_this.isInputRelated(_this.visibleEditors[position].input, inputEvent.editorInput)) {
                        _this.setEditorInputStateIndicator(inputEvent.editorInput, inputEvent.editorInput.getStatus(), position);
                    }
                }
            });
        };
        SideBySideEditorControl.prototype.setEditorInputStateIndicator = function (input, status, position) {
            // Decoration
            var titleLabel = (input && input.getName()) || '';
            if (status && status.decoration) {
                titleLabel = nls.localize({ key: 'inputDecoration', comment: ['editor status indicator (e.g. dirty indicator)', 'editor input title'] }, "{0} {1}", status.decoration, titleLabel);
            }
            this.titleLabel[position].safeInnerHtml(titleLabel);
        };
        SideBySideEditorControl.prototype.isInputRelated = function (sourceInput, targetInput) {
            if (!sourceInput || !targetInput) {
                return false;
            }
            if (sourceInput === targetInput) {
                return true;
            }
            if (sourceInput instanceof diffEditorInput_1.DiffEditorInput) {
                var modifiedInput = sourceInput.getModifiedInput();
                if (modifiedInput === targetInput) {
                    return true;
                }
            }
            return false;
        };
        SideBySideEditorControl.prototype.fillTitleArea = function (parent, position) {
            var _this = this;
            var ignoreClick = false;
            var wasDragged = false;
            // Allow to reorder positions by dragging the title
            parent.on(DOM.EventType.MOUSE_DOWN, function (e) {
                // Reset flag
                ignoreClick = false;
                wasDragged = false;
                // Return early if there is only one editor active or the user clicked into the toolbar
                if (_this.getVisibleEditorCount() <= 1 || DOM.isAncestor(e.target || e.srcElement, _this.editorActionsToolbar[position].getContainer().getHTMLElement())) {
                    return;
                }
                // Only allow for first mouse button click!
                if (e.button !== 0) {
                    return;
                }
                DOM.EventHelper.stop(e);
                // Overlay the editor area with a div to be able to capture all mouse events (helps when iframes are used in any editor)
                var overlayDiv = builder_1.$('div').style({
                    position: 'absolute',
                    top: SideBySideEditorControl.EDITOR_TITLE_HEIGHT + 'px',
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 3000000
                }).id('monaco-workbench-editor-move-overlay');
                overlayDiv.appendTo(_this.parent);
                // Update flag
                _this.dragging = true;
                var visibleEditorCount = _this.getVisibleEditorCount();
                var mouseDownEvent = new mouseEvent_1.StandardMouseEvent(e);
                var startX = mouseDownEvent.posx;
                var oldNewLeft = null;
                _this.containers[position].style({
                    zIndex: 2000000
                });
                var $window = builder_1.$(window);
                $window.on(DOM.EventType.MOUSE_MOVE, function (e) {
                    DOM.EventHelper.stop(e, false);
                    var mouseMoveEvent = new mouseEvent_1.StandardMouseEvent(e);
                    var diffX = mouseMoveEvent.posx - startX;
                    var newLeft = null;
                    if (Math.abs(diffX) > 5) {
                        wasDragged = true;
                    }
                    switch (position) {
                        // [ ! ]|[ ]: Moves only to the right but not outside of dimension width to the right
                        case editor_2.Position.LEFT: {
                            newLeft = Math.max(-1 /* 1px border accomodation */, Math.min(diffX, _this.dimension.width - _this.containerWidth[editor_2.Position.LEFT]));
                            break;
                        }
                        case editor_2.Position.CENTER: {
                            // [ ]|[ ! ]: Moves only to the left but not outside of dimension width to the left
                            if (visibleEditorCount === 2) {
                                newLeft = Math.min(_this.containerWidth[editor_2.Position.LEFT], Math.max(-1 /* 1px border accomodation */, _this.containerWidth[editor_2.Position.LEFT] + diffX));
                            }
                            else {
                                newLeft = Math.min(_this.dimension.width - _this.containerWidth[editor_2.Position.CENTER], Math.max(-1 /* 1px border accomodation */, _this.containerWidth[editor_2.Position.LEFT] + diffX));
                            }
                            break;
                        }
                        // [ ]|[ ]|[ ! ]: Moves to the right but not outside of dimension width on the left side
                        case editor_2.Position.RIGHT: {
                            newLeft = Math.min(_this.containerWidth[editor_2.Position.LEFT] + _this.containerWidth[editor_2.Position.CENTER], Math.max(-1 /* 1px border accomodation */, _this.containerWidth[editor_2.Position.LEFT] + _this.containerWidth[editor_2.Position.CENTER] + diffX));
                            break;
                        }
                    }
                    // Return early if position did not change
                    if (oldNewLeft === newLeft) {
                        return;
                    }
                    oldNewLeft = newLeft;
                    // Live drag Feedback
                    var moveTo = _this.findMoveTarget(position, diffX);
                    switch (position) {
                        case editor_2.Position.LEFT: {
                            if (moveTo === editor_2.Position.LEFT || moveTo === null) {
                                _this.containers[editor_2.Position.CENTER].style({ left: _this.containerWidth[editor_2.Position.LEFT] + 'px', right: 'auto', borderLeftWidth: '1px' });
                                _this.containers[editor_2.Position.RIGHT].style({ left: 'auto', right: 0 });
                            }
                            else if (moveTo === editor_2.Position.CENTER) {
                                _this.containers[editor_2.Position.CENTER].style({ left: 0, right: 'auto', borderLeftWidth: 0 });
                                _this.containers[editor_2.Position.CENTER].addClass('draggedunder');
                                _this.containers[editor_2.Position.RIGHT].style({ left: 'auto', right: 0 });
                            }
                            else if (moveTo === editor_2.Position.RIGHT) {
                                _this.containers[editor_2.Position.CENTER].style({ left: 0, right: 'auto' });
                                _this.containers[editor_2.Position.RIGHT].style({ left: 'auto', right: _this.containerWidth[editor_2.Position.LEFT] + 'px' });
                                _this.containers[editor_2.Position.RIGHT].addClass('draggedunder');
                            }
                            break;
                        }
                        case editor_2.Position.CENTER: {
                            if (moveTo === editor_2.Position.LEFT) {
                                _this.containers[editor_2.Position.LEFT].style({ left: _this.containerWidth[editor_2.Position.CENTER] + 'px', right: 'auto' });
                                _this.containers[editor_2.Position.LEFT].addClass('draggedunder');
                            }
                            else if (moveTo === editor_2.Position.CENTER || moveTo === null) {
                                _this.containers[editor_2.Position.LEFT].style({ left: 0, right: 'auto' });
                                _this.containers[editor_2.Position.RIGHT].style({ left: 'auto', right: 0 });
                            }
                            else if (moveTo === editor_2.Position.RIGHT) {
                                _this.containers[editor_2.Position.RIGHT].style({ left: 'auto', right: _this.containerWidth[editor_2.Position.CENTER] + 'px' });
                                _this.containers[editor_2.Position.RIGHT].addClass('draggedunder');
                                _this.containers[editor_2.Position.LEFT].style({ left: 0, right: 'auto' });
                            }
                            break;
                        }
                        case editor_2.Position.RIGHT: {
                            if (moveTo === editor_2.Position.LEFT) {
                                _this.containers[editor_2.Position.LEFT].style({ left: _this.containerWidth[editor_2.Position.RIGHT] + 'px', right: 'auto' });
                                _this.containers[editor_2.Position.LEFT].addClass('draggedunder');
                            }
                            else if (moveTo === editor_2.Position.CENTER) {
                                _this.containers[editor_2.Position.LEFT].style({ left: 0, right: 'auto' });
                                _this.containers[editor_2.Position.CENTER].style({ left: (_this.containerWidth[editor_2.Position.LEFT] + _this.containerWidth[editor_2.Position.RIGHT]) + 'px', right: 'auto' });
                                _this.containers[editor_2.Position.CENTER].addClass('draggedunder');
                            }
                            else if (moveTo === editor_2.Position.RIGHT || moveTo === null) {
                                _this.containers[editor_2.Position.LEFT].style({ left: 0, right: 'auto' });
                                _this.containers[editor_2.Position.CENTER].style({ left: _this.containerWidth[editor_2.Position.LEFT] + 'px', right: 'auto' });
                            }
                            break;
                        }
                    }
                    // Move the editor to provide feedback to the user and add class
                    if (newLeft !== null) {
                        _this.containers[position].style({ left: newLeft + 'px' });
                        _this.containers[position].addClass('dragged');
                        _this.parent.addClass('dragged');
                    }
                }).once(DOM.EventType.MOUSE_UP, function (e) {
                    DOM.EventHelper.stop(e, false);
                    // Destroy overlay
                    overlayDiv.destroy();
                    // Update flag
                    _this.dragging = false;
                    // Restore styles
                    _this.parent.removeClass('dragged');
                    _this.containers[position].removeClass('dragged');
                    _this.containers[position].style({ zIndex: 'auto' });
                    editor_2.POSITIONS.forEach(function (p) { return _this.containers[p].removeClass('draggedunder'); });
                    _this.containers[editor_2.Position.LEFT].style({ left: 0, right: 'auto' });
                    _this.containers[editor_2.Position.CENTER].style({ left: 'auto', right: 'auto', borderLeftWidth: '1px' });
                    _this.containers[editor_2.Position.RIGHT].style({ left: 'auto', right: 0, borderLeftWidth: '1px' });
                    // Find move target
                    var mouseUpEvent = new mouseEvent_1.StandardMouseEvent(e);
                    var diffX = mouseUpEvent.posx - startX;
                    var moveTo = _this.findMoveTarget(position, diffX);
                    // Move to valid position if any
                    if (moveTo !== null) {
                        _this.editorService.moveEditor(position, moveTo);
                    }
                    else {
                        _this.layoutContainers();
                    }
                    // Ignore next click if the user dragged the title some distance
                    if (wasDragged) {
                        ignoreClick = true;
                    }
                    else if (position !== _this.getActivePosition()) {
                        _this.editorService.focusEditor(_this.visibleEditors[position]).done(null, errors.onUnexpectedError);
                    }
                    $window.off('mousemove');
                });
            });
            // Close editor on middle mouse click
            parent.on(DOM.EventType.MOUSE_UP, function (e) {
                DOM.EventHelper.stop(e, false);
                // Close editor on middle mouse click
                if (e.button === 1 /* Middle Button */) {
                    _this.editorService.closeEditor(position).done(null, errors.onUnexpectedError);
                }
                else if (_this.getVisibleEditorCount() === 1 && !DOM.isAncestor(e.target || e.srcElement, _this.editorActionsToolbar[position].getContainer().getHTMLElement())) {
                    _this.editorService.focusEditor(_this.visibleEditors[position]).done(null, errors.onUnexpectedError);
                }
            });
            // Left Title Label (click opens quick open unless we are configured to ignore click or we are not the active title)
            parent.div({
                'class': 'title-label'
            }, function (div) {
                var clickHandler = function (e) {
                    if (ignoreClick) {
                        return;
                    }
                    DOM.EventHelper.stop(e, true);
                    _this.quickOpenService.show();
                };
                // Clickable label (focus editor and bring up quick open)
                _this.titleLabel[position] = builder_1.$(div).a().on(DOM.EventType.CLICK, clickHandler);
                // Subtle Description
                _this.titleDescription[position] = builder_1.$(div).span().on(DOM.EventType.CLICK, clickHandler);
            });
            // Right Actions Container
            parent.div({
                'class': 'title-actions'
            }, function (div) {
                // Toolbar
                _this.editorActionsToolbar[position] = new toolbar_1.ToolBar(div.getHTMLElement(), _this.contextMenuService, {
                    actionItemProvider: function (action) { return _this.actionItemProvider(action, position); },
                    orientation: actionbar_1.ActionsOrientation.HORIZONTAL,
                    ariaLabel: nls.localize('araLabelEditorActions', "Editor actions")
                });
                // Action Run Handling
                _this.editorActionsToolbar[position].actionRunner.addListener(events_1.EventType.RUN, function (e) {
                    // Check for Error
                    if (e.error && !errors.isPromiseCanceledError(e.error)) {
                        _this.messageService.show(message_1.Severity.Error, e.error);
                    }
                    // Log in telemetry
                    if (_this.telemetryService) {
                        _this.telemetryService.publicLog('workbenchActionExecuted', { id: e.action.id, from: 'editorPart' });
                    }
                });
            });
        };
        SideBySideEditorControl.prototype.findMoveTarget = function (position, diffX) {
            var visibleEditorCount = this.getVisibleEditorCount();
            switch (position) {
                case editor_2.Position.LEFT: {
                    // [ ! ]|[] -> []|[ ! ]
                    if (visibleEditorCount === 2 && (diffX >= this.containerWidth[editor_2.Position.LEFT] / 2 || diffX >= this.containerWidth[editor_2.Position.CENTER] / 2)) {
                        return editor_2.Position.CENTER;
                    }
                    // [ ! ]|[]|[] -> []|[]|[ ! ]
                    if (visibleEditorCount === 3 && (diffX >= this.containerWidth[editor_2.Position.LEFT] / 2 + this.containerWidth[editor_2.Position.CENTER] || diffX >= this.containerWidth[editor_2.Position.RIGHT] / 2 + this.containerWidth[editor_2.Position.CENTER])) {
                        return editor_2.Position.RIGHT;
                    }
                    // [ ! ]|[]|[] -> []|[ ! ]|[]
                    if (visibleEditorCount === 3 && (diffX >= this.containerWidth[editor_2.Position.LEFT] / 2 || diffX >= this.containerWidth[editor_2.Position.CENTER] / 2)) {
                        return editor_2.Position.CENTER;
                    }
                    break;
                }
                case editor_2.Position.CENTER: {
                    if (visibleEditorCount === 2 && diffX > 0) {
                        return null; // Return early since CENTER cannot be moved to the RIGHT unless there is a RIGHT position
                    }
                    // []|[ ! ] -> [ ! ]|[]
                    if (visibleEditorCount === 2 && (Math.abs(diffX) >= this.containerWidth[editor_2.Position.CENTER] / 2 || Math.abs(diffX) >= this.containerWidth[editor_2.Position.LEFT] / 2)) {
                        return editor_2.Position.LEFT;
                    }
                    // []|[ ! ]|[] -> [ ! ]|[]|[]
                    if (visibleEditorCount === 3 && ((diffX < 0 && Math.abs(diffX) >= this.containerWidth[editor_2.Position.CENTER] / 2) || (diffX < 0 && Math.abs(diffX) >= this.containerWidth[editor_2.Position.LEFT] / 2))) {
                        return editor_2.Position.LEFT;
                    }
                    // []|[ ! ]|[] -> []|[]|[ ! ]
                    if (visibleEditorCount === 3 && ((diffX > 0 && Math.abs(diffX) >= this.containerWidth[editor_2.Position.CENTER] / 2) || (diffX > 0 && Math.abs(diffX) >= this.containerWidth[editor_2.Position.RIGHT] / 2))) {
                        return editor_2.Position.RIGHT;
                    }
                    break;
                }
                case editor_2.Position.RIGHT: {
                    if (diffX > 0) {
                        return null; // Return early since RIGHT cannot be moved more to the RIGHT
                    }
                    // []|[]|[ ! ] -> [ ! ]|[]|[]
                    if (Math.abs(diffX) >= this.containerWidth[editor_2.Position.RIGHT] / 2 + this.containerWidth[editor_2.Position.CENTER] || Math.abs(diffX) >= this.containerWidth[editor_2.Position.LEFT] / 2 + this.containerWidth[editor_2.Position.CENTER]) {
                        return editor_2.Position.LEFT;
                    }
                    // []|[]|[ ! ] -> []|[ ! ]|[]
                    if (Math.abs(diffX) >= this.containerWidth[editor_2.Position.RIGHT] / 2 || Math.abs(diffX) >= this.containerWidth[editor_2.Position.CENTER] / 2) {
                        return editor_2.Position.CENTER;
                    }
                    break;
                }
            }
            return null;
        };
        SideBySideEditorControl.prototype.actionItemProvider = function (action, position) {
            var actionItem;
            // Check Active Editor
            var editor = this.visibleEditors[position];
            if (editor) {
                actionItem = editor.getActionItem(action);
            }
            // Check Registry
            if (!actionItem) {
                var actionBarRegistry = platform_1.Registry.as(actionBarRegistry_1.Extensions.Actionbar);
                actionItem = actionBarRegistry.getActionItemForContext(actionBarRegistry_1.Scope.EDITOR, { input: editor && editor.input, editor: editor, position: position }, action);
            }
            return actionItem;
        };
        SideBySideEditorControl.prototype.setTitle = function (position, input, primaryActions, secondaryActions, isActive) {
            // Activity class
            if (isActive) {
                this.containers[position].removeClass('inactive');
                this.containers[position].addClass('active');
            }
            else {
                this.containers[position].addClass('inactive');
                this.containers[position].removeClass('active');
            }
            // Editor Title (Label + Description)
            var name = input.getName() || '';
            var description = isActive ? (input.getDescription() || '') : '';
            var verboseDescription = isActive ? (input.getDescription(true) || '') : '';
            if (description === verboseDescription) {
                verboseDescription = ''; // dont repeat what is already shown
            }
            this.titleLabel[position].safeInnerHtml(name);
            this.titleLabel[position].title(verboseDescription);
            this.titleDescription[position].safeInnerHtml(description);
            this.titleDescription[position].title(verboseDescription);
            // Editor Input State Description
            if (input) {
                this.setEditorInputStateIndicator(input, input.getStatus(), position);
            }
            else {
                this.setEditorInputStateIndicator(null, null, null);
            }
            // Support split editor action if visible editor count is < 3 and editor supports it
            if (isActive && this.getVisibleEditorCount() < 3 && this.lastActiveEditor.supportsSplitEditor()) {
                primaryActions.unshift(this.splitEditorAction);
            }
            // Set Primary/Secondary Actions
            this.editorActionsToolbar[position].setActions(primaryActions, secondaryActions)();
            // Add a close action
            if (input) {
                this.editorActionsToolbar[position].addPrimaryAction(this.closeEditorAction[position])();
            }
        };
        SideBySideEditorControl.prototype.setLoading = function (position, input) {
            // Editor Title and Description
            this.titleLabel[position].safeInnerHtml(input.getName() || '');
            this.titleDescription[position].safeInnerHtml(nls.localize('loadingLabel', "Loading..."));
            // Clear Primary/Secondary Actions
            this.editorActionsToolbar[position].setActions([], [])();
            // Add a close action
            if (input) {
                this.editorActionsToolbar[position].addPrimaryAction(this.closeEditorAction[position])();
            }
        };
        SideBySideEditorControl.prototype.clearTitle = function (position) {
            // Editor Title
            this.titleLabel[position].safeInnerHtml('');
            this.titleDescription[position].safeInnerHtml('');
            // Toolbar
            this.editorActionsToolbar[position].setActions([], [])();
        };
        SideBySideEditorControl.prototype.centerSash = function (a, b) {
            var sumWidth = this.containerWidth[a] + this.containerWidth[b];
            var meanWidth = sumWidth / 2;
            this.containerWidth[a] = meanWidth;
            this.containerWidth[b] = sumWidth - meanWidth;
            this.layoutContainers();
        };
        SideBySideEditorControl.prototype.onLeftSashDragStart = function () {
            this.startLeftContainerWidth = this.containerWidth[editor_2.Position.LEFT];
        };
        SideBySideEditorControl.prototype.onLeftSashDrag = function (e) {
            var oldLeftContainerWidth = this.containerWidth[editor_2.Position.LEFT];
            var newLeftContainerWidth = this.startLeftContainerWidth + e.currentX - e.startX;
            // Side-by-Side
            if (this.rightSash.isHidden()) {
                // []|[      ] : left side can not get smaller than MIN_EDITOR_WIDTH
                if (newLeftContainerWidth < SideBySideEditorControl.MIN_EDITOR_WIDTH) {
                    newLeftContainerWidth = SideBySideEditorControl.MIN_EDITOR_WIDTH;
                }
                else if (this.dimension.width - newLeftContainerWidth < SideBySideEditorControl.MIN_EDITOR_WIDTH) {
                    newLeftContainerWidth = this.dimension.width - SideBySideEditorControl.MIN_EDITOR_WIDTH;
                }
                else if (newLeftContainerWidth - SideBySideEditorControl.SNAP_TO_MINIMIZED_THRESHOLD <= SideBySideEditorControl.MIN_EDITOR_WIDTH) {
                    newLeftContainerWidth = SideBySideEditorControl.MIN_EDITOR_WIDTH;
                }
                else if (this.dimension.width - newLeftContainerWidth - SideBySideEditorControl.SNAP_TO_MINIMIZED_THRESHOLD <= SideBySideEditorControl.MIN_EDITOR_WIDTH) {
                    newLeftContainerWidth = this.dimension.width - SideBySideEditorControl.MIN_EDITOR_WIDTH;
                }
                this.containerWidth[editor_2.Position.LEFT] = newLeftContainerWidth;
                this.containerWidth[editor_2.Position.CENTER] = this.dimension.width - newLeftContainerWidth;
            }
            else {
                // [!]|[      ]|[  ] : left side can not get smaller than MIN_EDITOR_WIDTH
                if (newLeftContainerWidth < SideBySideEditorControl.MIN_EDITOR_WIDTH) {
                    newLeftContainerWidth = SideBySideEditorControl.MIN_EDITOR_WIDTH;
                }
                else if (this.dimension.width - newLeftContainerWidth - this.containerWidth[editor_2.Position.RIGHT] < SideBySideEditorControl.MIN_EDITOR_WIDTH) {
                    // [      ]|[ ]|[!] : right side can not get smaller than MIN_EDITOR_WIDTH
                    if (this.dimension.width - newLeftContainerWidth - this.containerWidth[editor_2.Position.CENTER] < SideBySideEditorControl.MIN_EDITOR_WIDTH) {
                        newLeftContainerWidth = this.dimension.width - (2 * SideBySideEditorControl.MIN_EDITOR_WIDTH);
                        this.containerWidth[editor_2.Position.CENTER] = this.containerWidth[editor_2.Position.RIGHT] = SideBySideEditorControl.MIN_EDITOR_WIDTH;
                    }
                    else if (this.dimension.width - newLeftContainerWidth - this.containerWidth[editor_2.Position.CENTER] - SideBySideEditorControl.SNAP_TO_MINIMIZED_THRESHOLD <= SideBySideEditorControl.MIN_EDITOR_WIDTH) {
                        this.containerWidth[editor_2.Position.RIGHT] = SideBySideEditorControl.MIN_EDITOR_WIDTH;
                    }
                    else {
                        this.containerWidth[editor_2.Position.RIGHT] = this.containerWidth[editor_2.Position.RIGHT] - (newLeftContainerWidth - oldLeftContainerWidth);
                    }
                    this.rightSash.layout();
                }
                else if (newLeftContainerWidth - SideBySideEditorControl.SNAP_TO_MINIMIZED_THRESHOLD <= SideBySideEditorControl.MIN_EDITOR_WIDTH) {
                    newLeftContainerWidth = SideBySideEditorControl.MIN_EDITOR_WIDTH;
                }
                else if (this.dimension.width - this.containerWidth[editor_2.Position.RIGHT] - newLeftContainerWidth - SideBySideEditorControl.SNAP_TO_MINIMIZED_THRESHOLD <= SideBySideEditorControl.MIN_EDITOR_WIDTH) {
                    newLeftContainerWidth = this.dimension.width - this.containerWidth[editor_2.Position.RIGHT] - SideBySideEditorControl.MIN_EDITOR_WIDTH;
                }
                this.containerWidth[editor_2.Position.LEFT] = newLeftContainerWidth;
                this.containerWidth[editor_2.Position.CENTER] = this.dimension.width - this.containerWidth[editor_2.Position.LEFT] - this.containerWidth[editor_2.Position.RIGHT];
            }
            // Pass on to containers
            this.layoutContainers();
        };
        SideBySideEditorControl.prototype.onLeftSashDragEnd = function () {
            this.leftSash.layout();
            this.rightSash.layout(); // Moving left sash might have also moved right sash, so layout() both
            this.focusNextNonMinimized();
        };
        SideBySideEditorControl.prototype.onLeftSashReset = function () {
            this.centerSash(editor_2.Position.LEFT, editor_2.Position.CENTER);
            this.leftSash.layout();
        };
        SideBySideEditorControl.prototype.onRightSashDragStart = function () {
            this.startRightContainerWidth = this.containerWidth[editor_2.Position.RIGHT];
        };
        SideBySideEditorControl.prototype.onRightSashDrag = function (e) {
            var oldRightContainerWidth = this.containerWidth[editor_2.Position.RIGHT];
            var newRightContainerWidth = this.startRightContainerWidth - e.currentX + e.startX;
            // [  ]|[      ]|[!] : right side can not get smaller than MIN_EDITOR_WIDTH
            if (newRightContainerWidth < SideBySideEditorControl.MIN_EDITOR_WIDTH) {
                newRightContainerWidth = SideBySideEditorControl.MIN_EDITOR_WIDTH;
            }
            else if (this.dimension.width - newRightContainerWidth - this.containerWidth[editor_2.Position.LEFT] < SideBySideEditorControl.MIN_EDITOR_WIDTH) {
                // [!]|[ ]|[    ] : left side can not get smaller than MIN_EDITOR_WIDTH
                if (this.dimension.width - newRightContainerWidth - this.containerWidth[editor_2.Position.CENTER] < SideBySideEditorControl.MIN_EDITOR_WIDTH) {
                    newRightContainerWidth = this.dimension.width - (2 * SideBySideEditorControl.MIN_EDITOR_WIDTH);
                    this.containerWidth[editor_2.Position.LEFT] = this.containerWidth[editor_2.Position.CENTER] = SideBySideEditorControl.MIN_EDITOR_WIDTH;
                }
                else if (this.dimension.width - newRightContainerWidth - this.containerWidth[editor_2.Position.CENTER] - SideBySideEditorControl.SNAP_TO_MINIMIZED_THRESHOLD <= SideBySideEditorControl.MIN_EDITOR_WIDTH) {
                    this.containerWidth[editor_2.Position.LEFT] = SideBySideEditorControl.MIN_EDITOR_WIDTH;
                }
                else {
                    this.containerWidth[editor_2.Position.LEFT] = this.containerWidth[editor_2.Position.LEFT] - (newRightContainerWidth - oldRightContainerWidth);
                }
                this.leftSash.layout();
            }
            else if (newRightContainerWidth - SideBySideEditorControl.SNAP_TO_MINIMIZED_THRESHOLD <= SideBySideEditorControl.MIN_EDITOR_WIDTH) {
                newRightContainerWidth = SideBySideEditorControl.MIN_EDITOR_WIDTH;
            }
            else if (this.dimension.width - this.containerWidth[editor_2.Position.LEFT] - newRightContainerWidth - SideBySideEditorControl.SNAP_TO_MINIMIZED_THRESHOLD <= SideBySideEditorControl.MIN_EDITOR_WIDTH) {
                newRightContainerWidth = this.dimension.width - this.containerWidth[editor_2.Position.LEFT] - SideBySideEditorControl.MIN_EDITOR_WIDTH;
            }
            this.containerWidth[editor_2.Position.RIGHT] = newRightContainerWidth;
            this.containerWidth[editor_2.Position.CENTER] = this.dimension.width - this.containerWidth[editor_2.Position.LEFT] - this.containerWidth[editor_2.Position.RIGHT];
            this.layoutContainers();
        };
        SideBySideEditorControl.prototype.onRightSashDragEnd = function () {
            this.leftSash.layout(); // Moving right sash might have also moved left sash, so layout() both
            this.rightSash.layout();
            this.focusNextNonMinimized();
        };
        SideBySideEditorControl.prototype.onRightSashReset = function () {
            this.centerSash(editor_2.Position.CENTER, editor_2.Position.RIGHT);
            this.rightSash.layout();
        };
        SideBySideEditorControl.prototype.getVerticalSashTop = function (sash) {
            return 0;
        };
        SideBySideEditorControl.prototype.getVerticalSashLeft = function (sash) {
            return sash === this.leftSash ? this.containerWidth[editor_2.Position.LEFT] : this.containerWidth[editor_2.Position.CENTER] + this.containerWidth[editor_2.Position.LEFT];
        };
        SideBySideEditorControl.prototype.getVerticalSashHeight = function (sash) {
            return this.dimension.height;
        };
        SideBySideEditorControl.prototype.isDragging = function () {
            return this.dragging;
        };
        SideBySideEditorControl.prototype.layout = function (arg) {
            if (arg instanceof builder_1.Dimension) {
                this.layoutControl(arg);
            }
            else {
                this.layoutEditor(arg);
            }
        };
        SideBySideEditorControl.prototype.layoutControl = function (dimension) {
            var _this = this;
            var oldDimension = this.dimension;
            this.dimension = dimension;
            // Use the current dimension in case an editor was opened before we had any dimension
            if (!oldDimension || !oldDimension.width || !oldDimension.height) {
                oldDimension = dimension;
            }
            // Apply to visible editors
            var totalWidth = 0;
            // Set preferred dimensions based on ratio to previous dimenions
            editor_2.POSITIONS.forEach(function (position) {
                if (_this.visibleEditors[position]) {
                    // Keep minimized editors in tact by not letting them grow if we have width to give
                    if (_this.containerWidth[position] !== SideBySideEditorControl.MIN_EDITOR_WIDTH) {
                        var sashWidthRatio = void 0;
                        // We have some stored initial ratios when the editor was restored on startup
                        // Use those ratios over anything else but only once.
                        if (_this.containerInitialRatios && types.isNumber(_this.containerInitialRatios[position])) {
                            sashWidthRatio = _this.containerInitialRatios[position];
                            delete _this.containerInitialRatios[position]; // dont use again
                        }
                        else {
                            sashWidthRatio = _this.containerWidth[position] / oldDimension.width;
                        }
                        _this.containerWidth[position] = Math.max(Math.round(_this.dimension.width * sashWidthRatio), SideBySideEditorControl.MIN_EDITOR_WIDTH);
                    }
                    totalWidth += _this.containerWidth[position];
                }
            });
            // Compensate for overflow either through rounding error or min editor width
            if (totalWidth > 0) {
                var overflow_1 = totalWidth - this.dimension.width;
                // We have width to give
                if (overflow_1 < 0) {
                    // Find the first position from left to right that is not minimized
                    // to give width. This ensures that minimized editors are left like
                    // that if the user chose this layout.
                    var positionToGive_1 = null;
                    editor_2.POSITIONS.forEach(function (position) {
                        if (_this.visibleEditors[position] && positionToGive_1 === null && _this.containerWidth[position] !== SideBySideEditorControl.MIN_EDITOR_WIDTH) {
                            positionToGive_1 = position;
                        }
                    });
                    if (positionToGive_1 === null) {
                        positionToGive_1 = editor_2.Position.LEFT; // maybe all are minimized, so give LEFT the extra width
                    }
                    this.containerWidth[positionToGive_1] -= overflow_1;
                }
                else if (overflow_1 > 0) {
                    editor_2.POSITIONS.forEach(function (position) {
                        var maxCompensation = _this.containerWidth[position] - SideBySideEditorControl.MIN_EDITOR_WIDTH;
                        if (maxCompensation >= overflow_1) {
                            _this.containerWidth[position] -= overflow_1;
                            overflow_1 = 0;
                        }
                        else if (maxCompensation > 0) {
                            var compensation = overflow_1 - maxCompensation;
                            _this.containerWidth[position] -= compensation;
                            overflow_1 -= compensation;
                        }
                    });
                }
            }
            // Sash positioning
            this.leftSash.layout();
            this.rightSash.layout();
            // Pass on to Editor Containers
            this.layoutContainers();
        };
        SideBySideEditorControl.prototype.layoutContainers = function () {
            var _this = this;
            // Layout containers
            editor_2.POSITIONS.forEach(function (position) {
                _this.containers[position].size(_this.containerWidth[position], _this.dimension.height);
            });
            // Position center depending on visibility of right hand editor
            if (this.visibleEditors[editor_2.Position.RIGHT]) {
                this.containers[editor_2.Position.CENTER].position(null, this.containerWidth[editor_2.Position.RIGHT]);
            }
            else {
                this.containers[editor_2.Position.CENTER].position(null, this.dimension.width - this.containerWidth[editor_2.Position.LEFT] - this.containerWidth[editor_2.Position.CENTER]);
            }
            // Visibility
            editor_2.POSITIONS.forEach(function (position) {
                if (_this.visibleEditors[position] && _this.containers[position].isHidden()) {
                    _this.containers[position].show();
                }
                else if (!_this.visibleEditors[position] && !_this.containers[position].isHidden()) {
                    _this.containers[position].hide();
                }
            });
            // Layout active editors
            editor_2.POSITIONS.forEach(function (position) {
                _this.layoutEditor(position);
            });
        };
        SideBySideEditorControl.prototype.layoutEditor = function (position) {
            var editorWidth = this.containerWidth[position];
            if (editorWidth && this.visibleEditors[position]) {
                this.visibleEditors[position].layout(new builder_1.Dimension(editorWidth, this.dimension.height - SideBySideEditorControl.EDITOR_TITLE_HEIGHT));
            }
        };
        SideBySideEditorControl.prototype.getProgressBar = function (position) {
            return this.progressBar[position];
        };
        SideBySideEditorControl.prototype.dispose = function () {
            var _this = this;
            // Positions
            editor_2.POSITIONS.forEach(function (position) {
                _this.clearPosition(position);
            });
            // Toolbars
            this.editorActionsToolbar.forEach(function (toolbar) {
                toolbar.dispose();
            });
            // Progress bars
            this.progressBar.forEach(function (bar) {
                bar.dispose();
            });
            // Actions
            this.closeEditorAction.forEach(function (action) {
                action.dispose();
            });
            // Sash
            this.leftSash.dispose();
            this.rightSash.dispose();
            // Destroy Container
            this.containers.forEach(function (container) {
                container.destroy();
            });
            if (this.editorInputStateChangeListener) {
                this.editorInputStateChangeListener();
            }
            this.lastActiveEditor = null;
            this.lastActivePosition = null;
            this.visibleEditors = null;
            this.visibleEditorContainers = null;
            _super.prototype.dispose.call(this);
        };
        SideBySideEditorControl.MIN_EDITOR_WIDTH = 170;
        SideBySideEditorControl.EDITOR_TITLE_HEIGHT = 35;
        SideBySideEditorControl.SNAP_TO_MINIMIZED_THRESHOLD = 50;
        SideBySideEditorControl = __decorate([
            __param(1, editorService_1.IWorkbenchEditorService),
            __param(2, message_1.IMessageService),
            __param(3, quickOpenService_1.IQuickOpenService),
            __param(4, telemetry_1.ITelemetryService),
            __param(5, contextView_1.IContextViewService),
            __param(6, contextView_1.IContextMenuService),
            __param(7, event_1.IEventService),
            __param(8, contextService_1.IWorkspaceContextService)
        ], SideBySideEditorControl);
        return SideBySideEditorControl;
    }(eventEmitter_1.EventEmitter));
    exports.SideBySideEditorControl = SideBySideEditorControl;
});
//# sourceMappingURL=sideBySideEditorControl.js.map