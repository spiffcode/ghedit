define(["require", "exports"], function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    // ----------------------- internal util -----------------------
    var _util;
    (function (_util) {
        _util.DI_TARGET = '$di$target';
        _util.DI_DEPENDENCIES = '$di$dependencies';
        _util.DI_PROVIDES = '$di$provides_service';
        function getServiceId(id) {
            return id[_util.DI_PROVIDES];
        }
        _util.getServiceId = getServiceId;
        function getServiceDependencies(ctor) {
            return ctor[_util.DI_DEPENDENCIES];
        }
        _util.getServiceDependencies = getServiceDependencies;
    })(_util = exports._util || (exports._util = {}));
    exports.IInstantiationService = createDecorator('instantiationService');
    /**
     * A *only* valid way to create a {{ServiceIdentifier}}.
     */
    function createDecorator(serviceId) {
        var ret = function (target, key, index) {
            if (arguments.length !== 3) {
                throw new Error('@IServiceName-decorator can only be used to decorate a parameter');
            }
            if (target[_util.DI_TARGET] === target) {
                target[_util.DI_DEPENDENCIES].push({ serviceId: serviceId, index: index });
            }
            else {
                target[_util.DI_DEPENDENCIES] = [{ serviceId: serviceId, index: index }];
                target[_util.DI_TARGET] = target;
            }
        };
        ret[_util.DI_PROVIDES] = serviceId;
        // ret['type'] = undefined;
        return ret;
    }
    exports.createDecorator = createDecorator;
});
