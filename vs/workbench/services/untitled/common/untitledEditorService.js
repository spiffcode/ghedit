var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/uri', 'vs/platform/instantiation/common/instantiation', 'vs/base/common/events', 'vs/base/common/arrays', 'vs/workbench/common/editor/untitledEditorInput'], function (require, exports, uri_1, instantiation_1, events_1, arrays, untitledEditorInput_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    exports.IUntitledEditorService = instantiation_1.createDecorator('untitledEditorService');
    var UntitledEditorService = (function () {
        function UntitledEditorService(instantiationService) {
            this.instantiationService = instantiationService;
            this.serviceId = exports.IUntitledEditorService;
        }
        UntitledEditorService.prototype.get = function (resource) {
            return UntitledEditorService.CACHE[resource.toString()];
        };
        UntitledEditorService.prototype.getAll = function (resources) {
            var _this = this;
            if (resources) {
                return arrays.coalesce(resources.map(function (r) { return _this.get(r); }));
            }
            return Object.keys(UntitledEditorService.CACHE).map(function (key) { return UntitledEditorService.CACHE[key]; });
        };
        UntitledEditorService.prototype.isDirty = function (resource) {
            var input = this.get(resource);
            return input && input.isDirty();
        };
        UntitledEditorService.prototype.getDirty = function () {
            return Object.keys(UntitledEditorService.CACHE)
                .map(function (key) { return UntitledEditorService.CACHE[key]; })
                .filter(function (i) { return i.isDirty(); })
                .map(function (i) { return i.getResource(); });
        };
        UntitledEditorService.prototype.createOrGet = function (resource, modeId) {
            var hasAssociatedFilePath = false;
            if (resource) {
                hasAssociatedFilePath = (resource.scheme === 'file');
                resource = this.resourceToUntitled(resource); // ensure we have the right scheme
                if (hasAssociatedFilePath) {
                    UntitledEditorService.KNOWN_ASSOCIATED_FILE_PATHS[resource.toString()] = true; // remember for future lookups
                }
            }
            // Return existing instance if asked for it
            if (resource && UntitledEditorService.CACHE[resource.toString()]) {
                return UntitledEditorService.CACHE[resource.toString()];
            }
            // Create new otherwise
            return this.doCreate(resource, hasAssociatedFilePath, modeId);
        };
        UntitledEditorService.prototype.doCreate = function (resource, hasAssociatedFilePath, modeId) {
            if (!resource) {
                // Create new taking a resource URI that is not already taken
                var counter = Object.keys(UntitledEditorService.CACHE).length + 1;
                do {
                    resource = uri_1.default.create(untitledEditorInput_1.UntitledEditorInput.SCHEMA, null, 'Untitled-' + counter);
                    counter++;
                } while (Object.keys(UntitledEditorService.CACHE).indexOf(resource.toString()) >= 0);
            }
            var input = this.instantiationService.createInstance(untitledEditorInput_1.UntitledEditorInput, resource, hasAssociatedFilePath, modeId);
            // Remove from cache on dispose
            input.addOneTimeListener(events_1.EventType.DISPOSE, function () {
                delete UntitledEditorService.CACHE[input.getResource().toString()];
                delete UntitledEditorService.KNOWN_ASSOCIATED_FILE_PATHS[input.getResource().toString()];
            });
            // Add to cache
            UntitledEditorService.CACHE[resource.toString()] = input;
            return input;
        };
        UntitledEditorService.prototype.resourceToUntitled = function (resource) {
            if (resource.scheme === untitledEditorInput_1.UntitledEditorInput.SCHEMA) {
                return resource;
            }
            return uri_1.default.create(untitledEditorInput_1.UntitledEditorInput.SCHEMA, null, resource.fsPath);
        };
        UntitledEditorService.prototype.hasAssociatedFilePath = function (resource) {
            return !!UntitledEditorService.KNOWN_ASSOCIATED_FILE_PATHS[resource.toString()];
        };
        UntitledEditorService.CACHE = Object.create(null);
        UntitledEditorService.KNOWN_ASSOCIATED_FILE_PATHS = Object.create(null);
        UntitledEditorService = __decorate([
            __param(0, instantiation_1.IInstantiationService)
        ], UntitledEditorService);
        return UntitledEditorService;
    }());
    exports.UntitledEditorService = UntitledEditorService;
});
//# sourceMappingURL=untitledEditorService.js.map