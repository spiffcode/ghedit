define(["require", "exports", 'vs/platform/platform', 'navbarService', 'vs/platform/instantiation/common/descriptors'], function (require, exports, platform_1, navbarService, descriptors_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
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