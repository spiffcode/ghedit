define(["require", "exports", 'assert', 'vs/base/common/uri', 'vs/platform/markers/common/markerService', 'vs/platform/test/common/nullThreadService'], function (require, exports, assert, uri_1, markerService, nullThreadService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function randomMarkerData() {
        return {
            severity: 1,
            message: Math.random().toString(16),
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 1,
            endColumn: 1
        };
    }
    suite('Marker Service', function () {
        test('query', function () {
            var service = new markerService.MainProcessMarkerService(nullThreadService_1.NULL_THREAD_SERVICE);
            service.changeAll('far', [{
                    resource: uri_1.default.parse('file:///c/test/file.cs'),
                    marker: randomMarkerData()
                }]);
            assert.equal(service.read().length, 1);
            assert.equal(service.read({ owner: 'far' }).length, 1);
            assert.equal(service.read({ resource: uri_1.default.parse('file:///c/test/file.cs') }).length, 1);
            assert.equal(service.read({ owner: 'far', resource: uri_1.default.parse('file:///c/test/file.cs') }).length, 1);
            service.changeAll('boo', [{
                    resource: uri_1.default.parse('file:///c/test/file.cs'),
                    marker: randomMarkerData()
                }]);
            assert.equal(service.read().length, 2);
            assert.equal(service.read({ owner: 'far' }).length, 1);
            assert.equal(service.read({ owner: 'boo' }).length, 1);
        });
        test('changeOne override', function () {
            var service = new markerService.MainProcessMarkerService(nullThreadService_1.NULL_THREAD_SERVICE);
            service.changeOne('far', uri_1.default.parse('/path/only.cs'), [randomMarkerData()]);
            assert.equal(service.read().length, 1);
            assert.equal(service.read({ owner: 'far' }).length, 1);
            service.changeOne('boo', uri_1.default.parse('/path/only.cs'), [randomMarkerData()]);
            assert.equal(service.read().length, 2);
            assert.equal(service.read({ owner: 'far' }).length, 1);
            assert.equal(service.read({ owner: 'boo' }).length, 1);
            service.changeOne('far', uri_1.default.parse('/path/only.cs'), [randomMarkerData(), randomMarkerData()]);
            assert.equal(service.read({ owner: 'far' }).length, 2);
            assert.equal(service.read({ owner: 'boo' }).length, 1);
        });
        test('changeOne/All clears', function () {
            var service = new markerService.MainProcessMarkerService(nullThreadService_1.NULL_THREAD_SERVICE);
            service.changeOne('far', uri_1.default.parse('/path/only.cs'), [randomMarkerData()]);
            service.changeOne('boo', uri_1.default.parse('/path/only.cs'), [randomMarkerData()]);
            assert.equal(service.read({ owner: 'far' }).length, 1);
            assert.equal(service.read({ owner: 'boo' }).length, 1);
            assert.equal(service.read().length, 2);
            service.changeOne('far', uri_1.default.parse('/path/only.cs'), []);
            assert.equal(service.read({ owner: 'far' }).length, 0);
            assert.equal(service.read({ owner: 'boo' }).length, 1);
            assert.equal(service.read().length, 1);
            service.changeAll('boo', []);
            assert.equal(service.read({ owner: 'far' }).length, 0);
            assert.equal(service.read({ owner: 'boo' }).length, 0);
            assert.equal(service.read().length, 0);
        });
        test('changeAll sends event for cleared', function () {
            var service = new markerService.MainProcessMarkerService(nullThreadService_1.NULL_THREAD_SERVICE);
            service.changeAll('far', [{
                    resource: uri_1.default.parse('file:///d/path'),
                    marker: randomMarkerData()
                }, {
                    resource: uri_1.default.parse('file:///d/path'),
                    marker: randomMarkerData()
                }]);
            assert.equal(service.read({ owner: 'far' }).length, 2);
            service.onMarkerChanged(function (changedResources) {
                assert.equal(changedResources.length, 1);
                changedResources.forEach(function (u) { return assert.equal(u.toString(), 'file:///d/path'); });
                assert.equal(service.read({ owner: 'far' }).length, 0);
            });
            service.changeAll('far', []);
        });
        test('changeAll merges', function () {
            var service = new markerService.MainProcessMarkerService(nullThreadService_1.NULL_THREAD_SERVICE);
            service.changeAll('far', [{
                    resource: uri_1.default.parse('file:///c/test/file.cs'),
                    marker: randomMarkerData()
                }, {
                    resource: uri_1.default.parse('file:///c/test/file.cs'),
                    marker: randomMarkerData()
                }]);
            assert.equal(service.read({ owner: 'far' }).length, 2);
        });
    });
});
//# sourceMappingURL=markerService.test.js.map