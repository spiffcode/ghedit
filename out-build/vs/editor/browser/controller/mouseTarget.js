define(["require", "exports", 'vs/editor/common/core/position', 'vs/editor/common/core/range', 'vs/editor/common/editorCommon', 'vs/editor/browser/editorBrowser'], function (require, exports, position_1, range_1, editorCommon_1, editorBrowser_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var MouseTarget = (function () {
        function MouseTarget(element, type, mouseColumn, position, range, detail) {
            if (mouseColumn === void 0) { mouseColumn = 0; }
            if (position === void 0) { position = null; }
            if (range === void 0) { range = null; }
            if (detail === void 0) { detail = null; }
            this.element = element;
            this.type = type;
            this.mouseColumn = mouseColumn;
            this.position = position;
            if (!range && position) {
                range = new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column);
            }
            this.range = range;
            this.detail = detail;
        }
        MouseTarget.prototype._typeToString = function () {
            if (this.type === editorCommon_1.MouseTargetType.TEXTAREA) {
                return 'TEXTAREA';
            }
            if (this.type === editorCommon_1.MouseTargetType.GUTTER_GLYPH_MARGIN) {
                return 'GUTTER_GLYPH_MARGIN';
            }
            if (this.type === editorCommon_1.MouseTargetType.GUTTER_LINE_NUMBERS) {
                return 'GUTTER_LINE_NUMBERS';
            }
            if (this.type === editorCommon_1.MouseTargetType.GUTTER_LINE_DECORATIONS) {
                return 'GUTTER_LINE_DECORATIONS';
            }
            if (this.type === editorCommon_1.MouseTargetType.GUTTER_VIEW_ZONE) {
                return 'GUTTER_VIEW_ZONE';
            }
            if (this.type === editorCommon_1.MouseTargetType.CONTENT_TEXT) {
                return 'CONTENT_TEXT';
            }
            if (this.type === editorCommon_1.MouseTargetType.CONTENT_EMPTY) {
                return 'CONTENT_EMPTY';
            }
            if (this.type === editorCommon_1.MouseTargetType.CONTENT_VIEW_ZONE) {
                return 'CONTENT_VIEW_ZONE';
            }
            if (this.type === editorCommon_1.MouseTargetType.CONTENT_WIDGET) {
                return 'CONTENT_WIDGET';
            }
            if (this.type === editorCommon_1.MouseTargetType.OVERVIEW_RULER) {
                return 'OVERVIEW_RULER';
            }
            if (this.type === editorCommon_1.MouseTargetType.SCROLLBAR) {
                return 'SCROLLBAR';
            }
            if (this.type === editorCommon_1.MouseTargetType.OVERLAY_WIDGET) {
                return 'OVERLAY_WIDGET';
            }
            return 'UNKNOWN';
        };
        MouseTarget.prototype.toString = function () {
            return this._typeToString() + ': ' + this.position + ' - ' + this.range + ' - ' + this.detail;
        };
        return MouseTarget;
    }());
    // e.g. of paths:
    // - overflow-guard/monaco-scrollable-element editor-scrollable vs/lines-content/view-lines/view-line
    // - overflow-guard/monaco-scrollable-element editor-scrollable vs/lines-content/view-lines/view-line/token comment js
    // etc.
    var REGEX = (function () {
        function nodeWithClass(className) {
            return '[^/]*' + className + '[^/]*';
        }
        function anyNode() {
            return '[^/]+';
        }
        var ANCHOR = '^' + editorBrowser_1.ClassNames.OVERFLOW_GUARD + '\\/';
        function createRegExp() {
            var pieces = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                pieces[_i - 0] = arguments[_i];
            }
            var forceEndMatch = false;
            if (pieces[pieces.length - 1] === '$') {
                forceEndMatch = true;
                pieces.pop();
            }
            return new RegExp(ANCHOR + pieces.join('\\/') + (forceEndMatch ? '$' : ''));
        }
        return {
            IS_TEXTAREA_COVER: createRegExp(nodeWithClass(editorBrowser_1.ClassNames.TEXTAREA_COVER), '$'),
            IS_TEXTAREA: createRegExp(editorBrowser_1.ClassNames.TEXTAREA, '$'),
            IS_VIEW_LINES: createRegExp(anyNode(), anyNode(), editorBrowser_1.ClassNames.VIEW_LINES, '$'),
            IS_CURSORS_LAYER: createRegExp(anyNode(), anyNode(), nodeWithClass(editorBrowser_1.ClassNames.VIEW_CURSORS_LAYER), '$'),
            IS_CHILD_OF_VIEW_LINES: createRegExp(anyNode(), anyNode(), editorBrowser_1.ClassNames.VIEW_LINES),
            IS_CHILD_OF_SCROLLABLE_ELEMENT: createRegExp(nodeWithClass(editorBrowser_1.ClassNames.SCROLLABLE_ELEMENT)),
            IS_CHILD_OF_CONTENT_WIDGETS: createRegExp(anyNode(), anyNode(), editorBrowser_1.ClassNames.CONTENT_WIDGETS),
            IS_CHILD_OF_OVERFLOWING_CONTENT_WIDGETS: new RegExp('^' + editorBrowser_1.ClassNames.OVERFLOWING_CONTENT_WIDGETS + '\\/'),
            IS_CHILD_OF_OVERLAY_WIDGETS: createRegExp(editorBrowser_1.ClassNames.OVERLAY_WIDGETS),
            IS_CHILD_OF_VIEW_OVERLAYS: createRegExp(editorBrowser_1.ClassNames.MARGIN_VIEW_OVERLAYS),
            IS_CHILD_OF_VIEW_ZONES: createRegExp(anyNode(), anyNode(), editorBrowser_1.ClassNames.VIEW_ZONES),
        };
    })();
    var MouseTargetFactory = (function () {
        function MouseTargetFactory(context, viewHelper) {
            this.context = context;
            this.viewHelper = viewHelper;
        }
        MouseTargetFactory.prototype.getClassNamePathTo = function (child, stopAt) {
            var path = [], className;
            while (child && child !== document.body) {
                if (child === stopAt) {
                    break;
                }
                if (child.nodeType === child.ELEMENT_NODE) {
                    className = child.className;
                    if (className) {
                        path.unshift(className);
                    }
                }
                child = child.parentNode;
            }
            return path.join('/');
        };
        MouseTargetFactory.prototype.mouseTargetIsWidget = function (e) {
            var t = e.target;
            var path = this.getClassNamePathTo(t, this.viewHelper.viewDomNode);
            // Is it a content widget?
            if (REGEX.IS_CHILD_OF_CONTENT_WIDGETS.test(path) || REGEX.IS_CHILD_OF_OVERFLOWING_CONTENT_WIDGETS.test(path)) {
                return true;
            }
            // Is it an overlay widget?
            if (REGEX.IS_CHILD_OF_OVERLAY_WIDGETS.test(path)) {
                return true;
            }
            return false;
        };
        MouseTargetFactory.prototype.createMouseTarget = function (layoutInfo, editorContent, e, testEventTarget) {
            try {
                var r = this._unsafeCreateMouseTarget(layoutInfo, editorContent, e, testEventTarget);
                return r;
            }
            catch (e) {
                return this.createMouseTargetFromUnknownTarget(e.target);
            }
        };
        MouseTargetFactory.prototype._unsafeCreateMouseTarget = function (layoutInfo, editorContent, e, testEventTarget) {
            var mouseVerticalOffset = Math.max(0, this.viewHelper.getScrollTop() + (e.posy - editorContent.top));
            var mouseContentHorizontalOffset = this.viewHelper.getScrollLeft() + (e.posx - editorContent.left) - layoutInfo.contentLeft;
            var mouseColumn = this._getMouseColumn(mouseContentHorizontalOffset);
            var t = e.target;
            var path = this.getClassNamePathTo(t, this.viewHelper.viewDomNode);
            // Is it a cursor ?
            var lineNumberAttribute = t.hasAttribute && t.hasAttribute('lineNumber') ? t.getAttribute('lineNumber') : null;
            var columnAttribute = t.hasAttribute && t.hasAttribute('column') ? t.getAttribute('column') : null;
            if (lineNumberAttribute && columnAttribute) {
                return this.createMouseTargetFromViewCursor(t, parseInt(lineNumberAttribute, 10), parseInt(columnAttribute, 10), mouseColumn);
            }
            // Is it a content widget?
            if (REGEX.IS_CHILD_OF_CONTENT_WIDGETS.test(path) || REGEX.IS_CHILD_OF_OVERFLOWING_CONTENT_WIDGETS.test(path)) {
                return this.createMouseTargetFromContentWidgetsChild(t, mouseColumn);
            }
            // Is it an overlay widget?
            if (REGEX.IS_CHILD_OF_OVERLAY_WIDGETS.test(path)) {
                return this.createMouseTargetFromOverlayWidgetsChild(t, mouseColumn);
            }
            // Is it the textarea cover?
            if (REGEX.IS_TEXTAREA_COVER.test(path)) {
                if (this.context.configuration.editor.glyphMargin) {
                    return this.createMouseTargetFromGlyphMargin(t, mouseVerticalOffset, mouseColumn);
                }
                else if (this.context.configuration.editor.lineNumbers) {
                    return this.createMouseTargetFromLineNumbers(t, mouseVerticalOffset, mouseColumn);
                }
                else {
                    return this.createMouseTargetFromLinesDecorationsChild(t, mouseVerticalOffset, mouseColumn);
                }
            }
            // Is it the textarea?
            if (REGEX.IS_TEXTAREA.test(path)) {
                return new MouseTarget(t, editorCommon_1.MouseTargetType.TEXTAREA);
            }
            // Is it a view zone?
            if (REGEX.IS_CHILD_OF_VIEW_ZONES.test(path)) {
                // Check if it is at a view zone
                var viewZoneData = this._getZoneAtCoord(mouseVerticalOffset);
                if (viewZoneData) {
                    return new MouseTarget(t, editorCommon_1.MouseTargetType.CONTENT_VIEW_ZONE, mouseColumn, viewZoneData.position, null, viewZoneData);
                }
                return this.createMouseTargetFromUnknownTarget(t);
            }
            // Is it the view lines container?
            if (REGEX.IS_VIEW_LINES.test(path)) {
                // Sometimes, IE returns this target when right clicking on top of text
                // -> See Bug #12990: [F12] Context menu shows incorrect position while doing a resize
                // Check if it is below any lines and any view zones
                if (this.viewHelper.isAfterLines(mouseVerticalOffset)) {
                    return this.createMouseTargetFromViewLines(t, mouseVerticalOffset, mouseColumn);
                }
                // Check if it is at a view zone
                var viewZoneData = this._getZoneAtCoord(mouseVerticalOffset);
                if (viewZoneData) {
                    return new MouseTarget(t, editorCommon_1.MouseTargetType.CONTENT_VIEW_ZONE, mouseColumn, viewZoneData.position, null, viewZoneData);
                }
                // Check if it hits a position
                var hitTestResult = this._doHitTest(editorContent, e, mouseVerticalOffset);
                if (hitTestResult.position) {
                    return this.createMouseTargetFromHitTestPosition(t, hitTestResult.position.lineNumber, hitTestResult.position.column, mouseContentHorizontalOffset, mouseColumn);
                }
                // Fall back to view lines
                return this.createMouseTargetFromViewLines(t, mouseVerticalOffset, mouseColumn);
            }
            // Is it a child of the view lines container?
            if (!testEventTarget || REGEX.IS_CHILD_OF_VIEW_LINES.test(path)) {
                var hitTestResult = this._doHitTest(editorContent, e, mouseVerticalOffset);
                if (hitTestResult.position) {
                    return this.createMouseTargetFromHitTestPosition(t, hitTestResult.position.lineNumber, hitTestResult.position.column, mouseContentHorizontalOffset, mouseColumn);
                }
                else if (hitTestResult.hitTarget) {
                    t = hitTestResult.hitTarget;
                    path = this.getClassNamePathTo(t, this.viewHelper.viewDomNode);
                    // TODO@Alex: try again with this different target, but guard against recursion.
                    // Is it a cursor ?
                    var lineNumberAttribute = t.hasAttribute && t.hasAttribute('lineNumber') ? t.getAttribute('lineNumber') : null;
                    var columnAttribute = t.hasAttribute && t.hasAttribute('column') ? t.getAttribute('column') : null;
                    if (lineNumberAttribute && columnAttribute) {
                        return this.createMouseTargetFromViewCursor(t, parseInt(lineNumberAttribute, 10), parseInt(columnAttribute, 10), mouseColumn);
                    }
                }
            }
            // Is it the cursors layer?
            if (REGEX.IS_CURSORS_LAYER.test(path)) {
                return new MouseTarget(t, editorCommon_1.MouseTargetType.UNKNOWN);
            }
            // Is it a child of the scrollable element?
            if (REGEX.IS_CHILD_OF_SCROLLABLE_ELEMENT.test(path)) {
                return this.createMouseTargetFromScrollbar(t, mouseVerticalOffset, mouseColumn);
            }
            if (REGEX.IS_CHILD_OF_VIEW_OVERLAYS.test(path)) {
                var offset = Math.abs(e.posx - editorContent.left);
                if (offset <= layoutInfo.glyphMarginWidth) {
                    // On the glyph margin
                    return this.createMouseTargetFromGlyphMargin(t, mouseVerticalOffset, mouseColumn);
                }
                offset -= layoutInfo.glyphMarginWidth;
                if (offset <= layoutInfo.lineNumbersWidth) {
                    // On the line numbers
                    return this.createMouseTargetFromLineNumbers(t, mouseVerticalOffset, mouseColumn);
                }
                offset -= layoutInfo.lineNumbersWidth;
                // On the line decorations
                return this.createMouseTargetFromLinesDecorationsChild(t, mouseVerticalOffset, mouseColumn);
            }
            if (/OverviewRuler/i.test(path)) {
                return this.createMouseTargetFromScrollbar(t, mouseVerticalOffset, mouseColumn);
            }
            return this.createMouseTargetFromUnknownTarget(t);
        };
        MouseTargetFactory.prototype._isChild = function (testChild, testAncestor, stopAt) {
            while (testChild && testChild !== document.body) {
                if (testChild === testAncestor) {
                    return true;
                }
                if (testChild === stopAt) {
                    return false;
                }
                testChild = testChild.parentNode;
            }
            return false;
        };
        MouseTargetFactory.prototype._findAttribute = function (element, attr, stopAt) {
            while (element && element !== document.body) {
                if (element.hasAttribute && element.hasAttribute(attr)) {
                    return element.getAttribute(attr);
                }
                if (element === stopAt) {
                    return null;
                }
                element = element.parentNode;
            }
            return null;
        };
        /**
         * Most probably WebKit browsers
         */
        MouseTargetFactory.prototype._doHitTestWithCaretRangeFromPoint = function (editorContent, e, mouseVerticalOffset) {
            // In Chrome, especially on Linux it is possible to click between lines,
            // so try to adjust the `hity` below so that it lands in the center of a line
            var lineNumber = this.viewHelper.getLineNumberAtVerticalOffset(mouseVerticalOffset);
            var lineVerticalOffset = this.viewHelper.getVerticalOffsetForLineNumber(lineNumber);
            var centeredVerticalOffset = lineVerticalOffset + Math.floor(this.context.configuration.editor.lineHeight / 2);
            var adjustedPosy = e.posy + (centeredVerticalOffset - mouseVerticalOffset);
            if (adjustedPosy <= editorContent.top) {
                adjustedPosy = editorContent.top + 1;
            }
            if (adjustedPosy >= editorContent.top + this.context.configuration.editor.observedOuterHeight) {
                adjustedPosy = editorContent.top + this.context.configuration.editor.observedOuterHeight - 1;
            }
            var hitx = e.posx - document.body.scrollLeft;
            var r = this._actualDoHitTestWithCaretRangeFromPoint(hitx, adjustedPosy - document.body.scrollTop);
            if (r.position) {
                return r;
            }
            // Also try to hit test without the adjustment (for the edge cases that we are near the top or bottom)
            return this._actualDoHitTestWithCaretRangeFromPoint(hitx, e.posy - document.body.scrollTop);
        };
        MouseTargetFactory.prototype._actualDoHitTestWithCaretRangeFromPoint = function (hitx, hity) {
            var range = document.caretRangeFromPoint(hitx, hity);
            if (!range || !range.startContainer) {
                return {
                    position: null,
                    hitTarget: null
                };
            }
            // Chrome always hits a TEXT_NODE, while Edge sometimes hits a token span
            var startContainer = range.startContainer;
            var hitTarget;
            if (startContainer.nodeType === startContainer.TEXT_NODE) {
                // startContainer is expected to be the token text
                var parent1 = startContainer.parentNode; // expected to be the token span
                var parent2 = parent1 ? parent1.parentNode : null; // expected to be the view line container span
                var parent3 = parent2 ? parent2.parentNode : null; // expected to be the view line div
                var parent3ClassName = parent3 && parent3.nodeType === parent3.ELEMENT_NODE ? parent3.className : null;
                if (parent3ClassName === editorBrowser_1.ClassNames.VIEW_LINE) {
                    return {
                        position: this.viewHelper.getPositionFromDOMInfo(parent1, range.startOffset),
                        hitTarget: null
                    };
                }
                else {
                    hitTarget = startContainer.parentNode;
                }
            }
            else if (startContainer.nodeType === startContainer.ELEMENT_NODE) {
                // startContainer is expected to be the token span
                var parent1 = startContainer.parentNode; // expected to be the view line container span
                var parent2 = parent1 ? parent1.parentNode : null; // expected to be the view line div
                var parent2ClassName = parent2 && parent2.nodeType === parent2.ELEMENT_NODE ? parent2.className : null;
                if (parent2ClassName === editorBrowser_1.ClassNames.VIEW_LINE) {
                    return {
                        position: this.viewHelper.getPositionFromDOMInfo(startContainer, startContainer.textContent.length),
                        hitTarget: null
                    };
                }
                else {
                    hitTarget = startContainer;
                }
            }
            return {
                position: null,
                hitTarget: hitTarget
            };
        };
        /**
         * Most probably Gecko
         */
        MouseTargetFactory.prototype._doHitTestWithCaretPositionFromPoint = function (e) {
            var resultPosition = null;
            var resultHitTarget = null;
            var hitx = e.posx - document.body.scrollLeft - document.documentElement.scrollLeft;
            var hity = e.posy - document.body.scrollTop - document.documentElement.scrollTop;
            var hitResult = document.caretPositionFromPoint(hitx, hity);
            var range = document.createRange();
            range.setStart(hitResult.offsetNode, hitResult.offset);
            range.collapse(true);
            resultPosition = this.viewHelper.getPositionFromDOMInfo(range.startContainer.parentNode, range.startOffset);
            range.detach();
            return {
                position: resultPosition,
                hitTarget: resultHitTarget
            };
        };
        /**
         * Most probably IE
         */
        MouseTargetFactory.prototype._doHitTestWithMoveToPoint = function (e) {
            var resultPosition = null;
            var resultHitTarget = null;
            var textRange = document.body.createTextRange();
            try {
                var hitx = e.posx - document.body.scrollLeft - document.documentElement.scrollLeft;
                var hity = e.posy - document.body.scrollTop - document.documentElement.scrollTop;
                textRange.moveToPoint(hitx, hity);
            }
            catch (err) {
                return {
                    position: null,
                    hitTarget: null
                };
            }
            textRange.collapse(true);
            // Now, let's do our best to figure out what we hit :)
            var parentElement = textRange ? textRange.parentElement() : null;
            var parent1 = parentElement ? parentElement.parentNode : null;
            var parent2 = parent1 ? parent1.parentNode : null;
            var parent2ClassName = parent2 && parent2.nodeType === parent2.ELEMENT_NODE ? parent2.className : '';
            if (parent2ClassName === editorBrowser_1.ClassNames.VIEW_LINE) {
                var rangeToContainEntireSpan = textRange.duplicate();
                rangeToContainEntireSpan.moveToElementText(parentElement);
                rangeToContainEntireSpan.setEndPoint('EndToStart', textRange);
                resultPosition = this.viewHelper.getPositionFromDOMInfo(parentElement, rangeToContainEntireSpan.text.length);
                // Move range out of the span node, IE doesn't like having many ranges in
                // the same spot and will act badly for lines containing dashes ('-')
                rangeToContainEntireSpan.moveToElementText(this.viewHelper.viewDomNode);
            }
            else {
                // Looks like we've hit the hover or something foreign
                resultHitTarget = parentElement;
            }
            // Move range out of the span node, IE doesn't like having many ranges in
            // the same spot and will act badly for lines containing dashes ('-')
            textRange.moveToElementText(this.viewHelper.viewDomNode);
            return {
                position: resultPosition,
                hitTarget: resultHitTarget
            };
        };
        MouseTargetFactory.prototype._doHitTest = function (editorContent, e, mouseVerticalOffset) {
            // State of the art (18.10.2012):
            // The spec says browsers should support document.caretPositionFromPoint, but nobody implemented it (http://dev.w3.org/csswg/cssom-view/)
            // Gecko:
            //    - they tried to implement it once, but failed: https://bugzilla.mozilla.org/show_bug.cgi?id=654352
            //    - however, they do give out rangeParent/rangeOffset properties on mouse events
            // Webkit:
            //    - they have implemented a previous version of the spec which was using document.caretRangeFromPoint
            // IE:
            //    - they have a proprietary method on ranges, moveToPoint: http://msdn.microsoft.com/en-us/library/ie/ms536632(v=vs.85).aspx
            // Thank you browsers for making this so 'easy' :)
            if (document.caretRangeFromPoint) {
                return this._doHitTestWithCaretRangeFromPoint(editorContent, e, mouseVerticalOffset);
            }
            else if (document.caretPositionFromPoint) {
                return this._doHitTestWithCaretPositionFromPoint(e);
            }
            else if (document.body.createTextRange) {
                return this._doHitTestWithMoveToPoint(e);
            }
            return {
                position: null,
                hitTarget: null
            };
        };
        MouseTargetFactory.prototype._getZoneAtCoord = function (mouseVerticalOffset) {
            // The target is either a view zone or the empty space after the last view-line
            var viewZoneWhitespace = this.viewHelper.getWhitespaceAtVerticalOffset(mouseVerticalOffset);
            if (viewZoneWhitespace) {
                var viewZoneMiddle = viewZoneWhitespace.verticalOffset + viewZoneWhitespace.height / 2, lineCount = this.context.model.getLineCount(), positionBefore = null, position, positionAfter = null;
                if (viewZoneWhitespace.afterLineNumber !== lineCount) {
                    // There are more lines after this view zone
                    positionAfter = new position_1.Position(viewZoneWhitespace.afterLineNumber + 1, 1);
                }
                if (viewZoneWhitespace.afterLineNumber > 0) {
                    // There are more lines above this view zone
                    positionBefore = new position_1.Position(viewZoneWhitespace.afterLineNumber, this.context.model.getLineMaxColumn(viewZoneWhitespace.afterLineNumber));
                }
                if (positionAfter === null) {
                    position = positionBefore;
                }
                else if (positionBefore === null) {
                    position = positionAfter;
                }
                else if (mouseVerticalOffset < viewZoneMiddle) {
                    position = positionBefore;
                }
                else {
                    position = positionAfter;
                }
                return {
                    viewZoneId: viewZoneWhitespace.id,
                    afterLineNumber: viewZoneWhitespace.afterLineNumber,
                    positionBefore: positionBefore,
                    positionAfter: positionAfter,
                    position: position
                };
            }
            return null;
        };
        MouseTargetFactory.prototype._getFullLineRangeAtCoord = function (mouseVerticalOffset) {
            if (this.viewHelper.isAfterLines(mouseVerticalOffset)) {
                // Below the last line
                var lineNumber = this.context.model.getLineCount();
                var maxLineColumn = this.context.model.getLineMaxColumn(lineNumber);
                return {
                    range: new range_1.Range(lineNumber, maxLineColumn, lineNumber, maxLineColumn),
                    isAfterLines: true
                };
            }
            var lineNumber = this.viewHelper.getLineNumberAtVerticalOffset(mouseVerticalOffset);
            var maxLineColumn = this.context.model.getLineMaxColumn(lineNumber);
            return {
                range: new range_1.Range(lineNumber, 1, lineNumber, maxLineColumn),
                isAfterLines: false
            };
        };
        MouseTargetFactory.prototype.getMouseColumn = function (layoutInfo, editorContent, e) {
            var mouseContentHorizontalOffset = this.viewHelper.getScrollLeft() + (e.posx - editorContent.left) - layoutInfo.contentLeft;
            return this._getMouseColumn(mouseContentHorizontalOffset);
        };
        MouseTargetFactory.prototype._getMouseColumn = function (mouseContentHorizontalOffset) {
            if (mouseContentHorizontalOffset < 0) {
                return 1;
            }
            var charWidth = this.context.configuration.editor.typicalHalfwidthCharacterWidth;
            var chars = Math.round(mouseContentHorizontalOffset / charWidth);
            return (chars + 1);
        };
        MouseTargetFactory.prototype.createMouseTargetFromViewCursor = function (target, lineNumber, column, mouseColumn) {
            return new MouseTarget(target, editorCommon_1.MouseTargetType.CONTENT_TEXT, mouseColumn, new position_1.Position(lineNumber, column));
        };
        MouseTargetFactory.prototype.createMouseTargetFromViewLines = function (target, mouseVerticalOffset, mouseColumn) {
            // This most likely indicates it happened after the last view-line
            var lineCount = this.context.model.getLineCount();
            var maxLineColumn = this.context.model.getLineMaxColumn(lineCount);
            return new MouseTarget(target, editorCommon_1.MouseTargetType.CONTENT_EMPTY, mouseColumn, new position_1.Position(lineCount, maxLineColumn));
        };
        MouseTargetFactory.prototype.createMouseTargetFromHitTestPosition = function (target, lineNumber, column, mouseHorizontalOffset, mouseColumn) {
            var pos = new position_1.Position(lineNumber, column);
            var lineWidth = this.viewHelper.getLineWidth(lineNumber);
            if (mouseHorizontalOffset > lineWidth) {
                return new MouseTarget(target, editorCommon_1.MouseTargetType.CONTENT_EMPTY, mouseColumn, pos);
            }
            var visibleRange = this.viewHelper.visibleRangeForPosition2(lineNumber, column);
            if (!visibleRange) {
                return new MouseTarget(target, editorCommon_1.MouseTargetType.UNKNOWN, mouseColumn, pos);
            }
            var columnHorizontalOffset = visibleRange.left;
            if (mouseHorizontalOffset === columnHorizontalOffset) {
                return new MouseTarget(target, editorCommon_1.MouseTargetType.CONTENT_TEXT, mouseColumn, pos);
            }
            var mouseIsBetween;
            if (column > 1) {
                var prevColumnHorizontalOffset = visibleRange.left;
                mouseIsBetween = false;
                mouseIsBetween = mouseIsBetween || (prevColumnHorizontalOffset < mouseHorizontalOffset && mouseHorizontalOffset < columnHorizontalOffset); // LTR case
                mouseIsBetween = mouseIsBetween || (columnHorizontalOffset < mouseHorizontalOffset && mouseHorizontalOffset < prevColumnHorizontalOffset); // RTL case
                if (mouseIsBetween) {
                    var rng = new range_1.Range(lineNumber, column, lineNumber, column - 1);
                    return new MouseTarget(target, editorCommon_1.MouseTargetType.CONTENT_TEXT, mouseColumn, pos, rng);
                }
            }
            var lineMaxColumn = this.context.model.getLineMaxColumn(lineNumber);
            if (column < lineMaxColumn) {
                var nextColumnVisibleRange = this.viewHelper.visibleRangeForPosition2(lineNumber, column + 1);
                if (nextColumnVisibleRange) {
                    var nextColumnHorizontalOffset = nextColumnVisibleRange.left;
                    mouseIsBetween = false;
                    mouseIsBetween = mouseIsBetween || (columnHorizontalOffset < mouseHorizontalOffset && mouseHorizontalOffset < nextColumnHorizontalOffset); // LTR case
                    mouseIsBetween = mouseIsBetween || (nextColumnHorizontalOffset < mouseHorizontalOffset && mouseHorizontalOffset < columnHorizontalOffset); // RTL case
                    if (mouseIsBetween) {
                        var rng = new range_1.Range(lineNumber, column, lineNumber, column + 1);
                        return new MouseTarget(target, editorCommon_1.MouseTargetType.CONTENT_TEXT, mouseColumn, pos, rng);
                    }
                }
            }
            return new MouseTarget(target, editorCommon_1.MouseTargetType.CONTENT_TEXT, mouseColumn, pos);
        };
        MouseTargetFactory.prototype.createMouseTargetFromContentWidgetsChild = function (target, mouseColumn) {
            var widgetId = this._findAttribute(target, 'widgetId', this.viewHelper.viewDomNode);
            if (widgetId) {
                return new MouseTarget(target, editorCommon_1.MouseTargetType.CONTENT_WIDGET, mouseColumn, null, null, widgetId);
            }
            else {
                return new MouseTarget(target, editorCommon_1.MouseTargetType.UNKNOWN);
            }
        };
        MouseTargetFactory.prototype.createMouseTargetFromOverlayWidgetsChild = function (target, mouseColumn) {
            var widgetId = this._findAttribute(target, 'widgetId', this.viewHelper.viewDomNode);
            if (widgetId) {
                return new MouseTarget(target, editorCommon_1.MouseTargetType.OVERLAY_WIDGET, mouseColumn, null, null, widgetId);
            }
            else {
                return new MouseTarget(target, editorCommon_1.MouseTargetType.UNKNOWN);
            }
        };
        MouseTargetFactory.prototype.createMouseTargetFromLinesDecorationsChild = function (target, mouseVerticalOffset, mouseColumn) {
            var viewZoneData = this._getZoneAtCoord(mouseVerticalOffset);
            if (viewZoneData) {
                return new MouseTarget(target, editorCommon_1.MouseTargetType.GUTTER_VIEW_ZONE, mouseColumn, viewZoneData.position, null, viewZoneData);
            }
            var res = this._getFullLineRangeAtCoord(mouseVerticalOffset);
            return new MouseTarget(target, editorCommon_1.MouseTargetType.GUTTER_LINE_DECORATIONS, mouseColumn, new position_1.Position(res.range.startLineNumber, res.range.startColumn), res.range, res.isAfterLines);
        };
        MouseTargetFactory.prototype.createMouseTargetFromLineNumbers = function (target, mouseVerticalOffset, mouseColumn) {
            var viewZoneData = this._getZoneAtCoord(mouseVerticalOffset);
            if (viewZoneData) {
                return new MouseTarget(target, editorCommon_1.MouseTargetType.GUTTER_VIEW_ZONE, mouseColumn, viewZoneData.position, null, viewZoneData);
            }
            var res = this._getFullLineRangeAtCoord(mouseVerticalOffset);
            return new MouseTarget(target, editorCommon_1.MouseTargetType.GUTTER_LINE_NUMBERS, mouseColumn, new position_1.Position(res.range.startLineNumber, res.range.startColumn), res.range, res.isAfterLines);
        };
        MouseTargetFactory.prototype.createMouseTargetFromGlyphMargin = function (target, mouseVerticalOffset, mouseColumn) {
            var viewZoneData = this._getZoneAtCoord(mouseVerticalOffset);
            if (viewZoneData) {
                return new MouseTarget(target, editorCommon_1.MouseTargetType.GUTTER_VIEW_ZONE, mouseColumn, viewZoneData.position, null, viewZoneData);
            }
            var res = this._getFullLineRangeAtCoord(mouseVerticalOffset);
            return new MouseTarget(target, editorCommon_1.MouseTargetType.GUTTER_GLYPH_MARGIN, mouseColumn, new position_1.Position(res.range.startLineNumber, res.range.startColumn), res.range, res.isAfterLines);
        };
        MouseTargetFactory.prototype.createMouseTargetFromScrollbar = function (target, mouseVerticalOffset, mouseColumn) {
            var possibleLineNumber = this.viewHelper.getLineNumberAtVerticalOffset(mouseVerticalOffset);
            var maxColumn = this.context.model.getLineMaxColumn(possibleLineNumber);
            return new MouseTarget(target, editorCommon_1.MouseTargetType.SCROLLBAR, mouseColumn, new position_1.Position(possibleLineNumber, maxColumn));
        };
        MouseTargetFactory.prototype.createMouseTargetFromUnknownTarget = function (target) {
            var isInView = this._isChild(target, this.viewHelper.viewDomNode, this.viewHelper.viewDomNode);
            var widgetId = null;
            if (isInView) {
                widgetId = this._findAttribute(target, 'widgetId', this.viewHelper.viewDomNode);
            }
            if (widgetId) {
                return new MouseTarget(target, editorCommon_1.MouseTargetType.OVERLAY_WIDGET, null, null, widgetId);
            }
            else {
                return new MouseTarget(target, editorCommon_1.MouseTargetType.UNKNOWN);
            }
        };
        return MouseTargetFactory;
    }());
    exports.MouseTargetFactory = MouseTargetFactory;
});
