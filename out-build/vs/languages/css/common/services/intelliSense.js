define(["require", "exports", 'vs/languages/css/common/parser/cssNodes', 'vs/languages/css/common/parser/cssSymbols', 'vs/languages/css/common/services/languageFacts', 'vs/nls!vs/languages/css/common/services/intelliSense'], function (require, exports, nodes, cssSymbols, languageFacts, nls) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var CSSIntellisense = (function () {
        function CSSIntellisense(variablePrefix) {
            if (variablePrefix === void 0) { variablePrefix = null; }
            this.variablePrefix = variablePrefix;
        }
        CSSIntellisense.prototype.getSymbolContext = function () {
            if (!this.symbolContext) {
                this.symbolContext = new cssSymbols.Symbols(this.styleSheet);
            }
            return this.symbolContext;
        };
        CSSIntellisense.prototype.getCompletionsAtPosition = function (languageService, model, resource, position) {
            this.offset = model.getOffsetFromPosition(position);
            this.position = position;
            this.currentWord = model.getWordUntilPosition(position).word;
            this.model = model;
            this.styleSheet = languageService.getStylesheet(resource);
            var result = [];
            var nodepath = nodes.getNodePath(this.styleSheet, this.offset);
            this.isIncomplete = false;
            for (var i = nodepath.length - 1; i >= 0; i--) {
                var node = nodepath[i];
                if (node instanceof nodes.Property) {
                    this.getCompletionsForDeclarationProperty(result);
                }
                else if (node instanceof nodes.Expression) {
                    this.getCompletionsForExpression(node, result);
                }
                else if (node instanceof nodes.SimpleSelector) {
                    var parentRuleSet = node.findParent(nodes.NodeType.Ruleset);
                    this.getCompletionsForSelector(parentRuleSet, result);
                }
                else if (node instanceof nodes.Declarations) {
                    this.getCompletionsForDeclarations(node, result);
                }
                else if (node instanceof nodes.VariableDeclaration) {
                    this.getCompletionsForVariableDeclaration(node, result);
                }
                else if (node instanceof nodes.RuleSet) {
                    this.getCompletionsForRuleSet(node, result);
                }
                else if (node instanceof nodes.Interpolation) {
                    this.getCompletionsForInterpolation(node, result);
                }
                else if (node instanceof nodes.FunctionArgument) {
                    this.getCompletionsForFunctionArguments(node, result);
                }
                else if (node instanceof nodes.FunctionDeclaration) {
                    this.getCompletionsForFunctionDeclaration(node, result);
                }
                if (result.length > 0) {
                    return { currentWord: this.currentWord, suggestions: result, incomplete: this.isIncomplete };
                }
            }
            this.getCompletionsForStylesheet(result);
            if (result.length > 0) {
                return { currentWord: this.currentWord, suggestions: result };
            }
            if (this.variablePrefix && this.currentWord.indexOf(this.variablePrefix) === 0) {
                this.getVariableProposals(result);
                if (result.length > 0) {
                    return { currentWord: this.currentWord, suggestions: result };
                }
                model.getAllUniqueWords(this.currentWord).forEach(function (word) {
                    result.push({ type: 'text', label: word, codeSnippet: word });
                });
            }
            // no match, don't show text matches
            return {
                currentWord: this.currentWord,
                suggestions: result
            };
        };
        CSSIntellisense.prototype.getCompletionsForDeclarationProperty = function (result) {
            return this.getPropertyProposals(result);
        };
        CSSIntellisense.prototype.getPropertyProposals = function (result) {
            var properties = languageFacts.getProperties();
            for (var key in properties) {
                if (properties.hasOwnProperty(key)) {
                    var entry = properties[key];
                    if (entry.browsers.onCodeComplete) {
                        result.push({
                            label: entry.name,
                            documentationLabel: languageFacts.getEntryDescription(entry),
                            codeSnippet: entry.name + ': ',
                            type: 'property'
                        });
                    }
                }
            }
            return result;
        };
        CSSIntellisense.prototype.getCompletionsForDeclarationValue = function (node, result) {
            var propertyName = node.getFullPropertyName();
            var entry = languageFacts.getProperties()[propertyName];
            if (entry) {
                this.getColorProposals(entry, result);
                this.getPositionProposals(entry, result);
                this.getRepeatStyleProposals(entry, result);
                this.getLineProposals(entry, result);
                this.getBoxProposals(entry, result);
                this.getImageProposals(entry, result);
                this.getTimingFunctionProposals(entry, result);
                this.getBasicShapeProposals(entry, result);
                this.getValueEnumProposals(entry, result);
                this.getCSSWideKeywordProposals(entry, result);
                this.getUnitProposals(entry, result);
            }
            else {
                var existingValues = new Set();
                this.styleSheet.accept(new ValuesCollector(propertyName, existingValues));
                existingValues.getEntries().forEach(function (existingValue) {
                    result.push({
                        label: existingValue,
                        codeSnippet: existingValue,
                        type: 'value'
                    });
                });
            }
            this.getVariableProposals(result);
            this.getTermProposals(result);
            return result;
        };
        CSSIntellisense.prototype.getValueEnumProposals = function (entry, result) {
            if (entry.values) {
                entry.values.forEach(function (value) {
                    if (languageFacts.isCommonValue(value)) {
                        result.push({
                            label: value.name,
                            documentationLabel: languageFacts.getEntryDescription(value),
                            codeSnippet: value.name,
                            type: 'value'
                        });
                    }
                });
            }
            return result;
        };
        CSSIntellisense.prototype.getCSSWideKeywordProposals = function (entry, result) {
            for (var keywords in languageFacts.cssWideKeywords) {
                result.push({
                    label: keywords,
                    documentationLabel: languageFacts.cssWideKeywords[keywords],
                    codeSnippet: keywords,
                    type: 'value'
                });
            }
            return result;
        };
        CSSIntellisense.prototype.getCompletionsForInterpolation = function (node, result) {
            if (this.offset >= node.offset + 2) {
                this.getVariableProposals(result);
            }
            return result;
        };
        CSSIntellisense.prototype.getVariableProposals = function (result) {
            var symbols = this.getSymbolContext().findSymbolsAtOffset(this.offset, nodes.ReferenceType.Variable);
            symbols.forEach(function (symbol) {
                result.push({
                    label: symbol.name,
                    codeSnippet: symbol.name,
                    type: 'variable'
                });
            });
            return result;
        };
        CSSIntellisense.prototype.getUnitProposals = function (entry, result) {
            var currentWord = '0';
            if (this.currentWord.length > 0) {
                var numMatch = this.currentWord.match(/-?\d[\.\d+]*/);
                if (numMatch) {
                    currentWord = numMatch[0];
                }
            }
            entry.restrictions.forEach(function (restriction) {
                var units = languageFacts.units[restriction];
                if (units) {
                    units.forEach(function (unit) {
                        result.push({
                            label: currentWord + unit,
                            codeSnippet: currentWord + unit,
                            type: 'unit'
                        });
                    });
                }
            });
            this.isIncomplete = true;
            return result;
        };
        CSSIntellisense.prototype.getColorProposals = function (entry, result) {
            if (entry.restrictions.indexOf('color') !== -1) {
                for (var color in languageFacts.colors) {
                    result.push({
                        label: color,
                        documentationLabel: languageFacts.colors[color],
                        codeSnippet: color,
                        type: 'customcolor'
                    });
                }
                for (var color in languageFacts.colorKeywords) {
                    result.push({
                        label: color,
                        documentationLabel: languageFacts.colorKeywords[color],
                        codeSnippet: color,
                        type: 'value'
                    });
                }
                var colorValues = new Set();
                this.styleSheet.accept(new ColorValueCollector(colorValues));
                colorValues.getEntries().forEach(function (color) {
                    result.push({
                        label: color,
                        codeSnippet: color,
                        type: 'customcolor'
                    });
                });
                CSSIntellisense.colorFunctions.forEach(function (p) {
                    result.push({
                        label: p.func.substr(0, p.func.indexOf('(')),
                        typeLabel: p.func,
                        documentationLabel: p.desc,
                        codeSnippet: p.func.replace(/\[?\$(\w+)\]?/g, '{{$1}}'),
                        type: 'function'
                    });
                });
            }
            return result;
        };
        CSSIntellisense.prototype.getPositionProposals = function (entry, result) {
            if (entry.restrictions.indexOf('position') !== -1) {
                for (var position in languageFacts.positionKeywords) {
                    result.push({
                        label: position,
                        documentationLabel: languageFacts.positionKeywords[position],
                        codeSnippet: position,
                        type: 'value'
                    });
                }
            }
            return result;
        };
        CSSIntellisense.prototype.getRepeatStyleProposals = function (entry, result) {
            if (entry.restrictions.indexOf('repeat') !== -1) {
                for (var repeat in languageFacts.repeatStyleKeywords) {
                    result.push({
                        label: repeat,
                        documentationLabel: languageFacts.repeatStyleKeywords[repeat],
                        codeSnippet: repeat,
                        type: 'value'
                    });
                }
            }
            return result;
        };
        CSSIntellisense.prototype.getLineProposals = function (entry, result) {
            if (entry.restrictions.indexOf('line-style') !== -1) {
                for (var lineStyle in languageFacts.lineStyleKeywords) {
                    result.push({
                        label: lineStyle,
                        documentationLabel: languageFacts.lineStyleKeywords[lineStyle],
                        codeSnippet: lineStyle,
                        type: 'value'
                    });
                }
            }
            if (entry.restrictions.indexOf('line-width') !== -1) {
                languageFacts.lineWidthKeywords.forEach(function (lineWidth) {
                    result.push({
                        label: lineWidth,
                        codeSnippet: lineWidth,
                        type: 'value'
                    });
                });
            }
            return result;
        };
        CSSIntellisense.prototype.getBoxProposals = function (entry, result) {
            var geometryBox = entry.restrictions.indexOf('geometry-box');
            if (geometryBox !== -1) {
                for (var box in languageFacts.geometryBoxKeywords) {
                    result.push({
                        label: box,
                        documentationLabel: languageFacts.geometryBoxKeywords[box],
                        codeSnippet: box,
                        type: 'value'
                    });
                }
            }
            if (entry.restrictions.indexOf('box') !== -1 || geometryBox !== -1) {
                for (var box in languageFacts.boxKeywords) {
                    result.push({
                        label: box,
                        documentationLabel: languageFacts.boxKeywords[box],
                        codeSnippet: box,
                        type: 'value'
                    });
                }
            }
            return result;
        };
        CSSIntellisense.prototype.getImageProposals = function (entry, result) {
            if (entry.restrictions.indexOf('image') !== -1) {
                for (var image in languageFacts.imageFunctions) {
                    result.push({
                        label: image,
                        documentationLabel: languageFacts.imageFunctions[image],
                        codeSnippet: image,
                        type: 'function'
                    });
                }
            }
            return result;
        };
        CSSIntellisense.prototype.getTimingFunctionProposals = function (entry, result) {
            if (entry.restrictions.indexOf('timing-function') !== -1) {
                for (var timing in languageFacts.transitionTimingFunctions) {
                    result.push({
                        label: timing,
                        documentationLabel: languageFacts.transitionTimingFunctions[timing],
                        codeSnippet: timing,
                        type: 'function'
                    });
                }
            }
            return result;
        };
        CSSIntellisense.prototype.getBasicShapeProposals = function (entry, result) {
            if (entry.restrictions.indexOf('shape') !== -1) {
                for (var shape in languageFacts.basicShapeFunctions) {
                    result.push({
                        label: shape,
                        documentationLabel: languageFacts.basicShapeFunctions[shape],
                        codeSnippet: shape,
                        type: 'function'
                    });
                }
            }
            return result;
        };
        CSSIntellisense.prototype.getCompletionsForStylesheet = function (result) {
            var node = this.styleSheet.findFirstChildBeforeOffset(this.offset);
            if (!node) {
                return this.getCompletionForTopLevel(result);
            }
            if (node instanceof nodes.RuleSet) {
                return this.getCompletionsForRuleSet(node, result);
            }
            return result;
        };
        CSSIntellisense.prototype.getCompletionForTopLevel = function (result) {
            languageFacts.getAtDirectives().forEach(function (entry) {
                if (entry.browsers.count > 0) {
                    result.push({
                        label: entry.name,
                        codeSnippet: entry.name,
                        documentationLabel: languageFacts.getEntryDescription(entry),
                        type: 'keyword'
                    });
                }
            });
            this.getCompletionsForSelector(null, result);
            return result;
        };
        CSSIntellisense.prototype.getCompletionsForRuleSet = function (ruleSet, result) {
            var declarations = ruleSet.getDeclarations();
            var isAfter = declarations && declarations.endsWith('}') && this.offset >= declarations.offset + declarations.length;
            if (isAfter) {
                return this.getCompletionForTopLevel(result);
            }
            var isInSelectors = !declarations || this.offset <= declarations.offset;
            if (isInSelectors) {
                return this.getCompletionsForSelector(ruleSet, result);
            }
            ruleSet.findParent(nodes.NodeType.Ruleset);
            return this.getCompletionsForDeclarations(ruleSet.getDeclarations(), result);
        };
        CSSIntellisense.prototype.getCompletionsForSelector = function (ruleSet, result) {
            languageFacts.getPseudoClasses().forEach(function (entry) {
                if (entry.browsers.onCodeComplete) {
                    result.push({
                        label: entry.name,
                        codeSnippet: entry.name,
                        documentationLabel: languageFacts.getEntryDescription(entry),
                        type: 'function'
                    });
                }
            });
            languageFacts.getPseudoElements().forEach(function (entry) {
                if (entry.browsers.onCodeComplete) {
                    result.push({
                        label: entry.name,
                        codeSnippet: entry.name,
                        documentationLabel: languageFacts.getEntryDescription(entry),
                        type: 'function'
                    });
                }
            });
            languageFacts.html5Tags.forEach(function (entry) {
                result.push({
                    label: entry,
                    codeSnippet: entry,
                    type: 'keyword'
                });
            });
            languageFacts.svgElements.forEach(function (entry) {
                result.push({
                    label: entry,
                    codeSnippet: entry,
                    type: 'keyword'
                });
            });
            var visited = {};
            visited[this.currentWord] = true;
            var textProvider = this.styleSheet.getTextProvider();
            this.styleSheet.accept(function (n) {
                if (n.type === nodes.NodeType.SimpleSelector && n.length > 0) {
                    var selector = textProvider(n.offset, n.length);
                    if (selector.charAt(0) === '.' && !visited[selector]) {
                        visited[selector] = true;
                        result.push({
                            label: selector,
                            codeSnippet: selector,
                            type: 'keyword'
                        });
                    }
                    return false;
                }
                return true;
            });
            if (ruleSet && ruleSet.isNested()) {
                var selector = ruleSet.getSelectors().findFirstChildBeforeOffset(this.offset);
                if (selector && ruleSet.getSelectors().getChildren().indexOf(selector) === 0) {
                    this.getPropertyProposals(result);
                }
            }
            return result;
        };
        CSSIntellisense.prototype.getCompletionsForDeclarations = function (declarations, result) {
            if (!declarations) {
                return result;
            }
            var node = declarations.findFirstChildBeforeOffset(this.offset);
            if (!node) {
                return this.getCompletionsForDeclarationProperty(result);
            }
            if (node instanceof nodes.Declaration) {
                var declaration = node;
                if ((!isDefined(declaration.colonPosition) || this.offset <= declaration.colonPosition) || (isDefined(declaration.semicolonPosition) && declaration.semicolonPosition < this.offset)) {
                    if (this.offset === declaration.semicolonPosition + 1) {
                        return result; // don't show new properties right after semicolon (see Bug 15421:[intellisense] [css] Be less aggressive when manually typing CSS)
                    }
                    // complete property
                    return this.getCompletionsForDeclarationProperty(result);
                }
                // complete value
                return this.getCompletionsForDeclarationValue(declaration, result);
            }
            return result;
        };
        CSSIntellisense.prototype.getCompletionsForVariableDeclaration = function (declaration, result) {
            if (this.offset > declaration.colonPosition) {
                this.getVariableProposals(result);
            }
            return result;
        };
        CSSIntellisense.prototype.getCompletionsForExpression = function (expression, result) {
            var declaration = expression.findParent(nodes.NodeType.Declaration);
            if (!declaration) {
                this.getTermProposals(result);
                return result;
            }
            var node = expression.findChildAtOffset(this.offset, true);
            if (!node) {
                return this.getCompletionsForDeclarationValue(declaration, result);
            }
            if (node instanceof nodes.NumericValue || node instanceof nodes.Identifier) {
                return this.getCompletionsForDeclarationValue(declaration, result);
            }
            return result;
        };
        CSSIntellisense.prototype.getCompletionsForFunctionArguments = function (arg, result) {
            return result;
        };
        CSSIntellisense.prototype.getCompletionsForFunctionDeclaration = function (decl, result) {
            var declarations = decl.getDeclarations();
            if (declarations && this.offset > declarations.offset && this.offset < declarations.offset + declarations.length) {
                this.getTermProposals(result);
            }
            return result;
        };
        CSSIntellisense.prototype.getTermProposals = function (result) {
            var allFunctions = this.getSymbolContext().findSymbolsAtOffset(this.offset, nodes.ReferenceType.Function);
            allFunctions.forEach(function (functionSymbol) {
                if (functionSymbol.node instanceof nodes.FunctionDeclaration) {
                    var functionDecl = functionSymbol.node;
                    var params = functionDecl.getParameters().getChildren().map(function (c) {
                        return (c instanceof nodes.FunctionParameter) ? c.getName() : c.getText();
                    });
                    result.push({
                        label: functionSymbol.name,
                        typeLabel: functionSymbol.name + '(' + params.join(', ') + ')',
                        codeSnippet: functionSymbol.name + '(' + params.map(function (p) { return '{{' + p + '}}'; }).join(', ') + ')',
                        type: 'function'
                    });
                }
            });
            return result;
        };
        CSSIntellisense.colorFunctions = [
            { func: 'rgb($red, $green, $blue)', desc: nls.localize(0, null) },
            { func: 'rgba($red, $green, $blue, $alpha)', desc: nls.localize(1, null) },
            { func: 'hsl($hue, $saturation, $lightness)', desc: nls.localize(2, null) },
            { func: 'hsla($hue, $saturation, $lightness, $alpha)', desc: nls.localize(3, null) }
        ];
        return CSSIntellisense;
    }());
    exports.CSSIntellisense = CSSIntellisense;
    var Set = (function () {
        function Set() {
            this.entries = {};
        }
        Set.prototype.add = function (entry) {
            this.entries[entry] = true;
        };
        Set.prototype.getEntries = function () {
            return Object.keys(this.entries);
        };
        return Set;
    }());
    var InternalValueCollector = (function () {
        function InternalValueCollector(entries) {
            this.entries = entries;
            // nothing to do
        }
        InternalValueCollector.prototype.visitNode = function (node) {
            if (node instanceof nodes.Identifier || node instanceof nodes.NumericValue || node instanceof nodes.HexColorValue) {
                this.entries.add(node.getText());
            }
            return true;
        };
        return InternalValueCollector;
    }());
    var ValuesCollector = (function () {
        function ValuesCollector(propertyName, entries) {
            this.propertyName = propertyName;
            this.entries = entries;
            // nothing to do
        }
        ValuesCollector.prototype.matchesProperty = function (decl) {
            var propertyName = decl.getFullPropertyName();
            return this.propertyName === propertyName;
        };
        ValuesCollector.prototype.visitNode = function (node) {
            if (node instanceof nodes.Declaration) {
                if (this.matchesProperty(node)) {
                    var value = node.getValue();
                    if (value) {
                        value.accept(new InternalValueCollector(this.entries));
                    }
                }
            }
            return true;
        };
        return ValuesCollector;
    }());
    var ColorValueCollector = (function () {
        function ColorValueCollector(entries) {
            this.entries = entries;
            // nothing to do
        }
        ColorValueCollector.prototype.visitNode = function (node) {
            if (node instanceof nodes.HexColorValue || (node instanceof nodes.Function && languageFacts.isColorConstructor(node))) {
                this.entries.add(node.getText());
            }
            return true;
        };
        return ColorValueCollector;
    }());
    function isDefined(obj) {
        return typeof obj !== 'undefined';
    }
});
//# sourceMappingURL=intelliSense.js.map