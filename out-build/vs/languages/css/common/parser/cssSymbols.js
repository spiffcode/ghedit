var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", './cssNodes', 'vs/base/common/arrays'], function (require, exports, nodes, arrays) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var Scope = (function () {
        function Scope(offset, length) {
            this.offset = offset;
            this.length = length;
            this.symbols = [];
            this.parent = null;
            this.children = [];
        }
        Scope.prototype.addChild = function (scope) {
            this.children.push(scope);
            scope.setParent(this);
        };
        Scope.prototype.setParent = function (scope) {
            this.parent = scope;
        };
        Scope.prototype.findScope = function (offset, length) {
            if (length === void 0) { length = 0; }
            if (this.offset <= offset && this.offset + this.length > offset + length || this.offset === offset && this.length === length) {
                return this.findInScope(offset, length);
            }
            return null;
        };
        Scope.prototype.findInScope = function (offset, length) {
            if (length === void 0) { length = 0; }
            // find the first scope child that has an offset larger than offset + length
            var end = offset + length;
            var idx = arrays.findFirst(this.children, function (s) { return s.offset > end; });
            if (idx === 0) {
                // all scopes have offsets larger than our end
                return this;
            }
            var res = this.children[idx - 1];
            if (res.offset <= offset && res.offset + res.length >= offset + length) {
                return res.findInScope(offset, length);
            }
            return this;
        };
        Scope.prototype.addSymbol = function (symbol) {
            this.symbols.push(symbol);
        };
        Scope.prototype.getSymbol = function (name, type) {
            for (var index = 0; index < this.symbols.length; index++) {
                var symbol = this.symbols[index];
                if (symbol.name === name && symbol.type === type) {
                    return symbol;
                }
            }
            return null;
        };
        Scope.prototype.getSymbols = function () {
            return this.symbols;
        };
        return Scope;
    }());
    exports.Scope = Scope;
    var GlobalScope = (function (_super) {
        __extends(GlobalScope, _super);
        function GlobalScope() {
            _super.call(this, 0, Number.MAX_VALUE);
        }
        return GlobalScope;
    }(Scope));
    exports.GlobalScope = GlobalScope;
    var Symbol = (function () {
        function Symbol(name, node, type) {
            this.name = name;
            this.node = node;
            this.type = type;
        }
        return Symbol;
    }());
    exports.Symbol = Symbol;
    var ScopeBuilder = (function () {
        function ScopeBuilder(scope) {
            this.scope = scope;
        }
        ScopeBuilder.prototype.addSymbol = function (node, name, type) {
            if (node.offset !== -1) {
                var current = this.scope.findScope(node.offset, node.length);
                current.addSymbol(new Symbol(name, node, type));
            }
        };
        ScopeBuilder.prototype.addScope = function (node) {
            if (node.offset !== -1) {
                var current = this.scope.findScope(node.offset, node.length);
                if (current.offset !== node.offset || current.length !== node.length) {
                    var newScope = new Scope(node.offset, node.length);
                    current.addChild(newScope);
                    return newScope;
                }
                return current;
            }
            return null;
        };
        ScopeBuilder.prototype.addSymbolToChildScope = function (scopeNode, node, name, type) {
            if (scopeNode && scopeNode.offset !== -1) {
                var current = this.addScope(scopeNode); // create the scope or gets the existing one
                current.addSymbol(new Symbol(name, node, type));
            }
        };
        ScopeBuilder.prototype.visitNode = function (node) {
            switch (node.type) {
                case nodes.NodeType.Keyframe:
                    this.addSymbol(node, node.getName(), nodes.ReferenceType.Keyframe);
                    return true;
                case nodes.NodeType.VariableDeclaration:
                    this.addSymbol(node, node.getName(), nodes.ReferenceType.Variable);
                    return true;
                case nodes.NodeType.Ruleset:
                    return this.visitRuleSet(node);
                case nodes.NodeType.MixinDeclaration:
                    this.addSymbol(node, node.getName(), nodes.ReferenceType.Mixin);
                    return true;
                case nodes.NodeType.FunctionDeclaration:
                    this.addSymbol(node, node.getName(), nodes.ReferenceType.Function);
                    return true;
                case nodes.NodeType.FunctionParameter: {
                    // parameters are part of the body scope
                    var scopeNode = node.getParent().getDeclarations();
                    if (scopeNode) {
                        this.addSymbolToChildScope(scopeNode, node, node.getName(), nodes.ReferenceType.Variable);
                    }
                    return true;
                }
                case nodes.NodeType.Declarations:
                    this.addScope(node);
                    return true;
                case nodes.NodeType.For:
                case nodes.NodeType.Each: {
                    var forOrEachNode = node;
                    var scopeNode = forOrEachNode.getDeclarations();
                    if (scopeNode) {
                        this.addSymbolToChildScope(scopeNode, forOrEachNode.variable, forOrEachNode.variable.getName(), nodes.ReferenceType.Variable);
                    }
                    return true;
                }
            }
            return true;
        };
        ScopeBuilder.prototype.visitRuleSet = function (node) {
            var current = this.scope.findScope(node.offset, node.length);
            node.getSelectors().getChildren().forEach(function (node) {
                if (node instanceof nodes.Selector) {
                    if (node.getChildren().length === 1) {
                        current.addSymbol(new Symbol(node.getChild(0).getText(), node, nodes.ReferenceType.Rule));
                    }
                }
            });
            return true;
        };
        return ScopeBuilder;
    }());
    exports.ScopeBuilder = ScopeBuilder;
    var Symbols = (function () {
        function Symbols(node) {
            this.global = new GlobalScope();
            node.accept(new ScopeBuilder(this.global));
        }
        Symbols.prototype.findSymbolsAtOffset = function (offset, referenceType) {
            var scope = this.global.findScope(offset, 0);
            var result = [];
            var names = {};
            while (scope) {
                var symbols = scope.getSymbols();
                for (var i = 0; i < symbols.length; i++) {
                    var symbol = symbols[i];
                    if (symbol.node.offset <= offset && symbol.type === referenceType && !names[symbol.name]) {
                        result.push(symbol);
                        names[symbol.name] = true;
                    }
                }
                scope = scope.parent;
            }
            return result;
        };
        Symbols.prototype.internalFindSymbol = function (node, referenceTypes) {
            var scopeNode = node;
            if (node.parent instanceof nodes.FunctionParameter && node.parent.getParent() instanceof nodes.BodyDeclaration) {
                scopeNode = node.parent.getParent().getDeclarations();
            }
            if (node.parent instanceof nodes.FunctionArgument && node.parent.getParent() instanceof nodes.Function) {
                var funcId = node.parent.getParent().getIdentifier();
                if (funcId) {
                    var functionSymbol = this.internalFindSymbol(funcId, [nodes.ReferenceType.Function]);
                    if (functionSymbol) {
                        scopeNode = functionSymbol.node.getDeclarations();
                    }
                }
            }
            if (!scopeNode) {
                return null;
            }
            var name = node.getText();
            var scope = this.global.findScope(scopeNode.offset, scopeNode.length);
            while (scope) {
                for (var index = 0; index < referenceTypes.length; index++) {
                    var type = referenceTypes[index];
                    var symbol = scope.getSymbol(name, type);
                    if (symbol) {
                        return symbol;
                    }
                }
                scope = scope.parent;
            }
            return null;
        };
        Symbols.prototype.evaluateReferenceTypes = function (node) {
            if (node instanceof nodes.Identifier) {
                var referenceTypes = node.referenceTypes;
                if (referenceTypes) {
                    return referenceTypes;
                }
                else {
                    // are a reference to a keyframe?
                    var decl = nodes.getParentDeclaration(node);
                    if (decl) {
                        var propertyName = decl.getNonPrefixedPropertyName();
                        if ((propertyName === 'animation' || propertyName === 'animation-name')
                            && decl.getValue() && decl.getValue().offset === node.offset) {
                            return [nodes.ReferenceType.Keyframe];
                        }
                    }
                }
            }
            else if (node instanceof nodes.Variable) {
                return [nodes.ReferenceType.Variable];
            }
            var selector = node.findParent(nodes.NodeType.Selector);
            if (selector) {
                return [nodes.ReferenceType.Rule];
            }
            var extendsRef = node.findParent(nodes.NodeType.ExtendsReference);
            if (extendsRef) {
                return [nodes.ReferenceType.Rule];
            }
            return null;
        };
        Symbols.prototype.findSymbolFromNode = function (node) {
            if (!node) {
                return null;
            }
            while (node.type === nodes.NodeType.Interpolation) {
                node = node.getParent();
            }
            var referenceTypes = this.evaluateReferenceTypes(node);
            if (referenceTypes) {
                return this.internalFindSymbol(node, referenceTypes);
            }
            return null;
        };
        Symbols.prototype.matchesSymbol = function (node, symbol) {
            if (!node) {
                return null;
            }
            while (node.type === nodes.NodeType.Interpolation) {
                node = node.getParent();
            }
            if (symbol.name.length !== node.length || symbol.name !== node.getText()) {
                return false;
            }
            var referenceTypes = this.evaluateReferenceTypes(node);
            if (!referenceTypes || referenceTypes.indexOf(symbol.type) === -1) {
                return false;
            }
            var nodeSymbol = this.internalFindSymbol(node, referenceTypes);
            return nodeSymbol === symbol;
        };
        Symbols.prototype.findSymbol = function (name, type, offset) {
            var scope = this.global.findScope(offset);
            while (scope) {
                var symbol = scope.getSymbol(name, type);
                if (symbol) {
                    return symbol;
                }
                scope = scope.parent;
            }
            return null;
        };
        return Symbols;
    }());
    exports.Symbols = Symbols;
});
//# sourceMappingURL=cssSymbols.js.map