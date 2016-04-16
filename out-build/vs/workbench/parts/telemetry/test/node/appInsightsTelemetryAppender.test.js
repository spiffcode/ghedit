define(["require", "exports", 'assert', 'vs/workbench/parts/telemetry/node/nodeAppInsightsTelemetryAppender'], function (require, exports, assert, nodeAppInsightsTelemetryAppender_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var AIAdapterMock = (function () {
        function AIAdapterMock(prefix, eventPrefix, client) {
            this.prefix = prefix;
            this.eventPrefix = eventPrefix;
            this.events = [];
            this.IsTrackingPageView = false;
            this.exceptions = [];
        }
        AIAdapterMock.prototype.log = function (eventName, data) {
            this.events.push({
                eventName: this.prefix + '/' + eventName,
                data: data
            });
        };
        AIAdapterMock.prototype.logException = function (exception) {
            this.exceptions.push(exception);
        };
        AIAdapterMock.prototype.dispose = function () {
        };
        return AIAdapterMock;
    }());
    var ContextServiceMock = (function () {
        function ContextServiceMock(key, asimovKey) {
            this.key = key;
            this.asimovKey = asimovKey;
        }
        ContextServiceMock.prototype.getConfiguration = function () {
            return {
                env: {
                    aiConfig: {
                        key: this.key,
                        asimovKey: this.asimovKey
                    }
                }
            };
        };
        return ContextServiceMock;
    }());
    suite('Telemetry - AppInsightsTelemetryAppender', function () {
        var appInsightsMock;
        var appender;
        setup(function () {
            appInsightsMock = new AIAdapterMock(nodeAppInsightsTelemetryAppender_1.NodeAppInsightsTelemetryAppender.EVENT_NAME_PREFIX, nodeAppInsightsTelemetryAppender_1.NodeAppInsightsTelemetryAppender.EVENT_NAME_PREFIX);
            appender = new nodeAppInsightsTelemetryAppender_1.NodeAppInsightsTelemetryAppender(null, new ContextServiceMock('123'), appInsightsMock);
        });
        teardown(function () {
            appender.dispose();
        });
        test('Simple event', function () {
            appender.log('testEvent');
            assert.equal(appInsightsMock.events.length, 1);
            assert.equal(appInsightsMock.events[0].eventName, nodeAppInsightsTelemetryAppender_1.NodeAppInsightsTelemetryAppender.EVENT_NAME_PREFIX + '/testEvent');
        });
        test('Event with data', function () {
            appender.log('testEvent', {
                title: 'some title',
                width: 100,
                height: 200
            });
            assert.equal(appInsightsMock.events.length, 1);
            assert.equal(appInsightsMock.events[0].eventName, nodeAppInsightsTelemetryAppender_1.NodeAppInsightsTelemetryAppender.EVENT_NAME_PREFIX + '/testEvent');
            assert.equal(appInsightsMock.events[0].data['title'], 'some title');
            assert.equal(appInsightsMock.events[0].data['width'], 100);
            assert.equal(appInsightsMock.events[0].data['height'], 200);
        });
        test('Test asimov', function () {
            appender = new nodeAppInsightsTelemetryAppender_1.NodeAppInsightsTelemetryAppender(null, new ContextServiceMock('123', 'AIF-123'), appInsightsMock);
            appender.log('testEvent');
            assert.equal(appInsightsMock.events.length, 2);
            assert.equal(appInsightsMock.events[0].eventName, nodeAppInsightsTelemetryAppender_1.NodeAppInsightsTelemetryAppender.EVENT_NAME_PREFIX + '/testEvent');
            // test vortex
            assert.equal(appInsightsMock.events[1].eventName, nodeAppInsightsTelemetryAppender_1.NodeAppInsightsTelemetryAppender.EVENT_NAME_PREFIX + '/testEvent');
        });
    });
});
//# sourceMappingURL=appInsightsTelemetryAppender.test.js.map