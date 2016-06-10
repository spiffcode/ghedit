/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/eventEmitter', 'vs/base/browser/dom', 'vs/base/browser/builder', 'vs/base/browser/keyboardEvent', 'vs/base/common/keyCodes', 'vs/css!./button'], function (require, exports, eventEmitter_1, DOM, builder_1, keyboardEvent_1, keyCodes_1) {
    'use strict';
    var Button = (function (_super) {
        __extends(Button, _super);
        function Button(container) {
            var _this = this;
            _super.call(this);
            this.$el = builder_1.$('a.monaco-button').attr({
                'tabIndex': '0',
                'role': 'button'
            }).appendTo(container);
            this.$el.on(DOM.EventType.CLICK, function (e) {
                if (!_this.enabled) {
                    DOM.EventHelper.stop(e);
                    return;
                }
                _this.emit(DOM.EventType.CLICK, e);
            });
            this.$el.on(DOM.EventType.KEY_DOWN, function (e) {
                var event = new keyboardEvent_1.StandardKeyboardEvent(e);
                var eventHandled = false;
                if (_this.enabled && event.equals(keyCodes_1.CommonKeybindings.ENTER) || event.equals(keyCodes_1.CommonKeybindings.SPACE)) {
                    _this.emit(DOM.EventType.CLICK, e);
                    eventHandled = true;
                }
                else if (event.equals(keyCodes_1.CommonKeybindings.ESCAPE)) {
                    _this.$el.domBlur();
                    eventHandled = true;
                }
                if (eventHandled) {
                    DOM.EventHelper.stop(event, true);
                }
            });
        }
        Button.prototype.getElement = function () {
            return this.$el.getHTMLElement();
        };
        Object.defineProperty(Button.prototype, "label", {
            set: function (value) {
                this.$el.text(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "enabled", {
            get: function () {
                return !this.$el.hasClass('disabled');
            },
            set: function (value) {
                if (value) {
                    this.$el.removeClass('disabled');
                    this.$el.attr({
                        'aria-disabled': 'false',
                        'tabIndex': '0'
                    });
                }
                else {
                    this.$el.addClass('disabled');
                    this.$el.attr('aria-disabled', String(true));
                    DOM.removeTabIndexAndUpdateFocus(this.$el.getHTMLElement());
                }
            },
            enumerable: true,
            configurable: true
        });
        Button.prototype.dispose = function () {
            if (this.$el) {
                this.$el.dispose();
                this.$el = null;
            }
            _super.prototype.dispose.call(this);
        };
        return Button;
    }(eventEmitter_1.EventEmitter));
    exports.Button = Button;
});
//# sourceMappingURL=button.js.map