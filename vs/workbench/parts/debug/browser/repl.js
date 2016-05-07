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
define(["require", "exports", 'vs/nls!vs/workbench/parts/debug/browser/repl', 'vs/base/common/errors', 'vs/base/common/lifecycle', 'vs/base/browser/dom', 'vs/base/common/platform', 'vs/base/parts/tree/browser/treeImpl', 'vs/workbench/parts/debug/browser/replViewer', 'vs/workbench/parts/debug/common/debug', 'vs/workbench/parts/debug/electron-browser/debugActions', 'vs/workbench/parts/debug/common/replHistory', 'vs/workbench/browser/panel', 'vs/platform/telemetry/common/telemetry', 'vs/platform/contextview/browser/contextView', 'vs/platform/instantiation/common/instantiation', 'vs/workbench/services/workspace/common/contextService', 'vs/platform/storage/common/storage', 'vs/base/common/keyCodes', 'vs/css!./media/repl'], function (require, exports, nls, errors, lifecycle, dom, platform, treeimpl, viewer, debug, debugactions, replhistory, panel_1, telemetry_1, contextView_1, instantiation_1, contextService_1, storage_1, keyCodes_1) {
    "use strict";
    var $ = dom.emmet;
    var replTreeOptions = {
        indentPixels: 8,
        twistiePixels: 20,
        paddingOnRow: false,
        ariaLabel: nls.localize(0, null)
    };
    var HISTORY_STORAGE_KEY = 'debug.repl.history';
    var Repl = (function (_super) {
        __extends(Repl, _super);
        function Repl(debugService, contextMenuService, contextService, telemetryService, instantiationService, contextViewService, storageService) {
            _super.call(this, debug.REPL_ID, telemetryService);
            this.debugService = debugService;
            this.contextMenuService = contextMenuService;
            this.contextService = contextService;
            this.instantiationService = instantiationService;
            this.contextViewService = contextViewService;
            this.storageService = storageService;
            this.toDispose = [];
            this.registerListeners();
        }
        Repl.prototype.registerListeners = function () {
            var _this = this;
            this.toDispose.push(this.debugService.getModel().addListener2(debug.ModelEvents.REPL_ELEMENTS_UPDATED, function (re) {
                _this.onReplElementsUpdated(re);
            }));
        };
        Repl.prototype.onReplElementsUpdated = function (re) {
            var _this = this;
            if (this.tree) {
                if (this.refreshTimeoutHandle) {
                    return; // refresh already triggered
                }
                this.refreshTimeoutHandle = setTimeout(function () {
                    _this.refreshTimeoutHandle = null;
                    var scrollPosition = _this.tree.getScrollPosition();
                    _this.tree.refresh().then(function () {
                        if (scrollPosition === 0 || scrollPosition === 1) {
                            return _this.tree.setScrollPosition(1); // keep scrolling to the end unless user scrolled up
                        }
                    }, errors.onUnexpectedError);
                }, Repl.REFRESH_DELAY);
            }
        };
        Repl.prototype.create = function (parent) {
            var _this = this;
            _super.prototype.create.call(this, parent);
            var container = dom.append(parent.getHTMLElement(), $('.repl'));
            this.treeContainer = dom.append(container, $('.repl-tree'));
            var replInputContainer = dom.append(container, $(platform.isWindows ? '.repl-input-wrapper.windows' : platform.isMacintosh ? '.repl-input-wrapper.mac' : '.repl-input-wrapper.linux'));
            this.replInput = dom.append(replInputContainer, $('input.repl-input'));
            this.replInput.type = 'text';
            this.toDispose.push(dom.addStandardDisposableListener(this.replInput, 'keydown', function (e) {
                var trimmedValue = _this.replInput.value.trim();
                if (e.equals(keyCodes_1.CommonKeybindings.ENTER) && trimmedValue) {
                    _this.debugService.addReplExpression(trimmedValue);
                    Repl.HISTORY.evaluated(trimmedValue);
                    _this.replInput.value = '';
                    e.preventDefault();
                }
                else if (e.equals(keyCodes_1.CommonKeybindings.UP_ARROW) || e.equals(keyCodes_1.CommonKeybindings.DOWN_ARROW)) {
                    var historyInput = e.equals(keyCodes_1.CommonKeybindings.UP_ARROW) ? Repl.HISTORY.previous() : Repl.HISTORY.next();
                    if (historyInput) {
                        Repl.HISTORY.remember(_this.replInput.value, e.equals(keyCodes_1.CommonKeybindings.UP_ARROW));
                        _this.replInput.value = historyInput;
                        // always leave cursor at the end.
                        e.preventDefault();
                    }
                }
            }));
            this.toDispose.push(dom.addStandardDisposableListener(this.replInput, dom.EventType.FOCUS, function () { return dom.addClass(replInputContainer, 'synthetic-focus'); }));
            this.toDispose.push(dom.addStandardDisposableListener(this.replInput, dom.EventType.BLUR, function () { return dom.removeClass(replInputContainer, 'synthetic-focus'); }));
            this.characterWidthSurveyor = dom.append(container, $('.surveyor'));
            this.characterWidthSurveyor.textContent = Repl.HALF_WIDTH_TYPICAL;
            for (var i = 0; i < 10; i++) {
                this.characterWidthSurveyor.textContent += this.characterWidthSurveyor.textContent;
            }
            this.characterWidthSurveyor.style.fontSize = platform.isMacintosh ? '12px' : '14px';
            this.renderer = this.instantiationService.createInstance(viewer.ReplExpressionsRenderer);
            this.tree = new treeimpl.Tree(this.treeContainer, {
                dataSource: new viewer.ReplExpressionsDataSource(this.debugService),
                renderer: this.renderer,
                accessibilityProvider: new viewer.ReplExpressionsAccessibilityProvider(),
                controller: new viewer.ReplExpressionsController(this.debugService, this.contextMenuService, new viewer.ReplExpressionsActionProvider(this.instantiationService), this.replInput, false)
            }, replTreeOptions);
            if (!Repl.HISTORY) {
                Repl.HISTORY = new replhistory.ReplHistory(JSON.parse(this.storageService.get(HISTORY_STORAGE_KEY, storage_1.StorageScope.WORKSPACE, '[]')));
            }
            return this.tree.setInput(this.debugService.getModel());
        };
        Repl.prototype.layout = function (dimension) {
            if (this.tree) {
                this.renderer.setWidth(dimension.width - 25, this.characterWidthSurveyor.clientWidth / this.characterWidthSurveyor.textContent.length);
                this.tree.layout(dimension.height - 22);
                // refresh the tree because layout might require some elements be word wrapped differently
                this.tree.refresh().done(undefined, errors.onUnexpectedError);
            }
        };
        Repl.prototype.focus = function () {
            this.replInput.focus();
        };
        Repl.prototype.reveal = function (element) {
            return this.tree.reveal(element);
        };
        Repl.prototype.getActions = function () {
            var _this = this;
            if (!this.actions) {
                this.actions = [
                    this.instantiationService.createInstance(debugactions.ClearReplAction, debugactions.ClearReplAction.ID, debugactions.ClearReplAction.LABEL)
                ];
                this.actions.forEach(function (a) {
                    _this.toDispose.push(a);
                });
            }
            return this.actions;
        };
        Repl.prototype.shutdown = function () {
            this.storageService.store(HISTORY_STORAGE_KEY, JSON.stringify(Repl.HISTORY.save()), storage_1.StorageScope.WORKSPACE);
        };
        Repl.prototype.dispose = function () {
            // destroy container
            this.toDispose = lifecycle.dispose(this.toDispose);
            _super.prototype.dispose.call(this);
        };
        Repl.HALF_WIDTH_TYPICAL = 'n';
        Repl.REFRESH_DELAY = 500; // delay in ms to refresh the repl for new elements to show
        Repl = __decorate([
            __param(0, debug.IDebugService),
            __param(1, contextView_1.IContextMenuService),
            __param(2, contextService_1.IWorkspaceContextService),
            __param(3, telemetry_1.ITelemetryService),
            __param(4, instantiation_1.IInstantiationService),
            __param(5, contextView_1.IContextViewService),
            __param(6, storage_1.IStorageService)
        ], Repl);
        return Repl;
    }(panel_1.Panel));
    exports.Repl = Repl;
});
//# sourceMappingURL=repl.js.map