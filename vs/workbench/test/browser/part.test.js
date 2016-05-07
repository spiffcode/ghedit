/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'assert', 'vs/base/browser/builder', 'vs/workbench/browser/part', 'vs/base/common/types', 'vs/workbench/test/browser/servicesTestUtils', 'vs/platform/workspace/common/baseWorkspaceContextService', 'vs/workbench/common/storage'], function (require, exports, assert, builder_1, part_1, Types, TestUtils, baseWorkspaceContextService_1, storage_1) {
    'use strict';
    var MyPart = (function (_super) {
        __extends(MyPart, _super);
        function MyPart(expectedParent) {
            _super.call(this, 'myPart');
            this.expectedParent = expectedParent;
        }
        MyPart.prototype.createTitleArea = function (parent) {
            assert.strictEqual(parent, this.expectedParent);
            return _super.prototype.createTitleArea.call(this, parent);
        };
        MyPart.prototype.createContentArea = function (parent) {
            assert.strictEqual(parent, this.expectedParent);
            return _super.prototype.createContentArea.call(this, parent);
        };
        MyPart.prototype.createStatusArea = function (parent) {
            assert.strictEqual(parent, this.expectedParent);
            return _super.prototype.createStatusArea.call(this, parent);
        };
        return MyPart;
    }(part_1.Part));
    var MyPart2 = (function (_super) {
        __extends(MyPart2, _super);
        function MyPart2() {
            _super.call(this, 'myPart2');
        }
        MyPart2.prototype.createTitleArea = function (parent) {
            return parent.div(function (div) {
                div.span({
                    id: 'myPart.title',
                    innerHtml: 'Title'
                });
            });
        };
        MyPart2.prototype.createContentArea = function (parent) {
            return parent.div(function (div) {
                div.span({
                    id: 'myPart.content',
                    innerHtml: 'Content'
                });
            });
        };
        MyPart2.prototype.createStatusArea = function (parent) {
            return parent.div(function (div) {
                div.span({
                    id: 'myPart.status',
                    innerHtml: 'Status'
                });
            });
        };
        return MyPart2;
    }(part_1.Part));
    var MyPart3 = (function (_super) {
        __extends(MyPart3, _super);
        function MyPart3() {
            _super.call(this, 'myPart2');
        }
        MyPart3.prototype.createTitleArea = function (parent) {
            return null;
        };
        MyPart3.prototype.createContentArea = function (parent) {
            return parent.div(function (div) {
                div.span({
                    id: 'myPart.content',
                    innerHtml: 'Content'
                });
            });
        };
        MyPart3.prototype.createStatusArea = function (parent) {
            return null;
        };
        return MyPart3;
    }(part_1.Part));
    suite('Workbench Part', function () {
        var fixture;
        var fixtureId = 'workbench-part-fixture';
        var context;
        var storage;
        setup(function () {
            fixture = document.createElement('div');
            fixture.id = fixtureId;
            document.body.appendChild(fixture);
            context = new baseWorkspaceContextService_1.BaseWorkspaceContextService(TestUtils.TestWorkspace, TestUtils.TestConfiguration, null);
            storage = new storage_1.Storage(context, new storage_1.InMemoryLocalStorage());
        });
        teardown(function () {
            document.body.removeChild(fixture);
        });
        test('Creation', function () {
            var b = builder_1.Build.withElementById(fixtureId);
            b.div().hide();
            var part = new MyPart(b);
            part.create(b);
            assert.strictEqual(part.getId(), 'myPart');
            assert.strictEqual(part.getContainer(), b);
            // Memento
            var memento = part.getMemento(storage);
            assert(memento);
            memento.foo = 'bar';
            memento.bar = [1, 2, 3];
            part.shutdown();
            // Re-Create to assert memento contents
            part = new MyPart(b);
            memento = part.getMemento(storage);
            assert(memento);
            assert.strictEqual(memento.foo, 'bar');
            assert.strictEqual(memento.bar.length, 3);
            // Empty Memento stores empty object
            delete memento.foo;
            delete memento.bar;
            part.shutdown();
            part = new MyPart(b);
            memento = part.getMemento(storage);
            assert(memento);
            assert.strictEqual(Types.isEmptyObject(memento), true);
        });
        test('Part Layout with Title, Content and Status', function () {
            var b = builder_1.Build.withElementById(fixtureId);
            b.div().hide();
            var part = new MyPart2();
            part.create(b);
            assert(builder_1.Build.withElementById('myPart.title'));
            assert(builder_1.Build.withElementById('myPart.content'));
            assert(builder_1.Build.withElementById('myPart.status'));
        });
        test('Part Layout with Content only', function () {
            var b = builder_1.Build.withElementById(fixtureId);
            b.div().hide();
            var part = new MyPart3();
            part.create(b);
            assert(!builder_1.Build.withElementById('myPart.title'));
            assert(builder_1.Build.withElementById('myPart.content'));
            assert(!builder_1.Build.withElementById('myPart.status'));
        });
    });
});
//# sourceMappingURL=part.test.js.map