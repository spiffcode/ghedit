define(["require","exports","vs/platform/instantiation/common/instantiation","vs/workbench/parts/tasks/common/taskSystem"],function(e,t,a,i){/*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
"use strict";t.TaskType=i.TaskType,t.ITaskService=a.createDecorator("taskService");var n;!function(e){e.Active="active",e.Inactive="inactive",e.ConfigChanged="configChanged",e.Terminated="terminated"}(n=t.TaskServiceEvents||(t.TaskServiceEvents={}))});