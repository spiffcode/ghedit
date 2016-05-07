/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/editor/common/services/codeEditorService', 'vs/workbench/parts/files/common/files', 'vs/editor/common/core/selection', 'vs/editor/common/commands/trimTrailingWhitespaceCommand', 'vs/platform/configuration/common/configuration', 'vs/platform/event/common/event'], function (require, exports, codeEditorService_1, files_1, selection_1, trimTrailingWhitespaceCommand_1, configuration_1, event_1) {
    'use strict';
    // The save participant can change a model before its saved to support various scenarios like trimming trailing whitespace
    var SaveParticipant = (function () {
        function SaveParticipant(configurationService, eventService, codeEditorService) {
            this.configurationService = configurationService;
            this.eventService = eventService;
            this.codeEditorService = codeEditorService;
            this.toUnbind = [];
            this.trimTrailingWhitespace = false;
            this.registerListeners();
            this.onConfigurationChange(this.configurationService.getConfiguration());
        }
        SaveParticipant.prototype.registerListeners = function () {
            var _this = this;
            this.toUnbind.push(this.eventService.addListener(files_1.EventType.FILE_SAVING, function (e) { return _this.onTextFileSaving(e); }));
            this.toUnbind.push(this.configurationService.addListener(configuration_1.ConfigurationServiceEventTypes.UPDATED, function (e) { return _this.onConfigurationChange(e.config); }));
        };
        SaveParticipant.prototype.onConfigurationChange = function (configuration) {
            this.trimTrailingWhitespace = configuration && configuration.files && configuration.files.trimTrailingWhitespace;
        };
        SaveParticipant.prototype.getId = function () {
            return 'vs.files.saveparticipant';
        };
        SaveParticipant.prototype.onTextFileSaving = function (e) {
            // Trim Trailing Whitespace if enabled
            if (this.trimTrailingWhitespace) {
                this.doTrimTrailingWhitespace(e.model, e.isAutoSaved);
            }
        };
        /**
         * Trim trailing whitespace on a model and ignore lines on which cursors are sitting if triggered via auto save.
         */
        SaveParticipant.prototype.doTrimTrailingWhitespace = function (model, isAutoSaved) {
            var prevSelection = [selection_1.Selection.createSelection(1, 1, 1, 1)];
            var cursors = [];
            // If this is auto save, try to find active cursors to prevent removing
            // whitespace automatically while the user is typing at the end of a line
            if (isAutoSaved && model.isAttachedToEditor()) {
                var allEditors = this.codeEditorService.listCodeEditors();
                for (var i = 0, len = allEditors.length; i < len; i++) {
                    var editor = allEditors[i];
                    var editorModel = editor.getModel();
                    if (!editorModel) {
                        continue; // empty editor
                    }
                    if (model === editorModel) {
                        prevSelection = editor.getSelections();
                        cursors.push.apply(cursors, prevSelection.map(function (s) {
                            return {
                                lineNumber: s.positionLineNumber,
                                column: s.positionColumn
                            };
                        }));
                    }
                }
            }
            var ops = trimTrailingWhitespaceCommand_1.trimTrailingWhitespace(model, cursors);
            if (!ops.length) {
                return; // Nothing to do
            }
            model.pushEditOperations(prevSelection, ops, function (edits) { return prevSelection; });
        };
        SaveParticipant.prototype.dispose = function () {
            while (this.toUnbind.length) {
                this.toUnbind.pop()();
            }
        };
        SaveParticipant = __decorate([
            __param(0, configuration_1.IConfigurationService),
            __param(1, event_1.IEventService),
            __param(2, codeEditorService_1.ICodeEditorService)
        ], SaveParticipant);
        return SaveParticipant;
    }());
    exports.SaveParticipant = SaveParticipant;
});
//# sourceMappingURL=saveParticipant.js.map