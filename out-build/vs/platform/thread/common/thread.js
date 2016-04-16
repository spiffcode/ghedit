define(["require", "exports", 'vs/platform/instantiation/common/instantiation'], function (require, exports, instantiation) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    // --- thread service (web workers)
    exports.IThreadService = instantiation.createDecorator('threadService');
    var IRemotableCtorMap = (function () {
        function IRemotableCtorMap() {
        }
        return IRemotableCtorMap;
    }());
    exports.IRemotableCtorMap = IRemotableCtorMap;
    var IRemotableCtorAffinityMap = (function () {
        function IRemotableCtorAffinityMap() {
        }
        return IRemotableCtorAffinityMap;
    }());
    exports.IRemotableCtorAffinityMap = IRemotableCtorAffinityMap;
    var Remotable = (function () {
        function Remotable() {
        }
        Remotable.getId = function (ctor) {
            return (ctor[Remotable.PROP_NAME] || null);
        };
        Remotable.MainContext = function (identifier) {
            return function (target) {
                Remotable._ensureUnique(identifier);
                Remotable.Registry.MainContext[identifier] = target;
                target[Remotable.PROP_NAME] = identifier;
            };
        };
        Remotable.ExtHostContext = function (identifier) {
            return function (target) {
                Remotable._ensureUnique(identifier);
                Remotable.Registry.ExtHostContext[identifier] = target;
                target[Remotable.PROP_NAME] = identifier;
            };
        };
        Remotable.WorkerContext = function (identifier, whichWorker) {
            return function (target) {
                Remotable._ensureUnique(identifier);
                Remotable.Registry.WorkerContext[identifier] = {
                    ctor: target,
                    affinity: whichWorker
                };
                target[Remotable.PROP_NAME] = identifier;
            };
        };
        Remotable._ensureUnique = function (identifier) {
            if (Remotable.Registry.MainContext[identifier] || Remotable.Registry.ExtHostContext[identifier] || Remotable.Registry.WorkerContext[identifier]) {
                throw new Error('Duplicate Remotable identifier found');
            }
        };
        Remotable.PROP_NAME = '$__REMOTABLE_ID';
        Remotable.Registry = {
            MainContext: Object.create(null),
            ExtHostContext: Object.create(null),
            WorkerContext: Object.create(null),
        };
        return Remotable;
    }());
    exports.Remotable = Remotable;
    (function (ThreadAffinity) {
        ThreadAffinity[ThreadAffinity["None"] = 0] = "None";
        ThreadAffinity[ThreadAffinity["Group1"] = 1] = "Group1";
        ThreadAffinity[ThreadAffinity["Group2"] = 2] = "Group2";
        ThreadAffinity[ThreadAffinity["Group3"] = 3] = "Group3";
        ThreadAffinity[ThreadAffinity["Group4"] = 4] = "Group4";
        ThreadAffinity[ThreadAffinity["Group5"] = 5] = "Group5";
        ThreadAffinity[ThreadAffinity["Group6"] = 6] = "Group6";
        ThreadAffinity[ThreadAffinity["Group7"] = 7] = "Group7";
        ThreadAffinity[ThreadAffinity["Group8"] = 8] = "Group8";
        ThreadAffinity[ThreadAffinity["Group9"] = 9] = "Group9";
        ThreadAffinity[ThreadAffinity["All"] = 10] = "All";
    })(exports.ThreadAffinity || (exports.ThreadAffinity = {}));
    var ThreadAffinity = exports.ThreadAffinity;
});
//# sourceMappingURL=thread.js.map