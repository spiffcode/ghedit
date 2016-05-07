/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'net'], function (require, exports, net) {
    'use strict';
    /**
     * Given a start point and a max number of retries, will find a port that
     * is openable. Will return 0 in case no free port can be found.
     */
    function findFreePort(startPort, giveUpAfter, clb) {
        if (giveUpAfter === 0) {
            return clb(0);
        }
        var tryPort = startPort;
        var server = net.createServer();
        server.listen(tryPort, function (err) {
            server.once('close', function () {
                return clb(tryPort);
            });
            server.close();
        });
        server.on('error', function (err) {
            findFreePort(startPort + 1, giveUpAfter - 1, clb);
        });
    }
    exports.findFreePort = findFreePort;
});
//# sourceMappingURL=ports.js.map