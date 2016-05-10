/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/platform/instantiation/common/instantiation'], function (require, exports, instantiation_1) {
    "use strict";
    exports.VIEWLET_ID = 'workbench.view.debug';
    exports.REPL_ID = 'workbench.panel.repl';
    exports.DEBUG_SERVICE_ID = 'debugService';
    exports.CONTEXT_IN_DEBUG_MODE = 'inDebugMode';
    exports.EDITOR_CONTRIBUTION_ID = 'editor.contrib.debug';
    ;
    // service enums
    (function (State) {
        State[State["Disabled"] = 0] = "Disabled";
        State[State["Inactive"] = 1] = "Inactive";
        State[State["Initializing"] = 2] = "Initializing";
        State[State["Stopped"] = 3] = "Stopped";
        State[State["Running"] = 4] = "Running";
        State[State["RunningNoDebug"] = 5] = "RunningNoDebug";
    })(exports.State || (exports.State = {}));
    var State = exports.State;
    exports.IDebugService = instantiation_1.createDecorator(exports.DEBUG_SERVICE_ID);
    var DebugViewRegistryImpl = (function () {
        function DebugViewRegistryImpl() {
            this.debugViews = [];
        }
        DebugViewRegistryImpl.prototype.registerDebugView = function (view, order) {
            this.debugViews.push({ view: view, order: order });
        };
        DebugViewRegistryImpl.prototype.getDebugViews = function () {
            return this.debugViews.sort(function (first, second) { return first.order - second.order; })
                .map(function (viewWithOrder) { return viewWithOrder.view; });
        };
        return DebugViewRegistryImpl;
    }());
    exports.DebugViewRegistry = new DebugViewRegistryImpl();
    // utils
    var _formatPIIRegexp = /{([^}]+)}/g;
    function formatPII(value, excludePII, args) {
        return value.replace(_formatPIIRegexp, function (match, group) {
            if (excludePII && group.length > 0 && group[0] !== '_') {
                return match;
            }
            return args && args.hasOwnProperty(group) ?
                args[group] :
                match;
        });
    }
    exports.formatPII = formatPII;
});
//# sourceMappingURL=debug.js.map