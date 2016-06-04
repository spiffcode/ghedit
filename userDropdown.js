/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/browser/ui/dropdown/linksDropdown'], function (require, exports, linksDropdown_1) {
    'use strict';
    //import {Dropdown, DropdownMenu, BaseDropdown, IDropdownOptions, IDropdownMenuOptions} from 'vs/base/browser/ui/dropdown/dropdown';
    var UserDropdown = (function (_super) {
        __extends(UserDropdown, _super);
        function UserDropdown(container, options) {
            _super.call(this, container, options);
        }
        return UserDropdown;
    }(linksDropdown_1.LinksDropdownMenu));
    exports.UserDropdown = UserDropdown;
});
//# sourceMappingURL=userDropdown.js.map