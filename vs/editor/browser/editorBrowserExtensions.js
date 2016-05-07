define(["require", "exports", 'vs/platform/platform'], function (require, exports, platform_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var EditorBrowserRegistry;
    (function (EditorBrowserRegistry) {
        // --- Editor Contributions
        function registerEditorContribution(ctor) {
            platform_1.Registry.as(Extensions.EditorContributions).registerEditorBrowserContribution(ctor);
        }
        EditorBrowserRegistry.registerEditorContribution = registerEditorContribution;
        function getEditorContributions() {
            return platform_1.Registry.as(Extensions.EditorContributions).getEditorBrowserContributions();
        }
        EditorBrowserRegistry.getEditorContributions = getEditorContributions;
    })(EditorBrowserRegistry = exports.EditorBrowserRegistry || (exports.EditorBrowserRegistry = {}));
    var SimpleEditorContributionDescriptor = (function () {
        function SimpleEditorContributionDescriptor(ctor) {
            this._ctor = ctor;
        }
        SimpleEditorContributionDescriptor.prototype.createInstance = function (instantiationService, editor) {
            // cast added to help the compiler, can remove once IConstructorSignature1 has been removed
            return instantiationService.createInstance(this._ctor, editor);
        };
        return SimpleEditorContributionDescriptor;
    }());
    // Editor extension points
    var Extensions = {
        EditorContributions: 'editor.contributions'
    };
    var EditorContributionRegistry = (function () {
        function EditorContributionRegistry() {
            this.editorContributions = [];
        }
        EditorContributionRegistry.prototype.registerEditorBrowserContribution = function (ctor) {
            this.editorContributions.push(new SimpleEditorContributionDescriptor(ctor));
        };
        EditorContributionRegistry.prototype.getEditorBrowserContributions = function () {
            return this.editorContributions.slice(0);
        };
        return EditorContributionRegistry;
    }());
    platform_1.Registry.add(Extensions.EditorContributions, new EditorContributionRegistry());
});
//# sourceMappingURL=editorBrowserExtensions.js.map