define(["require", "exports", 'vs/nls', 'vs/base/common/event', 'vs/platform/platform'], function (require, exports, nls, event_1, platform_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    // Define extension point ids
    exports.Extensions = {
        ModesRegistry: 'editor.modesRegistry'
    };
    var EditorModesRegistry = (function () {
        function EditorModesRegistry() {
            this._onDidAddCompatModes = new event_1.Emitter();
            this.onDidAddCompatModes = this._onDidAddCompatModes.event;
            this._onDidAddLanguages = new event_1.Emitter();
            this.onDidAddLanguages = this._onDidAddLanguages.event;
            this._compatModes = [];
            this._languages = [];
        }
        // --- compat modes
        EditorModesRegistry.prototype.registerCompatModes = function (def) {
            this._compatModes = this._compatModes.concat(def);
            this._onDidAddCompatModes.fire(def);
        };
        EditorModesRegistry.prototype.registerCompatMode = function (def) {
            this._compatModes.push(def);
            this._onDidAddCompatModes.fire([def]);
        };
        EditorModesRegistry.prototype.getCompatModes = function () {
            return this._compatModes.slice(0);
        };
        // --- languages
        EditorModesRegistry.prototype.registerLanguage = function (def) {
            this._languages.push(def);
            this._onDidAddLanguages.fire([def]);
        };
        EditorModesRegistry.prototype.registerLanguages = function (def) {
            this._languages = this._languages.concat(def);
            this._onDidAddLanguages.fire(def);
        };
        EditorModesRegistry.prototype.getLanguages = function () {
            return this._languages.slice(0);
        };
        return EditorModesRegistry;
    }());
    exports.EditorModesRegistry = EditorModesRegistry;
    exports.ModesRegistry = new EditorModesRegistry();
    platform_1.Registry.add(exports.Extensions.ModesRegistry, exports.ModesRegistry);
    exports.ModesRegistry.registerLanguage({
        id: 'plaintext',
        extensions: ['.txt', '.gitignore'],
        aliases: [nls.localize('plainText.alias', "Plain Text"), 'text'],
        mimetypes: ['text/plain']
    });
});
//# sourceMappingURL=modesRegistry.js.map