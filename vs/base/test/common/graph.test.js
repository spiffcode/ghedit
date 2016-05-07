define(["require", "exports", 'assert', 'vs/base/common/graph'], function (require, exports, assert, graph_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('Graph', function () {
        var graph;
        setup(function () {
            graph = new graph_1.Graph(function (s) { return s; });
        });
        test('cannot be traversed when empty', function () {
            graph.traverse('foo', true, function () { return assert(false); });
            graph.traverse('foo', false, function () { return assert(false); });
            assert(true);
        });
        test('is possible to lookup nodes that don\'t exist', function () {
            assert.deepEqual(graph.lookup('ddd'), null);
        });
        test('inserts nodes when not there yet', function () {
            assert.deepEqual(graph.lookup('ddd'), null);
            assert.deepEqual(graph.lookupOrInsertNode('ddd').data, 'ddd');
            assert.deepEqual(graph.lookup('ddd').data, 'ddd');
        });
        test('can remove nodes and get length', function () {
            assert.equal(graph.length, 0);
            assert.deepEqual(graph.lookup('ddd'), null);
            assert.deepEqual(graph.lookupOrInsertNode('ddd').data, 'ddd');
            assert.equal(graph.length, 1);
            graph.removeNode('ddd');
            assert.deepEqual(graph.lookup('ddd'), null);
            assert.equal(graph.length, 0);
        });
        test('traverse from leaf', function () {
            graph.insertEdge('foo', 'bar');
            graph.traverse('bar', true, function (node) { return assert.equal(node, 'bar'); });
            var items = ['bar', 'foo'];
            graph.traverse('bar', false, function (node) { return assert.equal(node, items.shift()); });
        });
        test('traverse from center', function () {
            graph.insertEdge('1', '3');
            graph.insertEdge('2', '3');
            graph.insertEdge('3', '4');
            graph.insertEdge('3', '5');
            var items = ['3', '4', '5'];
            graph.traverse('3', true, function (node) { return assert.equal(node, items.shift()); });
            items = ['3', '1', '2'];
            graph.traverse('3', false, function (node) { return assert.equal(node, items.shift()); });
        });
        test('traverse a chain', function () {
            graph.insertEdge('1', '2');
            graph.insertEdge('2', '3');
            graph.insertEdge('3', '4');
            graph.insertEdge('4', '5');
            var items = ['1', '2', '3', '4', '5'];
            graph.traverse('1', true, function (node) { return assert.equal(node, items.shift()); });
            items = ['1', '2', '3', '4', '5'].reverse();
            graph.traverse('5', false, function (node) { return assert.equal(node, items.shift()); });
        });
        test('root', function () {
            graph.insertEdge('1', '2');
            var roots = graph.roots();
            assert.equal(roots.length, 1);
            assert.equal(roots[0].data, '2');
            graph.insertEdge('2', '1');
            roots = graph.roots();
            assert.equal(roots.length, 0);
        });
        test('root complex', function () {
            graph.insertEdge('1', '2');
            graph.insertEdge('1', '3');
            graph.insertEdge('3', '4');
            var roots = graph.roots();
            assert.equal(roots.length, 2);
            assert(['2', '4'].every(function (n) { return roots.some(function (node) { return node.data === n; }); }));
        });
    });
});
//# sourceMappingURL=graph.test.js.map