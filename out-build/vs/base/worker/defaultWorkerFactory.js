define(["require", "exports", 'vs/base/common/flags', 'vs/base/common/lifecycle', 'vs/base/browser/dom'], function (require, exports, flags, lifecycle_1, dom) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function defaultGetWorkerUrl(workerId, label) {
        return require.toUrl('./' + workerId);
    }
    var getWorkerUrl = flags.getCrossOriginWorkerScriptUrl || defaultGetWorkerUrl;
    /**
     * A worker that uses HTML5 web workers so that is has
     * its own global scope and its own thread.
     */
    var WebWorker = (function () {
        function WebWorker(moduleId, id, label, onMessageCallback) {
            this.id = id;
            this.worker = new Worker(getWorkerUrl('workerMain.js', label));
            this.postMessage(moduleId);
            this.worker.onmessage = function (ev) {
                onMessageCallback(ev.data);
            };
        }
        WebWorker.prototype.getId = function () {
            return this.id;
        };
        WebWorker.prototype.postMessage = function (msg) {
            this.worker.postMessage(msg);
        };
        WebWorker.prototype.dispose = function () {
            this.worker.terminate();
            this.worker = null;
        };
        return WebWorker;
    }());
    /**
     * A worker that runs in an iframe and therefore does have its
     * own global scope, but no own thread.
     */
    var FrameWorker = (function () {
        function FrameWorker(moduleId, id, onMessageCallback) {
            var _this = this;
            this.id = id;
            this._listeners = [];
            // Collect all messages sent to the worker until the iframe is loaded
            this.loaded = false;
            this.beforeLoadMessages = [];
            this.postMessage(moduleId);
            this.iframe = document.createElement('iframe');
            this.iframe.id = this.iframeId();
            this.iframe.src = require.toUrl('./workerMainCompatibility.html');
            this.iframe.frameborder = this.iframe.height = this.iframe.width = '0';
            this.iframe.style.display = 'none';
            this._listeners.push(dom.addDisposableListener(this.iframe, 'load', function () { return _this.onLoaded(); }));
            this.onMessage = function (ev) {
                onMessageCallback(ev.data);
            };
            this._listeners.push(dom.addDisposableListener(window, 'message', this.onMessage));
            document.body.appendChild(this.iframe);
        }
        FrameWorker.prototype.dispose = function () {
            this._listeners = lifecycle_1.dispose(this._listeners);
            window.removeEventListener('message', this.onMessage);
            window.frames[this.iframeId()].close();
        };
        FrameWorker.prototype.iframeId = function () {
            return 'worker_iframe_' + this.id;
        };
        FrameWorker.prototype.onLoaded = function () {
            this.loaded = true;
            while (this.beforeLoadMessages.length > 0) {
                this.postMessage(this.beforeLoadMessages.shift());
            }
        };
        FrameWorker.prototype.getId = function () {
            return this.id;
        };
        FrameWorker.prototype.postMessage = function (msg) {
            if (this.loaded === true) {
                var iframe = window.frames[this.iframeId()];
                if (iframe.postMessage) {
                    iframe.postMessage(msg, '*');
                }
                else {
                    iframe.contentWindow.postMessage(msg, '*');
                }
            }
            else {
                this.beforeLoadMessages.push(msg);
            }
        };
        return FrameWorker;
    }());
    var DefaultWorkerFactory = (function () {
        function DefaultWorkerFactory() {
        }
        DefaultWorkerFactory.prototype.create = function (moduleId, onMessageCallback) {
            var workerId = (++DefaultWorkerFactory.LAST_WORKER_ID);
            if (typeof WebWorker !== 'undefined') {
                return new WebWorker(moduleId, workerId, 'service' + workerId, onMessageCallback);
            }
            return new FrameWorker(moduleId, workerId, onMessageCallback);
        };
        DefaultWorkerFactory.LAST_WORKER_ID = 0;
        return DefaultWorkerFactory;
    }());
    exports.DefaultWorkerFactory = DefaultWorkerFactory;
});
