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
define(["require", "exports", 'vs/platform/platform', 'vs/nls!vs/languages/json/common/json', 'vs/languages/json/common/features/tokenization', 'vs/editor/common/modes/abstractMode', 'vs/platform/thread/common/threadService', 'vs/platform/thread/common/thread', 'vs/platform/jsonschemas/common/jsonContributionRegistry', 'vs/platform/instantiation/common/instantiation', 'vs/editor/common/modes/supports/richEditSupport', 'vs/editor/common/modes/supports/suggestSupport'], function (require, exports, Platform, nls, tokenization, abstractMode_1, threadService_1, thread_1, jsonContributionRegistry_1, instantiation_1, richEditSupport_1, suggestSupport_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var JSONMode = (function (_super) {
        __extends(JSONMode, _super);
        function JSONMode(descriptor, instantiationService, threadService) {
            var _this = this;
            _super.call(this, descriptor.id);
            this._modeWorkerManager = new abstractMode_1.ModeWorkerManager(descriptor, 'vs/languages/json/common/jsonWorker', 'JSONWorker', null, instantiationService);
            this._threadService = threadService;
            this.tokenizationSupport = tokenization.createTokenizationSupport(this, true);
            this.richEditSupport = new richEditSupport_1.RichEditSupport(this.getId(), null, {
                wordPattern: abstractMode_1.createWordRegExp('.-'),
                comments: {
                    lineComment: '//',
                    blockComment: ['/*', '*/']
                },
                brackets: [
                    ['{', '}'],
                    ['[', ']']
                ],
                __characterPairSupport: {
                    autoClosingPairs: [
                        { open: '{', close: '}', notIn: ['string'] },
                        { open: '[', close: ']', notIn: ['string'] },
                        { open: '"', close: '"', notIn: ['string'] }
                    ]
                }
            });
            this.extraInfoSupport = this;
            this.inplaceReplaceSupport = this;
            this.configSupport = this;
            // Initialize Outline support
            this.outlineSupport = this;
            this.outlineGroupLabel = Object.create(null);
            this.outlineGroupLabel['object'] = nls.localize(0, null);
            this.outlineGroupLabel['array'] = nls.localize(1, null);
            this.outlineGroupLabel['string'] = nls.localize(2, null);
            this.outlineGroupLabel['number'] = nls.localize(3, null);
            this.outlineGroupLabel['boolean'] = nls.localize(4, null);
            this.outlineGroupLabel['null'] = nls.localize(5, null);
            this.formattingSupport = this;
            this.suggestSupport = new suggestSupport_1.SuggestSupport(this.getId(), {
                triggerCharacters: [],
                excludeTokens: ['comment.line.json', 'comment.block.json'],
                suggest: function (resource, position) { return _this.suggest(resource, position); } });
        }
        JSONMode.prototype.creationDone = function () {
            var _this = this;
            if (this._threadService.isInMainThread) {
                // Pick a worker to do validation
                this._pickAWorkerToValidate();
                // Configure all workers
                this._configureWorkerSchemas(this.getSchemaConfiguration());
                var contributionRegistry = Platform.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
                contributionRegistry.addRegistryChangedListener(function (e) {
                    _this._configureWorkerSchemas(_this.getSchemaConfiguration());
                });
            }
        };
        JSONMode.prototype._worker = function (runner) {
            return this._modeWorkerManager.worker(runner);
        };
        JSONMode.prototype.getSchemaConfiguration = function () {
            var contributionRegistry = Platform.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
            return contributionRegistry.getSchemaContributions();
        };
        JSONMode.prototype.configure = function (options) {
            if (this._threadService.isInMainThread) {
                return this._configureWorkers(options);
            }
            else {
                return this._worker(function (w) { return w._doConfigure(options); });
            }
        };
        JSONMode.prototype._configureWorkers = function (options) {
            return this._worker(function (w) { return w._doConfigure(options); });
        };
        JSONMode.prototype._configureWorkerSchemas = function (data) {
            return this._worker(function (w) { return w.setSchemaContributions(data); });
        };
        JSONMode.prototype._pickAWorkerToValidate = function () {
            return this._worker(function (w) { return w.enableValidator(); });
        };
        JSONMode.prototype.navigateValueSet = function (resource, position, up) {
            return this._worker(function (w) { return w.navigateValueSet(resource, position, up); });
        };
        JSONMode.prototype.suggest = function (resource, position) {
            return this._worker(function (w) { return w.suggest(resource, position); });
        };
        JSONMode.prototype.computeInfo = function (resource, position) {
            return this._worker(function (w) { return w.computeInfo(resource, position); });
        };
        JSONMode.prototype.getOutline = function (resource) {
            return this._worker(function (w) { return w.getOutline(resource); });
        };
        JSONMode.prototype.formatDocument = function (resource, options) {
            return this._worker(function (w) { return w.format(resource, null, options); });
        };
        JSONMode.prototype.formatRange = function (resource, range, options) {
            return this._worker(function (w) { return w.format(resource, range, options); });
        };
        JSONMode.$_configureWorkers = threadService_1.AllWorkersAttr(JSONMode, JSONMode.prototype._configureWorkers);
        JSONMode.$_configureWorkerSchemas = threadService_1.AllWorkersAttr(JSONMode, JSONMode.prototype._configureWorkerSchemas);
        JSONMode.$_pickAWorkerToValidate = threadService_1.OneWorkerAttr(JSONMode, JSONMode.prototype._pickAWorkerToValidate, thread_1.ThreadAffinity.Group1);
        JSONMode.$navigateValueSet = threadService_1.OneWorkerAttr(JSONMode, JSONMode.prototype.navigateValueSet);
        JSONMode.$suggest = threadService_1.OneWorkerAttr(JSONMode, JSONMode.prototype.suggest);
        JSONMode.$computeInfo = threadService_1.OneWorkerAttr(JSONMode, JSONMode.prototype.computeInfo);
        JSONMode.$getOutline = threadService_1.OneWorkerAttr(JSONMode, JSONMode.prototype.getOutline);
        JSONMode.$formatDocument = threadService_1.OneWorkerAttr(JSONMode, JSONMode.prototype.formatDocument);
        JSONMode.$formatRange = threadService_1.OneWorkerAttr(JSONMode, JSONMode.prototype.formatRange);
        JSONMode = __decorate([
            __param(1, instantiation_1.IInstantiationService),
            __param(2, thread_1.IThreadService)
        ], JSONMode);
        return JSONMode;
    }(abstractMode_1.AbstractMode));
    exports.JSONMode = JSONMode;
});
//# sourceMappingURL=json.js.map