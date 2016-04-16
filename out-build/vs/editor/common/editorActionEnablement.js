var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/lifecycle', 'vs/editor/common/editorCommon'], function (require, exports, lifecycle_1, editorCommon_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    (function (Behaviour) {
        Behaviour[Behaviour["TextFocus"] = 1] = "TextFocus";
        Behaviour[Behaviour["WidgetFocus"] = 2] = "WidgetFocus";
        Behaviour[Behaviour["Writeable"] = 4] = "Writeable";
        Behaviour[Behaviour["UpdateOnModelChange"] = 8] = "UpdateOnModelChange";
        Behaviour[Behaviour["UpdateOnConfigurationChange"] = 16] = "UpdateOnConfigurationChange";
        Behaviour[Behaviour["ShowInContextMenu"] = 32] = "ShowInContextMenu";
        Behaviour[Behaviour["UpdateOnCursorPositionChange"] = 64] = "UpdateOnCursorPositionChange";
    })(exports.Behaviour || (exports.Behaviour = {}));
    var Behaviour = exports.Behaviour;
    function createActionEnablement(editor, condition, action) {
        return new CompositeEnablementState([new InternalEnablementState(condition, editor), new DescentEnablementState(condition, editor, action)]);
    }
    exports.createActionEnablement = createActionEnablement;
    /**
     * A composite that acts like a logical AND on
     * enablement states
     */
    var CompositeEnablementState = (function () {
        function CompositeEnablementState(_delegates) {
            this._delegates = _delegates;
            // empty
        }
        CompositeEnablementState.prototype.value = function () {
            return this._delegates.every(function (d) { return d.value(); });
        };
        CompositeEnablementState.prototype.reset = function () {
            this._delegates.forEach(function (d) {
                if (d instanceof CachingEnablementState) {
                    d.reset();
                }
            });
        };
        CompositeEnablementState.prototype.dispose = function () {
            this._delegates.forEach(function (d) { return d.dispose(); });
        };
        return CompositeEnablementState;
    }());
    /**
     * A enablement state that caches its result until
     * reset is called.
     */
    var CachingEnablementState = (function () {
        function CachingEnablementState() {
            this._value = null;
        }
        CachingEnablementState.prototype.reset = function () {
            this._value = null;
        };
        CachingEnablementState.prototype.dispose = function () {
            //
        };
        CachingEnablementState.prototype.value = function () {
            if (this._value === null) {
                this._value = this._computeValue();
            }
            return this._value;
        };
        CachingEnablementState.prototype._computeValue = function () {
            return false;
        };
        return CachingEnablementState;
    }());
    /**
     * An enablement state that checks behaviours of the
     * editor action that can be check inside the action,
     * for instance: widget focus, text focus, readonly-ness
     */
    var InternalEnablementState = (function (_super) {
        __extends(InternalEnablementState, _super);
        function InternalEnablementState(_behaviour, editor) {
            var _this = this;
            _super.call(this);
            this._behaviour = _behaviour;
            this.editor = editor;
            this.hasTextFocus = false;
            this.hasWidgetFocus = false;
            this.isReadOnly = false;
            this._callOnDispose = [];
            if (this._behaviour & Behaviour.TextFocus) {
                this._callOnDispose.push(this.editor.addListener2(editorCommon_1.EventType.EditorTextFocus, function () { return _this._updateTextFocus(true); }));
                this._callOnDispose.push(this.editor.addListener2(editorCommon_1.EventType.EditorTextBlur, function () { return _this._updateTextFocus(false); }));
            }
            if (this._behaviour & Behaviour.WidgetFocus) {
                this._callOnDispose.push(this.editor.addListener2(editorCommon_1.EventType.EditorFocus, function () { return _this._updateWidgetFocus(true); }));
                this._callOnDispose.push(this.editor.addListener2(editorCommon_1.EventType.EditorBlur, function () { return _this._updateWidgetFocus(false); }));
            }
            if (this._behaviour & Behaviour.Writeable) {
                this._callOnDispose.push(this.editor.addListener2(editorCommon_1.EventType.ConfigurationChanged, function (e) { return _this._update(); }));
            }
        }
        InternalEnablementState.prototype._updateTextFocus = function (hasTextFocus) {
            this.hasTextFocus = hasTextFocus;
            this.reset();
        };
        InternalEnablementState.prototype._updateWidgetFocus = function (hasWidgetFocus) {
            this.hasWidgetFocus = hasWidgetFocus;
            this.reset();
        };
        InternalEnablementState.prototype._update = function () {
            this.isReadOnly = this.editor.getConfiguration().readOnly;
            this.reset();
        };
        InternalEnablementState.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            lifecycle_1.dispose(this._callOnDispose);
        };
        InternalEnablementState.prototype._computeValue = function () {
            if (this._behaviour & Behaviour.TextFocus && !this.hasTextFocus) {
                return false;
            }
            if (this._behaviour & Behaviour.WidgetFocus && !this.hasWidgetFocus) {
                return false;
            }
            if (this._behaviour & Behaviour.Writeable && this.isReadOnly) {
                return false;
            }
            return true;
        };
        return InternalEnablementState;
    }(CachingEnablementState));
    /**
     * An enablement state that makes uses of the
     * {{isSupported}} and {{getEnablementState}}
     * functions that are supposed to be overwritten.
     */
    var DescentEnablementState = (function (_super) {
        __extends(DescentEnablementState, _super);
        function DescentEnablementState(behaviour, editor, _action) {
            var _this = this;
            _super.call(this);
            this.editor = editor;
            this._action = _action;
            this._callOnDispose = [];
            if (behaviour & Behaviour.UpdateOnModelChange) {
                this._callOnDispose.push(this.editor.addListener(editorCommon_1.EventType.ModelChanged, function () { return _this.reset(); }));
                this._callOnDispose.push(this.editor.addListener(editorCommon_1.EventType.ModelModeChanged, function () { return _this.reset(); }));
                this._callOnDispose.push(this.editor.addListener(editorCommon_1.EventType.ModelModeSupportChanged, function () { return _this.reset(); }));
            }
            if (behaviour & Behaviour.UpdateOnCursorPositionChange) {
                this._callOnDispose.push(this.editor.addListener(editorCommon_1.EventType.CursorPositionChanged, function () { return _this.reset(); }));
            }
        }
        DescentEnablementState.prototype._computeValue = function () {
            if (!this.editor.getModel()) {
                return false;
            }
            if (!this._action.isSupported()) {
                return false;
            }
            if (!this._action.getEnablementState()) {
                return false;
            }
            return true;
        };
        return DescentEnablementState;
    }(CachingEnablementState));
});
