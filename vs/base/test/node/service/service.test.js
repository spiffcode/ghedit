/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'vs/base/node/service.cp', 'vs/base/common/uri', 'vs/base/common/errors', 'vs/base/test/node/service/testService'], function (require, exports, assert, service_cp_1, uri_1, errors_1, testService_1) {
    'use strict';
    function createService() {
        var server = new service_cp_1.Client(uri_1.default.parse(require.toUrl('bootstrap')).fsPath, {
            serverName: 'TestServer',
            env: { AMD_ENTRYPOINT: 'vs/base/test/node/service/testApp', verbose: true }
        });
        return server.getService('TestService', testService_1.TestService);
    }
    suite('Service', function () {
        test('createService', function (done) {
            if (process.env['VSCODE_PID']) {
                return done(); // TODO@Ben find out why test fails when run from within VS Code
            }
            var testService = createService();
            var res = testService.pong('ping');
            res.then(function (r) {
                assert.equal(r.incoming, 'ping');
                assert.equal(r.outgoing, 'pong');
                done();
            });
        });
        test('cancellation', function (done) {
            var testService = createService();
            var res = testService.cancelMe();
            setTimeout(function () {
                res.cancel();
            }, 50);
            res.then(function (r) {
                assert.fail('Unexpected');
                done();
            }, function (error) {
                assert.ok(errors_1.isPromiseCanceledError(error));
                done();
            });
        });
    });
});
//# sourceMappingURL=service.test.js.map