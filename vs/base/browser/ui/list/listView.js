/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/scrollable', 'vs/base/common/event', 'vs/base/common/objects', 'vs/base/common/lifecycle', 'vs/base/browser/touch', 'vs/base/browser/dom', 'vs/base/browser/ui/scrollbar/scrollableElementImpl', './rangeMap', './rowCache', 'vs/base/common/diff/diff'], function (require, exports, scrollable_1, event_1, objects_1, lifecycle_1, touch_1, DOM, scrollableElementImpl_1, rangeMap_1, rowCache_1, diff_1) {
    "use strict";
    function toSequence(itemRanges) {
        return {
            getLength: function () { return itemRanges.length; },
            getElementHash: function (i) { return (itemRanges[i].item.id + ":" + itemRanges[i].range.start + ":" + itemRanges[i].range.end); }
        };
    }
    var MouseEventTypes = ['click',
        'dblclick',
        'mouseup',
        'mousedown',
        'mouseover',
        'mousemove',
        'mouseout',
        'contextmenu'
    ];
    var ListView = (function () {
        function ListView(container, delegate, renderers) {
            this.delegate = delegate;
            this._onScroll = new event_1.Emitter();
            this.items = [];
            this.itemId = 0;
            this.rangeMap = new rangeMap_1.RangeMap();
            this.renderers = objects_1.toObject(renderers, function (r) { return r.templateId; });
            this.cache = new rowCache_1.RowCache(this.renderers);
            this.renderTop = 0;
            this._renderHeight = 0;
            this._domNode = document.createElement('div');
            this._domNode.className = 'monaco-list';
            this._domNode.tabIndex = 0;
            this.rowsContainer = document.createElement('div');
            this.rowsContainer.className = 'monaco-list-rows';
            this.gesture = new touch_1.Gesture(this.rowsContainer);
            this.scrollableElement = new scrollableElementImpl_1.ScrollableElement(this.rowsContainer, this, {
                forbidTranslate3dUse: true,
                horizontal: 'hidden',
                vertical: 'auto',
                useShadows: false,
                saveLastScrollTimeOnClassName: 'monaco-list-row'
            });
            this._domNode.appendChild(this.scrollableElement.getDomNode());
            container.appendChild(this._domNode);
            this.toDispose = [this.rangeMap, this.gesture, this.scrollableElement, this._onScroll];
            this.layout();
        }
        Object.defineProperty(ListView.prototype, "domNode", {
            get: function () {
                return this._domNode;
            },
            enumerable: true,
            configurable: true
        });
        ListView.prototype.splice = function (start, deleteCount) {
            var _this = this;
            var elements = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                elements[_i - 2] = arguments[_i];
            }
            var before = this.getRenderedItemRanges();
            var inserted = elements.map(function (element) { return ({
                id: String(_this.itemId++),
                element: element,
                size: _this.delegate.getHeight(element),
                templateId: _this.delegate.getTemplateId(element),
                row: null
            }); });
            (_a = this.rangeMap).splice.apply(_a, [start, deleteCount].concat(inserted));
            var deleted = (_b = this.items).splice.apply(_b, [start, deleteCount].concat(inserted));
            var after = this.getRenderedItemRanges();
            var lcs = new diff_1.LcsDiff(toSequence(before), toSequence(after), null);
            var diffs = lcs.ComputeDiff();
            for (var _c = 0, diffs_1 = diffs; _c < diffs_1.length; _c++) {
                var diff = diffs_1[_c];
                for (var i = 0; i < diff.originalLength; i++) {
                    this.removeItemFromDOM(before[diff.originalStart + i].item);
                }
                for (var i = 0; i < diff.modifiedLength; i++) {
                    this.insertItemInDOM(after[diff.modifiedStart + i].item, after[0].index + diff.modifiedStart + i);
                }
            }
            this.rowsContainer.style.height = this.rangeMap.size + "px";
            this.setScrollTop(this.renderTop);
            this._emitScrollEvent(false, false);
            return deleted.map(function (i) { return i.element; });
            var _a, _b;
        };
        Object.defineProperty(ListView.prototype, "length", {
            get: function () {
                return this.items.length;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListView.prototype, "renderHeight", {
            get: function () {
                return this._renderHeight;
            },
            enumerable: true,
            configurable: true
        });
        ListView.prototype.element = function (index) {
            return this.items[index].element;
        };
        ListView.prototype.elementHeight = function (index) {
            return this.items[index].size;
        };
        ListView.prototype.elementTop = function (index) {
            return this.rangeMap.positionAt(index);
        };
        ListView.prototype.indexAt = function (position) {
            return this.rangeMap.indexAt(position);
        };
        ListView.prototype.indexAfter = function (position) {
            return this.rangeMap.indexAfter(position);
        };
        ListView.prototype.layout = function (height) {
            this.setRenderHeight(height || DOM.getContentHeight(this._domNode));
            this.setScrollTop(this.renderTop);
            this.scrollableElement.onElementDimensions();
            this._emitScrollEvent(false, false);
        };
        // Render
        ListView.prototype.setRenderHeight = function (viewHeight) {
            this.render(this.renderTop, viewHeight);
            this._renderHeight = viewHeight;
        };
        ListView.prototype.render = function (renderTop, renderHeight) {
            var renderBottom = renderTop + renderHeight;
            var thisRenderBottom = this.renderTop + this._renderHeight;
            var i, stop;
            // when view scrolls down, start rendering from the renderBottom
            for (i = this.rangeMap.indexAfter(renderBottom) - 1, stop = this.rangeMap.indexAt(Math.max(thisRenderBottom, renderTop)); i >= stop; i--) {
                this.insertItemInDOM(this.items[i], i);
            }
            // when view scrolls up, start rendering from either this.renderTop or renderBottom
            for (i = Math.min(this.rangeMap.indexAt(this.renderTop), this.rangeMap.indexAfter(renderBottom)) - 1, stop = this.rangeMap.indexAt(renderTop); i >= stop; i--) {
                this.insertItemInDOM(this.items[i], i);
            }
            // when view scrolls down, start unrendering from renderTop
            for (i = this.rangeMap.indexAt(this.renderTop), stop = Math.min(this.rangeMap.indexAt(renderTop), this.rangeMap.indexAfter(thisRenderBottom)); i < stop; i++) {
                this.removeItemFromDOM(this.items[i]);
            }
            // when view scrolls up, start unrendering from either renderBottom this.renderTop
            for (i = Math.max(this.rangeMap.indexAfter(renderBottom), this.rangeMap.indexAt(this.renderTop)), stop = this.rangeMap.indexAfter(thisRenderBottom); i < stop; i++) {
                this.removeItemFromDOM(this.items[i]);
            }
            this.rowsContainer.style.transform = "translate3d(0px, -" + renderTop + "px, 0px)";
            this.renderTop = renderTop;
            this._renderHeight = renderBottom - renderTop;
        };
        ListView.prototype.getRenderedItemRanges = function () {
            var result = [];
            var renderBottom = this.renderTop + this._renderHeight;
            var start = this.renderTop;
            var index = this.rangeMap.indexAt(start);
            var item = this.items[index];
            var end = -1;
            while (item && start <= renderBottom) {
                end = start + item.size;
                result.push({ item: item, index: index, range: { start: start, end: end } });
                start = end;
                item = this.items[++index];
            }
            return result;
        };
        // DOM operations
        ListView.prototype.insertItemInDOM = function (item, index) {
            if (!item.row) {
                item.row = this.cache.alloc(item.templateId);
            }
            if (!item.row.domNode.parentElement) {
                this.rowsContainer.appendChild(item.row.domNode);
            }
            var renderer = this.renderers[item.templateId];
            item.row.domNode.style.top = this.elementTop(index) + "px";
            item.row.domNode.style.height = item.size + "px";
            item.row.domNode.setAttribute('data-index', "" + index);
            renderer.renderElement(item.element, index, item.row.templateData);
        };
        ListView.prototype.removeItemFromDOM = function (item) {
            this.cache.release(item.row);
            item.row = null;
        };
        // IScrollable
        ListView.prototype.getScrollHeight = function () {
            return this.rangeMap.size;
        };
        ListView.prototype.getScrollWidth = function () {
            return 0;
        };
        ListView.prototype.getScrollLeft = function () {
            return 0;
        };
        ListView.prototype.setScrollLeft = function (scrollLeft) {
            // noop
        };
        ListView.prototype.getScrollTop = function () {
            return this.renderTop;
        };
        ListView.prototype.setScrollTop = function (scrollTop) {
            scrollTop = Math.min(scrollTop, this.getScrollHeight() - this._renderHeight);
            scrollTop = Math.max(scrollTop, 0);
            this.render(scrollTop, this._renderHeight);
            this.renderTop = scrollTop;
            this._emitScrollEvent(true, false);
        };
        ListView.prototype._emitScrollEvent = function (vertical, horizontal) {
            this._onScroll.fire(new scrollable_1.ScrollEvent(this.getScrollTop(), this.getScrollLeft(), this.getScrollWidth(), this.getScrollHeight(), vertical, horizontal));
        };
        ListView.prototype.addScrollListener = function (callback) {
            return this._onScroll.event(callback);
        };
        // Events
        ListView.prototype.addListener = function (type, handler, useCapture) {
            var _this = this;
            if (MouseEventTypes.indexOf(type) > -1) {
                var userHandler_1 = handler;
                handler = function (event) {
                    var index = _this.getItemIndex(event);
                    if (index < 0) {
                        return;
                    }
                    var element = _this.items[index].element;
                    userHandler_1(objects_1.assign(event, { element: element, index: index }));
                };
            }
            return DOM.addDisposableListener(this.domNode, type, handler, useCapture);
        };
        ListView.prototype.getItemIndex = function (event) {
            var target = event.target;
            while (target instanceof HTMLElement && target !== this.rowsContainer) {
                var element = target;
                var rawIndex = element.getAttribute('data-index');
                if (rawIndex) {
                    var index = Number(rawIndex);
                    if (!isNaN(index)) {
                        return index;
                    }
                }
                target = element.parentElement;
            }
            return -1;
        };
        // Dispose
        ListView.prototype.dispose = function () {
            this.items = null;
            if (this._domNode && this._domNode.parentElement) {
                this._domNode.parentNode.removeChild(this._domNode);
                this._domNode = null;
            }
            this.toDispose = lifecycle_1.dispose(this.toDispose);
        };
        return ListView;
    }());
    exports.ListView = ListView;
});
//# sourceMappingURL=listView.js.map