define(["require", "exports"], function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    exports.ClassNames = {
        TEXTAREA_COVER: 'textAreaCover',
        TEXTAREA: 'inputarea',
        LINES_CONTENT: 'lines-content',
        OVERFLOW_GUARD: 'overflow-guard',
        VIEW_LINES: 'view-lines',
        VIEW_LINE: 'view-line',
        SCROLLABLE_ELEMENT: 'editor-scrollable',
        CONTENT_WIDGETS: 'contentWidgets',
        OVERFLOWING_CONTENT_WIDGETS: 'overflowingContentWidgets',
        OVERLAY_WIDGETS: 'overlayWidgets',
        MARGIN_VIEW_OVERLAYS: 'margin-view-overlays',
        LINE_NUMBERS: 'line-numbers',
        GLYPH_MARGIN: 'glyph-margin',
        SCROLL_DECORATION: 'scroll-decoration',
        VIEW_CURSORS_LAYER: 'cursors-layer',
        VIEW_ZONES: 'view-zones'
    };
    /**
     * A positioning preference for rendering content widgets.
     */
    (function (ContentWidgetPositionPreference) {
        /**
         * Place the content widget exactly at a position
         */
        ContentWidgetPositionPreference[ContentWidgetPositionPreference["EXACT"] = 0] = "EXACT";
        /**
         * Place the content widget above a position
         */
        ContentWidgetPositionPreference[ContentWidgetPositionPreference["ABOVE"] = 1] = "ABOVE";
        /**
         * Place the content widget below a position
         */
        ContentWidgetPositionPreference[ContentWidgetPositionPreference["BELOW"] = 2] = "BELOW";
    })(exports.ContentWidgetPositionPreference || (exports.ContentWidgetPositionPreference = {}));
    var ContentWidgetPositionPreference = exports.ContentWidgetPositionPreference;
    /**
     * A positioning preference for rendering overlay widgets.
     */
    (function (OverlayWidgetPositionPreference) {
        /**
         * Position the overlay widget in the top right corner
         */
        OverlayWidgetPositionPreference[OverlayWidgetPositionPreference["TOP_RIGHT_CORNER"] = 0] = "TOP_RIGHT_CORNER";
        /**
         * Position the overlay widget in the bottom right corner
         */
        OverlayWidgetPositionPreference[OverlayWidgetPositionPreference["BOTTOM_RIGHT_CORNER"] = 1] = "BOTTOM_RIGHT_CORNER";
        /**
         * Position the overlay widget in the top center
         */
        OverlayWidgetPositionPreference[OverlayWidgetPositionPreference["TOP_CENTER"] = 2] = "TOP_CENTER";
    })(exports.OverlayWidgetPositionPreference || (exports.OverlayWidgetPositionPreference = {}));
    var OverlayWidgetPositionPreference = exports.OverlayWidgetPositionPreference;
    var ColorZone = (function () {
        function ColorZone(from, to, colorId, position) {
            this.from = from | 0;
            this.to = to | 0;
            this.colorId = colorId | 0;
            this.position = position | 0;
        }
        return ColorZone;
    }());
    exports.ColorZone = ColorZone;
    /**
     * A zone in the overview ruler
     */
    var OverviewRulerZone = (function () {
        function OverviewRulerZone(startLineNumber, endLineNumber, position, forceHeight, color, darkColor) {
            this.startLineNumber = startLineNumber;
            this.endLineNumber = endLineNumber;
            this.position = position;
            this.forceHeight = forceHeight;
            this._color = color;
            this._darkColor = darkColor;
            this._colorZones = null;
        }
        OverviewRulerZone.prototype.getColor = function (useDarkColor) {
            if (useDarkColor) {
                return this._darkColor;
            }
            return this._color;
        };
        OverviewRulerZone.prototype.equals = function (other) {
            return (this.startLineNumber === other.startLineNumber
                && this.endLineNumber === other.endLineNumber
                && this.position === other.position
                && this.forceHeight === other.forceHeight
                && this._color === other._color
                && this._darkColor === other._darkColor);
        };
        OverviewRulerZone.prototype.compareTo = function (other) {
            if (this.startLineNumber === other.startLineNumber) {
                if (this.endLineNumber === other.endLineNumber) {
                    if (this.forceHeight === other.forceHeight) {
                        if (this.position === other.position) {
                            if (this._darkColor === other._darkColor) {
                                if (this._color === other._color) {
                                    return 0;
                                }
                                return this._color < other._color ? -1 : 1;
                            }
                            return this._darkColor < other._darkColor ? -1 : 1;
                        }
                        return this.position - other.position;
                    }
                    return this.forceHeight - other.forceHeight;
                }
                return this.endLineNumber - other.endLineNumber;
            }
            return this.startLineNumber - other.startLineNumber;
        };
        OverviewRulerZone.prototype.setColorZones = function (colorZones) {
            this._colorZones = colorZones;
        };
        OverviewRulerZone.prototype.getColorZones = function () {
            return this._colorZones;
        };
        return OverviewRulerZone;
    }());
    exports.OverviewRulerZone = OverviewRulerZone;
});
//# sourceMappingURL=editorBrowser.js.map