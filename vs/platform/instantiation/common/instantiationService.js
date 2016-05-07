define(["require", "exports", 'vs/base/common/winjs.base', 'vs/base/common/errors', 'vs/base/common/strings', 'vs/base/common/types', 'vs/base/common/collections', './descriptors', 'vs/base/common/graph', './instantiation'], function (require, exports, winjs, errors, strings, types, collections, descriptors, graph_1, instantiation) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var IInstantiationService = instantiation.IInstantiationService;
    /**
     * Creates a new instance of an instantiation service.
     */
    function createInstantiationService(services) {
        if (services === void 0) { services = Object.create(null); }
        var result = new InstantiationService(services, new AccessLock());
        return result;
    }
    exports.createInstantiationService = createInstantiationService;
    var AccessLock = (function () {
        function AccessLock() {
            this._value = 0;
        }
        Object.defineProperty(AccessLock.prototype, "locked", {
            get: function () {
                return this._value === 0;
            },
            enumerable: true,
            configurable: true
        });
        AccessLock.prototype.runUnlocked = function (r) {
            this._value++;
            try {
                return r();
            }
            finally {
                this._value--;
            }
        };
        return AccessLock;
    }());
    var ServicesMap = (function () {
        function ServicesMap(_services, _lock) {
            var _this = this;
            this._services = _services;
            this._lock = _lock;
            collections.forEach(this._services, function (entry) {
                // add a accessor to myselves
                _this.registerService(entry.key, entry.value);
            });
        }
        ServicesMap.prototype.registerService = function (name, service) {
            var _this = this;
            // add a accessor to myselves
            Object.defineProperty(this, name, {
                get: function () {
                    if (_this._lock.locked) {
                        throw errors.illegalState('the services map can only be used during construction');
                    }
                    if (!service) {
                        throw errors.illegalArgument(strings.format('service with \'{0}\' not found', name));
                    }
                    if (service instanceof descriptors.SyncDescriptor) {
                        var cached = _this._services[name];
                        if (cached instanceof descriptors.SyncDescriptor) {
                            _this._ensureInstances(name, service);
                            service = _this._services[name];
                        }
                        else {
                            service = cached;
                        }
                    }
                    return service;
                },
                set: function (value) {
                    throw errors.illegalState('services cannot be changed');
                },
                configurable: false,
                enumerable: false
            });
            // add to services map
            this._services[name] = service;
        };
        Object.defineProperty(ServicesMap.prototype, "lock", {
            get: function () {
                return this._lock;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ServicesMap.prototype, "services", {
            get: function () {
                return this._services;
            },
            enumerable: true,
            configurable: true
        });
        ServicesMap.prototype._ensureInstances = function (serviceId, desc) {
            var seen = Object.create(null);
            var graph = new graph_1.Graph(function (i) { return i.serviceId; });
            function throwCycleError() {
                var err = new Error('[createInstance cyclic dependency between services]');
                err.message = graph.toString();
                throw err;
            }
            var stack = [{ serviceId: serviceId, desc: desc }];
            while (stack.length) {
                var item = stack.pop();
                graph.lookupOrInsertNode(item);
                // check for cycles between the descriptors
                if (seen[item.serviceId]) {
                    throwCycleError();
                }
                seen[item.serviceId] = true;
                // check all dependencies for existence and if the need to be created first
                var dependencies = instantiation._util.getServiceDependencies(item.desc.ctor);
                if (Array.isArray(dependencies)) {
                    for (var _i = 0, dependencies_1 = dependencies; _i < dependencies_1.length; _i++) {
                        var dependency = dependencies_1[_i];
                        var instanceOrDesc = this.services[dependency.serviceId];
                        if (!instanceOrDesc) {
                            throw new Error("[createInstance] " + serviceId + " depends on " + dependency.serviceId + " which is NOT registered.");
                        }
                        if (instanceOrDesc instanceof descriptors.SyncDescriptor) {
                            var d = { serviceId: dependency.serviceId, desc: instanceOrDesc };
                            stack.push(d);
                            graph.insertEdge(item, d);
                        }
                    }
                }
            }
            while (true) {
                var roots = graph.roots();
                // if there is no more roots but still
                // nodes in the graph we have a cycle
                if (roots.length === 0) {
                    if (graph.length !== 0) {
                        throwCycleError();
                    }
                    break;
                }
                for (var _a = 0, roots_1 = roots; _a < roots_1.length; _a++) {
                    var root = roots_1[_a];
                    var instance = this.createInstance(root.data.desc, []);
                    this._services[root.data.serviceId] = instance;
                    graph.removeNode(root.data);
                }
            }
        };
        ServicesMap.prototype.invokeFunction = function (fn, args) {
            var _this = this;
            return this._lock.runUnlocked(function () {
                var accessor = {
                    get: function (id) {
                        var value = instantiation._util.getServiceId(id);
                        return _this[value];
                    }
                };
                return fn.apply(undefined, [accessor].concat(args));
            });
        };
        ServicesMap.prototype.createInstance = function (descriptor, args) {
            var _this = this;
            var allArguments = [];
            var serviceInjections = instantiation._util.getServiceDependencies(descriptor.ctor) || [];
            var fixedArguments = descriptor.staticArguments().concat(args);
            var expectedFirstServiceIndex = fixedArguments.length;
            var actualFirstServiceIndex = Number.MAX_VALUE;
            serviceInjections.forEach(function (si) {
                // @IServiceName
                var serviceId = si.serviceId, index = si.index;
                var service = _this._lock.runUnlocked(function () { return _this[serviceId]; });
                allArguments[index] = service;
                actualFirstServiceIndex = Math.min(actualFirstServiceIndex, si.index);
            });
            // insert the fixed arguments into the array of all ctor
            // arguments. don't overwrite existing values tho it indicates
            // something is off
            var i = 0;
            for (var _i = 0, fixedArguments_1 = fixedArguments; _i < fixedArguments_1.length; _i++) {
                var arg = fixedArguments_1[_i];
                var hasValue = allArguments[i] !== void 0;
                if (!hasValue) {
                    allArguments[i] = arg;
                }
                i += 1;
            }
            allArguments.unshift(descriptor.ctor); // ctor is first arg
            // services are the last arguments of ctor-calls. We check if static ctor arguments
            // (like those from a [sync|async] desriptor) or args that are passed by createInstance
            // don't override positions of those arguments
            if (actualFirstServiceIndex !== Number.MAX_VALUE
                && actualFirstServiceIndex !== expectedFirstServiceIndex) {
                var msg = ("[createInstance] constructor '" + descriptor.ctor.name + "' has first") +
                    (" service dependency at position " + (actualFirstServiceIndex + 1) + " but is called with") +
                    (" " + (expectedFirstServiceIndex - 1) + " static arguments that are expected to come first");
                // throw new Error(msg);
                console.warn(msg);
            }
            return this._lock.runUnlocked(function () {
                var instance = types.create.apply(null, allArguments);
                descriptor._validate(instance);
                return instance;
            });
        };
        return ServicesMap;
    }());
    var InstantiationService = (function () {
        function InstantiationService(services, lock) {
            this.serviceId = IInstantiationService;
            services['instantiationService'] = this;
            this._servicesMap = new ServicesMap(services, lock);
        }
        InstantiationService.prototype.createChild = function (services) {
            var childServices = {};
            // copy existing services
            collections.forEach(this._servicesMap.services, function (entry) {
                childServices[entry.key] = entry.value;
            });
            // insert new services (might overwrite)
            collections.forEach(services, function (entry) {
                childServices[entry.key] = entry.value;
            });
            return new InstantiationService(childServices, this._servicesMap.lock);
        };
        InstantiationService.prototype.registerService = function (name, service) {
            this._servicesMap.registerService(name, service);
        };
        InstantiationService.prototype.addSingleton = function (id, instanceOrDescriptor) {
            var name = instantiation._util.getServiceId(id);
            this._servicesMap.registerService(name, instanceOrDescriptor);
        };
        InstantiationService.prototype.getInstance = function (id) {
            var _this = this;
            var name = instantiation._util.getServiceId(id);
            var result = this._servicesMap.lock.runUnlocked(function () { return _this._servicesMap[name]; });
            return result;
        };
        InstantiationService.prototype.createInstance = function (param) {
            var rest = new Array(arguments.length - 1);
            for (var i = 1, len = arguments.length; i < len; i++) {
                rest[i - 1] = arguments[i];
            }
            if (param instanceof descriptors.SyncDescriptor) {
                return this._servicesMap.createInstance(param, rest);
            }
            else if (param instanceof descriptors.AsyncDescriptor) {
                return this._createInstanceAsync(param, rest);
            }
            else {
                return this._servicesMap.createInstance(new descriptors.SyncDescriptor(param), rest);
            }
        };
        InstantiationService.prototype._createInstanceAsync = function (descriptor, args) {
            var _this = this;
            var canceled;
            return new winjs.TPromise(function (c, e, p) {
                require([descriptor.moduleName], function (_module) {
                    if (canceled) {
                        e(canceled);
                    }
                    if (!_module) {
                        return e(errors.illegalArgument('module not found: ' + descriptor.moduleName));
                    }
                    var ctor;
                    if (!descriptor.ctorName) {
                        ctor = _module;
                    }
                    else {
                        ctor = _module[descriptor.ctorName];
                    }
                    if (typeof ctor !== 'function') {
                        return e(errors.illegalArgument('not a function: ' + descriptor.ctorName || descriptor.moduleName));
                    }
                    try {
                        args.unshift.apply(args, descriptor.staticArguments()); // instead of spread in ctor call
                        c(_this._servicesMap.createInstance(new descriptors.SyncDescriptor(ctor), args));
                    }
                    catch (error) {
                        return e(error);
                    }
                }, e);
            }, function () {
                canceled = errors.canceled();
            });
        };
        InstantiationService.prototype.invokeFunction = function (signature) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return this._servicesMap.invokeFunction(signature, args);
        };
        return InstantiationService;
    }());
});
//# sourceMappingURL=instantiationService.js.map