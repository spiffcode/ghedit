/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'vs/workbench/common/editor/stringEditorModel', 'vs/editor/common/services/modelService', 'vs/editor/common/services/modeService', 'vs/platform/instantiation/common/serviceCollection', 'vs/platform/instantiation/common/instantiationService', 'vs/editor/test/common/servicesTestUtils'], function (require, exports, assert, stringEditorModel_1, modelService_1, modeService_1, serviceCollection_1, instantiationService_1, servicesTestUtils_1) {
    'use strict';
    suite('Workbench - StringEditorModel', function () {
        test('StringEditorModel', function (done) {
            var services = new serviceCollection_1.ServiceCollection();
            services.set(modeService_1.IModeService, servicesTestUtils_1.createMockModeService());
            services.set(modelService_1.IModelService, servicesTestUtils_1.createMockModelService());
            var inst = new instantiationService_1.InstantiationService(services);
            var m = inst.createInstance(stringEditorModel_1.StringEditorModel, 'value', 'mime', null);
            m.load().then(function (model) {
                assert(model === m);
                var textEditorModel = m.textEditorModel;
                assert.strictEqual(textEditorModel.getValue(), 'value');
                assert.strictEqual(m.isResolved(), true);
                m.value = 'something';
                return m.load().then(function (model) {
                    assert(textEditorModel === m.textEditorModel);
                    assert.strictEqual(m.getValue(), 'something');
                });
            }).done(function () {
                m.dispose();
                done();
            });
        });
        test('StringEditorModel - setValue, clearValue, append, trim', function (done) {
            var services = new serviceCollection_1.ServiceCollection();
            services.set(modeService_1.IModeService, servicesTestUtils_1.createMockModeService());
            services.set(modelService_1.IModelService, servicesTestUtils_1.createMockModelService());
            var inst = new instantiationService_1.InstantiationService(services);
            var m = inst.createInstance(stringEditorModel_1.StringEditorModel, 'value', 'mime', null);
            m.load().then(function (model) {
                assert(model === m);
                var textEditorModel = m.textEditorModel;
                assert.strictEqual(textEditorModel.getValue(), 'value');
                m.setValue('foobar');
                assert.strictEqual(m.getValue(), 'foobar');
                assert.strictEqual(textEditorModel.getValue(), 'foobar');
                m.clearValue();
                assert(!m.getValue());
                assert(!textEditorModel.getValue());
                m.append('1');
                assert.strictEqual(m.getValue(), '1');
                assert.strictEqual(textEditorModel.getValue(), '1');
                m.append('1');
                assert.strictEqual(m.getValue(), '11');
                assert.strictEqual(textEditorModel.getValue(), '11');
                m.setValue('line\nline\nline');
                m.trim(2);
                assert.strictEqual(m.getValue(), 'line\nline');
                assert.strictEqual(textEditorModel.getValue(), 'line\nline');
            }).done(function () {
                m.dispose();
                done();
            });
        });
    });
});
//# sourceMappingURL=stringEditorModel.test.js.map