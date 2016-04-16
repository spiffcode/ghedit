var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/types'], function (require, exports, types) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /// <summary>
    /// Nodes for the css 2.1 specification. See for reference:
    /// http://www.w3.org/TR/CSS21/grammar.html#grammar
    /// </summary>
    (function (NodeType) {
        NodeType[NodeType["Undefined"] = 0] = "Undefined";
        NodeType[NodeType["Identifier"] = 1] = "Identifier";
        NodeType[NodeType["Stylesheet"] = 2] = "Stylesheet";
        NodeType[NodeType["Ruleset"] = 3] = "Ruleset";
        NodeType[NodeType["Selector"] = 4] = "Selector";
        NodeType[NodeType["SimpleSelector"] = 5] = "SimpleSelector";
        NodeType[NodeType["SelectorInterpolation"] = 6] = "SelectorInterpolation";
        NodeType[NodeType["SelectorCombinator"] = 7] = "SelectorCombinator";
        NodeType[NodeType["SelectorCombinatorParent"] = 8] = "SelectorCombinatorParent";
        NodeType[NodeType["SelectorCombinatorSibling"] = 9] = "SelectorCombinatorSibling";
        NodeType[NodeType["SelectorCombinatorAllSiblings"] = 10] = "SelectorCombinatorAllSiblings";
        NodeType[NodeType["Page"] = 11] = "Page";
        NodeType[NodeType["PageBoxMarginBox"] = 12] = "PageBoxMarginBox";
        NodeType[NodeType["ClassSelector"] = 13] = "ClassSelector";
        NodeType[NodeType["IdentifierSelector"] = 14] = "IdentifierSelector";
        NodeType[NodeType["ElementNameSelector"] = 15] = "ElementNameSelector";
        NodeType[NodeType["PseudoSelector"] = 16] = "PseudoSelector";
        NodeType[NodeType["AttributeSelector"] = 17] = "AttributeSelector";
        NodeType[NodeType["Declaration"] = 18] = "Declaration";
        NodeType[NodeType["Declarations"] = 19] = "Declarations";
        NodeType[NodeType["Property"] = 20] = "Property";
        NodeType[NodeType["Expression"] = 21] = "Expression";
        NodeType[NodeType["BinaryExpression"] = 22] = "BinaryExpression";
        NodeType[NodeType["Term"] = 23] = "Term";
        NodeType[NodeType["Operator"] = 24] = "Operator";
        NodeType[NodeType["Value"] = 25] = "Value";
        NodeType[NodeType["StringLiteral"] = 26] = "StringLiteral";
        NodeType[NodeType["URILiteral"] = 27] = "URILiteral";
        NodeType[NodeType["EscapedValue"] = 28] = "EscapedValue";
        NodeType[NodeType["Function"] = 29] = "Function";
        NodeType[NodeType["NumericValue"] = 30] = "NumericValue";
        NodeType[NodeType["HexColorValue"] = 31] = "HexColorValue";
        NodeType[NodeType["MixinDeclaration"] = 32] = "MixinDeclaration";
        NodeType[NodeType["MixinReference"] = 33] = "MixinReference";
        NodeType[NodeType["VariableName"] = 34] = "VariableName";
        NodeType[NodeType["VariableDeclaration"] = 35] = "VariableDeclaration";
        NodeType[NodeType["Prio"] = 36] = "Prio";
        NodeType[NodeType["Interpolation"] = 37] = "Interpolation";
        NodeType[NodeType["NestedProperties"] = 38] = "NestedProperties";
        NodeType[NodeType["ExtendsReference"] = 39] = "ExtendsReference";
        NodeType[NodeType["SelectorPlaceholder"] = 40] = "SelectorPlaceholder";
        NodeType[NodeType["Debug"] = 41] = "Debug";
        NodeType[NodeType["If"] = 42] = "If";
        NodeType[NodeType["Else"] = 43] = "Else";
        NodeType[NodeType["For"] = 44] = "For";
        NodeType[NodeType["Each"] = 45] = "Each";
        NodeType[NodeType["While"] = 46] = "While";
        NodeType[NodeType["MixinContent"] = 47] = "MixinContent";
        NodeType[NodeType["Media"] = 48] = "Media";
        NodeType[NodeType["Keyframe"] = 49] = "Keyframe";
        NodeType[NodeType["FontFace"] = 50] = "FontFace";
        NodeType[NodeType["Import"] = 51] = "Import";
        NodeType[NodeType["Namespace"] = 52] = "Namespace";
        NodeType[NodeType["Invocation"] = 53] = "Invocation";
        NodeType[NodeType["FunctionDeclaration"] = 54] = "FunctionDeclaration";
        NodeType[NodeType["ReturnStatement"] = 55] = "ReturnStatement";
        NodeType[NodeType["MediaQuery"] = 56] = "MediaQuery";
        NodeType[NodeType["FunctionParameter"] = 57] = "FunctionParameter";
        NodeType[NodeType["FunctionArgument"] = 58] = "FunctionArgument";
        NodeType[NodeType["KeyframeSelector"] = 59] = "KeyframeSelector";
        NodeType[NodeType["MSViewPort"] = 60] = "MSViewPort";
        NodeType[NodeType["Document"] = 61] = "Document";
    })(exports.NodeType || (exports.NodeType = {}));
    var NodeType = exports.NodeType;
    (function (ReferenceType) {
        ReferenceType[ReferenceType["Mixin"] = 0] = "Mixin";
        ReferenceType[ReferenceType["Rule"] = 1] = "Rule";
        ReferenceType[ReferenceType["Variable"] = 2] = "Variable";
        ReferenceType[ReferenceType["Function"] = 3] = "Function";
        ReferenceType[ReferenceType["Keyframe"] = 4] = "Keyframe";
        ReferenceType[ReferenceType["Unknown"] = 5] = "Unknown";
    })(exports.ReferenceType || (exports.ReferenceType = {}));
    var ReferenceType = exports.ReferenceType;
    function getNodeAtOffset(node, offset) {
        var candidate = null;
        if (!node || offset < node.offset || offset > node.offset + node.length) {
            return null;
        }
        // Find the shortest node at the position
        node.accept(function (node) {
            if (node.offset === -1 && node.length === -1) {
                return true;
            }
            if (node.offset <= offset && node.offset + node.length >= offset) {
                if (!candidate) {
                    candidate = node;
                }
                else if (node.length <= candidate.length) {
                    candidate = node;
                }
                return true;
            }
            return false;
        });
        return candidate;
    }
    exports.getNodeAtOffset = getNodeAtOffset;
    function getNodePath(node, offset) {
        var candidate = getNodeAtOffset(node, offset), path = [];
        while (candidate) {
            path.unshift(candidate);
            candidate = candidate.parent;
        }
        return path;
    }
    exports.getNodePath = getNodePath;
    function getParentDeclaration(node) {
        var decl = node.findParent(NodeType.Declaration);
        if (decl && decl.getValue() && decl.getValue().encloses(node)) {
            return decl;
        }
        return null;
    }
    exports.getParentDeclaration = getParentDeclaration;
    var Node = (function () {
        function Node(offset, len, nodeType) {
            if (offset === void 0) { offset = -1; }
            if (len === void 0) { len = -1; }
            this.parent = null;
            this.offset = offset;
            this.length = len;
            if (nodeType) {
                this.nodeType = nodeType;
            }
        }
        Object.defineProperty(Node.prototype, "type", {
            get: function () {
                return this.nodeType || NodeType.Undefined;
            },
            set: function (type) {
                this.nodeType = type;
            },
            enumerable: true,
            configurable: true
        });
        Node.prototype.getTextProvider = function () {
            var node = this;
            while (node && !node.textProvider) {
                node = node.parent;
            }
            if (node) {
                return node.textProvider;
            }
            return function () { return 'unknown'; };
        };
        Node.prototype.getText = function () {
            return this.getTextProvider()(this.offset, this.length);
        };
        Node.prototype.matches = function (str) {
            return this.length === str.length && this.getTextProvider()(this.offset, this.length) === str;
        };
        Node.prototype.startsWith = function (str) {
            return this.length >= str.length && this.getTextProvider()(this.offset, str.length) === str;
        };
        Node.prototype.endsWith = function (str) {
            return this.length >= str.length && this.getTextProvider()(this.offset + this.length - str.length, str.length) === str;
        };
        Node.prototype.accept = function (visitor) {
            if (!types.isFunction(visitor)) {
                visitor = visitor.visitNode.bind(visitor);
            }
            if (visitor(this) && this.children) {
                this.children.forEach(function (child) {
                    child.accept(visitor);
                });
            }
        };
        Node.prototype.adoptChild = function (node, index) {
            if (index === void 0) { index = -1; }
            if (node.parent && node.parent.children) {
                var idx = node.parent.children.indexOf(node);
                if (idx >= 0) {
                    node.parent.children.splice(idx, 1);
                }
            }
            node.parent = this;
            var children = this.children;
            if (!children) {
                children = this.children = [];
            }
            if (index !== -1) {
                children.splice(idx, 0, node);
            }
            else {
                children.push(node);
            }
            return node;
        };
        Node.prototype.attachTo = function (parent, index) {
            if (index === void 0) { index = -1; }
            if (parent) {
                parent.adoptChild(this, index);
            }
            return this;
        };
        Node.prototype.collectIssues = function (results) {
            if (this.issues) {
                results.push.apply(results, this.issues);
            }
        };
        Node.prototype.addIssue = function (issue) {
            if (!this.issues) {
                this.issues = [];
            }
            this.issues.push(issue);
        };
        Node.prototype.hasIssue = function (rule) {
            return this.issues && this.issues.some(function (i) { return i.getRule() === rule; });
        };
        Node.prototype.isErroneous = function () {
            return this.issues && this.issues.length > 0;
        };
        Node.prototype.setNode = function (field, node, index) {
            if (index === void 0) { index = -1; }
            if (node) {
                node.attachTo(this, index);
                this[field] = node;
                return true;
            }
            return false;
        };
        Node.prototype.addChild = function (node) {
            if (node) {
                if (!this.children) {
                    this.children = [];
                }
                node.attachTo(this);
                this.updateOffsetAndLength(node);
                return true;
            }
            return false;
        };
        Node.prototype.updateOffsetAndLength = function (node) {
            if (node.offset < this.offset || this.offset === -1) {
                this.offset = node.offset;
            }
            if ((node.offset + node.length > this.offset + this.length) || this.length === -1) {
                this.length = node.offset + node.length - this.offset;
            }
        };
        Node.prototype.hasChildren = function () {
            return this.children && this.children.length > 0;
        };
        Node.prototype.getChildren = function () {
            return this.children ? this.children.slice(0) : [];
        };
        Node.prototype.getChild = function (index) {
            if (this.children && index < this.children.length) {
                return this.children[index];
            }
            return null;
        };
        Node.prototype.addChildren = function (nodes) {
            var _this = this;
            nodes.forEach(function (node) { return _this.addChild(node); });
        };
        Node.prototype.findFirstChildBeforeOffset = function (offset) {
            if (this.children) {
                var current = null;
                for (var i = this.children.length - 1; i >= 0; i--) {
                    // iterate until we find a child that has a start offset smaller than the input offset
                    current = this.children[i];
                    if (current.offset <= offset) {
                        return current;
                    }
                }
            }
            return null;
        };
        Node.prototype.findChildAtOffset = function (offset, goDeep) {
            var current = this.findFirstChildBeforeOffset(offset);
            if (current && current.offset + current.length >= offset) {
                if (goDeep) {
                    return current.findChildAtOffset(offset, true) || current;
                }
                return current;
            }
            return null;
        };
        Node.prototype.encloses = function (candidate) {
            return this.offset <= candidate.offset && this.offset + this.length >= candidate.offset + candidate.length;
        };
        Node.prototype.getParent = function () {
            var result = this.parent;
            while (result instanceof Nodelist) {
                result = result.parent;
            }
            return result;
        };
        Node.prototype.findParent = function (type) {
            var result = this;
            while (result && result.type !== type) {
                result = result.parent;
            }
            return result;
        };
        Node.prototype.setData = function (key, value) {
            if (!this.options) {
                this.options = {};
            }
            this.options[key] = value;
        };
        Node.prototype.getData = function (key) {
            if (!this.options || !this.options.hasOwnProperty(key)) {
                return null;
            }
            return this.options[key];
        };
        return Node;
    }());
    exports.Node = Node;
    var Nodelist = (function (_super) {
        __extends(Nodelist, _super);
        function Nodelist(parent, index) {
            if (index === void 0) { index = -1; }
            _super.call(this, -1, -1);
            this.attachTo(parent, index);
            this.offset = -1;
            this.length = -1;
        }
        return Nodelist;
    }(Node));
    exports.Nodelist = Nodelist;
    var Identifier = (function (_super) {
        __extends(Identifier, _super);
        function Identifier(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(Identifier.prototype, "type", {
            get: function () {
                return NodeType.Identifier;
            },
            enumerable: true,
            configurable: true
        });
        Identifier.prototype.containsInterpolation = function () {
            return this.hasChildren();
        };
        return Identifier;
    }(Node));
    exports.Identifier = Identifier;
    var Stylesheet = (function (_super) {
        __extends(Stylesheet, _super);
        function Stylesheet(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(Stylesheet.prototype, "type", {
            get: function () {
                return NodeType.Stylesheet;
            },
            enumerable: true,
            configurable: true
        });
        Stylesheet.prototype.setName = function (value) {
            this.name = value;
        };
        return Stylesheet;
    }(Node));
    exports.Stylesheet = Stylesheet;
    var Declarations = (function (_super) {
        __extends(Declarations, _super);
        function Declarations(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(Declarations.prototype, "type", {
            get: function () {
                return NodeType.Declarations;
            },
            enumerable: true,
            configurable: true
        });
        return Declarations;
    }(Node));
    exports.Declarations = Declarations;
    var BodyDeclaration = (function (_super) {
        __extends(BodyDeclaration, _super);
        function BodyDeclaration(offset, length) {
            _super.call(this, offset, length);
        }
        BodyDeclaration.prototype.getDeclarations = function () {
            return this.declarations;
        };
        BodyDeclaration.prototype.setDeclarations = function (decls) {
            return this.setNode('declarations', decls);
        };
        return BodyDeclaration;
    }(Node));
    exports.BodyDeclaration = BodyDeclaration;
    var RuleSet = (function (_super) {
        __extends(RuleSet, _super);
        function RuleSet(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(RuleSet.prototype, "type", {
            get: function () {
                return NodeType.Ruleset;
            },
            enumerable: true,
            configurable: true
        });
        RuleSet.prototype.getSelectors = function () {
            if (!this.selectors) {
                this.selectors = new Nodelist(this);
            }
            return this.selectors;
        };
        RuleSet.prototype.isNested = function () {
            return this.parent && this.parent.findParent(NodeType.Ruleset) !== null;
        };
        return RuleSet;
    }(BodyDeclaration));
    exports.RuleSet = RuleSet;
    var Selector = (function (_super) {
        __extends(Selector, _super);
        function Selector(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(Selector.prototype, "type", {
            get: function () {
                return NodeType.Selector;
            },
            enumerable: true,
            configurable: true
        });
        return Selector;
    }(Node));
    exports.Selector = Selector;
    var SimpleSelector = (function (_super) {
        __extends(SimpleSelector, _super);
        function SimpleSelector(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(SimpleSelector.prototype, "type", {
            get: function () {
                return NodeType.SimpleSelector;
            },
            enumerable: true,
            configurable: true
        });
        return SimpleSelector;
    }(Node));
    exports.SimpleSelector = SimpleSelector;
    var Declaration = (function (_super) {
        __extends(Declaration, _super);
        function Declaration(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(Declaration.prototype, "type", {
            get: function () {
                return NodeType.Declaration;
            },
            enumerable: true,
            configurable: true
        });
        Declaration.prototype.setProperty = function (node) {
            return this.setNode('property', node);
        };
        Declaration.prototype.getProperty = function () {
            return this.property;
        };
        Declaration.prototype.getFullPropertyName = function () {
            var propertyName = this.property ? this.property.getName() : 'unknown';
            if (this.parent instanceof Declarations && this.parent.getParent() instanceof NestedProperties) {
                var parentDecl = this.parent.getParent().getParent();
                if (parentDecl instanceof Declaration) {
                    return parentDecl.getFullPropertyName() + propertyName;
                }
            }
            return propertyName;
        };
        Declaration.prototype.getNonPrefixedPropertyName = function () {
            var propertyName = this.getFullPropertyName();
            if (propertyName && propertyName.charAt(0) === '-') {
                var vendorPrefixEnd = propertyName.indexOf('-', 1);
                if (vendorPrefixEnd !== -1) {
                    return propertyName.substring(vendorPrefixEnd + 1);
                }
            }
            return propertyName;
        };
        Declaration.prototype.setValue = function (value) {
            return this.setNode('value', value);
        };
        Declaration.prototype.getValue = function () {
            return this.value;
        };
        Declaration.prototype.setNestedProperties = function (value) {
            return this.setNode('nestedProprties', value);
        };
        Declaration.prototype.getNestedProperties = function () {
            return this.nestedProprties;
        };
        return Declaration;
    }(Node));
    exports.Declaration = Declaration;
    var Property = (function (_super) {
        __extends(Property, _super);
        function Property(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(Property.prototype, "type", {
            get: function () {
                return NodeType.Property;
            },
            enumerable: true,
            configurable: true
        });
        Property.prototype.setIdentifier = function (value) {
            return this.setNode('identifier', value);
        };
        Property.prototype.getIdentifier = function () {
            return this.identifier;
        };
        Property.prototype.getName = function () {
            return this.getText();
        };
        return Property;
    }(Node));
    exports.Property = Property;
    var Invocation = (function (_super) {
        __extends(Invocation, _super);
        function Invocation(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(Invocation.prototype, "type", {
            get: function () {
                return NodeType.Invocation;
            },
            enumerable: true,
            configurable: true
        });
        Invocation.prototype.getArguments = function () {
            if (!this.arguments) {
                this.arguments = new Nodelist(this);
            }
            return this.arguments;
        };
        return Invocation;
    }(Node));
    exports.Invocation = Invocation;
    var Function = (function (_super) {
        __extends(Function, _super);
        function Function(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(Function.prototype, "type", {
            get: function () {
                return NodeType.Function;
            },
            enumerable: true,
            configurable: true
        });
        Function.prototype.setIdentifier = function (node) {
            return this.setNode('identifier', node, 0);
        };
        Function.prototype.getIdentifier = function () {
            return this.identifier;
        };
        Function.prototype.getName = function () {
            return this.identifier ? this.identifier.getText() : '';
        };
        return Function;
    }(Invocation));
    exports.Function = Function;
    var FunctionParameter = (function (_super) {
        __extends(FunctionParameter, _super);
        function FunctionParameter(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(FunctionParameter.prototype, "type", {
            get: function () {
                return NodeType.FunctionParameter;
            },
            enumerable: true,
            configurable: true
        });
        FunctionParameter.prototype.setIdentifier = function (node) {
            return this.setNode('identifier', node, 0);
        };
        FunctionParameter.prototype.getIdentifier = function () {
            return this.identifier;
        };
        FunctionParameter.prototype.getName = function () {
            return this.identifier ? this.identifier.getText() : '';
        };
        FunctionParameter.prototype.setDefaultValue = function (node) {
            return this.setNode('defaultValue', node, 0);
        };
        FunctionParameter.prototype.getDefaultValue = function () {
            return this.defaultValue;
        };
        return FunctionParameter;
    }(Node));
    exports.FunctionParameter = FunctionParameter;
    var FunctionArgument = (function (_super) {
        __extends(FunctionArgument, _super);
        function FunctionArgument(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(FunctionArgument.prototype, "type", {
            get: function () {
                return NodeType.FunctionArgument;
            },
            enumerable: true,
            configurable: true
        });
        FunctionArgument.prototype.setIdentifier = function (node) {
            return this.setNode('identifier', node, 0);
        };
        FunctionArgument.prototype.getIdentifier = function () {
            return this.identifier;
        };
        FunctionArgument.prototype.getName = function () {
            return this.identifier ? this.identifier.getText() : '';
        };
        FunctionArgument.prototype.setValue = function (node) {
            return this.setNode('value', node, 0);
        };
        FunctionArgument.prototype.getValue = function () {
            return this.value;
        };
        return FunctionArgument;
    }(Node));
    exports.FunctionArgument = FunctionArgument;
    var IfStatement = (function (_super) {
        __extends(IfStatement, _super);
        function IfStatement(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(IfStatement.prototype, "type", {
            get: function () {
                return NodeType.If;
            },
            enumerable: true,
            configurable: true
        });
        IfStatement.prototype.setExpression = function (node) {
            return this.setNode('expression', node, 0);
        };
        IfStatement.prototype.setElseClause = function (elseClause) {
            return this.setNode('elseClause', elseClause);
        };
        return IfStatement;
    }(BodyDeclaration));
    exports.IfStatement = IfStatement;
    var ForStatement = (function (_super) {
        __extends(ForStatement, _super);
        function ForStatement(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(ForStatement.prototype, "type", {
            get: function () {
                return NodeType.For;
            },
            enumerable: true,
            configurable: true
        });
        ForStatement.prototype.setVariable = function (node) {
            return this.setNode('variable', node, 0);
        };
        return ForStatement;
    }(BodyDeclaration));
    exports.ForStatement = ForStatement;
    var EachStatement = (function (_super) {
        __extends(EachStatement, _super);
        function EachStatement(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(EachStatement.prototype, "type", {
            get: function () {
                return NodeType.Each;
            },
            enumerable: true,
            configurable: true
        });
        EachStatement.prototype.setVariable = function (node) {
            return this.setNode('variable', node, 0);
        };
        return EachStatement;
    }(BodyDeclaration));
    exports.EachStatement = EachStatement;
    var WhileStatement = (function (_super) {
        __extends(WhileStatement, _super);
        function WhileStatement(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(WhileStatement.prototype, "type", {
            get: function () {
                return NodeType.While;
            },
            enumerable: true,
            configurable: true
        });
        return WhileStatement;
    }(BodyDeclaration));
    exports.WhileStatement = WhileStatement;
    var ElseStatement = (function (_super) {
        __extends(ElseStatement, _super);
        function ElseStatement(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(ElseStatement.prototype, "type", {
            get: function () {
                return NodeType.Else;
            },
            enumerable: true,
            configurable: true
        });
        return ElseStatement;
    }(BodyDeclaration));
    exports.ElseStatement = ElseStatement;
    var FunctionDeclaration = (function (_super) {
        __extends(FunctionDeclaration, _super);
        function FunctionDeclaration(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(FunctionDeclaration.prototype, "type", {
            get: function () {
                return NodeType.FunctionDeclaration;
            },
            enumerable: true,
            configurable: true
        });
        FunctionDeclaration.prototype.setIdentifier = function (node) {
            return this.setNode('identifier', node, 0);
        };
        FunctionDeclaration.prototype.getIdentifier = function () {
            return this.identifier;
        };
        FunctionDeclaration.prototype.getName = function () {
            return this.identifier ? this.identifier.getText() : '';
        };
        FunctionDeclaration.prototype.getParameters = function () {
            if (!this.parameters) {
                this.parameters = new Nodelist(this);
            }
            return this.parameters;
        };
        return FunctionDeclaration;
    }(BodyDeclaration));
    exports.FunctionDeclaration = FunctionDeclaration;
    var MSViewPort = (function (_super) {
        __extends(MSViewPort, _super);
        function MSViewPort(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(MSViewPort.prototype, "type", {
            get: function () {
                return NodeType.MSViewPort;
            },
            enumerable: true,
            configurable: true
        });
        return MSViewPort;
    }(BodyDeclaration));
    exports.MSViewPort = MSViewPort;
    var FontFace = (function (_super) {
        __extends(FontFace, _super);
        function FontFace(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(FontFace.prototype, "type", {
            get: function () {
                return NodeType.FontFace;
            },
            enumerable: true,
            configurable: true
        });
        return FontFace;
    }(BodyDeclaration));
    exports.FontFace = FontFace;
    var NestedProperties = (function (_super) {
        __extends(NestedProperties, _super);
        function NestedProperties(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(NestedProperties.prototype, "type", {
            get: function () {
                return NodeType.NestedProperties;
            },
            enumerable: true,
            configurable: true
        });
        return NestedProperties;
    }(BodyDeclaration));
    exports.NestedProperties = NestedProperties;
    var Keyframe = (function (_super) {
        __extends(Keyframe, _super);
        function Keyframe(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(Keyframe.prototype, "type", {
            get: function () {
                return NodeType.Keyframe;
            },
            enumerable: true,
            configurable: true
        });
        Keyframe.prototype.setKeyword = function (keyword) {
            return this.setNode('keyword', keyword, 0);
        };
        Keyframe.prototype.getKeyword = function () {
            return this.keyword;
        };
        Keyframe.prototype.setIdentifier = function (node) {
            return this.setNode('identifier', node, 0);
        };
        Keyframe.prototype.getIdentifier = function () {
            return this.identifier;
        };
        Keyframe.prototype.getName = function () {
            return this.identifier ? this.identifier.getText() : '';
        };
        return Keyframe;
    }(BodyDeclaration));
    exports.Keyframe = Keyframe;
    var KeyframeSelector = (function (_super) {
        __extends(KeyframeSelector, _super);
        function KeyframeSelector(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(KeyframeSelector.prototype, "type", {
            get: function () {
                return NodeType.KeyframeSelector;
            },
            enumerable: true,
            configurable: true
        });
        return KeyframeSelector;
    }(BodyDeclaration));
    exports.KeyframeSelector = KeyframeSelector;
    var Import = (function (_super) {
        __extends(Import, _super);
        function Import(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(Import.prototype, "type", {
            get: function () {
                return NodeType.Import;
            },
            enumerable: true,
            configurable: true
        });
        Import.prototype.setMedialist = function (node) {
            if (node) {
                node.attachTo(this);
                this.medialist = node;
                return true;
            }
            return false;
        };
        return Import;
    }(Node));
    exports.Import = Import;
    var Namespace = (function (_super) {
        __extends(Namespace, _super);
        function Namespace(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(Namespace.prototype, "type", {
            get: function () {
                return NodeType.Namespace;
            },
            enumerable: true,
            configurable: true
        });
        return Namespace;
    }(Node));
    exports.Namespace = Namespace;
    var Media = (function (_super) {
        __extends(Media, _super);
        function Media(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(Media.prototype, "type", {
            get: function () {
                return NodeType.Media;
            },
            enumerable: true,
            configurable: true
        });
        return Media;
    }(BodyDeclaration));
    exports.Media = Media;
    var Document = (function (_super) {
        __extends(Document, _super);
        function Document(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(Document.prototype, "type", {
            get: function () {
                return NodeType.Document;
            },
            enumerable: true,
            configurable: true
        });
        return Document;
    }(BodyDeclaration));
    exports.Document = Document;
    var Medialist = (function (_super) {
        __extends(Medialist, _super);
        function Medialist(offset, length) {
            _super.call(this, offset, length);
        }
        Medialist.prototype.getMediums = function () {
            if (!this.mediums) {
                this.mediums = new Nodelist(this);
            }
            return this.mediums;
        };
        return Medialist;
    }(Node));
    exports.Medialist = Medialist;
    var MediaQuery = (function (_super) {
        __extends(MediaQuery, _super);
        function MediaQuery(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(MediaQuery.prototype, "type", {
            get: function () {
                return NodeType.MediaQuery;
            },
            enumerable: true,
            configurable: true
        });
        return MediaQuery;
    }(Node));
    exports.MediaQuery = MediaQuery;
    var Page = (function (_super) {
        __extends(Page, _super);
        function Page(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(Page.prototype, "type", {
            get: function () {
                return NodeType.Page;
            },
            enumerable: true,
            configurable: true
        });
        return Page;
    }(BodyDeclaration));
    exports.Page = Page;
    var PageBoxMarginBox = (function (_super) {
        __extends(PageBoxMarginBox, _super);
        function PageBoxMarginBox(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(PageBoxMarginBox.prototype, "type", {
            get: function () {
                return NodeType.PageBoxMarginBox;
            },
            enumerable: true,
            configurable: true
        });
        return PageBoxMarginBox;
    }(BodyDeclaration));
    exports.PageBoxMarginBox = PageBoxMarginBox;
    var Expression = (function (_super) {
        __extends(Expression, _super);
        function Expression(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(Expression.prototype, "type", {
            get: function () {
                return NodeType.Expression;
            },
            enumerable: true,
            configurable: true
        });
        return Expression;
    }(Node));
    exports.Expression = Expression;
    var BinaryExpression = (function (_super) {
        __extends(BinaryExpression, _super);
        function BinaryExpression(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(BinaryExpression.prototype, "type", {
            get: function () {
                return NodeType.BinaryExpression;
            },
            enumerable: true,
            configurable: true
        });
        BinaryExpression.prototype.setLeft = function (left) {
            return this.setNode('left', left);
        };
        BinaryExpression.prototype.getLeft = function () {
            return this.left;
        };
        BinaryExpression.prototype.setRight = function (right) {
            return this.setNode('right', right);
        };
        BinaryExpression.prototype.getRight = function () {
            return this.right;
        };
        BinaryExpression.prototype.setOperator = function (value) {
            return this.setNode('operator', value);
        };
        BinaryExpression.prototype.getOperator = function () {
            return this.operator;
        };
        return BinaryExpression;
    }(Node));
    exports.BinaryExpression = BinaryExpression;
    var Term = (function (_super) {
        __extends(Term, _super);
        function Term(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(Term.prototype, "type", {
            get: function () {
                return NodeType.Term;
            },
            enumerable: true,
            configurable: true
        });
        Term.prototype.setOperator = function (value) {
            return this.setNode('operator', value);
        };
        Term.prototype.getOperator = function () {
            return this.operator;
        };
        Term.prototype.setExpression = function (value) {
            return this.setNode('expression', value);
        };
        Term.prototype.getExpression = function () {
            return this.expression;
        };
        return Term;
    }(Node));
    exports.Term = Term;
    var Operator = (function (_super) {
        __extends(Operator, _super);
        function Operator(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(Operator.prototype, "type", {
            get: function () {
                return NodeType.Operator;
            },
            enumerable: true,
            configurable: true
        });
        return Operator;
    }(Node));
    exports.Operator = Operator;
    var HexColorValue = (function (_super) {
        __extends(HexColorValue, _super);
        function HexColorValue(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(HexColorValue.prototype, "type", {
            get: function () {
                return NodeType.HexColorValue;
            },
            enumerable: true,
            configurable: true
        });
        return HexColorValue;
    }(Node));
    exports.HexColorValue = HexColorValue;
    var NumericValue = (function (_super) {
        __extends(NumericValue, _super);
        function NumericValue(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(NumericValue.prototype, "type", {
            get: function () {
                return NodeType.NumericValue;
            },
            enumerable: true,
            configurable: true
        });
        NumericValue.prototype.getValue = function () {
            var raw = this.getText();
            var unitIdx = 0, code, _dot = '.'.charCodeAt(0), _0 = '0'.charCodeAt(0), _9 = '9'.charCodeAt(0);
            for (var i = 0, len = raw.length; i < len; i++) {
                code = raw.charCodeAt(i);
                if (!(_0 <= code && code <= _9 || code === _dot)) {
                    break;
                }
                unitIdx += 1;
            }
            return {
                value: raw.substring(0, unitIdx),
                unit: unitIdx < len ? raw.substring(unitIdx) : undefined
            };
        };
        return NumericValue;
    }(Node));
    exports.NumericValue = NumericValue;
    var VariableDeclaration = (function (_super) {
        __extends(VariableDeclaration, _super);
        function VariableDeclaration(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(VariableDeclaration.prototype, "type", {
            get: function () {
                return NodeType.VariableDeclaration;
            },
            enumerable: true,
            configurable: true
        });
        VariableDeclaration.prototype.setVariable = function (node) {
            if (node) {
                node.attachTo(this);
                this.variable = node;
                return true;
            }
            return false;
        };
        VariableDeclaration.prototype.getName = function () {
            return this.variable ? this.variable.getName() : '';
        };
        VariableDeclaration.prototype.setValue = function (node) {
            if (node) {
                node.attachTo(this);
                this.value = node;
                return true;
            }
            return false;
        };
        return VariableDeclaration;
    }(Node));
    exports.VariableDeclaration = VariableDeclaration;
    var Interpolation = (function (_super) {
        __extends(Interpolation, _super);
        function Interpolation(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(Interpolation.prototype, "type", {
            get: function () {
                return NodeType.Interpolation;
            },
            enumerable: true,
            configurable: true
        });
        return Interpolation;
    }(Node));
    exports.Interpolation = Interpolation;
    var Variable = (function (_super) {
        __extends(Variable, _super);
        function Variable(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(Variable.prototype, "type", {
            get: function () {
                return NodeType.VariableName;
            },
            enumerable: true,
            configurable: true
        });
        Variable.prototype.getName = function () {
            return this.getText();
        };
        return Variable;
    }(Node));
    exports.Variable = Variable;
    var ExtendsReference = (function (_super) {
        __extends(ExtendsReference, _super);
        function ExtendsReference(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(ExtendsReference.prototype, "type", {
            get: function () {
                return NodeType.ExtendsReference;
            },
            enumerable: true,
            configurable: true
        });
        ExtendsReference.prototype.setSelector = function (node) {
            return this.setNode('selector', node, 0);
        };
        ExtendsReference.prototype.getSelector = function () {
            return this.selector;
        };
        ExtendsReference.prototype.getName = function () {
            return this.selector ? this.selector.getText() : '';
        };
        return ExtendsReference;
    }(Node));
    exports.ExtendsReference = ExtendsReference;
    var MixinReference = (function (_super) {
        __extends(MixinReference, _super);
        function MixinReference(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(MixinReference.prototype, "type", {
            get: function () {
                return NodeType.MixinReference;
            },
            enumerable: true,
            configurable: true
        });
        MixinReference.prototype.setIdentifier = function (node) {
            return this.setNode('identifier', node, 0);
        };
        MixinReference.prototype.getIdentifier = function () {
            return this.identifier;
        };
        MixinReference.prototype.getName = function () {
            return this.identifier ? this.identifier.getText() : '';
        };
        MixinReference.prototype.getArguments = function () {
            if (!this.arguments) {
                this.arguments = new Nodelist(this);
            }
            return this.arguments;
        };
        MixinReference.prototype.setContent = function (node) {
            return this.setNode('content', node);
        };
        MixinReference.prototype.getContent = function () {
            return this.content;
        };
        return MixinReference;
    }(Node));
    exports.MixinReference = MixinReference;
    var MixinDeclaration = (function (_super) {
        __extends(MixinDeclaration, _super);
        function MixinDeclaration(offset, length) {
            _super.call(this, offset, length);
        }
        Object.defineProperty(MixinDeclaration.prototype, "type", {
            get: function () {
                return NodeType.MixinDeclaration;
            },
            enumerable: true,
            configurable: true
        });
        MixinDeclaration.prototype.setIdentifier = function (node) {
            return this.setNode('identifier', node, 0);
        };
        MixinDeclaration.prototype.getIdentifier = function () {
            return this.identifier;
        };
        MixinDeclaration.prototype.getName = function () {
            return this.identifier ? this.identifier.getText() : '';
        };
        MixinDeclaration.prototype.getParameters = function () {
            if (!this.parameters) {
                this.parameters = new Nodelist(this);
            }
            return this.parameters;
        };
        MixinDeclaration.prototype.setGuard = function (node) {
            if (node) {
                node.attachTo(this);
                this.guard = node;
            }
            return false;
        };
        return MixinDeclaration;
    }(BodyDeclaration));
    exports.MixinDeclaration = MixinDeclaration;
    var LessGuard = (function (_super) {
        __extends(LessGuard, _super);
        function LessGuard() {
            _super.apply(this, arguments);
        }
        LessGuard.prototype.getConditions = function () {
            if (!this.conditions) {
                this.conditions = new Nodelist(this);
            }
            return this.conditions;
        };
        return LessGuard;
    }(Node));
    exports.LessGuard = LessGuard;
    var GuardCondition = (function (_super) {
        __extends(GuardCondition, _super);
        function GuardCondition() {
            _super.apply(this, arguments);
        }
        GuardCondition.prototype.setVariable = function (node) {
            return this.setNode('variable', node);
        };
        return GuardCondition;
    }(Node));
    exports.GuardCondition = GuardCondition;
    var Marker = (function () {
        function Marker(node, rule, level, message, offset, length) {
            if (offset === void 0) { offset = node.offset; }
            if (length === void 0) { length = node.length; }
            this.node = node;
            this.rule = rule;
            this.level = level;
            this.message = message || rule.message;
            this.offset = offset;
            this.length = length;
        }
        Marker.prototype.getRule = function () {
            return this.rule;
        };
        Marker.prototype.getLevel = function () {
            return this.level;
        };
        Marker.prototype.getOffset = function () {
            return this.offset;
        };
        Marker.prototype.getLength = function () {
            return this.length;
        };
        Marker.prototype.getNode = function () {
            return this.node;
        };
        Marker.prototype.getMessage = function () {
            return this.message;
        };
        return Marker;
    }());
    exports.Marker = Marker;
    /*
    export class DefaultVisitor implements IVisitor {
    
        public visitNode(node:Node):boolean {
            switch (node.type) {
                case NodeType.Stylesheet:
                    return this.visitStylesheet(<Stylesheet> node);
                case NodeType.FontFace:
                    return this.visitFontFace(<FontFace> node);
                case NodeType.Ruleset:
                    return this.visitRuleSet(<RuleSet> node);
                case NodeType.Selector:
                    return this.visitSelector(<Selector> node);
                case NodeType.SimpleSelector:
                    return this.visitSimpleSelector(<SimpleSelector> node);
                case NodeType.Declaration:
                    return this.visitDeclaration(<Declaration> node);
                case NodeType.Function:
                    return this.visitFunction(<Function> node);
                case NodeType.FunctionDeclaration:
                    return this.visitFunctionDeclaration(<FunctionDeclaration> node);
                case NodeType.FunctionParameter:
                    return this.visitFunctionParameter(<FunctionParameter> node);
                case NodeType.FunctionArgument:
                    return this.visitFunctionArgument(<FunctionArgument> node);
                case NodeType.Term:
                    return this.visitTerm(<Term> node);
                case NodeType.Declaration:
                    return this.visitExpression(<Expression> node);
                case NodeType.NumericValue:
                    return this.visitNumericValue(<NumericValue> node);
                case NodeType.Page:
                    return this.visitPage(<Page> node);
                case NodeType.PageBoxMarginBox:
                    return this.visitPageBoxMarginBox(<PageBoxMarginBox> node);
                case NodeType.Property:
                    return this.visitProperty(<Property> node);
                case NodeType.NumericValue:
                    return this.visitNodelist(<Nodelist> node);
                case NodeType.Import:
                    return this.visitImport(<Import> node);
                case NodeType.Namespace:
                    return this.visitNamespace(<Namespace> node);
                case NodeType.Keyframe:
                    return this.visitKeyframe(<Keyframe> node);
                case NodeType.KeyframeSelector:
                    return this.visitKeyframeSelector(<KeyframeSelector> node);
                case NodeType.MixinDeclaration:
                    return this.visitMixinDeclaration(<MixinDeclaration> node);
                case NodeType.MixinReference:
                    return this.visitMixinReference(<MixinReference> node);
                case NodeType.Variable:
                    return this.visitVariable(<Variable> node);
                case NodeType.VariableDeclaration:
                    return this.visitVariableDeclaration(<VariableDeclaration> node);
            }
            return this.visitUnknownNode(node);
        }
    
        public visitFontFace(node:FontFace):boolean {
            return true;
        }
    
        public visitKeyframe(node:Keyframe):boolean {
            return true;
        }
    
        public visitKeyframeSelector(node:KeyframeSelector):boolean {
            return true;
        }
    
        public visitStylesheet(node:Stylesheet):boolean {
            return true;
        }
    
        public visitProperty(Node:Property):boolean {
            return true;
        }
    
        public visitRuleSet(node:RuleSet):boolean {
            return true;
        }
    
        public visitSelector(node:Selector):boolean {
            return true;
        }
    
        public visitSimpleSelector(node:SimpleSelector):boolean {
            return true;
        }
    
        public visitDeclaration(node:Declaration):boolean {
            return true;
        }
    
        public visitFunction(node:Function):boolean {
            return true;
        }
    
        public visitFunctionDeclaration(node:FunctionDeclaration):boolean {
            return true;
        }
    
        public visitInvocation(node:Invocation):boolean {
            return true;
        }
    
        public visitTerm(node:Term):boolean {
            return true;
        }
    
        public visitImport(node:Import):boolean {
            return true;
        }
    
        public visitNamespace(node:Namespace):boolean {
            return true;
        }
    
        public visitExpression(node:Expression):boolean {
            return true;
        }
    
        public visitNumericValue(node:NumericValue):boolean {
            return true;
        }
    
        public visitPage(node:Page):boolean {
            return true;
        }
    
        public visitPageBoxMarginBox(node:PageBoxMarginBox):boolean {
            return true;
        }
    
        public visitNodelist(node:Nodelist):boolean {
            return true;
        }
    
        public visitVariableDeclaration(node:VariableDeclaration):boolean {
            return true;
        }
    
        public visitVariable(node:Variable):boolean {
            return true;
        }
    
        public visitMixinDeclaration(node:MixinDeclaration):boolean {
            return true;
        }
    
        public visitMixinReference(node:MixinReference):boolean {
            return true;
        }
    
        public visitUnknownNode(node:Node):boolean {
            return true;
        }
    }
    */
    var ParseErrorCollector = (function () {
        function ParseErrorCollector() {
            this.entries = [];
        }
        ParseErrorCollector.entries = function (node) {
            var visitor = new ParseErrorCollector();
            node.accept(visitor);
            return visitor.entries;
        };
        ParseErrorCollector.prototype.visitNode = function (node) {
            if (node.isErroneous()) {
                node.collectIssues(this.entries);
            }
            return true;
        };
        return ParseErrorCollector;
    }());
    exports.ParseErrorCollector = ParseErrorCollector;
});
//# sourceMappingURL=cssNodes.js.map