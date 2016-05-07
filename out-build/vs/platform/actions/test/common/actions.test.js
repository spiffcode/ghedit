var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'assert', 'vs/base/common/winjs.base', 'vs/platform/actions/common/actions', 'vs/base/common/actions', 'vs/base/common/eventEmitter', 'vs/platform/instantiation/common/instantiationService', 'vs/platform/instantiation/common/descriptors', 'vs/platform/event/common/event'], function (require, exports, assert, WinJS, actions_1, Actions, EventEmitter, InstantiationService, descriptors_1, event_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var TestAction = (function (_super) {
        __extends(TestAction, _super);
        function TestAction(first, second, eventService) {
            _super.call(this, first);
            this.service = eventService;
            this.first = first;
            this.second = second;
        }
        TestAction.prototype.run = function () {
            return WinJS.TPromise.as((!!this.service && !!this.first && !!this.second) ? true : false);
        };
        TestAction = __decorate([
            __param(2, event_1.IEventService)
        ], TestAction);
        return TestAction;
    }(Actions.Action));
    exports.TestAction = TestAction;
    var TestEventService = (function (_super) {
        __extends(TestEventService, _super);
        function TestEventService() {
            _super.apply(this, arguments);
        }
        return TestEventService;
    }(EventEmitter.EventEmitter));
    suite('Platform actions', function () {
        test('DeferredAction', function (done) {
            var services = {
                eventService: {}
            };
            var instantiationService = InstantiationService.createInstantiationService(services);
            var action = new actions_1.DeferredAction(instantiationService, new descriptors_1.AsyncDescriptor('vs/platform/actions/test/common/actions.test', 'TestAction', 'my.id', 'Second'), 'my.test.action', 'Hello World', 'css');
            assert.strictEqual(action.id, 'my.test.action');
            action.run().then(function (result) {
                assert.strictEqual(result, true);
                assert.strictEqual(action.id, 'my.id');
                done();
            });
        });
    });
});
//# sourceMappingURL=actions.test.js.map