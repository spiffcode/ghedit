var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/lifecycle', 'vs/base/common/strings', 'vs/base/common/eventEmitter', 'vs/workbench/parts/git/common/git'], function (require, exports, Lifecycle, Strings, EventEmitter, Git) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var FileStatus = (function () {
        function FileStatus(path, mimetype, status, rename, isModifiedInIndex) {
            this.path = path;
            this.mimetype = mimetype;
            this.status = status;
            this.rename = rename;
            this.id = FileStatus.typeOf(status) + ':' + path + (rename ? ':' + rename : '') + (isModifiedInIndex ? '$' : '');
            this.pathComponents = path.split('/');
        }
        FileStatus.prototype.getPath = function () {
            return this.path;
        };
        FileStatus.prototype.getPathComponents = function () {
            return this.pathComponents.slice(0);
        };
        FileStatus.prototype.getMimetype = function () {
            return this.mimetype;
        };
        FileStatus.prototype.getStatus = function () {
            return this.status;
        };
        FileStatus.prototype.getRename = function () {
            return this.rename;
        };
        FileStatus.prototype.getId = function () {
            return this.id;
        };
        FileStatus.prototype.getType = function () {
            switch (FileStatus.typeOf(this.status)) {
                case 'index': return Git.StatusType.INDEX;
                case 'workingTree': return Git.StatusType.WORKING_TREE;
                default: return Git.StatusType.MERGE;
            }
        };
        FileStatus.prototype.clone = function () {
            return new FileStatus(this.path, this.mimetype, this.status, this.rename);
        };
        FileStatus.prototype.update = function (other) {
            this.status = other.getStatus();
            this.rename = other.getRename();
        };
        FileStatus.typeOf = function (s) {
            switch (s) {
                case Git.Status.INDEX_MODIFIED:
                case Git.Status.INDEX_ADDED:
                case Git.Status.INDEX_DELETED:
                case Git.Status.INDEX_RENAMED:
                case Git.Status.INDEX_COPIED:
                    return 'index';
                case Git.Status.MODIFIED:
                case Git.Status.DELETED:
                case Git.Status.UNTRACKED:
                case Git.Status.IGNORED:
                    return 'workingTree';
                default:
                    return 'merge';
            }
        };
        return FileStatus;
    }());
    exports.FileStatus = FileStatus;
    var StatusGroup = (function (_super) {
        __extends(StatusGroup, _super);
        function StatusGroup(type) {
            _super.call(this);
            this.type = type;
            this.statusSet = Object.create(null);
            this.statusList = [];
            this.statusByName = Object.create(null);
            this.statusByRename = Object.create(null);
        }
        StatusGroup.prototype.getType = function () {
            return this.type;
        };
        StatusGroup.prototype.update = function (statusList) {
            var toDelete = Object.create(null);
            var id, path, rename;
            var status;
            for (id in this.statusSet) {
                toDelete[id] = this.statusSet[id];
            }
            for (var i = 0; i < statusList.length; i++) {
                status = statusList[i];
                id = status.getId();
                path = status.getPath();
                rename = status.getRename();
                if (toDelete[id]) {
                    this.statusSet[id].update(status);
                    toDelete[id] = null;
                }
                else {
                    this.statusSet[id] = status;
                }
            }
            for (id in toDelete) {
                if (status = toDelete[id]) {
                    this.emit('fileStatus:dispose', status);
                    delete this.statusSet[id];
                }
            }
            this.statusList = [];
            this.statusByName = Object.create(null);
            this.statusByRename = Object.create(null);
            for (id in this.statusSet) {
                status = this.statusSet[id];
                this.statusList.push(status);
                if (status.getRename()) {
                    this.statusByRename[status.getPath()] = status;
                }
                else {
                    this.statusByName[status.getPath()] = status;
                }
            }
        };
        StatusGroup.prototype.all = function () {
            return this.statusList;
        };
        StatusGroup.prototype.find = function (path) {
            return this.statusByName[path] || this.statusByRename[path] || null;
        };
        StatusGroup.prototype.dispose = function () {
            this.type = null;
            this.statusSet = null;
            this.statusList = null;
            this.statusByName = null;
            this.statusByRename = null;
            _super.prototype.dispose.call(this);
        };
        return StatusGroup;
    }(EventEmitter.EventEmitter));
    exports.StatusGroup = StatusGroup;
    var StatusModel = (function (_super) {
        __extends(StatusModel, _super);
        function StatusModel() {
            _super.call(this);
            this.indexStatus = new StatusGroup(Git.StatusType.INDEX);
            this.workingTreeStatus = new StatusGroup(Git.StatusType.WORKING_TREE);
            this.mergeStatus = new StatusGroup(Git.StatusType.MERGE);
            this.toDispose = [
                this.addEmitter2(this.indexStatus),
                this.addEmitter2(this.workingTreeStatus),
                this.addEmitter2(this.mergeStatus)
            ];
        }
        StatusModel.prototype.getSummary = function () {
            return {
                hasWorkingTreeChanges: this.getWorkingTreeStatus().all().length > 0,
                hasIndexChanges: this.getIndexStatus().all().length > 0,
                hasMergeChanges: this.getMergeStatus().all().length > 0
            };
        };
        StatusModel.prototype.update = function (status) {
            var index = [];
            var workingTree = [];
            var merge = [];
            status.forEach(function (raw) {
                switch (raw.x + raw.y) {
                    case '??': return workingTree.push(new FileStatus(raw.path, raw.mimetype, Git.Status.UNTRACKED));
                    case '!!': return workingTree.push(new FileStatus(raw.path, raw.mimetype, Git.Status.IGNORED));
                    case 'DD': return merge.push(new FileStatus(raw.path, raw.mimetype, Git.Status.BOTH_DELETED));
                    case 'AU': return merge.push(new FileStatus(raw.path, raw.mimetype, Git.Status.ADDED_BY_US));
                    case 'UD': return merge.push(new FileStatus(raw.path, raw.mimetype, Git.Status.DELETED_BY_THEM));
                    case 'UA': return merge.push(new FileStatus(raw.path, raw.mimetype, Git.Status.ADDED_BY_THEM));
                    case 'DU': return merge.push(new FileStatus(raw.path, raw.mimetype, Git.Status.DELETED_BY_US));
                    case 'AA': return merge.push(new FileStatus(raw.path, raw.mimetype, Git.Status.BOTH_ADDED));
                    case 'UU': return merge.push(new FileStatus(raw.path, raw.mimetype, Git.Status.BOTH_MODIFIED));
                }
                var isModifiedInIndex = false;
                switch (raw.x) {
                    case 'M':
                        index.push(new FileStatus(raw.path, raw.mimetype, Git.Status.INDEX_MODIFIED));
                        isModifiedInIndex = true;
                        break;
                    case 'A':
                        index.push(new FileStatus(raw.path, raw.mimetype, Git.Status.INDEX_ADDED));
                        break;
                    case 'D':
                        index.push(new FileStatus(raw.path, raw.mimetype, Git.Status.INDEX_DELETED));
                        break;
                    case 'R':
                        index.push(new FileStatus(raw.path, raw.mimetype, Git.Status.INDEX_RENAMED, raw.rename));
                        break;
                    case 'C':
                        index.push(new FileStatus(raw.path, raw.mimetype, Git.Status.INDEX_COPIED));
                        break;
                }
                switch (raw.y) {
                    case 'M':
                        workingTree.push(new FileStatus(raw.path, raw.mimetype, Git.Status.MODIFIED, raw.rename, isModifiedInIndex));
                        break;
                    case 'D':
                        workingTree.push(new FileStatus(raw.path, raw.mimetype, Git.Status.DELETED, raw.rename));
                        break;
                }
            });
            this.indexStatus.update(index);
            this.workingTreeStatus.update(workingTree);
            this.mergeStatus.update(merge);
            this.emit(Git.ModelEvents.STATUS_MODEL_UPDATED);
        };
        StatusModel.prototype.getIndexStatus = function () {
            return this.indexStatus;
        };
        StatusModel.prototype.getWorkingTreeStatus = function () {
            return this.workingTreeStatus;
        };
        StatusModel.prototype.getMergeStatus = function () {
            return this.mergeStatus;
        };
        StatusModel.prototype.getGroups = function () {
            return [this.mergeStatus, this.indexStatus, this.workingTreeStatus];
        };
        StatusModel.prototype.find = function (path, type) {
            var group;
            switch (type) {
                case Git.StatusType.INDEX:
                    group = this.indexStatus;
                    break;
                case Git.StatusType.WORKING_TREE:
                    group = this.workingTreeStatus;
                    break;
                case Git.StatusType.MERGE:
                    group = this.mergeStatus;
                    break;
                default:
                    return null;
            }
            return group.find(path);
        };
        StatusModel.prototype.dispose = function () {
            this.toDispose = Lifecycle.dispose(this.toDispose);
            if (this.indexStatus) {
                this.indexStatus.dispose();
                this.indexStatus = null;
            }
            if (this.workingTreeStatus) {
                this.workingTreeStatus.dispose();
                this.workingTreeStatus = null;
            }
            if (this.mergeStatus) {
                this.mergeStatus.dispose();
                this.mergeStatus = null;
            }
            _super.prototype.dispose.call(this);
        };
        return StatusModel;
    }(EventEmitter.EventEmitter));
    exports.StatusModel = StatusModel;
    var Model = (function (_super) {
        __extends(Model, _super);
        function Model() {
            _super.call(this);
            this.toDispose = [];
            this.repositoryRoot = null;
            this.status = new StatusModel();
            this.toDispose.push(this.addEmitter2(this.status));
            this.HEAD = null;
            this.heads = [];
            this.tags = [];
            this.remotes = [];
        }
        Model.prototype.getRepositoryRoot = function () {
            return this.repositoryRoot;
        };
        Model.prototype.getStatus = function () {
            return this.status;
        };
        Model.prototype.getHEAD = function () {
            return this.HEAD;
        };
        Model.prototype.getHeads = function () {
            return this.heads;
        };
        Model.prototype.getTags = function () {
            return this.tags;
        };
        Model.prototype.getRemotes = function () {
            return this.remotes;
        };
        Model.prototype.update = function (status) {
            if (!status) {
                status = {
                    repositoryRoot: null,
                    status: [],
                    HEAD: null,
                    heads: [],
                    tags: [],
                    remotes: []
                };
            }
            this.repositoryRoot = status.repositoryRoot;
            this.status.update(status.status);
            this.HEAD = status.HEAD;
            this.emit(Git.ModelEvents.HEAD_UPDATED);
            this.heads = status.heads;
            this.emit(Git.ModelEvents.HEADS_UPDATED);
            this.tags = status.tags;
            this.emit(Git.ModelEvents.TAGS_UPDATED);
            this.remotes = status.remotes;
            this.emit(Git.ModelEvents.REMOTES_UPDATED);
            this.emit(Git.ModelEvents.MODEL_UPDATED);
        };
        Model.prototype.getStatusSummary = function () {
            var status = this.getStatus();
            return {
                hasWorkingTreeChanges: status.getWorkingTreeStatus().all().length > 0,
                hasIndexChanges: status.getIndexStatus().all().length > 0,
                hasMergeChanges: status.getMergeStatus().all().length > 0
            };
        };
        Model.prototype.getPS1 = function () {
            if (!this.HEAD) {
                return '';
            }
            var label = this.HEAD.name || this.HEAD.commit.substr(0, 8);
            var statusSummary = this.getStatus().getSummary();
            return Strings.format('{0}{1}{2}{3}', label, statusSummary.hasWorkingTreeChanges ? '*' : '', statusSummary.hasIndexChanges ? '+' : '', statusSummary.hasMergeChanges ? '!' : '');
        };
        Model.prototype.dispose = function () {
            this.toDispose = Lifecycle.dispose(this.toDispose);
            _super.prototype.dispose.call(this);
        };
        return Model;
    }(EventEmitter.EventEmitter));
    exports.Model = Model;
});
//# sourceMappingURL=gitModel.js.map