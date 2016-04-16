/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'vs/base/common/winjs.base', 'vs/base/common/uri', 'vs/base/common/paths', 'vs/workbench/parts/files/browser/editors/fileEditorInput', 'vs/workbench/parts/files/common/editors/textFileEditorModel', 'vs/platform/telemetry/common/telemetry', 'vs/platform/instantiation/common/instantiationService', 'vs/workbench/parts/files/browser/textFileServices', 'vs/workbench/parts/files/common/files', 'vs/workbench/test/browser/servicesTestUtils', 'vs/editor/test/common/servicesTestUtils'], function (require, exports, assert, winjs_base_1, uri_1, paths, fileEditorInput_1, textFileEditorModel_1, telemetry_1, instantiationService_1, textFileServices_1, files_1, servicesTestUtils_1, servicesTestUtils_2) {
    'use strict';
    function toResource(path) {
        return uri_1.default.file(paths.join('C:\\', path));
    }
    var baseInstantiationService;
    var messageService;
    var eventService;
    var textFileService;
    suite('Files - TextFileEditorModel', function () {
        setup(function () {
            eventService = new servicesTestUtils_1.TestEventService();
            messageService = new servicesTestUtils_1.TestMessageService();
            baseInstantiationService = instantiationService_1.createInstantiationService({
                eventService: eventService,
                messageService: messageService,
                fileService: servicesTestUtils_1.TestFileService,
                contextService: new servicesTestUtils_1.TestContextService(),
                telemetryService: telemetry_1.NullTelemetryService,
                storageService: new servicesTestUtils_1.TestStorageService(),
                untitledEditorService: new servicesTestUtils_1.TestUntitledEditorService(),
                editorService: new servicesTestUtils_1.TestEditorService(),
                partService: new servicesTestUtils_1.TestPartService(),
                modeService: servicesTestUtils_2.createMockModeService(),
                modelService: servicesTestUtils_2.createMockModelService(),
                lifecycleService: new servicesTestUtils_1.TestLifecycleService(),
                configurationService: new servicesTestUtils_1.TestConfigurationService()
            });
            textFileService = baseInstantiationService.createInstance(textFileServices_1.TextFileService);
            baseInstantiationService.registerService('textFileService', textFileService);
        });
        teardown(function () {
            eventService.dispose();
            textFileEditorModel_1.CACHE.clear();
        });
        test('Resolves from cache and disposes when last input disposed', function (done) {
            var c1 = baseInstantiationService.createInstance(fileEditorInput_1.FileEditorInput, toResource('/path/index.txt'), 'text/plain', 'utf8');
            var c2 = baseInstantiationService.createInstance(fileEditorInput_1.FileEditorInput, toResource('/path/index.txt'), 'text/plain', 'utf8');
            var c3 = baseInstantiationService.createInstance(fileEditorInput_1.FileEditorInput, toResource('/path/index.txt'), 'text/plain', 'utf8');
            c1.resolve(true).then(function (model1) {
                c2.resolve(true).then(function (model2) {
                    assert.equal(model1, model2);
                    c2.dispose(false);
                    c1.resolve(true).then(function (model3) {
                        assert.equal(model1, model3);
                        c1.dispose(true);
                        c3.resolve(true).then(function (model4) {
                            assert.ok(model4 !== model1);
                            c1.dispose(true);
                            c2.dispose(true);
                            c3.dispose(true);
                            done();
                        });
                    });
                });
            });
        });
        test('Load does not trigger save', function (done) {
            var m1 = baseInstantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, toResource('/path/index.txt'), 'utf8');
            eventService.addListener('files:internalFileChanged', function () {
                assert.ok(false);
            });
            eventService.addListener(files_1.EventType.FILE_DIRTY, function () {
                assert.ok(false);
            });
            eventService.addListener(files_1.EventType.FILE_SAVED, function () {
                assert.ok(false);
            });
            m1.load().then(function () {
                assert.ok(m1.isResolved());
                m1.dispose();
                done();
            });
        });
        test('Load returns dirty model as long as model is dirty', function (done) {
            var m1 = baseInstantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, toResource('/path/index_async.txt'), 'utf8');
            m1.load().then(function () {
                m1.textEditorModel.setValue('foo');
                assert.ok(m1.isDirty());
                m1.load().then(function () {
                    assert.ok(m1.isDirty());
                    m1.dispose();
                    done();
                });
            });
        });
        test('Revert', function (done) {
            var eventCounter = 0;
            eventService.addListener('files:fileReverted', function () {
                eventCounter++;
            });
            var m1 = baseInstantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, toResource('/path/index_async.txt'), 'utf8');
            m1.load().then(function () {
                m1.textEditorModel.setValue('foo');
                assert.ok(m1.isDirty());
                m1.revert().then(function () {
                    assert.ok(!m1.isDirty());
                    assert.equal(m1.textEditorModel.getValue(), 'Hello Html');
                    assert.equal(eventCounter, 1);
                    m1.dispose();
                    done();
                });
            });
        });
        test('Conflict Resolution Mode', function (done) {
            var m1 = baseInstantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, toResource('/path/index_async.txt'), 'utf8');
            m1.load().then(function () {
                m1.setConflictResolutionMode();
                m1.textEditorModel.setValue('foo');
                assert.ok(m1.isDirty());
                assert.ok(m1.isInConflictResolutionMode());
                m1.revert().then(function () {
                    m1.textEditorModel.setValue('bar');
                    assert.ok(m1.isDirty());
                    return m1.save().then(function () {
                        assert.ok(!m1.isDirty());
                        m1.dispose();
                        done();
                    });
                });
            });
        });
        test('Auto Save triggered when model changes', function (done) {
            var eventCounter = 0;
            var m1 = baseInstantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, toResource('/path/index.txt'), 'utf8');
            m1.autoSaveAfterMillies = 10;
            m1.autoSaveAfterMilliesEnabled = true;
            eventService.addListener(files_1.EventType.FILE_DIRTY, function () {
                eventCounter++;
            });
            eventService.addListener(files_1.EventType.FILE_SAVED, function () {
                eventCounter++;
            });
            m1.load().then(function () {
                m1.textEditorModel.setValue('foo');
                return winjs_base_1.TPromise.timeout(50).then(function () {
                    assert.ok(!m1.isDirty());
                    assert.equal(eventCounter, 2);
                    m1.dispose();
                    done();
                });
            });
        });
        test('Dirty tracking', function (done) {
            var resource = toResource('/path/index_async.txt');
            var i1 = baseInstantiationService.createInstance(fileEditorInput_1.FileEditorInput, resource, 'text/plain', 'utf8');
            i1.resolve().then(function (m1) {
                var dirty = m1.getLastDirtyTime();
                assert.ok(!dirty);
                m1.textEditorModel.setValue('foo');
                assert.ok(m1.isDirty());
                assert.ok(m1.getLastDirtyTime() > dirty);
                assert.ok(textFileService.isDirty(resource));
                assert.equal(textFileService.getDirty().length, 1);
                m1.dispose();
                done();
            });
        });
        test('save() and isDirty() - proper with check for mtimes', function (done) {
            var c1 = baseInstantiationService.createInstance(fileEditorInput_1.FileEditorInput, toResource('/path/index_async2.txt'), 'text/plain', 'utf8');
            var c2 = baseInstantiationService.createInstance(fileEditorInput_1.FileEditorInput, toResource('/path/index_async.txt'), 'text/plain', 'utf8');
            c1.resolve().then(function (m1) {
                c2.resolve().then(function (m2) {
                    m1.textEditorModel.setValue('foo');
                    var m1Mtime = m1.getLastModifiedTime();
                    var m2Mtime = m2.getLastModifiedTime();
                    assert.ok(m1Mtime > 0);
                    assert.ok(m2Mtime > 0);
                    assert.ok(textFileService.isDirty());
                    assert.ok(textFileService.isDirty(toResource('/path/index_async2.txt')));
                    assert.ok(!textFileService.isDirty(toResource('/path/index_async.txt')));
                    m2.textEditorModel.setValue('foo');
                    assert.ok(textFileService.isDirty(toResource('/path/index_async.txt')));
                    return winjs_base_1.TPromise.timeout(10).then(function () {
                        textFileService.saveAll().then(function () {
                            assert.ok(!textFileService.isDirty(toResource('/path/index_async.txt')));
                            assert.ok(!textFileService.isDirty(toResource('/path/index_async2.txt')));
                            assert.ok(m1.getLastModifiedTime() > m1Mtime);
                            assert.ok(m2.getLastModifiedTime() > m2Mtime);
                            c1.dispose(true);
                            c2.dispose(true);
                            done();
                        });
                    });
                });
            });
        });
        test('Save Participant', function (done) {
            var eventCounter = 0;
            var m1 = baseInstantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, toResource('/path/index_async.txt'), 'utf8');
            eventService.addListener(files_1.EventType.FILE_SAVED, function (e) {
                assert.equal(m1.getValue(), 'bar');
                assert.ok(!m1.isDirty());
                eventCounter++;
            });
            eventService.addListener(files_1.EventType.FILE_SAVING, function (e) {
                assert.ok(m1.isDirty());
                m1.textEditorModel.setValue('bar');
                assert.ok(m1.isDirty());
                eventCounter++;
            });
            m1.load().then(function () {
                m1.textEditorModel.setValue('foo');
                m1.save().then(function () {
                    m1.dispose();
                    assert.equal(eventCounter, 2);
                    done();
                });
            });
        });
    });
});
//# sourceMappingURL=fileEditorModel.test.js.map