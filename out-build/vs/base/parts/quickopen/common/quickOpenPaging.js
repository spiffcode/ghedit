/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    var PagedRenderer = (function () {
        function PagedRenderer(model, renderer) {
            this.model = model;
            this.renderer = renderer;
        }
        PagedRenderer.prototype.getHeight = function (stub) {
            return this.renderer.getHeight(null);
        };
        PagedRenderer.prototype.getTemplateId = function (stub) {
            return this.renderer.getTemplateId(null);
        };
        PagedRenderer.prototype.renderTemplate = function (templateId, container) {
            var data = this.renderer.renderTemplate(templateId, container);
            return { data: data, disposable: { dispose: function () { } } };
        };
        PagedRenderer.prototype.renderElement = function (_a, templateId, data) {
            var _this = this;
            var index = _a.index;
            data.disposable.dispose();
            if (this.model.isResolved(index)) {
                return this.renderer.renderElement(this.model.get(index), templateId, data.data);
            }
            var promise = this.model.resolve(index);
            data.disposable = { dispose: function () { return promise.cancel(); } };
            this.renderer.renderPlaceholder(index, templateId, data.data);
            promise.done(function (entry) { return _this.renderer.renderElement(entry, templateId, data.data); });
        };
        PagedRenderer.prototype.disposeTemplate = function (templateId, data) {
            data.disposable.dispose();
            data.disposable = null;
            this.renderer.disposeTemplate(templateId, data.data);
        };
        return PagedRenderer;
    }());
    var PagedDataSource = (function () {
        function PagedDataSource(model, dataSource) {
            this.model = model;
            this.dataSource = dataSource;
        }
        PagedDataSource.prototype.getId = function (_a) {
            var index = _a.index;
            return "paged-" + index;
        };
        PagedDataSource.prototype.getLabel = function (_a) {
            var index = _a.index;
            return this.model.isResolved(index) ? this.dataSource.getLabel(this.model.get(index)) : '';
        };
        return PagedDataSource;
    }());
    var PagedRunner = (function () {
        function PagedRunner(model, runner) {
            this.model = model;
            this.runner = runner;
        }
        PagedRunner.prototype.run = function (_a, mode, context) {
            var index = _a.index;
            if (this.model.isResolved(index)) {
                return this.runner.run(this.model.get(index), mode, context);
            }
            return false;
        };
        return PagedRunner;
    }());
    var QuickOpenPagedModel = (function () {
        function QuickOpenPagedModel(model, dataSource, renderer, runner) {
            this.dataSource = new PagedDataSource(model, dataSource);
            this.renderer = new PagedRenderer(model, renderer);
            this.runner = new PagedRunner(model, runner);
            // this.filter = new PagedFilter(model, filter);
            // this.accessibilityProvider = new PagedAccessibilityProvider(model, accessibilityProvider);
            this.entries = [];
            for (var index = 0, len = model.length; index < len; index++) {
                this.entries.push({ index: index });
            }
        }
        return QuickOpenPagedModel;
    }());
    exports.QuickOpenPagedModel = QuickOpenPagedModel;
});
//# sourceMappingURL=quickOpenPaging.js.map