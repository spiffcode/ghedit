define(["require", "exports", 'vs/editor/common/editorCommon', 'vs/editor/browser/editorBrowser', 'vs/editor/browser/standalone/colorizer', 'vs/editor/browser/standalone/standaloneCodeEditor', 'vs/editor/common/model/tokensBinaryEncoding', 'vs/editor/standalone-languages/all', './standaloneSchemas', 'vs/css!./media/standalone-tokens'], function (require, exports, editorCommon, editorBrowser_1, colorizer_1, standaloneCodeEditor, TokensBinaryEncoding) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var global = self;
    if (!global.Monaco) {
        global.Monaco = {};
    }
    var Monaco = global.Monaco;
    if (!Monaco.Editor) {
        Monaco.Editor = {};
    }
    Monaco.Editor.setupServices = standaloneCodeEditor.setupServices;
    Monaco.Editor.create = standaloneCodeEditor.create;
    Monaco.Editor.createModel = standaloneCodeEditor.createModel;
    Monaco.Editor.createDiffEditor = standaloneCodeEditor.createDiffEditor;
    Monaco.Editor.configureMode = standaloneCodeEditor.configureMode;
    Monaco.Editor.getOrCreateMode = standaloneCodeEditor.getOrCreateMode;
    Monaco.Editor.createCustomMode = standaloneCodeEditor.createCustomMode;
    Monaco.Editor.colorize = standaloneCodeEditor.colorize;
    Monaco.Editor.colorizeElement = standaloneCodeEditor.colorizeElement;
    Monaco.Editor.colorizeLine = colorizer_1.Colorizer.colorizeLine;
    Monaco.Editor.colorizeModelLine = colorizer_1.Colorizer.colorizeModelLine;
    // -- export common constants
    Monaco.Editor.SelectionDirection = editorCommon.SelectionDirection;
    Monaco.Editor.WrappingIndent = editorCommon.WrappingIndent;
    Monaco.Editor.wrappingIndentFromString = editorCommon.wrappingIndentFromString;
    Monaco.Editor.OverviewRulerLane = editorCommon.OverviewRulerLane;
    Monaco.Editor.EndOfLinePreference = editorCommon.EndOfLinePreference;
    Monaco.Editor.EndOfLineSequence = editorCommon.EndOfLineSequence;
    Monaco.Editor.LineTokensBinaryEncoding = TokensBinaryEncoding;
    Monaco.Editor.TrackedRangeStickiness = editorCommon.TrackedRangeStickiness;
    Monaco.Editor.VerticalRevealType = editorCommon.VerticalRevealType;
    Monaco.Editor.MouseTargetType = editorCommon.MouseTargetType;
    Monaco.Editor.KEYBINDING_CONTEXT_EDITOR_TEXT_FOCUS = editorCommon.KEYBINDING_CONTEXT_EDITOR_TEXT_FOCUS;
    Monaco.Editor.KEYBINDING_CONTEXT_EDITOR_FOCUS = editorCommon.KEYBINDING_CONTEXT_EDITOR_FOCUS;
    Monaco.Editor.KEYBINDING_CONTEXT_EDITOR_TAB_MOVES_FOCUS = editorCommon.KEYBINDING_CONTEXT_EDITOR_TAB_MOVES_FOCUS;
    Monaco.Editor.KEYBINDING_CONTEXT_EDITOR_HAS_MULTIPLE_SELECTIONS = editorCommon.KEYBINDING_CONTEXT_EDITOR_HAS_MULTIPLE_SELECTIONS;
    Monaco.Editor.KEYBINDING_CONTEXT_EDITOR_HAS_NON_EMPTY_SELECTION = editorCommon.KEYBINDING_CONTEXT_EDITOR_HAS_NON_EMPTY_SELECTION;
    Monaco.Editor.KEYBINDING_CONTEXT_EDITOR_LANGUAGE_ID = editorCommon.KEYBINDING_CONTEXT_EDITOR_LANGUAGE_ID;
    Monaco.Editor.ViewEventNames = editorCommon.ViewEventNames;
    Monaco.Editor.CodeEditorStateFlag = editorCommon.CodeEditorStateFlag;
    Monaco.Editor.EditorType = editorCommon.EditorType;
    Monaco.Editor.ClassName = editorCommon.ClassName;
    Monaco.Editor.EventType = editorCommon.EventType;
    Monaco.Editor.Handler = editorCommon.Handler;
    // -- export browser constants
    Monaco.Editor.ClassNames = editorBrowser_1.ClassNames;
    Monaco.Editor.ContentWidgetPositionPreference = editorBrowser_1.ContentWidgetPositionPreference;
    Monaco.Editor.OverlayWidgetPositionPreference = editorBrowser_1.OverlayWidgetPositionPreference;
    // Register all built-in standalone languages
    var MonacoEditorLanguages = this.MonacoEditorLanguages || [];
    MonacoEditorLanguages.forEach(function (language) {
        standaloneCodeEditor.registerMonarchStandaloneLanguage(language, language.defModule);
    });
    // Register all built-in standalone JSON schemas
    var MonacoEditorSchemas = this.MonacoEditorSchemas || {};
    for (var uri in MonacoEditorSchemas) {
        standaloneCodeEditor.registerStandaloneSchema(uri, MonacoEditorSchemas[uri]);
    }
    if (!Monaco.Languages) {
        Monaco.Languages = {};
    }
    Monaco.Languages.register = standaloneCodeEditor.registerStandaloneLanguage;
});
//# sourceMappingURL=standaloneEditor.js.map