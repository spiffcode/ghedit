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
define(["require", "exports", 'vs/nls!vs/workbench/parts/html/browser/htmlPreviewPart', 'vs/base/common/uri', 'vs/base/common/winjs.base', 'vs/editor/common/editorCommon', 'vs/base/common/lifecycle', 'vs/base/browser/dom', 'vs/workbench/browser/parts/editor/baseEditor', 'vs/platform/telemetry/common/telemetry', 'vs/platform/workspace/common/workspace', 'vs/platform/theme/common/themes', 'vs/workbench/services/editor/common/editorService', 'vs/workbench/common/editor/textEditorModel', 'vs/workbench/parts/html/common/htmlInput', 'vs/workbench/services/themes/common/themeService', 'vs/platform/keybinding/common/keybindingsRegistry', 'vs/platform/opener/common/opener', 'vs/text!./webview.html'], function (require, exports, nls_1, uri_1, winjs_base_1, editorCommon_1, lifecycle_1, dom_1, baseEditor_1, telemetry_1, workspace_1, themes_1, editorService_1, textEditorModel_1, htmlInput_1, themeService_1, keybindingsRegistry_1, opener_1) {
    'use strict';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandDesc({
        id: '_webview.openDevTools',
        context: null,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(0),
        primary: null,
        handler: function () {
            var elements = document.querySelectorAll('webview.ready');
            for (var i = 0; i < elements.length; i++) {
                try {
                    elements.item(i).openDevTools();
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
    });
    var ManagedWebview = (function () {
        function ManagedWebview(_parent, _styleElement, onDidClickLink) {
            var _this = this;
            this._parent = _parent;
            this._styleElement = _styleElement;
            this._webview = document.createElement('webview');
            this._webview.style.width = '100%';
            this._webview.style.height = '100%';
            this._webview.autoSize = 'on';
            this._webview.nodeintegration = 'on';
            this._webview.src = require.toUrl('./webview.html');
            this._ready = new winjs_base_1.TPromise(function (resolve) {
                var subscription = dom_1.addDisposableListener(_this._webview, 'ipc-message', function (event) {
                    if (event.channel === 'webview-ready') {
                        // console.info('[PID Webview] ' + event.args[0]);
                        dom_1.addClass(_this._webview, 'ready'); // can be found by debug command
                        subscription.dispose();
                        resolve(_this);
                    }
                });
            });
            this._disposables = [
                dom_1.addDisposableListener(this._webview, 'console-message', function (e) {
                    console.log("[Embedded Page] " + e.message);
                }),
                dom_1.addDisposableListener(this._webview, 'crashed', function () {
                    console.error('embedded page crashed');
                }),
                dom_1.addDisposableListener(this._webview, 'ipc-message', function (event) {
                    if (event.channel === 'did-click-link') {
                        var uri = event.args[0];
                        onDidClickLink(uri_1.default.parse(uri));
                    }
                })
            ];
            this._parent.appendChild(this._webview);
        }
        ManagedWebview.prototype.dispose = function () {
            this._disposables = lifecycle_1.dispose(this._disposables);
            this._webview.parentElement.removeChild(this._webview);
        };
        ManagedWebview.prototype._send = function (channel) {
            var _this = this;
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            this._ready
                .then(function () { return (_a = _this._webview).send.apply(_a, [channel].concat(args)); var _a; })
                .done(void 0, console.error);
        };
        Object.defineProperty(ManagedWebview.prototype, "contents", {
            set: function (value) {
                this._send('content', value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ManagedWebview.prototype, "baseUrl", {
            set: function (value) {
                this._send('baseUrl', value);
            },
            enumerable: true,
            configurable: true
        });
        ManagedWebview.prototype.focus = function () {
            this._send('focus');
        };
        ManagedWebview.prototype.style = function (themeId) {
            var _a = window.getComputedStyle(this._styleElement), color = _a.color, backgroundColor = _a.backgroundColor, fontFamily = _a.fontFamily, fontSize = _a.fontSize;
            var value = "\n\t\tbody {\n\t\t\tmargin: 0;\n\t\t}\n\t\t* {\n\t\t\tcolor: " + color + ";\n\t\t\tbackground-color: " + backgroundColor + ";\n\t\t\tfont-family: " + fontFamily + ";\n\t\t\tfont-size: " + fontSize + ";\n\t\t}\n\t\timg {\n\t\t\tmax-width: 100%;\n\t\t\tmax-height: 100%;\n\t\t}\n\t\ta:focus,\n\t\tinput:focus,\n\t\tselect:focus,\n\t\ttextarea:focus {\n\t\t\toutline: 1px solid -webkit-focus-ring-color;\n\t\t\toutline-offset: -1px;\n\t\t}\n\t\t::-webkit-scrollbar {\n\t\t\twidth: 14px;\n\t\t\theight: 10px;\n\t\t}\n\t\t::-webkit-scrollbar-thumb:hover {\n\t\t\tbackground-color: rgba(100, 100, 100, 0.7);\n\t\t}";
            if (themes_1.isLightTheme(themeId)) {
                value += "\n\t\t\t::-webkit-scrollbar-thumb {\n\t\t\t\tbackground-color: rgba(100, 100, 100, 0.4);\n\t\t\t}\n\t\t\t::-webkit-scrollbar-thumb:active {\n\t\t\t\tbackground-color: rgba(0, 0, 0, 0.6);\n\t\t\t}";
            }
            else {
                value += "\n\t\t\t::-webkit-scrollbar-thumb {\n\t\t\t\tbackground-color: rgba(121, 121, 121, 0.4);\n\t\t\t}\n\t\t\t::-webkit-scrollbar-thumb:active {\n\t\t\t\tbackground-color: rgba(85, 85, 85, 0.8);\n\t\t\t}";
            }
            this._send('styles', value);
        };
        return ManagedWebview;
    }());
    /**
     * An implementation of editor for showing HTML content in an IFrame by leveraging the IFrameEditorInput.
     */
    var HtmlPreviewPart = (function (_super) {
        __extends(HtmlPreviewPart, _super);
        function HtmlPreviewPart(telemetryService, editorService, themeService, openerService, contextService) {
            _super.call(this, HtmlPreviewPart.ID, telemetryService);
            this._modelChangeSubscription = lifecycle_1.empty;
            this._themeChangeSubscription = lifecycle_1.empty;
            this._editorService = editorService;
            this._themeService = themeService;
            this._openerService = openerService;
            this._baseUrl = contextService.toResource('/');
        }
        HtmlPreviewPart.prototype.dispose = function () {
            // remove from dom
            this._webview.dispose();
            // unhook listeners
            this._themeChangeSubscription.dispose();
            this._modelChangeSubscription.dispose();
            this._model = undefined;
            _super.prototype.dispose.call(this);
        };
        HtmlPreviewPart.prototype.createEditor = function (parent) {
            this._container = document.createElement('div');
            parent.getHTMLElement().appendChild(this._container);
        };
        Object.defineProperty(HtmlPreviewPart.prototype, "webview", {
            get: function () {
                var _this = this;
                if (!this._webview) {
                    this._webview = new ManagedWebview(this._container, document.querySelector('.monaco-editor-background'), function (uri) { return _this._openerService.open(uri); });
                    this._webview.baseUrl = this._baseUrl && this._baseUrl.toString();
                }
                return this._webview;
            },
            enumerable: true,
            configurable: true
        });
        HtmlPreviewPart.prototype.changePosition = function (position) {
            // what this actually means is that we got reparented. that
            // has caused the webview to stop working and we need to reset it
            this._doSetVisible(false);
            this._doSetVisible(true);
            _super.prototype.changePosition.call(this, position);
        };
        HtmlPreviewPart.prototype.setVisible = function (visible, position) {
            this._doSetVisible(visible);
            return _super.prototype.setVisible.call(this, visible, position);
        };
        HtmlPreviewPart.prototype._doSetVisible = function (visible) {
            var _this = this;
            if (!visible) {
                this._themeChangeSubscription.dispose();
                this._modelChangeSubscription.dispose();
                this._webview.dispose();
                this._webview = undefined;
            }
            else {
                this._themeChangeSubscription = this._themeService.onDidThemeChange(function (themeId) { return _this.webview.style(themeId); });
                this.webview.style(this._themeService.getTheme());
                if (this._model) {
                    this._modelChangeSubscription = this._model.addListener2(editorCommon_1.EventType.ModelContentChanged2, function () { return _this.webview.contents = _this._model.getLinesContent(); });
                    this.webview.contents = this._model.getLinesContent();
                }
            }
        };
        HtmlPreviewPart.prototype.layout = function (dimension) {
            var width = dimension.width, height = dimension.height;
            this._container.style.width = width + "px";
            this._container.style.height = height + "px";
        };
        HtmlPreviewPart.prototype.focus = function () {
            this.webview.focus();
        };
        HtmlPreviewPart.prototype.setInput = function (input, options) {
            var _this = this;
            if (this.input === input) {
                return winjs_base_1.TPromise.as(undefined);
            }
            this._model = undefined;
            this._modelChangeSubscription.dispose();
            if (!(input instanceof htmlInput_1.HtmlInput)) {
                return winjs_base_1.TPromise.wrapError('Invalid input');
            }
            return this._editorService.resolveEditorModel({ resource: input.getResource() }).then(function (model) {
                if (model instanceof textEditorModel_1.BaseTextEditorModel) {
                    _this._model = model.textEditorModel;
                }
                if (!_this._model) {
                    return winjs_base_1.TPromise.wrapError(nls_1.localize(0, null));
                }
                _this._modelChangeSubscription = _this._model.addListener2(editorCommon_1.EventType.ModelContentChanged2, function () { return _this.webview.contents = _this._model.getLinesContent(); });
                _this.webview.contents = _this._model.getLinesContent();
                return _super.prototype.setInput.call(_this, input, options);
            });
        };
        HtmlPreviewPart.ID = 'workbench.editor.htmlPreviewPart';
        HtmlPreviewPart = __decorate([
            __param(0, telemetry_1.ITelemetryService),
            __param(1, editorService_1.IWorkbenchEditorService),
            __param(2, themeService_1.IThemeService),
            __param(3, opener_1.IOpenerService),
            __param(4, workspace_1.IWorkspaceContextService)
        ], HtmlPreviewPart);
        return HtmlPreviewPart;
    }(baseEditor_1.BaseEditor));
    exports.HtmlPreviewPart = HtmlPreviewPart;
});
//# sourceMappingURL=htmlPreviewPart.js.map