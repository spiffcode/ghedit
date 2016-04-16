define(["require", "exports", 'vs/languages/css/common/parser/cssNodes', 'vs/languages/css/common/parser/cssSymbols'], function (require, exports, nodes, _symbols) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function findDeclaration(stylesheet, offset) {
        var symbols = new _symbols.Symbols(stylesheet);
        var node = nodes.getNodeAtOffset(stylesheet, offset);
        if (!node) {
            return null;
        }
        var symbol = symbols.findSymbolFromNode(node);
        if (!symbol) {
            return null;
        }
        return symbol.node;
    }
    exports.findDeclaration = findDeclaration;
    function findOccurrences(stylesheet, offset) {
        var result = [];
        var node = nodes.getNodeAtOffset(stylesheet, offset);
        if (!node || node.type === nodes.NodeType.Stylesheet || node.type === nodes.NodeType.Declarations) {
            return result;
        }
        var symbols = new _symbols.Symbols(stylesheet);
        var symbol = symbols.findSymbolFromNode(node);
        var name = node.getText();
        stylesheet.accept(function (candidate) {
            if (symbol) {
                if (symbols.matchesSymbol(candidate, symbol)) {
                    result.push({
                        kind: getKind(candidate),
                        type: symbol.type,
                        node: candidate
                    });
                    return false;
                }
            }
            else if (node.type === candidate.type && node.length === candidate.length && name === candidate.getText()) {
                // Same node type and data
                result.push({
                    kind: getKind(candidate),
                    node: candidate,
                    type: nodes.ReferenceType.Unknown
                });
            }
            return true;
        });
        return result;
    }
    exports.findOccurrences = findOccurrences;
    function getKind(node) {
        if (node.type === nodes.NodeType.Selector) {
            return 'write';
        }
        if (node.parent) {
            switch (node.parent.type) {
                case nodes.NodeType.FunctionDeclaration:
                case nodes.NodeType.MixinDeclaration:
                case nodes.NodeType.Keyframe:
                case nodes.NodeType.VariableDeclaration:
                case nodes.NodeType.FunctionParameter:
                    return 'write';
            }
        }
        return null;
    }
});
//# sourceMappingURL=occurrences.js.map