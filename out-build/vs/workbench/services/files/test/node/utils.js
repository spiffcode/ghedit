/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/eventEmitter', 'vs/platform/event/common/event'], function (require, exports, eventEmitter_1, event_1) {
    'use strict';
    var TestEventService = (function (_super) {
        __extends(TestEventService, _super);
        function TestEventService() {
            _super.apply(this, arguments);
            this.serviceId = event_1.IEventService;
        }
        return TestEventService;
    }(eventEmitter_1.EventEmitter));
    exports.TestEventService = TestEventService;
    function getByName(root, name) {
        for (var i = 0; i < root.children.length; i++) {
            if (root.children[i].name === name) {
                return root.children[i];
            }
        }
        return null;
    }
    exports.getByName = getByName;
});
//# sourceMappingURL=utils.js.map