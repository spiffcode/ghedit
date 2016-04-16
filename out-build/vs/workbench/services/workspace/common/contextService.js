var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/workbench/common/events', 'vs/platform/instantiation/common/instantiation', 'vs/platform/workspace/common/baseWorkspaceContextService'], function (require, exports, events_1, instantiation_1, baseWorkspaceContextService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    exports.IWorkspaceContextService = instantiation_1.createDecorator('contextService');
    var WorkspaceContextService = (function (_super) {
        __extends(WorkspaceContextService, _super);
        function WorkspaceContextService(eventService, workspace, configuration, options) {
            if (options === void 0) { options = {}; }
            _super.call(this, workspace, configuration, options);
            this.eventService = eventService;
            this.serviceId = exports.IWorkspaceContextService;
        }
        WorkspaceContextService.prototype.updateOptions = function (key, value) {
            var oldValue = this.options[key];
            this.options[key] = value;
            this.eventService.emit(events_1.EventType.WORKBENCH_OPTIONS_CHANGED, new events_1.OptionsChangeEvent(key, oldValue, value));
        };
        return WorkspaceContextService;
    }(baseWorkspaceContextService_1.BaseWorkspaceContextService));
    exports.WorkspaceContextService = WorkspaceContextService;
});
//# sourceMappingURL=contextService.js.map