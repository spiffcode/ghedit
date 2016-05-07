/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'assert', 'vs/base/common/winjs.base', 'vs/base/common/paths', 'vs/base/common/uri', 'vs/platform/instantiation/common/instantiationService', 'vs/workbench/browser/parts/editor/baseEditor', 'vs/workbench/common/editor', 'vs/workbench/common/editor/stringEditorInput', 'vs/workbench/common/editor/stringEditorModel', 'vs/workbench/parts/files/browser/editors/fileEditorInput', 'vs/workbench/parts/files/common/editors/textFileEditorModel', 'vs/workbench/parts/files/browser/textFileServices', 'vs/workbench/test/browser/servicesTestUtils', 'vs/workbench/common/events', 'vs/platform/telemetry/common/telemetry', 'vs/workbench/services/untitled/common/untitledEditorService', 'vs/workbench/services/progress/browser/progressService', 'vs/workbench/services/editor/browser/editorService', 'vs/workbench/services/viewlet/common/viewletService', 'vs/platform/editor/common/editor', 'vs/editor/test/common/servicesTestUtils'], function (require, exports, assert, winjs_base_1, paths, uri_1, instantiationService_1, baseEditor_1, editor_1, stringEditorInput_1, stringEditorModel_1, fileEditorInput_1, textFileEditorModel_1, textFileServices_1, servicesTestUtils_1, events_1, telemetry_1, untitledEditorService_1, progressService_1, editorService_1, viewletService_1, editor_2, servicesTestUtils_2) {
    'use strict';
    var activeViewlet = {};
    var activeEditor = {
        getSelection: function () {
            return 'test.selection';
        }
    };
    var openedEditorInput;
    var openedEditorOptions;
    var openedEditorPosition;
    function toResource(path) {
        return uri_1.default.file(paths.join('C:\\', path));
    }
    var TestEditorPart = (function () {
        function TestEditorPart() {
        }
        TestEditorPart.prototype.getId = function () {
            return null;
        };
        TestEditorPart.prototype.setEditors = function (inputs) {
            return winjs_base_1.TPromise.as([]);
        };
        TestEditorPart.prototype.closeEditors = function (othersOnly) {
            return winjs_base_1.TPromise.as(null);
        };
        TestEditorPart.prototype.openEditor = function (input, options, arg) {
            openedEditorInput = input;
            openedEditorOptions = options;
            openedEditorPosition = arg;
            return winjs_base_1.TPromise.as(activeEditor);
        };
        TestEditorPart.prototype.activateEditor = function (editor) {
            // Unsupported
        };
        TestEditorPart.prototype.getActiveEditor = function () {
            return activeEditor;
        };
        TestEditorPart.prototype.setActiveEditorInput = function (input) {
            this.activeInput = input;
        };
        TestEditorPart.prototype.getActiveEditorInput = function () {
            return this.activeInput;
        };
        TestEditorPart.prototype.getVisibleEditors = function () {
            return [activeEditor];
        };
        TestEditorPart.prototype.moveEditor = function (from, to) {
            // Unsupported
        };
        TestEditorPart.prototype.arrangeEditors = function (arrangement) {
            // Unsuported
        };
        return TestEditorPart;
    }());
    var TestViewletService = (function () {
        function TestViewletService() {
            this.serviceId = viewletService_1.IViewletService;
        }
        TestViewletService.prototype.openViewlet = function (id, focus) {
            return winjs_base_1.TPromise.as(null);
        };
        TestViewletService.prototype.getActiveViewlet = function () {
            return activeViewlet;
        };
        TestViewletService.prototype.dispose = function () {
        };
        return TestViewletService;
    }());
    var TestScopedService = (function (_super) {
        __extends(TestScopedService, _super);
        function TestScopedService(eventService) {
            _super.call(this, eventService, 'test.scopeId');
        }
        TestScopedService.prototype.onScopeActivated = function () {
            this.isActive = true;
        };
        TestScopedService.prototype.onScopeDeactivated = function () {
            this.isActive = false;
        };
        return TestScopedService;
    }(progressService_1.ScopedService));
    var TestProgressBar = (function () {
        function TestProgressBar() {
        }
        TestProgressBar.prototype.infinite = function () {
            this.fDone = null;
            this.fInfinite = true;
            return this;
        };
        TestProgressBar.prototype.total = function (total) {
            this.fDone = null;
            this.fTotal = total;
            return this;
        };
        TestProgressBar.prototype.hasTotal = function () {
            return !!this.fTotal;
        };
        TestProgressBar.prototype.worked = function (worked) {
            this.fDone = null;
            if (this.fWorked) {
                this.fWorked += worked;
            }
            else {
                this.fWorked = worked;
            }
            return this;
        };
        TestProgressBar.prototype.done = function () {
            this.fDone = true;
            this.fInfinite = null;
            this.fWorked = null;
            this.fTotal = null;
            return this;
        };
        TestProgressBar.prototype.stop = function () {
            return this.done();
        };
        TestProgressBar.prototype.getContainer = function () {
            return {
                show: function () { },
                hide: function () { }
            };
        };
        return TestProgressBar;
    }());
    suite('Workbench UI Services', function () {
        test('WorkbenchEditorService', function () {
            var TestFileService = {
                resolveContent: function (resource) {
                    return winjs_base_1.TPromise.as({
                        resource: resource,
                        value: 'Hello Html',
                        etag: 'index.txt',
                        mime: 'text/plain',
                        encoding: 'utf8',
                        mtime: new Date().getTime(),
                        name: paths.basename(resource.fsPath)
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
                            name: paths.basename(res.fsPath)
                        };
                    });
                }
            };
            var editorService = new servicesTestUtils_1.TestEditorService(function () { });
            var eventService = new servicesTestUtils_1.TestEventService();
            var contextService = new servicesTestUtils_1.TestContextService(servicesTestUtils_1.TestWorkspace);
            var requestService = new servicesTestUtils_1.MockRequestService(servicesTestUtils_1.TestWorkspace, function (url) {
                if (/index\.html$/.test(url)) {
                    return {
                        responseText: 'Hello Html',
                        getResponseHeader: function (key) { return ({
                            'content-length': '1000',
                            'last-modified': new Date().toUTCString(),
                            'content-type': 'text/html'
                        })[key.toLowerCase()]; }
                    };
                }
                return null;
            });
            var telemetryService = telemetry_1.NullTelemetryService;
            var services = {
                eventService: eventService,
                contextService: contextService,
                requestService: requestService,
                telemetryService: telemetryService,
                configurationService: new servicesTestUtils_1.TestConfigurationService(),
                untitledEditorService: new untitledEditorService_1.UntitledEditorService(),
                storageService: new servicesTestUtils_1.TestStorageService(),
                editorService: editorService,
                partService: new servicesTestUtils_1.TestPartService(),
                modeService: servicesTestUtils_2.createMockModeService(),
                modelService: servicesTestUtils_2.createMockModelService(),
                lifecycleService: new servicesTestUtils_1.TestLifecycleService(),
                fileService: TestFileService
            };
            var inst = instantiationService_1.createInstantiationService(services);
            var textFileService = inst.createInstance(textFileServices_1.TextFileService);
            inst.registerService('textFileService', textFileService);
            services['instantiationService'] = inst;
            var activeInput = inst.createInstance(fileEditorInput_1.FileEditorInput, toResource('/something.js'), 'text/javascript', void 0);
            var testEditorPart = new TestEditorPart();
            testEditorPart.setActiveEditorInput(activeInput);
            var service = inst.createInstance(editorService_1.WorkbenchEditorService, testEditorPart);
            service.setInstantiationService(inst);
            assert.strictEqual(service.getActiveEditor(), activeEditor);
            assert.strictEqual(service.getActiveEditorInput(), activeInput);
            // Open EditorInput
            service.openEditor(activeInput, null).then(function (editor) {
                assert.strictEqual(openedEditorInput, activeInput);
                assert.strictEqual(openedEditorOptions, null);
                assert.strictEqual(editor, activeEditor);
                assert.strictEqual(service.getVisibleEditors().length, 1);
                assert(service.getVisibleEditors()[0] === editor);
            });
            service.openEditor(activeInput, null, editor_2.Position.LEFT).then(function (editor) {
                assert.strictEqual(openedEditorInput, activeInput);
                assert.strictEqual(openedEditorOptions, null);
                assert.strictEqual(editor, activeEditor);
                assert.strictEqual(service.getVisibleEditors().length, 1);
                assert(service.getVisibleEditors()[0] === editor);
            });
            // Open Untyped Input
            service.openEditor({ resource: toResource('/index.html'), mime: 'text/html', options: { selection: { startLineNumber: 1, startColumn: 1 } } }).then(function (editor) {
                assert.strictEqual(editor, activeEditor);
                assert(openedEditorInput instanceof fileEditorInput_1.FileEditorInput);
                var contentInput = openedEditorInput;
                assert.strictEqual(contentInput.getResource().fsPath, toResource('/index.html').fsPath);
                assert.strictEqual(contentInput.getMime(), 'text/html');
                assert(openedEditorOptions instanceof editor_1.TextEditorOptions);
                var textEditorOptions = openedEditorOptions;
                assert(textEditorOptions.hasOptionsDefined());
            });
            // Resolve Editor Model (Typed EditorInput)
            var input = inst.createInstance(stringEditorInput_1.StringEditorInput, 'name', 'description', 'hello world', 'text/plain', false);
            service.resolveEditorModel(input, true).then(function (model) {
                assert(model instanceof stringEditorModel_1.StringEditorModel);
                assert(model.isResolved());
                service.resolveEditorModel(input, false).then(function (otherModel) {
                    assert(model === otherModel);
                    input.dispose();
                });
            });
            // Resolve Editor Model (Untyped Input)
            service.resolveEditorModel({ resource: toResource('/index.html'), mime: 'text/html' }, true).then(function (model) {
                assert(model instanceof textFileEditorModel_1.TextFileEditorModel);
            });
            // Focus editor
            service.focusEditor().then(function (editor) {
                assert.strictEqual(editor, activeEditor);
            });
            // Close editor
            service.closeEditor().then(function (editor) {
                assert.strictEqual(editor, activeEditor);
            });
            service.openEditor(null, null).then(function (editor) {
                assert.strictEqual(editor, activeEditor);
            });
        });
        test('DelegatingWorkbenchEditorService', function () {
            var editorService = new servicesTestUtils_1.TestEditorService(function () { });
            var contextService = new servicesTestUtils_1.TestContextService(servicesTestUtils_1.TestWorkspace);
            var eventService = new servicesTestUtils_1.TestEventService();
            var requestService = new servicesTestUtils_1.TestRequestService();
            var telemetryService = telemetry_1.NullTelemetryService;
            var services = {
                eventService: eventService,
                contextService: contextService,
                requestService: requestService,
                telemetryService: telemetryService,
                storageService: new servicesTestUtils_1.TestStorageService(),
                untitledEditorService: new untitledEditorService_1.UntitledEditorService(),
                editorService: editorService,
                partService: new servicesTestUtils_1.TestPartService(),
                lifecycleService: new servicesTestUtils_1.TestLifecycleService(),
                modelService: servicesTestUtils_2.createMockModelService(),
                configurationService: new servicesTestUtils_1.TestConfigurationService()
            };
            var inst = instantiationService_1.createInstantiationService(services);
            var textFileService = inst.createInstance(textFileServices_1.TextFileService);
            inst.registerService('textFileService', textFileService);
            services['instantiationService'] = inst;
            var activeInput = inst.createInstance(fileEditorInput_1.FileEditorInput, toResource('/something.js'), 'text/javascript', void 0);
            var testEditorPart = new TestEditorPart();
            testEditorPart.setActiveEditorInput(activeInput);
            inst.createInstance(editorService_1.WorkbenchEditorService, testEditorPart);
            var MyEditor = (function (_super) {
                __extends(MyEditor, _super);
                function MyEditor(id) {
                    _super.call(this, id, null);
                }
                MyEditor.prototype.getId = function () {
                    return 'myEditor';
                };
                MyEditor.prototype.layout = function () {
                };
                MyEditor.prototype.createEditor = function () {
                };
                return MyEditor;
            }(baseEditor_1.BaseEditor));
            var ed = inst.createInstance(MyEditor, 'my.editor');
            var inp = inst.createInstance(stringEditorInput_1.StringEditorInput, 'name', 'description', 'hello world', 'text/plain', false);
            var delegate = inst.createInstance(editorService_1.DelegatingWorkbenchEditorService, ed, function (editor, input, options) {
                assert.strictEqual(input, inp);
                assert.strictEqual(editor, ed);
                return winjs_base_1.TPromise.as(true);
            });
            delegate.openEditor(inp);
        });
        test('ScopedService', function () {
            var eventService = new servicesTestUtils_1.TestEventService();
            var service = new TestScopedService(eventService);
            assert(!service.isActive);
            eventService.emit(events_1.EventType.EDITOR_OPENED, { editorId: 'other.test.scopeId' });
            assert(!service.isActive);
            eventService.emit(events_1.EventType.EDITOR_OPENED, { editorId: 'test.scopeId' });
            assert(service.isActive);
            eventService.emit(events_1.EventType.EDITOR_CLOSED, { editorId: 'test.scopeId' });
            assert(!service.isActive);
            eventService.emit(events_1.EventType.COMPOSITE_OPENED, { compositeId: 'test.scopeId' });
            assert(service.isActive);
            eventService.emit(events_1.EventType.COMPOSITE_CLOSED, { compositeId: 'test.scopeId' });
            assert(!service.isActive);
        });
        test('WorkbenchProgressService', function () {
            var testProgressBar = new TestProgressBar();
            var eventService = new servicesTestUtils_1.TestEventService();
            var service = new progressService_1.WorkbenchProgressService(eventService, testProgressBar, 'test.scopeId', true);
            // Active: Show (Infinite)
            var fn = service.show(true);
            assert.strictEqual(true, testProgressBar.fInfinite);
            fn.done();
            assert.strictEqual(true, testProgressBar.fDone);
            // Active: Show (Total / Worked)
            fn = service.show(100);
            assert.strictEqual(false, !!testProgressBar.fInfinite);
            assert.strictEqual(100, testProgressBar.fTotal);
            fn.worked(20);
            assert.strictEqual(20, testProgressBar.fWorked);
            fn.total(80);
            assert.strictEqual(80, testProgressBar.fTotal);
            fn.done();
            assert.strictEqual(true, testProgressBar.fDone);
            // Inactive: Show (Infinite)
            eventService.emit(events_1.EventType.EDITOR_CLOSED, { editorId: 'test.scopeId' });
            service.show(true);
            assert.strictEqual(false, !!testProgressBar.fInfinite);
            eventService.emit(events_1.EventType.EDITOR_OPENED, { editorId: 'test.scopeId' });
            assert.strictEqual(true, testProgressBar.fInfinite);
            // Inactive: Show (Total / Worked)
            eventService.emit(events_1.EventType.EDITOR_CLOSED, { editorId: 'test.scopeId' });
            fn = service.show(100);
            fn.total(80);
            fn.worked(20);
            assert.strictEqual(false, !!testProgressBar.fTotal);
            eventService.emit(events_1.EventType.EDITOR_OPENED, { editorId: 'test.scopeId' });
            assert.strictEqual(20, testProgressBar.fWorked);
            assert.strictEqual(80, testProgressBar.fTotal);
            // Acive: Show While
            var p = winjs_base_1.TPromise.as(null);
            service.showWhile(p).then(function () {
                assert.strictEqual(true, testProgressBar.fDone);
                eventService.emit(events_1.EventType.EDITOR_CLOSED, { editorId: 'test.scopeId' });
                p = winjs_base_1.TPromise.as(null);
                service.showWhile(p).then(function () {
                    assert.strictEqual(true, testProgressBar.fDone);
                    eventService.emit(events_1.EventType.EDITOR_OPENED, { editorId: 'test.scopeId' });
                    assert.strictEqual(true, testProgressBar.fDone);
                });
            });
        });
    });
});
//# sourceMappingURL=services.test.js.map