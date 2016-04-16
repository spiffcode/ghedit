define(["require", "exports"], function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var EditorSimpleWorker = (function () {
        function EditorSimpleWorker() {
        }
        EditorSimpleWorker.prototype.acceptNewModel = function (data) {
            throw new Error('Not implemented!');
        };
        EditorSimpleWorker.prototype.acceptModelChanged = function (modelUrl, events) {
            throw new Error('Not implemented!');
        };
        EditorSimpleWorker.prototype.acceptRemovedModel = function (modelUrl) {
            throw new Error('Not implemented!');
        };
        EditorSimpleWorker.prototype.computeDiff = function (originalUrl, modifiedUrl, ignoreTrimWhitespace) {
            throw new Error('Not implemented!');
        };
        EditorSimpleWorker.prototype.computeDirtyDiff = function (originalUrl, modifiedUrl, ignoreTrimWhitespace) {
            throw new Error('Not implemented!');
        };
        EditorSimpleWorker.prototype.computeLinks = function (modelUrl) {
            throw new Error('Not implemented!');
        };
        EditorSimpleWorker.prototype.textualSuggest = function (modelUrl, position, wordDef, wordDefFlags) {
            throw new Error('Not implemented!');
        };
        EditorSimpleWorker.prototype.navigateValueSet = function (modelUrl, range, up, wordDef, wordDefFlags) {
            throw new Error('Not implemented!');
        };
        return EditorSimpleWorker;
    }());
    exports.EditorSimpleWorker = EditorSimpleWorker;
});
