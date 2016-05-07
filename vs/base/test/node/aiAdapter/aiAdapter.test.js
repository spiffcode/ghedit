define(["require", "exports", 'assert', 'vs/base/node/aiAdapter'], function (require, exports, assert, aiAdapter_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var AppInsightsMock = (function () {
        function AppInsightsMock() {
            this.events = [];
            this.IsTrackingPageView = false;
            this.exceptions = [];
        }
        AppInsightsMock.prototype.trackEvent = function (eventName, properties, measurements) {
            this.events.push({
                eventName: eventName,
                properties: properties,
                measurements: measurements
            });
        };
        AppInsightsMock.prototype.trackPageView = function () {
            this.IsTrackingPageView = true;
        };
        AppInsightsMock.prototype.trackException = function (exception) {
            this.exceptions.push(exception);
        };
        return AppInsightsMock;
    }());
    suite('AIAdapter', function () {
        var appInsightsMock;
        var adapter;
        var prefix = 'prefix';
        setup(function () {
            appInsightsMock = new AppInsightsMock();
            adapter = new aiAdapter_1.AIAdapter(null, prefix, appInsightsMock);
        });
        teardown(function () {
            adapter.dispose();
        });
        test('Simple event', function () {
            adapter.log('testEvent');
            assert.equal(appInsightsMock.events.length, 1);
            assert.equal(appInsightsMock.events[0].eventName, prefix + "/testEvent");
        });
        test('Track UnhandledError as exception and events', function () {
            var sampleError = new Error('test');
            adapter.logException(sampleError);
            assert.equal(appInsightsMock.exceptions.length, 1);
        });
        test('property limits', function () {
            var reallyLongPropertyName = 'abcdefghijklmnopqrstuvwxyz';
            for (var i = 0; i < 6; i++) {
                reallyLongPropertyName += 'abcdefghijklmnopqrstuvwxyz';
            }
            assert(reallyLongPropertyName.length > 150);
            var reallyLongPropertyValue = 'abcdefghijklmnopqrstuvwxyz012345678901234567890123';
            for (var i = 0; i < 21; i++) {
                reallyLongPropertyValue += 'abcdefghijklmnopqrstuvwxyz012345678901234567890123';
            }
            assert(reallyLongPropertyValue.length > 1024);
            var data = {};
            data[reallyLongPropertyName] = '1234';
            data['reallyLongPropertyValue'] = reallyLongPropertyValue;
            adapter.log('testEvent', data);
            assert.equal(appInsightsMock.events.length, 1);
            for (var prop in appInsightsMock.events[0].properties) {
                assert(prop.length < 150);
                assert(appInsightsMock.events[0].properties[prop].length < 1024);
            }
        });
        test('Different data types', function () {
            var date = new Date();
            adapter.log('testEvent', { favoriteDate: date, likeRed: false, likeBlue: true, favoriteNumber: 1, favoriteColor: 'blue', favoriteCars: ['bmw', 'audi', 'ford'] });
            assert.equal(appInsightsMock.events.length, 1);
            assert.equal(appInsightsMock.events[0].eventName, prefix + "/testEvent");
            assert.equal(appInsightsMock.events[0].properties['favoriteColor'], 'blue');
            assert.equal(appInsightsMock.events[0].measurements['likeRed'], 0);
            assert.equal(appInsightsMock.events[0].measurements['likeBlue'], 1);
            assert.equal(appInsightsMock.events[0].properties['favoriteDate'], date.toISOString());
            assert.equal(appInsightsMock.events[0].properties['favoriteCars'], JSON.stringify(['bmw', 'audi', 'ford']));
            assert.equal(appInsightsMock.events[0].measurements['favoriteNumber'], 1);
        });
        test('Nested data', function () {
            adapter.log('testEvent', {
                window: {
                    title: 'some title',
                    measurements: {
                        width: 100,
                        height: 200
                    }
                },
                nestedObj: {
                    nestedObj2: {
                        nestedObj3: {
                            testProperty: 'test',
                        }
                    },
                    testMeasurement: 1
                }
            });
            assert.equal(appInsightsMock.events.length, 1);
            assert.equal(appInsightsMock.events[0].eventName, prefix + "/testEvent");
            assert.equal(appInsightsMock.events[0].properties['window.title'], 'some title');
            assert.equal(appInsightsMock.events[0].measurements['window.measurements.width'], 100);
            assert.equal(appInsightsMock.events[0].measurements['window.measurements.height'], 200);
            assert.equal(appInsightsMock.events[0].properties['nestedObj.nestedObj2.nestedObj3'], JSON.stringify({ 'testProperty': 'test' }));
            assert.equal(appInsightsMock.events[0].measurements['nestedObj.testMeasurement'], 1);
        });
    });
});
//# sourceMappingURL=aiAdapter.test.js.map