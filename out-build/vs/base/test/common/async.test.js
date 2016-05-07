define(["require", "exports", 'assert', 'vs/base/common/winjs.base', 'vs/base/common/async'], function (require, exports, assert, winjs_base_1, Async) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('Async', function () {
        test('Throttler - non async', function (done) {
            var count = 0;
            var factory = function () {
                return winjs_base_1.TPromise.as(++count);
            };
            var throttler = new Async.Throttler();
            winjs_base_1.Promise.join([
                throttler.queue(factory).then(function (result) { assert.equal(result, 1); }),
                throttler.queue(factory).then(function (result) { assert.equal(result, 2); }),
                throttler.queue(factory).then(function (result) { assert.equal(result, 3); }),
                throttler.queue(factory).then(function (result) { assert.equal(result, 4); }),
                throttler.queue(factory).then(function (result) { assert.equal(result, 5); })
            ]).done(function () { return done(); });
        });
        test('Throttler', function (done) {
            var count = 0;
            var factory = function () {
                return winjs_base_1.TPromise.timeout(0).then(function () {
                    return ++count;
                });
            };
            var throttler = new Async.Throttler();
            winjs_base_1.Promise.join([
                throttler.queue(factory).then(function (result) { assert.equal(result, 1); }),
                throttler.queue(factory).then(function (result) { assert.equal(result, 2); }),
                throttler.queue(factory).then(function (result) { assert.equal(result, 2); }),
                throttler.queue(factory).then(function (result) { assert.equal(result, 2); }),
                throttler.queue(factory).then(function (result) { assert.equal(result, 2); })
            ]).done(function () {
                winjs_base_1.Promise.join([
                    throttler.queue(factory).then(function (result) { assert.equal(result, 3); }),
                    throttler.queue(factory).then(function (result) { assert.equal(result, 4); }),
                    throttler.queue(factory).then(function (result) { assert.equal(result, 4); }),
                    throttler.queue(factory).then(function (result) { assert.equal(result, 4); }),
                    throttler.queue(factory).then(function (result) { assert.equal(result, 4); })
                ]).done(function () { return done(); });
            });
        });
        test('Throttler - cancel should not cancel other promises', function (done) {
            var count = 0;
            var factory = function () {
                return winjs_base_1.TPromise.timeout(0).then(function () {
                    return ++count;
                });
            };
            var throttler = new Async.Throttler();
            var p1;
            winjs_base_1.Promise.join([
                p1 = throttler.queue(factory).then(function (result) { assert(false, 'should not be here, 1'); }, function () { assert(true, 'yes, it was cancelled'); }),
                throttler.queue(factory).then(function (result) { assert.equal(result, 1); }, function () { assert(false, 'should not be here, 2'); }),
                throttler.queue(factory).then(function (result) { assert.equal(result, 1); }, function () { assert(false, 'should not be here, 3'); }),
                throttler.queue(factory).then(function (result) { assert.equal(result, 1); }, function () { assert(false, 'should not be here, 4'); })
            ]).done(function () { return done(); });
            p1.cancel();
        });
        test('Throttler - cancel the first queued promise should not cancel other promises', function (done) {
            var count = 0;
            var factory = function () {
                return winjs_base_1.TPromise.timeout(0).then(function () {
                    return ++count;
                });
            };
            var throttler = new Async.Throttler();
            var p2;
            winjs_base_1.Promise.join([
                throttler.queue(factory).then(function (result) { assert.equal(result, 1); }, function () { assert(false, 'should not be here, 1'); }),
                p2 = throttler.queue(factory).then(function (result) { assert(false, 'should not be here, 2'); }, function () { assert(true, 'yes, it was cancelled'); }),
                throttler.queue(factory).then(function (result) { assert.equal(result, 2); }, function () { assert(false, 'should not be here, 3'); }),
                throttler.queue(factory).then(function (result) { assert.equal(result, 2); }, function () { assert(false, 'should not be here, 4'); })
            ]).done(function () { return done(); });
            p2.cancel();
        });
        test('Throttler - cancel in the middle should not cancel other promises', function (done) {
            var count = 0;
            var factory = function () {
                return winjs_base_1.TPromise.timeout(0).then(function () {
                    return ++count;
                });
            };
            var throttler = new Async.Throttler();
            var p3;
            winjs_base_1.Promise.join([
                throttler.queue(factory).then(function (result) { assert.equal(result, 1); }, function () { assert(false, 'should not be here, 1'); }),
                throttler.queue(factory).then(function (result) { assert.equal(result, 2); }, function () { assert(false, 'should not be here, 2'); }),
                p3 = throttler.queue(factory).then(function (result) { assert(false, 'should not be here, 3'); }, function () { assert(true, 'yes, it was cancelled'); }),
                throttler.queue(factory).then(function (result) { assert.equal(result, 2); }, function () { assert(false, 'should not be here, 4'); })
            ]).done(function () { return done(); });
            p3.cancel();
        });
        test('Throttler - last factory should be the one getting called', function (done) {
            var factoryFactory = function (n) { return function () {
                return winjs_base_1.TPromise.timeout(0).then(function () { return n; });
            }; };
            var throttler = new Async.Throttler();
            var promises = [];
            promises.push(throttler.queue(factoryFactory(1)).then(function (n) { assert.equal(n, 1); }));
            promises.push(throttler.queue(factoryFactory(2)).then(function (n) { assert.equal(n, 3); }));
            promises.push(throttler.queue(factoryFactory(3)).then(function (n) { assert.equal(n, 3); }));
            winjs_base_1.Promise.join(promises).done(function () { return done(); });
        });
        test('Throttler - progress should work', function (done) {
            var order = 0;
            var factory = function () { return new winjs_base_1.Promise(function (c, e, p) {
                winjs_base_1.TPromise.timeout(0).done(function () {
                    p(order++);
                    c(true);
                });
            }); };
            var throttler = new Async.Throttler();
            var promises = [];
            var progresses = [[], [], []];
            promises.push(throttler.queue(factory).then(null, null, function (p) { return progresses[0].push(p); }));
            promises.push(throttler.queue(factory).then(null, null, function (p) { return progresses[1].push(p); }));
            promises.push(throttler.queue(factory).then(null, null, function (p) { return progresses[2].push(p); }));
            winjs_base_1.Promise.join(promises).done(function () {
                assert.deepEqual(progresses[0], [0]);
                assert.deepEqual(progresses[1], [0]);
                assert.deepEqual(progresses[2], [0]);
                done();
            });
        });
        test('Delayer', function (done) {
            var count = 0;
            var factory = function () {
                return winjs_base_1.TPromise.as(++count);
            };
            var delayer = new Async.Delayer(0);
            var promises = [];
            assert(!delayer.isTriggered());
            promises.push(delayer.trigger(factory).then(function (result) { assert.equal(result, 1); assert(!delayer.isTriggered()); }));
            assert(delayer.isTriggered());
            promises.push(delayer.trigger(factory).then(function (result) { assert.equal(result, 1); assert(!delayer.isTriggered()); }));
            assert(delayer.isTriggered());
            promises.push(delayer.trigger(factory).then(function (result) { assert.equal(result, 1); assert(!delayer.isTriggered()); }));
            assert(delayer.isTriggered());
            winjs_base_1.Promise.join(promises).done(function () {
                assert(!delayer.isTriggered());
                done();
            });
        });
        test('Delayer - simple cancel', function (done) {
            var count = 0;
            var factory = function () {
                return winjs_base_1.TPromise.as(++count);
            };
            var delayer = new Async.Delayer(0);
            assert(!delayer.isTriggered());
            delayer.trigger(factory).then(function () {
                assert(false);
            }, function () {
                assert(true, 'yes, it was cancelled');
            }).done(function () { return done(); });
            assert(delayer.isTriggered());
            delayer.cancel();
            assert(!delayer.isTriggered());
        });
        test('Delayer - cancel should cancel all calls to trigger', function (done) {
            var count = 0;
            var factory = function () {
                return winjs_base_1.TPromise.as(++count);
            };
            var delayer = new Async.Delayer(0);
            var promises = [];
            assert(!delayer.isTriggered());
            promises.push(delayer.trigger(factory).then(null, function () { assert(true, 'yes, it was cancelled'); }));
            assert(delayer.isTriggered());
            promises.push(delayer.trigger(factory).then(null, function () { assert(true, 'yes, it was cancelled'); }));
            assert(delayer.isTriggered());
            promises.push(delayer.trigger(factory).then(null, function () { assert(true, 'yes, it was cancelled'); }));
            assert(delayer.isTriggered());
            delayer.cancel();
            winjs_base_1.Promise.join(promises).done(function () {
                assert(!delayer.isTriggered());
                done();
            });
        });
        test('Delayer - trigger, cancel, then trigger again', function (done) {
            var count = 0;
            var factory = function () {
                return winjs_base_1.TPromise.as(++count);
            };
            var delayer = new Async.Delayer(0);
            var promises = [];
            assert(!delayer.isTriggered());
            delayer.trigger(factory).then(function (result) {
                assert.equal(result, 1);
                assert(!delayer.isTriggered());
                promises.push(delayer.trigger(factory).then(null, function () { assert(true, 'yes, it was cancelled'); }));
                assert(delayer.isTriggered());
                promises.push(delayer.trigger(factory).then(null, function () { assert(true, 'yes, it was cancelled'); }));
                assert(delayer.isTriggered());
                delayer.cancel();
                winjs_base_1.Promise.join(promises).then(function () {
                    promises = [];
                    assert(!delayer.isTriggered());
                    promises.push(delayer.trigger(factory).then(function () { assert.equal(result, 1); assert(!delayer.isTriggered()); }));
                    assert(delayer.isTriggered());
                    promises.push(delayer.trigger(factory).then(function () { assert.equal(result, 1); assert(!delayer.isTriggered()); }));
                    assert(delayer.isTriggered());
                    winjs_base_1.Promise.join(promises).then(function () {
                        assert(!delayer.isTriggered());
                        done();
                    });
                    assert(delayer.isTriggered());
                });
                assert(delayer.isTriggered());
            });
            assert(delayer.isTriggered());
        });
        test('Delayer - last task should be the one getting called', function (done) {
            var factoryFactory = function (n) { return function () {
                return winjs_base_1.TPromise.as(n);
            }; };
            var delayer = new Async.Delayer(0);
            var promises = [];
            assert(!delayer.isTriggered());
            promises.push(delayer.trigger(factoryFactory(1)).then(function (n) { assert.equal(n, 3); }));
            promises.push(delayer.trigger(factoryFactory(2)).then(function (n) { assert.equal(n, 3); }));
            promises.push(delayer.trigger(factoryFactory(3)).then(function (n) { assert.equal(n, 3); }));
            winjs_base_1.Promise.join(promises).then(function () {
                assert(!delayer.isTriggered());
                done();
            });
            assert(delayer.isTriggered());
        });
        test('Delayer - progress should work', function (done) {
            var order = 0;
            var factory = function () { return new winjs_base_1.Promise(function (c, e, p) {
                winjs_base_1.TPromise.timeout(0).done(function () {
                    p(order++);
                    c(true);
                });
            }); };
            var delayer = new Async.Delayer(0);
            var promises = [];
            var progresses = [[], [], []];
            promises.push(delayer.trigger(factory).then(null, null, function (p) { return progresses[0].push(p); }));
            promises.push(delayer.trigger(factory).then(null, null, function (p) { return progresses[1].push(p); }));
            promises.push(delayer.trigger(factory).then(null, null, function (p) { return progresses[2].push(p); }));
            winjs_base_1.Promise.join(promises).done(function () {
                assert.deepEqual(progresses[0], [0]);
                assert.deepEqual(progresses[1], [0]);
                assert.deepEqual(progresses[2], [0]);
                done();
            });
        });
        test('ThrottledDelayer - progress should work', function (done) {
            var order = 0;
            var factory = function () { return new winjs_base_1.Promise(function (c, e, p) {
                winjs_base_1.TPromise.timeout(0).done(function () {
                    p(order++);
                    c(true);
                });
            }); };
            var delayer = new Async.ThrottledDelayer(0);
            var promises = [];
            var progresses = [[], [], []];
            promises.push(delayer.trigger(factory).then(null, null, function (p) { return progresses[0].push(p); }));
            promises.push(delayer.trigger(factory).then(null, null, function (p) { return progresses[1].push(p); }));
            promises.push(delayer.trigger(factory).then(null, null, function (p) { return progresses[2].push(p); }));
            winjs_base_1.Promise.join(promises).done(function () {
                assert.deepEqual(progresses[0], [0]);
                assert.deepEqual(progresses[1], [0]);
                assert.deepEqual(progresses[2], [0]);
                done();
            });
        });
        test('Sequence', function (done) {
            var factoryFactory = function (n) { return function () {
                return winjs_base_1.TPromise.as(n);
            }; };
            Async.sequence([
                factoryFactory(1),
                factoryFactory(2),
                factoryFactory(3),
                factoryFactory(4),
                factoryFactory(5),
            ]).then(function (result) {
                assert.equal(5, result.length);
                assert.equal(1, result[0]);
                assert.equal(2, result[1]);
                assert.equal(3, result[2]);
                assert.equal(4, result[3]);
                assert.equal(5, result[4]);
                done();
            });
        });
        test('Limiter - sync', function (done) {
            var factoryFactory = function (n) { return function () {
                return winjs_base_1.TPromise.as(n);
            }; };
            var limiter = new Async.Limiter(1);
            var promises = [];
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(function (n) { return promises.push(limiter.queue(factoryFactory(n))); });
            winjs_base_1.Promise.join(promises).then(function (res) {
                assert.equal(10, res.length);
                limiter = new Async.Limiter(100);
                promises = [];
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(function (n) { return promises.push(limiter.queue(factoryFactory(n))); });
                return winjs_base_1.Promise.join(promises).then(function (res) {
                    assert.equal(10, res.length);
                });
            }).done(function () { return done(); });
        });
        test('Limiter - async', function (done) {
            var factoryFactory = function (n) { return function () {
                return winjs_base_1.TPromise.timeout(0).then(function () { return n; });
            }; };
            var limiter = new Async.Limiter(1);
            var promises = [];
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(function (n) { return promises.push(limiter.queue(factoryFactory(n))); });
            winjs_base_1.Promise.join(promises).then(function (res) {
                assert.equal(10, res.length);
                limiter = new Async.Limiter(100);
                promises = [];
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(function (n) { return promises.push(limiter.queue(factoryFactory(n))); });
                winjs_base_1.Promise.join(promises).then(function (res) {
                    assert.equal(10, res.length);
                });
            }).done(function () { return done(); });
        });
        test('Limiter - assert degree of paralellism', function (done) {
            var activePromises = 0;
            var factoryFactory = function (n) { return function () {
                activePromises++;
                assert(activePromises < 6);
                return winjs_base_1.TPromise.timeout(0).then(function () { activePromises--; return n; });
            }; };
            var limiter = new Async.Limiter(5);
            var promises = [];
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(function (n) { return promises.push(limiter.queue(factoryFactory(n))); });
            winjs_base_1.Promise.join(promises).then(function (res) {
                assert.equal(10, res.length);
                assert.deepEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], res);
                done();
            });
        });
    });
});
//# sourceMappingURL=async.test.js.map