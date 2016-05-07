var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/languages/css/common/services/intelliSense', 'vs/nls!vs/languages/sass/common/services/intelliSense'], function (require, exports, cssIntellisense, nls) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var SASSIntellisense = (function (_super) {
        __extends(SASSIntellisense, _super);
        function SASSIntellisense() {
            _super.call(this, '$');
        }
        SASSIntellisense.prototype.createFunctionProposals = function (proposals, result) {
            var replaceFunction = function (match, p1) { return p1 + ': {{' + (SASSIntellisense.variableDefaults[p1] || '') + '}}'; };
            proposals.forEach(function (p) {
                result.push({
                    label: p.func.substr(0, p.func.indexOf('(')),
                    typeLabel: p.func,
                    documentationLabel: p.desc,
                    codeSnippet: p.func.replace(/\[?(\$\w+)\]?/g, replaceFunction),
                    type: 'function'
                });
            });
            return result;
        };
        SASSIntellisense.prototype.getCompletionsForSelector = function (ruleSet, result) {
            this.createFunctionProposals(SASSIntellisense.selectorFuncs, result);
            return _super.prototype.getCompletionsForSelector.call(this, ruleSet, result);
        };
        SASSIntellisense.prototype.getTermProposals = function (result) {
            this.createFunctionProposals(SASSIntellisense.builtInFuncs, result);
            return _super.prototype.getTermProposals.call(this, result);
        };
        SASSIntellisense.prototype.getColorProposals = function (entry, result) {
            this.createFunctionProposals(SASSIntellisense.colorProposals, result);
            return _super.prototype.getColorProposals.call(this, entry, result);
        };
        SASSIntellisense.prototype.getCompletionsForDeclarationProperty = function (result) {
            this.getCompletionsForSelector(null, result);
            return _super.prototype.getCompletionsForDeclarationProperty.call(this, result);
        };
        SASSIntellisense.variableDefaults = {
            '$red': '1',
            '$green': '2',
            '$blue': '3',
            '$alpha': '1.0',
            '$color': '$color',
            '$weight': '0.5',
            '$hue': '0',
            '$saturation': '0%',
            '$lightness': '0%',
            '$degrees': '0',
            '$amount': '0',
            '$string': '""',
            '$substring': '"s"',
            '$number': '0',
            '$limit': '1'
        };
        SASSIntellisense.colorProposals = [
            { func: 'red($color)', desc: nls.localize(0, null) },
            { func: 'green($color)', desc: nls.localize(1, null) },
            { func: 'blue($color)', desc: nls.localize(2, null) },
            { func: 'mix($color, $color, [$weight])', desc: nls.localize(3, null) },
            { func: 'hue($color)', desc: nls.localize(4, null) },
            { func: 'saturation($color)', desc: nls.localize(5, null) },
            { func: 'lightness($color)', desc: nls.localize(6, null) },
            { func: 'adjust-hue($color, $degrees)', desc: nls.localize(7, null) },
            { func: 'lighten($color, $amount)', desc: nls.localize(8, null) },
            { func: 'darken($color, $amount)', desc: nls.localize(9, null) },
            { func: 'saturate($color, $amount)', desc: nls.localize(10, null) },
            { func: 'desaturate($color, $amount)', desc: nls.localize(11, null) },
            { func: 'grayscale($color)', desc: nls.localize(12, null) },
            { func: 'complement($color)', desc: nls.localize(13, null) },
            { func: 'invert($color)', desc: nls.localize(14, null) },
            { func: 'alpha($color)', desc: nls.localize(15, null) },
            { func: 'opacity($color)', desc: 'Gets the alpha component (opacity) of a color.' },
            { func: 'rgba($color, $alpha)', desc: nls.localize(16, null) },
            { func: 'opacify($color, $amount)', desc: nls.localize(17, null) },
            { func: 'fade-in($color, $amount)', desc: nls.localize(18, null) },
            { func: 'transparentize($color, $amount) / fade-out($color, $amount)', desc: nls.localize(19, null) },
            { func: 'adjust-color($color, [$red], [$green], [$blue], [$hue], [$saturation], [$lightness], [$alpha])', desc: nls.localize(20, null) },
            { func: 'scale-color($color, [$red], [$green], [$blue], [$saturation], [$lightness], [$alpha])', desc: nls.localize(21, null) },
            { func: 'change-color($color, [$red], [$green], [$blue], [$hue], [$saturation], [$lightness], [$alpha])', desc: nls.localize(22, null) },
            { func: 'ie-hex-str($color)', desc: nls.localize(23, null) }
        ];
        SASSIntellisense.selectorFuncs = [
            { func: 'selector-nest($selectors…)', desc: nls.localize(24, null) },
            { func: 'selector-append($selectors…)', desc: nls.localize(25, null) },
            { func: 'selector-extend($selector, $extendee, $extender)', desc: nls.localize(26, null) },
            { func: 'selector-replace($selector, $original, $replacement)', desc: nls.localize(27, null) },
            { func: 'selector-unify($selector1, $selector2)', desc: nls.localize(28, null) },
            { func: 'is-superselector($super, $sub)', desc: nls.localize(29, null) },
            { func: 'simple-selectors($selector)', desc: nls.localize(30, null) },
            { func: 'selector-parse($selector)', desc: nls.localize(31, null) }
        ];
        SASSIntellisense.builtInFuncs = [
            { func: 'unquote($string)', desc: nls.localize(32, null) },
            { func: 'quote($string)', desc: nls.localize(33, null) },
            { func: 'str-length($string)', desc: nls.localize(34, null) },
            { func: 'str-insert($string, $insert, $index)', desc: nls.localize(35, null) },
            { func: 'str-index($string, $substring)', desc: nls.localize(36, null) },
            { func: 'str-slice($string, $start-at, [$end-at])', desc: nls.localize(37, null) },
            { func: 'to-upper-case($string)', desc: nls.localize(38, null) },
            { func: 'to-lower-case($string)', desc: nls.localize(39, null) },
            { func: 'percentage($number)', desc: nls.localize(40, null) },
            { func: 'round($number)', desc: nls.localize(41, null) },
            { func: 'ceil($number)', desc: nls.localize(42, null) },
            { func: 'floor($number)', desc: nls.localize(43, null) },
            { func: 'abs($number)', desc: nls.localize(44, null) },
            { func: 'min($numbers)', desc: nls.localize(45, null) },
            { func: 'max($numbers)', desc: nls.localize(46, null) },
            { func: 'random([$limit])', desc: nls.localize(47, null) },
            { func: 'length($list)', desc: nls.localize(48, null) },
            { func: 'nth($list, $n)', desc: nls.localize(49, null) },
            { func: 'set-nth($list, $n, $value)', desc: nls.localize(50, null) },
            { func: 'join($list1, $list2, [$separator])', desc: nls.localize(51, null) },
            { func: 'append($list1, $val, [$separator])', desc: nls.localize(52, null) },
            { func: 'zip($lists)', desc: nls.localize(53, null) },
            { func: 'index($list, $value)', desc: nls.localize(54, null) },
            { func: 'list-separator(#list)', desc: nls.localize(55, null) },
            { func: 'map-get($map, $key)', desc: nls.localize(56, null) },
            { func: 'map-merge($map1, $map2)', desc: nls.localize(57, null) },
            { func: 'map-remove($map, $keys)', desc: nls.localize(58, null) },
            { func: 'map-keys($map)', desc: nls.localize(59, null) },
            { func: 'map-values($map)', desc: nls.localize(60, null) },
            { func: 'map-has-key($map, $key)', desc: nls.localize(61, null) },
            { func: 'keywords($args)', desc: nls.localize(62, null) },
            { func: 'feature-exists($feature)', desc: nls.localize(63, null) },
            { func: 'variable-exists($name)', desc: nls.localize(64, null) },
            { func: 'global-variable-exists($name)', desc: nls.localize(65, null) },
            { func: 'function-exists($name)', desc: nls.localize(66, null) },
            { func: 'mixin-exists($name)', desc: nls.localize(67, null) },
            { func: 'inspect($value)', desc: nls.localize(68, null) },
            { func: 'type-of($value)', desc: nls.localize(69, null) },
            { func: 'unit($number)', desc: nls.localize(70, null) },
            { func: 'unitless($number)', desc: nls.localize(71, null) },
            { func: 'comparable($number1, $number2)', desc: nls.localize(72, null) },
            { func: 'call($name, $args…)', desc: nls.localize(73, null) }
        ];
        return SASSIntellisense;
    }(cssIntellisense.CSSIntellisense));
    exports.SASSIntellisense = SASSIntellisense;
});
//# sourceMappingURL=intelliSense.js.map