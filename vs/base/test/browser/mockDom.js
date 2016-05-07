var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports"], function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var MockEventTarget = (function () {
        function MockEventTarget() {
            this.eventMap = {};
        }
        MockEventTarget.prototype.removeEventListener = function (type, listener, useCapture) {
            if (type in this.eventMap) {
                var a = this.eventMap[type];
                a.splice(a.indexOf(listener), 1);
            }
        };
        MockEventTarget.prototype.addEventListener = function (type, listener, useCapture) {
            if (type in this.eventMap) {
                this.eventMap[type].push(listener);
            }
            else {
                this.eventMap[type] = [listener];
            }
        };
        MockEventTarget.prototype.dispatchEvent = function (evt) {
            var listeners = this.eventMap[evt.type];
            if (listeners) {
                listeners.forEach(function (listener) {
                    listener(evt);
                });
            }
            return evt.defaultPrevented;
        };
        return MockEventTarget;
    }());
    exports.MockEventTarget = MockEventTarget;
    var MockNode = (function (_super) {
        __extends(MockNode, _super);
        function MockNode(name) {
            _super.call(this);
            this.ENTITY_REFERENCE_NODE = Node.ENTITY_REFERENCE_NODE;
            this.ATTRIBUTE_NODE = Node.ATTRIBUTE_NODE;
            this.DOCUMENT_FRAGMENT_NODE = Node.DOCUMENT_FRAGMENT_NODE;
            this.TEXT_NODE = Node.TEXT_NODE;
            this.ELEMENT_NODE = Node.ELEMENT_NODE;
            this.COMMENT_NODE = Node.COMMENT_NODE;
            this.DOCUMENT_POSITION_DISCONNECTED = Node.DOCUMENT_POSITION_DISCONNECTED;
            this.DOCUMENT_POSITION_CONTAINED_BY = Node.DOCUMENT_POSITION_CONTAINED_BY;
            this.DOCUMENT_POSITION_CONTAINS = Node.DOCUMENT_POSITION_CONTAINS;
            this.DOCUMENT_TYPE_NODE = Node.DOCUMENT_TYPE_NODE;
            this.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
            this.DOCUMENT_NODE = Node.DOCUMENT_NODE;
            this.ENTITY_NODE = Node.ENTITY_NODE;
            this.PROCESSING_INSTRUCTION_NODE = Node.PROCESSING_INSTRUCTION_NODE;
            this.CDATA_SECTION_NODE = Node.CDATA_SECTION_NODE;
            this.NOTATION_NODE = Node.NOTATION_NODE;
            this.DOCUMENT_POSITION_FOLLOWING = Node.DOCUMENT_POSITION_FOLLOWING;
            this.DOCUMENT_POSITION_PRECEDING = Node.DOCUMENT_POSITION_PRECEDING;
            this.nodeName = name;
            this._childNodes = [];
            this._attributes = [];
        }
        Object.defineProperty(MockNode.prototype, "attributes", {
            get: function () {
                return this._attributes;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MockNode.prototype, "lastChild", {
            get: function () {
                return this._childNodes[this._childNodes.length - 1];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MockNode.prototype, "firstChild", {
            get: function () {
                return this._childNodes[0];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MockNode.prototype, "childNodes", {
            get: function () {
                var a = this._childNodes;
                if (!a.item) {
                    a.item = (function (index) {
                        return this[index];
                    }).bind(a);
                }
                return a;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MockNode.prototype, "textContent", {
            get: function () {
                var _this = this;
                return this._childNodes.filter(function (node) {
                    return node.nodeType === _this.TEXT_NODE;
                }).map(function (node) {
                    return node.wholeText;
                }).join('');
            },
            set: function (value) {
                this._childNodes = [];
                this.appendChild(this.ownerDocument.createTextNode(value));
            },
            enumerable: true,
            configurable: true
        });
        MockNode.prototype.removeChild = function (oldChild) {
            var i = this._childNodes.indexOf(oldChild);
            if (i >= 0) {
                var removed = this._childNodes.splice(i, 1);
                return removed[0];
            }
            return null;
        };
        MockNode.prototype.contains = function (node) {
            return this._childNodes.indexOf(node) !== -1;
        };
        MockNode.prototype.appendChild = function (newChild) {
            this._childNodes.push(newChild);
            return newChild;
        };
        MockNode.prototype.isSupported = function (feature, version) {
            throw new Error('Not implemented!');
        };
        MockNode.prototype.isEqualNode = function (arg) {
            throw new Error('Not implemented!');
        };
        MockNode.prototype.lookupPrefix = function (namespaceURI) {
            throw new Error('Not implemented!');
        };
        MockNode.prototype.isDefaultNamespace = function (namespaceURI) {
            throw new Error('Not implemented!');
        };
        MockNode.prototype.compareDocumentPosition = function (other) {
            throw new Error('Not implemented!');
        };
        MockNode.prototype.normalize = function () {
            throw new Error('Not implemented!');
        };
        MockNode.prototype.isSameNode = function (other) {
            return this === other;
        };
        MockNode.prototype.hasAttributes = function () {
            return this.attributes.length > 0;
        };
        MockNode.prototype.lookupNamespaceURI = function (prefix) {
            throw new Error('Not implemented!');
        };
        MockNode.prototype.cloneNode = function (deep) {
            throw new Error('Not implemented!');
        };
        MockNode.prototype.hasChildNodes = function () {
            return this.childNodes.length > 0;
        };
        MockNode.prototype.replaceChild = function (newChild, oldChild) {
            throw new Error('Not implemented!');
        };
        MockNode.prototype.insertBefore = function (newChild, refChild) {
            throw new Error('Not implemented!');
        };
        return MockNode;
    }(MockEventTarget));
    exports.MockNode = MockNode;
    var MockAttribute = (function (_super) {
        __extends(MockAttribute, _super);
        function MockAttribute(name) {
            _super.call(this, name);
            this.name = name;
            this.expando = false;
        }
        Object.defineProperty(MockAttribute.prototype, "specified", {
            get: function () {
                return !!this.value;
            },
            enumerable: true,
            configurable: true
        });
        return MockAttribute;
    }(MockNode));
    exports.MockAttribute = MockAttribute;
    var MockElement = (function (_super) {
        __extends(MockElement, _super);
        function MockElement(tagName) {
            _super.call(this, tagName);
            this.tagName = tagName;
        }
        MockElement.prototype.getAttribute = function (name) {
            var filter = this._attributes.filter(function (attr) {
                return attr.name === name;
            });
            return filter.length ? filter[0].value : '';
        };
        Object.defineProperty(MockElement.prototype, "innerHTML", {
            get: function () {
                throw new Error('Not implemented!');
            },
            set: function (value) {
                throw new Error('Not implemented!');
            },
            enumerable: true,
            configurable: true
        });
        MockElement.prototype.getElementsByTagNameNS = function (namespaceURI, localName) {
            throw new Error('Not implemented!');
        };
        MockElement.prototype.getElementsByClassName = function (classNames) {
            throw new Error('Not implemented!');
        };
        MockElement.prototype.hasAttributeNS = function (namespaceURI, localName) {
            throw new Error('Not implemented!');
        };
        MockElement.prototype.getBoundingClientRect = function () {
            throw new Error('Not implemented!');
        };
        MockElement.prototype.getAttributeNS = function (namespaceURI, localName) {
            throw new Error('Not implemented!');
        };
        MockElement.prototype.getAttributeNodeNS = function (namespaceURI, localName) {
            throw new Error('Not implemented!');
        };
        MockElement.prototype.setAttributeNodeNS = function (newAttr) {
            throw new Error('Not implemented!');
        };
        MockElement.prototype.hasAttribute = function (name) {
            var filter = this._attributes.filter(function (attr) {
                return attr.name === name;
            });
            return filter.length > 0;
        };
        MockElement.prototype.removeAttribute = function (name) {
            this._attributes = this._attributes.filter(function (attr) {
                return attr.name !== name;
            });
        };
        MockElement.prototype.setAttributeNS = function (namespaceURI, qualifiedName, value) {
            throw new Error('Not implemented!');
        };
        MockElement.prototype.getAttributeNode = function (name) {
            throw new Error('Not implemented!');
        };
        MockElement.prototype.getElementsByTagName = function (name) {
            throw new Error('Not implemented!');
        };
        MockElement.prototype.setAttributeNode = function (newAttr) {
            throw new Error('Not implemented!');
        };
        MockElement.prototype.getClientRects = function () {
            throw new Error('Not implemented!');
        };
        MockElement.prototype.removeAttributeNode = function (oldAttr) {
            throw new Error('Not implemented!');
        };
        MockElement.prototype.setAttribute = function (name, value) {
            if (this.hasAttribute(name)) {
                this.removeAttribute(name);
            }
            var attr = this.ownerDocument.createAttribute(name);
            attr.ownerElement = this;
            attr.value = value;
            this._attributes.push(attr);
        };
        MockElement.prototype.removeAttributeNS = function (namespaceURI, localName) {
            throw new Error('Not implemented!');
        };
        MockElement.prototype.matches = function (selector) {
            throw new Error('Not implemented!');
        };
        // interface NodeSelector
        MockElement.prototype.querySelectorAll = function (selectors) {
            throw new Error('Not implemented!');
        };
        MockElement.prototype.querySelector = function (selectors) {
            throw new Error('Not implemented!');
        };
        Object.defineProperty(MockElement.prototype, "childElementCount", {
            // interface ElementTraversal
            get: function () {
                var _this = this;
                return this._childNodes.filter(function (node) {
                    return node.nodeType === _this.ELEMENT_NODE;
                }).length;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MockElement.prototype, "lastElementChild", {
            get: function () {
                var _this = this;
                var a = this._childNodes.filter(function (node) {
                    return node.nodeType === _this.ELEMENT_NODE;
                });
                return a[a.length - 1];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MockElement.prototype, "firstElementChild", {
            get: function () {
                var _this = this;
                var a = this._childNodes.filter(function (node) {
                    return node.nodeType === _this.ELEMENT_NODE;
                });
                return a[0];
            },
            enumerable: true,
            configurable: true
        });
        // interface MSElementExtensions
        MockElement.prototype.msMatchesSelector = function (selectors) {
            throw new Error('Not implemented!');
        };
        MockElement.prototype.fireEvent = function (eventName, eventObj) {
            throw new Error('Not implemented!');
        };
        // other interface msElementExtensions
        MockElement.prototype.msZoomTo = function (args) { };
        MockElement.prototype.msRequestFullscreen = function () { };
        MockElement.prototype.msGetUntransformedBounds = function () {
            throw new Error('Not implemented!');
        };
        MockElement.prototype.requestFullscreen = function () { throw new Error('Not implemented!'); };
        MockElement.prototype.requestPointerLock = function () { throw new Error('Not implemented!'); };
        MockElement.prototype.webkitMatchesSelector = function (selectors) { throw new Error('Not implemented!'); };
        MockElement.prototype.webkitRequestFullScreen = function () { throw new Error('Not implemented!'); };
        MockElement.prototype.webkitRequestFullscreen = function () { throw new Error('Not implemented!'); };
        MockElement.prototype.remove = function () { throw new Error('Not implemented!'); };
        MockElement.prototype.msGetRegionContent = function () {
            throw new Error('Not implemented!');
        };
        MockElement.prototype.msReleasePointerCapture = function (pointerId) {
            throw new Error('Not implemented!');
        };
        MockElement.prototype.msSetPointerCapture = function (pointerId) {
            throw new Error('Not implemented!');
        };
        return MockElement;
    }(MockNode));
    exports.MockElement = MockElement;
    var MockCharacterData = (function (_super) {
        __extends(MockCharacterData, _super);
        function MockCharacterData(text) {
            _super.call(this, text);
            this.nodeType = this.TEXT_NODE;
            this.length = text.length;
            this.data = text;
        }
        MockCharacterData.prototype.deleteData = function (offset, count) {
            throw new Error('Not implemented!');
        };
        MockCharacterData.prototype.replaceData = function (offset, count, arg) {
            throw new Error('Not implemented!');
        };
        MockCharacterData.prototype.appendData = function (arg) {
            throw new Error('Not implemented!');
        };
        MockCharacterData.prototype.insertData = function (offset, arg) {
            throw new Error('Not implemented!');
        };
        MockCharacterData.prototype.substringData = function (offset, count) {
            throw new Error('Not implemented!');
        };
        MockCharacterData.prototype.remove = function () { throw new Error('Not implemented!'); };
        return MockCharacterData;
    }(MockNode));
    exports.MockCharacterData = MockCharacterData;
    var MockText = (function (_super) {
        __extends(MockText, _super);
        function MockText(text) {
            _super.call(this, text);
            this.wholeText = text;
        }
        MockText.prototype.splitText = function (offset) {
            throw new Error('Not implemented!');
        };
        MockText.prototype.replaceWholeText = function (content) {
            throw new Error('Not implemented!');
        };
        MockText.prototype.swapNode = function (otherNode) {
            throw new Error('Not implemented!');
        };
        MockText.prototype.removeNode = function (deep) {
            throw new Error('Not implemented!');
        };
        MockText.prototype.replaceNode = function (replacement) {
            throw new Error('Not implemented!');
        };
        return MockText;
    }(MockCharacterData));
    exports.MockText = MockText;
    var MockHTMLElement = (function (_super) {
        __extends(MockHTMLElement, _super);
        function MockHTMLElement(tagName) {
            _super.call(this, tagName);
            this.style = {};
            this.nodeType = this.ELEMENT_NODE;
        }
        Object.defineProperty(MockHTMLElement.prototype, "className", {
            get: function () {
                return this.getAttribute('class');
            },
            set: function (value) {
                this.setAttribute('class', value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MockHTMLElement.prototype, "id", {
            get: function () {
                return this.getAttribute('id');
            },
            set: function (value) {
                this.setAttribute('id', value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MockHTMLElement.prototype, "children", {
            get: function () {
                var _this = this;
                var a = this._childNodes.filter(function (node) {
                    return node.nodeType === _this.ELEMENT_NODE;
                });
                if (!a.item) {
                    a.item = (function (index) {
                        return this[index];
                    }).bind(a);
                }
                return a;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MockHTMLElement.prototype, "outerHTML", {
            get: function () {
                var stringer = new DOMStringer(this);
                return stringer.toString(true);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MockHTMLElement.prototype, "innerHTML", {
            get: function () {
                var stringer = new DOMStringer(this);
                return stringer.toString();
            },
            set: function (value) {
                var _this = this;
                var parser = new DOMParser(this.ownerDocument);
                var nodes = parser.parse(value);
                nodes.forEach(function (node) {
                    _this.appendChild(node);
                });
            },
            enumerable: true,
            configurable: true
        });
        return MockHTMLElement;
    }(MockElement));
    exports.MockHTMLElement = MockHTMLElement;
    var MockDocument = (function (_super) {
        __extends(MockDocument, _super);
        function MockDocument() {
            _super.apply(this, arguments);
        }
        MockDocument.prototype.createElement = function (tagName) {
            var e = new MockHTMLElement(tagName);
            e.ownerDocument = this;
            return e;
        };
        MockDocument.prototype.createTextNode = function (data) {
            var n = new MockText(data);
            n.ownerDocument = this;
            return n;
        };
        MockDocument.prototype.createAttribute = function (name) {
            var a = new MockAttribute(name);
            a.ownerDocument = this;
            return a;
        };
        return MockDocument;
    }(MockEventTarget));
    exports.MockDocument = MockDocument;
    var MockWindow /*implements Window*/ = (function () {
        function MockWindow /*implements Window*/() {
        }
        return MockWindow /*implements Window*/;
    }());
    exports.MockWindow /*implements Window*/ = MockWindow /*implements Window*/;
    var ErrorState = (function () {
        function ErrorState(message) {
            this.name = 'error';
            this.message = message;
        }
        ErrorState.prototype.consumeCharacter = function (stream) {
            return this;
        };
        ErrorState.prototype.onTransition = function (parser, nextState) {
        };
        return ErrorState;
    }());
    var TextParser = (function () {
        function TextParser() {
            this.name = 'text';
            this.textContent = '';
        }
        TextParser.prototype.consumeCharacter = function (stream) {
            var char = stream.next();
            switch (char) {
                case '<':
                    return new TagParser();
                case '>':
                    return new ErrorState('Unexpected >');
                default:
                    this.textContent += char;
                    return this;
            }
        };
        TextParser.prototype.onTransition = function (parser, nextState) {
            if (this.textContent) {
                var node = parser.document.createTextNode(this.textContent);
                if (parser.currentNode) {
                    parser.currentNode.appendChild(node);
                }
                else {
                    parser.root.push(node);
                }
            }
        };
        return TextParser;
    }());
    var TagParser = (function () {
        function TagParser() {
            this.name = 'tag';
            this.tagName = '';
            this.isClosing = false;
            this.attributes = {};
        }
        TagParser.prototype.consumeCharacter = function (stream) {
            var char = stream.next();
            switch (char) {
                case '/':
                    this.isClosing = true;
                    return this;
                case '>':
                    if (this.tagName) {
                        return new TextParser();
                    }
                    else {
                        return new ErrorState('No tag name specified');
                    }
                case ' ':
                    if (this.tagName) {
                        if (this.isClosing) {
                            return new ErrorState('Closing tags cannot have attributes');
                        }
                        return new AttributeParser(this);
                    }
                    else {
                        return new ErrorState('Tag name must be first.');
                    }
                default:
                    this.tagName += char;
                    return this;
            }
        };
        TagParser.prototype.onTransition = function (parser, nextState) {
            var _this = this;
            if (this.tagName && nextState !== 'attribute') {
                if (this.isClosing) {
                    if (parser.openElements[parser.openElements.length - 1].tagName !== this.tagName) {
                        throw new Error('Mismatched closing tag:' + this.tagName);
                    }
                    else {
                        parser.openElements.pop();
                        if (parser.openElements.length) {
                            parser.currentNode = parser.openElements[parser.openElements.length - 1];
                        }
                        else {
                            parser.currentNode = null;
                        }
                    }
                }
                else {
                    var node = parser.document.createElement(this.tagName);
                    Object.keys(this.attributes).forEach(function (key) {
                        node.setAttribute(key, _this.attributes[key]);
                    });
                    if (parser.currentNode) {
                        parser.currentNode.appendChild(node);
                    }
                    else {
                        parser.root.push(node);
                    }
                    parser.openElements.push(node);
                    parser.currentNode = node;
                }
            }
        };
        return TagParser;
    }());
    var AttributeParser = (function () {
        function AttributeParser(tag) {
            this.name = 'attribute';
            this.tag = tag;
            this.inValue = false;
            this.attributeName = '';
        }
        AttributeParser.prototype.consumeCharacter = function (stream) {
            var char = stream.next();
            switch (char) {
                case ' ':
                    if (this.inValue) {
                        return this.tag;
                    }
                    else {
                        return this;
                    }
                case '=':
                    this.inValue = true;
                    return new AttributeValueParser(this);
                case '>':
                    stream.back();
                    return this.tag;
                default:
                    if (this.inValue === false) {
                        this.attributeName += char;
                    }
                    return this;
            }
        };
        AttributeParser.prototype.onTransition = function (parser, nextState) {
            if (nextState !== 'attributeValue') {
                this.tag.attributes[this.attributeName] = this.attributeValue;
            }
        };
        return AttributeParser;
    }());
    var AttributeValueParser = (function () {
        function AttributeValueParser(attribute) {
            this.name = 'attributeValue';
            this.attribute = attribute;
            this.value = '';
            this.quote = false;
        }
        AttributeValueParser.prototype.consumeCharacter = function (stream) {
            var char = stream.next();
            switch (char) {
                case '"':
                    if (this.quote === false) {
                        this.quote = true;
                        return this;
                    }
                    else {
                        return this.attribute;
                    }
                default:
                    if (this.quote === false) {
                        return new ErrorState('Expected " character');
                    }
                    else {
                        this.value += char;
                    }
                    return this;
            }
        };
        AttributeValueParser.prototype.onTransition = function (parser, nextState) {
            this.attribute.attributeValue = this.value;
        };
        return AttributeValueParser;
    }());
    var StringStream = (function () {
        function StringStream(text) {
            this.index = 0;
            this.text = text;
        }
        StringStream.prototype.more = function () {
            return this.index < this.text.length;
        };
        StringStream.prototype.next = function () {
            if (this.index >= this.text.length) {
                throw new Error('Past end of string!');
            }
            return this.text[this.index++];
        };
        StringStream.prototype.back = function () {
            this.index--;
        };
        return StringStream;
    }());
    var DOMParser = (function () {
        function DOMParser(document) {
            this.document = document;
            this.root = [];
            this.openElements = [];
            this.currentNode = null;
            this.activeState = new TextParser();
        }
        DOMParser.prototype.parse = function (text) {
            var stream = new StringStream(text);
            while (stream.more()) {
                var nextState = this.activeState.consumeCharacter(stream);
                if (nextState !== this.activeState) {
                    this.activeState.onTransition(this, nextState.name);
                    this.activeState = nextState;
                }
            }
            if (this.activeState.name === 'error') {
                throw new Error(this.activeState.message);
            }
            if (this.openElements.length !== 0) {
                throw new Error('Elements not closed: ' + this.openElements.map(function (element) {
                    return element.tagName;
                }).join());
            }
            return this.root;
        };
        return DOMParser;
    }());
    var DOMStringer = (function () {
        function DOMStringer(root) {
            this.root = root;
        }
        DOMStringer.prototype.print = function (node) {
            var result = '';
            switch (node.nodeType) {
                case node.ELEMENT_NODE:
                    result += this.printElement(node);
                    break;
                case node.TEXT_NODE:
                    result += this.printText(node);
                    break;
            }
            return result;
        };
        DOMStringer.prototype.printChildren = function (node) {
            var result = '';
            if (node.hasChildNodes()) {
                for (var i = 0; i < node.childNodes.length; i++) {
                    result += this.print(node.childNodes.item(i));
                }
            }
            return result;
        };
        DOMStringer.prototype.printElement = function (element) {
            var result = ['<'];
            result.push(element.tagName);
            if (element.hasAttributes()) {
                var attributes = element.attributes;
                result.push(attributes.reduce(function (prev, current) {
                    var attr = [prev, current.name];
                    if (current.value) {
                        attr.push('="', current.value, '"');
                    }
                    return attr.join('');
                }, ' '));
            }
            result.push('>');
            result.push(this.printChildren(element));
            result.push('</');
            result.push(element.tagName);
            result.push('>');
            return result.join('');
        };
        DOMStringer.prototype.printText = function (text) {
            return text.wholeText;
        };
        DOMStringer.prototype.toString = function (includeRoot) {
            if (includeRoot) {
                return this.print(this.root);
            }
            else {
                return this.printChildren(this.root);
            }
        };
        return DOMStringer;
    }());
});
//# sourceMappingURL=mockDom.js.map