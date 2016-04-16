var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/severity', './parser/jsonParser', 'vs/languages/json/common/features/jsonFormatter', './jsonSchemaService', './jsonIntellisense', 'vs/base/common/winjs.base', 'vs/base/common/strings', './contributions/projectJSONContribution', './contributions/packageJSONContribution', './contributions/bowerJSONContribution', './contributions/globPatternContribution', 'vs/base/common/errors', 'vs/platform/markers/common/markers', 'vs/platform/request/common/request', 'vs/platform/workspace/common/workspace', 'vs/editor/common/services/resourceService', 'vs/platform/instantiation/common/instantiation', 'vs/editor/common/modes/supports/suggestSupport', 'vs/editor/common/worker/validationHelper'], function (require, exports, severity_1, Parser, JSONFormatter, SchemaService, JSONIntellisense, WinJS, Strings, ProjectJSONContribution, PackageJSONContribution, BowerJSONContribution, GlobPatternContribution, errors, markers_1, request_1, workspace_1, resourceService_1, instantiation_1, suggestSupport_1, validationHelper_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var JSONWorker = (function () {
        function JSONWorker(modeId, resourceService, markerService, requestService, contextService, instantiationService) {
            var _this = this;
            this._modeId = modeId;
            this.resourceService = resourceService;
            this.markerService = markerService;
            this._validationHelper = new validationHelper_1.ValidationHelper(this.resourceService, this._modeId, function (toValidate) { return _this.doValidate(toValidate); });
            this.requestService = requestService;
            this.contextService = contextService;
            this.schemaService = instantiationService.createInstance(SchemaService.JSONSchemaService);
            this.contributions = [
                instantiationService.createInstance(ProjectJSONContribution.ProjectJSONContribution),
                instantiationService.createInstance(PackageJSONContribution.PackageJSONContribution),
                instantiationService.createInstance(BowerJSONContribution.BowerJSONContribution),
                instantiationService.createInstance(GlobPatternContribution.GlobPatternContribution)
            ];
            this.jsonIntellisense = new JSONIntellisense.JSONIntellisense(this.schemaService, this.requestService, this.contributions);
        }
        JSONWorker.prototype.navigateValueSet = function (resource, range, up) {
            var _this = this;
            var modelMirror = this.resourceService.get(resource);
            var offset = modelMirror.getOffsetFromPosition({ lineNumber: range.startLineNumber, column: range.startColumn });
            var parser = new Parser.JSONParser();
            var config = new Parser.JSONDocumentConfig();
            config.ignoreDanglingComma = true;
            var doc = parser.parse(modelMirror.getValue(), config);
            var node = doc.getNodeFromOffsetEndInclusive(offset);
            if (node && (node.type === 'string' || node.type === 'number' || node.type === 'boolean' || node.type === 'null')) {
                return this.schemaService.getSchemaForResource(resource.toString(), doc).then(function (schema) {
                    if (schema) {
                        var proposals = [];
                        var proposed = {};
                        var collector = {
                            add: function (suggestion) {
                                if (!proposed[suggestion.label]) {
                                    proposed[suggestion.label] = true;
                                    proposals.push(suggestion);
                                }
                            },
                            setAsIncomplete: function () { },
                            error: function (message) {
                                errors.onUnexpectedError(message);
                            }
                        };
                        _this.jsonIntellisense.getValueSuggestions(resource, schema, doc, node.parent, node.start, collector);
                        var range = modelMirror.getRangeFromOffsetAndLength(node.start, node.end - node.start);
                        var text = modelMirror.getValueInRange(range);
                        for (var i = 0, len = proposals.length; i < len; i++) {
                            if (Strings.equalsIgnoreCase(proposals[i].label, text)) {
                                var nextIdx = i;
                                if (up) {
                                    nextIdx = (i + 1) % len;
                                }
                                else {
                                    nextIdx = i - 1;
                                    if (nextIdx < 0) {
                                        nextIdx = len - 1;
                                    }
                                }
                                return {
                                    value: proposals[nextIdx].label,
                                    range: range
                                };
                            }
                        }
                        return null;
                    }
                });
            }
            return null;
        };
        /**
         * @return true if you want to revalidate your models
         */
        JSONWorker.prototype._doConfigure = function (options) {
            var _this = this;
            if (options && options.schemas) {
                this.schemaService.clearExternalSchemas();
                options.schemas.forEach(function (schema) {
                    if (schema.url && (schema.fileMatch || schema.schema)) {
                        var url = schema.url;
                        if (!Strings.startsWith(url, 'http://') && !Strings.startsWith(url, 'https://') && !Strings.startsWith(url, 'file://')) {
                            var resourceURL = _this.contextService.toResource(url);
                            if (resourceURL) {
                                url = resourceURL.toString();
                            }
                        }
                        if (url) {
                            _this.schemaService.registerExternalSchema(url, schema.fileMatch, schema.schema);
                        }
                    }
                    else if (schema.filePattern && schema.schemaPath) {
                        var url = _this.contextService.toResource(schema.schemaPath).toString();
                        var patterns = schema.filePattern ? [schema.filePattern] : [];
                        _this.schemaService.registerExternalSchema(url, patterns);
                    }
                });
            }
            this._validationHelper.triggerDueToConfigurationChange();
            return WinJS.TPromise.as(void 0);
        };
        JSONWorker.prototype.setSchemaContributions = function (contributions) {
            this.schemaService.setSchemaContributions(contributions);
            return WinJS.TPromise.as(true);
        };
        JSONWorker.prototype.enableValidator = function () {
            this._validationHelper.enable();
            return WinJS.TPromise.as(null);
        };
        JSONWorker.prototype.doValidate = function (resources) {
            for (var i = 0; i < resources.length; i++) {
                this.doValidate1(resources[i]);
            }
        };
        JSONWorker.prototype.doValidate1 = function (resource) {
            var _this = this;
            var modelMirror = this.resourceService.get(resource);
            var parser = new Parser.JSONParser();
            var content = modelMirror.getValue();
            if (content.length === 0) {
                // ignore empty content, no marker can be set anyway
                return;
            }
            var result = parser.parse(content);
            this.schemaService.getSchemaForResource(resource.toString(), result).then(function (schema) {
                if (schema) {
                    if (schema.errors.length && result.root) {
                        var property = result.root.type === 'object' ? result.root.getFirstProperty('$schema') : null;
                        if (property) {
                            var node = property.value || property;
                            result.warnings.push({ location: { start: node.start, end: node.end }, message: schema.errors[0] });
                        }
                        else {
                            result.warnings.push({ location: { start: result.root.start, end: result.root.start + 1 }, message: schema.errors[0] });
                        }
                    }
                    else {
                        result.validate(schema.schema);
                    }
                }
                var added = {};
                var markerData = [];
                result.errors.concat(result.warnings).forEach(function (error, idx) {
                    // remove duplicated messages
                    var signature = error.location.start + ' ' + error.location.end + ' ' + error.message;
                    if (!added[signature]) {
                        added[signature] = true;
                        var startPosition = modelMirror.getPositionFromOffset(error.location.start);
                        var endPosition = modelMirror.getPositionFromOffset(error.location.end);
                        markerData.push({
                            message: error.message,
                            severity: idx >= result.errors.length ? severity_1.default.Warning : severity_1.default.Error,
                            startLineNumber: startPosition.lineNumber,
                            startColumn: startPosition.column,
                            endLineNumber: endPosition.lineNumber,
                            endColumn: endPosition.column
                        });
                    }
                });
                _this.markerService.changeOne(_this._modeId, resource, markerData);
            });
        };
        JSONWorker.prototype.suggest = function (resource, position) {
            return this.doSuggest(resource, position).then(function (value) { return suggestSupport_1.filterSuggestions(value); });
        };
        JSONWorker.prototype.doSuggest = function (resource, position) {
            var modelMirror = this.resourceService.get(resource);
            return this.jsonIntellisense.doSuggest(resource, modelMirror, position);
        };
        JSONWorker.prototype.computeInfo = function (resource, position) {
            var _this = this;
            var modelMirror = this.resourceService.get(resource);
            var parser = new Parser.JSONParser();
            var doc = parser.parse(modelMirror.getValue());
            var offset = modelMirror.getOffsetFromPosition(position);
            var node = doc.getNodeFromOffset(offset);
            var originalNode = node;
            // use the property description when hovering over an object key
            if (node && node.type === 'string') {
                var stringNode = node;
                if (stringNode.isKey) {
                    var propertyNode = node.parent;
                    node = propertyNode.value;
                }
            }
            if (!node) {
                return WinJS.TPromise.as(null);
            }
            return this.schemaService.getSchemaForResource(resource.toString(), doc).then(function (schema) {
                if (schema) {
                    var matchingSchemas = [];
                    doc.validate(schema.schema, matchingSchemas, node.start);
                    var description = null;
                    var contributonId = null;
                    matchingSchemas.every(function (s) {
                        if (s.node === node && !s.inverted && s.schema) {
                            description = description || s.schema.description;
                            contributonId = contributonId || s.schema.id;
                        }
                        return true;
                    });
                    var location = node.getNodeLocation();
                    for (var i = _this.contributions.length - 1; i >= 0; i--) {
                        var contribution = _this.contributions[i];
                        var promise = contribution.getInfoContribution(resource, location);
                        if (promise) {
                            return promise.then(function (htmlContent) { return _this.createInfoResult(htmlContent, originalNode, modelMirror); });
                        }
                    }
                    if (description) {
                        var htmlContent = [{ className: 'documentation', text: description }];
                        return _this.createInfoResult(htmlContent, originalNode, modelMirror);
                    }
                }
                return null;
            });
        };
        JSONWorker.prototype.createInfoResult = function (htmlContent, node, modelMirror) {
            var range = modelMirror.getRangeFromOffsetAndLength(node.start, node.end - node.start);
            var result = {
                value: '',
                htmlContent: htmlContent,
                className: 'typeInfo json',
                range: range
            };
            return result;
        };
        JSONWorker.prototype.getOutline = function (resource) {
            var modelMirror = this.resourceService.get(resource);
            var parser = new Parser.JSONParser();
            var doc = parser.parse(modelMirror.getValue());
            var root = doc.root;
            if (!root) {
                return WinJS.TPromise.as(null);
            }
            // special handling for key bindings
            var resourceString = resource.toString();
            if ((resourceString === 'vscode://defaultsettings/keybindings.json') || Strings.endsWith(resourceString.toLowerCase(), '/user/keybindings.json')) {
                if (root.type === 'array') {
                    var result = [];
                    root.items.forEach(function (item) {
                        if (item.type === 'object') {
                            var property = item.getFirstProperty('key');
                            if (property && property.value) {
                                var range = modelMirror.getRangeFromOffsetAndLength(item.start, item.end - item.start);
                                result.push({ label: property.value.getValue(), icon: 'function', type: 'string', range: range, children: [] });
                            }
                        }
                    });
                    return WinJS.TPromise.as(result);
                }
            }
            function collectOutlineEntries(result, node) {
                if (node.type === 'array') {
                    node.items.forEach(function (node) {
                        collectOutlineEntries(result, node);
                    });
                }
                else if (node.type === 'object') {
                    var objectNode = node;
                    objectNode.properties.forEach(function (property) {
                        var range = modelMirror.getRangeFromOffsetAndLength(property.start, property.end - property.start);
                        var valueNode = property.value;
                        if (valueNode) {
                            var children = collectOutlineEntries([], valueNode);
                            var icon = valueNode.type === 'object' ? 'module' : valueNode.type;
                            result.push({ label: property.key.getValue(), icon: icon, type: valueNode.type, range: range, children: children });
                        }
                    });
                }
                return result;
            }
            var result = collectOutlineEntries([], root);
            return WinJS.TPromise.as(result);
        };
        JSONWorker.prototype.format = function (resource, range, options) {
            var model = this.resourceService.get(resource);
            return WinJS.TPromise.as(JSONFormatter.format(model, range, options));
        };
        JSONWorker = __decorate([
            __param(1, resourceService_1.IResourceService),
            __param(2, markers_1.IMarkerService),
            __param(3, request_1.IRequestService),
            __param(4, workspace_1.IWorkspaceContextService),
            __param(5, instantiation_1.IInstantiationService)
        ], JSONWorker);
        return JSONWorker;
    }());
    exports.JSONWorker = JSONWorker;
});
//# sourceMappingURL=jsonWorker.js.map