/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'assert', 'vs/workbench/common/editor', 'vs/workbench/common/editor/textEditorModel', 'vs/workbench/common/editor/textDiffEditorModel', 'vs/workbench/common/editor/diffEditorInput', 'vs/workbench/common/editor/stringEditorInput', 'vs/editor/common/services/modelService', 'vs/editor/common/services/modeService', 'vs/platform/instantiation/common/serviceCollection', 'vs/platform/instantiation/common/instantiationService', 'vs/editor/test/common/servicesTestUtils'], function (require, exports, assert, editor_1, textEditorModel_1, textDiffEditorModel_1, diffEditorInput_1, stringEditorInput_1, modelService_1, modeService_1, serviceCollection_1, instantiationService_1, servicesTestUtils_1) {
    'use strict';
    var MyEditorModel = (function (_super) {
        __extends(MyEditorModel, _super);
        function MyEditorModel() {
            _super.apply(this, arguments);
        }
        return MyEditorModel;
    }(editor_1.EditorModel));
    var MyTextEditorModel = (function (_super) {
        __extends(MyTextEditorModel, _super);
        function MyTextEditorModel() {
            _super.apply(this, arguments);
        }
        return MyTextEditorModel;
    }(textEditorModel_1.BaseTextEditorModel));
    suite('Workbench - EditorModel', function () {
        test('EditorModel', function (done) {
            var m = new MyEditorModel();
            m.load().then(function (model) {
                assert(model === m);
                assert.strictEqual(m.isResolved(), true);
            }).done(function () { return done(); });
        });
        test('BaseTextEditorModel', function (done) {
            var modelService = servicesTestUtils_1.createMockModelService();
            var modeService = servicesTestUtils_1.createMockModeService();
            var m = new MyTextEditorModel(modelService, modeService);
            m.load().then(function (model) {
                assert(model === m);
                return model.createTextEditorModel('foo', null, 'text/plain').then(function () {
                    assert.strictEqual(m.isResolved(), true);
                });
            }).done(function () {
                m.dispose();
                done();
            });
        });
        test('TextDiffEditorModel', function (done) {
            var services = new serviceCollection_1.ServiceCollection();
            services.set(modeService_1.IModeService, servicesTestUtils_1.createMockModeService());
            services.set(modelService_1.IModelService, servicesTestUtils_1.createMockModelService());
            var inst = new instantiationService_1.InstantiationService(services);
            var input = inst.createInstance(stringEditorInput_1.StringEditorInput, 'name', 'description', 'value', 'text/plain', false);
            var otherInput = inst.createInstance(stringEditorInput_1.StringEditorInput, 'name2', 'description', 'value2', 'text/plain', false);
            var diffInput = new diffEditorInput_1.DiffEditorInput('name', 'description', input, otherInput);
            diffInput.resolve(true).then(function (model) {
                assert(model);
                assert(model instanceof textDiffEditorModel_1.TextDiffEditorModel);
                var diffEditorModel = model.textDiffEditorModel;
                assert(diffEditorModel.original);
                assert(diffEditorModel.modified);
                return diffInput.resolve(true).then(function (model) {
                    assert(model.isResolved());
                    assert(diffEditorModel !== model.textDiffEditorModel);
                    diffInput.dispose();
                    assert(!model.textDiffEditorModel);
                });
            }).done(function () {
                done();
            });
        });
    });
});
//# sourceMappingURL=editorModel.test.js.map