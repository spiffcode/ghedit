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
define(["require", "exports", 'vs/editor/common/modes/monarch/monarch', 'vs/editor/common/modes/monarch/monarchCompile', 'vs/platform/instantiation/common/instantiation', 'vs/editor/common/services/modelService', 'vs/editor/common/services/modeService', 'vs/platform/thread/common/threadService', 'vs/editor/common/services/editorWorkerService', 'vs/editor/common/modes/abstractMode'], function (require, exports, monarch_1, monarchCompile_1, instantiation_1, modelService_1, modeService_1, threadService_1, editorWorkerService_1, abstractMode_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    exports.language = {
        displayName: 'Log',
        name: 'Log',
        defaultToken: '',
        ignoreCase: true,
        tokenizer: {
            root: [
                // Monaco log levels
                [/^\[trace.*?\]|trace:?/, 'debug-token.output'],
                [/^\[http.*?\]|http:?/, 'debug-token.output'],
                [/^\[debug.*?\]|debug:?/, 'debug-token.output'],
                [/^\[verbose.*?\]|verbose:?/, 'debug-token.output'],
                [/^\[information.*?\]|information:?/, 'info-token.output'],
                [/^\[info.*?\]|info:?/, 'info-token.output'],
                [/^\[warning.*?\]|warning:?/, 'warn-token.output'],
                [/^\[warn.*?\]|warn:?/, 'warn-token.output'],
                [/^\[error.*?\]|error:?/, 'error-token.output'],
                [/^\[fatal.*?\]|fatal:?/, 'error-token.output']
            ]
        }
    };
    var OutputMode = (function (_super) {
        __extends(OutputMode, _super);
        function OutputMode(descriptor, instantiationService, modeService, modelService, editorWorkerService) {
            _super.call(this, descriptor.id, monarchCompile_1.compile(exports.language), modeService, modelService, editorWorkerService);
            this._modeWorkerManager = new abstractMode_1.ModeWorkerManager(descriptor, 'vs/workbench/parts/output/common/outputWorker', 'OutputWorker', null, instantiationService);
            this.linkSupport = this;
        }
        OutputMode.prototype._worker = function (runner) {
            return this._modeWorkerManager.worker(runner);
        };
        OutputMode.prototype.computeLinks = function (resource) {
            return this._worker(function (w) { return w.computeLinks(resource); });
        };
        OutputMode.$computeLinks = threadService_1.OneWorkerAttr(OutputMode, OutputMode.prototype.computeLinks);
        OutputMode = __decorate([
            __param(1, instantiation_1.IInstantiationService),
            __param(2, modeService_1.IModeService),
            __param(3, modelService_1.IModelService),
            __param(4, editorWorkerService_1.IEditorWorkerService)
        ], OutputMode);
        return OutputMode;
    }(monarch_1.MonarchMode));
    exports.OutputMode = OutputMode;
});
//# sourceMappingURL=outputMode.js.map