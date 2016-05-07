define(["require", "exports", 'assert', 'vs/base/common/event', 'vs/base/common/eventEmitter', 'vs/base/common/errors'], function (require, exports, assert, event_1, eventEmitter_1, Errors) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var Samples;
    (function (Samples) {
        var EventCounter = (function () {
            function EventCounter() {
                this.count = 0;
            }
            EventCounter.prototype.reset = function () {
                this.count = 0;
            };
            EventCounter.prototype.onEvent = function () {
                this.count += 1;
            };
            return EventCounter;
        }());
        Samples.EventCounter = EventCounter;
        var Document3 = (function () {
            function Document3() {
                this._onDidChange = new event_1.Emitter();
                this.onDidChange = this._onDidChange.event;
            }
            Document3.prototype.setText = function (value) {
                //...
                this._onDidChange.fire(value);
            };
            return Document3;
        }());
        Samples.Document3 = Document3;
        // what: like before but expose an existing event emitter as typed events
        var Document3b /*extends EventEmitter*/ = (function () {
            function Document3b /*extends EventEmitter*/() {
                this._eventBus = new eventEmitter_1.EventEmitter();
                this.onDidChange = event_1.fromEventEmitter(this._eventBus, Document3b._didChange);
            }
            Document3b /*extends EventEmitter*/.prototype.setText = function (value) {
                //...
                this._eventBus.emit(Document3b._didChange, value);
            };
            Document3b /*extends EventEmitter*/._didChange = 'this_is_hidden_from_consumers';
            return Document3b /*extends EventEmitter*/;
        }());
        Samples.Document3b /*extends EventEmitter*/ = Document3b /*extends EventEmitter*/;
    })(Samples || (Samples = {}));
    suite('Event', function () {
        var counter = new Samples.EventCounter();
        setup(function () { return counter.reset(); });
        test('Emitter plain', function () {
            var doc = new Samples.Document3();
            document.createElement('div').onclick = function () { };
            var subscription = doc.onDidChange(counter.onEvent, counter);
            doc.setText('far');
            doc.setText('boo');
            // unhook listener
            subscription.dispose();
            doc.setText('boo');
            assert.equal(counter.count, 2);
        });
        test('wrap legacy EventEmitter', function () {
            var doc = new Samples.Document3b();
            var subscription = doc.onDidChange(counter.onEvent, counter);
            doc.setText('far');
            doc.setText('boo');
            // unhook listener
            subscription.dispose();
            doc.setText('boo');
            assert.equal(counter.count, 2);
        });
        test('Emitter, bucket', function () {
            var bucket = [];
            var doc = new Samples.Document3();
            var subscription = doc.onDidChange(counter.onEvent, counter, bucket);
            doc.setText('far');
            doc.setText('boo');
            // unhook listener
            while (bucket.length) {
                bucket.pop().dispose();
            }
            // noop
            subscription.dispose();
            doc.setText('boo');
            assert.equal(counter.count, 2);
        });
        test('wrapEventEmitter, bucket', function () {
            var bucket = [];
            var doc = new Samples.Document3b();
            var subscription = doc.onDidChange(counter.onEvent, counter, bucket);
            doc.setText('far');
            doc.setText('boo');
            // unhook listener
            while (bucket.length) {
                bucket.pop().dispose();
            }
            // noop
            subscription.dispose();
            doc.setText('boo');
            assert.equal(counter.count, 2);
        });
        test('onFirstAdd|onLastRemove', function () {
            var firstCount = 0;
            var lastCount = 0;
            var a = new event_1.Emitter({
                onFirstListenerAdd: function () { firstCount += 1; },
                onLastListenerRemove: function () { lastCount += 1; }
            });
            assert.equal(firstCount, 0);
            assert.equal(lastCount, 0);
            var subscription = a.event(function () { });
            assert.equal(firstCount, 1);
            assert.equal(lastCount, 0);
            subscription.dispose();
            assert.equal(firstCount, 1);
            assert.equal(lastCount, 1);
            subscription = a.event(function () { });
            assert.equal(firstCount, 2);
            assert.equal(lastCount, 1);
        });
        test('throwingListener', function () {
            var origErrorHandler = Errors.errorHandler.getUnexpectedErrorHandler();
            Errors.setUnexpectedErrorHandler(function () { return null; });
            try {
                var a = new event_1.Emitter();
                var hit_1 = false;
                a.event(function () {
                    throw 9;
                });
                a.event(function () {
                    hit_1 = true;
                });
                a.fire(undefined);
                assert.equal(hit_1, true);
            }
            finally {
                Errors.setUnexpectedErrorHandler(origErrorHandler);
            }
        });
    });
    suite('EventBufferer', function () {
        test('should not buffer when not wrapped', function () {
            var bufferer = new event_1.EventBufferer();
            var counter = new Samples.EventCounter();
            var emitter = new event_1.Emitter();
            var event = bufferer.wrapEvent(emitter.event);
            var listener = event(counter.onEvent, counter);
            assert.equal(counter.count, 0);
            emitter.fire();
            assert.equal(counter.count, 1);
            emitter.fire();
            assert.equal(counter.count, 2);
            emitter.fire();
            assert.equal(counter.count, 3);
            listener.dispose();
        });
        test('should buffer when wrapped', function () {
            var bufferer = new event_1.EventBufferer();
            var counter = new Samples.EventCounter();
            var emitter = new event_1.Emitter();
            var event = bufferer.wrapEvent(emitter.event);
            var listener = event(counter.onEvent, counter);
            assert.equal(counter.count, 0);
            emitter.fire();
            assert.equal(counter.count, 1);
            bufferer.bufferEvents(function () {
                emitter.fire();
                assert.equal(counter.count, 1);
                emitter.fire();
                assert.equal(counter.count, 1);
            });
            assert.equal(counter.count, 3);
            emitter.fire();
            assert.equal(counter.count, 4);
            listener.dispose();
        });
    });
});
//# sourceMappingURL=event.test.js.map