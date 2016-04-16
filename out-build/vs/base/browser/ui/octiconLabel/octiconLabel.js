define(["require", "exports", 'vs/base/common/strings', 'vs/css!./octicons/octicons'], function (require, exports, strings_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function expand(text) {
        return text.replace(/\$\(([^)]+)\)/g, function (match, g1) {
            return "<span class=\"octicon octicon-" + g1 + "\"></span>";
        });
    }
    exports.expand = expand;
    var OcticonLabel = (function () {
        function OcticonLabel(container) {
            this._container = container;
        }
        Object.defineProperty(OcticonLabel.prototype, "text", {
            set: function (text) {
                var innerHTML = text || '';
                innerHTML = strings_1.escape(innerHTML);
                innerHTML = expand(innerHTML);
                this._container.innerHTML = innerHTML;
            },
            enumerable: true,
            configurable: true
        });
        return OcticonLabel;
    }());
    exports.OcticonLabel = OcticonLabel;
});
//# sourceMappingURL=octiconLabel.js.map