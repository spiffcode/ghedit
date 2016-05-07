define(["require", "exports", './contextView', 'vs/base/browser/ui/contextview/contextview'], function (require, exports, contextView_1, contextview_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var ContextViewService = (function () {
        function ContextViewService(container, telemetryService, messageService) {
            this.serviceId = contextView_1.IContextViewService;
            this.contextView = new contextview_1.ContextView(container);
        }
        ContextViewService.prototype.dispose = function () {
            this.contextView.dispose();
        };
        // ContextView
        ContextViewService.prototype.setContainer = function (container) {
            this.contextView.setContainer(container);
        };
        ContextViewService.prototype.showContextView = function (delegate) {
            this.contextView.show(delegate);
        };
        ContextViewService.prototype.layout = function () {
            this.contextView.layout();
        };
        ContextViewService.prototype.hideContextView = function (data) {
            this.contextView.hide(data);
        };
        return ContextViewService;
    }());
    exports.ContextViewService = ContextViewService;
});
//# sourceMappingURL=contextViewService.js.map