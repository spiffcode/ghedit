var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'assert', 'vs/platform/instantiation/common/instantiation', 'vs/platform/instantiation/common/instantiationService', 'vs/platform/instantiation/common/serviceCollection', 'vs/platform/instantiation/common/descriptors'], function (require, exports, assert, instantiation_1, instantiationService_1, serviceCollection_1, descriptors_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var IService1 = instantiation_1.createDecorator('service1');
    var Service1 = (function () {
        function Service1() {
            this.serviceId = IService1;
            this.c = 1;
        }
        return Service1;
    }());
    var IService2 = instantiation_1.createDecorator('service2');
    var Service2 = (function () {
        function Service2() {
            this.serviceId = IService2;
            this.d = true;
        }
        return Service2;
    }());
    var IService3 = instantiation_1.createDecorator('service3');
    var Service3 = (function () {
        function Service3() {
            this.serviceId = IService3;
            this.s = 'farboo';
        }
        return Service3;
    }());
    var IDependentService = instantiation_1.createDecorator('dependentService');
    var DependentService = (function () {
        function DependentService(service) {
            this.serviceId = IDependentService;
            this.name = 'farboo';
            assert.equal(service.c, 1);
        }
        DependentService = __decorate([
            __param(0, IService1)
        ], DependentService);
        return DependentService;
    }());
    var Target1Dep = (function () {
        function Target1Dep(service1) {
            assert.ok(service1);
            assert.equal(service1.c, 1);
        }
        Target1Dep = __decorate([
            __param(0, IService1)
        ], Target1Dep);
        return Target1Dep;
    }());
    var Target2Dep = (function () {
        function Target2Dep(service1, service2) {
            assert.ok(service1 instanceof Service1);
            assert.ok(service2 instanceof Service2);
        }
        Target2Dep = __decorate([
            __param(0, IService1),
            __param(1, IService2)
        ], Target2Dep);
        return Target2Dep;
    }());
    var TargetWithStaticParam = (function () {
        function TargetWithStaticParam(v, service1) {
            assert.ok(v);
            assert.ok(service1);
            assert.equal(service1.c, 1);
        }
        TargetWithStaticParam = __decorate([
            __param(1, IService1)
        ], TargetWithStaticParam);
        return TargetWithStaticParam;
    }());
    var TargetNotOptional = (function () {
        function TargetNotOptional(service1, service2) {
        }
        TargetNotOptional = __decorate([
            __param(0, IService1),
            __param(1, IService2)
        ], TargetNotOptional);
        return TargetNotOptional;
    }());
    var TargetOptional = (function () {
        function TargetOptional(service1, service2) {
            assert.ok(service1);
            assert.equal(service1.c, 1);
            assert.ok(service2 === void 0);
        }
        TargetOptional = __decorate([
            __param(0, IService1),
            __param(1, instantiation_1.optional(IService2))
        ], TargetOptional);
        return TargetOptional;
    }());
    var DependentServiceTarget = (function () {
        function DependentServiceTarget(d) {
            assert.ok(d);
            assert.equal(d.name, 'farboo');
        }
        DependentServiceTarget = __decorate([
            __param(0, IDependentService)
        ], DependentServiceTarget);
        return DependentServiceTarget;
    }());
    var DependentServiceTarget2 = (function () {
        function DependentServiceTarget2(d, s) {
            assert.ok(d);
            assert.equal(d.name, 'farboo');
            assert.ok(s);
            assert.equal(s.c, 1);
        }
        DependentServiceTarget2 = __decorate([
            __param(0, IDependentService),
            __param(1, IService1)
        ], DependentServiceTarget2);
        return DependentServiceTarget2;
    }());
    var ServiceLoop1 = (function () {
        function ServiceLoop1(s) {
            this.serviceId = IService1;
            this.c = 1;
        }
        ServiceLoop1 = __decorate([
            __param(0, IService2)
        ], ServiceLoop1);
        return ServiceLoop1;
    }());
    var ServiceLoop2 = (function () {
        function ServiceLoop2(s) {
            this.serviceId = IService2;
            this.d = true;
        }
        ServiceLoop2 = __decorate([
            __param(0, IService1)
        ], ServiceLoop2);
        return ServiceLoop2;
    }());
    suite('Instantiation Service', function () {
        test('service collection, cannot overwrite', function () {
            var collection = new serviceCollection_1.ServiceCollection();
            var result = collection.set(IService1, null);
            assert.equal(result, undefined);
            result = collection.set(IService1, new Service1());
            assert.equal(result, null);
        });
        test('service collection, add/has', function () {
            var collection = new serviceCollection_1.ServiceCollection();
            collection.set(IService1, null);
            assert.ok(collection.has(IService1));
            collection.set(IService2, null);
            assert.ok(collection.has(IService1));
            assert.ok(collection.has(IService2));
        });
        test('@Param - simple clase', function () {
            var collection = new serviceCollection_1.ServiceCollection();
            var service = new instantiationService_1.InstantiationService(collection);
            collection.set(IService1, new Service1());
            collection.set(IService2, new Service2());
            collection.set(IService3, new Service3());
            service.createInstance(Target1Dep);
        });
        test('@Param - fixed args', function () {
            var collection = new serviceCollection_1.ServiceCollection();
            var service = new instantiationService_1.InstantiationService(collection);
            collection.set(IService1, new Service1());
            collection.set(IService2, new Service2());
            collection.set(IService3, new Service3());
            service.createInstance(TargetWithStaticParam, true);
        });
        test('service collection is live', function () {
            var collection = new serviceCollection_1.ServiceCollection();
            collection.set(IService1, new Service1());
            var service = new instantiationService_1.InstantiationService(collection);
            service.createInstance(Target1Dep);
            // no IService2
            assert.throws(function () { return service.createInstance(Target2Dep); });
            service.invokeFunction(function (a) {
                assert.ok(a.get(IService1));
                assert.ok(!a.get(IService2));
            });
            collection.set(IService2, new Service2());
            service.createInstance(Target2Dep);
            service.invokeFunction(function (a) {
                assert.ok(a.get(IService1));
                assert.ok(a.get(IService2));
            });
        });
        test('@Param - optional', function () {
            var collection = new serviceCollection_1.ServiceCollection([IService1, new Service1()]);
            var service = new instantiationService_1.InstantiationService(collection, true);
            service.createInstance(TargetOptional);
            assert.throws(function () { return service.createInstance(TargetNotOptional); });
            service = new instantiationService_1.InstantiationService(collection, false);
            service.createInstance(TargetOptional);
            service.createInstance(TargetNotOptional);
        });
        // we made this a warning
        // test('@Param - too many args', function () {
        // 	let service = instantiationService.create(Object.create(null));
        // 	service.addSingleton(IService1, new Service1());
        // 	service.addSingleton(IService2, new Service2());
        // 	service.addSingleton(IService3, new Service3());
        // 	assert.throws(() => service.createInstance(ParameterTarget2, true, 2));
        // });
        // test('@Param - too few args', function () {
        // 	let service = instantiationService.create(Object.create(null));
        // 	service.addSingleton(IService1, new Service1());
        // 	service.addSingleton(IService2, new Service2());
        // 	service.addSingleton(IService3, new Service3());
        // 	assert.throws(() => service.createInstance(ParameterTarget2));
        // });
        test('SyncDesc - no dependencies', function () {
            var collection = new serviceCollection_1.ServiceCollection();
            var service = new instantiationService_1.InstantiationService(collection);
            collection.set(IService1, new descriptors_1.SyncDescriptor(Service1));
            service.invokeFunction(function (accessor) {
                var service1 = accessor.get(IService1);
                assert.ok(service1);
                assert.equal(service1.c, 1);
                var service2 = accessor.get(IService1);
                assert.ok(service1 === service2);
            });
        });
        test('SyncDesc - service with service dependency', function () {
            var collection = new serviceCollection_1.ServiceCollection();
            var service = new instantiationService_1.InstantiationService(collection);
            collection.set(IService1, new descriptors_1.SyncDescriptor(Service1));
            collection.set(IDependentService, new descriptors_1.SyncDescriptor(DependentService));
            service.invokeFunction(function (accessor) {
                var d = accessor.get(IDependentService);
                assert.ok(d);
                assert.equal(d.name, 'farboo');
            });
        });
        test('SyncDesc - target depends on service future', function () {
            var collection = new serviceCollection_1.ServiceCollection();
            var service = new instantiationService_1.InstantiationService(collection);
            collection.set(IService1, new descriptors_1.SyncDescriptor(Service1));
            collection.set(IDependentService, new descriptors_1.SyncDescriptor(DependentService));
            var d = service.createInstance(DependentServiceTarget);
            assert.ok(d instanceof DependentServiceTarget);
            var d2 = service.createInstance(DependentServiceTarget2);
            assert.ok(d2 instanceof DependentServiceTarget2);
        });
        test('SyncDesc - explode on loop', function () {
            var collection = new serviceCollection_1.ServiceCollection();
            var service = new instantiationService_1.InstantiationService(collection);
            collection.set(IService1, new descriptors_1.SyncDescriptor(ServiceLoop1));
            collection.set(IService2, new descriptors_1.SyncDescriptor(ServiceLoop2));
            assert.throws(function () {
                service.invokeFunction(function (accessor) {
                    accessor.get(IService1);
                });
            });
            assert.throws(function () {
                service.invokeFunction(function (accessor) {
                    accessor.get(IService2);
                });
            });
            try {
                service.invokeFunction(function (accessor) {
                    accessor.get(IService1);
                });
            }
            catch (err) {
                assert.ok(err.name);
                assert.ok(err.message);
            }
        });
        test('Invoke - get services', function () {
            var collection = new serviceCollection_1.ServiceCollection();
            var service = new instantiationService_1.InstantiationService(collection);
            collection.set(IService1, new Service1());
            collection.set(IService2, new Service2());
            function test(accessor) {
                assert.ok(accessor.get(IService1) instanceof Service1);
                assert.equal(accessor.get(IService1).c, 1);
                return true;
            }
            assert.equal(service.invokeFunction(test), true);
        });
        test('Invoke - keeping accessor NOT allowed', function () {
            var collection = new serviceCollection_1.ServiceCollection();
            var service = new instantiationService_1.InstantiationService(collection);
            collection.set(IService1, new Service1());
            collection.set(IService2, new Service2());
            var cached;
            function test(accessor) {
                assert.ok(accessor.get(IService1) instanceof Service1);
                assert.equal(accessor.get(IService1).c, 1);
                cached = accessor;
                return true;
            }
            assert.equal(service.invokeFunction(test), true);
            assert.throws(function () { return cached.get(IService2); });
        });
        test('Invoke - throw error', function () {
            var collection = new serviceCollection_1.ServiceCollection();
            var service = new instantiationService_1.InstantiationService(collection);
            collection.set(IService1, new Service1());
            collection.set(IService2, new Service2());
            function test(accessor) {
                throw new Error();
            }
            assert.throws(function () { return service.invokeFunction(test); });
        });
    });
});
//# sourceMappingURL=instantiationService.test.js.map