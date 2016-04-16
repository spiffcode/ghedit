define(["require", "exports", 'assert', 'vs/base/common/uri', 'vs/base/common/paths', 'vs/workbench/parts/files/browser/editors/fileEditorInput', 'vs/platform/instantiation/common/instantiationService', 'vs/workbench/parts/files/browser/textFileServices', 'vs/platform/telemetry/common/telemetry', 'vs/workbench/parts/files/browser/fileTracker', 'vs/workbench/test/browser/servicesTestUtils', 'vs/editor/test/common/servicesTestUtils', 'vs/workbench/parts/files/browser/files.contribution'], function (require, exports, assert, uri_1, paths_1, fileEditorInput_1, instantiationService_1, textFileServices_1, telemetry_1, fileTracker_1, servicesTestUtils_1, servicesTestUtils_2) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function toResource(path) {
        return uri_1.default.file(paths_1.join('C:\\', path));
    }
    suite('Files - FileEditorInput', function () {
        test('FileEditorInput', function (done) {
            var editorService = new servicesTestUtils_1.TestEditorService(function () { });
            var eventService = new servicesTestUtils_1.TestEventService();
            var telemetryService = telemetry_1.NullTelemetryService;
            var contextService = new servicesTestUtils_1.TestContextService();
            var instantiationService = instantiationService_1.createInstantiationService({
                eventService: eventService,
                contextService: contextService,
                fileService: servicesTestUtils_1.TestFileService,
                storageService: new servicesTestUtils_1.TestStorageService(),
                editorService: editorService,
                partService: new servicesTestUtils_1.TestPartService(),
                modeService: servicesTestUtils_2.createMockModeService(),
                modelService: servicesTestUtils_2.createMockModelService(),
                telemetryService: telemetryService,
                lifecycleService: new servicesTestUtils_1.TestLifecycleService(),
                configurationService: new servicesTestUtils_1.TestConfigurationService()
            });
            var textFileServices = instantiationService.createInstance(textFileServices_1.TextFileService);
            instantiationService.registerService('textFileService', textFileServices);
            var input = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, toResource('/foo/bar/file.js'), 'text/javascript', void 0);
            var otherInput = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, toResource('foo/bar/otherfile.js'), 'text/javascript', void 0);
            var otherInputSame = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, toResource('foo/bar/file.js'), 'text/javascript', void 0);
            assert(input.matches(input));
            assert(input.matches(otherInputSame));
            assert(!input.matches(otherInput));
            assert(!input.matches(null));
            assert(input.getName());
            assert.strictEqual('file.js', input.getName());
            assert.strictEqual(toResource('/foo/bar/file.js').fsPath, input.getResource().fsPath);
            assert(input.getResource() instanceof uri_1.default);
            input = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, toResource('/foo/bar.html'), 'text/html', void 0);
            var inputToResolve = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, toResource('/foo/bar/file.js'), 'text/javascript', void 0);
            var sameOtherInput = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, toResource('/foo/bar/file.js'), 'text/javascript', void 0);
            return editorService.resolveEditorModel(inputToResolve, true).then(function (resolved) {
                var resolvedModelA = resolved;
                return editorService.resolveEditorModel(inputToResolve, true).then(function (resolved) {
                    assert(resolvedModelA === resolved); // OK: Resolved Model cached globally per input
                    assert(inputToResolve.getStatus());
                    return editorService.resolveEditorModel(sameOtherInput, true).then(function (otherResolved) {
                        assert(otherResolved === resolvedModelA); // OK: Resolved Model cached globally per input
                        inputToResolve.dispose(false);
                        return editorService.resolveEditorModel(inputToResolve, true).then(function (resolved) {
                            assert(resolvedModelA === resolved); // Model is still the same because we had 2 clients
                            inputToResolve.dispose(true);
                            sameOtherInput.dispose(true);
                            return editorService.resolveEditorModel(inputToResolve, true).then(function (resolved) {
                                assert(resolvedModelA !== resolved); // Different instance, because input got disposed
                                var stat = resolved.versionOnDiskStat;
                                return editorService.resolveEditorModel(inputToResolve, true).then(function (resolved) {
                                    assert(stat !== resolved.versionOnDiskStat); // Different stat, because resolve always goes to the server for refresh
                                    stat = resolved.versionOnDiskStat;
                                    return editorService.resolveEditorModel(inputToResolve, false).then(function (resolved) {
                                        assert(stat === resolved.versionOnDiskStat); // Same stat, because not refreshed
                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
        test('Input.matches() - FileEditorInput', function () {
            var fileEditorInput = new fileEditorInput_1.FileEditorInput(toResource('/foo/bar/updatefile.js'), 'text/javascript', void 0, void 0, void 0, void 0);
            var contentEditorInput2 = new fileEditorInput_1.FileEditorInput(toResource('/foo/bar/updatefile.js'), 'text/javascript', void 0, void 0, void 0, void 0);
            assert.strictEqual(fileEditorInput.matches(null), false);
            assert.strictEqual(fileEditorInput.matches(fileEditorInput), true);
            assert.strictEqual(fileEditorInput.matches(contentEditorInput2), true);
        });
        test('FileTracker - dispose()', function (done) {
            var editorService = new servicesTestUtils_1.TestEditorService(function () { });
            var telemetryService = telemetry_1.NullTelemetryService;
            var contextService = new servicesTestUtils_1.TestContextService();
            var eventService = new servicesTestUtils_1.TestEventService();
            var instantiationService = instantiationService_1.createInstantiationService({
                eventService: eventService,
                contextService: contextService,
                fileService: servicesTestUtils_1.TestFileService,
                storageService: new servicesTestUtils_1.TestStorageService(),
                editorService: editorService,
                partService: new servicesTestUtils_1.TestPartService(),
                modeService: servicesTestUtils_2.createMockModeService(),
                modelService: servicesTestUtils_2.createMockModelService(),
                telemetryService: telemetryService,
                lifecycleService: new servicesTestUtils_1.TestLifecycleService(),
                configurationService: new servicesTestUtils_1.TestConfigurationService()
            });
            var textFileServices = instantiationService.createInstance(textFileServices_1.TextFileService);
            instantiationService.registerService('textFileService', textFileServices);
            var tracker = instantiationService.createInstance(fileTracker_1.FileTracker);
            var inputToResolve = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, toResource('/fooss5/bar/file2.js'), 'text/javascript', void 0);
            var sameOtherInput = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, toResource('/fooss5/bar/file2.js'), 'text/javascript', void 0);
            return editorService.resolveEditorModel(inputToResolve).then(function (resolved) {
                return editorService.resolveEditorModel(sameOtherInput).then(function (resolved) {
                    tracker.disposeAll(toResource('/bar'), []);
                    assert(!inputToResolve.isDisposed());
                    assert(!sameOtherInput.isDisposed());
                    tracker.disposeAll(toResource('/fooss5/bar/file2.js'), []);
                    assert(inputToResolve.isDisposed());
                    assert(sameOtherInput.isDisposed());
                    done();
                });
            });
        });
        test('FileEditorInput - dispose() also works for folders', function (done) {
            var editorService = new servicesTestUtils_1.TestEditorService(function () { });
            var telemetryService = telemetry_1.NullTelemetryService;
            var contextService = new servicesTestUtils_1.TestContextService();
            var eventService = new servicesTestUtils_1.TestEventService();
            var instantiationService = instantiationService_1.createInstantiationService({
                eventService: eventService,
                contextService: contextService,
                fileService: servicesTestUtils_1.TestFileService,
                storageService: new servicesTestUtils_1.TestStorageService(),
                editorService: editorService,
                partService: new servicesTestUtils_1.TestPartService(),
                modeService: servicesTestUtils_2.createMockModeService(),
                modelService: servicesTestUtils_2.createMockModelService(),
                telemetryService: telemetryService,
                lifecycleService: new servicesTestUtils_1.TestLifecycleService(),
                configurationService: new servicesTestUtils_1.TestConfigurationService()
            });
            var textFileServices = instantiationService.createInstance(textFileServices_1.TextFileService);
            instantiationService.registerService('textFileService', textFileServices);
            var tracker = instantiationService.createInstance(fileTracker_1.FileTracker);
            var inputToResolve = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, toResource('/foo6/bar/file.js'), 'text/javascript', void 0);
            var sameOtherInput = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, toResource('/foo6/bar/file.js'), 'text/javascript', void 0);
            return editorService.resolveEditorModel(inputToResolve, true).then(function (resolved) {
                return editorService.resolveEditorModel(sameOtherInput, true).then(function (resolved) {
                    tracker.disposeAll(toResource('/bar'), []);
                    assert(!inputToResolve.isDisposed());
                    assert(!sameOtherInput.isDisposed());
                    tracker.disposeAll(toResource('/foo6'), []);
                    assert(inputToResolve.isDisposed());
                    assert(sameOtherInput.isDisposed());
                    done();
                });
            });
        });
    });
});
//# sourceMappingURL=fileEditorInput.test.js.map