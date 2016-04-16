define(["require", "exports", 'vs/base/browser/dom', 'vs/base/common/paths', 'vs/base/common/types', 'vs/base/common/labels', 'vs/css!./filelabel'], function (require, exports, dom, paths, types, labels_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var FileLabel = (function () {
        function FileLabel(container, arg2, arg3) {
            this.domNode = document.createElement('span');
            this.domNode.className = 'monaco-file-label';
            container.appendChild(this.domNode);
            if (arg3) {
                this.basepath = getPath(arg3);
            }
            if (arg2) {
                this.setValue(arg2);
            }
        }
        FileLabel.prototype.getHTMLElement = function () {
            return this.domNode;
        };
        FileLabel.prototype.setValue = function (arg1) {
            var newPath = getPath(arg1);
            if (this.renderedOnce && this.path === newPath) {
                // don't render again if nothing has changed
                return;
            }
            this.path = newPath;
            this.render();
            this.renderedOnce = true;
        };
        FileLabel.prototype.render = function () {
            dom.clearNode(this.domNode);
            var htmlContent = [];
            htmlContent.push('<span class="file-name">');
            htmlContent.push(paths.basename(this.path));
            htmlContent.push('</span>');
            var parent = paths.dirname(this.path);
            if (parent && parent !== '.') {
                var pathLabel = labels_1.getPathLabel(parent, this.basepath);
                htmlContent.push('<span class="file-path" title="' + pathLabel + '">');
                htmlContent.push(pathLabel);
                htmlContent.push('</span>');
            }
            this.domNode.innerHTML = htmlContent.join('');
        };
        return FileLabel;
    }());
    exports.FileLabel = FileLabel;
    function getPath(arg1) {
        if (!arg1) {
            return null;
        }
        if (typeof arg1 === 'string') {
            return arg1;
        }
        if (types.isFunction(arg1.getWorkspace)) {
            var ws = arg1.getWorkspace();
            return ws ? ws.resource.fsPath : void 0;
        }
        return arg1.fsPath;
    }
});
//# sourceMappingURL=fileLabel.js.map