/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/platform/platform', 'forked/navbarService', 'vs/platform/instantiation/common/descriptors'], function (require, exports, platform_1, navbarService, descriptors_1) {
    // Sort of forked from 31ce12f023580d67a66d14843e7f9983caadbe56:./vs/workbench/browser/parts/statusbar/statusbar.ts
    'use strict';
    exports.NavbarAlignment = navbarService.NavbarAlignment;
    var NavbarItemDescriptor = (function () {
        function NavbarItemDescriptor(ctor, alignment, priority) {
            this.syncDescriptor = descriptors_1.createSyncDescriptor(ctor);
            this.alignment = alignment || exports.NavbarAlignment.LEFT;
            this.priority = priority || 0;
        }
        return NavbarItemDescriptor;
    }());
    exports.NavbarItemDescriptor = NavbarItemDescriptor;
    var NavbarRegistry = (function () {
        function NavbarRegistry() {
            this._items = [];
        }
        Object.defineProperty(NavbarRegistry.prototype, "items", {
            get: function () {
                return this._items;
            },
            enumerable: true,
            configurable: true
        });
        NavbarRegistry.prototype.registerNavbarItem = function (descriptor) {
            this._items.push(descriptor);
        };
        return NavbarRegistry;
    }());
    exports.Extensions = {
        Navbar: 'workbench.contributions.navbar'
    };
    platform_1.Registry.add(exports.Extensions.Navbar, new NavbarRegistry());
});
//# sourceMappingURL=navbar.js.map