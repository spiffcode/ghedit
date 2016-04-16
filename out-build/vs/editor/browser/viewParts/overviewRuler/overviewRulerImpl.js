define(["require", "exports", 'vs/base/browser/browser', 'vs/base/browser/styleMutator', 'vs/editor/common/editorCommon', 'vs/editor/browser/editorBrowser'], function (require, exports, browser, styleMutator_1, editorCommon_1, editorBrowser_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ZoneManager = (function () {
        function ZoneManager(getVerticalOffsetForLine) {
            this._getVerticalOffsetForLine = getVerticalOffsetForLine;
            this._zones = [];
            this._colorZonesInvalid = false;
            this._lineHeight = 0;
            this._width = 0;
            this._height = 0;
            this._outerHeight = 0;
            this._maximumHeight = 0;
            this._minimumHeight = 0;
            this._useDarkColor = false;
            this._lastAssignedId = 0;
            this._color2Id = Object.create(null);
            this._id2Color = [];
        }
        ZoneManager.prototype.getId2Color = function () {
            return this._id2Color;
        };
        ZoneManager.prototype.setZones = function (newZones) {
            newZones.sort(function (a, b) { return a.compareTo(b); });
            var oldZones = this._zones;
            var oldIndex = 0;
            var oldLength = this._zones.length;
            var newIndex = 0;
            var newLength = newZones.length;
            var result = [];
            while (newIndex < newLength) {
                var newZone = newZones[newIndex];
                if (oldIndex >= oldLength) {
                    result.push(newZone);
                    newIndex++;
                }
                else {
                    var oldZone = oldZones[oldIndex];
                    var cmp = oldZone.compareTo(newZone);
                    if (cmp < 0) {
                        oldIndex++;
                    }
                    else if (cmp > 0) {
                        result.push(newZone);
                        newIndex++;
                    }
                    else {
                        // cmp === 0
                        result.push(oldZone);
                        oldIndex++;
                        newIndex++;
                    }
                }
            }
            this._zones = result;
        };
        ZoneManager.prototype.setLineHeight = function (lineHeight) {
            if (this._lineHeight === lineHeight) {
                return false;
            }
            this._lineHeight = lineHeight;
            this._colorZonesInvalid = true;
            return true;
        };
        ZoneManager.prototype.getWidth = function () {
            return this._width;
        };
        ZoneManager.prototype.setWidth = function (width) {
            if (this._width === width) {
                return false;
            }
            this._width = width;
            this._colorZonesInvalid = true;
            return true;
        };
        ZoneManager.prototype.getHeight = function () {
            return this._height;
        };
        ZoneManager.prototype.setHeight = function (height) {
            if (this._height === height) {
                return false;
            }
            this._height = height;
            this._colorZonesInvalid = true;
            return true;
        };
        ZoneManager.prototype.getOuterHeight = function () {
            return this._outerHeight;
        };
        ZoneManager.prototype.setOuterHeight = function (outerHeight) {
            if (this._outerHeight === outerHeight) {
                return false;
            }
            this._outerHeight = outerHeight;
            this._colorZonesInvalid = true;
            return true;
        };
        ZoneManager.prototype.setMaximumHeight = function (maximumHeight) {
            if (this._maximumHeight === maximumHeight) {
                return false;
            }
            this._maximumHeight = maximumHeight;
            this._colorZonesInvalid = true;
            return true;
        };
        ZoneManager.prototype.setMinimumHeight = function (minimumHeight) {
            if (this._minimumHeight === minimumHeight) {
                return false;
            }
            this._minimumHeight = minimumHeight;
            this._colorZonesInvalid = true;
            return true;
        };
        ZoneManager.prototype.setUseDarkColor = function (useDarkColor) {
            if (this._useDarkColor === useDarkColor) {
                return false;
            }
            this._useDarkColor = useDarkColor;
            this._colorZonesInvalid = true;
            return true;
        };
        ZoneManager.prototype.resolveColorZones = function () {
            var colorZonesInvalid = this._colorZonesInvalid;
            var lineHeight = Math.floor(this._lineHeight); // @perf
            var totalHeight = Math.floor(this._height); // @perf
            var maximumHeight = Math.floor(this._maximumHeight); // @perf
            var minimumHeight = Math.floor(this._minimumHeight); // @perf
            var useDarkColor = this._useDarkColor; // @perf
            var outerHeight = Math.floor(this._outerHeight); // @perf
            var heightRatio = totalHeight / outerHeight;
            var allColorZones = [];
            for (var i = 0, len = this._zones.length; i < len; i++) {
                var zone = this._zones[i];
                if (!colorZonesInvalid) {
                    var colorZones_1 = zone.getColorZones();
                    if (colorZones_1) {
                        for (var j = 0, lenJ = colorZones_1.length; j < lenJ; j++) {
                            allColorZones.push(colorZones_1[j]);
                        }
                        continue;
                    }
                }
                var y1 = Math.floor(this._getVerticalOffsetForLine(zone.startLineNumber));
                var y2 = Math.floor(this._getVerticalOffsetForLine(zone.endLineNumber)) + lineHeight;
                y1 = Math.floor(y1 * heightRatio);
                y2 = Math.floor(y2 * heightRatio);
                var colorZones = [];
                if (zone.forceHeight) {
                    y2 = y1 + zone.forceHeight;
                    colorZones.push(this.createZone(totalHeight, y1, y2, zone.forceHeight, zone.forceHeight, zone.getColor(useDarkColor), zone.position));
                }
                else {
                    // Figure out if we can render this in one continuous zone
                    var zoneLineNumbers = zone.endLineNumber - zone.startLineNumber + 1;
                    var zoneMaximumHeight = zoneLineNumbers * maximumHeight;
                    if (y2 - y1 > zoneMaximumHeight) {
                        // We need to draw one zone per line
                        for (var lineNumber = zone.startLineNumber; lineNumber <= zone.endLineNumber; lineNumber++) {
                            y1 = Math.floor(this._getVerticalOffsetForLine(lineNumber));
                            y2 = y1 + lineHeight;
                            y1 = Math.floor(y1 * heightRatio);
                            y2 = Math.floor(y2 * heightRatio);
                            colorZones.push(this.createZone(totalHeight, y1, y2, minimumHeight, maximumHeight, zone.getColor(useDarkColor), zone.position));
                        }
                    }
                    else {
                        colorZones.push(this.createZone(totalHeight, y1, y2, minimumHeight, zoneMaximumHeight, zone.getColor(useDarkColor), zone.position));
                    }
                }
                zone.setColorZones(colorZones);
                for (var j = 0, lenJ = colorZones.length; j < lenJ; j++) {
                    allColorZones.push(colorZones[j]);
                }
            }
            this._colorZonesInvalid = false;
            var sortFunc = function (a, b) {
                if (a.colorId === b.colorId) {
                    if (a.from === b.from) {
                        return a.to - b.to;
                    }
                    return a.from - b.from;
                }
                return a.colorId - b.colorId;
            };
            allColorZones.sort(sortFunc);
            return allColorZones;
        };
        ZoneManager.prototype.createZone = function (totalHeight, y1, y2, minimumHeight, maximumHeight, color, position) {
            totalHeight = Math.floor(totalHeight); // @perf
            y1 = Math.floor(y1); // @perf
            y2 = Math.floor(y2); // @perf
            minimumHeight = Math.floor(minimumHeight); // @perf
            maximumHeight = Math.floor(maximumHeight); // @perf
            var ycenter = Math.floor((y1 + y2) / 2);
            var halfHeight = (y2 - ycenter);
            if (halfHeight > maximumHeight / 2) {
                halfHeight = maximumHeight / 2;
            }
            if (halfHeight < minimumHeight / 2) {
                halfHeight = minimumHeight / 2;
            }
            if (ycenter - halfHeight < 0) {
                ycenter = halfHeight;
            }
            if (ycenter + halfHeight > totalHeight) {
                ycenter = totalHeight - halfHeight;
            }
            var colorId = this._color2Id[color];
            if (!colorId) {
                colorId = (++this._lastAssignedId);
                this._color2Id[color] = colorId;
                this._id2Color[colorId] = color;
            }
            return new editorBrowser_1.ColorZone(ycenter - halfHeight, ycenter + halfHeight, colorId, position);
        };
        return ZoneManager;
    }());
    var OverviewRulerImpl = (function () {
        function OverviewRulerImpl(canvasLeftOffset, cssClassName, scrollHeight, lineHeight, minimumHeight, maximumHeight, getVerticalOffsetForLine) {
            this._canvasLeftOffset = canvasLeftOffset;
            this._domNode = document.createElement('canvas');
            this._domNode.className = cssClassName;
            this._domNode.style.position = 'absolute';
            if (browser.canUseTranslate3d) {
                this._domNode.style.transform = 'translate3d(0px, 0px, 0px)';
            }
            this._lanesCount = 3;
            this._zoneManager = new ZoneManager(getVerticalOffsetForLine);
            this._zoneManager.setMinimumHeight(minimumHeight);
            this._zoneManager.setMaximumHeight(maximumHeight);
            this._zoneManager.setUseDarkColor(false);
            this._zoneManager.setWidth(0);
            this._zoneManager.setHeight(0);
            this._zoneManager.setOuterHeight(scrollHeight);
            this._zoneManager.setLineHeight(lineHeight);
        }
        OverviewRulerImpl.prototype.dispose = function () {
            this._zoneManager = null;
        };
        OverviewRulerImpl.prototype.setLayout = function (position, render) {
            styleMutator_1.StyleMutator.setTop(this._domNode, position.top);
            styleMutator_1.StyleMutator.setRight(this._domNode, position.right);
            var hasChanged = false;
            hasChanged = this._zoneManager.setWidth(position.width) || hasChanged;
            hasChanged = this._zoneManager.setHeight(position.height) || hasChanged;
            if (hasChanged) {
                this._domNode.width = this._zoneManager.getWidth();
                this._domNode.height = this._zoneManager.getHeight();
                if (render) {
                    this.render(true);
                }
            }
        };
        OverviewRulerImpl.prototype.getLanesCount = function () {
            return this._lanesCount;
        };
        OverviewRulerImpl.prototype.setLanesCount = function (newLanesCount, render) {
            this._lanesCount = newLanesCount;
            if (render) {
                this.render(true);
            }
        };
        OverviewRulerImpl.prototype.setUseDarkColor = function (useDarkColor, render) {
            this._zoneManager.setUseDarkColor(useDarkColor);
            if (render) {
                this.render(true);
            }
        };
        OverviewRulerImpl.prototype.getDomNode = function () {
            return this._domNode;
        };
        OverviewRulerImpl.prototype.getWidth = function () {
            return this._zoneManager.getWidth();
        };
        OverviewRulerImpl.prototype.getHeight = function () {
            return this._zoneManager.getHeight();
        };
        OverviewRulerImpl.prototype.setScrollHeight = function (scrollHeight, render) {
            this._zoneManager.setOuterHeight(scrollHeight);
            if (render) {
                this.render(true);
            }
        };
        OverviewRulerImpl.prototype.setLineHeight = function (lineHeight, render) {
            this._zoneManager.setLineHeight(lineHeight);
            if (render) {
                this.render(true);
            }
        };
        OverviewRulerImpl.prototype.setZones = function (zones, render) {
            this._zoneManager.setZones(zones);
            if (render) {
                this.render(false);
            }
        };
        OverviewRulerImpl.prototype.render = function (forceRender) {
            if (!OverviewRulerImpl.hasCanvas) {
                return false;
            }
            if (this._zoneManager.getOuterHeight() === 0) {
                return false;
            }
            var width = this._zoneManager.getWidth();
            var height = this._zoneManager.getHeight();
            var colorZones = this._zoneManager.resolveColorZones();
            var id2Color = this._zoneManager.getId2Color();
            var ctx = this._domNode.getContext('2d');
            ctx.clearRect(0, 0, width, height);
            if (colorZones.length > 0) {
                var remainingWidth = width - this._canvasLeftOffset;
                if (this._lanesCount >= 3) {
                    this._renderThreeLanes(ctx, colorZones, id2Color, remainingWidth);
                }
                else if (this._lanesCount === 2) {
                    this._renderTwoLanes(ctx, colorZones, id2Color, remainingWidth);
                }
                else if (this._lanesCount === 1) {
                    this._renderOneLane(ctx, colorZones, id2Color, remainingWidth);
                }
            }
            return true;
        };
        OverviewRulerImpl.prototype._renderOneLane = function (ctx, colorZones, id2Color, w) {
            this._renderVerticalPatch(ctx, colorZones, id2Color, editorCommon_1.OverviewRulerLane.Left | editorCommon_1.OverviewRulerLane.Center | editorCommon_1.OverviewRulerLane.Right, this._canvasLeftOffset, w);
        };
        OverviewRulerImpl.prototype._renderTwoLanes = function (ctx, colorZones, id2Color, w) {
            var leftWidth = Math.floor(w / 2);
            var rightWidth = w - leftWidth;
            var leftOffset = this._canvasLeftOffset;
            var rightOffset = this._canvasLeftOffset + leftWidth;
            this._renderVerticalPatch(ctx, colorZones, id2Color, editorCommon_1.OverviewRulerLane.Left | editorCommon_1.OverviewRulerLane.Center, leftOffset, leftWidth);
            this._renderVerticalPatch(ctx, colorZones, id2Color, editorCommon_1.OverviewRulerLane.Right, rightOffset, rightWidth);
        };
        OverviewRulerImpl.prototype._renderThreeLanes = function (ctx, colorZones, id2Color, w) {
            var leftWidth = Math.floor(w / 3);
            var rightWidth = Math.floor(w / 3);
            var centerWidth = w - leftWidth - rightWidth;
            var leftOffset = this._canvasLeftOffset;
            var centerOffset = this._canvasLeftOffset + leftWidth;
            var rightOffset = this._canvasLeftOffset + leftWidth + centerWidth;
            this._renderVerticalPatch(ctx, colorZones, id2Color, editorCommon_1.OverviewRulerLane.Left, leftOffset, leftWidth);
            this._renderVerticalPatch(ctx, colorZones, id2Color, editorCommon_1.OverviewRulerLane.Center, centerOffset, centerWidth);
            this._renderVerticalPatch(ctx, colorZones, id2Color, editorCommon_1.OverviewRulerLane.Right, rightOffset, rightWidth);
        };
        OverviewRulerImpl.prototype._renderVerticalPatch = function (ctx, colorZones, id2Color, laneMask, xpos, width) {
            var currentColorId = 0;
            var currentFrom = 0;
            var currentTo = 0;
            for (var i = 0, len = colorZones.length; i < len; i++) {
                var zone = colorZones[i];
                if (!(zone.position & laneMask)) {
                    continue;
                }
                var zoneColorId = zone.colorId;
                var zoneFrom = zone.from;
                var zoneTo = zone.to;
                if (zoneColorId !== currentColorId) {
                    ctx.fillRect(xpos, currentFrom, width, currentTo - currentFrom);
                    currentColorId = zoneColorId;
                    ctx.fillStyle = id2Color[currentColorId];
                    currentFrom = zoneFrom;
                    currentTo = zoneTo;
                }
                else {
                    if (currentTo >= zoneFrom) {
                        currentTo = Math.max(currentTo, zoneTo);
                    }
                    else {
                        ctx.fillRect(xpos, currentFrom, width, currentTo - currentFrom);
                        currentFrom = zoneFrom;
                        currentTo = zoneTo;
                    }
                }
            }
            ctx.fillRect(xpos, currentFrom, width, currentTo - currentFrom);
        };
        OverviewRulerImpl.hasCanvas = (window.navigator.userAgent.indexOf('MSIE 8') === -1);
        return OverviewRulerImpl;
    }());
    exports.OverviewRulerImpl = OverviewRulerImpl;
});
//# sourceMappingURL=overviewRulerImpl.js.map