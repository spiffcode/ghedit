/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'vs/base/common/uri', 'vs/base/common/severity', 'vs/workbench/parts/debug/common/debugModel', 'sinon', 'vs/workbench/parts/debug/test/common/mockDebugService'], function (require, exports, assert, uri_1, severity_1, debugmodel, sinon, mockDebugService_1) {
    "use strict";
    suite('Debug - Model', function () {
        var model;
        setup(function () {
            model = new debugmodel.Model([], true, [], [], []);
        });
        teardown(function () {
            model = null;
        });
        // Breakpoints
        test('breakpoints simple', function () {
            var modelUri = uri_1.default.file('/myfolder/myfile.js');
            model.addBreakpoints([{ uri: modelUri, lineNumber: 5, enabled: true }, { uri: modelUri, lineNumber: 10, enabled: false }]);
            assert.equal(model.areBreakpointsActivated(), true);
            assert.equal(model.getBreakpoints().length, 2);
            model.removeBreakpoints(model.getBreakpoints());
            assert.equal(model.getBreakpoints().length, 0);
        });
        test('breakpoints toggling', function () {
            var modelUri = uri_1.default.file('/myfolder/myfile.js');
            model.addBreakpoints([{ uri: modelUri, lineNumber: 5, enabled: true }, { uri: modelUri, lineNumber: 10, enabled: false }]);
            model.addBreakpoints([{ uri: modelUri, lineNumber: 12, enabled: true, condition: 'fake condition' }]);
            assert.equal(model.getBreakpoints().length, 3);
            model.removeBreakpoints([model.getBreakpoints().pop()]);
            assert.equal(model.getBreakpoints().length, 2);
            model.toggleBreakpointsActivated();
            assert.equal(model.areBreakpointsActivated(), false);
            model.toggleBreakpointsActivated();
            assert.equal(model.areBreakpointsActivated(), true);
        });
        test('breakpoints two files', function () {
            var modelUri1 = uri_1.default.file('/myfolder/my file first.js');
            var modelUri2 = uri_1.default.file('/secondfolder/second/second file.js');
            model.addBreakpoints([{ uri: modelUri1, lineNumber: 5, enabled: true }, { uri: modelUri1, lineNumber: 10, enabled: false }]);
            model.addBreakpoints([{ uri: modelUri2, lineNumber: 1, enabled: true }, { uri: modelUri2, lineNumber: 2, enabled: true }, { uri: modelUri2, lineNumber: 3, enabled: false }]);
            assert.equal(model.getBreakpoints().length, 5);
            var bp = model.getBreakpoints()[0];
            var originalLineLumber = bp.lineNumber;
            var update = {};
            update[bp.getId()] = { line: 100, verified: false };
            model.updateBreakpoints(update);
            assert.equal(bp.lineNumber, 100);
            assert.equal(bp.desiredLineNumber, originalLineLumber);
            model.enableOrDisableAllBreakpoints(false);
            model.getBreakpoints().forEach(function (bp) {
                assert.equal(bp.enabled, false);
            });
            model.toggleEnablement(bp);
            assert.equal(bp.enabled, true);
            model.removeBreakpoints(model.getBreakpoints().filter(function (bp) { return bp.source.uri.toString() === modelUri1.toString(); }));
            assert.equal(model.getBreakpoints().length, 3);
        });
        // Threads
        test('threads simple', function () {
            var threadId = 1;
            var threadName = "firstThread";
            model.rawUpdate({
                threadId: threadId,
                thread: {
                    id: threadId,
                    name: threadName
                }
            });
            var threads = model.getThreads();
            assert.equal(threads[threadId].name, threadName);
            model.clearThreads(true);
            assert.equal(model.getThreads[threadId], null);
        });
        test('threads multiple wtih allThreadsStopped', function () {
            var mockDebugService = new mockDebugService_1.MockDebugService();
            var sessionStub = sinon.spy(mockDebugService.getActiveSession(), 'stackTrace');
            var threadId1 = 1;
            var threadName1 = "firstThread";
            var threadId2 = 2;
            var threadName2 = "secondThread";
            var stoppedReason = "breakpoint";
            // Add the threads
            model.rawUpdate({
                threadId: threadId1,
                thread: {
                    id: threadId1,
                    name: threadName1
                }
            });
            model.rawUpdate({
                threadId: threadId2,
                thread: {
                    id: threadId2,
                    name: threadName2
                }
            });
            // Stopped event with all threads stopped
            model.rawUpdate({
                threadId: threadId1,
                stoppedDetails: {
                    reason: stoppedReason,
                    threadId: 1
                },
                allThreadsStopped: true
            });
            var thread1 = model.getThreads()[threadId1];
            var thread2 = model.getThreads()[threadId2];
            // at the beginning, callstacks are obtainable but not available
            assert.equal(thread1.name, threadName1);
            assert.equal(thread1.stopped, true);
            assert.equal(thread1.getCachedCallStack(), undefined);
            assert.equal(thread1.stoppedDetails.reason, stoppedReason);
            assert.equal(thread2.name, threadName2);
            assert.equal(thread2.stopped, true);
            assert.equal(thread2.getCachedCallStack(), undefined);
            assert.equal(thread2.stoppedDetails.reason, stoppedReason);
            // after calling getCallStack, the callstack becomes available
            // and results in a request for the callstack in the debug adapter
            thread1.getCallStack(mockDebugService).then(function () {
                assert.notEqual(thread1.getCachedCallStack(), undefined);
                assert.equal(thread2.getCachedCallStack(), undefined);
                assert.equal(sessionStub.callCount, 1);
            });
            thread2.getCallStack(mockDebugService).then(function () {
                assert.notEqual(thread1.getCachedCallStack(), undefined);
                assert.notEqual(thread2.getCachedCallStack(), undefined);
                assert.equal(sessionStub.callCount, 2);
            });
            // calling multiple times getCallStack doesn't result in multiple calls
            // to the debug adapter
            thread1.getCallStack(mockDebugService).then(function () {
                return thread2.getCallStack(mockDebugService);
            }).then(function () {
                assert.equal(sessionStub.callCount, 2);
            });
            // clearing the callstack results in the callstack not being available
            thread1.clearCallStack();
            assert.equal(thread1.stopped, true);
            assert.equal(thread1.getCachedCallStack(), undefined);
            thread2.clearCallStack();
            assert.equal(thread2.stopped, true);
            assert.equal(thread2.getCachedCallStack(), undefined);
            model.continueThreads();
            assert.equal(thread1.stopped, false);
            assert.equal(thread2.stopped, false);
            model.clearThreads(true);
            assert.equal(model.getThreads[threadId1], null);
            assert.equal(model.getThreads[threadId2], null);
        });
        test('threads mutltiple without allThreadsStopped', function () {
            var mockDebugService = new mockDebugService_1.MockDebugService();
            var sessionStub = sinon.spy(mockDebugService.getActiveSession(), 'stackTrace');
            var stoppedThreadId = 1;
            var stoppedThreadName = "stoppedThread";
            var runningThreadId = 2;
            var runningThreadName = "runningThread";
            var stoppedReason = "breakpoint";
            // Add the threads
            model.rawUpdate({
                threadId: stoppedThreadId,
                thread: {
                    id: stoppedThreadId,
                    name: stoppedThreadName
                }
            });
            model.rawUpdate({
                threadId: runningThreadId,
                thread: {
                    id: runningThreadId,
                    name: runningThreadName
                }
            });
            // Stopped event with only one thread stopped
            model.rawUpdate({
                threadId: stoppedThreadId,
                stoppedDetails: {
                    reason: stoppedReason,
                    threadId: 1
                },
                allThreadsStopped: false
            });
            var stoppedThread = model.getThreads()[stoppedThreadId];
            var runningThread = model.getThreads()[runningThreadId];
            // the callstack for the stopped thread is obtainable but not available
            // the callstack for the running thread is not obtainable nor available
            assert.equal(stoppedThread.name, stoppedThreadName);
            assert.equal(stoppedThread.stopped, true);
            assert.equal(stoppedThread.getCachedCallStack(), undefined);
            assert.equal(stoppedThread.stoppedDetails.reason, stoppedReason);
            assert.equal(runningThread.name, runningThreadName);
            assert.equal(runningThread.stopped, false);
            assert.equal(runningThread.getCachedCallStack(), undefined);
            assert.equal(runningThread.stoppedDetails, undefined);
            // after calling getCallStack, the callstack becomes available
            // and results in a request for the callstack in the debug adapter
            stoppedThread.getCallStack(mockDebugService).then(function () {
                assert.notEqual(stoppedThread.getCachedCallStack(), undefined);
                assert.equal(runningThread.getCachedCallStack(), undefined);
                assert.equal(sessionStub.callCount, 1);
            });
            // calling getCallStack on the running thread returns empty array
            // and does not return in a request for the callstack in the debug
            // adapter
            runningThread.getCallStack(mockDebugService).then(function (callStack) {
                assert.deepEqual(callStack, []);
                assert.equal(sessionStub.callCount, 1);
            });
            // calling multiple times getCallStack doesn't result in multiple calls
            // to the debug adapter
            stoppedThread.getCallStack(mockDebugService).then(function () {
                assert.equal(sessionStub.callCount, 1);
            });
            // clearing the callstack results in the callstack not being available
            stoppedThread.clearCallStack();
            assert.equal(stoppedThread.stopped, true);
            assert.equal(stoppedThread.getCachedCallStack(), undefined);
            model.continueThreads();
            assert.equal(runningThread.stopped, false);
            assert.equal(stoppedThread.stopped, false);
            model.clearThreads(true);
            assert.equal(model.getThreads[stoppedThreadId], null);
            assert.equal(model.getThreads[runningThreadId], null);
        });
        // Expressions
        function assertWatchExpressions(watchExpressions, expectedName) {
            assert.equal(watchExpressions.length, 2);
            watchExpressions.forEach(function (we) {
                assert.equal(we.available, false);
                assert.equal(we.reference, 0);
                assert.equal(we.name, expectedName);
            });
        }
        test('watch expressions', function () {
            assert.equal(model.getWatchExpressions().length, 0);
            var stackFrame = new debugmodel.StackFrame(1, 1, null, 'app.js', 1, 1);
            model.addWatchExpression(null, stackFrame, 'console').done();
            model.addWatchExpression(null, stackFrame, 'console').done();
            var watchExpressions = model.getWatchExpressions();
            assertWatchExpressions(watchExpressions, 'console');
            model.renameWatchExpression(null, stackFrame, watchExpressions[0].getId(), 'new_name').done();
            model.renameWatchExpression(null, stackFrame, watchExpressions[1].getId(), 'new_name').done();
            assertWatchExpressions(model.getWatchExpressions(), 'new_name');
            model.clearWatchExpressionValues();
            assertWatchExpressions(model.getWatchExpressions(), 'new_name');
            model.clearWatchExpressions();
            assert.equal(model.getWatchExpressions().length, 0);
        });
        test('repl expressions', function () {
            assert.equal(model.getReplElements().length, 0);
            var stackFrame = new debugmodel.StackFrame(1, 1, null, 'app.js', 1, 1);
            model.addReplExpression(null, stackFrame, 'myVariable').done();
            model.addReplExpression(null, stackFrame, 'myVariable').done();
            model.addReplExpression(null, stackFrame, 'myVariable').done();
            assert.equal(model.getReplElements().length, 3);
            model.getReplElements().forEach(function (re) {
                assert.equal(re.available, false);
                assert.equal(re.name, 'myVariable');
                assert.equal(re.reference, 0);
            });
            model.clearReplExpressions();
            assert.equal(model.getReplElements().length, 0);
        });
        // Repl output
        test('repl output', function () {
            model.logToRepl('first line', severity_1.default.Error);
            model.logToRepl('second line', severity_1.default.Warning);
            model.logToRepl('second line', severity_1.default.Warning);
            model.logToRepl('second line', severity_1.default.Error);
            var elements = model.getReplElements();
            assert.equal(elements.length, 3);
            assert.equal(elements[0].value, 'first line');
            assert.equal(elements[0].counter, 1);
            assert.equal(elements[0].severity, severity_1.default.Error);
            assert.equal(elements[1].value, 'second line');
            assert.equal(elements[1].counter, 2);
            assert.equal(elements[1].severity, severity_1.default.Warning);
            model.appendReplOutput('1', severity_1.default.Error);
            model.appendReplOutput('2', severity_1.default.Error);
            model.appendReplOutput('3', severity_1.default.Error);
            elements = model.getReplElements();
            assert.equal(elements.length, 4);
            assert.equal(elements[3].value, '123');
            assert.equal(elements[3].severity, severity_1.default.Error);
            var keyValueObject = { 'key1': 2, 'key2': 'value' };
            model.logToRepl(keyValueObject);
            var element = model.getReplElements()[4];
            assert.equal(element.value, 'Object');
            assert.deepEqual(element.valueObj, keyValueObject);
            model.clearReplExpressions();
            assert.equal(model.getReplElements().length, 0);
        });
        // Utils
        test('full expression name', function () {
            var type = 'node';
            assert.equal(debugmodel.getFullExpressionName(new debugmodel.Expression(null, false), type), null);
            assert.equal(debugmodel.getFullExpressionName(new debugmodel.Expression('son', false), type), 'son');
            var scope = new debugmodel.Scope(1, 'myscope', 1, false);
            var son = new debugmodel.Variable(new debugmodel.Variable(new debugmodel.Variable(scope, 0, 'grandfather', '75'), 0, 'father', '45'), 0, 'son', '20');
            assert.equal(debugmodel.getFullExpressionName(son, type), 'grandfather.father.son');
            var grandson = new debugmodel.Variable(son, 0, '/weird_name', '1');
            assert.equal(debugmodel.getFullExpressionName(grandson, type), 'grandfather.father.son[\'/weird_name\']');
        });
    });
});
//# sourceMappingURL=debugModel.test.js.map