/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'vs/base/common/uri', 'vs/platform/telemetry/common/telemetry', 'vs/platform/event/common/event', 'vs/platform/message/common/message', 'vs/editor/common/services/modelService', 'vs/editor/common/services/modeService', 'vs/platform/workspace/common/workspace', 'vs/platform/storage/common/storage', 'vs/platform/configuration/common/configuration', 'vs/platform/lifecycle/common/lifecycle', 'vs/platform/files/common/files', 'vs/workbench/services/untitled/common/untitledEditorService', 'vs/platform/instantiation/common/instantiationService', 'vs/workbench/services/editor/common/editorService', 'vs/workbench/services/part/common/partService', 'vs/platform/instantiation/common/serviceCollection', 'vs/workbench/test/browser/servicesTestUtils', 'vs/workbench/parts/files/common/workingFilesModel', 'vs/editor/test/common/servicesTestUtils', 'vs/workbench/parts/files/browser/editors/fileEditorInput'], function (require, exports, assert, uri_1, telemetry_1, event_1, message_1, modelService_1, modeService_1, workspace_1, storage_1, configuration_1, lifecycle_1, files_1, untitledEditorService_1, instantiationService_1, editorService_1, partService_1, serviceCollection_1, servicesTestUtils_1, workingFilesModel_1, servicesTestUtils_2, fileEditorInput_1) {
    'use strict';
    var baseInstantiationService;
    var editorService;
    var eventService;
    var textFileService;
    suite('Files - WorkingFilesModel', function () {
        setup(function () {
            editorService = new servicesTestUtils_1.TestEditorService();
            eventService = new servicesTestUtils_1.TestEventService();
            var services = new serviceCollection_1.ServiceCollection();
            services.set(event_1.IEventService, eventService);
            services.set(message_1.IMessageService, new servicesTestUtils_1.TestMessageService());
            services.set(files_1.IFileService, servicesTestUtils_1.TestFileService);
            services.set(workspace_1.IWorkspaceContextService, new servicesTestUtils_1.TestContextService());
            services.set(telemetry_1.ITelemetryService, telemetry_1.NullTelemetryService);
            services.set(storage_1.IStorageService, new servicesTestUtils_1.TestStorageService());
            services.set(untitledEditorService_1.IUntitledEditorService, new servicesTestUtils_1.TestUntitledEditorService());
            services.set(editorService_1.IWorkbenchEditorService, editorService);
            services.set(partService_1.IPartService, new servicesTestUtils_1.TestPartService());
            services.set(modeService_1.IModeService, servicesTestUtils_2.createMockModeService());
            services.set(modelService_1.IModelService, servicesTestUtils_2.createMockModelService());
            services.set(lifecycle_1.ILifecycleService, lifecycle_1.NullLifecycleService);
            services.set(configuration_1.IConfigurationService, new servicesTestUtils_1.TestConfigurationService());
            baseInstantiationService = new instantiationService_1.InstantiationService(services);
        });
        teardown(function () {
            eventService.dispose();
        });
        test("Removed files are added to the closed entries stack", function () {
            var model = baseInstantiationService.createInstance(workingFilesModel_1.WorkingFilesModel);
            var file1 = uri_1.default.create('file', null, '/file1');
            var file2 = uri_1.default.create('file', null, '/file2');
            var file3 = uri_1.default.create('file', null, '/file3');
            model.addEntry(file1);
            model.addEntry(file2);
            model.addEntry(file3);
            model.removeEntry(file2);
            model.removeEntry(file3);
            model.removeEntry(file1);
            var lastClosedEntry1 = model.popLastClosedEntry();
            var lastClosedEntry2 = model.popLastClosedEntry();
            var lastClosedEntry3 = model.popLastClosedEntry();
            assert.equal(model.popLastClosedEntry(), null);
            assert.equal(lastClosedEntry1.resource, file1);
            assert.equal(lastClosedEntry2.resource, file3);
            assert.equal(lastClosedEntry3.resource, file2);
        });
        test("Untitled entries are not added to the closed entries stack", function () {
            var model = baseInstantiationService.createInstance(workingFilesModel_1.WorkingFilesModel);
            var fileUri = uri_1.default.create('file', null, '/test');
            var untitledUri = uri_1.default.create('untitled', null);
            model.addEntry(fileUri);
            model.addEntry(untitledUri);
            model.removeEntry(fileUri);
            var lastClosedEntry = model.popLastClosedEntry();
            assert.equal(lastClosedEntry.resource, fileUri);
            model.removeEntry(untitledUri);
            assert.equal(model.popLastClosedEntry(), null);
        });
        test("Clearing the model adds all entries to the closed entries stack", function () {
            var model = baseInstantiationService.createInstance(workingFilesModel_1.WorkingFilesModel);
            model.addEntry(uri_1.default.create('file', null, '/foo'));
            model.addEntry(uri_1.default.create('file', null, '/bar'));
            assert.equal(model.popLastClosedEntry(), null);
            model.clear();
            assert.ok(model.popLastClosedEntry().isFile);
            assert.ok(model.popLastClosedEntry().isFile);
            assert.equal(model.popLastClosedEntry(), null);
        });
        test("Reopening multiple files will open the editor in the previously opened file", function () {
            var model = baseInstantiationService.createInstance(workingFilesModel_1.WorkingFilesModel);
            // Open /foo then /bar, set /foo as active input
            var fooEntry = model.addEntry(uri_1.default.create('file', null, '/foo'));
            editorService.getActiveEditorInput = function () {
                return baseInstantiationService.createInstance(fileEditorInput_1.FileEditorInput, fooEntry.resource, 'text/javascript', void 0);
            };
            model.addEntry(uri_1.default.create('file', null, '/bar'));
            model.clear();
            assert.equal(model.popLastClosedEntry().resource.path, '/foo');
            assert.equal(model.popLastClosedEntry().resource.path, '/bar');
            assert.equal(model.popLastClosedEntry(), null);
            // Open /bar then /foo, set /foo as active input
            model.addEntry(uri_1.default.create('file', null, '/bar'));
            fooEntry = model.addEntry(uri_1.default.create('file', null, '/foo'));
            editorService.getActiveEditorInput = function () {
                return baseInstantiationService.createInstance(fileEditorInput_1.FileEditorInput, fooEntry.resource, 'text/javascript', void 0);
            };
            model.clear();
            assert.equal(model.popLastClosedEntry().resource.path, '/foo');
            assert.equal(model.popLastClosedEntry().resource.path, '/bar');
            assert.equal(model.popLastClosedEntry(), null);
        });
    });
});
//# sourceMappingURL=workingFilesModel.test.js.map