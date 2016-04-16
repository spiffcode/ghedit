/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/browser/builder', 'vs/base/common/lifecycle', 'vs/base/browser/mouseEvent', 'vs/base/common/actions', 'vs/base/browser/ui/menu/menu', 'vs/base/common/events', 'vs/base/common/severity', 'vs/css!./contextMenuHandler'], function (require, exports, Builder, Lifecycle, Mouse, Actions, Menu, Events, severity_1) {
    'use strict';
    var $ = Builder.$;
    var ContextMenuHandler = (function () {
        function ContextMenuHandler(element, contextViewService, telemetryService, messageService) {
            var _this = this;
            this.setContainer(element);
            this.contextViewService = contextViewService;
            this.telemetryService = telemetryService;
            this.messageService = messageService;
            this.actionRunner = new Actions.ActionRunner();
            this.menuContainerElement = null;
            this.toDispose = [];
            var hideViewOnRun = false;
            this.toDispose.push(this.actionRunner.addListener2(Events.EventType.BEFORE_RUN, function (e) {
                if (_this.telemetryService) {
                    _this.telemetryService.publicLog('workbenchActionExecuted', { id: e.action.id, From: 'contextMenu' });
                }
                hideViewOnRun = !!e.retainActionItem;
                if (!hideViewOnRun) {
                    _this.contextViewService.hideContextView(false);
                }
            }));
            this.toDispose.push(this.actionRunner.addListener2(Events.EventType.RUN, function (e) {
                if (hideViewOnRun) {
                    _this.contextViewService.hideContextView(false);
                }
                hideViewOnRun = false;
                if (e.error && _this.messageService) {
                    _this.messageService.show(severity_1.default.Error, e.error);
                }
            }));
        }
        ContextMenuHandler.prototype.setContainer = function (container) {
            var _this = this;
            if (this.$el) {
                this.$el.off(['click', 'mousedown']);
                this.$el = null;
            }
            if (container) {
                this.$el = $(container);
                this.$el.on('mousedown', function (e) { return _this.onMouseDown(e); });
            }
        };
        ContextMenuHandler.prototype.showContextMenu = function (delegate) {
            var _this = this;
            delegate.getActions().done(function (actions) {
                _this.contextViewService.showContextView({
                    getAnchor: function () { return delegate.getAnchor(); },
                    canRelayout: false,
                    render: function (container) {
                        _this.menuContainerElement = container;
                        var className = delegate.getMenuClassName ? delegate.getMenuClassName() : '';
                        if (className) {
                            container.className += ' ' + className;
                        }
                        var menu = new Menu.Menu(container, actions, {
                            actionItemProvider: delegate.getActionItem,
                            context: delegate.getActionsContext ? delegate.getActionsContext() : null,
                            actionRunner: _this.actionRunner
                        });
                        var listener1 = menu.addListener2(Events.EventType.CANCEL, function (e) {
                            _this.contextViewService.hideContextView(true);
                        });
                        var listener2 = menu.addListener2(Events.EventType.BLUR, function (e) {
                            _this.contextViewService.hideContextView(true);
                        });
                        menu.focus();
                        return Lifecycle.combinedDisposable(listener1, listener2, menu);
                    },
                    onHide: function (didCancel) {
                        if (delegate.onHide) {
                            delegate.onHide(didCancel);
                        }
                        _this.menuContainerElement = null;
                    }
                });
            });
        };
        ContextMenuHandler.prototype.onMouseDown = function (e) {
            if (!this.menuContainerElement) {
                return;
            }
            var event = new Mouse.StandardMouseEvent(e);
            var element = event.target;
            while (element) {
                if (element === this.menuContainerElement) {
                    return;
                }
                element = element.parentElement;
            }
            this.contextViewService.hideContextView();
        };
        ContextMenuHandler.prototype.dispose = function () {
            this.setContainer(null);
        };
        return ContextMenuHandler;
    }());
    exports.ContextMenuHandler = ContextMenuHandler;
});
