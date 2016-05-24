/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/platform/contextview/browser/contextView', 'vs/platform/instantiation/common/instantiation', 'vs/platform/workspace/common/workspace', 'vs/base/browser/dom', 'vs/base/browser/builder', 'vs/base/browser/ui/octiconLabel/octiconLabel', 'vs/base/common/lifecycle'], function (require, exports, contextView_1, instantiation_1, workspace_1, dom, builder_1, octiconLabel_1, lifecycle_1) {
    'use strict';
    var UserNavbarItem = (function () {
        function UserNavbarItem(instantiationService, contextViewService, contextService) {
            this.instantiationService = instantiationService;
            this.contextViewService = contextViewService;
            this.contextService = contextService;
        }
        UserNavbarItem.prototype.render = function (el) {
            var toDispose = [];
            dom.addClass(el, 'navbar-entry');
            // Text Container
            var textContainer;
            textContainer = document.createElement('a');
            builder_1.$(textContainer).on('click', function () { return window.location.href = 'https://github.com/login/oauth/authorize?client_id=bbc4f9370abd2b860a36&scope=user repo gist'; }, toDispose);
            // Label
            new octiconLabel_1.OcticonLabel(textContainer).text = 'Sign in';
            // Tooltip
            builder_1.$(textContainer).title('Grant access your GitHub account');
            el.appendChild(textContainer);
            return {
                dispose: function () {
                    toDispose = lifecycle_1.dispose(toDispose);
                }
            };
        };
        UserNavbarItem = __decorate([
            __param(0, instantiation_1.IInstantiationService),
            __param(1, contextView_1.IContextViewService),
            __param(2, workspace_1.IWorkspaceContextService)
        ], UserNavbarItem);
        return UserNavbarItem;
    }());
    exports.UserNavbarItem = UserNavbarItem;
});
//# sourceMappingURL=userNavbarItem.js.map