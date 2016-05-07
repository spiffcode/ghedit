/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'vs/base/common/uri', 'vs/workbench/common/editor/stringEditorInput', 'vs/workbench/common/editor/resourceEditorInput', 'vs/workbench/test/browser/servicesTestUtils', 'vs/platform/instantiation/common/instantiationService', 'vs/editor/test/common/servicesTestUtils'], function (require, exports, assert, uri_1, stringEditorInput_1, resourceEditorInput_1, servicesTestUtils_1, InstantiationService, servicesTestUtils_2) {
    'use strict';
    suite('Workbench - StringEditorInput', function () {
        test('StringEditorInput', function (done) {
            var editorService = new servicesTestUtils_1.TestEditorService(function () { });
            var inst = InstantiationService.createInstantiationService({
                modeService: servicesTestUtils_2.createMockModeService(),
                modelService: servicesTestUtils_2.createMockModelService()
            });
            var input = inst.createInstance(stringEditorInput_1.StringEditorInput, 'name', 'description', 'value', 'mime', false);
            var otherInput = inst.createInstance(stringEditorInput_1.StringEditorInput, 'name', 'description', 'othervalue', 'mime', false);
            var otherInputSame = inst.createInstance(stringEditorInput_1.StringEditorInput, 'name', 'description', 'value', 'mime', false);
            var inputSingleton = inst.createInstance(stringEditorInput_1.StringEditorInput, 'name', 'description', 'value', 'mime', true);
            var otherInputSingleton = inst.createInstance(stringEditorInput_1.StringEditorInput, 'name', 'description', 'othervalue', 'mime', true);
            assert(inputSingleton.matches(otherInputSingleton));
            otherInputSingleton.singleton = false;
            assert(!inputSingleton.matches(otherInputSingleton));
            assert(input.matches(input));
            assert(input.matches(otherInputSame));
            assert(!input.matches(otherInput));
            assert(!input.matches(null));
            assert(input.getName());
            input = inst.createInstance(stringEditorInput_1.StringEditorInput, 'name', 'description', 'value', 'mime', false);
            input = inst.createInstance(stringEditorInput_1.StringEditorInput, 'name', 'description', 'value', 'mime', false);
            editorService.resolveEditorModel(input, true).then(function (resolved) {
                var resolvedModelA = resolved;
                return editorService.resolveEditorModel(input, true).then(function (resolved) {
                    assert(resolvedModelA === resolved); // assert: Resolved Model cached per instance
                    var otherInput = inst.createInstance(stringEditorInput_1.StringEditorInput, 'name', 'description', 'value', 'mime', false);
                    return editorService.resolveEditorModel(otherInput, true).then(function (resolved) {
                        assert(resolvedModelA !== resolved); // NOT assert: Different instance, different model
                        input.dispose();
                        return editorService.resolveEditorModel(input, true).then(function (resolved) {
                            assert(resolvedModelA !== resolved); // Different instance, because input got disposed
                            var model = resolved.textEditorModel;
                            return editorService.resolveEditorModel(input, true).then(function (againResolved) {
                                assert(model === againResolved.textEditorModel); // Models should not differ because string input is constant
                                input.dispose();
                            });
                        });
                    });
                });
            }).done(function () { return done(); });
        });
        test('StringEditorInput - setValue, clearValue, append', function () {
            var inst = InstantiationService.createInstantiationService({
                modeService: servicesTestUtils_2.createMockModeService(),
                modelService: servicesTestUtils_2.createMockModelService()
            });
            var input = inst.createInstance(stringEditorInput_1.StringEditorInput, 'name', 'description', 'value', 'mime', false);
            assert.strictEqual(input.getValue(), 'value');
            input.setValue('foo');
            assert.strictEqual(input.getValue(), 'foo');
            input.clearValue();
            assert(!input.getValue());
            input.append('1');
            assert.strictEqual(input.getValue(), '1');
            input.append('2');
            assert.strictEqual(input.getValue(), '12');
        });
        test('Input.matches() - StringEditorInput', function () {
            var inst = InstantiationService.createInstantiationService({});
            var stringEditorInput = inst.createInstance(stringEditorInput_1.StringEditorInput, 'name', 'description', 'value', 'mime', false);
            var promiseEditorInput = inst.createInstance(resourceEditorInput_1.ResourceEditorInput, 'name', 'description', uri_1.default.create('inMemory', null, 'thePath'));
            var stringEditorInput2 = inst.createInstance(stringEditorInput_1.StringEditorInput, 'name', 'description', 'value', 'mime', false);
            var promiseEditorInput2 = inst.createInstance(resourceEditorInput_1.ResourceEditorInput, 'name', 'description', uri_1.default.create('inMemory', null, 'thePath'));
            assert.strictEqual(stringEditorInput.matches(null), false);
            assert.strictEqual(promiseEditorInput.matches(null), false);
            assert.strictEqual(promiseEditorInput.matches(promiseEditorInput), true);
            assert.strictEqual(stringEditorInput.matches(stringEditorInput), true);
            assert.strictEqual(promiseEditorInput.matches(promiseEditorInput2), true);
            assert.strictEqual(stringEditorInput.matches(stringEditorInput2), true);
        });
        test('ResourceEditorInput', function (done) {
            var modelService = servicesTestUtils_2.createMockModelService();
            var modeService = servicesTestUtils_2.createMockModeService();
            var inst = InstantiationService.createInstantiationService({
                modeService: modeService,
                modelService: modelService
            });
            var resource = uri_1.default.create('inMemory', null, 'thePath');
            modelService.createModel('function test() {}', modeService.getOrCreateMode('text'), resource);
            var input = inst.createInstance(resourceEditorInput_1.ResourceEditorInput, 'The Name', 'The Description', resource);
            input.resolve().then(function (model) {
                assert.ok(model);
                assert.equal(model.getValue(), 'function test() {}');
                done();
            });
        });
    });
});
//# sourceMappingURL=stringEditorInput.test.js.map