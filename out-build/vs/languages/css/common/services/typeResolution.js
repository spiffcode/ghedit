define(["require", "exports", 'vs/languages/css/common/parser/cssNodes', 'vs/languages/css/common/services/languageFacts'], function (require, exports, nodes, languageFacts) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    (function (Type) {
        Type[Type["Url"] = 0] = "Url";
        Type[Type["Percentage"] = 1] = "Percentage";
        Type[Type["Length"] = 2] = "Length";
        Type[Type["Number"] = 3] = "Number";
        Type[Type["Time"] = 4] = "Time";
        Type[Type["Angle"] = 5] = "Angle";
        Type[Type["Color"] = 6] = "Color";
        Type[Type["Identifier"] = 7] = "Identifier";
        Type[Type["Enum"] = 8] = "Enum";
        Type[Type["Unknown"] = 9] = "Unknown";
    })(exports.Type || (exports.Type = {}));
    var Type = exports.Type;
    var SimpleType = (function () {
        function SimpleType(type) {
            this.type = type;
            // empty
        }
        SimpleType.prototype.isSimpleType = function () {
            return true;
        };
        SimpleType.Color = new SimpleType(Type.Color);
        SimpleType.Identifier = new SimpleType(Type.Identifier);
        SimpleType.Url = new SimpleType(Type.Url);
        SimpleType.Unknown = new SimpleType(Type.Unknown);
        return SimpleType;
    }());
    exports.SimpleType = SimpleType;
    var MultiType = (function () {
        function MultiType(types) {
            this.types = types;
            // empty
        }
        MultiType.prototype.isSimpleType = function () {
            return false;
        };
        return MultiType;
    }());
    exports.MultiType = MultiType;
    function typeAtPosition(service, resource, offset) {
        return null;
    }
    exports.typeAtPosition = typeAtPosition;
    function typeFromNode(node) {
        if (!node) {
            return SimpleType.Unknown;
        }
        switch (node.type) {
            case nodes.NodeType.Expression: return typeFromExpression(node);
            case nodes.NodeType.BinaryExpression: return typeFromBinaryExpression(node);
            case nodes.NodeType.Term: return typeFromTerm(node);
            case nodes.NodeType.Function: return typeFromFunction(node);
            case nodes.NodeType.NumericValue: return typeFromNumeric(node);
            case nodes.NodeType.HexColorValue: return SimpleType.Color;
            case nodes.NodeType.Identifier: return typeFromLiteral(node);
            case nodes.NodeType.FunctionArgument: return typeFromFunctionArgument(node);
        }
        return SimpleType.Unknown;
    }
    exports.typeFromNode = typeFromNode;
    function typeFromExpression(node) {
        var types = node.getChildren().map(function (node) {
            return typeFromNode(node);
        });
        if (types.length === 0) {
            return SimpleType.Unknown;
        }
        else if (types.length === 1) {
            return types[0];
        }
        else {
            return new MultiType(types);
        }
    }
    function typeFromBinaryExpression(node) {
        if (node.getRight()) {
            return new MultiType([typeFromNode(node.getLeft()), typeFromNode(node.getRight())]);
        }
        else {
            return typeFromNode(node.getLeft());
        }
    }
    function typeFromTerm(node) {
        if (!node.getExpression()) {
            return SimpleType.Unknown;
        }
        else {
            return typeFromNode(node.getExpression());
        }
    }
    function typeFromFunctionArgument(node) {
        if (!node.getValue()) {
            return SimpleType.Unknown;
        }
        else {
            return typeFromNode(node.getValue());
        }
    }
    function typeFromFunction(node) {
        switch (node.getName()) {
            case 'rgb':
            case 'rgba':
            case 'hsl':
            case 'hsla':
                return SimpleType.Color;
            case 'url':
                return SimpleType.Url;
        }
        var types = node.getArguments().getChildren().map(function (node) {
            return typeFromNode(node);
        });
        if (types.length === 0) {
            return SimpleType.Unknown;
        }
        else if (types.length === 1) {
            return types[0];
        }
        else {
            return new MultiType(types);
        }
    }
    function typeFromNumeric(node) {
        return new SimpleType((function () {
            var value = node.getValue();
            switch (value.unit) {
                case '%':
                    return Type.Percentage;
                case 'px':
                case 'cm':
                case 'mm':
                case 'in':
                case 'pt':
                case 'pc':
                    return Type.Length;
                case 's':
                case 'ms':
                    return Type.Time;
                case 'deg':
                case 'rad':
                case 'grad':
                    return Type.Angle;
            }
            return Type.Number;
        }()));
    }
    function isColor(name) {
        return !!languageFacts.colors[name];
    }
    function typeFromLiteral(node) {
        if (isColor(node.getText())) {
            return SimpleType.Color;
        }
        else {
            return SimpleType.Identifier;
        }
    }
});
//# sourceMappingURL=typeResolution.js.map