/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'assert', 'vs/base/common/lifecycle', 'vs/base/common/winjs.base', 'vs/base/common/eventEmitter', 'vs/base/parts/tree/browser/treeModel', 'vs/base/parts/tree/browser/treeDefaults'], function (require, exports, assert, lifecycle, WinJS, Events, model, TreeDefaults) {
    'use strict';
    var FakeRenderer = (function () {
        function FakeRenderer() {
        }
        FakeRenderer.prototype.getHeight = function (tree, element) {
            return 20;
        };
        FakeRenderer.prototype.getTemplateId = function (tree, element) {
            return 'fake';
        };
        FakeRenderer.prototype.renderTemplate = function (tree, templateId, container) {
            return null;
        };
        FakeRenderer.prototype.renderElement = function (tree, element, templateId, templateData) {
            // noop
        };
        FakeRenderer.prototype.disposeTemplate = function (tree, templateId, templateData) {
            // noop
        };
        return FakeRenderer;
    }());
    exports.FakeRenderer = FakeRenderer;
    var TreeContext = (function () {
        function TreeContext(configuration) {
            this.configuration = configuration;
            this.tree = null;
            this.options = { autoExpandSingleChildren: true };
            this.dataSource = configuration.dataSource;
            this.renderer = configuration.renderer || new FakeRenderer();
            this.controller = configuration.controller;
            this.dnd = configuration.dnd;
            this.filter = configuration.filter || new TreeDefaults.DefaultFilter();
            this.sorter = configuration.sorter || new TreeDefaults.DefaultSorter();
        }
        return TreeContext;
    }());
    var TreeModel = (function (_super) {
        __extends(TreeModel, _super);
        function TreeModel(configuration) {
            _super.call(this, new TreeContext(configuration));
        }
        return TreeModel;
    }(model.TreeModel));
    var EventCounter = (function () {
        function EventCounter() {
            this.listeners = [];
            this._count = 0;
        }
        EventCounter.prototype.listen = function (emitter, event, fn) {
            var _this = this;
            if (fn === void 0) { fn = null; }
            var r = emitter.addListener2(event, function (e) {
                _this._count++;
                fn && fn(e);
            });
            this.listeners.push(r);
            return function () {
                var idx = _this.listeners.indexOf(r);
                if (idx > -1) {
                    _this.listeners.splice(idx, 1);
                    r.dispose();
                }
            };
        };
        EventCounter.prototype.up = function () {
            this._count++;
        };
        Object.defineProperty(EventCounter.prototype, "count", {
            get: function () {
                return this._count;
            },
            enumerable: true,
            configurable: true
        });
        EventCounter.prototype.dispose = function () {
            this.listeners = lifecycle.dispose(this.listeners);
            this._count = -1;
        };
        return EventCounter;
    }());
    var SAMPLE = {
        ONE: { id: 'one' },
        AB: { id: 'ROOT', children: [
                { id: 'a', children: [
                        { id: 'aa' },
                        { id: 'ab' }
                    ] },
                { id: 'b' },
                { id: 'c', children: [
                        { id: 'ca' },
                        { id: 'cb' }
                    ] }
            ] },
        DEEP: { id: 'ROOT', children: [
                { id: 'a', children: [
                        { id: 'x', children: [
                                { id: 'xa' },
                                { id: 'xb' },
                            ] }
                    ] },
                { id: 'b' }
            ] },
        DEEP2: { id: 'ROOT', children: [
                { id: 'a', children: [
                        { id: 'x', children: [
                                { id: 'xa' },
                                { id: 'xb' },
                            ] },
                        { id: 'y' }
                    ] },
                { id: 'b' }
            ] }
    };
    var TestDataSource = (function () {
        function TestDataSource() {
        }
        TestDataSource.prototype.getId = function (tree, element) {
            return element.id;
        };
        TestDataSource.prototype.hasChildren = function (tree, element) {
            return !!element.children;
        };
        TestDataSource.prototype.getChildren = function (tree, element) {
            return WinJS.TPromise.as(element.children);
        };
        TestDataSource.prototype.getParent = function (tree, element) {
            throw new Error('Not implemented');
        };
        return TestDataSource;
    }());
    suite('TreeModel', function () {
        var model;
        var counter;
        setup(function () {
            counter = new EventCounter();
            model = new TreeModel({
                dataSource: new TestDataSource()
            });
        });
        teardown(function () {
            counter.dispose();
            model.dispose();
        });
        test('setInput, getInput', function () {
            model.setInput(SAMPLE.ONE);
            assert.equal(model.getInput(), SAMPLE.ONE);
        });
        test('refresh() refreshes all', function (done) {
            model.setInput(SAMPLE.AB).then(function () {
                counter.listen(model, 'refreshing'); // 1
                counter.listen(model, 'refreshed'); // 1
                counter.listen(model, 'item:refresh'); // 4
                counter.listen(model, 'item:childrenRefreshing'); // 1
                counter.listen(model, 'item:childrenRefreshed'); // 1
                return model.refresh(null);
            }).done(function () {
                assert.equal(counter.count, 8);
                done();
            });
        });
        test('refresh(root) refreshes all', function (done) {
            model.setInput(SAMPLE.AB).then(function () {
                counter.listen(model, 'refreshing'); // 1
                counter.listen(model, 'refreshed'); // 1
                counter.listen(model, 'item:refresh'); // 4
                counter.listen(model, 'item:childrenRefreshing'); // 1
                counter.listen(model, 'item:childrenRefreshed'); // 1
                return model.refresh(SAMPLE.AB);
            }).done(function () {
                assert.equal(counter.count, 8);
                done();
            });
        });
        test('refresh(root, false) refreshes the root', function (done) {
            model.setInput(SAMPLE.AB).then(function () {
                counter.listen(model, 'refreshing'); // 1
                counter.listen(model, 'refreshed'); // 1
                counter.listen(model, 'item:refresh'); // 1
                counter.listen(model, 'item:childrenRefreshing'); // 1
                counter.listen(model, 'item:childrenRefreshed'); // 1
                return model.refresh(SAMPLE.AB, false);
            }).done(function () {
                assert.equal(counter.count, 5);
                done();
            });
        });
        test('refresh(collapsed element) does not refresh descendants', function (done) {
            model.setInput(SAMPLE.AB).then(function () {
                counter.listen(model, 'refreshing'); // 1
                counter.listen(model, 'refreshed'); // 1
                counter.listen(model, 'item:refresh'); // 1
                counter.listen(model, 'item:childrenRefreshing'); // 0
                counter.listen(model, 'item:childrenRefreshed'); // 0
                return model.refresh(SAMPLE.AB.children[0]);
            }).done(function () {
                assert.equal(counter.count, 3);
                done();
            });
        });
        test('refresh(expanded element) refreshes the element and descendants', function (done) {
            model.setInput(SAMPLE.AB).then(function () {
                model.expand(SAMPLE.AB.children[0]);
                counter.listen(model, 'refreshing'); // 1
                counter.listen(model, 'refreshed'); // 1
                counter.listen(model, 'item:refresh'); // 3
                counter.listen(model, 'item:childrenRefreshing'); // 1
                counter.listen(model, 'item:childrenRefreshed'); // 1
                return model.refresh(SAMPLE.AB.children[0]);
            }).done(function () {
                assert.equal(counter.count, 7);
                done();
            });
        });
        test('refresh(element, false) refreshes the element', function (done) {
            model.setInput(SAMPLE.AB).then(function () {
                model.expand(SAMPLE.AB.children[0]);
                counter.listen(model, 'refreshing'); // 1
                counter.listen(model, 'refreshed'); // 1
                counter.listen(model, 'item:refresh', function (e) {
                    assert.equal(e.item.id, 'a');
                    counter.up();
                });
                counter.listen(model, 'item:childrenRefreshing'); // 1
                counter.listen(model, 'item:childrenRefreshed'); // 1
                return model.refresh(SAMPLE.AB.children[0], false);
            }).done(function () {
                assert.equal(counter.count, 6);
                done();
            });
        });
        test('refreshAll(...) refreshes the elements and descendants', function (done) {
            model.setInput(SAMPLE.AB).then(function () {
                model.expand(SAMPLE.AB.children[0]);
                model.expand(SAMPLE.AB.children[2]);
                counter.listen(model, 'refreshing'); // 3
                counter.listen(model, 'refreshed'); // 3
                counter.listen(model, 'item:refresh'); // 7
                counter.listen(model, 'item:childrenRefreshing'); // 2
                counter.listen(model, 'item:childrenRefreshed'); // 2
                return model.refreshAll([SAMPLE.AB.children[0], SAMPLE.AB.children[1], SAMPLE.AB.children[2]]);
            }).done(function () {
                assert.equal(counter.count, 17);
                done();
            });
        });
        test('refreshAll(..., false) refreshes the elements', function (done) {
            model.setInput(SAMPLE.AB).then(function () {
                model.expand(SAMPLE.AB.children[0]);
                model.expand(SAMPLE.AB.children[2]);
                counter.listen(model, 'refreshing'); // 3
                counter.listen(model, 'refreshed'); // 3
                counter.listen(model, 'item:refresh'); // 3
                counter.listen(model, 'item:childrenRefreshing'); // 2
                counter.listen(model, 'item:childrenRefreshed'); // 2
                return model.refreshAll([SAMPLE.AB.children[0], SAMPLE.AB.children[1], SAMPLE.AB.children[2]], false);
            }).done(function () {
                assert.equal(counter.count, 13);
                done();
            });
        });
        test('depths', function (done) {
            model.setInput(SAMPLE.AB).then(function () {
                model.expandAll(['a', 'c']);
                counter.listen(model, 'item:refresh', function (e) {
                    switch (e.item.id) {
                        case 'ROOT':
                            assert.equal(e.item.getDepth(), 0);
                            break;
                        case 'a':
                            assert.equal(e.item.getDepth(), 1);
                            break;
                        case 'aa':
                            assert.equal(e.item.getDepth(), 2);
                            break;
                        case 'ab':
                            assert.equal(e.item.getDepth(), 2);
                            break;
                        case 'b':
                            assert.equal(e.item.getDepth(), 1);
                            break;
                        case 'c':
                            assert.equal(e.item.getDepth(), 1);
                            break;
                        case 'ca':
                            assert.equal(e.item.getDepth(), 2);
                            break;
                        case 'cb':
                            assert.equal(e.item.getDepth(), 2);
                            break;
                        default: return;
                    }
                    counter.up();
                });
                return model.refresh();
            }).done(function () {
                assert.equal(counter.count, 16);
                done();
            });
        });
        test('intersections', function (done) {
            model.setInput(SAMPLE.AB).done(function () {
                model.expandAll(['a', 'c']);
                // going internals
                var r = model.registry;
                assert(r.getItem('a').intersects(r.getItem('a')));
                assert(r.getItem('a').intersects(r.getItem('aa')));
                assert(r.getItem('a').intersects(r.getItem('ab')));
                assert(r.getItem('aa').intersects(r.getItem('a')));
                assert(r.getItem('ab').intersects(r.getItem('a')));
                assert(!r.getItem('aa').intersects(r.getItem('ab')));
                assert(!r.getItem('a').intersects(r.getItem('b')));
                assert(!r.getItem('a').intersects(r.getItem('c')));
                assert(!r.getItem('a').intersects(r.getItem('ca')));
                assert(!r.getItem('aa').intersects(r.getItem('ca')));
                done();
            });
        });
    });
    suite('TreeModel - TreeNavigator', function () {
        var model;
        var counter;
        setup(function () {
            counter = new EventCounter();
            model = new TreeModel({
                dataSource: new TestDataSource()
            });
        });
        teardown(function () {
            counter.dispose();
            model.dispose();
        });
        test('next()', function (done) {
            model.setInput(SAMPLE.AB).done(function () {
                var nav = model.getNavigator();
                assert.equal(nav.next().id, 'a');
                assert.equal(nav.next().id, 'b');
                assert.equal(nav.next().id, 'c');
                assert.equal(nav.next() && false, null);
                done();
            });
        });
        test('previous()', function (done) {
            model.setInput(SAMPLE.AB).done(function () {
                var nav = model.getNavigator();
                nav.next();
                nav.next();
                assert.equal(nav.next().id, 'c');
                assert.equal(nav.previous().id, 'b');
                assert.equal(nav.previous().id, 'a');
                assert.equal(nav.previous() && false, null);
                done();
            });
        });
        test('parent()', function (done) {
            model.setInput(SAMPLE.AB).done(function () {
                model.expandAll([{ id: 'a' }, { id: 'c' }]).done(function () {
                    var nav = model.getNavigator();
                    assert.equal(nav.next().id, 'a');
                    assert.equal(nav.next().id, 'aa');
                    assert.equal(nav.parent().id, 'a');
                    assert.equal(nav.next().id, 'aa');
                    assert.equal(nav.next().id, 'ab');
                    assert.equal(nav.parent().id, 'a');
                    assert.equal(nav.next().id, 'aa');
                    assert.equal(nav.next().id, 'ab');
                    assert.equal(nav.next().id, 'b');
                    assert.equal(nav.next().id, 'c');
                    assert.equal(nav.next().id, 'ca');
                    assert.equal(nav.parent().id, 'c');
                    assert.equal(nav.parent() && false, null);
                    done();
                });
            });
        });
        test('next() - scoped', function (done) {
            model.setInput(SAMPLE.AB).done(function () {
                var nav = model.getNavigator(SAMPLE.AB.children[0]);
                model.expand({ id: 'a' }).done(function () {
                    assert.equal(nav.next().id, 'aa');
                    assert.equal(nav.next().id, 'ab');
                    assert.equal(nav.next() && false, null);
                    done();
                });
            });
        });
        test('previous() - scoped', function (done) {
            model.setInput(SAMPLE.AB).done(function () {
                var nav = model.getNavigator(SAMPLE.AB.children[0]);
                model.expand({ id: 'a' }).done(function () {
                    assert.equal(nav.next().id, 'aa');
                    assert.equal(nav.next().id, 'ab');
                    assert.equal(nav.previous().id, 'aa');
                    assert.equal(nav.previous() && false, null);
                    done();
                });
            });
        });
        test('parent() - scoped', function (done) {
            model.setInput(SAMPLE.AB).done(function () {
                model.expandAll([{ id: 'a' }, { id: 'c' }]).done(function () {
                    var nav = model.getNavigator(SAMPLE.AB.children[0]);
                    assert.equal(nav.next().id, 'aa');
                    assert.equal(nav.next().id, 'ab');
                    assert.equal(nav.parent() && false, null);
                    done();
                });
            });
        });
        test('next() - non sub tree only', function (done) {
            model.setInput(SAMPLE.AB).done(function () {
                var nav = model.getNavigator(SAMPLE.AB.children[0], false);
                model.expand({ id: 'a' }).done(function () {
                    assert.equal(nav.next().id, 'aa');
                    assert.equal(nav.next().id, 'ab');
                    assert.equal(nav.next().id, 'b');
                    assert.equal(nav.next().id, 'c');
                    assert.equal(nav.next() && false, null);
                    done();
                });
            });
        });
        test('previous() - non sub tree only', function (done) {
            model.setInput(SAMPLE.AB).done(function () {
                var nav = model.getNavigator(SAMPLE.AB.children[0], false);
                model.expand({ id: 'a' }).done(function () {
                    assert.equal(nav.next().id, 'aa');
                    assert.equal(nav.next().id, 'ab');
                    assert.equal(nav.next().id, 'b');
                    assert.equal(nav.next().id, 'c');
                    assert.equal(nav.previous().id, 'b');
                    assert.equal(nav.previous().id, 'ab');
                    assert.equal(nav.previous().id, 'aa');
                    assert.equal(nav.previous().id, 'a');
                    assert.equal(nav.previous() && false, null);
                    done();
                });
            });
        });
        test('parent() - non sub tree only', function (done) {
            model.setInput(SAMPLE.AB).done(function () {
                model.expandAll([{ id: 'a' }, { id: 'c' }]).done(function () {
                    var nav = model.getNavigator(SAMPLE.AB.children[0], false);
                    assert.equal(nav.next().id, 'aa');
                    assert.equal(nav.next().id, 'ab');
                    assert.equal(nav.parent().id, 'a');
                    assert.equal(nav.parent() && false, null);
                    done();
                });
            });
        });
        test('deep next() - scoped', function (done) {
            model.setInput(SAMPLE.DEEP).done(function () {
                model.expand(SAMPLE.DEEP.children[0]);
                model.expand(SAMPLE.DEEP.children[0].children[0]);
                var nav = model.getNavigator(SAMPLE.DEEP.children[0].children[0]);
                assert.equal(nav.next().id, 'xa');
                assert.equal(nav.next().id, 'xb');
                assert.equal(nav.next() && false, null);
                done();
            });
        });
        test('deep previous() - scoped', function (done) {
            model.setInput(SAMPLE.DEEP).done(function () {
                model.expand(SAMPLE.DEEP.children[0]);
                model.expand(SAMPLE.DEEP.children[0].children[0]);
                var nav = model.getNavigator(SAMPLE.DEEP.children[0].children[0]);
                assert.equal(nav.next().id, 'xa');
                assert.equal(nav.next().id, 'xb');
                assert.equal(nav.previous().id, 'xa');
                assert.equal(nav.previous() && false, null);
                done();
            });
        });
    });
    suite('TreeModel - Expansion', function () {
        var model;
        var counter;
        setup(function () {
            counter = new EventCounter();
            model = new TreeModel({
                dataSource: new TestDataSource()
            });
        });
        teardown(function () {
            counter.dispose();
            model.dispose();
        });
        test('collapse, expand', function (done) {
            model.setInput(SAMPLE.AB).done(function () {
                counter.listen(model, 'item:expanding', function (e) {
                    assert.equal(e.item.id, 'a');
                    var nav = model.getNavigator(e.item);
                    assert.equal(nav.next() && false, null);
                });
                counter.listen(model, 'item:expanded', function (e) {
                    assert.equal(e.item.id, 'a');
                    var nav = model.getNavigator(e.item);
                    assert.equal(nav.next().id, 'aa');
                    assert.equal(nav.next().id, 'ab');
                    assert.equal(nav.next() && false, null);
                });
                assert(!model.isExpanded(SAMPLE.AB.children[0]));
                var nav = model.getNavigator();
                assert.equal(nav.next().id, 'a');
                assert.equal(nav.next().id, 'b');
                assert.equal(nav.next().id, 'c');
                assert.equal(nav.next() && false, null);
                assert.equal(model.getExpandedElements().length, 0);
                model.expand(SAMPLE.AB.children[0]).done(function () {
                    assert(model.isExpanded(SAMPLE.AB.children[0]));
                    nav = model.getNavigator();
                    assert.equal(nav.next().id, 'a');
                    assert.equal(nav.next().id, 'aa');
                    assert.equal(nav.next().id, 'ab');
                    assert.equal(nav.next().id, 'b');
                    assert.equal(nav.next().id, 'c');
                    assert.equal(nav.next() && false, null);
                    var expandedElements = model.getExpandedElements();
                    assert.equal(expandedElements.length, 1);
                    assert.equal(expandedElements[0].id, 'a');
                    assert.equal(counter.count, 2);
                    done();
                });
            });
        });
        test('toggleExpansion', function (done) {
            model.setInput(SAMPLE.AB).done(function () {
                assert(!model.isExpanded(SAMPLE.AB.children[0]));
                model.toggleExpansion(SAMPLE.AB.children[0]).done(function () {
                    assert(model.isExpanded(SAMPLE.AB.children[0]));
                    assert(!model.isExpanded(SAMPLE.AB.children[0].children[0]));
                    model.toggleExpansion(SAMPLE.AB.children[0].children[0]).done(function () {
                        assert(!model.isExpanded(SAMPLE.AB.children[0].children[0]));
                        model.toggleExpansion(SAMPLE.AB.children[0]).done(function () {
                            assert(!model.isExpanded(SAMPLE.AB.children[0]));
                            done();
                        });
                    });
                });
            });
        });
        test('collapseAll', function (done) {
            model.setInput(SAMPLE.DEEP2).done(function () {
                model.expand(SAMPLE.DEEP2.children[0]).done(function () {
                    model.expand(SAMPLE.DEEP2.children[0].children[0]).done(function () {
                        assert(model.isExpanded(SAMPLE.DEEP2.children[0]));
                        assert(model.isExpanded(SAMPLE.DEEP2.children[0].children[0]));
                        model.collapseAll().done(function () {
                            assert(!model.isExpanded(SAMPLE.DEEP2.children[0]));
                            model.expand(SAMPLE.DEEP2.children[0]).done(function () {
                                assert(!model.isExpanded(SAMPLE.DEEP2.children[0].children[0]));
                                done();
                            });
                        });
                    });
                });
            });
        });
        test('auto expand single child folders', function (done) {
            model.setInput(SAMPLE.DEEP).done(function () {
                model.expand(SAMPLE.DEEP.children[0]).done(function () {
                    assert(model.isExpanded(SAMPLE.DEEP.children[0]));
                    assert(model.isExpanded(SAMPLE.DEEP.children[0].children[0]));
                    done();
                });
            });
        });
        test('expand can trigger refresh', function (done) {
            // MUnit.expect(16);
            model.setInput(SAMPLE.AB).done(function () {
                assert(!model.isExpanded(SAMPLE.AB.children[0]));
                var nav = model.getNavigator();
                assert.equal(nav.next().id, 'a');
                assert.equal(nav.next().id, 'b');
                assert.equal(nav.next().id, 'c');
                assert.equal(nav.next() && false, null);
                var f = counter.listen(model, 'item:childrenRefreshing', function (e) {
                    assert.equal(e.item.id, 'a');
                    f();
                });
                var g = counter.listen(model, 'item:childrenRefreshed', function (e) {
                    assert.equal(e.item.id, 'a');
                    g();
                });
                model.expand(SAMPLE.AB.children[0]).done(function () {
                    assert(model.isExpanded(SAMPLE.AB.children[0]));
                    nav = model.getNavigator();
                    assert.equal(nav.next().id, 'a');
                    assert.equal(nav.next().id, 'aa');
                    assert.equal(nav.next().id, 'ab');
                    assert.equal(nav.next().id, 'b');
                    assert.equal(nav.next().id, 'c');
                    assert.equal(nav.next() && false, null);
                    assert.equal(counter.count, 2);
                    done();
                });
            });
        });
        test('top level collapsed', function (done) {
            model.setInput(SAMPLE.AB).done(function () {
                model.collapseAll([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
                var nav = model.getNavigator();
                assert.equal(nav.next().id, 'a');
                assert.equal(nav.next().id, 'b');
                assert.equal(nav.next().id, 'c');
                assert.equal(nav.previous().id, 'b');
                assert.equal(nav.previous().id, 'a');
                assert.equal(nav.previous() && false, null);
                done();
            });
        });
    });
    var TestFilter = (function () {
        function TestFilter() {
            this.fn = function () { return true; };
        }
        TestFilter.prototype.isVisible = function (tree, element) {
            return this.fn(element);
        };
        return TestFilter;
    }());
    suite('TreeModel - Filter', function () {
        var model;
        var counter;
        var filter;
        setup(function () {
            counter = new EventCounter();
            filter = new TestFilter();
            model = new TreeModel({
                dataSource: new TestDataSource(),
                filter: filter
            });
        });
        teardown(function () {
            counter.dispose();
            model.dispose();
        });
        test('no filter', function (done) {
            model.setInput(SAMPLE.AB).done(function () {
                model.expandAll([{ id: 'a' }, { id: 'c' }]).done(function () {
                    var nav = model.getNavigator();
                    assert.equal(nav.next().id, 'a');
                    assert.equal(nav.next().id, 'aa');
                    assert.equal(nav.next().id, 'ab');
                    assert.equal(nav.next().id, 'b');
                    assert.equal(nav.next().id, 'c');
                    assert.equal(nav.next().id, 'ca');
                    assert.equal(nav.next().id, 'cb');
                    assert.equal(nav.previous().id, 'ca');
                    assert.equal(nav.previous().id, 'c');
                    assert.equal(nav.previous().id, 'b');
                    assert.equal(nav.previous().id, 'ab');
                    assert.equal(nav.previous().id, 'aa');
                    assert.equal(nav.previous().id, 'a');
                    assert.equal(nav.previous() && false, null);
                    done();
                });
            });
        });
        test('filter all', function (done) {
            filter.fn = function () { return false; };
            model.setInput(SAMPLE.AB).done(function () {
                model.refresh();
                var nav = model.getNavigator();
                assert.equal(nav.next() && false, null);
                done();
            });
        });
        test('simple filter', function (done) {
            // hide elements that do not start with 'a'
            filter.fn = function (e) { return e.id[0] === 'a'; };
            model.setInput(SAMPLE.AB).done(function () {
                model.expand({ id: 'a' }).done(function () {
                    var nav = model.getNavigator();
                    assert.equal(nav.next().id, 'a');
                    assert.equal(nav.next().id, 'aa');
                    assert.equal(nav.next().id, 'ab');
                    assert.equal(nav.previous().id, 'aa');
                    assert.equal(nav.previous().id, 'a');
                    assert.equal(nav.previous() && false, null);
                    done();
                });
            });
        });
        test('simple filter 2', function (done) {
            // hide 'ab'
            filter.fn = function (e) { return e.id !== 'ab'; };
            model.setInput(SAMPLE.AB).done(function () {
                model.expand({ id: 'a' }).done(function () {
                    var nav = model.getNavigator();
                    assert.equal(nav.next().id, 'a');
                    assert.equal(nav.next().id, 'aa');
                    assert.equal(nav.next().id, 'b');
                    assert.equal(nav.next().id, 'c');
                    assert.equal(nav.next() && false, null);
                    done();
                });
            });
        });
        test('simple filter, opposite', function (done) {
            // hide elements that start with 'a'
            filter.fn = function (e) { return e.id[0] !== 'a'; };
            model.setInput(SAMPLE.AB).done(function () {
                model.expand({ id: 'c' }).done(function () {
                    var nav = model.getNavigator();
                    assert.equal(nav.next().id, 'b');
                    assert.equal(nav.next().id, 'c');
                    assert.equal(nav.next().id, 'ca');
                    assert.equal(nav.next().id, 'cb');
                    assert.equal(nav.previous().id, 'ca');
                    assert.equal(nav.previous().id, 'c');
                    assert.equal(nav.previous().id, 'b');
                    assert.equal(nav.previous() && false, null);
                    done();
                });
            });
        });
        test('simple filter, mischieving', function (done) {
            // hide the element 'a'
            filter.fn = function (e) { return e.id !== 'a'; };
            model.setInput(SAMPLE.AB).done(function () {
                model.expand({ id: 'c' }).done(function () {
                    var nav = model.getNavigator();
                    assert.equal(nav.next().id, 'b');
                    assert.equal(nav.next().id, 'c');
                    assert.equal(nav.next().id, 'ca');
                    assert.equal(nav.next().id, 'cb');
                    assert.equal(nav.previous().id, 'ca');
                    assert.equal(nav.previous().id, 'c');
                    assert.equal(nav.previous().id, 'b');
                    assert.equal(nav.previous() && false, null);
                    done();
                });
            });
        });
        test('simple filter & previous', function (done) {
            // hide 'b'
            filter.fn = function (e) { return e.id !== 'b'; };
            model.setInput(SAMPLE.AB).done(function () {
                var nav = model.getNavigator({ id: 'c' }, false);
                assert.equal(nav.previous().id, 'a');
                assert.equal(nav.previous() && false, null);
                done();
            });
        });
    });
    suite('TreeModel - Traits', function () {
        var model;
        var counter;
        setup(function () {
            counter = new EventCounter();
            model = new TreeModel({
                dataSource: new TestDataSource()
            });
        });
        teardown(function () {
            counter.dispose();
            model.dispose();
        });
        test('Selection', function (done) {
            model.setInput(SAMPLE.AB).done(function () {
                assert.equal(model.getSelection().length, 0);
                model.select(SAMPLE.AB.children[1]);
                assert(model.isSelected(SAMPLE.AB.children[1]));
                assert.equal(model.getSelection().length, 1);
                model.select(SAMPLE.AB.children[0]);
                assert(model.isSelected(SAMPLE.AB.children[0]));
                assert.equal(model.getSelection().length, 2);
                model.select(SAMPLE.AB.children[2]);
                assert(model.isSelected(SAMPLE.AB.children[2]));
                assert.equal(model.getSelection().length, 3);
                model.deselect(SAMPLE.AB.children[0]);
                assert(!model.isSelected(SAMPLE.AB.children[0]));
                assert.equal(model.getSelection().length, 2);
                model.setSelection([]);
                assert(!model.isSelected(SAMPLE.AB.children[0]));
                assert(!model.isSelected(SAMPLE.AB.children[1]));
                assert(!model.isSelected(SAMPLE.AB.children[2]));
                assert.equal(model.getSelection().length, 0);
                model.selectAll([SAMPLE.AB.children[0], SAMPLE.AB.children[1], SAMPLE.AB.children[2]]);
                assert.equal(model.getSelection().length, 3);
                model.select(SAMPLE.AB.children[0]);
                assert.equal(model.getSelection().length, 3);
                model.deselectAll([SAMPLE.AB.children[0], SAMPLE.AB.children[1], SAMPLE.AB.children[2]]);
                assert.equal(model.getSelection().length, 0);
                model.deselect(SAMPLE.AB.children[0]);
                assert.equal(model.getSelection().length, 0);
                model.setSelection([SAMPLE.AB.children[0]]);
                assert.equal(model.getSelection().length, 1);
                assert(model.isSelected(SAMPLE.AB.children[0]));
                assert(!model.isSelected(SAMPLE.AB.children[1]));
                assert(!model.isSelected(SAMPLE.AB.children[2]));
                model.setSelection([SAMPLE.AB.children[0], SAMPLE.AB.children[1], SAMPLE.AB.children[2]]);
                assert.equal(model.getSelection().length, 3);
                assert(model.isSelected(SAMPLE.AB.children[0]));
                assert(model.isSelected(SAMPLE.AB.children[1]));
                assert(model.isSelected(SAMPLE.AB.children[2]));
                model.setSelection([SAMPLE.AB.children[1], SAMPLE.AB.children[2]]);
                assert.equal(model.getSelection().length, 2);
                assert(!model.isSelected(SAMPLE.AB.children[0]));
                assert(model.isSelected(SAMPLE.AB.children[1]));
                assert(model.isSelected(SAMPLE.AB.children[2]));
                model.setSelection([]);
                assert.deepEqual(model.getSelection(), []);
                assert.equal(model.getSelection().length, 0);
                assert(!model.isSelected(SAMPLE.AB.children[0]));
                assert(!model.isSelected(SAMPLE.AB.children[1]));
                assert(!model.isSelected(SAMPLE.AB.children[2]));
                model.selectNext();
                assert.equal(model.getSelection().length, 1);
                assert(model.isSelected(SAMPLE.AB.children[0]));
                model.selectNext();
                assert.equal(model.getSelection().length, 1);
                assert(model.isSelected(SAMPLE.AB.children[1]));
                model.selectNext();
                assert.equal(model.getSelection().length, 1);
                assert(model.isSelected(SAMPLE.AB.children[2]));
                model.selectNext();
                assert.equal(model.getSelection().length, 1);
                assert(model.isSelected(SAMPLE.AB.children[2]));
                model.selectPrevious();
                assert.equal(model.getSelection().length, 1);
                assert(model.isSelected(SAMPLE.AB.children[1]));
                model.selectPrevious();
                assert.equal(model.getSelection().length, 1);
                assert(model.isSelected(SAMPLE.AB.children[0]));
                model.selectPrevious();
                assert.equal(model.getSelection().length, 1);
                assert(model.isSelected(SAMPLE.AB.children[0]));
                model.selectNext(2);
                assert.equal(model.getSelection().length, 1);
                assert(model.isSelected(SAMPLE.AB.children[2]));
                model.selectPrevious(4);
                assert.equal(model.getSelection().length, 1);
                assert(model.isSelected(SAMPLE.AB.children[0]));
                assert.equal(model.isSelected(SAMPLE.AB.children[0]), true);
                assert.equal(model.isSelected(SAMPLE.AB.children[2]), false);
                done();
            });
        });
        test('Focus', function (done) {
            model.setInput(SAMPLE.AB).done(function () {
                assert(!model.getFocus());
                model.setFocus(SAMPLE.AB.children[1]);
                assert(model.isFocused(SAMPLE.AB.children[1]));
                assert(model.getFocus());
                model.setFocus(SAMPLE.AB.children[0]);
                assert(model.isFocused(SAMPLE.AB.children[0]));
                assert(model.getFocus());
                model.setFocus(SAMPLE.AB.children[2]);
                assert(model.isFocused(SAMPLE.AB.children[2]));
                assert(model.getFocus());
                model.setFocus();
                assert(!model.isFocused(SAMPLE.AB.children[0]));
                assert(!model.isFocused(SAMPLE.AB.children[1]));
                assert(!model.isFocused(SAMPLE.AB.children[2]));
                assert(!model.getFocus());
                model.setFocus(SAMPLE.AB.children[0]);
                assert(model.getFocus());
                assert(model.isFocused(SAMPLE.AB.children[0]));
                assert(!model.isFocused(SAMPLE.AB.children[1]));
                assert(!model.isFocused(SAMPLE.AB.children[2]));
                model.setFocus();
                assert(!model.getFocus());
                assert(!model.isFocused(SAMPLE.AB.children[0]));
                assert(!model.isFocused(SAMPLE.AB.children[1]));
                assert(!model.isFocused(SAMPLE.AB.children[2]));
                model.focusNext();
                assert(model.getFocus());
                assert(model.isFocused(SAMPLE.AB.children[0]));
                model.focusNext();
                assert(model.getFocus());
                assert(model.isFocused(SAMPLE.AB.children[1]));
                model.focusNext();
                assert(model.getFocus());
                assert(model.isFocused(SAMPLE.AB.children[2]));
                model.focusNext();
                assert(model.getFocus());
                assert(model.isFocused(SAMPLE.AB.children[2]));
                model.focusPrevious();
                assert(model.getFocus());
                assert(model.isFocused(SAMPLE.AB.children[1]));
                model.focusPrevious();
                assert(model.getFocus());
                assert(model.isFocused(SAMPLE.AB.children[0]));
                model.focusPrevious();
                assert(model.getFocus());
                assert(model.isFocused(SAMPLE.AB.children[0]));
                model.focusNext(2);
                assert(model.getFocus());
                assert(model.isFocused(SAMPLE.AB.children[2]));
                model.focusPrevious(4);
                assert(model.getFocus());
                assert(model.isFocused(SAMPLE.AB.children[0]));
                assert.equal(model.isFocused(SAMPLE.AB.children[0]), true);
                assert.equal(model.isFocused(SAMPLE.AB.children[2]), false);
                model.focusFirst();
                assert(model.isFocused(SAMPLE.AB.children[0]));
                model.focusNth(0);
                assert(model.isFocused(SAMPLE.AB.children[0]));
                model.focusNth(1);
                assert(model.isFocused(SAMPLE.AB.children[1]));
                done();
            });
        });
        test('Highlight', function (done) {
            model.setInput(SAMPLE.AB).done(function () {
                assert(!model.getHighlight());
                model.setHighlight(SAMPLE.AB.children[1]);
                assert(model.isHighlighted(SAMPLE.AB.children[1]));
                assert(model.getHighlight());
                model.setHighlight(SAMPLE.AB.children[0]);
                assert(model.isHighlighted(SAMPLE.AB.children[0]));
                assert(model.getHighlight());
                model.setHighlight(SAMPLE.AB.children[2]);
                assert(model.isHighlighted(SAMPLE.AB.children[2]));
                assert(model.getHighlight());
                model.setHighlight();
                assert(!model.isHighlighted(SAMPLE.AB.children[0]));
                assert(!model.isHighlighted(SAMPLE.AB.children[1]));
                assert(!model.isHighlighted(SAMPLE.AB.children[2]));
                assert(!model.getHighlight());
                model.setHighlight(SAMPLE.AB.children[0]);
                assert(model.getHighlight());
                assert(model.isHighlighted(SAMPLE.AB.children[0]));
                assert(!model.isHighlighted(SAMPLE.AB.children[1]));
                assert(!model.isHighlighted(SAMPLE.AB.children[2]));
                assert.equal(model.isHighlighted(SAMPLE.AB.children[0]), true);
                assert.equal(model.isHighlighted(SAMPLE.AB.children[2]), false);
                model.setHighlight();
                assert(!model.getHighlight());
                assert(!model.isHighlighted(SAMPLE.AB.children[0]));
                assert(!model.isHighlighted(SAMPLE.AB.children[1]));
                assert(!model.isHighlighted(SAMPLE.AB.children[2]));
                done();
            });
        });
    });
    var DynamicModel = (function (_super) {
        __extends(DynamicModel, _super);
        function DynamicModel() {
            _super.call(this);
            this.data = { root: [] };
            this.promiseFactory = null;
        }
        DynamicModel.prototype.addChild = function (parent, child) {
            if (!this.data[parent]) {
                this.data[parent] = [];
            }
            this.data[parent].push(child);
        };
        DynamicModel.prototype.removeChild = function (parent, child) {
            this.data[parent].splice(this.data[parent].indexOf(child), 1);
            if (this.data[parent].length === 0) {
                delete this.data[parent];
            }
        };
        DynamicModel.prototype.move = function (element, oldParent, newParent) {
            this.removeChild(oldParent, element);
            this.addChild(newParent, element);
        };
        DynamicModel.prototype.rename = function (parent, oldName, newName) {
            this.removeChild(parent, oldName);
            this.addChild(parent, newName);
        };
        DynamicModel.prototype.getId = function (tree, element) {
            return element;
        };
        DynamicModel.prototype.hasChildren = function (tree, element) {
            return !!this.data[element];
        };
        DynamicModel.prototype.getChildren = function (tree, element) {
            var _this = this;
            this.emit('getChildren', element);
            var result = this.promiseFactory ? this.promiseFactory() : WinJS.TPromise.as(null);
            return result.then(function () {
                _this.emit('gotChildren', element);
                return WinJS.TPromise.as(_this.data[element]);
            });
        };
        DynamicModel.prototype.getParent = function (tree, element) {
            throw new Error('Not implemented');
        };
        return DynamicModel;
    }(Events.EventEmitter));
    suite('TreeModel - Dynamic data model', function () {
        var model;
        var dataModel;
        var counter;
        setup(function () {
            counter = new EventCounter();
            dataModel = new DynamicModel();
            model = new TreeModel({
                dataSource: dataModel,
            });
        });
        teardown(function () {
            counter.dispose();
            model.dispose();
        });
        test('items get property disposed', function (done) {
            dataModel.addChild('root', 'grandfather');
            dataModel.addChild('grandfather', 'father');
            dataModel.addChild('father', 'son');
            dataModel.addChild('father', 'daughter');
            dataModel.addChild('son', 'baby');
            model.setInput('root').done(function () {
                model.expandAll(['grandfather', 'father', 'son']).done(function () {
                    dataModel.removeChild('grandfather', 'father');
                    var items = ['baby', 'son', 'daughter', 'father'];
                    var times = 0;
                    counter.listen(model, 'item:dispose', function (e) {
                        assert.equal(items[times++], e.item.id);
                    });
                    model.refresh().done(function () {
                        assert.equal(times, items.length);
                        assert.equal(counter.count, 4);
                        done();
                    });
                });
            });
        });
        test('addChild, removeChild, collapse', function (done) {
            dataModel.addChild('root', 'super');
            dataModel.addChild('root', 'hyper');
            dataModel.addChild('root', 'mega');
            model.setInput('root').done(function () {
                var nav = model.getNavigator();
                assert.equal(nav.next().id, 'super');
                assert.equal(nav.next().id, 'hyper');
                assert.equal(nav.next().id, 'mega');
                assert.equal(nav.next() && false, null);
                dataModel.removeChild('root', 'hyper');
                model.refresh().done(function () {
                    nav = model.getNavigator();
                    assert.equal(nav.next().id, 'super');
                    assert.equal(nav.next().id, 'mega');
                    assert.equal(nav.next() && false, null);
                    dataModel.addChild('mega', 'micro');
                    dataModel.addChild('mega', 'nano');
                    dataModel.addChild('mega', 'pico');
                    model.refresh().done(function () {
                        model.expand('mega').done(function () {
                            nav = model.getNavigator();
                            assert.equal(nav.next().id, 'super');
                            assert.equal(nav.next().id, 'mega');
                            assert.equal(nav.next().id, 'micro');
                            assert.equal(nav.next().id, 'nano');
                            assert.equal(nav.next().id, 'pico');
                            assert.equal(nav.next() && false, null);
                            model.collapse('mega');
                            nav = model.getNavigator();
                            assert.equal(nav.next().id, 'super');
                            assert.equal(nav.next().id, 'mega');
                            assert.equal(nav.next() && false, null);
                            done();
                        });
                    });
                });
            });
        });
        test('move', function (done) {
            dataModel.addChild('root', 'super');
            dataModel.addChild('super', 'apples');
            dataModel.addChild('super', 'bananas');
            dataModel.addChild('super', 'pears');
            dataModel.addChild('root', 'hyper');
            dataModel.addChild('root', 'mega');
            model.setInput('root').done(function () {
                model.expand('super').done(function () {
                    var nav = model.getNavigator();
                    assert.equal(nav.next().id, 'super');
                    assert.equal(nav.next().id, 'apples');
                    assert.equal(nav.next().id, 'bananas');
                    assert.equal(nav.next().id, 'pears');
                    assert.equal(nav.next().id, 'hyper');
                    assert.equal(nav.next().id, 'mega');
                    assert.equal(nav.next() && false, null);
                    dataModel.move('bananas', 'super', 'hyper');
                    dataModel.move('apples', 'super', 'mega');
                    model.refresh().done(function () {
                        model.expandAll(['hyper', 'mega']).done(function () {
                            nav = model.getNavigator();
                            assert.equal(nav.next().id, 'super');
                            assert.equal(nav.next().id, 'pears');
                            assert.equal(nav.next().id, 'hyper');
                            assert.equal(nav.next().id, 'bananas');
                            assert.equal(nav.next().id, 'mega');
                            assert.equal(nav.next().id, 'apples');
                            assert.equal(nav.next() && false, null);
                            done();
                        });
                    });
                });
            });
        });
        test('refreshing grandfather recursively should not refresh collapsed father\'s children immediately', function (done) {
            dataModel.addChild('root', 'grandfather');
            dataModel.addChild('grandfather', 'father');
            dataModel.addChild('father', 'son');
            model.setInput('root').done(function () {
                model.expand('grandfather');
                model.collapse('father');
                var times = 0;
                var listener = dataModel.addListener('getChildren', function (element) {
                    times++;
                    assert.equal(element, 'grandfather');
                });
                model.refresh('grandfather').done(function () {
                    assert.equal(times, 1);
                    listener();
                    listener = dataModel.addListener('getChildren', function (element) {
                        times++;
                        assert.equal(element, 'father');
                    });
                    model.expand('father').done(function () {
                        assert.equal(times, 2);
                        listener();
                        done();
                    });
                });
            });
        });
        test('simultaneously refreshing two disjoint elements should parallelize the refreshes', function (done) {
            dataModel.addChild('root', 'father');
            dataModel.addChild('root', 'mother');
            dataModel.addChild('father', 'son');
            dataModel.addChild('mother', 'daughter');
            model.setInput('root').done(function () {
                model.expand('father');
                model.expand('mother');
                var nav = model.getNavigator();
                assert.equal(nav.next().id, 'father');
                assert.equal(nav.next().id, 'son');
                assert.equal(nav.next().id, 'mother');
                assert.equal(nav.next().id, 'daughter');
                assert.equal(nav.next() && false, null);
                dataModel.removeChild('father', 'son');
                dataModel.removeChild('mother', 'daughter');
                dataModel.addChild('father', 'brother');
                dataModel.addChild('mother', 'sister');
                dataModel.promiseFactory = function () { return WinJS.TPromise.timeout(0); };
                var getTimes = 0;
                var gotTimes = 0;
                var getListener = dataModel.addListener('getChildren', function (element) { getTimes++; });
                var gotListener = dataModel.addListener('gotChildren', function (element) { gotTimes++; });
                var p1 = model.refresh('father');
                assert.equal(getTimes, 1);
                assert.equal(gotTimes, 0);
                var p2 = model.refresh('mother');
                assert.equal(getTimes, 2);
                assert.equal(gotTimes, 0);
                WinJS.Promise.join([p1, p2]).done(function () {
                    assert.equal(getTimes, 2);
                    assert.equal(gotTimes, 2);
                    nav = model.getNavigator();
                    assert.equal(nav.next().id, 'father');
                    assert.equal(nav.next().id, 'brother');
                    assert.equal(nav.next().id, 'mother');
                    assert.equal(nav.next().id, 'sister');
                    assert.equal(nav.next() && false, null);
                    getListener();
                    gotListener();
                    done();
                });
            });
        });
        test('simultaneously recursively refreshing two intersecting elements should concatenate the refreshes - ancestor first', function (done) {
            dataModel.addChild('root', 'grandfather');
            dataModel.addChild('grandfather', 'father');
            dataModel.addChild('father', 'son');
            model.setInput('root').done(function () {
                model.expand('grandfather');
                model.expand('father');
                var nav = model.getNavigator();
                assert.equal(nav.next().id, 'grandfather');
                assert.equal(nav.next().id, 'father');
                assert.equal(nav.next().id, 'son');
                assert.equal(nav.next() && false, null);
                var refreshTimes = 0;
                counter.listen(model, 'item:refresh', function (e) { refreshTimes++; });
                var getTimes = 0;
                var getListener = dataModel.addListener('getChildren', function (element) { getTimes++; });
                var gotTimes = 0;
                var gotListener = dataModel.addListener('gotChildren', function (element) { gotTimes++; });
                var p1, p2;
                var p1Completes = [];
                dataModel.promiseFactory = function () { return new WinJS.Promise(function (c) { p1Completes.push(c); }); };
                p1 = model.refresh('grandfather');
                // just a single get
                assert.equal(refreshTimes, 1); // (+1) grandfather
                assert.equal(getTimes, 1);
                assert.equal(gotTimes, 0);
                // unblock the first get
                p1Completes.shift()();
                // once the first get is unblocked, the second get should appear
                assert.equal(refreshTimes, 2); // (+1) first father refresh
                assert.equal(getTimes, 2);
                assert.equal(gotTimes, 1);
                var p2Complete;
                dataModel.promiseFactory = function () { return new WinJS.Promise(function (c) { p2Complete = c; }); };
                p2 = model.refresh('father');
                // same situation still
                assert.equal(refreshTimes, 3); // (+1) second father refresh
                assert.equal(getTimes, 2);
                assert.equal(gotTimes, 1);
                // unblock the second get
                p1Completes.shift()();
                // the third get should have appeared, it should've been waiting for the second one
                assert.equal(refreshTimes, 4); // (+1) first son request
                assert.equal(getTimes, 3);
                assert.equal(gotTimes, 2);
                p2Complete();
                // all good
                assert.equal(refreshTimes, 5); // (+1) second son request
                assert.equal(getTimes, 3);
                assert.equal(gotTimes, 3);
                p2.done(function () {
                    nav = model.getNavigator();
                    assert.equal(nav.next().id, 'grandfather');
                    assert.equal(nav.next().id, 'father');
                    assert.equal(nav.next().id, 'son');
                    assert.equal(nav.next() && false, null);
                    getListener();
                    gotListener();
                    done();
                });
            });
        });
        test('simultaneously recursively refreshing two intersecting elements should concatenate the refreshes - ancestor second', function (done) {
            dataModel.addChild('root', 'grandfather');
            dataModel.addChild('grandfather', 'father');
            dataModel.addChild('father', 'son');
            model.setInput('root').done(function () {
                model.expand('grandfather');
                model.expand('father');
                var nav = model.getNavigator();
                assert.equal(nav.next().id, 'grandfather');
                assert.equal(nav.next().id, 'father');
                assert.equal(nav.next().id, 'son');
                assert.equal(nav.next() && false, null);
                var getTimes = 0;
                var gotTimes = 0;
                var getListener = dataModel.addListener('getChildren', function (element) { getTimes++; });
                var gotListener = dataModel.addListener('gotChildren', function (element) { gotTimes++; });
                var p1, p2;
                var p1Complete;
                dataModel.promiseFactory = function () { return new WinJS.Promise(function (c) { p1Complete = c; }); };
                p1 = model.refresh('father');
                assert.equal(getTimes, 1);
                assert.equal(gotTimes, 0);
                var p2Completes = [];
                dataModel.promiseFactory = function () { return new WinJS.Promise(function (c) { p2Completes.push(c); }); };
                p2 = model.refresh('grandfather');
                assert.equal(getTimes, 1);
                assert.equal(gotTimes, 0);
                p1Complete();
                assert.equal(getTimes, 2);
                assert.equal(gotTimes, 1);
                p2Completes.shift()();
                assert.equal(getTimes, 3);
                assert.equal(gotTimes, 2);
                p2Completes.shift()();
                assert.equal(getTimes, 3);
                assert.equal(gotTimes, 3);
                p2.done(function () {
                    nav = model.getNavigator();
                    assert.equal(nav.next().id, 'grandfather');
                    assert.equal(nav.next().id, 'father');
                    assert.equal(nav.next().id, 'son');
                    assert.equal(nav.next() && false, null);
                    getListener();
                    gotListener();
                    done();
                });
            });
        });
        test('refreshing an empty element that adds children should still keep it collapsed', function (done) {
            dataModel.addChild('root', 'grandfather');
            dataModel.addChild('grandfather', 'father');
            model.setInput('root').done(function () {
                model.expand('grandfather');
                model.expand('father');
                assert(!model.isExpanded('father'));
                dataModel.addChild('father', 'son');
                model.refresh('father').done(function () {
                    assert(!model.isExpanded('father'));
                    done();
                });
            });
        });
        test('refreshing a collapsed element that adds children should still keep it collapsed', function (done) {
            dataModel.addChild('root', 'grandfather');
            dataModel.addChild('grandfather', 'father');
            dataModel.addChild('father', 'son');
            model.setInput('root').done(function () {
                model.expand('grandfather');
                model.expand('father');
                model.collapse('father');
                assert(!model.isExpanded('father'));
                dataModel.addChild('father', 'daughter');
                model.refresh('father').done(function () {
                    assert(!model.isExpanded('father'));
                    done();
                });
            });
        });
        test('recursively refreshing an ancestor of an expanded element, should keep that element expanded', function (done) {
            dataModel.addChild('root', 'grandfather');
            dataModel.addChild('grandfather', 'father');
            dataModel.addChild('father', 'son');
            model.setInput('root').done(function () {
                model.expand('grandfather');
                model.expand('father');
                assert(model.isExpanded('grandfather'));
                assert(model.isExpanded('father'));
                model.refresh('grandfather').done(function () {
                    assert(model.isExpanded('grandfather'));
                    assert(model.isExpanded('father'));
                    done();
                });
            });
        });
        test('recursively refreshing an ancestor of a collapsed element, should keep that element collapsed', function (done) {
            dataModel.addChild('root', 'grandfather');
            dataModel.addChild('grandfather', 'father');
            dataModel.addChild('father', 'son');
            model.setInput('root').done(function () {
                model.expand('grandfather');
                model.expand('father');
                model.collapse('father');
                assert(model.isExpanded('grandfather'));
                assert(!model.isExpanded('father'));
                model.refresh('grandfather').done(function () {
                    assert(model.isExpanded('grandfather'));
                    assert(!model.isExpanded('father'));
                    done();
                });
            });
        });
        test('Bug 10855:[explorer] quickly deleting things causes NPE in tree - intersectsLock should always be called when trying to unlock', function (done) {
            dataModel.addChild('root', 'father');
            dataModel.addChild('father', 'son');
            dataModel.addChild('root', 'mother');
            dataModel.addChild('mother', 'daughter');
            model.setInput('root').then(function () {
                // delay expansions and refreshes
                dataModel.promiseFactory = function () { return WinJS.TPromise.timeout(0); };
                var promises = [];
                promises.push(model.expand('father'));
                dataModel.removeChild('root', 'father');
                promises.push(model.refresh('root'));
                promises.push(model.expand('mother'));
                dataModel.removeChild('root', 'mother');
                promises.push(model.refresh('root'));
                return WinJS.Promise.join(promises).then(function () {
                    assert(true, 'all good');
                }, function (errs) {
                    assert(false, 'should not fail');
                });
            }).done(done);
        });
    });
    suite('TreeModel - bugs', function () {
        var counter;
        setup(function () {
            counter = new EventCounter();
        });
        teardown(function () {
            counter.dispose();
        });
        /**
         * This bug occurs when an item is expanded right during its removal
         */
        test('Bug 10566:[tree] build viewlet is broken after some time', function (done) {
            // setup
            var model = new TreeModel({
                dataSource: {
                    getId: function (_, e) { return e; },
                    hasChildren: function (_, e) { return e === 'root' || e === 'bart'; },
                    getChildren: function (_, e) {
                        if (e === 'root') {
                            return getRootChildren();
                        }
                        if (e === 'bart') {
                            return getBartChildren();
                        }
                        return WinJS.TPromise.as([]);
                    },
                    getParent: function (_, e) { throw new Error('not implemented'); },
                }
            });
            var listeners = [];
            // helpers
            var getGetRootChildren = function (children, timeout) {
                if (timeout === void 0) { timeout = 0; }
                return function () { return WinJS.TPromise.timeout(timeout).then(function () { return children; }); };
            };
            var getRootChildren = getGetRootChildren(['homer', 'bart', 'lisa', 'marge', 'maggie'], 0);
            var getGetBartChildren = function (timeout) {
                if (timeout === void 0) { timeout = 0; }
                return function () { return WinJS.TPromise.timeout(timeout).then(function () { return ['milhouse', 'nelson']; }); };
            };
            var getBartChildren = getGetBartChildren(0);
            // item expanding should not exist!
            counter.listen(model, 'item:expanding', function () { assert(false, 'should never receive item:expanding event'); });
            counter.listen(model, 'item:expanded', function () { assert(false, 'should never receive item:expanded event'); });
            model.setInput('root').then(function () {
                // remove bart
                getRootChildren = getGetRootChildren(['homer', 'lisa', 'marge', 'maggie'], 10);
                // refresh root
                var p1 = model.refresh('root', true).then(function () {
                    assert(true);
                }, function () {
                    assert(false, 'should never reach this');
                });
                // at the same time, try to expand bart!
                var p2 = model.expand('bart').then(function () {
                    assert(false, 'should never reach this');
                }, function () {
                    assert(true, 'bart should fail to expand since he was removed meanwhile');
                });
                // what now?
                return WinJS.Promise.join([p1, p2]);
            }).done(function () {
                // teardown
                while (listeners.length > 0) {
                    listeners.pop()();
                }
                ;
                listeners = null;
                model.dispose();
                model = null;
                assert.equal(counter.count, 0);
                done();
            });
        });
    });
});
//# sourceMappingURL=treeModel.test.js.map