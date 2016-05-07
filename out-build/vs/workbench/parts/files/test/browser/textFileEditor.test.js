/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'vs/base/common/paths', 'vs/base/common/uri', 'vs/workbench/parts/files/browser/files', 'vs/platform/platform', 'vs/platform/instantiation/common/descriptors', 'vs/workbench/parts/files/browser/editors/fileEditorInput', 'vs/workbench/browser/parts/editor/baseEditor'], function (require, exports, assert_1, paths_1, uri_1, files_1, platform_1, descriptors_1, fileEditorInput_1, baseEditor_1) {
    'use strict';
    var ExtensionId = baseEditor_1.Extensions.Editors;
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
    suite('Files - TextFileEditor', function () {
        test('TextFile Editor Registration', function () {
            var d1 = new files_1.FileEditorDescriptor('ce-id1', 'name', 'vs/workbench/parts/files/browser/tests/contentEditor.test', 'MyClass', ['test-text/html', 'test-text/javascript']);
            var d2 = new files_1.FileEditorDescriptor('ce-id2', 'name', 'vs/workbench/parts/files/browser/tests/contentEditor.test', 'MyOtherClass', ['test-text/css', 'test-text/javascript']);
            var oldEditors = platform_1.Registry.as(ExtensionId).getEditors();
            platform_1.Registry.as(ExtensionId).setEditors([]);
            var oldEditorCnt = platform_1.Registry.as(ExtensionId).getEditors().length;
            var oldInputCnt = platform_1.Registry.as(ExtensionId).getEditorInputs().length;
            platform_1.Registry.as(ExtensionId).registerEditor(d1, new descriptors_1.SyncDescriptor(fileEditorInput_1.FileEditorInput));
            platform_1.Registry.as(ExtensionId).registerEditor(d2, new descriptors_1.SyncDescriptor(fileEditorInput_1.FileEditorInput));
            assert_1.equal(platform_1.Registry.as(ExtensionId).getEditors().length, oldEditorCnt + 2);
            assert_1.equal(platform_1.Registry.as(ExtensionId).getEditorInputs().length, oldInputCnt + 2);
            assert_1.strictEqual(platform_1.Registry.as(ExtensionId).getEditor(new fileEditorInput_1.FileEditorInput(uri_1.default.file(paths_1.join('C:\\', '/foo/bar/foobar.html')), 'test-text/html', void 0, void 0, void 0, void 0)), d1);
            assert_1.strictEqual(platform_1.Registry.as(ExtensionId).getEditor(new fileEditorInput_1.FileEditorInput(uri_1.default.file(paths_1.join('C:\\', '/foo/bar/foobar.js')), 'test-text/javascript', void 0, void 0, void 0, void 0)), d1);
            assert_1.strictEqual(platform_1.Registry.as(ExtensionId).getEditor(new fileEditorInput_1.FileEditorInput(uri_1.default.file(paths_1.join('C:\\', '/foo/bar/foobar.css')), 'test-text/css', void 0, void 0, void 0, void 0)), d2);
            platform_1.Registry.as(ExtensionId).setEditors(oldEditors);
        });
    });
});
//# sourceMappingURL=textFileEditor.test.js.map