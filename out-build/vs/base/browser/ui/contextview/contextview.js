/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/browser/builder', 'vs/base/browser/dom', 'vs/base/common/lifecycle', 'vs/base/common/eventEmitter', 'vs/css!./contextview'], function (require, exports, builder_1, DOM, lifecycle_1, eventEmitter_1) {
    'use strict';
    (function (AnchorAlignment) {
        AnchorAlignment[AnchorAlignment["LEFT"] = 0] = "LEFT";
        AnchorAlignment[AnchorAlignment["RIGHT"] = 1] = "RIGHT";
    })(exports.AnchorAlignment || (exports.AnchorAlignment = {}));
    var AnchorAlignment = exports.AnchorAlignment;
    (function (AnchorPosition) {
        AnchorPosition[AnchorPosition["BELOW"] = 0] = "BELOW";
        AnchorPosition[AnchorPosition["ABOVE"] = 1] = "ABOVE";
    })(exports.AnchorPosition || (exports.AnchorPosition = {}));
    var AnchorPosition = exports.AnchorPosition;
    function layout(view, around, inside, anchorPosition, anchorAlignment) {
        var top, left;
        if (anchorPosition === AnchorPosition.BELOW) {
            top = around.top + around.height - inside.top;
            if (inside.top + top + view.height > inside.height && around.top - inside.top > view.height) {
                top = around.top - view.height - inside.top;
            }
        }
        else {
            top = around.top - view.height - inside.top;
            if (top + inside.top < 0 && around.top + around.height + view.height - inside.top < inside.height) {
                top = around.top + around.height - inside.top;
            }
        }
        if (anchorAlignment === AnchorAlignment.LEFT) {
            left = around.left - inside.left;
            if (inside.left + left + view.width > inside.width) {
                left -= view.width - around.width;
            }
        }
        else {
            left = around.left + around.width - view.width - inside.left;
            if (left + inside.left < 0 && around.left + view.width < inside.width) {
                left = around.left - inside.left;
            }
        }
        return { top: top, left: left };
    }
    exports.layout = layout;
    var ContextView = (function (_super) {
        __extends(ContextView, _super);
        function ContextView(container) {
            var _this = this;
            _super.call(this);
            this.$view = builder_1.$('.context-view').hide();
            this.setContainer(container);
            this.toDispose = [{
                    dispose: function () {
                        _this.setContainer(null);
                    }
                }];
            this.toDisposeOnClean = null;
        }
        ContextView.prototype.setContainer = function (container) {
            var _this = this;
            if (this.$container) {
                this.$container.off(ContextView.BUBBLE_UP_EVENTS);
                this.$container.off(ContextView.BUBBLE_DOWN_EVENTS, true);
                this.$container = null;
            }
            if (container) {
                this.$container = builder_1.$(container);
                this.$view.appendTo(this.$container);
                this.$container.on(ContextView.BUBBLE_UP_EVENTS, function (e) {
                    _this.onDOMEvent(e, document.activeElement, false);
                });
                this.$container.on(ContextView.BUBBLE_DOWN_EVENTS, function (e) {
                    _this.onDOMEvent(e, document.activeElement, true);
                }, null, true);
            }
        };
        ContextView.prototype.show = function (delegate) {
            if (this.isVisible()) {
                this.hide();
            }
            // Show static box
            this.$view.setClass('context-view').empty().style({ top: '0px', left: '0px' }).show();
            // Render content
            this.toDisposeOnClean = delegate.render(this.$view.getHTMLElement());
            // Set active delegate
            this.delegate = delegate;
            // Layout
            this.doLayout();
        };
        ContextView.prototype.layout = function () {
            if (!this.isVisible()) {
                return;
            }
            if (this.delegate.canRelayout === false) {
                this.hide();
                return;
            }
            if (this.delegate.layout) {
                this.delegate.layout();
            }
            this.doLayout();
        };
        ContextView.prototype.doLayout = function () {
            // Get anchor
            var anchor = this.delegate.getAnchor();
            // Compute around
            var around;
            // Get the element's position and size (to anchor the view)
            if (DOM.isHTMLElement(anchor)) {
                var $anchor = builder_1.$(anchor);
                var elementPosition = $anchor.getPosition();
                var elementSize = $anchor.getTotalSize();
                around = {
                    top: elementPosition.top,
                    left: elementPosition.left,
                    width: elementSize.width,
                    height: elementSize.height
                };
            }
            else {
                var realAnchor = anchor;
                around = {
                    top: realAnchor.y,
                    left: realAnchor.x,
                    width: realAnchor.width || 0,
                    height: realAnchor.height || 0
                };
            }
            // Get the container's position
            var insidePosition = this.$container.getPosition();
            var inside = {
                top: insidePosition.top,
                left: insidePosition.left,
                height: window.innerHeight,
                width: window.innerWidth
            };
            // Get the view's size
            var viewSize = this.$view.getTotalSize();
            var view = { width: viewSize.width, height: viewSize.height };
            var anchorPosition = this.delegate.anchorPosition || AnchorPosition.BELOW;
            var anchorAlignment = this.delegate.anchorAlignment || AnchorAlignment.LEFT;
            var result = layout(view, around, inside, anchorPosition, anchorAlignment);
            this.$view.removeClass('top', 'bottom', 'left', 'right');
            this.$view.addClass(anchorPosition === AnchorPosition.BELOW ? 'bottom' : 'top');
            this.$view.addClass(anchorAlignment === AnchorAlignment.LEFT ? 'left' : 'right');
            this.$view.style({ top: result.top + 'px', left: result.left + 'px', width: 'initial' });
        };
        ContextView.prototype.hide = function (data) {
            if (this.delegate && this.delegate.onHide) {
                this.delegate.onHide(data);
            }
            this.delegate = null;
            if (this.toDisposeOnClean) {
                this.toDisposeOnClean.dispose();
                this.toDisposeOnClean = null;
            }
            this.$view.hide();
        };
        ContextView.prototype.isVisible = function () {
            return !!this.delegate;
        };
        ContextView.prototype.onDOMEvent = function (e, element, onCapture) {
            if (this.delegate) {
                if (this.delegate.onDOMEvent) {
                    this.delegate.onDOMEvent(e, document.activeElement);
                }
                else if (onCapture && !DOM.isAncestor(e.target, this.$container.getHTMLElement())) {
                    this.hide();
                }
            }
        };
        ContextView.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.hide();
            this.toDispose = lifecycle_1.dispose(this.toDispose);
        };
        ContextView.BUBBLE_UP_EVENTS = ['click', 'keydown', 'focus', 'blur'];
        ContextView.BUBBLE_DOWN_EVENTS = ['click'];
        return ContextView;
    }(eventEmitter_1.EventEmitter));
    exports.ContextView = ContextView;
});
//# sourceMappingURL=contextview.js.map