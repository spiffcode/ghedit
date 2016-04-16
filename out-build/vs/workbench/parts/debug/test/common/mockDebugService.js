/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/workbench/parts/debug/common/debug', 'vs/base/common/eventEmitter', 'vs/base/common/winjs.base'], function (require, exports, debug, ee, winjs_base_1) {
    "use strict";
    var MockDebugService = (function (_super) {
        __extends(MockDebugService, _super);
        function MockDebugService() {
            _super.call(this);
            this.serviceId = debug.IDebugService;
            this.session = new MockRawSession();
        }
        MockDebugService.prototype.getState = function () {
            return null;
        };
        MockDebugService.prototype.canSetBreakpointsIn = function (model) {
            return false;
        };
        MockDebugService.prototype.getConfigurationName = function () {
            return null;
        };
        MockDebugService.prototype.setConfiguration = function (name) {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.openConfigFile = function (sideBySide) {
            return winjs_base_1.TPromise.as(false);
        };
        MockDebugService.prototype.loadLaunchConfig = function () {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.setFocusedStackFrameAndEvaluate = function (focusedStackFrame) { };
        MockDebugService.prototype.setBreakpointsForModel = function (modelUri, rawData) { };
        MockDebugService.prototype.toggleBreakpoint = function (IRawBreakpoint) {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.enableOrDisableAllBreakpoints = function (enabled) {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.toggleEnablement = function (element) {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.toggleBreakpointsActivated = function () {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.removeAllBreakpoints = function () {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.sendAllBreakpoints = function () {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.editBreakpoint = function (editor, lineNumber) {
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
        MockDebugService.prototype.clearReplExpressions = function () { };
        MockDebugService.prototype.logToRepl = function (value, severity) { };
        MockDebugService.prototype.appendReplOutput = function (value, severity) { };
        MockDebugService.prototype.addWatchExpression = function (name) {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.renameWatchExpression = function (id, newName) {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.clearWatchExpressions = function (id) { };
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
        MockDebugService.prototype.openOrRevealEditor = function (source, lineNumber, preserveFocus, sideBySide) {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.revealRepl = function (focus) {
            return winjs_base_1.TPromise.as(null);
        };
        return MockDebugService;
    }(ee.EventEmitter));
    exports.MockDebugService = MockDebugService;
    var MockRawSession = (function (_super) {
        __extends(MockRawSession, _super);
        function MockRawSession() {
            _super.apply(this, arguments);
            this.isAttach = false;
        }
        MockRawSession.prototype.getType = function () {
            return null;
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
    }(ee.EventEmitter));
});
//# sourceMappingURL=mockDebugService.js.map