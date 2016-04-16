var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/network', 'vs/base/common/winjs.base', 'vs/platform/editor/common/editor', 'vs/platform/keybinding/common/keybindingService'], function (require, exports, network_1, winjs_base_1, editor_1, keybindingService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var OpenerService = (function () {
        function OpenerService(_editorService, _keybindingService) {
            this._editorService = _editorService;
            this._keybindingService = _keybindingService;
            //
        }
        OpenerService.prototype.open = function (resource) {
            var _this = this;
            var scheme = resource.scheme, path = resource.path, query = resource.query, fragment = resource.fragment;
            var promise;
            if (scheme === network_1.Schemas.http || scheme === network_1.Schemas.https) {
                // open http
                window.open(resource.toString(true));
            }
            else if (scheme === 'command' && this._keybindingService.hasCommand(path)) {
                // execute as command
                var args = void 0;
                try {
                    args = JSON.parse(query);
                }
                catch (e) {
                }
                promise = this._keybindingService.executeCommand(path, args);
            }
            else {
                promise = this._editorService.resolveEditorModel({ resource: resource }).then(function (model) {
                    if (!model) {
                        return;
                    }
                    // support file:///some/file.js#L73
                    var selection;
                    if (/^L\d+$/.test(fragment)) {
                        selection = {
                            startLineNumber: parseInt(fragment.substr(1)),
                            startColumn: 1
                        };
                    }
                    return _this._editorService.openEditor({ resource: resource, options: { selection: selection } });
                });
            }
            return winjs_base_1.TPromise.as(promise).then(undefined, function (err) { }); // !ignores all errors
        };
        OpenerService = __decorate([
            __param(0, editor_1.IEditorService),
            __param(1, keybindingService_1.IKeybindingService)
        ], OpenerService);
        return OpenerService;
    }());
    exports.OpenerService = OpenerService;
});
//# sourceMappingURL=openerService.js.map