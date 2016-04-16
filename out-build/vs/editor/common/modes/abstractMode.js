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
define(["require", "exports", 'vs/base/common/eventEmitter', 'vs/base/common/winjs.base', 'vs/platform/instantiation/common/descriptors', 'vs/editor/common/modes/nullMode', 'vs/editor/common/modes/supports/suggestSupport', 'vs/editor/common/services/editorWorkerService'], function (require, exports, eventEmitter_1, winjs_base_1, descriptors_1, nullMode_1, suggestSupport_1, editorWorkerService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function createWordRegExp(allowInWords) {
        if (allowInWords === void 0) { allowInWords = ''; }
        return nullMode_1.NullMode.createWordRegExp(allowInWords);
    }
    exports.createWordRegExp = createWordRegExp;
    var ModeWorkerManager = (function () {
        function ModeWorkerManager(descriptor, workerModuleId, workerClassName, superWorkerModuleId, instantiationService) {
            this._descriptor = descriptor;
            this._workerDescriptor = descriptors_1.createAsyncDescriptor1(workerModuleId, workerClassName);
            this._superWorkerModuleId = superWorkerModuleId;
            this._instantiationService = instantiationService;
            this._workerPiecePromise = null;
        }
        ModeWorkerManager.prototype.worker = function (runner) {
            return this._getOrCreateWorker().then(runner);
        };
        ModeWorkerManager.prototype._getOrCreateWorker = function () {
            var _this = this;
            if (!this._workerPiecePromise) {
                // TODO@Alex: workaround for missing `bundles` config
                // First, load the code of the worker super class
                var superWorkerCodePromise = (this._superWorkerModuleId ? ModeWorkerManager._loadModule(this._superWorkerModuleId) : winjs_base_1.TPromise.as(null));
                this._workerPiecePromise = superWorkerCodePromise.then(function () {
                    // Second, load the code of the worker (without instantiating it)
                    return ModeWorkerManager._loadModule(_this._workerDescriptor.moduleName);
                }).then(function () {
                    // Finally, create the mode worker instance
                    return _this._instantiationService.createInstance(_this._workerDescriptor, _this._descriptor.id);
                });
            }
            return this._workerPiecePromise;
        };
        ModeWorkerManager._loadModule = function (moduleName) {
            return new winjs_base_1.TPromise(function (c, e, p) {
                require([moduleName], c, e);
            }, function () {
                // Cannot cancel loading code
            });
        };
        return ModeWorkerManager;
    }());
    exports.ModeWorkerManager = ModeWorkerManager;
    var AbstractMode = (function () {
        function AbstractMode(modeId) {
            this._modeId = modeId;
            this._eventEmitter = new eventEmitter_1.EventEmitter();
            this._simplifiedMode = null;
        }
        AbstractMode.prototype.getId = function () {
            return this._modeId;
        };
        AbstractMode.prototype.toSimplifiedMode = function () {
            if (!this._simplifiedMode) {
                this._simplifiedMode = new SimplifiedMode(this);
            }
            return this._simplifiedMode;
        };
        AbstractMode.prototype.addSupportChangedListener = function (callback) {
            return this._eventEmitter.addListener2('modeSupportChanged', callback);
        };
        AbstractMode.prototype.registerSupport = function (support, callback) {
            var _this = this;
            var supportImpl = callback(this);
            this[support] = supportImpl;
            this._eventEmitter.emit('modeSupportChanged', _createModeSupportChangedEvent(support));
            return {
                dispose: function () {
                    if (_this[support] === supportImpl) {
                        delete _this[support];
                        _this._eventEmitter.emit('modeSupportChanged', _createModeSupportChangedEvent(support));
                    }
                }
            };
        };
        return AbstractMode;
    }());
    exports.AbstractMode = AbstractMode;
    var SimplifiedMode = (function () {
        function SimplifiedMode(sourceMode) {
            var _this = this;
            this._sourceMode = sourceMode;
            this._eventEmitter = new eventEmitter_1.EventEmitter();
            this._id = 'vs.editor.modes.simplifiedMode:' + sourceMode.getId();
            this._assignSupports();
            if (this._sourceMode.addSupportChangedListener) {
                this._sourceMode.addSupportChangedListener(function (e) {
                    if (e.tokenizationSupport || e.richEditSupport) {
                        _this._assignSupports();
                        var newEvent = SimplifiedMode._createModeSupportChangedEvent(e);
                        _this._eventEmitter.emit('modeSupportChanged', newEvent);
                    }
                });
            }
        }
        SimplifiedMode.prototype.getId = function () {
            return this._id;
        };
        SimplifiedMode.prototype.toSimplifiedMode = function () {
            return this;
        };
        SimplifiedMode.prototype._assignSupports = function () {
            this.tokenizationSupport = this._sourceMode.tokenizationSupport;
            this.richEditSupport = this._sourceMode.richEditSupport;
        };
        SimplifiedMode._createModeSupportChangedEvent = function (originalModeEvent) {
            var event = {
                codeLensSupport: false,
                tokenizationSupport: originalModeEvent.tokenizationSupport,
                occurrencesSupport: false,
                declarationSupport: false,
                typeDeclarationSupport: false,
                navigateTypesSupport: false,
                referenceSupport: false,
                suggestSupport: false,
                parameterHintsSupport: false,
                extraInfoSupport: false,
                outlineSupport: false,
                logicalSelectionSupport: false,
                formattingSupport: false,
                inplaceReplaceSupport: false,
                emitOutputSupport: false,
                linkSupport: false,
                configSupport: false,
                quickFixSupport: false,
                richEditSupport: originalModeEvent.richEditSupport,
            };
            return event;
        };
        return SimplifiedMode;
    }());
    exports.isDigit = (function () {
        var _0 = '0'.charCodeAt(0), _1 = '1'.charCodeAt(0), _2 = '2'.charCodeAt(0), _3 = '3'.charCodeAt(0), _4 = '4'.charCodeAt(0), _5 = '5'.charCodeAt(0), _6 = '6'.charCodeAt(0), _7 = '7'.charCodeAt(0), _8 = '8'.charCodeAt(0), _9 = '9'.charCodeAt(0), _a = 'a'.charCodeAt(0), _b = 'b'.charCodeAt(0), _c = 'c'.charCodeAt(0), _d = 'd'.charCodeAt(0), _e = 'e'.charCodeAt(0), _f = 'f'.charCodeAt(0), _A = 'A'.charCodeAt(0), _B = 'B'.charCodeAt(0), _C = 'C'.charCodeAt(0), _D = 'D'.charCodeAt(0), _E = 'E'.charCodeAt(0), _F = 'F'.charCodeAt(0);
        return function isDigit(character, base) {
            var c = character.charCodeAt(0);
            switch (base) {
                case 1:
                    return c === _0;
                case 2:
                    return c >= _0 && c <= _1;
                case 3:
                    return c >= _0 && c <= _2;
                case 4:
                    return c >= _0 && c <= _3;
                case 5:
                    return c >= _0 && c <= _4;
                case 6:
                    return c >= _0 && c <= _5;
                case 7:
                    return c >= _0 && c <= _6;
                case 8:
                    return c >= _0 && c <= _7;
                case 9:
                    return c >= _0 && c <= _8;
                case 10:
                    return c >= _0 && c <= _9;
                case 11:
                    return (c >= _0 && c <= _9) || (c === _a) || (c === _A);
                case 12:
                    return (c >= _0 && c <= _9) || (c >= _a && c <= _b) || (c >= _A && c <= _B);
                case 13:
                    return (c >= _0 && c <= _9) || (c >= _a && c <= _c) || (c >= _A && c <= _C);
                case 14:
                    return (c >= _0 && c <= _9) || (c >= _a && c <= _d) || (c >= _A && c <= _D);
                case 15:
                    return (c >= _0 && c <= _9) || (c >= _a && c <= _e) || (c >= _A && c <= _E);
                default:
                    return (c >= _0 && c <= _9) || (c >= _a && c <= _f) || (c >= _A && c <= _F);
            }
        };
    })();
    var FrankensteinMode = (function (_super) {
        __extends(FrankensteinMode, _super);
        function FrankensteinMode(descriptor, editorWorkerService) {
            _super.call(this, descriptor.id);
            if (editorWorkerService) {
                this.suggestSupport = new suggestSupport_1.TextualSuggestSupport(this.getId(), editorWorkerService);
            }
        }
        FrankensteinMode = __decorate([
            __param(1, editorWorkerService_1.IEditorWorkerService)
        ], FrankensteinMode);
        return FrankensteinMode;
    }(AbstractMode));
    exports.FrankensteinMode = FrankensteinMode;
    function _createModeSupportChangedEvent() {
        var changedSupports = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            changedSupports[_i - 0] = arguments[_i];
        }
        var event = {
            codeLensSupport: false,
            tokenizationSupport: false,
            occurrencesSupport: false,
            declarationSupport: false,
            typeDeclarationSupport: false,
            navigateTypesSupport: false,
            referenceSupport: false,
            suggestSupport: false,
            parameterHintsSupport: false,
            extraInfoSupport: false,
            outlineSupport: false,
            logicalSelectionSupport: false,
            formattingSupport: false,
            inplaceReplaceSupport: false,
            emitOutputSupport: false,
            linkSupport: false,
            configSupport: false,
            quickFixSupport: false,
            richEditSupport: false
        };
        changedSupports.forEach(function (support) { return event[support] = true; });
        return event;
    }
});
//# sourceMappingURL=abstractMode.js.map