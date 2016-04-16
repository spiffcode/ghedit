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
define(["require", "exports", 'vs/nls', 'vs/base/common/winjs.base', 'vs/base/browser/dom', 'vs/base/browser/builder', 'vs/base/common/errors', 'vs/workbench/browser/parts/editor/baseEditor', 'vs/workbench/common/editor/iframeEditorInput', 'vs/workbench/common/editor/iframeEditorModel', 'vs/platform/storage/common/storage', 'vs/platform/telemetry/common/telemetry', 'vs/workbench/services/editor/common/editorService', 'vs/css!./media/iframeeditor'], function (require, exports, nls, winjs_base_1, DOM, builder_1, errors, baseEditor_1, iframeEditorInput_1, iframeEditorModel_1, storage_1, telemetry_1, editorService_1) {
    'use strict';
    /**
     * An implementation of editor for showing HTML content in an IFrame by leveraging the IFrameEditorInput.
     */
    var IFrameEditor = (function (_super) {
        __extends(IFrameEditor, _super);
        function IFrameEditor(telemetryService, editorService, storageService) {
            _super.call(this, IFrameEditor.ID, telemetryService);
            this.editorService = editorService;
            this.storageService = storageService;
        }
        IFrameEditor.prototype.getTitle = function () {
            return this.getInput() ? this.getInput().getName() : nls.localize('iframeEditor', "IFrame Viewer");
        };
        IFrameEditor.prototype.createEditor = function (parent) {
            // Container for IFrame
            var iframeContainerElement = document.createElement('div');
            iframeContainerElement.className = 'iframe-container';
            this.iframeContainer = builder_1.$(iframeContainerElement);
            this.iframeContainer.tabindex(0); // enable focus support from the editor part (do not remove)
            // IFrame
            this.iframeBuilder = builder_1.$(this.iframeContainer).element('iframe').addClass('iframe');
            this.iframeBuilder.attr({ 'frameborder': '0' });
            this.iframeBuilder.removeProperty(IFrameEditor.RESOURCE_PROPERTY);
            parent.getHTMLElement().appendChild(iframeContainerElement);
        };
        IFrameEditor.prototype.setInput = function (input, options) {
            var oldInput = this.getInput();
            _super.prototype.setInput.call(this, input, options);
            // Detect options
            var forceOpen = options && options.forceOpen;
            // Same Input
            if (!forceOpen && input.matches(oldInput)) {
                return winjs_base_1.TPromise.as(null);
            }
            // Assert Input
            if (!(input instanceof iframeEditorInput_1.IFrameEditorInput)) {
                return winjs_base_1.TPromise.wrapError('Invalid editor input. IFrame editor requires an input instance of IFrameEditorInput.');
            }
            // Different Input (Reload)
            return this.doSetInput(input, true /* isNewInput */);
        };
        IFrameEditor.prototype.doSetInput = function (input, isNewInput) {
            var _this = this;
            return this.editorService.resolveEditorModel(input, true /* Reload */).then(function (resolvedModel) {
                // Assert Model interface
                if (!(resolvedModel instanceof iframeEditorModel_1.IFrameEditorModel)) {
                    return winjs_base_1.TPromise.wrapError('Invalid editor input. IFrame editor requires a model instance of IFrameEditorModel.');
                }
                // Assert that the current input is still the one we expect. This prevents a race condition when loading takes long and another input was set meanwhile
                if (!_this.getInput() || _this.getInput() !== input) {
                    return null;
                }
                // Set IFrame contents
                var iframeModel = resolvedModel;
                var isUpdate = !isNewInput && !!_this.iframeBuilder.getProperty(IFrameEditor.RESOURCE_PROPERTY);
                var contents = iframeModel.getContents();
                // Crazy hack to get keybindings to bubble out of the iframe to us
                contents.body = contents.body + _this.enableKeybindings();
                // Set Contents
                try {
                    _this.setFrameContents(iframeModel.resource, isUpdate ? contents.body : [contents.head, contents.body, contents.tail].join('\n'), isUpdate /* body only */);
                }
                catch (error) {
                    setTimeout(function () { return _this.reload(true /* clear */); }, 1000); // retry in case of an error which indicates the iframe (only) might be on a different URL
                }
                // When content is fully replaced, we also need to recreate the focus tracker
                if (!isUpdate) {
                    _this.clearFocusTracker();
                }
                // Track focus on contents and make the editor active when focus is received
                if (!_this.focusTracker) {
                    _this.focusTracker = DOM.trackFocus(_this.iframeBuilder.getHTMLElement().contentWindow);
                    _this.focusTracker.addFocusListener(function () {
                        _this.editorService.activateEditor(_this.position);
                    });
                }
            });
        };
        IFrameEditor.prototype.setFrameContents = function (resource, contents, isUpdate) {
            var iframeWindow = this.iframeBuilder.getHTMLElement().contentWindow;
            // Update body only if this is an update of the same resource (preserves scroll position and does not flicker)
            if (isUpdate) {
                iframeWindow.document.body.innerHTML = contents;
            }
            else {
                iframeWindow.document.open('text/html', 'replace');
                iframeWindow.document.write(contents);
                iframeWindow.document.close();
                // Reset scroll
                iframeWindow.scrollTo(0, 0);
                // Associate resource with iframe
                this.iframeBuilder.setProperty(IFrameEditor.RESOURCE_PROPERTY, resource.toString());
            }
        };
        IFrameEditor.prototype.enableKeybindings = function () {
            return [
                '<script>',
                'var ignoredKeys = [9 /* tab */, 32 /* space */, 33 /* page up */, 34 /* page down */, 38 /* up */, 40 /* down */];',
                'var ignoredCtrlCmdKeys = [65 /* a */, 67 /* c */];',
                'var ignoredShiftKeys = [9 /* tab */];',
                'window.document.body.addEventListener("keydown", function(event) {',
                '	try {',
                '		if (ignoredKeys.some(function(i) { return i === event.keyCode; })) {',
                '			if (!event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey) {',
                '				return;',
                '			}',
                '		}',
                '',
                '		if (ignoredCtrlCmdKeys.some(function(i) { return i === event.keyCode; })) {',
                '			if (event.ctrlKey || event.metaKey) {',
                '				return;',
                '			}',
                '		}',
                '',
                '		if (ignoredShiftKeys.some(function(i) { return i === event.keyCode; })) {',
                '			if (event.shiftKey) {',
                '				return;',
                '			}',
                '		}',
                '',
                '		event.preventDefault();',
                '',
                '		var fakeEvent = document.createEvent("KeyboardEvent");',
                '		Object.defineProperty(fakeEvent, "keyCode", {',
                '			get : function() {',
                '				return event.keyCode;',
                '			}',
                '		});',
                '		Object.defineProperty(fakeEvent, "which", {',
                '			get : function() {',
                '				return event.keyCode;',
                '			}',
                '		});',
                '		Object.defineProperty(fakeEvent, "target", {',
                '			get : function() {',
                '				return window && window.parent.document.body;',
                '			}',
                '		});',
                '',
                '		fakeEvent.initKeyboardEvent("keydown", true, true, document.defaultView, null, null, event.ctrlKey, event.altKey, event.shiftKey, event.metaKey);',
                '',
                '		window.parent.document.dispatchEvent(fakeEvent);',
                '	} catch (error) {}',
                '});',
                // disable dropping into iframe!
                'window.document.addEventListener("dragover", function (e) {',
                '	e.preventDefault();',
                '});',
                'window.document.addEventListener("drop", function (e) {',
                '	e.preventDefault();',
                '});',
                'window.document.body.addEventListener("dragover", function (e) {',
                '	e.preventDefault();',
                '});',
                'window.document.body.addEventListener("drop", function (e) {',
                '	e.preventDefault();',
                '});',
                '</script>'
            ].join('\n');
        };
        IFrameEditor.prototype.clearInput = function () {
            // Reset IFrame
            this.clearIFrame();
            _super.prototype.clearInput.call(this);
        };
        IFrameEditor.prototype.clearIFrame = function () {
            this.iframeBuilder.src('about:blank');
            this.iframeBuilder.removeProperty(IFrameEditor.RESOURCE_PROPERTY);
            // Focus Listener
            this.clearFocusTracker();
        };
        IFrameEditor.prototype.clearFocusTracker = function () {
            if (this.focusTracker) {
                this.focusTracker.dispose();
                this.focusTracker = null;
            }
        };
        IFrameEditor.prototype.layout = function (dimension) {
            // Pass on to IFrame Container and IFrame
            this.iframeContainer.size(dimension.width, dimension.height);
            this.iframeBuilder.size(dimension.width, dimension.height);
        };
        IFrameEditor.prototype.focus = function () {
            this.iframeContainer.domFocus();
        };
        IFrameEditor.prototype.changePosition = function (position) {
            var _this = this;
            _super.prototype.changePosition.call(this, position);
            // reparenting an IFRAME into another DOM element yields weird results when the contents are made
            // of a string and not a URL. to be on the safe side we reload the iframe when the position changes
            // and we do it using a timeout of 0 to reload only after the position has been changed in the DOM
            setTimeout(function () { return _this.reload(true); });
        };
        IFrameEditor.prototype.supportsSplitEditor = function () {
            return true;
        };
        /**
         * Reloads the contents of the iframe in this editor by reapplying the input.
         */
        IFrameEditor.prototype.reload = function (clearIFrame) {
            if (this.input) {
                if (clearIFrame) {
                    this.clearIFrame();
                }
                this.doSetInput(this.input).done(null, errors.onUnexpectedError);
            }
        };
        IFrameEditor.prototype.dispose = function () {
            // Destroy Container
            this.iframeContainer.destroy();
            // Focus Listener
            this.clearFocusTracker();
            _super.prototype.dispose.call(this);
        };
        IFrameEditor.ID = 'workbench.editors.iFrameEditor';
        IFrameEditor.RESOURCE_PROPERTY = 'resource';
        IFrameEditor = __decorate([
            __param(0, telemetry_1.ITelemetryService),
            __param(1, editorService_1.IWorkbenchEditorService),
            __param(2, storage_1.IStorageService)
        ], IFrameEditor);
        return IFrameEditor;
    }(baseEditor_1.BaseEditor));
    exports.IFrameEditor = IFrameEditor;
});
//# sourceMappingURL=iframeEditor.js.map