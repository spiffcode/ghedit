/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/uuid', 'vs/base/common/winjs.base'], function (require, exports, uuid, winjs_base_1) {
    "use strict";
    var V8Protocol = (function () {
        function V8Protocol() {
            this.sequence = 1;
            this.contentLength = -1;
            this.pendingRequests = {};
            this.rawData = new Buffer(0);
            this.id = uuid.generateUuid();
        }
        V8Protocol.prototype.getId = function () {
            return this.id;
        };
        V8Protocol.prototype.connect = function (readable, writable) {
            var _this = this;
            this.outputStream = writable;
            readable.on('data', function (data) {
                _this.rawData = Buffer.concat([_this.rawData, data]);
                _this.handleData();
            });
        };
        V8Protocol.prototype.send = function (command, args) {
            var _this = this;
            return new winjs_base_1.TPromise(function (completeDispatch, errorDispatch) {
                _this.doSend(command, args, function (result) {
                    if (result.success) {
                        completeDispatch(result);
                    }
                    else {
                        errorDispatch(result);
                    }
                });
            });
        };
        V8Protocol.prototype.doSend = function (command, args, clb) {
            var request = {
                type: 'request',
                seq: this.sequence++,
                command: command
            };
            if (args && Object.keys(args).length > 0) {
                request.arguments = args;
            }
            // store callback for this request
            this.pendingRequests[request.seq] = clb;
            var json = JSON.stringify(request);
            var length = Buffer.byteLength(json, 'utf8');
            this.outputStream.write('Content-Length: ' + length.toString() + V8Protocol.TWO_CRLF, 'utf8');
            this.outputStream.write(json, 'utf8');
        };
        V8Protocol.prototype.handleData = function () {
            while (true) {
                if (this.contentLength >= 0) {
                    if (this.rawData.length >= this.contentLength) {
                        var message = this.rawData.toString('utf8', 0, this.contentLength);
                        this.rawData = this.rawData.slice(this.contentLength);
                        this.contentLength = -1;
                        if (message.length > 0) {
                            this.dispatch(message);
                        }
                        continue; // there may be more complete messages to process
                    }
                }
                else {
                    var s = this.rawData.toString('utf8', 0, this.rawData.length);
                    var idx = s.indexOf(V8Protocol.TWO_CRLF);
                    if (idx !== -1) {
                        var match = /Content-Length: (\d+)/.exec(s);
                        if (match && match[1]) {
                            this.contentLength = Number(match[1]);
                            this.rawData = this.rawData.slice(idx + V8Protocol.TWO_CRLF.length);
                            continue; // try to handle a complete message
                        }
                    }
                }
                break;
            }
        };
        V8Protocol.prototype.dispatch = function (body) {
            try {
                var rawData = JSON.parse(body);
                if (typeof rawData.event !== 'undefined') {
                    this.onEvent(rawData);
                }
                else {
                    var response = rawData;
                    var clb = this.pendingRequests[response.request_seq];
                    if (clb) {
                        delete this.pendingRequests[response.request_seq];
                        clb(response);
                    }
                }
            }
            catch (e) {
                this.onServerError(new Error(e.message || e));
            }
        };
        V8Protocol.TWO_CRLF = '\r\n\r\n';
        return V8Protocol;
    }());
    exports.V8Protocol = V8Protocol;
});
//# sourceMappingURL=v8Protocol.js.map