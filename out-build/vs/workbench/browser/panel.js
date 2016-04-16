/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/platform/platform', 'vs/workbench/browser/composite'], function (require, exports, platform_1, composite_1) {
    "use strict";
    var Panel = (function (_super) {
        __extends(Panel, _super);
        function Panel() {
            _super.apply(this, arguments);
        }
        return Panel;
    }(composite_1.Composite));
    exports.Panel = Panel;
    /**
     * A panel descriptor is a leightweight descriptor of a panel in the monaco workbench.
     */
    var PanelDescriptor = (function (_super) {
        __extends(PanelDescriptor, _super);
        function PanelDescriptor(moduleId, ctorName, id, name, cssClass) {
            _super.call(this, moduleId, ctorName, id, name, cssClass);
        }
        return PanelDescriptor;
    }(composite_1.CompositeDescriptor));
    exports.PanelDescriptor = PanelDescriptor;
    var PanelRegistry = (function (_super) {
        __extends(PanelRegistry, _super);
        function PanelRegistry() {
            _super.apply(this, arguments);
        }
        /**
         * Registers a panel to the platform.
         */
        PanelRegistry.prototype.registerPanel = function (descriptor) {
            _super.prototype.registerComposite.call(this, descriptor);
        };
        /**
         * Returns the panel descriptor for the given id or null if none.
         */
        PanelRegistry.prototype.getPanel = function (id) {
            return this.getComposite(id);
        };
        /**
         * Returns an array of registered panels known to the platform.
         */
        PanelRegistry.prototype.getPanels = function () {
            return this.getComposits();
        };
        /**
         * Sets the id of the panel that should open on startup by default.
         */
        PanelRegistry.prototype.setDefaultPanelId = function (id) {
            this.defaultPanelId = id;
        };
        /**
         * Gets the id of the panel that should open on startup by default.
         */
        PanelRegistry.prototype.getDefaultPanelId = function () {
            return this.defaultPanelId;
        };
        return PanelRegistry;
    }(composite_1.CompositeRegistry));
    exports.PanelRegistry = PanelRegistry;
    exports.Extensions = {
        Panels: 'workbench.contributions.panels'
    };
    platform_1.Registry.add(exports.Extensions.Panels, new PanelRegistry());
});
//# sourceMappingURL=panel.js.map