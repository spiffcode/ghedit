/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/severity', 'vs/base/browser/ui/actionbar/actionbar', 'vs/base/browser/dom', 'vs/base/browser/builder', 'vs/platform/contextview/browser/contextView', 'electron'], function (require, exports, winjs_base_1, severity_1, actionbar_1, dom, builder_1, contextView_1, electron_1) {
    'use strict';
    var ContextMenuService = (function () {
        function ContextMenuService(messageService, telemetryService, keybindingService) {
            this.serviceId = contextView_1.IContextMenuService;
            this.messageService = messageService;
            this.telemetryService = telemetryService;
            this.keybindingService = keybindingService;
        }
        ContextMenuService.prototype.showContextMenu = function (delegate) {
            var _this = this;
            delegate.getActions().then(function (actions) {
                if (!actions.length) {
                    return winjs_base_1.TPromise.as(null);
                }
                return winjs_base_1.TPromise.timeout(0).then(function () {
                    var menu = new electron_1.remote.Menu();
                    actions.forEach(function (a) {
                        if (a instanceof actionbar_1.Separator) {
                            menu.append(new electron_1.remote.MenuItem({ type: 'separator' }));
                        }
                        else {
                            var keybinding = !!delegate.getKeyBinding ? delegate.getKeyBinding(a) : undefined;
                            var accelerator = keybinding && _this.keybindingService.getElectronAcceleratorFor(keybinding);
                            var item = new electron_1.remote.MenuItem({
                                label: a.label,
                                checked: a.checked,
                                accelerator: accelerator,
                                enabled: a.enabled,
                                click: function () {
                                    _this.runAction(a, delegate);
                                }
                            });
                            menu.append(item);
                        }
                    });
                    var anchor = delegate.getAnchor();
                    var x, y;
                    if (dom.isHTMLElement(anchor)) {
                        var $anchor = builder_1.$(anchor);
                        var elementPosition = $anchor.getPosition();
                        var elementSize = $anchor.getTotalSize();
                        x = elementPosition.left;
                        y = elementPosition.top + elementSize.height;
                    }
                    else {
                        var pos = anchor;
                        x = pos.x;
                        y = pos.y;
                    }
                    var zoom = electron_1.webFrame.getZoomFactor();
                    x *= zoom;
                    y *= zoom;
                    menu.popup(electron_1.remote.getCurrentWindow(), Math.floor(x), Math.floor(y));
                });
            });
        };
        ContextMenuService.prototype.runAction = function (actionToRun, delegate) {
            var _this = this;
            if (delegate.onHide) {
                delegate.onHide(false);
            }
            this.telemetryService.publicLog('workbenchActionExecuted', { id: actionToRun.id, from: 'contextMenu' });
            var context = delegate.getActionsContext ? delegate.getActionsContext() : null;
            var res = actionToRun.run(context) || winjs_base_1.TPromise.as(null);
            res.done(null, function (e) { return _this.messageService.show(severity_1.default.Error, e); });
        };
        return ContextMenuService;
    }());
    exports.ContextMenuService = ContextMenuService;
});
//# sourceMappingURL=contextmenuService.js.map