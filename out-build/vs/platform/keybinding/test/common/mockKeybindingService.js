define(["require", "exports", 'vs/platform/keybinding/common/keybindingService'], function (require, exports, keybindingService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var MockKeybindingContextKey = (function () {
        function MockKeybindingContextKey(key, defaultValue) {
            this._key = key;
            this._defaultValue = defaultValue;
            this._value = this._defaultValue;
        }
        MockKeybindingContextKey.prototype.set = function (value) {
            this._value = value;
        };
        MockKeybindingContextKey.prototype.reset = function () {
            this._value = this._defaultValue;
        };
        return MockKeybindingContextKey;
    }());
    var MockKeybindingService = (function () {
        function MockKeybindingService() {
            this.serviceId = keybindingService_1.IKeybindingService;
        }
        MockKeybindingService.prototype.dispose = function () { };
        MockKeybindingService.prototype.executeCommand = function (commandId, args) { return; };
        MockKeybindingService.prototype.hasCommand = function (commandId) { return false; };
        MockKeybindingService.prototype.createKey = function (key, defaultValue) {
            return new MockKeybindingContextKey(key, defaultValue);
        };
        MockKeybindingService.prototype.getLabelFor = function (keybinding) {
            return keybinding._toUSLabel();
        };
        MockKeybindingService.prototype.getHTMLLabelFor = function (keybinding) {
            return keybinding._toUSHTMLLabel();
        };
        MockKeybindingService.prototype.getAriaLabelFor = function (keybinding) {
            return keybinding._toUSAriaLabel();
        };
        MockKeybindingService.prototype.getElectronAcceleratorFor = function (keybinding) {
            return keybinding._toElectronAccelerator();
        };
        MockKeybindingService.prototype.createScoped = function (domNode) {
            return this;
        };
        MockKeybindingService.prototype.getDefaultKeybindings = function () {
            return null;
        };
        MockKeybindingService.prototype.lookupKeybindings = function (commandId) {
            return [];
        };
        MockKeybindingService.prototype.customKeybindingsCount = function () {
            return 0;
        };
        return MockKeybindingService;
    }());
    exports.MockKeybindingService = MockKeybindingService;
});
//# sourceMappingURL=mockKeybindingService.js.map