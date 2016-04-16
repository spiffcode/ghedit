define(["require", "exports", 'vs/nls!vs/languages/css/common/parser/cssErrors'], function (require, exports, nls) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var CSSIssueType = (function () {
        function CSSIssueType(id, message) {
            this.id = id;
            this.message = message;
        }
        return CSSIssueType;
    }());
    exports.CSSIssueType = CSSIssueType;
    exports.ParseError = {
        NumberExpected: new CSSIssueType('css-numberexpected', nls.localize(0, null)),
        ConditionExpected: new CSSIssueType('css-conditionexpected', nls.localize(1, null)),
        RuleOrSelectorExpected: new CSSIssueType('css-ruleorselectorexpected', nls.localize(2, null)),
        DotExpected: new CSSIssueType('css-dotexpected', nls.localize(3, null)),
        ColonExpected: new CSSIssueType('css-colonexpected', nls.localize(4, null)),
        SemiColonExpected: new CSSIssueType('css-semicolonexpected', nls.localize(5, null)),
        TermExpected: new CSSIssueType('css-termexpected', nls.localize(6, null)),
        ExpressionExpected: new CSSIssueType('css-expressionexpected', nls.localize(7, null)),
        OperatorExpected: new CSSIssueType('css-operatorexpected', nls.localize(8, null)),
        IdentifierExpected: new CSSIssueType('css-identifierexpected', nls.localize(9, null)),
        PercentageExpected: new CSSIssueType('css-percentageexpected', nls.localize(10, null)),
        URIOrStringExpected: new CSSIssueType('css-uriorstringexpected', nls.localize(11, null)),
        URIExpected: new CSSIssueType('css-uriexpected', nls.localize(12, null)),
        VariableNameExpected: new CSSIssueType('css-varnameexpected', nls.localize(13, null)),
        VariableValueExpected: new CSSIssueType('css-varvalueexpected', nls.localize(14, null)),
        PropertyValueExpected: new CSSIssueType('css-propertyvalueexpected', nls.localize(15, null)),
        LeftCurlyExpected: new CSSIssueType('css-lcurlyexpected', nls.localize(16, null)),
        RightCurlyExpected: new CSSIssueType('css-rcurlyexpected', nls.localize(17, null)),
        LeftSquareBracketExpected: new CSSIssueType('css-rbracketexpected', nls.localize(18, null)),
        RightSquareBracketExpected: new CSSIssueType('css-lbracketexpected', nls.localize(19, null)),
        LeftParenthesisExpected: new CSSIssueType('css-lparentexpected', nls.localize(20, null)),
        RightParenthesisExpected: new CSSIssueType('css-rparentexpected', nls.localize(21, null)),
        CommaExpected: new CSSIssueType('css-commaexpected', nls.localize(22, null)),
        PageDirectiveOrDeclarationExpected: new CSSIssueType('css-pagedirordeclexpected', nls.localize(23, null)),
        UnknownAtRule: new CSSIssueType('css-unknownatrule', nls.localize(24, null)),
        UnknownKeyword: new CSSIssueType('css-unknownkeyword', nls.localize(25, null)),
        SelectorExpected: new CSSIssueType('css-selectorexpected', nls.localize(26, null)),
        StringLiteralExpected: new CSSIssueType('css-stringliteralexpected', nls.localize(27, null)),
    };
});
//# sourceMappingURL=cssErrors.js.map