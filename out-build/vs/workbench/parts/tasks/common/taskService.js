define(["require", "exports", 'vs/platform/instantiation/common/instantiation', 'vs/workbench/parts/tasks/common/taskSystem'], function (require, exports, instantiation_1, taskSystem_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    exports.TaskType = taskSystem_1.TaskType;
    exports.ITaskService = instantiation_1.createDecorator('taskService');
    var TaskServiceEvents;
    (function (TaskServiceEvents) {
        TaskServiceEvents.Active = 'active';
        TaskServiceEvents.Inactive = 'inactive';
        TaskServiceEvents.ConfigChanged = 'configChanged';
        TaskServiceEvents.Terminated = 'terminated';
    })(TaskServiceEvents = exports.TaskServiceEvents || (exports.TaskServiceEvents = {}));
});
//# sourceMappingURL=taskService.js.map