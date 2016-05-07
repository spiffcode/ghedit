var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/languages/css/common/parser/cssNodes', 'vs/base/common/strings'], function (require, exports, nodes, strings) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var Element = (function () {
        function Element() {
        }
        Element.prototype.addChild = function (child) {
            if (child instanceof Element) {
                child.parent = this;
            }
            if (!this.children) {
                this.children = [];
            }
            this.children.push(child);
        };
        Element.prototype.findRoot = function () {
            var curr = this;
            while (curr.parent && !(curr.parent instanceof RootElement)) {
                curr = curr.parent;
            }
            return curr;
        };
        Element.prototype.removeChild = function (child) {
            if (this.children) {
                var index = this.children.indexOf(child);
                if (index !== -1) {
                    this.children.splice(index, 1);
                    return true;
                }
            }
            return false;
        };
        Element.prototype.addAttr = function (name, value) {
            if (!this.attributes) {
                this.attributes = {};
            }
            if (this.attributes.hasOwnProperty(name)) {
                this.attributes[name] += ' ' + value;
            }
            else {
                this.attributes[name] = value;
            }
        };
        Element.prototype.clone = function (cloneChildren) {
            if (cloneChildren === void 0) { cloneChildren = true; }
            var elem = new Element();
            elem.name = this.name;
            if (this.attributes) {
                elem.attributes = {};
                for (var key in this.attributes) {
                    elem.addAttr(key, this.attributes[key]);
                }
            }
            if (cloneChildren && this.children) {
                elem.children = [];
                for (var index = 0; index < this.children.length; index++) {
                    elem.addChild(this.children[index].clone());
                }
            }
            return elem;
        };
        Element.prototype.cloneWithParent = function () {
            var clone = this.clone(false);
            if (this.parent && !(this.parent instanceof RootElement)) {
                var parentClone = this.parent.cloneWithParent();
                parentClone.addChild(clone);
            }
            return clone;
        };
        return Element;
    }());
    exports.Element = Element;
    var RootElement = (function (_super) {
        __extends(RootElement, _super);
        function RootElement() {
            _super.apply(this, arguments);
        }
        return RootElement;
    }(Element));
    exports.RootElement = RootElement;
    var LabelElement = (function (_super) {
        __extends(LabelElement, _super);
        function LabelElement(label) {
            _super.call(this);
            this.name = label;
        }
        return LabelElement;
    }(Element));
    exports.LabelElement = LabelElement;
    var HtmlPrinter = (function () {
        function HtmlPrinter(quote) {
            this.quote = quote;
            // empty
        }
        HtmlPrinter.prototype.print = function (element) {
            if (element instanceof RootElement) {
                return this.doPrint(element.children);
            }
            else {
                return this.doPrint([element]);
            }
        };
        HtmlPrinter.prototype.doPrint = function (elements) {
            var root = { children: [] }, parent = root;
            while (elements.length > 0) {
                var element = elements.shift(), content = this.doPrintElement(element);
                parent.children.push(content);
                if (element.children) {
                    elements.push.apply(elements, element.children);
                    parent = content;
                }
            }
            return root.children;
        };
        HtmlPrinter.prototype.doPrintElement = function (element) {
            var _this = this;
            // special case: a simple label
            if (element instanceof LabelElement) {
                return {
                    tagName: 'ul',
                    children: [{
                            tagName: 'li',
                            children: [{
                                    tagName: 'span',
                                    className: 'label',
                                    text: element.name
                                }]
                        }]
                };
            }
            // the real deal
            var children = [{
                    isText: true,
                    text: '<'
                }];
            // element name
            if (element.name) {
                children.push({
                    tagName: 'span',
                    className: 'name',
                    text: element.name
                });
            }
            else {
                children.push({
                    tagName: 'span',
                    text: 'element'
                });
            }
            // attributes
            if (element.attributes) {
                Object.keys(element.attributes).forEach(function (attr) {
                    children.push({
                        isText: true,
                        text: ' '
                    });
                    children.push({
                        tagName: 'span',
                        className: 'key',
                        text: attr
                    });
                    var value = element.attributes[attr];
                    if (value) {
                        children.push({
                            isText: true,
                            text: '='
                        });
                        children.push({
                            tagName: 'span',
                            className: 'value',
                            text: quotes.ensure(value, _this.quote)
                        });
                    }
                });
            }
            children.push({
                isText: true,
                text: '>'
            });
            return {
                tagName: 'ul',
                children: [{
                        tagName: 'li',
                        children: children
                    }]
            };
        };
        return HtmlPrinter;
    }());
    var quotes;
    (function (quotes) {
        function ensure(value, which) {
            return which + remove(value) + which;
        }
        quotes.ensure = ensure;
        function remove(value) {
            value = strings.trim(value, '\'');
            value = strings.trim(value, '"');
            return value;
        }
        quotes.remove = remove;
    })(quotes || (quotes = {}));
    function toElement(node, parentElement) {
        var result = new Element();
        node.getChildren().forEach(function (child) {
            switch (child.type) {
                case nodes.NodeType.SelectorCombinator:
                    if (parentElement) {
                        var segments = child.getText().split('&');
                        if (segments.length === 1) {
                            // should not happen
                            result.name = segments[0];
                            break;
                        }
                        result = parentElement.cloneWithParent();
                        if (segments[0]) {
                            var root = result.findRoot();
                            root.name = segments[0] + root.name;
                        }
                        for (var i = 1; i < segments.length; i++) {
                            if (i > 1) {
                                var clone = parentElement.cloneWithParent();
                                result.addChild(clone.findRoot());
                                result = clone;
                            }
                            result.name += segments[i];
                        }
                    }
                    break;
                case nodes.NodeType.SelectorPlaceholder:
                case nodes.NodeType.ElementNameSelector:
                    var text = child.getText();
                    result.name = text === '*' ? 'element' : text;
                    break;
                case nodes.NodeType.ClassSelector:
                    result.addAttr('class', child.getText().substring(1));
                    break;
                case nodes.NodeType.IdentifierSelector:
                    result.addAttr('id', child.getText().substring(1));
                    break;
                case nodes.NodeType.MixinDeclaration:
                    result.addAttr('class', child.getName());
                    break;
                case nodes.NodeType.PseudoSelector:
                    result.addAttr(child.getText(), strings.empty);
                    break;
                case nodes.NodeType.AttributeSelector:
                    var expr = child.getChildren()[0];
                    if (expr) {
                        if (expr.getRight()) {
                            var value;
                            switch (expr.getOperator().getText()) {
                                case '|=':
                                    // excatly or followed by -words
                                    value = strings.format('{0}-\u2026', quotes.remove(expr.getRight().getText()));
                                    break;
                                case '^=':
                                    // prefix
                                    value = strings.format('{0}\u2026', quotes.remove(expr.getRight().getText()));
                                    break;
                                case '$=':
                                    // suffix
                                    value = strings.format('\u2026{0}', quotes.remove(expr.getRight().getText()));
                                    break;
                                case '~=':
                                    // one of a list of words
                                    value = strings.format(' \u2026 {0} \u2026 ', quotes.remove(expr.getRight().getText()));
                                    break;
                                case '*=':
                                    // substring
                                    value = strings.format('\u2026{0}\u2026', quotes.remove(expr.getRight().getText()));
                                    break;
                                default:
                                    value = quotes.remove(expr.getRight().getText());
                                    break;
                            }
                        }
                        result.addAttr(expr.getLeft().getText(), value);
                    }
                    break;
            }
        });
        return result;
    }
    exports.toElement = toElement;
    function simpleSelectorToHtml(node) {
        var element = toElement(node);
        var body = new HtmlPrinter('"').print(element);
        return {
            tagName: 'span',
            className: 'css-selector-hover',
            children: body
        };
    }
    exports.simpleSelectorToHtml = simpleSelectorToHtml;
    var SelectorElementBuilder = (function () {
        function SelectorElementBuilder(element) {
            this.prev = null;
            this.element = element;
        }
        SelectorElementBuilder.prototype.processSelector = function (selector) {
            var _this = this;
            var parentElement = null;
            if (!(this.element instanceof RootElement)) {
                if (selector.getChildren().some(function (c) { return c.hasChildren() && c.getChild(0).type === nodes.NodeType.SelectorCombinator; })) {
                    var curr = this.element.findRoot();
                    if (curr.parent instanceof RootElement) {
                        parentElement = this.element;
                        this.element = curr.parent;
                        this.element.removeChild(curr);
                        this.prev = null;
                    }
                }
            }
            selector.getChildren().forEach(function (selectorChild) {
                if (selectorChild instanceof nodes.SimpleSelector) {
                    if (_this.prev instanceof nodes.SimpleSelector) {
                        var labelElement = new LabelElement('\u2026');
                        _this.element.addChild(labelElement);
                        _this.element = labelElement;
                    }
                    else if (_this.prev && (_this.prev.matches('+') || _this.prev.matches('~'))) {
                        _this.element = _this.element.parent;
                    }
                    if (_this.prev && _this.prev.matches('~')) {
                        _this.element.addChild(toElement(selectorChild));
                        _this.element.addChild(new LabelElement('\u22EE'));
                    }
                    var thisElement = toElement(selectorChild, parentElement);
                    var root = thisElement.findRoot();
                    _this.element.addChild(root);
                    _this.element = thisElement;
                }
                if (selectorChild instanceof nodes.SimpleSelector ||
                    selectorChild.type === nodes.NodeType.SelectorCombinatorParent ||
                    selectorChild.type === nodes.NodeType.SelectorCombinatorSibling ||
                    selectorChild.type === nodes.NodeType.SelectorCombinatorAllSiblings) {
                    _this.prev = selectorChild;
                }
            });
        };
        return SelectorElementBuilder;
    }());
    function isNewSelectorContext(node) {
        switch (node.type) {
            case nodes.NodeType.MixinDeclaration:
            case nodes.NodeType.Stylesheet:
                return true;
        }
        return false;
    }
    function selectorToElement(node) {
        var root = new RootElement();
        var parentRuleSets = [];
        if (node.getParent() instanceof nodes.RuleSet) {
            var parent = node.getParent().getParent(); // parent of the selector's ruleset
            while (parent && !isNewSelectorContext(parent)) {
                if (parent instanceof nodes.RuleSet) {
                    parentRuleSets.push(parent);
                }
                parent = parent.getParent();
            }
        }
        var builder = new SelectorElementBuilder(root);
        for (var i = parentRuleSets.length - 1; i >= 0; i--) {
            var selector = parentRuleSets[i].getSelectors().getChild(0);
            if (selector) {
                builder.processSelector(selector);
            }
        }
        builder.processSelector(node);
        return root;
    }
    exports.selectorToElement = selectorToElement;
    function selectorToHtml(node) {
        var root = selectorToElement(node);
        var body = new HtmlPrinter('"').print(root);
        return {
            tagName: 'span',
            className: 'css-selector-hover',
            children: body
        };
    }
    exports.selectorToHtml = selectorToHtml;
});
//# sourceMappingURL=selectorPrinting.js.map