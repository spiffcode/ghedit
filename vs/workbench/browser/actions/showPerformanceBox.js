var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/browser/ui/timer/timer', 'vs/base/common/actions'], function (require, exports, winjs_base_1, timer_1, actions_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var timeKeeperRenderer = null;
    var ShowPerformanceBox = (function (_super) {
        __extends(ShowPerformanceBox, _super);
        function ShowPerformanceBox(id, label) {
            _super.call(this, id, label, null, true);
        }
        ShowPerformanceBox.prototype.run = function () {
            if (timeKeeperRenderer === null) {
                timeKeeperRenderer = new timer_1.TimeKeeperRenderer(function () {
                    timeKeeperRenderer.destroy();
                    timeKeeperRenderer = null;
                });
            }
            return winjs_base_1.TPromise.as(true);
        };
        return ShowPerformanceBox;
    }(actions_1.Action));
    exports.ShowPerformanceBox = ShowPerformanceBox;
});
// if (false /* Env.enablePerformanceTools */) {
// 	let registry = <IWorkbenchActionRegistry>Registry.as(Extensions.WorkbenchActions);
// 	registry.registerWorkbenchAction(new SyncActionDescriptor(ShowPerformanceBox, ID, LABEL));
// } 
//# sourceMappingURL=showPerformanceBox.js.map