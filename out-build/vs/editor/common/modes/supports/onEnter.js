define(["require", "exports", 'vs/base/common/errors', 'vs/base/common/strings', 'vs/editor/common/core/position', 'vs/editor/common/modes', 'vs/editor/common/modes/supports'], function (require, exports, errors_1, strings, position_1, modes_1, supports_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var OnEnterSupport = (function () {
        function OnEnterSupport(modeId, opts) {
            opts = opts || {};
            opts.brackets = opts.brackets || [
                ['(', ')'],
                ['{', '}'],
                ['[', ']']
            ];
            this._modeId = modeId;
            this._brackets = opts.brackets.map(function (bracket) {
                return {
                    open: bracket[0],
                    openRegExp: OnEnterSupport._createOpenBracketRegExp(bracket[0]),
                    close: bracket[1],
                    closeRegExp: OnEnterSupport._createCloseBracketRegExp(bracket[1]),
                };
            });
            this._regExpRules = opts.regExpRules || [];
            this._indentationRules = opts.indentationRules;
        }
        OnEnterSupport.prototype.onEnter = function (model, position) {
            var _this = this;
            var context = model.getLineContext(position.lineNumber);
            return supports_1.handleEvent(context, position.column - 1, function (nestedMode, context, offset) {
                if (_this._modeId === nestedMode.getId()) {
                    return _this._onEnter(model, position);
                }
                else if (nestedMode.richEditSupport && nestedMode.richEditSupport.onEnter) {
                    return nestedMode.richEditSupport.onEnter.onEnter(model, position);
                }
                else {
                    return null;
                }
            });
        };
        OnEnterSupport.prototype._onEnter = function (model, position) {
            var lineText = model.getLineContent(position.lineNumber);
            var beforeEnterText = lineText.substr(0, position.column - 1);
            var afterEnterText = lineText.substr(position.column - 1);
            var oneLineAboveText = position.lineNumber === 1 ? '' : model.getLineContent(position.lineNumber - 1);
            return this._actualOnEnter(oneLineAboveText, beforeEnterText, afterEnterText);
        };
        OnEnterSupport.prototype._actualOnEnter = function (oneLineAboveText, beforeEnterText, afterEnterText) {
            // (1): `regExpRules`
            for (var i = 0, len = this._regExpRules.length; i < len; i++) {
                var rule = this._regExpRules[i];
                if (rule.beforeText.test(beforeEnterText)) {
                    if (rule.afterText) {
                        if (rule.afterText.test(afterEnterText)) {
                            return rule.action;
                        }
                    }
                    else {
                        return rule.action;
                    }
                }
            }
            // (2): Special indent-outdent
            if (beforeEnterText.length > 0 && afterEnterText.length > 0) {
                for (var i = 0, len = this._brackets.length; i < len; i++) {
                    var bracket = this._brackets[i];
                    if (bracket.openRegExp.test(beforeEnterText) && bracket.closeRegExp.test(afterEnterText)) {
                        return OnEnterSupport._INDENT_OUTDENT;
                    }
                }
            }
            // (3): Indentation Support
            if (this._indentationRules) {
                if (this._indentationRules.increaseIndentPattern && this._indentationRules.increaseIndentPattern.test(beforeEnterText)) {
                    return OnEnterSupport._INDENT;
                }
                if (this._indentationRules.indentNextLinePattern && this._indentationRules.indentNextLinePattern.test(beforeEnterText)) {
                    return OnEnterSupport._INDENT;
                }
                if (/^\s/.test(beforeEnterText)) {
                    // No reason to run regular expressions if there is nothing to outdent from
                    if (this._indentationRules.decreaseIndentPattern && this._indentationRules.decreaseIndentPattern.test(afterEnterText)) {
                        return OnEnterSupport._OUTDENT;
                    }
                    if (this._indentationRules.indentNextLinePattern && this._indentationRules.indentNextLinePattern.test(oneLineAboveText)) {
                        return OnEnterSupport._OUTDENT;
                    }
                }
            }
            // (4): Open bracket based logic
            if (beforeEnterText.length > 0) {
                for (var i = 0, len = this._brackets.length; i < len; i++) {
                    var bracket = this._brackets[i];
                    if (bracket.openRegExp.test(beforeEnterText)) {
                        return OnEnterSupport._INDENT;
                    }
                }
            }
            return null;
        };
        OnEnterSupport._createOpenBracketRegExp = function (bracket) {
            var str = strings.escapeRegExpCharacters(bracket);
            if (!/\B/.test(str.charAt(0))) {
                str = '\\b' + str;
            }
            str += '\\s*$';
            return OnEnterSupport._safeRegExp(str);
        };
        OnEnterSupport._createCloseBracketRegExp = function (bracket) {
            var str = strings.escapeRegExpCharacters(bracket);
            if (!/\B/.test(str.charAt(str.length - 1))) {
                str = str + '\\b';
            }
            str = '^\\s*' + str;
            return OnEnterSupport._safeRegExp(str);
        };
        OnEnterSupport._safeRegExp = function (def) {
            try {
                return new RegExp(def);
            }
            catch (err) {
                errors_1.onUnexpectedError(err);
                return null;
            }
        };
        OnEnterSupport._INDENT = { indentAction: modes_1.IndentAction.Indent };
        OnEnterSupport._INDENT_OUTDENT = { indentAction: modes_1.IndentAction.IndentOutdent };
        OnEnterSupport._OUTDENT = { indentAction: modes_1.IndentAction.Outdent };
        return OnEnterSupport;
    }());
    exports.OnEnterSupport = OnEnterSupport;
    function getRawEnterActionAtPosition(model, lineNumber, column) {
        var result;
        var richEditSupport = model.getMode().richEditSupport;
        if (richEditSupport && richEditSupport.onEnter) {
            try {
                result = richEditSupport.onEnter.onEnter(model, new position_1.Position(lineNumber, column));
            }
            catch (e) {
                errors_1.onUnexpectedError(e);
            }
        }
        return result;
    }
    exports.getRawEnterActionAtPosition = getRawEnterActionAtPosition;
    function getEnterActionAtPosition(model, lineNumber, column) {
        var lineText = model.getLineContent(lineNumber);
        var indentation = strings.getLeadingWhitespace(lineText);
        if (indentation.length > column - 1) {
            indentation = indentation.substring(0, column - 1);
        }
        var enterAction = getRawEnterActionAtPosition(model, lineNumber, column);
        if (!enterAction) {
            enterAction = {
                indentAction: modes_1.IndentAction.None,
                appendText: '',
            };
        }
        else {
            if (!enterAction.appendText) {
                if ((enterAction.indentAction === modes_1.IndentAction.Indent) ||
                    (enterAction.indentAction === modes_1.IndentAction.IndentOutdent)) {
                    enterAction.appendText = '\t';
                }
                else {
                    enterAction.appendText = '';
                }
            }
        }
        if (enterAction.removeText) {
            indentation = indentation.substring(0, indentation.length - 1);
        }
        return {
            enterAction: enterAction,
            indentation: indentation
        };
    }
    exports.getEnterActionAtPosition = getEnterActionAtPosition;
});
//# sourceMappingURL=onEnter.js.map