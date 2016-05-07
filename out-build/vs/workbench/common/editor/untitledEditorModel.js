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
define(["require", "exports", 'vs/workbench/common/editor/stringEditorModel', 'vs/editor/common/editorCommon', 'vs/workbench/common/events', 'vs/platform/configuration/common/configuration', 'vs/platform/event/common/event', 'vs/editor/common/services/modeService', 'vs/editor/common/services/modelService'], function (require, exports, stringEditorModel_1, editorCommon_1, events_1, configuration_1, event_1, modeService_1, modelService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var UntitledEditorModel = (function (_super) {
        __extends(UntitledEditorModel, _super);
        function UntitledEditorModel(value, modeId, resource, hasAssociatedFilePath, modeService, modelService, eventService, configurationService) {
            _super.call(this, value, modeId, resource, modeService, modelService);
            this.eventService = eventService;
            this.configurationService = configurationService;
            this.dirty = hasAssociatedFilePath; // untitled associated to file path are dirty right away
            this.registerListeners();
        }
        UntitledEditorModel.prototype.registerListeners = function () {
            var _this = this;
            // Config Changes
            this.configurationChangeListenerUnbind = this.configurationService.addListener(configuration_1.ConfigurationServiceEventTypes.UPDATED, function (e) { return _this.onConfigurationChange(e.config); });
        };
        UntitledEditorModel.prototype.onConfigurationChange = function (configuration) {
            this.configuredEncoding = configuration && configuration.files && configuration.files.encoding;
        };
        UntitledEditorModel.prototype.getValue = function () {
            if (this.textEditorModel) {
                return this.textEditorModel.getValue(editorCommon_1.EndOfLinePreference.TextDefined, true /* Preserve BOM */);
            }
            return null;
        };
        UntitledEditorModel.prototype.getModeId = function () {
            if (this.textEditorModel) {
                return this.textEditorModel.getModeId();
            }
            return null;
        };
        UntitledEditorModel.prototype.getEncoding = function () {
            return this.preferredEncoding || this.configuredEncoding;
        };
        UntitledEditorModel.prototype.setEncoding = function (encoding) {
            var oldEncoding = this.getEncoding();
            this.preferredEncoding = encoding;
            // Emit if it changed
            if (oldEncoding !== this.preferredEncoding) {
                this.eventService.emit(events_1.EventType.RESOURCE_ENCODING_CHANGED, new events_1.ResourceEvent(this.resource));
            }
        };
        UntitledEditorModel.prototype.isDirty = function () {
            return this.dirty;
        };
        UntitledEditorModel.prototype.load = function () {
            var _this = this;
            return _super.prototype.load.call(this).then(function (model) {
                var configuration = _this.configurationService.getConfiguration();
                // Encoding
                _this.configuredEncoding = configuration && configuration.files && configuration.files.encoding;
                // Listen to content changes
                _this.textModelChangeListener = _this.textEditorModel.addListener(editorCommon_1.EventType.ModelContentChanged, function (e) { return _this.onModelContentChanged(e); });
                // Emit initial dirty event if we are
                if (_this.dirty) {
                    setTimeout(function () {
                        _this.eventService.emit(events_1.EventType.UNTITLED_FILE_DIRTY, new events_1.UntitledEditorEvent(_this.resource));
                    }, 0 /* prevent race condition between creating model and emitting dirty event */);
                }
                return model;
            });
        };
        UntitledEditorModel.prototype.onModelContentChanged = function (e) {
            if (!this.dirty) {
                this.dirty = true;
                this.eventService.emit(events_1.EventType.UNTITLED_FILE_DIRTY, new events_1.UntitledEditorEvent(this.resource));
            }
        };
        UntitledEditorModel.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            if (this.textModelChangeListener) {
                this.textModelChangeListener();
                this.textModelChangeListener = null;
            }
            if (this.configurationChangeListenerUnbind) {
                this.configurationChangeListenerUnbind();
                this.configurationChangeListenerUnbind = null;
            }
            this.eventService.emit(events_1.EventType.UNTITLED_FILE_DELETED, new events_1.UntitledEditorEvent(this.resource));
        };
        UntitledEditorModel = __decorate([
            __param(4, modeService_1.IModeService),
            __param(5, modelService_1.IModelService),
            __param(6, event_1.IEventService),
            __param(7, configuration_1.IConfigurationService)
        ], UntitledEditorModel);
        return UntitledEditorModel;
    }(stringEditorModel_1.StringEditorModel));
    exports.UntitledEditorModel = UntitledEditorModel;
});
//# sourceMappingURL=untitledEditorModel.js.map