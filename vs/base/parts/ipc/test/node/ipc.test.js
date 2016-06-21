/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'vs/base/common/winjs.base', 'vs/base/parts/ipc/node/ipc.cp', 'vs/base/common/uri', 'vs/base/common/async', 'vs/base/common/errors', './testService'], function (require, exports, assert, winjs_base_1, ipc_cp_1, uri_1, async_1, errors_1, testService_1) {
    'use strict';
    function createClient() {
        return new ipc_cp_1.Client(uri_1.default.parse(require.toUrl('bootstrap')).fsPath, {
            serverName: 'TestServer',
            env: { AMD_ENTRYPOINT: 'vs/base/parts/ipc/test/node/testApp', verbose: true }
        });
    }
    suite('IPC', function () {
        suite('child process', function () {
            test('createChannel', function () {
                if (process.env['VSCODE_PID']) {
                    return; // TODO@Ben find out why test fails when run from within VS Code
                }
                var client = createClient();
                var channel = client.getChannel('test');
                var service = new testService_1.TestServiceClient(channel);
                var result = service.pong('ping').then(function (r) {
                    assert.equal(r.incoming, 'ping');
                    assert.equal(r.outgoing, 'pong');
                });
                return async_1.always(result, function () { return client.dispose(); });
            });
            test('cancellation', function () {
                if (process.env['VSCODE_PID']) {
                    return; // TODO@Ben find out why test fails when run from within VS Code
                }
                var client = createClient();
                var channel = client.getChannel('test');
                var service = new testService_1.TestServiceClient(channel);
                var res = service.cancelMe();
                setTimeout(function () { return res.cancel(); }, 50);
                var result = res.then(function () { return assert.fail('Unexpected'); }, function (err) { return assert.ok(err && errors_1.isPromiseCanceledError(err)); });
                return async_1.always(result, function () { return client.dispose(); });
            });
            test('events', function () {
                if (process.env['VSCODE_PID']) {
                    return; // TODO@Ben find out why test fails when run from within VS Code
                }
                var client = createClient();
                var channel = client.getChannel('test');
                var service = new testService_1.TestServiceClient(channel);
                var event = new winjs_base_1.TPromise(function (c, e) {
                    service.onMarco(function (_a) {
                        var answer = _a.answer;
                        try {
                            assert.equal(answer, 'polo');
                            c(null);
                        }
                        catch (err) {
                            e(err);
                        }
                    });
                });
                var request = service.marco();
                var result = winjs_base_1.TPromise.join([request, event]);
                return async_1.always(result, function () { return client.dispose(); });
            });
            test('event dispose', function () {
                if (process.env['VSCODE_PID']) {
                    return; // TODO@Ben find out why test fails when run from within VS Code
                }
                var client = createClient();
                var channel = client.getChannel('test');
                var service = new testService_1.TestServiceClient(channel);
                var count = 0;
                var disposable = service.onMarco(function () { return count++; });
                var result = service.marco().then(function (answer) {
                    assert.equal(answer, 'polo');
                    assert.equal(count, 1);
                    return service.marco().then(function (answer) {
                        assert.equal(answer, 'polo');
                        assert.equal(count, 2);
                        disposable.dispose();
                        return service.marco().then(function (answer) {
                            assert.equal(answer, 'polo');
                            assert.equal(count, 2);
                        });
                    });
                });
                return async_1.always(result, function () { return client.dispose(); });
            });
        });
    });
});
//# sourceMappingURL=ipc.test.js.map