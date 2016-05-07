define(["require", "exports", 'vs/nls!vs/languages/css/common/services/lintRules', 'vs/languages/css/common/level'], function (require, exports, nls, _level) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var Warning = 'warning';
    var Error = 'error';
    var Ignore = 'ignore';
    var Rule = (function () {
        function Rule(id, message, defaultValue) {
            this.id = id;
            this.message = message;
            this.defaultValue = defaultValue;
            // nothing to do
        }
        Rule.prototype.getConfiguration = function () {
            return {
                type: 'string',
                enum: [Ignore, Warning, Error],
                default: this.defaultValue,
                description: this.message
            };
        };
        return Rule;
    }());
    exports.Rule = Rule;
    exports.Rules = {
        AllVendorPrefixes: new Rule('compatibleVendorPrefixes', nls.localize(0, null), Ignore),
        IncludeStandardPropertyWhenUsingVendorPrefix: new Rule('vendorPrefix', nls.localize(1, null), Warning),
        DuplicateDeclarations: new Rule('duplicateProperties', nls.localize(2, null), Ignore),
        EmptyRuleSet: new Rule('emptyRules', nls.localize(3, null), Warning),
        ImportStatemement: new Rule('importStatement', nls.localize(4, null), Ignore),
        NoWidthOrHeightWhenPaddingOrBorder: new Rule('boxModel', nls.localize(5, null), Ignore),
        UniversalSelector: new Rule('universalSelector', nls.localize(6, null), Ignore),
        ZeroWithUnit: new Rule('zeroUnits', nls.localize(7, null), Ignore),
        RequiredPropertiesForFontFace: new Rule('fontFaceProperties', nls.localize(8, null), Warning),
        HexColorLength: new Rule('hexColorLength', nls.localize(9, null), Error),
        ArgsInColorFunction: new Rule('argumentsInColorFunction', nls.localize(10, null), Error),
        UnknownProperty: new Rule('unknownProperties', nls.localize(11, null), Warning),
        IEStarHack: new Rule('ieHack', nls.localize(12, null), Ignore),
        UnknownVendorSpecificProperty: new Rule('unknownVendorSpecificProperties', nls.localize(13, null), Ignore),
        PropertyIgnoredDueToDisplay: new Rule('propertyIgnoredDueToDisplay', nls.localize(14, null), Warning),
        AvoidImportant: new Rule('important', nls.localize(15, null), Ignore),
        AvoidFloat: new Rule('float', nls.localize(16, null), Ignore),
        AvoidIdSelector: new Rule('idSelector', nls.localize(17, null), Ignore),
    };
    function getConfigurationProperties(keyPrefix) {
        var properties = {};
        properties[keyPrefix + '.validate'] = {
            type: 'boolean',
            default: true,
            description: nls.localize(18, null)
        };
        for (var ruleName in exports.Rules) {
            var rule = exports.Rules[ruleName];
            properties[keyPrefix + '.lint.' + rule.id] = rule.getConfiguration();
        }
        return properties;
    }
    exports.getConfigurationProperties = getConfigurationProperties;
    function sanitize(conf) {
        var settings = {};
        for (var ruleName in exports.Rules) {
            var rule = exports.Rules[ruleName];
            var level = _level.toLevel(conf[rule.id]);
            if (level) {
                settings[rule.id] = level;
            }
        }
        return settings;
    }
    exports.sanitize = sanitize;
});
/* old rules
        'duplicate-background-images' : {
            'type': 'string',
            'enum': ['ignore', 'warning', 'error'],
            'default': 'ignore',
            'description': nls.localize('duplicateBackgroundImages', "Every background-image should be unique. Use a common class for e.g. sprites.")
        },
        'gradients' : {
            'type': 'string',
            'enum': ['ignore', 'warning', 'error'],
            'default': 'warning',
            'description': nls.localize('gradients', "When using a vendor-prefixed gradient, make sure to use them all.")
        },
        'outline-none' : {
            'type': 'string',
            'enum': ['ignore', 'warning', 'error'],
            'default': 'warning',
            'description': nls.localize('outlineNone', "Use of outline: none or outline: 0 should be limited to :focus rules.")
        },
        'overqualified-elements' : {
            'type': 'string',
            'enum': ['ignore', 'warning', 'error'],
            'default': 'ignore',
            'description': nls.localize('overqualifiedElements', "Don't use classes or IDs with elements (a.foo or a#foo).")
        },
        'qualified-headings' : {
            'type': 'string',
            'enum': ['ignore', 'warning', 'error'],
            'default': 'ignore',
            'description': nls.localize('qualifiedHeadings', "Headings should not be qualified (namespaced).")
        },
        'regex-selectors' : {
            'type': 'string',
            'enum': ['ignore', 'warning', 'error'],
            'default': 'ignore',
            'description': nls.localize('regexSelectors', "Selectors that look like regular expressions are slow and should be avoided.")
        },
        'shorthand' : {
            'type': 'string',
            'enum': ['ignore', 'warning', 'error'],
            'default': 'ignore',
            'description': nls.localize('shorthand', "Use shorthand properties where possible.")
        },
        'text-indent' : {
            'type': 'string',
            'enum': ['ignore', 'warning', 'error'],
            'default': 'ignore',
            'description': nls.localize('textIndent', "Checks for text indent less than -99px.")
        },
        'unique-headings' : {
            'type': 'string',
            'enum': ['ignore', 'warning', 'error'],
            'default': 'ignore',
            'description': nls.localize('uniqueHeadings', "Headings should be defined only once.")
        },

        'unqualified-attributes' : {
            'type': 'string',
            'enum': ['ignore', 'warning', 'error'],
            'default': 'ignore',
            'description': nls.localize('unqualifiedAttributes', "Unqualified attribute selectors are known to be slow.")
        },
        */
//# sourceMappingURL=lintRules.js.map