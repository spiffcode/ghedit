var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/editor/common/editorAction', 'vs/editor/common/editorActionEnablement', './editorAccessor'], function (require, exports, winjs_base_1, editorAction_1, editorActionEnablement_1, editorAccessor_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    /// <reference path="emmet.d.ts" />
    'use strict';
    var ExpandAbbreviationAction = (function (_super) {
        __extends(ExpandAbbreviationAction, _super);
        function ExpandAbbreviationAction(descriptor, editor) {
            _super.call(this, descriptor, editor, editorActionEnablement_1.Behaviour.TextFocus);
            this.editorAccessor = new editorAccessor_1.EditorAccessor(editor);
        }
        ExpandAbbreviationAction.prototype.run = function () {
            var _this = this;
            return new winjs_base_1.TPromise(function (c, e) {
                require(['emmet'], function (_module) {
                    try {
                        if (!_this.editorAccessor.isEmmetEnabledMode()) {
                            _this.editorAccessor.noExpansionOccurred();
                            return;
                        }
                        if (!_module.run('expand_abbreviation', _this.editorAccessor)) {
                            _this.editorAccessor.noExpansionOccurred();
                        }
                    }
                    catch (err) {
                    }
                    finally {
                        _this.editorAccessor.flushCache();
                    }
                }, e);
            });
        };
        ExpandAbbreviationAction.ID = 'editor.emmet.action.expandAbbreviation';
        return ExpandAbbreviationAction;
    }(editorAction_1.EditorAction));
    exports.ExpandAbbreviationAction = ExpandAbbreviationAction;
});
//# sourceMappingURL=emmetActions.js.map