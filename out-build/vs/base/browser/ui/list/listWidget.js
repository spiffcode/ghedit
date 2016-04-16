/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/lifecycle', 'vs/base/common/types', 'vs/base/browser/dom', 'vs/base/common/event', './listView', 'vs/css!./list'], function (require, exports, lifecycle_1, types_1, DOM, event_1, listView_1) {
    "use strict";
    var TraitRenderer = (function () {
        function TraitRenderer(controller, renderer) {
            this.controller = controller;
            this.renderer = renderer;
        }
        Object.defineProperty(TraitRenderer.prototype, "templateId", {
            get: function () {
                return this.renderer.templateId;
            },
            enumerable: true,
            configurable: true
        });
        TraitRenderer.prototype.renderTemplate = function (container) {
            var data = this.renderer.renderTemplate(container);
            return { container: container, data: data };
        };
        TraitRenderer.prototype.renderElement = function (element, index, templateData) {
            this.controller.renderElement(element, index, templateData.container);
            this.renderer.renderElement(element, index, templateData.data);
        };
        TraitRenderer.prototype.disposeTemplate = function (templateData) {
            return this.renderer.disposeTemplate(templateData.data);
        };
        return TraitRenderer;
    }());
    var Trait = (function () {
        function Trait(_trait) {
            this._trait = _trait;
            this._onChange = new event_1.Emitter();
            this.indexes = [];
        }
        Object.defineProperty(Trait.prototype, "onChange", {
            get: function () { return this._onChange.event; },
            enumerable: true,
            configurable: true
        });
        Trait.prototype.splice = function (start, deleteCount, insertCount) {
            var diff = insertCount - deleteCount;
            var end = start + deleteCount;
            var indexes = [];
            for (var _i = 0, indexes_1 = indexes; _i < indexes_1.length; _i++) {
                var index = indexes_1[_i];
                if (index >= start && index < end) {
                    continue;
                }
                indexes.push(index > start ? index + diff : index);
            }
            this.indexes = indexes;
            this._onChange.fire({ indexes: indexes });
        };
        Trait.prototype.renderElement = function (element, index, container) {
            DOM.toggleClass(container, this._trait, this.contains(index));
        };
        Trait.prototype.set = function () {
            var indexes = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                indexes[_i - 0] = arguments[_i];
            }
            var result = this.indexes;
            this.indexes = indexes;
            this._onChange.fire({ indexes: indexes });
            return result;
        };
        Trait.prototype.get = function () {
            return this.indexes;
        };
        Trait.prototype.contains = function (index) {
            return this.indexes.some(function (i) { return i === index; });
        };
        Trait.prototype.wrapRenderer = function (renderer) {
            return new TraitRenderer(this, renderer);
        };
        Trait.prototype.dispose = function () {
            this.indexes = null;
            this._onChange = lifecycle_1.dispose(this._onChange);
        };
        return Trait;
    }());
    var FocusTrait = (function (_super) {
        __extends(FocusTrait, _super);
        function FocusTrait(getElementId) {
            _super.call(this, 'focused');
            this.getElementId = getElementId;
        }
        FocusTrait.prototype.renderElement = function (element, index, container) {
            _super.prototype.renderElement.call(this, element, index, container);
            container.setAttribute('role', 'option');
            container.setAttribute('id', this.getElementId(index));
        };
        return FocusTrait;
    }(Trait));
    var Controller = (function () {
        function Controller(list, view) {
            var _this = this;
            this.list = list;
            this.view = view;
            this.toDispose = [];
            this.toDispose.push(view.addListener('click', function (e) { return _this.onClick(e); }));
        }
        Controller.prototype.onClick = function (e) {
            this.list.setSelection(e.index);
        };
        Controller.prototype.dispose = function () {
            this.toDispose = lifecycle_1.dispose(this.toDispose);
        };
        return Controller;
    }());
    var List = (function () {
        function List(container, delegate, renderers) {
            var _this = this;
            this.idPrefix = "list_id_" + ++List.InstanceCount;
            this.focus = new FocusTrait(function (i) { return _this.getElementId(i); });
            this.selection = new Trait('selected');
            this.eventBufferer = new event_1.EventBufferer();
            renderers = renderers.map(function (r) {
                r = _this.focus.wrapRenderer(r);
                r = _this.selection.wrapRenderer(r);
                return r;
            });
            this.view = new listView_1.ListView(container, delegate, renderers);
            this.view.domNode.setAttribute('role', 'listbox');
            this.controller = new Controller(this, this.view);
        }
        Object.defineProperty(List.prototype, "onFocusChange", {
            get: function () {
                var _this = this;
                return this.eventBufferer.wrapEvent(event_1.mapEvent(this.focus.onChange, function (e) { return _this.toListEvent(e); }));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(List.prototype, "onSelectionChange", {
            get: function () {
                var _this = this;
                return this.eventBufferer.wrapEvent(event_1.mapEvent(this.selection.onChange, function (e) { return _this.toListEvent(e); }));
            },
            enumerable: true,
            configurable: true
        });
        List.prototype.splice = function (start, deleteCount) {
            var _this = this;
            var elements = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                elements[_i - 2] = arguments[_i];
            }
            this.eventBufferer.bufferEvents(function () {
                _this.focus.splice(start, deleteCount, elements.length);
                _this.selection.splice(start, deleteCount, elements.length);
                (_a = _this.view).splice.apply(_a, [start, deleteCount].concat(elements));
                var _a;
            });
        };
        Object.defineProperty(List.prototype, "length", {
            get: function () {
                return this.view.length;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(List.prototype, "contentHeight", {
            get: function () {
                return this.view.getScrollHeight();
            },
            enumerable: true,
            configurable: true
        });
        List.prototype.layout = function (height) {
            this.view.layout(height);
        };
        List.prototype.setSelection = function () {
            var _this = this;
            var indexes = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                indexes[_i - 0] = arguments[_i];
            }
            this.eventBufferer.bufferEvents(function () {
                indexes = indexes.concat((_a = _this.selection).set.apply(_a, indexes));
                indexes.forEach(function (i) { return _this.view.splice(i, 1, _this.view.element(i)); });
                var _a;
            });
        };
        List.prototype.selectNext = function (n, loop) {
            if (n === void 0) { n = 1; }
            if (loop === void 0) { loop = false; }
            if (this.length === 0) {
                return;
            }
            var selection = this.selection.get();
            var index = selection.length > 0 ? selection[0] + n : 0;
            this.setSelection(loop ? index % this.length : Math.min(index, this.length - 1));
        };
        List.prototype.selectPrevious = function (n, loop) {
            if (n === void 0) { n = 1; }
            if (loop === void 0) { loop = false; }
            if (this.length === 0) {
                return;
            }
            var selection = this.selection.get();
            var index = selection.length > 0 ? selection[0] - n : 0;
            if (loop && index < 0) {
                index = this.length + (index % this.length);
            }
            this.setSelection(Math.max(index, 0));
        };
        List.prototype.setFocus = function () {
            var _this = this;
            var indexes = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                indexes[_i - 0] = arguments[_i];
            }
            this.eventBufferer.bufferEvents(function () {
                indexes = indexes.concat((_a = _this.focus).set.apply(_a, indexes));
                indexes.forEach(function (i) { return _this.view.splice(i, 1, _this.view.element(i)); });
                var _a;
            });
        };
        List.prototype.focusNext = function (n, loop) {
            if (n === void 0) { n = 1; }
            if (loop === void 0) { loop = false; }
            if (this.length === 0) {
                return;
            }
            var focus = this.focus.get();
            var index = focus.length > 0 ? focus[0] + n : 0;
            this.setFocus(loop ? index % this.length : Math.min(index, this.length - 1));
        };
        List.prototype.focusPrevious = function (n, loop) {
            if (n === void 0) { n = 1; }
            if (loop === void 0) { loop = false; }
            if (this.length === 0) {
                return;
            }
            var focus = this.focus.get();
            var index = focus.length > 0 ? focus[0] - n : 0;
            if (loop && index < 0) {
                index = (this.length + (index % this.length)) % this.length;
            }
            this.setFocus(Math.max(index, 0));
        };
        List.prototype.focusNextPage = function () {
            var _this = this;
            var lastPageIndex = this.view.indexAt(this.view.getScrollTop() + this.view.renderHeight);
            lastPageIndex = lastPageIndex === 0 ? 0 : lastPageIndex - 1;
            var lastPageElement = this.view.element(lastPageIndex);
            var currentlyFocusedElement = this.getFocus()[0];
            if (currentlyFocusedElement !== lastPageElement) {
                this.setFocus(lastPageIndex);
            }
            else {
                var previousScrollTop = this.view.getScrollTop();
                this.view.setScrollTop(previousScrollTop + this.view.renderHeight - this.view.elementHeight(lastPageIndex));
                if (this.view.getScrollTop() !== previousScrollTop) {
                    // Let the scroll event listener run
                    setTimeout(function () { return _this.focusNextPage(); }, 0);
                }
            }
        };
        List.prototype.focusPreviousPage = function () {
            var _this = this;
            var firstPageIndex;
            var scrollTop = this.view.getScrollTop();
            if (scrollTop === 0) {
                firstPageIndex = this.view.indexAt(scrollTop);
            }
            else {
                firstPageIndex = this.view.indexAfter(scrollTop - 1);
            }
            var firstPageElement = this.view.element(firstPageIndex);
            var currentlyFocusedElement = this.getFocus()[0];
            if (currentlyFocusedElement !== firstPageElement) {
                this.setFocus(firstPageIndex);
            }
            else {
                var previousScrollTop = scrollTop;
                this.view.setScrollTop(scrollTop - this.view.renderHeight);
                if (this.view.getScrollTop() !== previousScrollTop) {
                    // Let the scroll event listener run
                    setTimeout(function () { return _this.focusPreviousPage(); }, 0);
                }
            }
        };
        List.prototype.getFocus = function () {
            var _this = this;
            return this.focus.get().map(function (i) { return _this.view.element(i); });
        };
        List.prototype.reveal = function (index, relativeTop) {
            var scrollTop = this.view.getScrollTop();
            var elementTop = this.view.elementTop(index);
            var elementHeight = this.view.elementHeight(index);
            if (types_1.isNumber(relativeTop)) {
                relativeTop = relativeTop < 0 ? 0 : relativeTop;
                relativeTop = relativeTop > 1 ? 1 : relativeTop;
                // y = mx + b
                var m = elementHeight - this.view.renderHeight;
                this.view.setScrollTop(m * relativeTop + elementTop);
            }
            else {
                var viewItemBottom = elementTop + elementHeight;
                var wrapperBottom = scrollTop + this.view.renderHeight;
                if (elementTop < scrollTop) {
                    this.view.setScrollTop(elementTop);
                }
                else if (viewItemBottom >= wrapperBottom) {
                    this.view.setScrollTop(viewItemBottom - this.view.renderHeight);
                }
            }
        };
        List.prototype.getElementId = function (index) {
            return this.idPrefix + "_" + index;
        };
        List.prototype.toListEvent = function (_a) {
            var _this = this;
            var indexes = _a.indexes;
            return { indexes: indexes, elements: indexes.map(function (i) { return _this.view.element(i); }) };
        };
        List.prototype.dispose = function () {
            this.view = lifecycle_1.dispose(this.view);
            this.focus = lifecycle_1.dispose(this.focus);
            this.selection = lifecycle_1.dispose(this.selection);
        };
        List.InstanceCount = 0;
        return List;
    }());
    exports.List = List;
});
//# sourceMappingURL=listWidget.js.map