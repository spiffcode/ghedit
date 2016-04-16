define(["require", "exports", 'vs/base/common/lifecycle', 'vs/base/browser/dom', 'vs/base/browser/ui/scrollbar/scrollableElementImpl', 'vs/editor/common/editorCommon', 'vs/editor/browser/editorBrowser'], function (require, exports, lifecycle_1, dom, scrollableElementImpl_1, editorCommon_1, editorBrowser_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function addPropertyIfPresent(src, dst, prop) {
        if (src.hasOwnProperty(prop)) {
            dst[prop] = src[prop];
        }
    }
    var ScrollManager = (function () {
        function ScrollManager(scrollable, configuration, privateViewEventBus, linesContent, viewDomNode, overflowGuardDomNode) {
            var _this = this;
            this.toDispose = [];
            this.scrollable = scrollable;
            this.configuration = configuration;
            this.privateViewEventBus = privateViewEventBus;
            this.linesContent = linesContent;
            this.toDispose.push(this.scrollable.addScrollListener(function (e) {
                _this.privateViewEventBus.emit(editorCommon_1.EventType.ViewScrollChanged, e);
            }));
            var configScrollbarOpts = this.configuration.editor.scrollbar;
            var scrollbarOptions = {
                listenOnDomNode: viewDomNode,
                vertical: configScrollbarOpts.vertical,
                horizontal: configScrollbarOpts.horizontal,
                className: editorBrowser_1.ClassNames.SCROLLABLE_ELEMENT + ' ' + this.configuration.editor.theme,
                useShadows: false,
                lazyRender: true,
                saveLastScrollTimeOnClassName: editorBrowser_1.ClassNames.VIEW_LINE
            };
            addPropertyIfPresent(configScrollbarOpts, scrollbarOptions, 'verticalHasArrows');
            addPropertyIfPresent(configScrollbarOpts, scrollbarOptions, 'horizontalHasArrows');
            addPropertyIfPresent(configScrollbarOpts, scrollbarOptions, 'verticalScrollbarSize');
            addPropertyIfPresent(configScrollbarOpts, scrollbarOptions, 'verticalSliderSize');
            addPropertyIfPresent(configScrollbarOpts, scrollbarOptions, 'horizontalScrollbarSize');
            addPropertyIfPresent(configScrollbarOpts, scrollbarOptions, 'horizontalSliderSize');
            addPropertyIfPresent(configScrollbarOpts, scrollbarOptions, 'handleMouseWheel');
            addPropertyIfPresent(configScrollbarOpts, scrollbarOptions, 'arrowSize');
            addPropertyIfPresent(configScrollbarOpts, scrollbarOptions, 'mouseWheelScrollSensitivity');
            this.scrollbar = new scrollableElementImpl_1.ScrollableElement(linesContent, this.scrollable, scrollbarOptions, {
                width: this.configuration.editor.layoutInfo.contentWidth,
                height: this.configuration.editor.layoutInfo.contentHeight,
            });
            this.toDispose.push(this.scrollbar);
            this.toDispose.push(this.configuration.onDidChange(function (e) {
                _this.scrollbar.updateClassName(_this.configuration.editor.theme);
                if (e.scrollbar) {
                    _this.scrollbar.updateOptions(_this.configuration.editor.scrollbar);
                }
            }));
            // When having a zone widget that calls .focus() on one of its dom elements,
            // the browser will try desperately to reveal that dom node, unexpectedly
            // changing the .scrollTop of this.linesContent
            var onBrowserDesperateReveal = function (domNode, lookAtScrollTop, lookAtScrollLeft) {
                if (lookAtScrollTop) {
                    var deltaTop = domNode.scrollTop;
                    if (deltaTop) {
                        _this.scrollable.setScrollTop(_this.scrollable.getScrollTop() + deltaTop);
                        domNode.scrollTop = 0;
                    }
                }
                if (lookAtScrollLeft) {
                    var deltaLeft = domNode.scrollLeft;
                    if (deltaLeft) {
                        _this.scrollable.setScrollLeft(_this.scrollable.getScrollLeft() + deltaLeft);
                        domNode.scrollLeft = 0;
                    }
                }
            };
            // I've seen this happen both on the view dom node & on the lines content dom node.
            this.toDispose.push(dom.addDisposableListener(viewDomNode, 'scroll', function (e) { return onBrowserDesperateReveal(viewDomNode, true, true); }));
            this.toDispose.push(dom.addDisposableListener(linesContent, 'scroll', function (e) { return onBrowserDesperateReveal(linesContent, true, false); }));
            this.toDispose.push(dom.addDisposableListener(overflowGuardDomNode, 'scroll', function (e) { return onBrowserDesperateReveal(overflowGuardDomNode, true, false); }));
        }
        ScrollManager.prototype.dispose = function () {
            this.toDispose = lifecycle_1.dispose(this.toDispose);
        };
        ScrollManager.prototype.renderScrollbar = function () {
            this.scrollbar.renderNow();
        };
        ScrollManager.prototype.onSizeProviderLayoutChanged = function () {
            if (this.scrollbar) {
                this.scrollbar.onElementDimensions({
                    width: this.configuration.editor.layoutInfo.contentWidth,
                    height: this.configuration.editor.layoutInfo.contentHeight,
                });
            }
        };
        ScrollManager.prototype.getOverviewRulerLayoutInfo = function () {
            if (this.scrollbar) {
                return this.scrollbar.getOverviewRulerLayoutInfo();
            }
            return null;
        };
        ScrollManager.prototype.getScrollbarContainerDomNode = function () {
            if (this.scrollbar) {
                return this.scrollbar.getDomNode();
            }
            return this.linesContent;
        };
        ScrollManager.prototype.delegateVerticalScrollbarMouseDown = function (browserEvent) {
            if (this.scrollbar) {
                this.scrollbar.delegateVerticalScrollbarMouseDown(browserEvent);
            }
        };
        return ScrollManager;
    }());
    exports.ScrollManager = ScrollManager;
});
