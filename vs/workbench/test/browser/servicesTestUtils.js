/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/eventEmitter', 'vs/base/common/paths', 'vs/base/common/uri', 'vs/platform/telemetry/common/telemetry', 'vs/workbench/common/storage', 'vs/platform/lifecycle/common/baseLifecycleService', 'vs/base/common/types', 'vs/platform/configuration/common/configuration', 'vs/platform/storage/common/storage', 'vs/workbench/services/editor/common/editorService', 'vs/workbench/services/quickopen/common/quickOpenService', 'vs/workbench/services/part/common/partService', 'vs/workbench/services/workspace/common/contextService', 'vs/platform/event/common/event', 'vs/workbench/services/untitled/common/untitledEditorService', 'vs/platform/message/common/message', 'vs/platform/request/common/baseRequestService', 'vs/workbench/browser/parts/editor/editor.contribution'], function (require, exports, winjs_base_1, EventEmitter, Paths, uri_1, telemetry_1, Storage, LifecycleService, Types, configuration_1, storage_1, WorkbenchEditorService, QuickOpenService, PartService, WorkspaceContextService, event_1, untitledEditorService_1, message_1, baseRequestService_1) {
    'use strict';
    exports.TestWorkspace = {
        resource: uri_1.default.file('C:\\testWorkspace'),
        id: 'testWorkspace',
        name: 'Test Workspace',
        uid: new Date().getTime(),
        mtime: new Date().getTime()
    };
    exports.TestConfiguration = {
        env: Object.create(null)
    };
    var TestContextService = (function () {
        function TestContextService(workspace, configuration, options) {
            if (workspace === void 0) { workspace = exports.TestWorkspace; }
            if (configuration === void 0) { configuration = exports.TestConfiguration; }
            if (options === void 0) { options = null; }
            this.serviceId = WorkspaceContextService.IWorkspaceContextService;
            this.workspace = workspace;
            this.configuration = configuration;
            this.options = options || {
                globalSettings: {
                    settings: {}
                }
            };
        }
        TestContextService.prototype.getWorkspace = function () {
            return this.workspace;
        };
        TestContextService.prototype.getConfiguration = function () {
            return this.configuration;
        };
        TestContextService.prototype.getOptions = function () {
            return this.options;
        };
        TestContextService.prototype.updateOptions = function () {
        };
        TestContextService.prototype.isInsideWorkspace = function (resource) {
            if (resource && this.workspace) {
                return Paths.isEqualOrParent(resource.fsPath, this.workspace.resource.fsPath);
            }
            return false;
        };
        TestContextService.prototype.toWorkspaceRelativePath = function (resource) {
            return Paths.makeAbsolute(Paths.normalize(resource.fsPath.substr('c:'.length)));
        };
        TestContextService.prototype.toResource = function (workspaceRelativePath) {
            return uri_1.default.file(Paths.join('C:\\', workspaceRelativePath));
        };
        return TestContextService;
    }());
    exports.TestContextService = TestContextService;
    var TestMessageService = (function () {
        function TestMessageService() {
            this.serviceId = message_1.IMessageService;
            this.counter = 0;
        }
        TestMessageService.prototype.show = function (sev, message) {
            this.counter++;
            return null;
        };
        TestMessageService.prototype.getCounter = function () {
            return this.counter;
        };
        TestMessageService.prototype.hideAll = function () {
            // No-op
        };
        TestMessageService.prototype.confirm = function (confirmation) {
            return false;
        };
        TestMessageService.prototype.setStatusMessage = function (message, autoDisposeAfter) {
            if (autoDisposeAfter === void 0) { autoDisposeAfter = -1; }
            return {
                dispose: function () { }
            };
        };
        return TestMessageService;
    }());
    exports.TestMessageService = TestMessageService;
    var TestPartService = (function () {
        function TestPartService() {
            this.serviceId = PartService.IPartService;
        }
        TestPartService.prototype.layout = function () { };
        TestPartService.prototype.isCreated = function () {
            return true;
        };
        TestPartService.prototype.joinCreation = function () {
            return winjs_base_1.TPromise.as(null);
        };
        TestPartService.prototype.hasFocus = function (part) {
            return false;
        };
        TestPartService.prototype.isVisible = function (part) {
            return true;
        };
        TestPartService.prototype.isSideBarHidden = function () {
            return false;
        };
        TestPartService.prototype.setSideBarHidden = function (hidden) { };
        TestPartService.prototype.isPanelHidden = function () {
            return false;
        };
        TestPartService.prototype.setPanelHidden = function (hidden) { };
        TestPartService.prototype.getSideBarPosition = function () {
            return 0;
        };
        TestPartService.prototype.setSideBarPosition = function (position) { };
        TestPartService.prototype.addClass = function (clazz) { };
        TestPartService.prototype.removeClass = function (clazz) { };
        return TestPartService;
    }());
    exports.TestPartService = TestPartService;
    var TestEventService = (function (_super) {
        __extends(TestEventService, _super);
        function TestEventService() {
            _super.apply(this, arguments);
            this.serviceId = event_1.IEventService;
        }
        return TestEventService;
    }(EventEmitter.EventEmitter));
    exports.TestEventService = TestEventService;
    var TestLifecycleService = (function (_super) {
        __extends(TestLifecycleService, _super);
        function TestLifecycleService() {
            _super.apply(this, arguments);
        }
        return TestLifecycleService;
    }(LifecycleService.BaseLifecycleService));
    exports.TestLifecycleService = TestLifecycleService;
    var TestStorageService = (function (_super) {
        __extends(TestStorageService, _super);
        function TestStorageService() {
            _super.call(this);
            this.serviceId = storage_1.IStorageService;
            var context = new TestContextService();
            this.storage = new Storage.Storage(context, new Storage.InMemoryLocalStorage());
        }
        TestStorageService.prototype.store = function (key, value, scope) {
            if (scope === void 0) { scope = storage_1.StorageScope.GLOBAL; }
            this.storage.store(key, value, scope);
        };
        TestStorageService.prototype.swap = function (key, valueA, valueB, scope, defaultValue) {
            if (scope === void 0) { scope = storage_1.StorageScope.GLOBAL; }
            this.storage.swap(key, valueA, valueB, scope, defaultValue);
        };
        TestStorageService.prototype.remove = function (key, scope) {
            if (scope === void 0) { scope = storage_1.StorageScope.GLOBAL; }
            this.storage.remove(key, scope);
        };
        TestStorageService.prototype.get = function (key, scope, defaultValue) {
            if (scope === void 0) { scope = storage_1.StorageScope.GLOBAL; }
            return this.storage.get(key, scope, defaultValue);
        };
        TestStorageService.prototype.getInteger = function (key, scope, defaultValue) {
            if (scope === void 0) { scope = storage_1.StorageScope.GLOBAL; }
            return this.storage.getInteger(key, scope, defaultValue);
        };
        TestStorageService.prototype.getBoolean = function (key, scope, defaultValue) {
            if (scope === void 0) { scope = storage_1.StorageScope.GLOBAL; }
            return this.storage.getBoolean(key, scope, defaultValue);
        };
        return TestStorageService;
    }(EventEmitter.EventEmitter));
    exports.TestStorageService = TestStorageService;
    var TestRequestService = (function (_super) {
        __extends(TestRequestService, _super);
        function TestRequestService(workspace) {
            if (workspace === void 0) { workspace = exports.TestWorkspace; }
            _super.call(this, new TestContextService(), telemetry_1.NullTelemetryService);
        }
        return TestRequestService;
    }(baseRequestService_1.BaseRequestService));
    exports.TestRequestService = TestRequestService;
    var MockRequestService = (function (_super) {
        __extends(MockRequestService, _super);
        function MockRequestService(workspace, handler) {
            _super.call(this, new TestContextService(), telemetry_1.NullTelemetryService);
            this.handler = handler;
        }
        MockRequestService.prototype.makeRequest = function (options) {
            var data = this.handler(options.url);
            if (!data) {
                return _super.prototype.makeRequest.call(this, options);
            }
            var isString = Types.isString(data);
            var responseText = isString ? data : data.responseText;
            var getResponseHeader = isString ? function () { return ''; } : data.getResponseHeader;
            return winjs_base_1.TPromise.as({
                responseText: responseText,
                status: 200,
                readyState: 4,
                getResponseHeader: getResponseHeader
            });
        };
        return MockRequestService;
    }(baseRequestService_1.BaseRequestService));
    exports.MockRequestService = MockRequestService;
    var TestUntitledEditorService = (function () {
        function TestUntitledEditorService() {
            this.serviceId = untitledEditorService_1.IUntitledEditorService;
        }
        TestUntitledEditorService.prototype.get = function (resource) {
            return null;
        };
        TestUntitledEditorService.prototype.getAll = function () {
            return [];
        };
        TestUntitledEditorService.prototype.getDirty = function () {
            return [];
        };
        TestUntitledEditorService.prototype.isDirty = function () {
            return false;
        };
        TestUntitledEditorService.prototype.createOrGet = function (resource) {
            return null;
        };
        TestUntitledEditorService.prototype.hasAssociatedFilePath = function (resource) {
            return false;
        };
        return TestUntitledEditorService;
    }());
    exports.TestUntitledEditorService = TestUntitledEditorService;
    var TestEditorService = (function () {
        function TestEditorService(callback) {
            this.serviceId = WorkbenchEditorService.IWorkbenchEditorService;
            this.callback = callback || (function (s) { });
        }
        TestEditorService.prototype.setEditors = function (inputs) {
            return winjs_base_1.TPromise.as([]);
        };
        TestEditorService.prototype.closeEditors = function (othersOnly) {
            return winjs_base_1.TPromise.as(null);
        };
        TestEditorService.prototype.isVisible = function (input, includeDiff) {
            return false;
        };
        TestEditorService.prototype.getActiveEditor = function () {
            this.callback('getActiveEditor');
            return null;
        };
        TestEditorService.prototype.getActiveEditorInput = function () {
            this.callback('getActiveEditorInput');
            return null;
        };
        TestEditorService.prototype.getVisibleEditors = function () {
            this.callback('getVisibleEditors');
            return [];
        };
        TestEditorService.prototype.activateEditor = function (arg) {
            this.callback('activateEditor');
        };
        TestEditorService.prototype.moveEditor = function (from, to) {
            this.callback('moveEditor');
        };
        TestEditorService.prototype.arrangeEditors = function (arrangement) {
            this.callback('arrangeEditors');
        };
        TestEditorService.prototype.openEditor = function (input, options, position) {
            this.callback('openEditor');
            this.activeEditorInput = input;
            this.activeEditorOptions = options;
            this.activeEditorPosition = position;
            return winjs_base_1.TPromise.as(null);
        };
        TestEditorService.prototype.resolveEditorModel = function (input, refresh) {
            this.callback('resolveEditorModel');
            return input.resolve(refresh);
        };
        TestEditorService.prototype.closeEditor = function (arg) {
            this.callback('closeEditor');
            return winjs_base_1.TPromise.as(null);
        };
        TestEditorService.prototype.focusEditor = function (arg) {
            this.callback('focusEditor');
            return winjs_base_1.TPromise.as(null);
        };
        TestEditorService.prototype.inputToType = function (input) {
            return winjs_base_1.TPromise.as(null);
        };
        return TestEditorService;
    }());
    exports.TestEditorService = TestEditorService;
    var TestQuickOpenService = (function () {
        function TestQuickOpenService(callback) {
            this.serviceId = QuickOpenService.IQuickOpenService;
            this.callback = callback;
        }
        TestQuickOpenService.prototype.pick = function (arg, placeHolder, autoFocusFirst) {
            return winjs_base_1.TPromise.as(null);
        };
        TestQuickOpenService.prototype.input = function (options) {
            return winjs_base_1.TPromise.as(null);
        };
        TestQuickOpenService.prototype.refresh = function () {
            return winjs_base_1.TPromise.as(true);
        };
        TestQuickOpenService.prototype.show = function (prefix, quickNavigateConfiguration) {
            if (this.callback) {
                this.callback(prefix);
            }
            return winjs_base_1.TPromise.as(true);
        };
        TestQuickOpenService.prototype.getEditorHistory = function () {
            return [];
        };
        Object.defineProperty(TestQuickOpenService.prototype, "onShow", {
            get: function () {
                return null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TestQuickOpenService.prototype, "onHide", {
            get: function () {
                return null;
            },
            enumerable: true,
            configurable: true
        });
        TestQuickOpenService.prototype.removeEditorHistoryEntry = function (input) { };
        TestQuickOpenService.prototype.dispose = function () { };
        TestQuickOpenService.prototype.quickNavigate = function () { };
        return TestQuickOpenService;
    }());
    exports.TestQuickOpenService = TestQuickOpenService;
    exports.TestFileService = {
        resolveContent: function (resource) {
            return winjs_base_1.TPromise.as({
                resource: resource,
                value: 'Hello Html',
                etag: 'index.txt',
                mime: 'text/plain',
                encoding: 'utf8',
                mtime: new Date().getTime(),
                name: Paths.basename(resource.fsPath)
            });
        },
        updateContent: function (res) {
            return winjs_base_1.TPromise.timeout(1).then(function () {
                return {
                    resource: res,
                    etag: 'index.txt',
                    mime: 'text/plain',
                    encoding: 'utf8',
                    mtime: new Date().getTime(),
                    name: Paths.basename(res.fsPath)
                };
            });
        }
    };
    var TestConfigurationService = (function (_super) {
        __extends(TestConfigurationService, _super);
        function TestConfigurationService() {
            _super.apply(this, arguments);
            this.serviceId = configuration_1.IConfigurationService;
        }
        TestConfigurationService.prototype.getConfiguration = function () {
            return {};
        };
        TestConfigurationService.prototype.hasWorkspaceConfiguration = function () {
            return false;
        };
        TestConfigurationService.prototype.onDidUpdateConfiguration = function () {
            return { dispose: function () { } };
        };
        return TestConfigurationService;
    }(EventEmitter.EventEmitter));
    exports.TestConfigurationService = TestConfigurationService;
});
//# sourceMappingURL=servicesTestUtils.js.map