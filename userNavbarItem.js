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
define(["require", "exports", 'vs/platform/contextview/browser/contextView', 'vs/platform/instantiation/common/instantiation', 'vs/base/browser/builder', 'vs/base/browser/ui/octiconLabel/octiconLabel', 'vs/base/common/lifecycle', 'githubService', 'vs/base/browser/ui/dropdown/dropdown', 'vs/base/common/actions', 'vs/base/common/winjs.base', 'vs/base/browser/dom'], function (require, exports, contextView_1, instantiation_1, builder_1, octiconLabel_1, lifecycle_1, githubService_1, dropdown_1, actions_1, winjs_base_1, dom) {
    'use strict';
    var UserNavbarItem = (function () {
        function UserNavbarItem(instantiationService, contextMenuService, githubService) {
            this.instantiationService = instantiationService;
            this.contextMenuService = contextMenuService;
            this.githubService = githubService;
        }
        // If the user is signed out show them a "Sign In" button.
        // If they're signed in show them a menu that includes a "Sign Out" item.
        UserNavbarItem.prototype.render = function (el) {
            var user = this.githubService.getAuthenticatedUserInfo();
            if (!user) {
                return this.renderSignedOut(el);
            }
            var actions = [
                // TODO: string localization
                new actions_1.Action('signOut', 'Sign Out', 'tight-menu-items', true, function (event) {
                    window.localStorage.removeItem('githubToken');
                    var d = new Date();
                    d.setTime(d.getTime() - 1000);
                    document.cookie = 'githubToken=;expires=' + d.toUTCString();
                    ;
                    window.localStorage.removeItem('githubUser');
                    window.localStorage.removeItem('githubPassword');
                    window.sessionStorage.removeItem('githubRepo');
                    window.sessionStorage.removeItem('githuRef');
                    window.localStorage.removeItem('lastGithubRepo');
                    window.localStorage.removeItem('lastGithubRef');
                    // Refresh to the page to fully present the signed out state.
                    location.href = location.origin + location.pathname;
                    return winjs_base_1.TPromise.as(true);
                }),
            ];
            return this.instantiationService.createInstance(dropdown_1.DropdownMenu, el, {
                tick: true,
                label: user.login,
                contextMenuProvider: this.contextMenuService,
                actions: actions
            });
        };
        UserNavbarItem.prototype.renderSignedOut = function (el) {
            var _this = this;
            var toDispose = [];
            dom.addClass(el, 'navbar-entry');
            // Text Container
            var textContainer = document.createElement('a');
            builder_1.$(textContainer).on('click', function (e) {
                _this.githubService.authenticate();
            }, toDispose);
            // Label
            // TODO: string localization
            new octiconLabel_1.OcticonLabel(textContainer).text = 'Sign In';
            // Tooltip
            // TODO: string localization
            builder_1.$(textContainer).title('Grant access to your GitHub repos, gists, and user info');
            el.appendChild(textContainer);
            return {
                dispose: function () {
                    toDispose = lifecycle_1.dispose(toDispose);
                }
            };
        };
        UserNavbarItem = __decorate([
            __param(0, instantiation_1.IInstantiationService),
            __param(1, contextView_1.IContextMenuService),
            __param(2, githubService_1.IGithubService)
        ], UserNavbarItem);
        return UserNavbarItem;
    }());
    exports.UserNavbarItem = UserNavbarItem;
});
//# sourceMappingURL=userNavbarItem.js.map