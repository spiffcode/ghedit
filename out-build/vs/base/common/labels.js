define(["require", "exports", 'vs/base/common/platform', 'vs/base/common/types', 'vs/base/common/strings', 'vs/base/common/paths'], function (require, exports, platform, types, strings, paths) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var PathLabelProvider = (function () {
        function PathLabelProvider(arg1) {
            this.root = arg1 && getPath(arg1);
        }
        PathLabelProvider.prototype.getLabel = function (arg1) {
            return getPathLabel(getPath(arg1), this.root);
        };
        return PathLabelProvider;
    }());
    exports.PathLabelProvider = PathLabelProvider;
    function getPathLabel(arg1, arg2) {
        var basepath = arg2 && getPath(arg2);
        var absolutePath = getPath(arg1);
        if (basepath && paths.isEqualOrParent(absolutePath, basepath)) {
            return paths.normalize(strings.ltrim(absolutePath.substr(basepath.length), paths.nativeSep), true);
        }
        if (platform.isWindows && absolutePath[1] === ':') {
            return paths.normalize(absolutePath.charAt(0).toUpperCase() + absolutePath.slice(1), true);
        }
        return paths.normalize(absolutePath, true);
    }
    exports.getPathLabel = getPathLabel;
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
//# sourceMappingURL=labels.js.map