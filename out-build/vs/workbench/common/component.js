var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/eventEmitter', 'vs/workbench/common/memento'], function (require, exports, eventEmitter_1, memento_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var WorkbenchComponent = (function (_super) {
        __extends(WorkbenchComponent, _super);
        function WorkbenchComponent(id) {
            _super.call(this);
            this._toUnbind = [];
            this.id = id;
            this.componentMemento = new memento_1.Memento(this.id);
        }
        Object.defineProperty(WorkbenchComponent.prototype, "toUnbind", {
            get: function () {
                return this._toUnbind;
            },
            enumerable: true,
            configurable: true
        });
        WorkbenchComponent.prototype.getId = function () {
            return this.id;
        };
        WorkbenchComponent.prototype.getMemento = function (storageService, scope) {
            if (scope === void 0) { scope = memento_1.Scope.GLOBAL; }
            return this.componentMemento.getMemento(storageService, scope);
        };
        WorkbenchComponent.prototype.saveMemento = function () {
            this.componentMemento.saveMemento();
        };
        WorkbenchComponent.prototype.shutdown = function () {
            // Save Memento
            this.saveMemento();
        };
        WorkbenchComponent.prototype.dispose = function () {
            while (this._toUnbind.length) {
                this._toUnbind.pop()();
            }
            _super.prototype.dispose.call(this);
        };
        return WorkbenchComponent;
    }(eventEmitter_1.EventEmitter));
    exports.WorkbenchComponent = WorkbenchComponent;
});
//# sourceMappingURL=component.js.map