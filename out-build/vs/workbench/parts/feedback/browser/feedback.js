/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/nls!vs/workbench/parts/feedback/browser/feedback', 'vs/base/browser/builder', 'vs/base/browser/ui/dropdown/dropdown', 'vs/platform/telemetry/common/telemetry', 'vs/workbench/services/workspace/common/contextService', 'vs/css!./media/feedback'], function (require, exports, nls, builder_1, dropdown_1, telemetry_1, contextService_1) {
    'use strict';
    var FormEvent;
    (function (FormEvent) {
        FormEvent[FormEvent["SENDING"] = 0] = "SENDING";
        FormEvent[FormEvent["SENT"] = 1] = "SENT";
        FormEvent[FormEvent["SEND_ERROR"] = 2] = "SEND_ERROR";
    })(FormEvent || (FormEvent = {}));
    var FeedbackDropdown = (function (_super) {
        __extends(FeedbackDropdown, _super);
        function FeedbackDropdown(container, options, telemetryService, contextService) {
            _super.call(this, container, {
                contextViewProvider: options.contextViewProvider,
                labelRenderer: function (container) {
                    builder_1.$(container).addClass('send-feedback');
                    return null;
                }
            });
            this.telemetryService = telemetryService;
            this.contextService = contextService;
            this.$el.addClass('send-feedback');
            this.$el.title(nls.localize(0, null));
            this.feedbackService = options.feedbackService;
            this.feedback = '';
            this.sentiment = 1;
            this.maxFeedbackCharacters = this.feedbackService.getCharacterLimit(this.sentiment);
            this.feedbackForm = null;
            this.feedbackDescriptionInput = null;
            this.smileyInput = null;
            this.frownyInput = null;
            this.sendButton = null;
            var env = contextService.getConfiguration().env;
            this.reportIssueLink = env.sendASmile.reportIssueUrl;
            this.requestFeatureLink = env.sendASmile.requestFeatureUrl;
        }
        FeedbackDropdown.prototype.renderContents = function (container) {
            var _this = this;
            var $form = builder_1.$('form.feedback-form').attr({
                action: 'javascript:void(0);',
                tabIndex: '-1'
            }).appendTo(container);
            builder_1.$(container).addClass('monaco-menu-container');
            this.feedbackForm = $form.getHTMLElement();
            builder_1.$('h2.title').text(nls.localize(1, null)).appendTo($form);
            this.invoke(builder_1.$('div.cancel').attr('tabindex', '0'), function () {
                _this.hide();
            }).appendTo($form);
            var $content = builder_1.$('div.content').appendTo($form);
            var $sentimentContainer = builder_1.$('div').appendTo($content);
            builder_1.$('span').text(nls.localize(2, null)).appendTo($sentimentContainer);
            var $feedbackSentiment = builder_1.$('div.feedback-sentiment').appendTo($sentimentContainer);
            this.smileyInput = builder_1.$('div').addClass('sentiment smile').attr({
                'aria-checked': 'false',
                'aria-label': nls.localize(3, null),
                'tabindex': 0,
                'role': 'checkbox'
            });
            this.invoke(this.smileyInput, function () { _this.setSentiment(true); }).appendTo($feedbackSentiment);
            this.frownyInput = builder_1.$('div').addClass('sentiment frown').attr({
                'aria-checked': 'false',
                'aria-label': nls.localize(4, null),
                'tabindex': 0,
                'role': 'checkbox'
            });
            this.invoke(this.frownyInput, function () { _this.setSentiment(false); }).appendTo($feedbackSentiment);
            if (this.sentiment === 1) {
                this.smileyInput.addClass('checked').attr('aria-checked', 'true');
            }
            else {
                this.frownyInput.addClass('checked').attr('aria-checked', 'true');
            }
            var $contactUs = builder_1.$('div.contactus').appendTo($content);
            builder_1.$('span').text(nls.localize(5, null)).appendTo($contactUs);
            var $contactUsContainer = builder_1.$('div.channels').appendTo($contactUs);
            builder_1.$('div').append(builder_1.$('a').attr('target', '_blank').attr('href', this.reportIssueLink).text(nls.localize(6, null)).attr('tabindex', '0'))
                .appendTo($contactUsContainer);
            builder_1.$('div').append(builder_1.$('a').attr('target', '_blank').attr('href', this.requestFeatureLink).text(nls.localize(7, null)).attr('tabindex', '0'))
                .appendTo($contactUsContainer);
            this.remainingCharacterCount = builder_1.$('span.char-counter').text(this.getCharCountText(0));
            builder_1.$('h3').text(nls.localize(8, null))
                .append(this.remainingCharacterCount)
                .appendTo($form);
            this.feedbackDescriptionInput = builder_1.$('textarea.feedback-description').attr({
                rows: 3,
                maxlength: this.maxFeedbackCharacters,
                'aria-label': nls.localize(9, null)
            })
                .text(this.feedback).attr('required', 'required')
                .on('keyup', function () {
                _this.updateCharCountText();
            })
                .appendTo($form).domFocus().getHTMLElement();
            var $buttons = builder_1.$('div.form-buttons').appendTo($form);
            this.sendButton = this.invoke(builder_1.$('input.send').type('submit').attr('disabled', '').value(nls.localize(10, null)).appendTo($buttons), function () {
                if (_this.isSendingFeedback) {
                    return;
                }
                _this.onSubmit();
            });
            return {
                dispose: function () {
                    _this.feedbackForm = null;
                    _this.feedbackDescriptionInput = null;
                    _this.smileyInput = null;
                    _this.frownyInput = null;
                }
            };
        };
        FeedbackDropdown.prototype.getCharCountText = function (charCount) {
            var remaining = this.maxFeedbackCharacters - charCount;
            var text = (remaining === 1)
                ? nls.localize(11, null)
                : nls.localize(12, null);
            return '(' + remaining + ' ' + text + ')';
        };
        FeedbackDropdown.prototype.updateCharCountText = function () {
            this.remainingCharacterCount.text(this.getCharCountText(this.feedbackDescriptionInput.value.length));
            this.feedbackDescriptionInput.value ? this.sendButton.removeAttribute('disabled') : this.sendButton.attr('disabled', '');
        };
        FeedbackDropdown.prototype.setSentiment = function (smile) {
            if (smile) {
                this.smileyInput.addClass('checked');
                this.smileyInput.attr('aria-checked', 'true');
                this.frownyInput.removeClass('checked');
                this.frownyInput.attr('aria-checked', 'false');
            }
            else {
                this.frownyInput.addClass('checked');
                this.frownyInput.attr('aria-checked', 'true');
                this.smileyInput.removeClass('checked');
                this.smileyInput.attr('aria-checked', 'false');
            }
            this.sentiment = smile ? 1 : 0;
            this.maxFeedbackCharacters = this.feedbackService.getCharacterLimit(this.sentiment);
            this.updateCharCountText();
            builder_1.$(this.feedbackDescriptionInput).attr({ maxlength: this.maxFeedbackCharacters });
        };
        FeedbackDropdown.prototype.invoke = function (element, callback) {
            element.on('click', callback);
            element.on('keypress', function (e) {
                if (e instanceof KeyboardEvent) {
                    var keyboardEvent = e;
                    if (keyboardEvent.keyCode === 13 || keyboardEvent.keyCode === 32) {
                        callback();
                    }
                }
            });
            return element;
        };
        FeedbackDropdown.prototype.hide = function () {
            if (this.feedbackDescriptionInput) {
                this.feedback = this.feedbackDescriptionInput.value;
            }
            if (this.autoHideTimeout) {
                clearTimeout(this.autoHideTimeout);
                this.autoHideTimeout = null;
            }
            _super.prototype.hide.call(this);
        };
        FeedbackDropdown.prototype.onEvent = function (e, activeElement) {
            if (e instanceof KeyboardEvent) {
                var keyboardEvent = e;
                if (keyboardEvent.keyCode === 27) {
                    this.hide();
                }
            }
        };
        FeedbackDropdown.prototype.onSubmit = function () {
            if ((this.feedbackForm.checkValidity && !this.feedbackForm.checkValidity())) {
                return;
            }
            this.changeFormStatus(FormEvent.SENDING);
            this.feedbackService.submitFeedback({
                feedback: this.feedbackDescriptionInput.value,
                sentiment: this.sentiment
            });
            this.changeFormStatus(FormEvent.SENT);
        };
        FeedbackDropdown.prototype.changeFormStatus = function (event) {
            var _this = this;
            switch (event) {
                case FormEvent.SENDING:
                    this.isSendingFeedback = true;
                    this.sendButton.setClass('send in-progress');
                    this.sendButton.value(nls.localize(13, null));
                    break;
                case FormEvent.SENT:
                    this.isSendingFeedback = false;
                    this.sendButton.setClass('send success').value(nls.localize(14, null));
                    this.resetForm();
                    this.autoHideTimeout = setTimeout(function () {
                        _this.hide();
                    }, 1000);
                    this.sendButton.off(['click', 'keypress']);
                    this.invoke(this.sendButton, function () {
                        _this.hide();
                        _this.sendButton.off(['click', 'keypress']);
                    });
                    break;
                case FormEvent.SEND_ERROR:
                    this.isSendingFeedback = false;
                    this.sendButton.setClass('send error').value(nls.localize(15, null));
                    break;
            }
        };
        FeedbackDropdown.prototype.resetForm = function () {
            if (this.feedbackDescriptionInput) {
                this.feedbackDescriptionInput.value = '';
            }
            this.sentiment = 1;
            this.maxFeedbackCharacters = this.feedbackService.getCharacterLimit(this.sentiment);
            this.aliasEnabled = false;
        };
        FeedbackDropdown = __decorate([
            __param(2, telemetry_1.ITelemetryService),
            __param(3, contextService_1.IWorkspaceContextService)
        ], FeedbackDropdown);
        return FeedbackDropdown;
    }(dropdown_1.Dropdown));
    exports.FeedbackDropdown = FeedbackDropdown;
});
//# sourceMappingURL=feedback.js.map