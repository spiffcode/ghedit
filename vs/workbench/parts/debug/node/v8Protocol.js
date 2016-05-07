/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/uuid', 'vs/base/common/eventEmitter', 'vs/base/common/winjs.base', 'vs/workbench/parts/debug/common/debug'], function (require, exports, uuid, ee, winjs_base_1, debug) {
    "use strict";
    var V8Protocol = (function (_super) {
        __extends(V8Protocol, _super);
        function V8Protocol() {
            _super.call(this);
            this.flowEventsCount = 0;
            this.emittedStopped = false;
            this.readyForBreakpoints = false;
            this.sequence = 1;
            this.contentLength = -1;
            this.pendingRequests = {};
            this.rawData = new Buffer(0);
            this.id = uuid.generateUuid();
        }
        V8Protocol.prototype.emit = function (eventType, data) {
            if (eventType === debug.SessionEvents.STOPPED) {
                this.emittedStopped = true;
            }
            if (eventType === debug.SessionEvents.INITIALIZED) {
                this.readyForBreakpoints = true;
            }
            if (eventType === debug.SessionEvents.CONTINUED || eventType === debug.SessionEvents.STOPPED ||
                eventType === debug.SessionEvents.DEBUGEE_TERMINATED || eventType === debug.SessionEvents.SERVER_EXIT) {
                this.flowEventsCount++;
            }
            if (data) {
                data.sessionId = this.getId();
            }
            else {
                data = { sessionId: this.getId() };
            }
            _super.prototype.emit.call(this, eventType, data);
        };
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
                    var event_1 = rawData;
                    this.emit(event_1.event, event_1);
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
    }(ee.EventEmitter));
    exports.V8Protocol = V8Protocol;
});
//# sourceMappingURL=v8Protocol.js.map