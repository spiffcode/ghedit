define(["require", "exports", 'vs/languages/css/common/services/languageFacts', 'vs/languages/css/common/services/lintRules', 'vs/languages/css/common/parser/cssNodes', 'vs/nls!vs/languages/css/common/services/lint', 'vs/languages/css/common/level'], function (require, exports, languageFacts, lintRules, nodes, nls, _level) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var Element = (function () {
        function Element(text, data) {
            this.name = text;
            this.node = data;
        }
        return Element;
    }());
    var NodesByRootMap = (function () {
        function NodesByRootMap() {
            this.data = {};
        }
        NodesByRootMap.prototype.add = function (root, name, node) {
            var entry = this.data[root];
            if (!entry) {
                entry = { nodes: [], names: [] };
                this.data[root] = entry;
            }
            entry.names.push(name);
            if (node) {
                entry.nodes.push(node);
            }
        };
        return NodesByRootMap;
    }());
    var LintVisitor = (function () {
        function LintVisitor(settings) {
            if (settings === void 0) { settings = {}; }
            this.warnings = [];
            this.configuration = {};
            for (var ruleKey in lintRules.Rules) {
                var rule = lintRules.Rules[ruleKey];
                var level = settings[rule.id] || _level.toLevel(rule.defaultValue);
                this.configuration[rule.id] = level;
            }
        }
        LintVisitor.entries = function (node, settings) {
            var visitor = new LintVisitor(settings);
            node.accept(visitor);
            return visitor.getEntries();
        };
        LintVisitor.prototype.fetch = function (input, s) {
            var elements = [];
            for (var i = 0; i < input.length; i++) {
                if (input[i].name.toLowerCase() === s) {
                    elements.push(input[i]);
                }
            }
            return elements;
        };
        LintVisitor.prototype.fetchWithValue = function (input, s, v) {
            var elements = [];
            for (var i = 0; i < input.length; i++) {
                if (input[i].name.toLowerCase() === s) {
                    var expression = input[i].node.getValue();
                    if (expression && this.findValueInExpression(expression, v)) {
                        elements.push(input[i]);
                    }
                }
            }
            return elements;
        };
        LintVisitor.prototype.findValueInExpression = function (expression, v) {
            var found = false;
            expression.accept(function (node) {
                if (node.type === nodes.NodeType.Identifier && node.getText() === v) {
                    found = true;
                }
                return !found;
            });
            return found;
        };
        LintVisitor.prototype.fetchWithin = function (input, s) {
            var elements = [];
            for (var i = 0; i < input.length; i++) {
                if (input[i].name.toLowerCase().indexOf(s) >= 0) {
                    elements.push(input[i]);
                }
            }
            return elements;
        };
        LintVisitor.prototype.getEntries = function (filter) {
            if (filter === void 0) { filter = (_level.Level.Warning | _level.Level.Error); }
            return this.warnings.filter(function (entry) {
                return (entry.getLevel() & filter) !== 0;
            });
        };
        LintVisitor.prototype.addEntry = function (node, rule, details) {
            var entry = new nodes.Marker(node, rule, this.configuration[rule.id], details);
            this.warnings.push(entry);
        };
        LintVisitor.prototype.getMissingNames = function (expected, actual) {
            expected = expected.slice(0); // clone
            for (var i = 0; i < actual.length; i++) {
                var k = expected.indexOf(actual[i]);
                if (k !== -1) {
                    expected[k] = null;
                }
            }
            var result = null;
            for (var i = 0; i < expected.length; i++) {
                var curr = expected[i];
                if (curr) {
                    if (result === null) {
                        result = nls.localize(0, null, curr);
                    }
                    else {
                        result = nls.localize(1, null, result, curr);
                    }
                }
            }
            return result;
        };
        LintVisitor.prototype.visitNode = function (node) {
            switch (node.type) {
                case nodes.NodeType.Stylesheet:
                    return this.visitStylesheet(node);
                case nodes.NodeType.FontFace:
                    return this.visitFontFace(node);
                case nodes.NodeType.Ruleset:
                    return this.visitRuleSet(node);
                case nodes.NodeType.SimpleSelector:
                    return this.visitSimpleSelector(node);
                case nodes.NodeType.Function:
                    return this.visitFunction(node);
                case nodes.NodeType.NumericValue:
                    return this.visitNumericValue(node);
                case nodes.NodeType.Import:
                    return this.visitImport(node);
            }
            return this.visitUnknownNode(node);
        };
        LintVisitor.prototype.visitStylesheet = function (node) {
            // @keyframe and it's vendor specific alternatives
            // @keyframe should be included
            var _this = this;
            var keyframes = new NodesByRootMap();
            node.accept(function (node) {
                if (node instanceof nodes.Keyframe) {
                    var keyword = node.getKeyword();
                    var text = keyword.getText();
                    keyframes.add(node.getName(), text, (text !== '@keyframes') ? keyword : null);
                }
                return true;
            });
            var expected = ['@-webkit-keyframes', '@-moz-keyframes', '@-o-keyframes'];
            var addVendorSpecificWarnings = function (node) {
                if (needsStandard) {
                    var message = nls.localize(2, null);
                    _this.addEntry(node, lintRules.Rules.IncludeStandardPropertyWhenUsingVendorPrefix, message);
                }
                if (missingVendorSpecific) {
                    var message = nls.localize(3, null, missingVendorSpecific);
                    _this.addEntry(node, lintRules.Rules.AllVendorPrefixes, message);
                }
            };
            for (var name in keyframes.data) {
                var actual = keyframes.data[name].names;
                var needsStandard = (actual.indexOf('@keyframes') === -1);
                if (!needsStandard && actual.length === 1) {
                    continue; // only the non-vendor specific keyword is used, that's fine, no warning
                }
                var missingVendorSpecific = this.getMissingNames(expected, actual);
                if (missingVendorSpecific || needsStandard) {
                    keyframes.data[name].nodes.forEach(addVendorSpecificWarnings);
                }
            }
            return true;
        };
        LintVisitor.prototype.visitSimpleSelector = function (node) {
            var text = node.getText();
            /////////////////////////////////////////////////////////////
            //	Lint - The universal selector (*) is known to be slow.
            /////////////////////////////////////////////////////////////
            if (text === '*') {
                this.addEntry(node, lintRules.Rules.UniversalSelector);
            }
            /////////////////////////////////////////////////////////////
            //	Lint - Avoid id selectors
            /////////////////////////////////////////////////////////////
            if (text.indexOf('#') === 0) {
                this.addEntry(node, lintRules.Rules.AvoidIdSelector);
            }
            return true;
        };
        LintVisitor.prototype.visitImport = function (node) {
            /////////////////////////////////////////////////////////////
            //	Lint - Import statements shouldn't be used, because they aren't offering parallel downloads.
            /////////////////////////////////////////////////////////////
            this.addEntry(node, lintRules.Rules.ImportStatemement);
            return true;
        };
        LintVisitor.prototype.visitRuleSet = function (node) {
            var _this = this;
            /////////////////////////////////////////////////////////////
            //	Lint - Don't use empty rulesets.
            /////////////////////////////////////////////////////////////
            var declarations = node.getDeclarations();
            if (!declarations) {
                // syntax error
                return false;
            }
            if (!declarations.hasChildren()) {
                this.addEntry(node.getSelectors(), lintRules.Rules.EmptyRuleSet);
            }
            var self = this;
            var propertyTable = [];
            declarations.getChildren().forEach(function (element) {
                if (element instanceof nodes.Declaration) {
                    var decl = element;
                    propertyTable.push(new Element(decl.getFullPropertyName(), decl));
                }
            }, this);
            /////////////////////////////////////////////////////////////
            //	Don't use width or height when using padding or border.
            /////////////////////////////////////////////////////////////
            if ((this.fetch(propertyTable, 'width').length > 0 || this.fetch(propertyTable, 'height').length > 0) && (this.fetchWithin(propertyTable, 'padding').length > 0 || this.fetchWithin(propertyTable, 'border').length > 0)) {
                var elements = this.fetch(propertyTable, 'width');
                for (var index = 0; index < elements.length; index++) {
                    this.addEntry(elements[index].node, lintRules.Rules.NoWidthOrHeightWhenPaddingOrBorder);
                }
                elements = this.fetch(propertyTable, 'height');
                for (var index = 0; index < elements.length; index++) {
                    this.addEntry(elements[index].node, lintRules.Rules.NoWidthOrHeightWhenPaddingOrBorder);
                }
                elements = this.fetchWithin(propertyTable, 'padding');
                for (var index = 0; index < elements.length; index++) {
                    this.addEntry(elements[index].node, lintRules.Rules.NoWidthOrHeightWhenPaddingOrBorder);
                }
                elements = this.fetchWithin(propertyTable, 'border');
                for (var index = 0; index < elements.length; index++) {
                    this.addEntry(elements[index].node, lintRules.Rules.NoWidthOrHeightWhenPaddingOrBorder);
                }
            }
            /////////////////////////////////////////////////////////////
            //	Properties ignored due to display
            /////////////////////////////////////////////////////////////
            // With 'display: inline', the width, height, margin-top, margin-bottom, and float properties have no effect
            var displayElems = this.fetchWithValue(propertyTable, 'display', 'inline');
            if (displayElems.length > 0) {
                ['width', 'height', 'margin-top', 'margin-bottom', 'float'].forEach(function (prop) {
                    var elem = self.fetch(propertyTable, prop);
                    for (var index = 0; index < elem.length; index++) {
                        self.addEntry(elem[index].node, lintRules.Rules.PropertyIgnoredDueToDisplay);
                    }
                });
            }
            // With 'display: inline-block', 'float' has no effect
            displayElems = this.fetchWithValue(propertyTable, 'display', 'inline-block');
            if (displayElems.length > 0) {
                var elem = this.fetch(propertyTable, 'float');
                for (var index = 0; index < elem.length; index++) {
                    this.addEntry(elem[index].node, lintRules.Rules.PropertyIgnoredDueToDisplay);
                }
            }
            // With 'display: block', 'vertical-align' has no effect
            displayElems = this.fetchWithValue(propertyTable, 'display', 'block');
            if (displayElems.length > 0) {
                var elem = this.fetch(propertyTable, 'vertical-align');
                for (var index = 0; index < elem.length; index++) {
                    this.addEntry(elem[index].node, lintRules.Rules.PropertyIgnoredDueToDisplay);
                }
            }
            /////////////////////////////////////////////////////////////
            //	Don't use !important
            /////////////////////////////////////////////////////////////
            node.accept(function (n) {
                if (n.type === nodes.NodeType.Prio) {
                    self.addEntry(n, lintRules.Rules.AvoidImportant);
                }
                return true;
            });
            /////////////////////////////////////////////////////////////
            //	Avoid 'float'
            /////////////////////////////////////////////////////////////
            var elements = this.fetch(propertyTable, 'float');
            for (var index = 0; index < elements.length; index++) {
                this.addEntry(elements[index].node, lintRules.Rules.AvoidFloat);
            }
            /////////////////////////////////////////////////////////////
            //	Don't use duplicate declarations.
            /////////////////////////////////////////////////////////////
            for (var i = 0; i < propertyTable.length; i++) {
                var element = propertyTable[i];
                if (element.name.toLowerCase() !== 'background') {
                    var value = element.node.getValue();
                    if (value && value.getText()[0] !== '-') {
                        var elements = this.fetch(propertyTable, element.name);
                        if (elements.length > 1) {
                            for (var k = 0; k < elements.length; k++) {
                                var value = elements[k].node.getValue();
                                if (value && value.getText()[0] !== '-' && elements[k] !== element) {
                                    this.addEntry(element.node, lintRules.Rules.DuplicateDeclarations);
                                }
                            }
                        }
                    }
                }
            }
            /////////////////////////////////////////////////////////////
            //	Unknown propery & When using a vendor-prefixed gradient, make sure to use them all.
            /////////////////////////////////////////////////////////////
            var propertiesBySuffix = new NodesByRootMap();
            var containsUnknowns = false;
            declarations.getChildren().forEach(function (node) {
                if (_this.isCSSDeclaration(node)) {
                    var decl = node;
                    var name = decl.getFullPropertyName();
                    var firstChar = name.charAt(0);
                    if (firstChar === '-') {
                        if (name.charAt(1) !== '-') {
                            if (!languageFacts.isKnownProperty(name)) {
                                _this.addEntry(decl.getProperty(), lintRules.Rules.UnknownVendorSpecificProperty);
                            }
                            var nonPrefixedName = decl.getNonPrefixedPropertyName();
                            propertiesBySuffix.add(nonPrefixedName, name, decl.getProperty());
                        }
                    }
                    else {
                        if (firstChar === '*' || firstChar === '_') {
                            _this.addEntry(decl.getProperty(), lintRules.Rules.IEStarHack);
                            name = name.substr(1);
                        }
                        if (!languageFacts.isKnownProperty(name)) {
                            _this.addEntry(decl.getProperty(), lintRules.Rules.UnknownProperty);
                        }
                        propertiesBySuffix.add(name, name, null); // don't pass the node as we don't show errors on the standard
                    }
                }
                else {
                    containsUnknowns = true;
                }
            });
            if (!containsUnknowns) {
                var addVendorSpecificWarnings = function (node) {
                    if (needsStandard) {
                        var message = nls.localize(4, null, suffix);
                        _this.addEntry(node, lintRules.Rules.IncludeStandardPropertyWhenUsingVendorPrefix, message);
                    }
                    if (missingVendorSpecific) {
                        var message = nls.localize(5, null, missingVendorSpecific);
                        _this.addEntry(node, lintRules.Rules.AllVendorPrefixes, message);
                    }
                };
                for (var suffix in propertiesBySuffix.data) {
                    var entry = propertiesBySuffix.data[suffix];
                    var actual = entry.names;
                    var needsStandard = languageFacts.isKnownProperty(suffix) && (actual.indexOf(suffix) === -1);
                    if (!needsStandard && actual.length === 1) {
                        continue; // only the non-vendor specific rule is used, that's fine, no warning
                    }
                    var expected = [];
                    for (var i = 0, len = LintVisitor.prefixes.length; i < len; i++) {
                        var prefix = LintVisitor.prefixes[i];
                        if (languageFacts.isKnownProperty(prefix + suffix)) {
                            expected.push(prefix + suffix);
                        }
                    }
                    var missingVendorSpecific = this.getMissingNames(expected, actual);
                    if (missingVendorSpecific || needsStandard) {
                        entry.nodes.forEach(addVendorSpecificWarnings);
                    }
                }
            }
            return true;
        };
        LintVisitor.prototype.visitNumericValue = function (node) {
            /////////////////////////////////////////////////////////////
            //	0 has no following unit
            /////////////////////////////////////////////////////////////
            var value = node.getValue();
            if (value.unit === '%') {
                return true;
            }
            if (parseFloat(value.value) === 0.0 && !!value.unit) {
                this.addEntry(node, lintRules.Rules.ZeroWithUnit);
            }
            return true;
        };
        LintVisitor.prototype.visitFontFace = function (node) {
            var _this = this;
            var declarations = node.getDeclarations();
            if (!declarations) {
                // syntax error
                return;
            }
            var definesSrc = false, definesFontFamily = false;
            var containsUnknowns = false;
            declarations.getChildren().forEach(function (node) {
                if (_this.isCSSDeclaration(node)) {
                    var name = (node.getProperty().getName().toLocaleLowerCase());
                    if (name === 'src') {
                        definesSrc = true;
                    }
                    if (name === 'font-family') {
                        definesFontFamily = true;
                    }
                }
                else {
                    containsUnknowns = true;
                }
            });
            if (!containsUnknowns && (!definesSrc || !definesFontFamily)) {
                this.addEntry(node, lintRules.Rules.RequiredPropertiesForFontFace);
            }
            return true;
        };
        LintVisitor.prototype.isCSSDeclaration = function (node) {
            if (node instanceof nodes.Declaration) {
                if (!node.getValue()) {
                    return false;
                }
                var property = node.getProperty();
                if (!property || property.getIdentifier().containsInterpolation()) {
                    return false;
                }
                return true;
            }
            return false;
        };
        LintVisitor.prototype.visitUnknownNode = function (node) {
            // Rule: #eeff00 or #ef0
            if (node.type === nodes.NodeType.HexColorValue) {
                var text = node.getText();
                if (text.length !== 7 && text.length !== 4) {
                    this.addEntry(node, lintRules.Rules.HexColorLength);
                }
            }
            return true;
        };
        LintVisitor.prototype.visitFunction = function (node) {
            var fnName = node.getName().toLowerCase(), expectedAttrCount = -1, actualAttrCount = 0;
            switch (fnName) {
                case 'rgb(':
                case 'hsl(':
                    expectedAttrCount = 3;
                    break;
                case 'rgba(':
                case 'hsla(':
                    expectedAttrCount = 4;
                    break;
            }
            if (expectedAttrCount !== -1) {
                node.getArguments().accept(function (n) {
                    if (n instanceof nodes.BinaryExpression) {
                        actualAttrCount += 1;
                        return false;
                    }
                    return true;
                });
                if (actualAttrCount !== expectedAttrCount) {
                    this.addEntry(node, lintRules.Rules.ArgsInColorFunction);
                }
            }
            return true;
        };
        LintVisitor.prefixes = [
            '-ms-', '-moz-', '-o-', '-webkit-',
        ];
        return LintVisitor;
    }());
    exports.LintVisitor = LintVisitor;
});
//# sourceMappingURL=lint.js.map