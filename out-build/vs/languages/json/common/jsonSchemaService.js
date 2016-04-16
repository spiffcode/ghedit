/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/nls!vs/languages/json/common/jsonSchemaService', 'vs/base/common/objects', 'vs/base/common/json', 'vs/base/common/http', 'vs/base/common/strings', 'vs/base/common/uri', 'vs/base/common/types', 'vs/base/common/winjs.base', 'vs/editor/common/services/resourceService', 'vs/platform/request/common/request', 'vs/platform/workspace/common/workspace', 'vs/platform/telemetry/common/telemetry'], function (require, exports, nls, Objects, Json, http, Strings, uri_1, Types, WinJS, resourceService_1, request_1, workspace_1, telemetry_1) {
    'use strict';
    var FilePatternAssociation = (function () {
        function FilePatternAssociation(pattern) {
            this.combinedSchemaId = 'local://combinedSchema/' + encodeURIComponent(pattern);
            try {
                this.patternRegExp = new RegExp(Strings.convertSimple2RegExpPattern(pattern) + '$');
            }
            catch (e) {
                // invalid pattern
                this.patternRegExp = null;
            }
            this.schemas = [];
            this.combinedSchema = null;
        }
        FilePatternAssociation.prototype.addSchema = function (id) {
            this.schemas.push(id);
            this.combinedSchema = null;
        };
        FilePatternAssociation.prototype.matchesPattern = function (fileName) {
            return this.patternRegExp && this.patternRegExp.test(fileName);
        };
        FilePatternAssociation.prototype.getCombinedSchema = function (service) {
            if (!this.combinedSchema) {
                this.combinedSchema = service.createCombinedSchema(this.combinedSchemaId, this.schemas);
            }
            return this.combinedSchema;
        };
        return FilePatternAssociation;
    }());
    var SchemaHandle = (function () {
        function SchemaHandle(service, url, unresolvedSchemaContent) {
            this.service = service;
            this.url = url;
            if (unresolvedSchemaContent) {
                this.unresolvedSchema = WinJS.TPromise.as(new UnresolvedSchema(unresolvedSchemaContent));
            }
        }
        SchemaHandle.prototype.getUnresolvedSchema = function () {
            if (!this.unresolvedSchema) {
                this.unresolvedSchema = this.service.loadSchema(this.url);
            }
            return this.unresolvedSchema;
        };
        SchemaHandle.prototype.getResolvedSchema = function () {
            var _this = this;
            if (!this.resolvedSchema) {
                this.resolvedSchema = this.getUnresolvedSchema().then(function (unresolved) {
                    return _this.service.resolveSchemaContent(unresolved);
                });
            }
            return this.resolvedSchema;
        };
        SchemaHandle.prototype.clearSchema = function () {
            this.resolvedSchema = null;
            this.unresolvedSchema = null;
        };
        return SchemaHandle;
    }());
    var UnresolvedSchema = (function () {
        function UnresolvedSchema(schema, errors) {
            if (errors === void 0) { errors = []; }
            this.schema = schema;
            this.errors = errors;
        }
        return UnresolvedSchema;
    }());
    exports.UnresolvedSchema = UnresolvedSchema;
    var ResolvedSchema = (function () {
        function ResolvedSchema(schema, errors) {
            if (errors === void 0) { errors = []; }
            this.schema = schema;
            this.errors = errors;
        }
        ResolvedSchema.prototype.getSection = function (path) {
            return this.getSectionRecursive(path, this.schema);
        };
        ResolvedSchema.prototype.getSectionRecursive = function (path, schema) {
            var _this = this;
            if (!schema || path.length === 0) {
                return schema;
            }
            var next = path.shift();
            if (schema.properties && schema.properties[next]) {
                return this.getSectionRecursive(path, schema.properties[next]);
            }
            else if (Types.isObject(schema.patternProperties)) {
                Object.keys(schema.patternProperties).forEach(function (pattern) {
                    var regex = new RegExp(pattern);
                    if (regex.test(next)) {
                        return _this.getSectionRecursive(path, schema.patternProperties[pattern]);
                    }
                });
            }
            else if (Types.isObject(schema.additionalProperties)) {
                return this.getSectionRecursive(path, schema.additionalProperties);
            }
            else if (next.match('[0-9]+')) {
                if (Types.isObject(schema.items)) {
                    return this.getSectionRecursive(path, schema.items);
                }
                else if (Array.isArray(schema.items)) {
                    try {
                        var index = parseInt(next, 10);
                        if (schema.items[index]) {
                            return this.getSectionRecursive(path, schema.items[index]);
                        }
                        return null;
                    }
                    catch (e) {
                        return null;
                    }
                }
            }
            return null;
        };
        return ResolvedSchema;
    }());
    exports.ResolvedSchema = ResolvedSchema;
    var JSONSchemaService = (function () {
        function JSONSchemaService(requestService, telemetryService, contextService, resourceService) {
            var _this = this;
            this.requestService = requestService;
            this.contextService = contextService;
            this.telemetryService = telemetryService;
            this.callOnDispose = [];
            if (resourceService) {
                this.callOnDispose.push(resourceService.addListener_(resourceService_1.ResourceEvents.CHANGED, function (e) { return _this.onResourceChange(e); }));
            }
            this.contributionSchemas = {};
            this.contributionAssociations = {};
            this.schemasById = {};
            this.filePatternAssociations = [];
            this.filePatternAssociationById = {};
        }
        JSONSchemaService.prototype.dispose = function () {
            while (this.callOnDispose.length > 0) {
                this.callOnDispose.pop()();
            }
        };
        JSONSchemaService.prototype.onResourceChange = function (e) {
            var url = e.url.toString();
            var schemaFile = this.schemasById[url];
            if (schemaFile) {
                schemaFile.clearSchema();
            }
        };
        JSONSchemaService.prototype.normalizeId = function (id) {
            if (id.length > 0 && id.charAt(id.length - 1) === '#') {
                return id.substring(0, id.length - 1);
            }
            return id;
        };
        JSONSchemaService.prototype.setSchemaContributions = function (schemaContributions) {
            var _this = this;
            if (schemaContributions.schemas) {
                var schemas = schemaContributions.schemas;
                for (var id in schemas) {
                    id = this.normalizeId(id);
                    this.contributionSchemas[id] = this.addSchemaHandle(id, schemas[id]);
                }
            }
            if (schemaContributions.schemaAssociations) {
                var schemaAssociations = schemaContributions.schemaAssociations;
                for (var pattern in schemaAssociations) {
                    var associations = schemaAssociations[pattern];
                    if (this.contextService) {
                        var env = this.contextService.getConfiguration().env;
                        if (env) {
                            pattern = pattern.replace(/%APP_SETTINGS_HOME%/, uri_1.default.file(env.appSettingsHome).toString());
                        }
                    }
                    this.contributionAssociations[pattern] = associations;
                    var fpa = this.getOrAddFilePatternAssociation(pattern);
                    associations.forEach(function (schemaId) {
                        var id = _this.normalizeId(schemaId);
                        fpa.addSchema(id);
                    });
                }
            }
        };
        JSONSchemaService.prototype.addSchemaHandle = function (id, unresolvedSchemaContent) {
            var schemaHandle = new SchemaHandle(this, id, unresolvedSchemaContent);
            this.schemasById[id] = schemaHandle;
            return schemaHandle;
        };
        JSONSchemaService.prototype.getOrAddSchemaHandle = function (id, unresolvedSchemaContent) {
            return this.schemasById[id] || this.addSchemaHandle(id, unresolvedSchemaContent);
        };
        JSONSchemaService.prototype.getOrAddFilePatternAssociation = function (pattern) {
            var fpa = this.filePatternAssociationById[pattern];
            if (!fpa) {
                fpa = new FilePatternAssociation(pattern);
                this.filePatternAssociationById[pattern] = fpa;
                this.filePatternAssociations.push(fpa);
            }
            return fpa;
        };
        JSONSchemaService.prototype.registerExternalSchema = function (uri, filePatterns, unresolvedSchemaContent) {
            var _this = this;
            if (filePatterns === void 0) { filePatterns = null; }
            var id = this.normalizeId(uri);
            if (filePatterns) {
                filePatterns.forEach(function (pattern) {
                    _this.getOrAddFilePatternAssociation(pattern).addSchema(uri);
                });
            }
            return unresolvedSchemaContent ? this.addSchemaHandle(id, unresolvedSchemaContent) : this.getOrAddSchemaHandle(id);
        };
        JSONSchemaService.prototype.clearExternalSchemas = function () {
            var _this = this;
            this.schemasById = {};
            this.filePatternAssociations = [];
            this.filePatternAssociationById = {};
            for (var id in this.contributionSchemas) {
                this.schemasById[id] = this.contributionSchemas[id];
            }
            for (var pattern in this.contributionAssociations) {
                var fpa = this.getOrAddFilePatternAssociation(pattern);
                this.contributionAssociations[pattern].forEach(function (schemaId) {
                    var id = _this.normalizeId(schemaId);
                    fpa.addSchema(id);
                });
            }
        };
        JSONSchemaService.prototype.getResolvedSchema = function (schemaId) {
            var id = this.normalizeId(schemaId);
            var schemaHandle = this.schemasById[id];
            if (schemaHandle) {
                return schemaHandle.getResolvedSchema();
            }
            return WinJS.TPromise.as(null);
        };
        JSONSchemaService.prototype.loadSchema = function (url) {
            if (this.telemetryService && Strings.startsWith(url, 'https://schema.management.azure.com')) {
                this.telemetryService.publicLog('json.schema', {
                    schemaURL: url
                });
            }
            return this.requestService.makeRequest({ url: url }).then(function (request) {
                var content = request.responseText;
                if (!content) {
                    var errorMessage = nls.localize(0, null, toDisplayString(url));
                    return new UnresolvedSchema({}, [errorMessage]);
                }
                var schemaContent = {};
                var jsonErrors = [];
                schemaContent = Json.parse(content, errors);
                var errors = jsonErrors.length ? [nls.localize(1, null, toDisplayString(url), jsonErrors[0])] : [];
                return new UnresolvedSchema(schemaContent, errors);
            }, function (error) {
                var errorMessage = nls.localize(2, null, toDisplayString(url), error.responseText || http.getErrorStatusDescription(error.status) || error.toString());
                return new UnresolvedSchema({}, [errorMessage]);
            });
        };
        JSONSchemaService.prototype.resolveSchemaContent = function (schemaToResolve) {
            var _this = this;
            var resolveErrors = schemaToResolve.errors.slice(0);
            var schema = schemaToResolve.schema;
            var findSection = function (schema, path) {
                if (!path) {
                    return schema;
                }
                var current = schema;
                path.substr(1).split('/').some(function (part) {
                    current = current[part];
                    return !current;
                });
                return current;
            };
            var resolveLink = function (node, linkedSchema, linkPath) {
                var section = findSection(linkedSchema, linkPath);
                if (typeof section === 'object') {
                    Objects.mixin(node, section, false);
                }
                else {
                    resolveErrors.push(nls.localize(3, null, linkPath, linkedSchema.id));
                }
                delete node.$ref;
            };
            var resolveExternalLink = function (node, uri, linkPath) {
                return _this.getOrAddSchemaHandle(uri).getUnresolvedSchema().then(function (unresolvedSchema) {
                    if (unresolvedSchema.errors.length) {
                        var loc = linkPath ? uri + '#' + linkPath : uri;
                        resolveErrors.push(nls.localize(4, null, loc, unresolvedSchema.errors[0]));
                    }
                    resolveLink(node, unresolvedSchema.schema, linkPath);
                    return resolveRefs(node, unresolvedSchema.schema);
                });
            };
            var resolveRefs = function (node, parentSchema) {
                var toWalk = [node];
                var seen = [];
                var openPromises = [];
                while (toWalk.length) {
                    var next = toWalk.pop();
                    if (seen.indexOf(next) >= 0) {
                        continue;
                    }
                    seen.push(next);
                    if (Array.isArray(next)) {
                        next.forEach(function (item) {
                            toWalk.push(item);
                        });
                    }
                    else if (Types.isObject(next)) {
                        if (next.$ref) {
                            var segments = next.$ref.split('#', 2);
                            if (segments[0].length > 0) {
                                openPromises.push(resolveExternalLink(next, segments[0], segments[1]));
                                continue;
                            }
                            else {
                                resolveLink(next, parentSchema, segments[1]);
                            }
                        }
                        for (var key in next) {
                            toWalk.push(next[key]);
                        }
                    }
                }
                return WinJS.Promise.join(openPromises);
            };
            return resolveRefs(schema, schema).then(function (_) { return new ResolvedSchema(schema, resolveErrors); });
        };
        JSONSchemaService.prototype.getSchemaForResource = function (resource, document) {
            // first use $schema if present
            if (document && document.root && document.root.type === 'object') {
                var schemaProperties = document.root.properties.filter(function (p) { return (p.key.value === '$schema') && !!p.value; });
                if (schemaProperties.length > 0) {
                    var schemeId = schemaProperties[0].value.getValue();
                    if (!Strings.startsWith(schemeId, 'http://') && !Strings.startsWith(schemeId, 'https://') && !Strings.startsWith(schemeId, 'file://')) {
                        var resourceURL = this.contextService.toResource(schemeId);
                        if (resourceURL) {
                            schemeId = resourceURL.toString();
                        }
                    }
                    if (schemeId) {
                        var id = this.normalizeId(schemeId);
                        return this.getOrAddSchemaHandle(id).getResolvedSchema();
                    }
                }
            }
            // then check for matching file names, last to first
            for (var i = this.filePatternAssociations.length - 1; i >= 0; i--) {
                var entry = this.filePatternAssociations[i];
                if (entry.matchesPattern(resource)) {
                    return entry.getCombinedSchema(this).getResolvedSchema();
                }
            }
            return WinJS.TPromise.as(null);
        };
        JSONSchemaService.prototype.createCombinedSchema = function (combinedSchemaId, schemaIds) {
            if (schemaIds.length === 1) {
                return this.getOrAddSchemaHandle(schemaIds[0]);
            }
            else {
                var combinedSchema = {
                    allOf: schemaIds.map(function (schemaId) { return ({ $ref: schemaId }); })
                };
                return this.addSchemaHandle(combinedSchemaId, combinedSchema);
            }
        };
        JSONSchemaService = __decorate([
            __param(0, request_1.IRequestService),
            __param(1, telemetry_1.ITelemetryService),
            __param(2, workspace_1.IWorkspaceContextService),
            __param(3, resourceService_1.IResourceService)
        ], JSONSchemaService);
        return JSONSchemaService;
    }());
    exports.JSONSchemaService = JSONSchemaService;
    function toDisplayString(url) {
        try {
            var uri = uri_1.default.parse(url);
            if (uri.scheme === 'file') {
                return uri.fsPath;
            }
        }
        catch (e) {
        }
        return url;
    }
});
//# sourceMappingURL=jsonSchemaService.js.map