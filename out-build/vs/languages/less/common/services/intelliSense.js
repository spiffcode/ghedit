var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/languages/css/common/services/intelliSense', 'vs/nls!vs/languages/less/common/services/intelliSense'], function (require, exports, cssIntellisense, nls) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var LESSIntellisense = (function (_super) {
        __extends(LESSIntellisense, _super);
        function LESSIntellisense() {
            _super.call(this, '@');
        }
        LESSIntellisense.prototype.createFunctionProposals = function (proposals, result) {
            proposals.forEach(function (p) {
                result.push({
                    label: p.name,
                    typeLabel: p.example,
                    documentationLabel: p.description,
                    codeSnippet: p.name + '({{}})',
                    type: 'function'
                });
            });
            return result;
        };
        LESSIntellisense.prototype.getTermProposals = function (result) {
            this.createFunctionProposals(LESSIntellisense.builtInProposals, result);
            return _super.prototype.getTermProposals.call(this, result);
        };
        LESSIntellisense.prototype.getColorProposals = function (entry, result) {
            this.createFunctionProposals(LESSIntellisense.colorProposals, result);
            return _super.prototype.getColorProposals.call(this, entry, result);
        };
        LESSIntellisense.builtInProposals = [
            {
                'name': 'escape',
                'example': 'escape(@string);',
                'description': nls.localize(0, null)
            },
            {
                'name': 'e',
                'example': 'e(@string);',
                'description': nls.localize(1, null)
            },
            {
                'name': 'replace',
                'example': 'replace(@string, @pattern, @replacement[, @flags]);',
                'description': nls.localize(2, null)
            },
            {
                'name': 'unit',
                'example': 'unit(@dimension, [@unit: \'\']);',
                'description': nls.localize(3, null)
            },
            {
                'name': 'color',
                'example': 'color(@string);',
                'description': nls.localize(4, null)
            },
            {
                'name': 'convert',
                'example': 'convert(@value, unit);',
                'description': nls.localize(5, null)
            },
            {
                'name': 'data-uri',
                'example': 'data-uri([mimetype,] url);',
                'description': nls.localize(6, null)
            },
            {
                'name': 'length',
                'example': 'length(@list);',
                'description': nls.localize(7, null)
            },
            {
                'name': 'extract',
                'example': 'extract(@list, index);',
                'description': nls.localize(8, null)
            },
            {
                'name': 'abs',
                'description': nls.localize(9, null),
                'example': 'abs(number);'
            },
            {
                'name': 'acos',
                'description': nls.localize(10, null),
                'example': 'acos(number);'
            },
            {
                'name': 'asin',
                'description': nls.localize(11, null),
                'example': 'asin(number);'
            },
            {
                'name': 'ceil',
                'example': 'ceil(@number);',
                'description': nls.localize(12, null)
            },
            {
                'name': 'cos',
                'description': nls.localize(13, null),
                'example': 'cos(number);'
            },
            {
                'name': 'floor',
                'description': nls.localize(14, null),
                'example': 'floor(@number);'
            },
            {
                'name': 'percentage',
                'description': nls.localize(15, null),
                'example': 'percentage(@number);'
            },
            {
                'name': 'round',
                'description': nls.localize(16, null),
                'example': 'round(number, [places: 0]);'
            },
            {
                'name': 'sqrt',
                'description': nls.localize(17, null),
                'example': 'sqrt(number);'
            },
            {
                'name': 'sin',
                'description': nls.localize(18, null),
                'example': 'sin(number);'
            },
            {
                'name': 'tan',
                'description': nls.localize(19, null),
                'example': 'tan(number);'
            },
            {
                'name': 'atan',
                'description': nls.localize(20, null),
                'example': 'atan(number);'
            },
            {
                'name': 'pi',
                'description': nls.localize(21, null),
                'example': 'pi();'
            },
            {
                'name': 'pow',
                'description': nls.localize(22, null),
                'example': 'pow(@base, @exponent);'
            },
            {
                'name': 'mod',
                'description': nls.localize(23, null),
                'example': 'mod(number, number);'
            },
            {
                'name': 'min',
                'description': nls.localize(24, null),
                'example': 'min(@x, @y);'
            },
            {
                'name': 'max',
                'description': nls.localize(25, null),
                'example': 'max(@x, @y);'
            }
        ];
        LESSIntellisense.colorProposals = [
            {
                'name': 'argb',
                'example': 'argb(@color);',
                'description': nls.localize(26, null)
            },
            {
                'name': 'hsl',
                'example': 'hsl(@hue, @saturation, @lightness);',
                'description': nls.localize(27, null)
            },
            {
                'name': 'hsla',
                'example': 'hsla(@hue, @saturation, @lightness, @alpha);',
                'description': nls.localize(28, null)
            },
            {
                'name': 'hsv',
                'example': 'hsv(@hue, @saturation, @value);',
                'description': nls.localize(29, null)
            },
            {
                'name': 'hsva',
                'example': 'hsva(@hue, @saturation, @value, @alpha);',
                'description': nls.localize(30, null)
            },
            {
                'name': 'hue',
                'example': 'hue(@color);',
                'description': nls.localize(31, null)
            },
            {
                'name': 'saturation',
                'example': 'saturation(@color);',
                'description': nls.localize(32, null)
            },
            {
                'name': 'lightness',
                'example': 'lightness(@color);',
                'description': nls.localize(33, null)
            },
            {
                'name': 'hsvhue',
                'example': 'hsvhue(@color);',
                'description': nls.localize(34, null)
            },
            {
                'name': 'hsvsaturation',
                'example': 'hsvsaturation(@color);',
                'description': nls.localize(35, null)
            },
            {
                'name': 'hsvvalue',
                'example': 'hsvvalue(@color);',
                'description': nls.localize(36, null)
            },
            {
                'name': 'red',
                'example': 'red(@color);',
                'description': nls.localize(37, null)
            },
            {
                'name': 'green',
                'example': 'green(@color);',
                'description': nls.localize(38, null)
            },
            {
                'name': 'blue',
                'example': 'blue(@color);',
                'description': nls.localize(39, null)
            },
            {
                'name': 'alpha',
                'example': 'alpha(@color);',
                'description': nls.localize(40, null)
            },
            {
                'name': 'luma',
                'example': 'luma(@color);',
                'description': nls.localize(41, null)
            },
            {
                'name': 'saturate',
                'example': 'saturate(@color, 10%);',
                'description': nls.localize(42, null)
            },
            {
                'name': 'desaturate',
                'example': 'desaturate(@color, 10%);',
                'description': nls.localize(43, null)
            },
            {
                'name': 'lighten',
                'example': 'lighten(@color, 10%);',
                'description': nls.localize(44, null)
            },
            {
                'name': 'darken',
                'example': 'darken(@color, 10%);',
                'description': nls.localize(45, null)
            },
            {
                'name': 'fadein',
                'example': 'fadein(@color, 10%);',
                'description': nls.localize(46, null)
            },
            {
                'name': 'fadeout',
                'example': 'fadeout(@color, 10%);',
                'description': nls.localize(47, null)
            },
            {
                'name': 'fade',
                'example': 'fade(@color, 50%);',
                'description': nls.localize(48, null)
            },
            {
                'name': 'spin',
                'example': 'spin(@color, 10);',
                'description': nls.localize(49, null)
            },
            {
                'name': 'mix',
                'example': 'mix(@color1, @color2, [@weight: 50%]);',
                'description': nls.localize(50, null)
            },
            {
                'name': 'greyscale',
                'example': 'greyscale(@color);',
                'description': nls.localize(51, null)
            },
            {
                'name': 'contrast',
                'example': 'contrast(@color1, [@darkcolor: black], [@lightcolor: white], [@threshold: 43%]);',
                'description': nls.localize(52, null)
            },
            {
                'name': 'multiply',
                'example': 'multiply(@color1, @color2);'
            },
            {
                'name': 'screen',
                'example': 'screen(@color1, @color2);'
            },
            {
                'name': 'overlay',
                'example': 'overlay(@color1, @color2);'
            },
            {
                'name': 'softlight',
                'example': 'softlight(@color1, @color2);'
            },
            {
                'name': 'hardlight',
                'example': 'hardlight(@color1, @color2);'
            },
            {
                'name': 'difference',
                'example': 'difference(@color1, @color2);'
            },
            {
                'name': 'exclusion',
                'example': 'exclusion(@color1, @color2);'
            },
            {
                'name': 'average',
                'example': 'average(@color1, @color2);'
            },
            {
                'name': 'negation',
                'example': 'negation(@color1, @color2);'
            }
        ];
        return LESSIntellisense;
    }(cssIntellisense.CSSIntellisense));
    exports.LESSIntellisense = LESSIntellisense;
});
//# sourceMappingURL=intelliSense.js.map