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
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/nls!vs/workbench/parts/markdown/common/markdownEditorModel', 'vs/base/common/paths', 'vs/workbench/common/editor/iframeEditorModel', 'vs/platform/theme/common/themes', 'vs/workbench/parts/markdown/common/markdown', 'vs/workbench/services/editor/common/editorService', 'vs/workbench/services/themes/common/themeService', 'vs/platform/workspace/common/workspace'], function (require, exports, winjs_base_1, nls, paths, iframeEditorModel_1, themes_1, markdown_1, editorService_1, themeService_1, workspace_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /**
     * The editor model for markdown inputs. Using a library to convert markdown text into HTML from a resource with the provided path.
     */
    var MarkdownEditorModel = (function (_super) {
        __extends(MarkdownEditorModel, _super);
        function MarkdownEditorModel(resource, editorService, contextService, themeService) {
            _super.call(this, resource);
            this.editorService = editorService;
            this.contextService = contextService;
            this.themeService = themeService;
        }
        MarkdownEditorModel.prototype.load = function () {
            var _this = this;
            var isCanceled = false;
            var codeEditorModel;
            // Create a new promise here to be able to return this model even in case of an error
            return new winjs_base_1.TPromise(function (c, e) {
                // On Error: Show error to user as rendered HTML
                var onError = function (error) {
                    try {
                        var theme = _this.themeService.getTheme();
                        var usesLightTheme = themes_1.isLightTheme(theme);
                        var markdownError = nls.localize(0, null, paths.basename(_this.resource.fsPath));
                        _this.setContents('<html><head><style type="text/css">body {color: ' + (usesLightTheme ? 'black' : 'white') + '; font-family: "Segoe WPC", "Segoe UI", "HelveticaNeue-Light", sans-serif, "Droid Sans Fallback"; font-size: 13px; margin: 0; line-height: 1.4em; padding-left: 20px;}</style></head><body>', markdownError, '</body></html>');
                        c(_this);
                    }
                    catch (error) {
                        e(error); // be very careful that this promise always completes
                    }
                };
                // On Success: Show output as rendered HTML
                var onSuccess = function (model) {
                    try {
                        var mode = model.getMode();
                        var absoluteWorkerResourcesPath = require.toUrl('vs/languages/markdown/common'); // TODO@Ben technical debt: worker cannot resolve path absolute
                        if (mode && !!mode.emitOutputSupport && mode.getId() === markdown_1.MARKDOWN_MODE_ID) {
                            mode.emitOutputSupport.getEmitOutput(_this.resource, absoluteWorkerResourcesPath).then(function (output) {
                                _this.setContents(output.head, output.body, output.tail);
                                c(_this);
                            }, onError);
                        }
                        else {
                            onError(null); // mode does not support output
                        }
                    }
                    catch (error) {
                        onError(error); // be very careful that this promise always completes
                    }
                };
                // Resolve the text editor model using editor service to benefit from the local editor model cache
                _this.editorService.resolveEditorModel({
                    resource: _this.resource,
                    mime: markdown_1.MARKDOWN_MIME
                }).then(function (model) {
                    if (isCanceled) {
                        return;
                    }
                    codeEditorModel = model.textEditorModel;
                    return codeEditorModel.whenModeIsReady();
                }).then(function () {
                    if (isCanceled) {
                        return;
                    }
                    onSuccess(codeEditorModel);
                }, onError);
            }, function () {
                isCanceled = true;
            });
        };
        MarkdownEditorModel = __decorate([
            __param(1, editorService_1.IWorkbenchEditorService),
            __param(2, workspace_1.IWorkspaceContextService),
            __param(3, themeService_1.IThemeService)
        ], MarkdownEditorModel);
        return MarkdownEditorModel;
    }(iframeEditorModel_1.IFrameEditorModel));
    exports.MarkdownEditorModel = MarkdownEditorModel;
});
//# sourceMappingURL=markdownEditorModel.js.map