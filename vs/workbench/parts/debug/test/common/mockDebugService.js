/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/workbench/parts/debug/common/debug'], function (require, exports, winjs_base_1, debug) {
    "use strict";
    var MockDebugService = (function () {
        function MockDebugService() {
            this.serviceId = debug.IDebugService;
            this.session = new MockRawSession();
        }
        Object.defineProperty(MockDebugService.prototype, "state", {
            get: function () {
                return null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MockDebugService.prototype, "onDidChangeState", {
            get: function () {
                return null;
            },
            enumerable: true,
            configurable: true
        });
        MockDebugService.prototype.getConfigurationManager = function () {
            return null;
        };
        MockDebugService.prototype.setFocusedStackFrameAndEvaluate = function (focusedStackFrame) {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.addBreakpoints = function (rawBreakpoints) {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.enableOrDisableBreakpoints = function (enabled) {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.setBreakpointsActivated = function () {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.removeBreakpoints = function () {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.addFunctionBreakpoint = function () { };
        MockDebugService.prototype.renameFunctionBreakpoint = function (id, newFunctionName) {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.removeFunctionBreakpoints = function (id) {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.addReplExpression = function (name) {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.removeReplExpressions = function () { };
        MockDebugService.prototype.logToRepl = function (value, severity) { };
        MockDebugService.prototype.appendReplOutput = function (value, severity) { };
        MockDebugService.prototype.addWatchExpression = function (name) {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.renameWatchExpression = function (id, newName) {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.removeWatchExpressions = function (id) { };
        MockDebugService.prototype.createSession = function (noDebug) {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.restartSession = function () {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.getActiveSession = function () {
            return this.session;
        };
        MockDebugService.prototype.getModel = function () {
            return null;
        };
        MockDebugService.prototype.getViewModel = function () {
            return null;
        };
        MockDebugService.prototype.openOrRevealSource = function (source, lineNumber, preserveFocus, sideBySide) {
            return winjs_base_1.TPromise.as(null);
        };
        return MockDebugService;
    }());
    exports.MockDebugService = MockDebugService;
    var MockRawSession = (function () {
        function MockRawSession() {
        }
        Object.defineProperty(MockRawSession.prototype, "configuration", {
            get: function () {
                return {
                    type: 'mock',
                    isAttach: false,
                    capabilities: {}
                };
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MockRawSession.prototype, "onDidStop", {
            get: function () {
                return null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MockRawSession.prototype, "onDidEvent", {
            get: function () {
                return null;
            },
            enumerable: true,
            configurable: true
        });
        MockRawSession.prototype.custom = function (request, args) {
            return winjs_base_1.TPromise.as(null);
        };
        MockRawSession.prototype.disconnect = function (restart, force) {
            return winjs_base_1.TPromise.as(null);
        };
        MockRawSession.prototype.next = function (args) {
            return winjs_base_1.TPromise.as(null);
        };
        MockRawSession.prototype.stepIn = function (args) {
            return winjs_base_1.TPromise.as(null);
        };
        MockRawSession.prototype.stepOut = function (args) {
            return winjs_base_1.TPromise.as(null);
        };
        MockRawSession.prototype.continue = function (args) {
            return winjs_base_1.TPromise.as(null);
        };
        MockRawSession.prototype.pause = function (args) {
            return winjs_base_1.TPromise.as(null);
        };
        MockRawSession.prototype.stackTrace = function (args) {
            return winjs_base_1.TPromise.as({
                body: {
                    stackFrames: []
                }
            });
        };
        MockRawSession.prototype.scopes = function (args) {
            return winjs_base_1.TPromise.as(null);
        };
        MockRawSession.prototype.variables = function (args) {
            return winjs_base_1.TPromise.as(null);
        };
        MockRawSession.prototype.evaluate = function (args) {
            return winjs_base_1.TPromise.as(null);
        };
        return MockRawSession;
    }());
});
//# sourceMappingURL=mockDebugService.js.map