var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/eventEmitter', './event'], function (require, exports, eventEmitter_1, event_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    // --- implementation ------------------------------------------
    var EventService = (function (_super) {
        __extends(EventService, _super);
        function EventService() {
            _super.call(this);
            this.serviceId = event_1.IEventService;
        }
        return EventService;
    }(eventEmitter_1.EventEmitter));
    exports.EventService = EventService;
});
