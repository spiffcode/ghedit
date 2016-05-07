define(["require", "exports", './parser/jsonParser', 'vs/base/common/types', 'vs/base/common/winjs.base', 'vs/nls!vs/languages/json/common/jsonIntellisense', 'vs/base/common/errors'], function (require, exports, Parser, Types, WinJS, nls, errors) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var JSONIntellisense = (function () {
        function JSONIntellisense(schemaService, requestService, contributions) {
            this.schemaService = schemaService;
            this.requestService = requestService;
            this.contributions = contributions;
        }
        JSONIntellisense.prototype.doSuggest = function (resource, modelMirror, position) {
            var _this = this;
            var currentWord = modelMirror.getWordUntilPosition(position).word;
            var parser = new Parser.JSONParser();
            var config = new Parser.JSONDocumentConfig();
            // so you can invoke suggest after the comma in an object literal
            config.ignoreDanglingComma = true;
            var doc = parser.parse(modelMirror.getValue(), config);
            var result = {
                currentWord: currentWord,
                incomplete: false,
                suggestions: []
            };
            var overwriteBefore = void 0;
            var overwriteAfter = void 0;
            var proposed = {};
            var collector = {
                add: function (suggestion) {
                    if (!proposed[suggestion.label]) {
                        proposed[suggestion.label] = true;
                        suggestion.overwriteBefore = overwriteBefore;
                        suggestion.overwriteAfter = overwriteAfter;
                        result.suggestions.push(suggestion);
                    }
                },
                setAsIncomplete: function () {
                    result.incomplete = true;
                },
                error: function (message) {
                    errors.onUnexpectedError(message);
                }
            };
            return this.schemaService.getSchemaForResource(resource.toString(), doc).then(function (schema) {
                var collectionPromises = [];
                var offset = modelMirror.getOffsetFromPosition(position);
                var node = doc.getNodeFromOffsetEndInclusive(offset);
                var addValue = true;
                var currentKey = currentWord;
                var currentProperty = null;
                if (node) {
                    if (node.type === 'string') {
                        var stringNode = node;
                        if (stringNode.isKey) {
                            var nodeRange = modelMirror.getRangeFromOffsetAndLength(node.start, node.end - node.start);
                            overwriteBefore = position.column - nodeRange.startColumn;
                            overwriteAfter = nodeRange.endColumn - position.column;
                            addValue = !(node.parent && (node.parent.value));
                            currentProperty = node.parent ? node.parent : null;
                            currentKey = modelMirror.getValueInRange({ startColumn: nodeRange.startColumn + 1, startLineNumber: nodeRange.startLineNumber, endColumn: position.column, endLineNumber: position.lineNumber });
                            if (node.parent) {
                                node = node.parent.parent;
                            }
                        }
                    }
                }
                // proposals for properties
                if (node && node.type === 'object') {
                    // don't suggest keys when the cursor is just before the opening curly brace
                    if (node.start === offset) {
                        return result;
                    }
                    // don't suggest properties that are already present
                    var properties = node.properties;
                    properties.forEach(function (p) {
                        if (!currentProperty || currentProperty !== p) {
                            proposed[p.key.value] = true;
                        }
                    });
                    if (schema) {
                        // property proposals with schema
                        var isLast = properties.length === 0 || offset >= properties[properties.length - 1].start;
                        _this.getPropertySuggestions(resource, schema, doc, node, currentKey, addValue, isLast, collector);
                    }
                    else if (node.parent) {
                        // property proposals without schema
                        _this.getSchemaLessPropertySuggestions(doc, node, collector);
                    }
                    var location = node.getNodeLocation();
                    _this.contributions.forEach(function (contribution) {
                        var collectPromise = contribution.collectPropertySuggestions(resource, location, currentWord, addValue, isLast, collector);
                        if (collectPromise) {
                            collectionPromises.push(collectPromise);
                        }
                    });
                }
                // proposals for values
                if (node && (node.type === 'string' || node.type === 'number' || node.type === 'integer' || node.type === 'boolean' || node.type === 'null')) {
                    var nodeRange = modelMirror.getRangeFromOffsetAndLength(node.start, node.end - node.start);
                    overwriteBefore = position.column - nodeRange.startColumn;
                    overwriteAfter = nodeRange.endColumn - position.column;
                    node = node.parent;
                }
                if (schema) {
                    // value proposals with schema
                    _this.getValueSuggestions(resource, schema, doc, node, offset, collector);
                }
                else {
                    // value proposals without schema
                    _this.getSchemaLessValueSuggestions(doc, node, offset, modelMirror, collector);
                }
                if (!node) {
                    _this.contributions.forEach(function (contribution) {
                        var collectPromise = contribution.collectDefaultSuggestions(resource, collector);
                        if (collectPromise) {
                            collectionPromises.push(collectPromise);
                        }
                    });
                }
                else {
                    if ((node.type === 'property') && offset > node.colonOffset) {
                        var parentKey = node.key.value;
                        var valueNode = node.value;
                        if (!valueNode || offset <= valueNode.end) {
                            var location = node.parent.getNodeLocation();
                            _this.contributions.forEach(function (contribution) {
                                var collectPromise = contribution.collectValueSuggestions(resource, location, parentKey, collector);
                                if (collectPromise) {
                                    collectionPromises.push(collectPromise);
                                }
                            });
                        }
                    }
                }
                return WinJS.Promise.join(collectionPromises).then(function () { return result; });
            });
        };
        JSONIntellisense.prototype.getPropertySuggestions = function (resource, schema, doc, node, currentWord, addValue, isLast, collector) {
            var _this = this;
            var matchingSchemas = [];
            doc.validate(schema.schema, matchingSchemas, node.start);
            matchingSchemas.forEach(function (s) {
                if (s.node === node && !s.inverted) {
                    var schemaProperties = s.schema.properties;
                    if (schemaProperties) {
                        Object.keys(schemaProperties).forEach(function (key) {
                            var propertySchema = schemaProperties[key];
                            collector.add({ type: 'property', label: key, codeSnippet: _this.getTextForProperty(key, propertySchema, addValue, isLast), documentationLabel: propertySchema.description || '' });
                        });
                    }
                }
            });
        };
        JSONIntellisense.prototype.getSchemaLessPropertySuggestions = function (doc, node, collector) {
            var _this = this;
            var collectSuggestionsForSimilarObject = function (obj) {
                obj.properties.forEach(function (p) {
                    var key = p.key.value;
                    collector.add({ type: 'property', label: key, codeSnippet: _this.getTextForSimilarProperty(key, p.value), documentationLabel: '' });
                });
            };
            if (node.parent.type === 'property') {
                // if the object is a property value, check the tree for other objects that hang under a property of the same name
                var parentKey = node.parent.key.value;
                doc.visit(function (n) {
                    if (n.type === 'property' && n.key.value === parentKey && n.value && n.value.type === 'object') {
                        collectSuggestionsForSimilarObject(n.value);
                    }
                    return true;
                });
            }
            else if (node.parent.type === 'array') {
                // if the object is in an array, use all other array elements as similar objects
                node.parent.items.forEach(function (n) {
                    if (n.type === 'object' && n !== node) {
                        collectSuggestionsForSimilarObject(n);
                    }
                });
            }
        };
        JSONIntellisense.prototype.getSchemaLessValueSuggestions = function (doc, node, offset, modelMirror, collector) {
            var _this = this;
            var collectSuggestionsForValues = function (value) {
                var content = _this.getTextForMatchingNode(value, modelMirror);
                collector.add({ type: _this.getSuggestionType(value.type), label: content, codeSnippet: content, documentationLabel: '' });
                if (value.type === 'boolean') {
                    _this.addBooleanSuggestion(!value.getValue(), collector);
                }
            };
            if (!node) {
                collector.add({ type: this.getSuggestionType('object'), label: 'Empty object', codeSnippet: '{\n\t{{}}\n}', documentationLabel: '' });
                collector.add({ type: this.getSuggestionType('array'), label: 'Empty array', codeSnippet: '[\n\t{{}}\n]', documentationLabel: '' });
            }
            else {
                if (node.type === 'property' && offset > node.colonOffset) {
                    var valueNode = node.value;
                    if (valueNode && offset > valueNode.end) {
                        return;
                    }
                    // suggest values at the same key
                    var parentKey = node.key.value;
                    doc.visit(function (n) {
                        if (n.type === 'property' && n.key.value === parentKey && n.value) {
                            collectSuggestionsForValues(n.value);
                        }
                        return true;
                    });
                }
                if (node.type === 'array') {
                    if (node.parent && node.parent.type === 'property') {
                        // suggest items of an array at the same key
                        var parentKey = node.parent.key.value;
                        doc.visit(function (n) {
                            if (n.type === 'property' && n.key.value === parentKey && n.value && n.value.type === 'array') {
                                (n.value.items).forEach(function (n) {
                                    collectSuggestionsForValues(n);
                                });
                            }
                            return true;
                        });
                    }
                    else {
                        // suggest items in the same array
                        node.items.forEach(function (n) {
                            collectSuggestionsForValues(n);
                        });
                    }
                }
            }
        };
        JSONIntellisense.prototype.getValueSuggestions = function (resource, schema, doc, node, offset, collector) {
            var _this = this;
            if (!node) {
                this.addDefaultSuggestion(schema.schema, collector);
            }
            else {
                var parentKey = null;
                if (node && (node.type === 'property') && offset > node.colonOffset) {
                    var valueNode = node.value;
                    if (valueNode && offset > valueNode.end) {
                        return; // we are past the value node
                    }
                    parentKey = node.key.value;
                    node = node.parent;
                }
                if (node && (parentKey !== null || node.type === 'array')) {
                    var matchingSchemas = [];
                    doc.validate(schema.schema, matchingSchemas, node.start);
                    matchingSchemas.forEach(function (s) {
                        if (s.node === node && !s.inverted && s.schema) {
                            if (s.schema.items) {
                                _this.addDefaultSuggestion(s.schema.items, collector);
                                _this.addEnumSuggestion(s.schema.items, collector);
                            }
                            if (s.schema.properties) {
                                var propertySchema = s.schema.properties[parentKey];
                                if (propertySchema) {
                                    _this.addDefaultSuggestion(propertySchema, collector);
                                    _this.addEnumSuggestion(propertySchema, collector);
                                }
                            }
                        }
                    });
                }
            }
        };
        JSONIntellisense.prototype.addBooleanSuggestion = function (value, collector) {
            collector.add({ type: this.getSuggestionType('boolean'), label: value ? 'true' : 'false', codeSnippet: this.getTextForEnumValue(value), documentationLabel: '' });
        };
        JSONIntellisense.prototype.addEnumSuggestion = function (schema, collector) {
            var _this = this;
            if (Array.isArray(schema.enum)) {
                schema.enum.forEach(function (enm) { return collector.add({ type: _this.getSuggestionType(schema.type), label: _this.getLabelForValue(enm), codeSnippet: _this.getTextForEnumValue(enm), documentationLabel: '' }); });
            }
            else if (schema.type === 'boolean') {
                this.addBooleanSuggestion(true, collector);
                this.addBooleanSuggestion(false, collector);
            }
            if (Array.isArray(schema.allOf)) {
                schema.allOf.forEach(function (s) { return _this.addEnumSuggestion(s, collector); });
            }
            if (Array.isArray(schema.anyOf)) {
                schema.anyOf.forEach(function (s) { return _this.addEnumSuggestion(s, collector); });
            }
            if (Array.isArray(schema.oneOf)) {
                schema.oneOf.forEach(function (s) { return _this.addEnumSuggestion(s, collector); });
            }
        };
        JSONIntellisense.prototype.addDefaultSuggestion = function (schema, collector) {
            var _this = this;
            if (schema.default) {
                collector.add({
                    type: this.getSuggestionType(schema.type),
                    label: this.getLabelForValue(schema.default),
                    codeSnippet: this.getTextForValue(schema.default),
                    typeLabel: nls.localize(0, null),
                });
            }
            if (Array.isArray(schema.defaultSnippets)) {
                schema.defaultSnippets.forEach(function (s) {
                    collector.add({
                        type: 'snippet',
                        label: _this.getLabelForSnippetValue(s.body),
                        codeSnippet: _this.getTextForSnippetValue(s.body)
                    });
                });
            }
            if (Array.isArray(schema.allOf)) {
                schema.allOf.forEach(function (s) { return _this.addDefaultSuggestion(s, collector); });
            }
            if (Array.isArray(schema.anyOf)) {
                schema.anyOf.forEach(function (s) { return _this.addDefaultSuggestion(s, collector); });
            }
            if (Array.isArray(schema.oneOf)) {
                schema.oneOf.forEach(function (s) { return _this.addDefaultSuggestion(s, collector); });
            }
        };
        JSONIntellisense.prototype.getLabelForValue = function (value) {
            var label = JSON.stringify(value);
            label = label.replace('{{', '').replace('}}', '');
            if (label.length > 57) {
                return label.substr(0, 57).trim() + '...';
            }
            return label;
        };
        JSONIntellisense.prototype.getLabelForSnippetValue = function (value) {
            var label = JSON.stringify(value);
            label = label.replace(/\{\{|\}\}/g, '');
            if (label.length > 57) {
                return label.substr(0, 57).trim() + '...';
            }
            return label;
        };
        JSONIntellisense.prototype.getTextForValue = function (value) {
            var text = JSON.stringify(value, null, '\t');
            text = text.replace(/[\\\{\}]/g, '\\$&');
            return text;
        };
        JSONIntellisense.prototype.getTextForSnippetValue = function (value) {
            return JSON.stringify(value, null, '\t');
        };
        JSONIntellisense.prototype.getTextForEnumValue = function (value) {
            var snippet = JSON.stringify(value, null, '\t');
            switch (typeof value) {
                case 'object':
                    if (value === null) {
                        return '{{null}}';
                    }
                    return snippet;
                case 'string':
                    return '"{{' + snippet.substr(1, snippet.length - 2) + '}}"';
                case 'number':
                case 'integer':
                case 'boolean':
                    return '{{' + snippet + '}}';
            }
            return snippet;
        };
        JSONIntellisense.prototype.getSuggestionType = function (type) {
            if (Array.isArray(type)) {
                var array = type;
                type = array.length > 0 ? array[0] : null;
            }
            if (!type) {
                return 'text';
            }
            switch (type) {
                case 'string': return 'text';
                case 'object': return 'module';
                case 'property': return 'property';
                default: return 'value';
            }
        };
        JSONIntellisense.prototype.getTextForMatchingNode = function (node, modelMirror) {
            switch (node.type) {
                case 'array':
                    return '[]';
                case 'object':
                    return '{}';
                default:
                    var content = modelMirror.getValueInRange(modelMirror.getRangeFromOffsetAndLength(node.start, node.end - node.start));
                    return content;
            }
        };
        JSONIntellisense.prototype.getTextForProperty = function (key, propertySchema, addValue, isLast) {
            var result = this.getTextForValue(key);
            if (!addValue) {
                return result;
            }
            result += ': ';
            var defaultVal = propertySchema.default;
            if (!Types.isUndefined(defaultVal)) {
                result = result + this.getTextForEnumValue(defaultVal);
            }
            else if (propertySchema.enum && propertySchema.enum.length > 0) {
                result = result + this.getTextForEnumValue(propertySchema.enum[0]);
            }
            else {
                switch (propertySchema.type) {
                    case 'boolean':
                        result += '{{false}}';
                        break;
                    case 'string':
                        result += '"{{}}"';
                        break;
                    case 'object':
                        result += '{\n\t{{}}\n}';
                        break;
                    case 'array':
                        result += '[\n\t{{}}\n]';
                        break;
                    case 'number':
                    case 'integer':
                        result += '{{0}}';
                        break;
                    case 'null':
                        result += '{{null}}';
                        break;
                    default:
                        return result;
                }
            }
            if (!isLast) {
                result += ',';
            }
            return result;
        };
        JSONIntellisense.prototype.getTextForSimilarProperty = function (key, templateValue) {
            return this.getTextForValue(key);
        };
        return JSONIntellisense;
    }());
    exports.JSONIntellisense = JSONIntellisense;
});
//# sourceMappingURL=jsonIntellisense.js.map