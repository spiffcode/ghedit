/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'net', 'vs/base/node/ports'], function (require, exports, assert, net, ports) {
    'use strict';
    suite('Ports', function () {
        test('Finds a free port (no timeout)', function (done) {
            // get an initial freeport >= 7000
            ports.findFreePort(7000, 100, 300000, function (initialPort) {
                assert.ok(initialPort >= 7000);
                // create a server to block this port
                var server = net.createServer();
                server.listen(initialPort, null, null, function () {
                    // once listening, find another free port and assert that the port is different from the opened one
                    ports.findFreePort(7000, 50, 300000, function (freePort) {
                        assert.ok(freePort >= 7000 && freePort !== initialPort);
                        server.close();
                        done();
                    });
                });
            });
        });
        // Unreliable test:
        // test('Finds a free port (with timeout)', function (done: () => void) {
        // 	// get an initial freeport >= 7000
        // 	ports.findFreePort(7000, 100, 300000, (initialPort) => {
        // 		assert.ok(initialPort >= 7000);
        // 		// create a server to block this port
        // 		const server = net.createServer();
        // 		server.listen(initialPort, null, null, () =>  {
        // 			// once listening, find another free port and assert that the port is different from the opened one
        // 			ports.findFreePort(7000, 50, 0, (freePort) => {
        // 				assert.equal(freePort, 0);
        // 				server.close();
        // 				done();
        // 			});
        // 		});
        // 	});
        // });
    });
});
//# sourceMappingURL=port.test.js.map