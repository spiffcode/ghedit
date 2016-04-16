define(["require", "exports", 'vs/platform/instantiation/common/instantiation'], function (require, exports, instantiation_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var KbDefinedExpression = (function () {
        function KbDefinedExpression(key) {
            this.key = key;
        }
        KbDefinedExpression.prototype.equals = function (other) {
            if (other instanceof KbDefinedExpression) {
                return (this.key === other.key);
            }
            return false;
        };
        KbDefinedExpression.prototype.evaluate = function (context) {
            return (!!context[this.key]);
        };
        KbDefinedExpression.prototype.normalize = function () {
            return this;
        };
        KbDefinedExpression.prototype.serialize = function () {
            return this.key;
        };
        return KbDefinedExpression;
    }());
    exports.KbDefinedExpression = KbDefinedExpression;
    var KbEqualsExpression = (function () {
        function KbEqualsExpression(key, value) {
            this.key = key;
            this.value = value;
        }
        KbEqualsExpression.prototype.equals = function (other) {
            if (other instanceof KbEqualsExpression) {
                return (this.key === other.key && this.value === other.value);
            }
            return false;
        };
        KbEqualsExpression.prototype.evaluate = function (context) {
            /* tslint:disable:triple-equals */
            // Intentional ==
            return (context[this.key] == this.value);
            /* tslint:enable:triple-equals */
        };
        KbEqualsExpression.prototype.normalize = function () {
            if (typeof this.value === 'boolean') {
                if (this.value) {
                    return new KbDefinedExpression(this.key);
                }
                return new KbNotExpression(this.key);
            }
            return this;
        };
        KbEqualsExpression.prototype.serialize = function () {
            if (typeof this.value === 'boolean') {
                return this.normalize().serialize();
            }
            return this.key + ' == \'' + this.value + '\'';
        };
        return KbEqualsExpression;
    }());
    exports.KbEqualsExpression = KbEqualsExpression;
    var KbNotEqualsExpression = (function () {
        function KbNotEqualsExpression(key, value) {
            this.key = key;
            this.value = value;
        }
        KbNotEqualsExpression.prototype.equals = function (other) {
            if (other instanceof KbNotEqualsExpression) {
                return (this.key === other.key && this.value === other.value);
            }
            return false;
        };
        KbNotEqualsExpression.prototype.evaluate = function (context) {
            /* tslint:disable:triple-equals */
            // Intentional !=
            return (context[this.key] != this.value);
            /* tslint:enable:triple-equals */
        };
        KbNotEqualsExpression.prototype.normalize = function () {
            if (typeof this.value === 'boolean') {
                if (this.value) {
                    return new KbNotExpression(this.key);
                }
                return new KbDefinedExpression(this.key);
            }
            return this;
        };
        KbNotEqualsExpression.prototype.serialize = function () {
            if (typeof this.value === 'boolean') {
                return this.normalize().serialize();
            }
            return this.key + ' != \'' + this.value + '\'';
        };
        return KbNotEqualsExpression;
    }());
    exports.KbNotEqualsExpression = KbNotEqualsExpression;
    var KbNotExpression = (function () {
        function KbNotExpression(key) {
            this.key = key;
        }
        KbNotExpression.prototype.equals = function (other) {
            if (other instanceof KbNotExpression) {
                return (this.key === other.key);
            }
            return false;
        };
        KbNotExpression.prototype.evaluate = function (context) {
            return (!context[this.key]);
        };
        KbNotExpression.prototype.normalize = function () {
            return this;
        };
        KbNotExpression.prototype.serialize = function () {
            return '!' + this.key;
        };
        return KbNotExpression;
    }());
    exports.KbNotExpression = KbNotExpression;
    var KbAndExpression = (function () {
        function KbAndExpression(expr) {
            this.expr = expr || [];
        }
        KbAndExpression.prototype.equals = function (other) {
            return this === other;
        };
        KbAndExpression.prototype.evaluate = function (context) {
            for (var i = 0, len = this.expr.length; i < len; i++) {
                if (!this.expr[i].evaluate(context)) {
                    return false;
                }
            }
            return true;
        };
        KbAndExpression.prototype.normalize = function () {
            var expr = [];
            for (var i = 0, len = this.expr.length; i < len; i++) {
                var e = this.expr[i];
                if (!e) {
                    continue;
                }
                e = e.normalize();
                if (!e) {
                    continue;
                }
                if (e instanceof KbAndExpression) {
                    expr = expr.concat(e.expr);
                    continue;
                }
                expr.push(e);
            }
            if (expr.length === 0) {
                return null;
            }
            if (expr.length === 1) {
                return expr[0];
            }
            return new KbAndExpression(expr);
        };
        KbAndExpression.prototype.serialize = function () {
            if (this.expr.length === 0) {
                return '';
            }
            if (this.expr.length === 1) {
                return this.normalize().serialize();
            }
            return this.expr.map(function (e) { return e.serialize(); }).join(' && ');
        };
        return KbAndExpression;
    }());
    exports.KbAndExpression = KbAndExpression;
    exports.KbExpr = {
        has: function (key) { return new KbDefinedExpression(key); },
        equals: function (key, value) { return new KbEqualsExpression(key, value); },
        notEquals: function (key, value) { return new KbNotEqualsExpression(key, value); },
        not: function (key) { return new KbNotExpression(key); },
        and: function () {
            var expr = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                expr[_i - 0] = arguments[_i];
            }
            return new KbAndExpression(expr);
        },
        deserialize: function (serialized) {
            if (!serialized) {
                return null;
            }
            var pieces = serialized.split('&&');
            var result = new KbAndExpression(pieces.map(function (p) { return exports.KbExpr._deserializeOne(p); }));
            return result.normalize();
        },
        _deserializeOne: function (serializedOne) {
            serializedOne = serializedOne.trim();
            if (serializedOne.indexOf('!=') >= 0) {
                var pieces = serializedOne.split('!=');
                return new KbNotEqualsExpression(pieces[0].trim(), exports.KbExpr._deserializeValue(pieces[1]));
            }
            if (serializedOne.indexOf('==') >= 0) {
                var pieces = serializedOne.split('==');
                return new KbEqualsExpression(pieces[0].trim(), exports.KbExpr._deserializeValue(pieces[1]));
            }
            if (/^\!\s*/.test(serializedOne)) {
                return new KbNotExpression(serializedOne.substr(1).trim());
            }
            return new KbDefinedExpression(serializedOne);
        },
        _deserializeValue: function (serializedValue) {
            serializedValue = serializedValue.trim();
            if (serializedValue === 'true') {
                return true;
            }
            if (serializedValue === 'false') {
                return false;
            }
            var m = /^'([^']*)'$/.exec(serializedValue);
            if (m) {
                return m[1].trim();
            }
            return serializedValue;
        }
    };
    exports.IKeybindingService = instantiation_1.createDecorator('keybindingService');
    exports.SET_CONTEXT_COMMAND_ID = 'setContext';
});
