var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'assert', 'vs/base/browser/idleMonitor', 'vs/platform/telemetry/browser/telemetryService', 'vs/platform/telemetry/common/telemetry', 'vs/platform/instantiation/common/instantiationService', 'vs/base/common/errors', 'vs/base/common/timer', 'sinon'], function (require, exports, assert, IdleMonitor, telemetryService_1, Telemetry, InstantiationService, Errors, Timer, sinon) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var optInStatusEventName = 'optInStatus';
    var TestTelemetryAppender = (function () {
        function TestTelemetryAppender() {
            this.events = [];
            this.isDisposed = false;
        }
        TestTelemetryAppender.prototype.log = function (eventName, data) {
            this.events.push({
                eventName: eventName,
                data: data
            });
        };
        TestTelemetryAppender.prototype.getEventsCount = function () {
            return this.events.length;
        };
        TestTelemetryAppender.prototype.dispose = function () {
            this.isDisposed = true;
        };
        return TestTelemetryAppender;
    }());
    var ErrorTestingSettings = (function () {
        function ErrorTestingSettings() {
            this.personalInfo = 'DANGEROUS/PATH';
            this.importantInfo = 'important/information';
            this.filePrefix = 'file:///';
            this.dangerousPathWithImportantInfo = this.filePrefix + this.personalInfo + '/resources/app/' + this.importantInfo;
            this.dangerousPathWithoutImportantInfo = this.filePrefix + this.personalInfo;
            this.missingModelPrefix = 'Received model events for missing model ';
            this.missingModelMessage = this.missingModelPrefix + ' ' + this.dangerousPathWithoutImportantInfo;
            this.noSuchFilePrefix = 'ENOENT: no such file or directory';
            this.noSuchFileMessage = this.noSuchFilePrefix + ' \'' + this.personalInfo + '\'';
            this.stack = ['at e._modelEvents (a/path/that/doesnt/contain/code/names.js:11:7309)',
                '    at t.AllWorkers (a/path/that/doesnt/contain/code/names.js:6:8844)',
                '    at e.(anonymous function) [as _modelEvents] (a/path/that/doesnt/contain/code/names.js:5:29552)',
                '    at Function.<anonymous> (a/path/that/doesnt/contain/code/names.js:6:8272)',
                '    at e.dispatch (a/path/that/doesnt/contain/code/names.js:5:26931)',
                '    at e.request (a/path/that/doesnt/contain/code/names.js:14:1745)',
                '    at t._handleMessage (another/path/that/doesnt/contain/code/names.js:14:17447)',
                '    at t._onmessage (another/path/that/doesnt/contain/code/names.js:14:16976)',
                '    at t.onmessage (another/path/that/doesnt/contain/code/names.js:14:15854)',
                '    at DedicatedWorkerGlobalScope.self.onmessage',
                this.dangerousPathWithImportantInfo,
                this.dangerousPathWithoutImportantInfo,
                this.missingModelMessage,
                this.noSuchFileMessage];
        }
        return ErrorTestingSettings;
    }());
    suite('TelemetryService', function () {
        var AppenderCountTelemetryService = (function (_super) {
            __extends(AppenderCountTelemetryService, _super);
            function AppenderCountTelemetryService() {
                _super.apply(this, arguments);
            }
            AppenderCountTelemetryService.prototype.getAppendersCount = function () {
                return this._appenders.length;
            };
            return AppenderCountTelemetryService;
        }(telemetryService_1.TelemetryService));
        // Appenders
        test('No appenders', sinon.test(function () {
            var service = new AppenderCountTelemetryService();
            assert.equal(service.getAppendersCount(), 0);
            // log events
            service.publicLog('testEvent');
            var timedEvent = service.timedPublicLog('testTimed', { 'somedata': 'test' });
            timedEvent.stop();
            //dispose
            service.dispose();
        }));
        test('Add appender', sinon.test(function () {
            var service = new AppenderCountTelemetryService();
            assert.equal(service.getAppendersCount(), 0);
            var testAppender = new TestTelemetryAppender();
            service.addTelemetryAppender(testAppender);
            assert.equal(service.getAppendersCount(), 1);
            service.dispose();
        }));
        test('Remove appender', sinon.test(function () {
            var service = new AppenderCountTelemetryService();
            assert.equal(service.getAppendersCount(), 0);
            var testAppender = new TestTelemetryAppender();
            var registration = service.addTelemetryAppender(testAppender);
            assert.equal(service.getAppendersCount(), 1);
            //report event
            service.publicLog('testEvent');
            assert.equal(testAppender.getEventsCount(), 1);
            //remove appender
            registration.dispose();
            assert.equal(service.getAppendersCount(), 0);
            //verify events not being sent
            service.publicLog('testEvent2');
            assert.equal(testAppender.getEventsCount(), 1);
            service.dispose();
        }));
        test('Multiple appenders', sinon.test(function () {
            var service = new AppenderCountTelemetryService();
            assert.equal(service.getAppendersCount(), 0);
            var testAppender1 = new TestTelemetryAppender();
            var registrgation1 = service.addTelemetryAppender(testAppender1);
            assert.equal(service.getAppendersCount(), 1);
            //report event
            service.publicLog('testEvent');
            assert.equal(testAppender1.getEventsCount(), 1);
            // add second appender
            var testAppender2 = new TestTelemetryAppender();
            service.addTelemetryAppender(testAppender2);
            assert.equal(service.getAppendersCount(), 2);
            //report event
            service.publicLog('testEvent2');
            assert.equal(testAppender1.getEventsCount(), 2);
            assert.equal(testAppender2.getEventsCount(), 1);
            //remove appender 1
            registrgation1.dispose();
            assert.equal(service.getAppendersCount(), 1);
            //verify events not being sent to the removed appender
            service.publicLog('testEvent3');
            assert.equal(testAppender1.getEventsCount(), 2);
            assert.equal(testAppender2.getEventsCount(), 2);
            service.dispose();
        }));
        test('TelemetryAppendersRegistry, activate', function () {
            var registry = new Telemetry.TelemetryAppendersRegistry();
            registry.registerTelemetryAppenderDescriptor(TestTelemetryAppender);
            var callCount = 0;
            var telemetryService = {
                addTelemetryAppender: function (appender) {
                    assert.ok(appender);
                    callCount += 1;
                }
            };
            var instantiationService = InstantiationService.createInstantiationService();
            instantiationService.addSingleton(Telemetry.ITelemetryService, telemetryService);
            registry.activate(instantiationService);
            assert.equal(callCount, 1);
            // registry is now active/read-only
            assert.throws(function () { return registry.registerTelemetryAppenderDescriptor(TestTelemetryAppender); });
            assert.throws(function () { return registry.activate(instantiationService); });
        });
        test('Disposing', sinon.test(function () {
            var service = new telemetryService_1.TelemetryService();
            var testAppender = new TestTelemetryAppender();
            service.addTelemetryAppender(testAppender);
            service.publicLog('testPrivateEvent');
            assert.equal(testAppender.getEventsCount(), 1);
            service.dispose();
            assert.equal(testAppender.isDisposed, true);
        }));
        // event reporting
        test('Simple event', sinon.test(function () {
            var service = new telemetryService_1.TelemetryService();
            var testAppender = new TestTelemetryAppender();
            return service.getTelemetryInfo().then(function (info) {
                service.addTelemetryAppender(testAppender);
                service.publicLog('testEvent');
                assert.equal(testAppender.getEventsCount(), 1);
                assert.equal(testAppender.events[0].eventName, 'testEvent');
                assert.notEqual(testAppender.events[0].data, null);
                assert.equal(testAppender.events[0].data['sessionID'], info.sessionId);
                assert.notEqual(testAppender.events[0].data['timestamp'], null);
                service.dispose();
            });
        }));
        test('Event with data', sinon.test(function () {
            var service = new telemetryService_1.TelemetryService();
            var testAppender = new TestTelemetryAppender();
            return service.getTelemetryInfo().then(function (info) {
                service.addTelemetryAppender(testAppender);
                service.publicLog('testEvent', {
                    'stringProp': 'property',
                    'numberProp': 1,
                    'booleanProp': true,
                    'complexProp': {
                        'value': 0
                    }
                });
                assert.equal(testAppender.getEventsCount(), 1);
                assert.equal(testAppender.events[0].eventName, 'testEvent');
                assert.notEqual(testAppender.events[0].data, null);
                assert.equal(testAppender.events[0].data['sessionID'], info.sessionId);
                assert.notEqual(testAppender.events[0].data['timestamp'], null);
                assert.equal(testAppender.events[0].data['stringProp'], 'property');
                assert.equal(testAppender.events[0].data['numberProp'], 1);
                assert.equal(testAppender.events[0].data['booleanProp'], true);
                assert.equal(testAppender.events[0].data['complexProp'].value, 0);
                service.dispose();
            });
        }));
        test('Telemetry Timer events', sinon.test(function () {
            Timer.ENABLE_TIMER = true;
            var service = new telemetryService_1.TelemetryService();
            var testAppender = new TestTelemetryAppender();
            service.addTelemetryAppender(testAppender);
            var t1 = service.timedPublicLog('editorDance');
            this.clock.tick(20);
            var t2 = service.timedPublicLog('editorSwoon', null);
            this.clock.tick(20);
            t1.stop(new Date());
            t2.stop(new Date());
            var t3 = service.timedPublicLog('editorMove', { someData: 'data' });
            this.clock.tick(30);
            t3.stop(new Date());
            assert.equal(testAppender.getEventsCount(), 3);
            assert.equal(testAppender.events[0].eventName, 'editorDance');
            assert.equal(testAppender.events[0].data.duration, 40);
            assert.equal(testAppender.events[1].eventName, 'editorSwoon');
            assert.equal(testAppender.events[1].data.duration, 20);
            assert.equal(testAppender.events[2].eventName, 'editorMove');
            assert.equal(testAppender.events[2].data.duration, 30);
            assert.equal(testAppender.events[2].data.someData, 'data');
            service.dispose();
            Timer.ENABLE_TIMER = false;
        }));
        test('enableTelemetry on by default', sinon.test(function () {
            var service = new telemetryService_1.TelemetryService();
            var testAppender = new TestTelemetryAppender();
            service.addTelemetryAppender(testAppender);
            service.publicLog('testEvent');
            assert.equal(testAppender.getEventsCount(), 1);
            assert.equal(testAppender.events[0].eventName, 'testEvent');
            service.dispose();
        }));
        test('Error events', sinon.test(function () {
            var origErrorHandler = Errors.errorHandler.getUnexpectedErrorHandler();
            Errors.setUnexpectedErrorHandler(function () { });
            try {
                var service = new telemetryService_1.TelemetryService();
                var testAppender = new TestTelemetryAppender();
                service.addTelemetryAppender(testAppender);
                var e = new Error('This is a test.');
                // for Phantom
                if (!e.stack) {
                    e.stack = 'blah';
                }
                Errors.onUnexpectedError(e);
                this.clock.tick(telemetryService_1.TelemetryService.ERROR_FLUSH_TIMEOUT);
                assert.equal(testAppender.getEventsCount(), 1);
                assert.equal(testAppender.events[0].eventName, 'UnhandledError');
                assert.equal(testAppender.events[0].data.message, 'This is a test.');
                service.dispose();
            }
            finally {
                Errors.setUnexpectedErrorHandler(origErrorHandler);
            }
        }));
        // 	test('Unhandled Promise Error events', sinon.test(function() {
        //
        // 		let origErrorHandler = Errors.errorHandler.getUnexpectedErrorHandler();
        // 		Errors.setUnexpectedErrorHandler(() => {});
        //
        // 		try {
        // 			let service = new MainTelemetryService();
        // 			let testAppender = new TestTelemetryAppender();
        // 			service.addTelemetryAppender(testAppender);
        //
        // 			winjs.Promise.wrapError('This should not get logged');
        // 			winjs.TPromise.as(true).then(() => {
        // 				throw new Error('This should get logged');
        // 			});
        // 			// prevent console output from failing the test
        // 			this.stub(console, 'log');
        // 			// allow for the promise to finish
        // 			this.clock.tick(MainTelemetryService.ERROR_FLUSH_TIMEOUT);
        //
        // 			assert.equal(testAppender.getEventsCount(), 1);
        // 			assert.equal(testAppender.events[0].eventName, 'UnhandledError');
        // 			assert.equal(testAppender.events[0].data.message,  'This should get logged');
        //
        // 			service.dispose();
        // 		} finally {
        // 			Errors.setUnexpectedErrorHandler(origErrorHandler);
        // 		}
        // 	}));
        test('Handle global errors', sinon.test(function () {
            var errorStub = this.stub(window, 'onerror');
            var service = new telemetryService_1.TelemetryService();
            var testAppender = new TestTelemetryAppender();
            service.addTelemetryAppender(testAppender);
            var testError = new Error('test');
            window.onerror('Error Message', 'file.js', 2, 42, testError);
            this.clock.tick(telemetryService_1.TelemetryService.ERROR_FLUSH_TIMEOUT);
            assert.equal(errorStub.alwaysCalledWithExactly('Error Message', 'file.js', 2, 42, testError), true);
            assert.equal(errorStub.callCount, 1);
            assert.equal(testAppender.getEventsCount(), 1);
            assert.equal(testAppender.events[0].eventName, 'UnhandledError');
            assert.equal(testAppender.events[0].data.message, 'Error Message');
            assert.equal(testAppender.events[0].data.filename, 'file.js');
            assert.equal(testAppender.events[0].data.line, 2);
            assert.equal(testAppender.events[0].data.column, 42);
            assert.equal(testAppender.events[0].data.error.message, 'test');
            service.dispose();
        }));
        test('Uncaught Error Telemetry removes PII from filename', sinon.test(function () {
            var errorStub = this.stub(window, 'onerror');
            var settings = new ErrorTestingSettings();
            var service = new telemetryService_1.TelemetryService();
            var testAppender = new TestTelemetryAppender();
            service.addTelemetryAppender(testAppender);
            var dangerousFilenameError = new Error('dangerousFilename');
            dangerousFilenameError.stack = settings.stack;
            window.onerror('dangerousFilename', settings.dangerousPathWithImportantInfo + '/test.js', 2, 42, dangerousFilenameError);
            this.clock.tick(telemetryService_1.TelemetryService.ERROR_FLUSH_TIMEOUT);
            assert.equal(errorStub.callCount, 1);
            assert.equal(testAppender.events[0].data.filename.indexOf(settings.dangerousPathWithImportantInfo), -1);
            dangerousFilenameError = new Error('dangerousFilename');
            dangerousFilenameError.stack = settings.stack;
            window.onerror('dangerousFilename', settings.dangerousPathWithImportantInfo + '/test.js', 2, 42, dangerousFilenameError);
            this.clock.tick(telemetryService_1.TelemetryService.ERROR_FLUSH_TIMEOUT);
            assert.equal(errorStub.callCount, 2);
            assert.equal(testAppender.events[0].data.filename.indexOf(settings.dangerousPathWithImportantInfo), -1);
            assert.equal(testAppender.events[0].data.filename, '<APP_ROOT>' + settings.importantInfo + '/test.js');
            service.dispose();
        }));
        test('Unexpected Error Telemetry removes PII', sinon.test(function () {
            var origErrorHandler = Errors.errorHandler.getUnexpectedErrorHandler();
            Errors.setUnexpectedErrorHandler(function () { });
            try {
                var settings = new ErrorTestingSettings();
                var service = new telemetryService_1.TelemetryService();
                var testAppender = new TestTelemetryAppender();
                service.addTelemetryAppender(testAppender);
                var dangerousPathWithoutImportantInfoError = new Error(settings.dangerousPathWithoutImportantInfo);
                dangerousPathWithoutImportantInfoError.stack = settings.stack;
                Errors.onUnexpectedError(dangerousPathWithoutImportantInfoError);
                this.clock.tick(telemetryService_1.TelemetryService.ERROR_FLUSH_TIMEOUT);
                assert.equal(testAppender.events[0].data.message.indexOf(settings.personalInfo), -1);
                assert.equal(testAppender.events[0].data.message.indexOf(settings.filePrefix), -1);
                assert.equal(testAppender.events[0].data.stack.indexOf(settings.personalInfo), -1);
                assert.equal(testAppender.events[0].data.stack.indexOf(settings.filePrefix), -1);
                assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.stack[4]), -1);
                assert.equal(testAppender.events[0].data.stack.split('\n').length, settings.stack.length);
                service.dispose();
            }
            finally {
                Errors.setUnexpectedErrorHandler(origErrorHandler);
            }
        }));
        test('Uncaught Error Telemetry removes PII', sinon.test(function () {
            var errorStub = this.stub(window, 'onerror');
            var settings = new ErrorTestingSettings();
            var service = new telemetryService_1.TelemetryService();
            var testAppender = new TestTelemetryAppender();
            service.addTelemetryAppender(testAppender);
            var dangerousPathWithoutImportantInfoError = new Error('dangerousPathWithoutImportantInfo');
            dangerousPathWithoutImportantInfoError.stack = settings.stack;
            window.onerror(settings.dangerousPathWithoutImportantInfo, 'test.js', 2, 42, dangerousPathWithoutImportantInfoError);
            this.clock.tick(telemetryService_1.TelemetryService.ERROR_FLUSH_TIMEOUT);
            assert.equal(errorStub.callCount, 1);
            // Test that no file information remains, esp. personal info
            assert.equal(testAppender.events[0].data.message.indexOf(settings.personalInfo), -1);
            assert.equal(testAppender.events[0].data.message.indexOf(settings.filePrefix), -1);
            assert.equal(testAppender.events[0].data.stack.indexOf(settings.personalInfo), -1);
            assert.equal(testAppender.events[0].data.stack.indexOf(settings.filePrefix), -1);
            assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.stack[4]), -1);
            assert.equal(testAppender.events[0].data.stack.split('\n').length, settings.stack.length);
            service.dispose();
        }));
        test('Unexpected Error Telemetry removes PII but preserves Code file path', sinon.test(function () {
            var origErrorHandler = Errors.errorHandler.getUnexpectedErrorHandler();
            Errors.setUnexpectedErrorHandler(function () { });
            try {
                var settings = new ErrorTestingSettings();
                var service = new telemetryService_1.TelemetryService();
                var testAppender = new TestTelemetryAppender();
                service.addTelemetryAppender(testAppender);
                var dangerousPathWithImportantInfoError = new Error(settings.dangerousPathWithImportantInfo);
                dangerousPathWithImportantInfoError.stack = settings.stack;
                // Test that important information remains but personal info does not
                Errors.onUnexpectedError(dangerousPathWithImportantInfoError);
                this.clock.tick(telemetryService_1.TelemetryService.ERROR_FLUSH_TIMEOUT);
                assert.notEqual(testAppender.events[0].data.message.indexOf(settings.importantInfo), -1);
                assert.equal(testAppender.events[0].data.message.indexOf(settings.personalInfo), -1);
                assert.equal(testAppender.events[0].data.message.indexOf(settings.filePrefix), -1);
                assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.importantInfo), -1);
                assert.equal(testAppender.events[0].data.stack.indexOf(settings.personalInfo), -1);
                assert.equal(testAppender.events[0].data.stack.indexOf(settings.filePrefix), -1);
                assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.stack[4]), -1);
                assert.equal(testAppender.events[0].data.stack.split('\n').length, settings.stack.length);
                service.dispose();
            }
            finally {
                Errors.setUnexpectedErrorHandler(origErrorHandler);
            }
        }));
        test('Uncaught Error Telemetry removes PII but preserves Code file path', sinon.test(function () {
            var errorStub = this.stub(window, 'onerror');
            var settings = new ErrorTestingSettings();
            var service = new telemetryService_1.TelemetryService();
            var testAppender = new TestTelemetryAppender();
            service.addTelemetryAppender(testAppender);
            var dangerousPathWithImportantInfoError = new Error('dangerousPathWithImportantInfo');
            dangerousPathWithImportantInfoError.stack = settings.stack;
            window.onerror(settings.dangerousPathWithImportantInfo, 'test.js', 2, 42, dangerousPathWithImportantInfoError);
            this.clock.tick(telemetryService_1.TelemetryService.ERROR_FLUSH_TIMEOUT);
            assert.equal(errorStub.callCount, 1);
            // Test that important information remains but personal info does not
            assert.notEqual(testAppender.events[0].data.message.indexOf(settings.importantInfo), -1);
            assert.equal(testAppender.events[0].data.message.indexOf(settings.personalInfo), -1);
            assert.equal(testAppender.events[0].data.message.indexOf(settings.filePrefix), -1);
            assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.importantInfo), -1);
            assert.equal(testAppender.events[0].data.stack.indexOf(settings.personalInfo), -1);
            assert.equal(testAppender.events[0].data.stack.indexOf(settings.filePrefix), -1);
            assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.stack[4]), -1);
            assert.equal(testAppender.events[0].data.stack.split('\n').length, settings.stack.length);
            service.dispose();
        }));
        test('Unexpected Error Telemetry removes PII but preserves Missing Model error message', sinon.test(function () {
            var origErrorHandler = Errors.errorHandler.getUnexpectedErrorHandler();
            Errors.setUnexpectedErrorHandler(function () { });
            try {
                var settings = new ErrorTestingSettings();
                var service = new telemetryService_1.TelemetryService();
                var testAppender = new TestTelemetryAppender();
                service.addTelemetryAppender(testAppender);
                var missingModelError = new Error(settings.missingModelMessage);
                missingModelError.stack = settings.stack;
                // Test that no file information remains, but this particular
                // error message does (Received model events for missing model)
                Errors.onUnexpectedError(missingModelError);
                this.clock.tick(telemetryService_1.TelemetryService.ERROR_FLUSH_TIMEOUT);
                assert.notEqual(testAppender.events[0].data.message.indexOf(settings.missingModelPrefix), -1);
                assert.equal(testAppender.events[0].data.message.indexOf(settings.personalInfo), -1);
                assert.equal(testAppender.events[0].data.message.indexOf(settings.filePrefix), -1);
                assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.missingModelPrefix), -1);
                assert.equal(testAppender.events[0].data.stack.indexOf(settings.personalInfo), -1);
                assert.equal(testAppender.events[0].data.stack.indexOf(settings.filePrefix), -1);
                assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.stack[4]), -1);
                assert.equal(testAppender.events[0].data.stack.split('\n').length, settings.stack.length);
                service.dispose();
            }
            finally {
                Errors.setUnexpectedErrorHandler(origErrorHandler);
            }
        }));
        test('Uncaught Error Telemetry removes PII but preserves Missing Model error message', sinon.test(function () {
            var errorStub = this.stub(window, 'onerror');
            var settings = new ErrorTestingSettings();
            var service = new telemetryService_1.TelemetryService();
            var testAppender = new TestTelemetryAppender();
            service.addTelemetryAppender(testAppender);
            var missingModelError = new Error('missingModelMessage');
            missingModelError.stack = settings.stack;
            window.onerror(settings.missingModelMessage, 'test.js', 2, 42, missingModelError);
            this.clock.tick(telemetryService_1.TelemetryService.ERROR_FLUSH_TIMEOUT);
            assert.equal(errorStub.callCount, 1);
            // Test that no file information remains, but this particular
            // error message does (Received model events for missing model)
            assert.notEqual(testAppender.events[0].data.message.indexOf(settings.missingModelPrefix), -1);
            assert.equal(testAppender.events[0].data.message.indexOf(settings.personalInfo), -1);
            assert.equal(testAppender.events[0].data.message.indexOf(settings.filePrefix), -1);
            assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.missingModelPrefix), -1);
            assert.equal(testAppender.events[0].data.stack.indexOf(settings.personalInfo), -1);
            assert.equal(testAppender.events[0].data.stack.indexOf(settings.filePrefix), -1);
            assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.stack[4]), -1);
            assert.equal(testAppender.events[0].data.stack.split('\n').length, settings.stack.length);
            service.dispose();
        }));
        test('Unexpected Error Telemetry removes PII but preserves No Such File error message', sinon.test(function () {
            var origErrorHandler = Errors.errorHandler.getUnexpectedErrorHandler();
            Errors.setUnexpectedErrorHandler(function () { });
            try {
                var settings = new ErrorTestingSettings();
                var service = new telemetryService_1.TelemetryService();
                var testAppender = new TestTelemetryAppender();
                service.addTelemetryAppender(testAppender);
                var noSuchFileError = new Error(settings.noSuchFileMessage);
                noSuchFileError.stack = settings.stack;
                // Test that no file information remains, but this particular
                // error message does (ENOENT: no such file or directory)
                Errors.onUnexpectedError(noSuchFileError);
                this.clock.tick(telemetryService_1.TelemetryService.ERROR_FLUSH_TIMEOUT);
                assert.notEqual(testAppender.events[0].data.message.indexOf(settings.noSuchFilePrefix), -1);
                assert.equal(testAppender.events[0].data.message.indexOf(settings.personalInfo), -1);
                assert.equal(testAppender.events[0].data.message.indexOf(settings.filePrefix), -1);
                assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.noSuchFilePrefix), -1);
                assert.equal(testAppender.events[0].data.stack.indexOf(settings.personalInfo), -1);
                assert.equal(testAppender.events[0].data.stack.indexOf(settings.filePrefix), -1);
                assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.stack[4]), -1);
                assert.equal(testAppender.events[0].data.stack.split('\n').length, settings.stack.length);
                service.dispose();
            }
            finally {
                Errors.setUnexpectedErrorHandler(origErrorHandler);
            }
        }));
        test('Uncaught Error Telemetry removes PII but preserves No Such File error message', sinon.test(function () {
            var origErrorHandler = Errors.errorHandler.getUnexpectedErrorHandler();
            Errors.setUnexpectedErrorHandler(function () { });
            try {
                var errorStub = this.stub(window, 'onerror');
                var settings = new ErrorTestingSettings();
                var service = new telemetryService_1.TelemetryService();
                var testAppender = new TestTelemetryAppender();
                service.addTelemetryAppender(testAppender);
                var noSuchFileError = new Error('noSuchFileMessage');
                noSuchFileError.stack = settings.stack;
                window.onerror(settings.noSuchFileMessage, 'test.js', 2, 42, noSuchFileError);
                this.clock.tick(telemetryService_1.TelemetryService.ERROR_FLUSH_TIMEOUT);
                assert.equal(errorStub.callCount, 1);
                // Test that no file information remains, but this particular
                // error message does (ENOENT: no such file or directory)
                Errors.onUnexpectedError(noSuchFileError);
                assert.notEqual(testAppender.events[0].data.message.indexOf(settings.noSuchFilePrefix), -1);
                assert.equal(testAppender.events[0].data.message.indexOf(settings.personalInfo), -1);
                assert.equal(testAppender.events[0].data.message.indexOf(settings.filePrefix), -1);
                assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.noSuchFilePrefix), -1);
                assert.equal(testAppender.events[0].data.stack.indexOf(settings.personalInfo), -1);
                assert.equal(testAppender.events[0].data.stack.indexOf(settings.filePrefix), -1);
                assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.stack[4]), -1);
                assert.equal(testAppender.events[0].data.stack.split('\n').length, settings.stack.length);
                service.dispose();
            }
            finally {
                Errors.setUnexpectedErrorHandler(origErrorHandler);
            }
        }));
        test('Test hard idle does not affect sending normal events in active state', sinon.test(function () {
            var service = new telemetryService_1.TelemetryService({ enableHardIdle: true, enableSoftIdle: false });
            var testAppender = new TestTelemetryAppender();
            service.addTelemetryAppender(testAppender);
            //report an event
            service.publicLog('testEvent');
            //verify that the event is not being sent
            assert.equal(testAppender.getEventsCount(), 1);
            service.dispose();
        }));
        test('Test hard idle stops events from being sent in idle state', sinon.test(function () {
            var service = new telemetryService_1.TelemetryService({ enableHardIdle: true, enableSoftIdle: false });
            var testAppender = new TestTelemetryAppender();
            service.addTelemetryAppender(testAppender);
            // make the user idle
            this.clock.tick(IdleMonitor.DEFAULT_IDLE_TIME);
            //report an event
            service.publicLog('testEvent');
            //verify that the event is not being sent
            assert.equal(testAppender.getEventsCount(), 0);
            service.dispose();
        }));
        test('Test soft idle start/stop events', sinon.test(function () {
            var activeListener = null;
            var idleListener = null;
            function MockIdleMonitor(timeout) {
                assert.equal(timeout, telemetryService_1.TelemetryService.SOFT_IDLE_TIME);
            }
            MockIdleMonitor.prototype.addOneTimeActiveListener = function (callback) {
                activeListener = callback;
            };
            MockIdleMonitor.prototype.addOneTimeIdleListener = function (callback) {
                idleListener = callback;
            };
            MockIdleMonitor.prototype.dispose = function () {
                // empty
            };
            this.stub(IdleMonitor, 'IdleMonitor', MockIdleMonitor);
            var service = new telemetryService_1.TelemetryService({ enableHardIdle: false, enableSoftIdle: true });
            var testAppender = new TestTelemetryAppender();
            service.addTelemetryAppender(testAppender);
            assert.equal(testAppender.getEventsCount(), 0);
            idleListener();
            activeListener();
            idleListener();
            activeListener();
            //verify that two idle happened
            assert.equal(testAppender.getEventsCount(), 4);
            //first idle
            assert.equal(testAppender.events[0].eventName, telemetryService_1.TelemetryService.IDLE_START_EVENT_NAME);
            assert.equal(testAppender.events[1].eventName, telemetryService_1.TelemetryService.IDLE_STOP_EVENT_NAME);
            //second idle
            assert.equal(testAppender.events[2].eventName, telemetryService_1.TelemetryService.IDLE_START_EVENT_NAME);
            assert.equal(testAppender.events[3].eventName, telemetryService_1.TelemetryService.IDLE_STOP_EVENT_NAME);
            service.dispose();
        }));
        test('Telemetry Service uses provided session ID', sinon.test(function () {
            var testSessionId = 'test session id';
            var service = new telemetryService_1.TelemetryService({ sessionID: testSessionId });
            return service.getTelemetryInfo().then(function (info) {
                assert.equal(info.sessionId, testSessionId);
                service.dispose();
            });
        }));
        test('Telemetry Service respects user opt-in settings', sinon.test(function () {
            var service = new telemetryService_1.TelemetryService({ userOptIn: false });
            var testAppender = new TestTelemetryAppender();
            service.addTelemetryAppender(testAppender);
            service.publicLog('testEvent');
            assert.equal(testAppender.getEventsCount(), 0);
            service.dispose();
        }));
        test('Telemetry Service sends events when enableTelemetry is on even user optin is on', sinon.test(function () {
            var service = new telemetryService_1.TelemetryService({ userOptIn: true });
            var testAppender = new TestTelemetryAppender();
            service.addTelemetryAppender(testAppender);
            service.publicLog('testEvent');
            assert.equal(testAppender.getEventsCount(), 1);
            service.dispose();
        }));
        test('Telemetry Service allows optin friendly events', sinon.test(function () {
            var service = new telemetryService_1.TelemetryService({ userOptIn: false });
            var testAppender = new TestTelemetryAppender();
            service.addTelemetryAppender(testAppender);
            service.publicLog('testEvent');
            assert.equal(testAppender.getEventsCount(), 0);
            service.publicLog(optInStatusEventName, { userOptIn: false });
            assert.equal(testAppender.getEventsCount(), 1);
            assert.equal(testAppender.events[0].eventName, optInStatusEventName);
            assert.equal(testAppender.events[0].data.userOptIn, false);
            service.dispose();
        }));
    });
});
//# sourceMappingURL=telemetryService.test.js.map