var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/nls!vs/workbench/parts/tasks/browser/taskQuickOpen', 'vs/base/common/filters', 'vs/workbench/browser/quickopen', 'vs/base/parts/quickopen/common/quickOpen', 'vs/base/parts/quickopen/browser/quickOpenModel', 'vs/workbench/services/quickopen/common/quickOpenService', 'vs/workbench/parts/tasks/common/taskService'], function (require, exports, nls, Filters, Quickopen, QuickOpen, Model, quickOpenService_1, taskService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var TaskEntry = (function (_super) {
        __extends(TaskEntry, _super);
        function TaskEntry(taskService, task, highlights) {
            if (highlights === void 0) { highlights = []; }
            _super.call(this, highlights);
            this.taskService = taskService;
            this.task = task;
        }
        TaskEntry.prototype.getLabel = function () {
            return this.task.name;
        };
        TaskEntry.prototype.getAriaLabel = function () {
            return nls.localize(0, null, this.getLabel());
        };
        TaskEntry.prototype.run = function (mode, context) {
            if (mode === QuickOpen.Mode.PREVIEW) {
                return false;
            }
            this.taskService.run(this.task.id);
            return true;
        };
        return TaskEntry;
    }(Model.QuickOpenEntry));
    var QuickOpenHandler = (function (_super) {
        __extends(QuickOpenHandler, _super);
        function QuickOpenHandler(quickOpenService, taskService) {
            _super.call(this);
            this.quickOpenService = quickOpenService;
            this.taskService = taskService;
        }
        QuickOpenHandler.prototype.getAriaLabel = function () {
            return nls.localize(1, null);
        };
        QuickOpenHandler.prototype.getResults = function (input) {
            var _this = this;
            return this.taskService.tasks().then(function (tasks) { return tasks
                .sort(function (a, b) { return a.name.localeCompare(b.name); })
                .map(function (task) { return ({ task: task, highlights: Filters.matchesContiguousSubString(input, task.name) }); })
                .filter(function (_a) {
                var highlights = _a.highlights;
                return !!highlights;
            })
                .map(function (_a) {
                var task = _a.task, highlights = _a.highlights;
                return new TaskEntry(_this.taskService, task, highlights);
            }); }, function (_) { return []; }).then(function (e) { return new Model.QuickOpenModel(e); });
        };
        QuickOpenHandler.prototype.getClass = function () {
            return null;
        };
        QuickOpenHandler.prototype.canRun = function () {
            return true;
        };
        QuickOpenHandler.prototype.getAutoFocus = function (input) {
            return {
                autoFocusFirstEntry: !!input
            };
        };
        QuickOpenHandler.prototype.onClose = function (canceled) {
            return;
        };
        QuickOpenHandler.prototype.getGroupLabel = function () {
            return null;
        };
        QuickOpenHandler.prototype.getEmptyLabel = function (searchString) {
            if (searchString.length > 0) {
                return nls.localize(2, null);
            }
            return nls.localize(3, null);
        };
        QuickOpenHandler = __decorate([
            __param(0, quickOpenService_1.IQuickOpenService),
            __param(1, taskService_1.ITaskService)
        ], QuickOpenHandler);
        return QuickOpenHandler;
    }(Quickopen.QuickOpenHandler));
    exports.QuickOpenHandler = QuickOpenHandler;
});
//# sourceMappingURL=taskQuickOpen.js.map