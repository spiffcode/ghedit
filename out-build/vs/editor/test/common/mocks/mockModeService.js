define(["require", "exports", 'vs/editor/common/services/modeService'], function (require, exports, modeService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var MockModeService = (function () {
        function MockModeService() {
            this.serviceId = modeService_1.IModeService;
            this.onDidAddModes = undefined;
            this.onDidCreateMode = undefined;
        }
        MockModeService.prototype.configureMode = function (modeName, options) {
            throw new Error('Not implemented');
        };
        MockModeService.prototype.configureModeById = function (modeId, options) {
            throw new Error('Not implemented');
        };
        MockModeService.prototype.configureAllModes = function (config) {
            throw new Error('Not implemented');
        };
        MockModeService.prototype.getConfigurationForMode = function (modeId) {
            throw new Error('Not implemented');
        };
        // --- reading
        MockModeService.prototype.isRegisteredMode = function (mimetypeOrModeId) {
            throw new Error('Not implemented');
        };
        MockModeService.prototype.isCompatMode = function (modeId) {
            throw new Error('Not implemented');
        };
        MockModeService.prototype.getRegisteredModes = function () {
            throw new Error('Not implemented');
        };
        MockModeService.prototype.getRegisteredLanguageNames = function () {
            throw new Error('Not implemented');
        };
        MockModeService.prototype.getExtensions = function (alias) {
            throw new Error('Not implemented');
        };
        MockModeService.prototype.getMimeForMode = function (modeId) {
            throw new Error('Not implemented');
        };
        MockModeService.prototype.getLanguageName = function (modeId) {
            throw new Error('Not implemented');
        };
        MockModeService.prototype.getModeIdForLanguageName = function (alias) {
            throw new Error('Not implemented');
        };
        MockModeService.prototype.getModeId = function (commaSeparatedMimetypesOrCommaSeparatedIds) {
            throw new Error('Not implemented');
        };
        MockModeService.prototype.getConfigurationFiles = function (modeId) {
            throw new Error('Not implemented');
        };
        // --- instantiation
        MockModeService.prototype.lookup = function (commaSeparatedMimetypesOrCommaSeparatedIds) {
            throw new Error('Not implemented');
        };
        MockModeService.prototype.getMode = function (commaSeparatedMimetypesOrCommaSeparatedIds) {
            throw new Error('Not implemented');
        };
        MockModeService.prototype.getOrCreateMode = function (commaSeparatedMimetypesOrCommaSeparatedIds) {
            throw new Error('Not implemented');
        };
        MockModeService.prototype.getOrCreateModeByLanguageName = function (languageName) {
            throw new Error('Not implemented');
        };
        MockModeService.prototype.getOrCreateModeByFilenameOrFirstLine = function (filename, firstLine) {
            throw new Error('Not implemented');
        };
        MockModeService.prototype.registerRichEditSupport = function (modeId, support) {
            throw new Error('Not implemented');
        };
        MockModeService.prototype.registerTokenizationSupport = function (modeId, callback) {
            throw new Error('Not implemented');
        };
        MockModeService.prototype.registerMonarchDefinition = function (modelService, editorWorkerService, modeId, language) {
            throw new Error('Not implemented');
        };
        return MockModeService;
    }());
    exports.MockModeService = MockModeService;
});
//# sourceMappingURL=mockModeService.js.map