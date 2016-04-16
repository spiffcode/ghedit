/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'vs/workbench/test/browser/servicesTestUtils', 'vs/platform/keybinding/test/common/mockKeybindingService', 'vs/platform/platform', 'vs/workbench/browser/parts/quickopen/editorHistoryModel', 'vs/workbench/browser/quickopen', 'vs/workbench/browser/parts/quickopen/quickOpenController', 'vs/base/parts/quickopen/common/quickOpen', 'vs/workbench/browser/actions/quickOpenAction', 'vs/workbench/common/editor/stringEditorInput', 'vs/base/common/types', 'vs/base/common/paths', 'vs/workbench/browser/parts/editor/baseEditor', 'vs/base/common/uri', 'vs/platform/instantiation/common/instantiationService', 'vs/workbench/common/events', 'vs/platform/editor/common/editor'], function (require, exports, assert, servicesTestUtils_1, mockKeybindingService_1, platform_1, editorHistoryModel_1, quickopen_1, quickOpenController_1, quickOpen_1, quickOpenAction_1, stringEditorInput_1, types_1, paths_1, baseEditor_1, uri_1, instantiationService_1, events_1, editor_1) {
    'use strict';
    function toResource(path) {
        return uri_1.default.file(paths_1.join('C:\\', path));
    }
    var EditorRegistry = platform_1.Registry.as(baseEditor_1.Extensions.Editors);
    var fileInputAsyncDescriptor = EditorRegistry.getDefaultFileInput();
    var fileInputModule = require(fileInputAsyncDescriptor.moduleName);
    var fileInputCtor = fileInputModule[fileInputAsyncDescriptor.ctorName];
    suite('Workbench QuickOpen', function () {
        test('EditorHistoryEntry', function () {
            var editorService = new servicesTestUtils_1.TestEditorService();
            var contextService = new servicesTestUtils_1.TestContextService();
            var inst = instantiationService_1.createInstantiationService({});
            var model = new editorHistoryModel_1.EditorHistoryModel(editorService, null, contextService);
            var input1 = inst.createInstance(stringEditorInput_1.StringEditorInput, 'name1', 'description', 'value1', 'text/plain', false);
            var entry1 = new editorHistoryModel_1.EditorHistoryEntry(editorService, contextService, input1, null, null, model);
            assert.equal(input1.getName(), entry1.getLabel());
            assert.equal(input1.getDescription(), entry1.getDescription());
            assert.equal(null, entry1.getResource());
            assert.equal(input1, entry1.getInput());
            var match = [
                {
                    start: 1,
                    end: 5
                }
            ];
            var clone1 = entry1.clone(match);
            assert.equal(clone1.getLabel(), entry1.getLabel());
            assert(clone1.getInput() === input1);
            assert.equal(1, clone1.getHighlights()[0].length);
            var input2 = inst.createInstance(stringEditorInput_1.StringEditorInput, 'name2', 'description', 'value2', 'text/plain', false);
            input2.getResource = function () { return 'path'; };
            var entry2 = new editorHistoryModel_1.EditorHistoryEntry(editorService, contextService, input2, null, null, model);
            assert.ok(!entry2.getResource()); // inputs with getResource are not taken as resource for entry, only files and untitled
            assert(!entry1.matches(entry2.getInput()));
            assert(entry1.matches(entry1.getInput()));
            assert(entry1.run(quickOpen_1.Mode.OPEN, { event: null, quickNavigateConfiguration: null }));
            assert(!entry2.run(quickOpen_1.Mode.PREVIEW, { event: null, quickNavigateConfiguration: null }));
        });
        test('EditorHistoryEntry is removed when open fails', function () {
            var editorService = new servicesTestUtils_1.TestEditorService();
            var contextService = new servicesTestUtils_1.TestContextService();
            var inst = instantiationService_1.createInstantiationService({});
            var model = new editorHistoryModel_1.EditorHistoryModel(editorService, null, contextService);
            var input1 = inst.createInstance(stringEditorInput_1.StringEditorInput, 'name1', 'description', 'value1', 'text/plain', false);
            model.add(input1);
            assert.equal(1, model.getEntries().length);
            assert(model.getEntries()[0].run(quickOpen_1.Mode.OPEN, { event: null, quickNavigateConfiguration: null }));
            assert.equal(0, model.getEntries().length);
        });
        test('EditorHistoryModel', function () {
            platform_1.Registry.as('workbench.contributions.editors').setInstantiationService(instantiationService_1.createInstantiationService({}));
            var editorService = new servicesTestUtils_1.TestEditorService();
            var contextService = new servicesTestUtils_1.TestContextService();
            var inst = instantiationService_1.createInstantiationService({ editorService: editorService });
            var model = new editorHistoryModel_1.EditorHistoryModel(editorService, inst, contextService);
            var input1 = inst.createInstance(stringEditorInput_1.StringEditorInput, 'name1', 'description', 'value1', 'text/plain', false);
            var input2 = inst.createInstance(stringEditorInput_1.StringEditorInput, 'name2', 'description', 'value2', 'text/plain', false);
            var input3 = inst.createInstance(stringEditorInput_1.StringEditorInput, 'name3', 'description', 'value3', 'text/plain', false);
            assert.equal(0, model.getEntries().length);
            model.add(input1);
            model.add(input2);
            assert.equal(2, model.getEntries().length);
            model.add(input1);
            assert.equal(2, model.getEntries().length);
            model.add(input3);
            assert(model.getEntries()[0].matches(input3));
            model.remove(input3);
            assert.equal(2, model.getEntries().length);
            var memento = {};
            model.saveTo(memento);
            assert(types_1.isEmptyObject(memento));
            var saveInput1 = inst.createInstance(fileInputCtor, toResource('path1'), 'text/plain', void 0);
            var saveInput2 = inst.createInstance(fileInputCtor, toResource('path2'), 'text/plain', void 0);
            model.add(saveInput1);
            model.add(saveInput2);
            model.saveTo(memento);
            assert(!types_1.isEmptyObject(memento));
            model = new editorHistoryModel_1.EditorHistoryModel(editorService, inst, contextService);
            model.loadFrom(memento);
            assert.equal(2, model.getEntries().length);
            assert(model.getEntries()[0].matches(saveInput2));
            assert(model.getEntries()[1].matches(saveInput1));
            model = new editorHistoryModel_1.EditorHistoryModel(editorService, inst, contextService);
            var cinput1 = inst.createInstance(fileInputCtor, toResource('Hello World'), 'text/plain', void 0);
            var cinput2 = inst.createInstance(fileInputCtor, toResource('Yes World'), 'text/plain', void 0);
            var cinput3 = inst.createInstance(fileInputCtor, toResource('No Hello'), 'text/plain', void 0);
            model.add(cinput1);
            model.add(cinput2);
            model.add(cinput3);
            assert.equal(3, model.getResults('*').length);
            assert.equal(1, model.getResults('HW').length);
            assert.equal(2, model.getResults('World').length);
            assert.equal(1, model.getResults('*')[0].getHighlights()[0].length);
            model = new editorHistoryModel_1.EditorHistoryModel(editorService, inst, contextService);
            var cinput4 = inst.createInstance(fileInputCtor, toResource('foo.ts'), 'text/plain', void 0);
            var cinput5 = inst.createInstance(fileInputCtor, toResource('bar.js'), 'text/plain', void 0);
            var cinput6 = inst.createInstance(fileInputCtor, toResource('foo.js'), 'text/plain', void 0);
            model.add(cinput4);
            model.add(cinput5);
            model.add(cinput6);
            var sortedResults = model.getResults('*');
            assert.equal(3, model.getResults('*').length);
            assert.equal('c:/bar.js', sortedResults[0].getResource().fsPath.replace(/\\/g, '/'));
            assert.equal('c:/foo.js', sortedResults[1].getResource().fsPath.replace(/\\/g, '/'));
            assert.equal('c:/foo.ts', sortedResults[2].getResource().fsPath.replace(/\\/g, '/'));
        });
        test('QuickOpen Handler and Registry', function () {
            var registry = platform_1.Registry.as(quickopen_1.Extensions.Quickopen);
            var handler = new quickopen_1.QuickOpenHandlerDescriptor('test', 'TestHandler', ',', 'Handler');
            registry.registerQuickOpenHandler(handler);
            assert(registry.getQuickOpenHandler(',') === handler);
            var handlers = registry.getQuickOpenHandlers();
            assert(handlers.some(function (handler) { return handler.prefix === ','; }));
        });
        test('QuickOpen Action', function () {
            var defaultAction = new quickOpenAction_1.QuickOpenAction('id', 'label', void 0, new servicesTestUtils_1.TestQuickOpenService(function (prefix) { return assert(!prefix); }));
            var prefixAction = new quickOpenAction_1.QuickOpenAction('id', 'label', ',', new servicesTestUtils_1.TestQuickOpenService(function (prefix) { return assert(!!prefix); }));
            defaultAction.run();
            prefixAction.run();
        });
        test('QuickOpenController adds to history on editor input change and removes on dispose', function () {
            var editorService = new servicesTestUtils_1.TestEditorService();
            var eventService = new servicesTestUtils_1.TestEventService();
            var storageService = new servicesTestUtils_1.TestStorageService();
            var contextService = new servicesTestUtils_1.TestContextService();
            var inst = instantiationService_1.createInstantiationService({ editorService: editorService });
            var controller = new quickOpenController_1.QuickOpenController(eventService, storageService, editorService, null, null, null, contextService, new mockKeybindingService_1.MockKeybindingService());
            controller.create();
            assert.equal(0, controller.getEditorHistoryModel().getEntries().length);
            var cinput1 = inst.createInstance(fileInputCtor, toResource('Hello World'), 'text/plain', void 0);
            var event = new events_1.EditorEvent(null, '', cinput1, null, editor_1.Position.LEFT);
            eventService.emit(events_1.EventType.EDITOR_INPUT_CHANGING, event);
            assert.equal(1, controller.getEditorHistoryModel().getEntries().length);
            cinput1.dispose();
            assert.equal(0, controller.getEditorHistoryModel().getEntries().length);
        });
    });
});
//# sourceMappingURL=quickopen.test.js.map