/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'assert', 'vs/workbench/browser/parts/editor/baseEditor', 'vs/workbench/common/editor', 'vs/platform/instantiation/common/instantiationService', 'vs/platform/platform', 'vs/platform/instantiation/common/descriptors', 'vs/workbench/common/editor/stringEditorInput', 'vs/platform/telemetry/common/telemetry', 'vs/base/common/mime'], function (require, exports, assert, baseEditor_1, editor_1, InstantiationService, Platform, descriptors_1, stringEditorInput_1, telemetry_1, mime) {
    'use strict';
    var EditorRegistry = Platform.Registry.as(baseEditor_1.Extensions.Editors);
    var MyEditor = (function (_super) {
        __extends(MyEditor, _super);
        function MyEditor(id, telemetryService) {
            _super.call(this, id, telemetryService);
        }
        MyEditor.prototype.getId = function () {
            return 'myEditor';
        };
        MyEditor.prototype.layout = function () {
        };
        MyEditor.prototype.createEditor = function () {
        };
        MyEditor = __decorate([
            __param(1, telemetry_1.ITelemetryService)
        ], MyEditor);
        return MyEditor;
    }(baseEditor_1.BaseEditor));
    exports.MyEditor = MyEditor;
    var MyOtherEditor = (function (_super) {
        __extends(MyOtherEditor, _super);
        function MyOtherEditor(id, telemetryService) {
            _super.call(this, id, telemetryService);
        }
        MyOtherEditor.prototype.getId = function () {
            return 'myOtherEditor';
        };
        MyOtherEditor.prototype.layout = function () {
        };
        MyOtherEditor.prototype.createEditor = function () {
        };
        MyOtherEditor = __decorate([
            __param(1, telemetry_1.ITelemetryService)
        ], MyOtherEditor);
        return MyOtherEditor;
    }(baseEditor_1.BaseEditor));
    exports.MyOtherEditor = MyOtherEditor;
    var MyInputFactory = (function () {
        function MyInputFactory() {
        }
        MyInputFactory.prototype.serialize = function (input) {
            return input.toString();
        };
        MyInputFactory.prototype.deserialize = function (instantiationService, raw) {
            return {};
        };
        return MyInputFactory;
    }());
    var MyInput = (function (_super) {
        __extends(MyInput, _super);
        function MyInput() {
            _super.apply(this, arguments);
        }
        MyInput.prototype.getPreferredEditorId = function (ids) {
            return ids[1];
        };
        MyInput.prototype.getId = function () {
            return '';
        };
        MyInput.prototype.resolve = function (refresh) {
            return null;
        };
        return MyInput;
    }(editor_1.EditorInput));
    var MyOtherInput = (function (_super) {
        __extends(MyOtherInput, _super);
        function MyOtherInput() {
            _super.apply(this, arguments);
        }
        MyOtherInput.prototype.getId = function () {
            return '';
        };
        MyOtherInput.prototype.resolve = function (refresh) {
            return null;
        };
        return MyOtherInput;
    }(editor_1.EditorInput));
    var MyStringInput = (function (_super) {
        __extends(MyStringInput, _super);
        function MyStringInput() {
            _super.apply(this, arguments);
        }
        return MyStringInput;
    }(stringEditorInput_1.StringEditorInput));
    var MyAction = (function (_super) {
        __extends(MyAction, _super);
        function MyAction() {
            _super.apply(this, arguments);
            this.didCallIsEnabled = false;
        }
        MyAction.prototype.isEnabled = function () {
            this.didCallIsEnabled = true;
            return true;
        };
        return MyAction;
    }(baseEditor_1.EditorInputAction));
    var MyAction2 = (function (_super) {
        __extends(MyAction2, _super);
        function MyAction2() {
            _super.apply(this, arguments);
        }
        MyAction2.prototype.isEnabled = function () {
            return true;
        };
        return MyAction2;
    }(baseEditor_1.EditorInputAction));
    var MyEditorInputActionContributor = (function (_super) {
        __extends(MyEditorInputActionContributor, _super);
        function MyEditorInputActionContributor() {
            _super.apply(this, arguments);
        }
        MyEditorInputActionContributor.prototype.hasActionsForEditorInput = function (context) {
            return context.input instanceof stringEditorInput_1.StringEditorInput;
        };
        MyEditorInputActionContributor.prototype.getActionsForEditorInput = function (context) {
            return [
                new MyAction2('id1', 'label1'),
                new MyAction2('id2', 'label2')
            ];
        };
        return MyEditorInputActionContributor;
    }(baseEditor_1.EditorInputActionContributor));
    var MyClass = (function () {
        function MyClass() {
        }
        return MyClass;
    }());
    var MyOtherClass = (function () {
        function MyOtherClass() {
        }
        return MyOtherClass;
    }());
    suite('Workbench BaseEditor', function () {
        test('BaseEditor API', function (done) {
            var e = new MyEditor('id', telemetry_1.NullTelemetryService);
            var input = new MyOtherInput();
            var options = new editor_1.EditorOptions();
            assert(!e.isVisible());
            assert(!e.getInput());
            assert(!e.getOptions());
            e.setInput(input, options).then(function () {
                assert.strictEqual(input, e.getInput());
                assert.strictEqual(options, e.getOptions());
                return e.setVisible(true).then(function () {
                    assert(e.isVisible());
                    input.addListener('dispose', function () {
                        assert(false);
                    });
                    e.dispose();
                    e.clearInput();
                    return e.setVisible(false).then(function () {
                        assert(!e.isVisible());
                        assert(!e.getInput());
                        assert(!e.getOptions());
                        assert(!e.getControl());
                    });
                });
            }).done(function () { return done(); });
        });
        test('EditorDescriptor', function () {
            var d = new baseEditor_1.EditorDescriptor('id', 'name', 'vs/workbench/test/browser/parts/editor/baseEditor.test', 'MyClass');
            assert.strictEqual(d.getId(), 'id');
            assert.strictEqual(d.getName(), 'name');
        });
        test('Editor Registration', function () {
            var d1 = new baseEditor_1.EditorDescriptor('id1', 'name', 'vs/workbench/test/browser/parts/editor/baseEditor.test', 'MyClass');
            var d2 = new baseEditor_1.EditorDescriptor('id2', 'name', 'vs/workbench/test/browser/parts/editor/baseEditor.test', 'MyOtherClass');
            var oldEditorsCnt = EditorRegistry.getEditors().length;
            var oldInputCnt = EditorRegistry.getEditorInputs().length;
            EditorRegistry.registerEditor(d1, new descriptors_1.SyncDescriptor(MyInput));
            EditorRegistry.registerEditor(d2, [new descriptors_1.SyncDescriptor(MyInput), new descriptors_1.SyncDescriptor(MyOtherInput)]);
            assert.equal(EditorRegistry.getEditors().length, oldEditorsCnt + 2);
            assert.equal(EditorRegistry.getEditorInputs().length, oldInputCnt + 3);
            assert.strictEqual(EditorRegistry.getEditor(new MyInput()), d2);
            assert.strictEqual(EditorRegistry.getEditor(new MyOtherInput()), d2);
            assert.strictEqual(EditorRegistry.getEditorById('id1'), d1);
            assert.strictEqual(EditorRegistry.getEditorById('id2'), d2);
            assert(!EditorRegistry.getEditorById('id3'));
        });
        test('Editor Lookup favors specific class over superclass (match on specific class)', function (done) {
            var d1 = new baseEditor_1.EditorDescriptor('id1', 'name', 'vs/workbench/test/browser/parts/editor/baseEditor.test', 'MyEditor');
            var d2 = new baseEditor_1.EditorDescriptor('id2', 'name', 'vs/workbench/test/browser/parts/editor/baseEditor.test', 'MyOtherEditor');
            var oldEditors = EditorRegistry.getEditors();
            EditorRegistry.setEditors([]);
            EditorRegistry.registerEditor(d2, new descriptors_1.SyncDescriptor(stringEditorInput_1.StringEditorInput));
            EditorRegistry.registerEditor(d1, new descriptors_1.SyncDescriptor(MyStringInput));
            var inst = InstantiationService.createInstantiationService({});
            inst.createInstance(EditorRegistry.getEditor(inst.createInstance(MyStringInput, 'fake', '', '', mime.MIME_TEXT, false)), 'id').then(function (editor) {
                assert.strictEqual(editor.getId(), 'myEditor');
                return inst.createInstance(EditorRegistry.getEditor(inst.createInstance(stringEditorInput_1.StringEditorInput, 'fake', '', '', mime.MIME_TEXT, false)), 'id').then(function (editor) {
                    assert.strictEqual(editor.getId(), 'myOtherEditor');
                    EditorRegistry.setEditors(oldEditors);
                });
            }).done(function () { return done(); });
        });
        test('Editor Lookup favors specific class over superclass (match on super class)', function (done) {
            var d1 = new baseEditor_1.EditorDescriptor('id1', 'name', 'vs/workbench/test/browser/parts/editor/baseEditor.test', 'MyOtherEditor');
            var oldEditors = EditorRegistry.getEditors();
            EditorRegistry.setEditors([]);
            EditorRegistry.registerEditor(d1, new descriptors_1.SyncDescriptor(stringEditorInput_1.StringEditorInput));
            var inst = InstantiationService.createInstantiationService({});
            inst.createInstance(EditorRegistry.getEditor(inst.createInstance(MyStringInput, 'fake', '', '', mime.MIME_TEXT, false)), 'id').then(function (editor) {
                assert.strictEqual('myOtherEditor', editor.getId());
                EditorRegistry.setEditors(oldEditors);
            }).done(function () { return done(); });
        });
        test('Editor Input Action - triggers isEnabled properly', function () {
            var inst = InstantiationService.createInstantiationService({});
            var action = new MyAction('id', 'label');
            action.input = inst.createInstance(stringEditorInput_1.StringEditorInput, 'input', '', '', mime.MIME_TEXT, false);
            assert.equal(action.didCallIsEnabled, true);
        });
        test('Editor Input Action Contributor', function () {
            var inst = InstantiationService.createInstantiationService({});
            var contributor = new MyEditorInputActionContributor();
            assert(!contributor.hasActions(null));
            assert(contributor.hasActions({ editor: new MyEditor('id', telemetry_1.NullTelemetryService), input: inst.createInstance(stringEditorInput_1.StringEditorInput, 'fake', '', '', mime.MIME_TEXT, false), position: 0 }));
            var actionsFirst = contributor.getActions({ editor: new MyEditor('id', telemetry_1.NullTelemetryService), input: inst.createInstance(stringEditorInput_1.StringEditorInput, 'fake', '', '', mime.MIME_TEXT, false), position: 0 });
            assert.strictEqual(actionsFirst.length, 2);
            var input = inst.createInstance(stringEditorInput_1.StringEditorInput, 'fake', '', '', mime.MIME_TEXT, false);
            var actions = contributor.getActions({ editor: new MyEditor('id', telemetry_1.NullTelemetryService), input: input, position: 0 });
            assert(actions[0] === actionsFirst[0]);
            assert(actions[1] === actionsFirst[1]);
            assert(actions[0].input === input);
            assert(actions[1].input === input);
            // other editor causes new actions to be created
            actions = contributor.getActions({ editor: new MyOtherEditor('id2', telemetry_1.NullTelemetryService), input: input, position: 0 });
            assert(actions[0] !== actionsFirst[0]);
            assert(actions[1] !== actionsFirst[1]);
            assert(actions[0].input === input);
            assert(actions[1].input === input);
            // other input causes actions to loose input context
            var myInput = new MyInput();
            myInput.getId = function () {
                return 'foo.id';
            };
            actions = contributor.getActions({ editor: new MyEditor('id3', telemetry_1.NullTelemetryService), input: myInput, position: 0 });
            assert(!actionsFirst[0].input);
            assert(!actionsFirst[1].input);
        });
        test('Editor Input Factory', function () {
            EditorRegistry.setInstantiationService(InstantiationService.createInstantiationService({}));
            EditorRegistry.registerEditorInputFactory('myInputId', MyInputFactory);
            var factory = EditorRegistry.getEditorInputFactory('myInputId');
            assert(factory);
        });
        return {
            MyEditor: MyEditor,
            MyOtherEditor: MyOtherEditor
        };
    });
});
//# sourceMappingURL=baseEditor.test.js.map