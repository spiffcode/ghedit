define(["require", "exports", 'vs/platform/platform', 'vs/base/common/uri', 'vs/workbench/browser/parts/editor/baseEditor', 'vs/workbench/parts/markdown/common/markdownEditorInput', 'vs/workbench/parts/markdown/browser/markdownExtension', 'vs/workbench/common/contributions'], function (require, exports, platform_1, uri_1, baseEditor_1, markdownEditorInput_1, markdownExtension_1, contributions_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    // Register Editor Input Factory
    var MarkdownInputFactory = (function () {
        function MarkdownInputFactory() {
        }
        MarkdownInputFactory.prototype.serialize = function (editorInput) {
            var markdownInput = editorInput;
            return markdownInput.getResource().toString();
        };
        MarkdownInputFactory.prototype.deserialize = function (instantiationService, resourceRaw) {
            return instantiationService.createInstance(markdownEditorInput_1.MarkdownEditorInput, uri_1.default.parse(resourceRaw), void 0, void 0);
        };
        return MarkdownInputFactory;
    }());
    platform_1.Registry.as(baseEditor_1.Extensions.Editors).registerEditorInputFactory(markdownEditorInput_1.MarkdownEditorInput.ID, MarkdownInputFactory);
    // Register Markdown File Tracker
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(markdownExtension_1.MarkdownFileTracker);
});
//# sourceMappingURL=markdown.contribution.js.map