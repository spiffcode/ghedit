define(["require", "exports", 'assert', 'vs/base/common/uri', 'vs/editor/common/model/mirrorModel', 'vs/editor/common/services/resourceService', 'vs/editor/common/services/resourceServiceImpl'], function (require, exports, assert, uri_1, mirrorModel_1, resourceService_1, resourceServiceImpl_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('Editor Services - ResourceService', function () {
        test('insert, remove, all', function () {
            var service = new resourceServiceImpl_1.ResourceService();
            service.insert(uri_1.default.parse('test://1'), mirrorModel_1.createTestMirrorModelFromString('hi'));
            assert.equal(service.all().length, 1);
            service.insert(uri_1.default.parse('test://2'), mirrorModel_1.createTestMirrorModelFromString('hi'));
            assert.equal(service.all().length, 2);
            assert.ok(service.contains(uri_1.default.parse('test://1')));
            assert.ok(service.contains(uri_1.default.parse('test://2')));
            service.remove(uri_1.default.parse('test://1'));
            service.remove(uri_1.default.parse('test://1'));
            service.remove(uri_1.default.parse('test://2'));
            assert.equal(service.all().length, 0);
        });
        test('event - add, remove', function () {
            var eventCnt = 0;
            var url = uri_1.default.parse('far');
            var element = mirrorModel_1.createTestMirrorModelFromString('hi');
            var service = new resourceServiceImpl_1.ResourceService();
            service.addListener(resourceService_1.ResourceEvents.ADDED, function () {
                eventCnt++;
                assert.ok(true);
            });
            service.addListener(resourceService_1.ResourceEvents.REMOVED, function () {
                eventCnt++;
                assert.ok(true);
            });
            service.insert(url, element);
            service.remove(url);
            assert.equal(eventCnt, 2, 'events');
        });
        test('event - propagation', function () {
            var eventCnt = 0;
            var url = uri_1.default.parse('far');
            var element = mirrorModel_1.createTestMirrorModelFromString('hi');
            var event = {};
            var service = new resourceServiceImpl_1.ResourceService();
            service.insert(url, element);
            service.addBulkListener(function (events) {
                eventCnt++;
                assert.equal(events.length, 1);
                assert.equal(events[0].getData().originalEvents.length, 1);
                assert.ok(events[0].getData().originalEvents[0].getData() === event);
            });
            element.emit('changed', event);
            assert.equal(eventCnt, 1, 'events');
        });
    });
});
//# sourceMappingURL=resourceService.test.js.map