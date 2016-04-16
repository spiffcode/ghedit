/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/nls!vs/editor/contrib/parameterHints/browser/parameterHintsWidget', 'vs/base/common/lifecycle', 'vs/base/common/winjs.base', 'vs/base/browser/builder', 'vs/base/browser/ui/aria/aria', 'vs/editor/common/editorCommon', 'vs/editor/browser/editorBrowser', 'vs/css!./parameterHints'], function (require, exports, nls, lifecycle_1, winjs_base_1, builder_1, aria, editorCommon_1, editorBrowser_1) {
    'use strict';
    var ParameterHintsWidget = (function () {
        function ParameterHintsWidget(model, editor, onShown, onHidden) {
            var _this = this;
            // Editor.IContentWidget.allowEditorOverflow
            this.allowEditorOverflow = true;
            this._onShown = onShown;
            this._onHidden = onHidden;
            this.editor = editor;
            this.modelListenersToRemove = [];
            this.model = null;
            this.isVisible = false;
            this.isDisposed = false;
            this.setModel(model);
            this.$el = builder_1.$('.editor-widget.parameter-hints-widget').on('click', function () {
                _this.selectNext();
                _this.editor.focus();
            });
            this.$wrapper = builder_1.$('.wrapper.monaco-editor-background').appendTo(this.$el);
            var $buttons = builder_1.$('.buttons').appendTo(this.$wrapper);
            builder_1.$('.button.previous').on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                _this.selectPrevious();
            }).appendTo($buttons);
            builder_1.$('.button.next').on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                _this.selectNext();
            }).appendTo($buttons);
            this.$overloads = builder_1.$('.overloads').appendTo(this.$wrapper);
            this.$signatures = builder_1.$('.signatures').appendTo(this.$wrapper);
            this.signatureViews = [];
            this.currentSignature = 0;
            this.editor.addContentWidget(this);
            this.hide();
            this.toDispose = [];
            this.toDispose.push(this.editor.addListener2(editorCommon_1.EventType.CursorSelectionChanged, function (e) {
                if (_this.isVisible) {
                    _this.editor.layoutContentWidget(_this);
                }
            }));
        }
        ParameterHintsWidget.prototype.setModel = function (newModel) {
            var _this = this;
            this.releaseModel();
            this.model = newModel;
            this.modelListenersToRemove.push(this.model.addListener('hint', function (e) {
                _this.show();
                _this.parameterHints = e.hints;
                _this.render(e.hints);
                _this.currentSignature = e.hints.currentSignature;
                _this.select(_this.currentSignature);
            }));
            this.modelListenersToRemove.push(this.model.addListener('cancel', function (e) {
                _this.hide();
            }));
        };
        ParameterHintsWidget.prototype.show = function () {
            var _this = this;
            if (this.isDisposed) {
                return;
            }
            if (this.isVisible) {
                return;
            }
            this._onShown();
            this.isVisible = true;
            winjs_base_1.TPromise.timeout(100).done(function () {
                _this.$el.addClass('visible');
            });
            this.editor.layoutContentWidget(this);
        };
        ParameterHintsWidget.prototype.hide = function () {
            if (this.isDisposed) {
                return;
            }
            if (!this.isVisible) {
                return;
            }
            this._onHidden();
            this.isVisible = false;
            this.parameterHints = null;
            this.announcedLabel = null;
            this.$el.removeClass('visible');
            this.editor.layoutContentWidget(this);
        };
        ParameterHintsWidget.prototype.getPosition = function () {
            if (this.isVisible) {
                return {
                    position: this.editor.getPosition(),
                    preference: [editorBrowser_1.ContentWidgetPositionPreference.ABOVE, editorBrowser_1.ContentWidgetPositionPreference.BELOW]
                };
            }
            return null;
        };
        ParameterHintsWidget.prototype.render = function (hints) {
            if (hints.signatures.length > 1) {
                this.$el.addClass('multiple');
            }
            else {
                this.$el.removeClass('multiple');
            }
            this.$signatures.empty();
            this.signatureViews = [];
            var height = 0;
            for (var i = 0, len = hints.signatures.length; i < len; i++) {
                var signature = hints.signatures[i];
                var $signature = this.renderSignature(this.$signatures, signature, hints.currentParameter);
                this.renderDocumentation($signature, signature, hints.currentParameter);
                var signatureHeight = $signature.getClientArea().height;
                this.signatureViews.push({
                    top: height,
                    height: signatureHeight
                });
                height += signatureHeight;
            }
        };
        ParameterHintsWidget.prototype.renderSignature = function ($el, signature, currentParameter) {
            var $signature = builder_1.$('.signature').appendTo($el), hasParameters = signature.parameters.length > 0;
            if (!hasParameters) {
                $signature.append(builder_1.$('span').text(signature.label));
            }
            else {
                var $parameters = builder_1.$('span.parameters'), offset = 0;
                for (var i = 0, len = signature.parameters.length; i < len; i++) {
                    var parameter = signature.parameters[i];
                    (i === 0 ? $signature : $parameters).append(builder_1.$('span').text(signature.label.substring(offset, parameter.signatureLabelOffset)));
                    $parameters.append(builder_1.$('span.parameter').addClass(i === currentParameter ? 'active' : '').text(signature.label.substring(parameter.signatureLabelOffset, parameter.signatureLabelEnd)));
                    offset = parameter.signatureLabelEnd;
                }
                $signature.append($parameters);
                $signature.append(builder_1.$('span').text(signature.label.substring(offset)));
            }
            return $signature;
        };
        ParameterHintsWidget.prototype.renderDocumentation = function ($el, signature, activeParameterIdx) {
            if (signature.documentation) {
                $el.append(builder_1.$('.documentation').text(signature.documentation));
            }
            var activeParameter = signature.parameters[activeParameterIdx];
            if (activeParameter && activeParameter.documentation) {
                var $parameter = builder_1.$('.documentation');
                $parameter.append(builder_1.$('span.parameter').text(activeParameter.label));
                $parameter.append(builder_1.$('span').text(activeParameter.documentation));
                $el.append($parameter);
            }
        };
        ParameterHintsWidget.prototype.select = function (position) {
            var signature = this.signatureViews[position];
            if (!signature) {
                return;
            }
            this.$signatures.style({ height: signature.height + 'px' });
            this.$signatures.getHTMLElement().scrollTop = signature.top;
            var overloads = '' + (position + 1);
            if (this.signatureViews.length < 10) {
                overloads += '/' + this.signatureViews.length;
            }
            this.$overloads.text(overloads);
            if (this.parameterHints && this.parameterHints.signatures[position].parameters[this.parameterHints.currentParameter]) {
                var labelToAnnounce = this.parameterHints.signatures[position].parameters[this.parameterHints.currentParameter].label;
                // Select method gets called on every user type while parameter hints are visible.
                // We do not want to spam the user with same announcements, so we only announce if the current parameter changed.
                if (this.announcedLabel !== labelToAnnounce) {
                    aria.alert(nls.localize(0, null, labelToAnnounce));
                    this.announcedLabel = labelToAnnounce;
                }
            }
            this.editor.layoutContentWidget(this);
        };
        ParameterHintsWidget.prototype.selectNext = function () {
            if (this.signatureViews.length < 2) {
                this.cancel();
                return false;
            }
            this.currentSignature = (this.currentSignature + 1) % this.signatureViews.length;
            this.select(this.currentSignature);
            return true;
        };
        ParameterHintsWidget.prototype.selectPrevious = function () {
            if (this.signatureViews.length < 2) {
                this.cancel();
                return false;
            }
            this.currentSignature--;
            if (this.currentSignature < 0) {
                this.currentSignature = this.signatureViews.length - 1;
            }
            this.select(this.currentSignature);
            return true;
        };
        ParameterHintsWidget.prototype.cancel = function () {
            this.model.cancel();
        };
        ParameterHintsWidget.prototype.getDomNode = function () {
            return this.$el.getHTMLElement();
        };
        ParameterHintsWidget.prototype.getId = function () {
            return ParameterHintsWidget.ID;
        };
        ParameterHintsWidget.prototype.releaseModel = function () {
            var listener;
            while (listener = this.modelListenersToRemove.pop()) {
                listener();
            }
            if (this.model) {
                this.model.dispose();
                this.model = null;
            }
        };
        ParameterHintsWidget.prototype.destroy = function () {
            this.toDispose = lifecycle_1.dispose(this.toDispose);
            this.releaseModel();
            if (this.$overloads) {
                this.$overloads.destroy();
                delete this.$overloads;
            }
            if (this.$signatures) {
                this.$signatures.destroy();
                delete this.$signatures;
            }
            if (this.$wrapper) {
                this.$wrapper.destroy();
                delete this.$wrapper;
            }
            if (this.$el) {
                this.$el.destroy();
                delete this.$el;
            }
            this.isDisposed = true;
        };
        ParameterHintsWidget.ID = 'editor.widget.parameterHintsWidget';
        return ParameterHintsWidget;
    }());
    exports.ParameterHintsWidget = ParameterHintsWidget;
});
//# sourceMappingURL=parameterHintsWidget.js.map