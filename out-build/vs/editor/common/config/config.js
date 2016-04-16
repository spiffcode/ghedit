define(["require", "exports", 'vs/base/common/keyCodes', 'vs/platform/editor/common/editor', 'vs/platform/keybinding/common/keybindingService', 'vs/platform/keybinding/common/keybindingsRegistry', 'vs/editor/common/editorCommon', 'vs/editor/common/services/codeEditorService'], function (require, exports, keyCodes_1, editor_1, keybindingService_1, keybindingsRegistry_1, editorCommon, codeEditorService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var H = editorCommon.Handler;
    function findFocusedEditor(commandId, accessor, args, complain) {
        var codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
        var editorId = args.context.editorId;
        if (!editorId) {
            if (complain) {
                console.warn('Cannot execute ' + commandId + ' because no editor is focused.');
            }
            return null;
        }
        var editor = codeEditorService.getCodeEditor(editorId);
        if (!editor) {
            if (complain) {
                console.warn('Cannot execute ' + commandId + ' because editor `' + editorId + '` could not be found.');
            }
            return null;
        }
        return editor;
    }
    exports.findFocusedEditor = findFocusedEditor;
    function withCodeEditorFromCommandHandler(commandId, accessor, args, callback) {
        var editor = findFocusedEditor(commandId, accessor, args, true);
        if (editor) {
            callback(editor);
        }
    }
    exports.withCodeEditorFromCommandHandler = withCodeEditorFromCommandHandler;
    function getActiveEditor(accessor) {
        var editorService = accessor.get(editor_1.IEditorService);
        var activeEditor = editorService.getActiveEditor && editorService.getActiveEditor();
        if (activeEditor) {
            var editor = activeEditor.getControl();
            // Substitute for (editor instanceof ICodeEditor)
            if (editor && typeof editor.getEditorType === 'function') {
                var codeEditor = editor;
                return codeEditor;
            }
        }
        return null;
    }
    exports.getActiveEditor = getActiveEditor;
    function triggerEditorHandler(handlerId, accessor, args) {
        withCodeEditorFromCommandHandler(handlerId, accessor, args, function (editor) {
            editor.trigger('keyboard', handlerId, args);
        });
    }
    function registerCoreCommand(handlerId, kb, weight, context) {
        if (weight === void 0) { weight = keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorCore(); }
        var desc = {
            id: handlerId,
            handler: triggerEditorHandler.bind(null, handlerId),
            weight: weight,
            context: (context ? context : keybindingService_1.KbExpr.has(editorCommon.KEYBINDING_CONTEXT_EDITOR_TEXT_FOCUS)),
            primary: kb.primary,
            secondary: kb.secondary,
            win: kb.win,
            mac: kb.mac,
            linux: kb.linux
        };
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandDesc(desc);
    }
    function registerCoreDispatchCommand2(handlerId) {
        var desc = {
            id: handlerId,
            handler: triggerEditorHandler.bind(null, handlerId),
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorCore(),
            context: null,
            primary: 0
        };
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandDesc(desc);
        var desc2 = {
            id: 'default:' + handlerId,
            handler: function (accessor, args) {
                withCodeEditorFromCommandHandler(handlerId, accessor, args, function (editor) {
                    editor.trigger('keyboard', handlerId, args[0]);
                });
            },
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorCore(),
            context: null,
            primary: 0
        };
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandDesc(desc2);
    }
    registerCoreDispatchCommand2(H.Type);
    registerCoreDispatchCommand2(H.ReplacePreviousChar);
    registerCoreDispatchCommand2(H.Paste);
    registerCoreDispatchCommand2(H.Cut);
    function getMacWordNavigationKB(shift, key) {
        // For macs, word navigation is based on the alt modifier
        if (shift) {
            return keyCodes_1.KeyMod.Shift | keyCodes_1.KeyMod.Alt | key;
        }
        else {
            return keyCodes_1.KeyMod.Alt | key;
        }
    }
    function getWordNavigationKB(shift, key) {
        // Normally word navigation is based on the ctrl modifier
        if (shift) {
            return keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | key;
        }
        else {
            return keyCodes_1.KeyMod.CtrlCmd | key;
        }
    }
    // https://support.apple.com/en-gb/HT201236
    // [ADDED] Control-H					Delete the character to the left of the insertion point. Or use Delete.
    // [ADDED] Control-D					Delete the character to the right of the insertion point. Or use Fn-Delete.
    // [ADDED] Control-K					Delete the text between the insertion point and the end of the line or paragraph.
    // [ADDED] Command–Up Arrow				Move the insertion point to the beginning of the document.
    // [ADDED] Command–Down Arrow			Move the insertion point to the end of the document.
    // [ADDED] Command–Left Arrow			Move the insertion point to the beginning of the current line.
    // [ADDED] Command–Right Arrow			Move the insertion point to the end of the current line.
    // [ADDED] Option–Left Arrow			Move the insertion point to the beginning of the previous word.
    // [ADDED] Option–Right Arrow			Move the insertion point to the end of the next word.
    // [ADDED] Command–Shift–Up Arrow		Select the text between the insertion point and the beginning of the document.
    // [ADDED] Command–Shift–Down Arrow		Select the text between the insertion point and the end of the document.
    // [ADDED] Command–Shift–Left Arrow		Select the text between the insertion point and the beginning of the current line.
    // [ADDED] Command–Shift–Right Arrow	Select the text between the insertion point and the end of the current line.
    // [USED BY DUPLICATE LINES] Shift–Option–Up Arrow		Extend text selection to the beginning of the current paragraph, then to the beginning of the following paragraph if pressed again.
    // [USED BY DUPLICATE LINES] Shift–Option–Down Arrow	Extend text selection to the end of the current paragraph, then to the end of the following paragraph if pressed again.
    // [ADDED] Shift–Option–Left Arrow		Extend text selection to the beginning of the current word, then to the beginning of the following word if pressed again.
    // [ADDED] Shift–Option–Right Arrow		Extend text selection to the end of the current word, then to the end of the following word if pressed again.
    // [ADDED] Control-A					Move to the beginning of the line or paragraph.
    // [ADDED] Control-E					Move to the end of a line or paragraph.
    // [ADDED] Control-F					Move one character forward.
    // [ADDED] Control-B					Move one character backward.
    //Control-L								Center the cursor or selection in the visible area.
    // [ADDED] Control-P					Move up one line.
    // [ADDED] Control-N					Move down one line.
    // [ADDED] Control-O					Insert a new line after the insertion point.
    //Control-T								Swap the character behind the insertion point with the character in front of the insertion point.
    // Unconfirmed????
    //	Config.addKeyBinding(editorCommon.Handler.CursorPageDown,		KeyMod.WinCtrl | KeyCode.KEY_V);
    // OS X built in commands
    // Control+y => yank
    // [ADDED] Command+backspace => Delete to Hard BOL
    // [ADDED] Command+delete => Delete to Hard EOL
    // [ADDED] Control+k => Delete to Hard EOL
    // Control+l => show_at_center
    // Control+Command+d => noop
    // Control+Command+shift+d => noop
    registerCoreCommand(H.CursorLeft, {
        primary: keyCodes_1.KeyCode.LeftArrow,
        mac: { primary: keyCodes_1.KeyCode.LeftArrow, secondary: [keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.KEY_B] }
    });
    registerCoreCommand(H.CursorLeftSelect, {
        primary: keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.LeftArrow
    });
    registerCoreCommand(H.CursorRight, {
        primary: keyCodes_1.KeyCode.RightArrow,
        mac: { primary: keyCodes_1.KeyCode.RightArrow, secondary: [keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.KEY_F] }
    });
    registerCoreCommand(H.CursorRightSelect, {
        primary: keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.RightArrow
    });
    registerCoreCommand(H.CursorUp, {
        primary: keyCodes_1.KeyCode.UpArrow,
        mac: { primary: keyCodes_1.KeyCode.UpArrow, secondary: [keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.KEY_P] }
    });
    registerCoreCommand(H.CursorUpSelect, {
        primary: keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.UpArrow,
        secondary: [getWordNavigationKB(true, keyCodes_1.KeyCode.UpArrow)],
        mac: { primary: keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.UpArrow },
        linux: { primary: keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.UpArrow }
    });
    registerCoreCommand(H.CursorDown, {
        primary: keyCodes_1.KeyCode.DownArrow,
        mac: { primary: keyCodes_1.KeyCode.DownArrow, secondary: [keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.KEY_N] }
    });
    registerCoreCommand(H.CursorDownSelect, {
        primary: keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.DownArrow,
        secondary: [getWordNavigationKB(true, keyCodes_1.KeyCode.DownArrow)],
        mac: { primary: keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.DownArrow },
        linux: { primary: keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.DownArrow }
    });
    registerCoreCommand(H.CursorPageUp, {
        primary: keyCodes_1.KeyCode.PageUp
    });
    registerCoreCommand(H.CursorPageUpSelect, {
        primary: keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.PageUp
    });
    registerCoreCommand(H.CursorPageDown, {
        primary: keyCodes_1.KeyCode.PageDown
    });
    registerCoreCommand(H.CursorPageDownSelect, {
        primary: keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.PageDown
    });
    registerCoreCommand(H.CursorHome, {
        primary: keyCodes_1.KeyCode.Home,
        mac: { primary: keyCodes_1.KeyCode.Home, secondary: [keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.LeftArrow, keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.KEY_A] }
    });
    registerCoreCommand(H.CursorHomeSelect, {
        primary: keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.Home,
        mac: { primary: keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.Home, secondary: [keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.LeftArrow] }
    });
    registerCoreCommand(H.CursorEnd, {
        primary: keyCodes_1.KeyCode.End,
        mac: { primary: keyCodes_1.KeyCode.End, secondary: [keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.RightArrow, keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.KEY_E] }
    });
    registerCoreCommand(H.CursorEndSelect, {
        primary: keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.End,
        mac: { primary: keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.End, secondary: [keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.RightArrow] }
    });
    registerCoreCommand(H.ExpandLineSelection, {
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_I
    });
    registerCoreCommand(H.ScrollLineUp, {
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.UpArrow,
        mac: { primary: keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.PageUp }
    });
    registerCoreCommand(H.ScrollLineDown, {
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.DownArrow,
        mac: { primary: keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.PageDown }
    });
    registerCoreCommand(H.ScrollPageUp, {
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.PageUp
    });
    registerCoreCommand(H.ScrollPageDown, {
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.PageDown
    });
    registerCoreCommand(H.CursorColumnSelectLeft, {
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.LeftArrow,
        linux: { primary: 0 }
    });
    registerCoreCommand(H.CursorColumnSelectRight, {
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.RightArrow,
        linux: { primary: 0 }
    });
    registerCoreCommand(H.CursorColumnSelectUp, {
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.UpArrow,
        linux: { primary: 0 }
    });
    registerCoreCommand(H.CursorColumnSelectPageUp, {
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.PageUp,
        linux: { primary: 0 }
    });
    registerCoreCommand(H.CursorColumnSelectDown, {
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.DownArrow,
        linux: { primary: 0 }
    });
    registerCoreCommand(H.CursorColumnSelectPageDown, {
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyMod.Alt | keyCodes_1.KeyCode.PageDown,
        linux: { primary: 0 }
    });
    registerCoreCommand(H.Tab, {
        primary: keyCodes_1.KeyCode.Tab
    }, keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorCore(), keybindingService_1.KbExpr.and(keybindingService_1.KbExpr.has(editorCommon.KEYBINDING_CONTEXT_EDITOR_TEXT_FOCUS), keybindingService_1.KbExpr.not(editorCommon.KEYBINDING_CONTEXT_EDITOR_TAB_MOVES_FOCUS)));
    registerCoreCommand(H.Outdent, {
        primary: keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.Tab
    }, keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorCore(), keybindingService_1.KbExpr.and(keybindingService_1.KbExpr.has(editorCommon.KEYBINDING_CONTEXT_EDITOR_TEXT_FOCUS), keybindingService_1.KbExpr.not(editorCommon.KEYBINDING_CONTEXT_EDITOR_TAB_MOVES_FOCUS)));
    registerCoreCommand(H.DeleteLeft, {
        primary: keyCodes_1.KeyCode.Backspace,
        secondary: [keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.Backspace],
        mac: { primary: keyCodes_1.KeyCode.Backspace, secondary: [keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.Backspace, keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.KEY_H, keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.Backspace] }
    });
    registerCoreCommand(H.DeleteRight, {
        primary: keyCodes_1.KeyCode.Delete,
        mac: { primary: keyCodes_1.KeyCode.Delete, secondary: [keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.KEY_D, keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.Delete] }
    });
    registerCoreCommand(H.DeleteAllLeft, {
        primary: null,
        mac: { primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.Backspace }
    });
    registerCoreCommand(H.DeleteAllRight, {
        primary: null,
        mac: { primary: keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.KEY_K, secondary: [keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.Delete] }
    });
    function registerWordCommand(handlerId, shift, key) {
        registerCoreCommand(handlerId, {
            primary: getWordNavigationKB(shift, key),
            mac: { primary: getMacWordNavigationKB(shift, key) }
        });
    }
    registerWordCommand(H.CursorWordStartLeft, false, keyCodes_1.KeyCode.LeftArrow);
    registerCoreCommand(H.CursorWordEndLeft, { primary: 0 });
    registerCoreCommand(H.CursorWordLeft, { primary: 0 });
    registerWordCommand(H.CursorWordStartLeftSelect, true, keyCodes_1.KeyCode.LeftArrow);
    registerCoreCommand(H.CursorWordEndLeftSelect, { primary: 0 });
    registerCoreCommand(H.CursorWordLeftSelect, { primary: 0 });
    registerWordCommand(H.CursorWordEndRight, false, keyCodes_1.KeyCode.RightArrow);
    registerCoreCommand(H.CursorWordStartRight, { primary: 0 });
    registerCoreCommand(H.CursorWordRight, { primary: 0 });
    registerWordCommand(H.CursorWordEndRightSelect, true, keyCodes_1.KeyCode.RightArrow);
    registerCoreCommand(H.CursorWordStartRightSelect, { primary: 0 });
    registerCoreCommand(H.CursorWordRightSelect, { primary: 0 });
    registerWordCommand(H.DeleteWordLeft, false, keyCodes_1.KeyCode.Backspace);
    registerCoreCommand(H.DeleteWordStartLeft, { primary: 0 });
    registerCoreCommand(H.DeleteWordEndLeft, { primary: 0 });
    registerWordCommand(H.DeleteWordRight, false, keyCodes_1.KeyCode.Delete);
    registerCoreCommand(H.DeleteWordStartRight, { primary: 0 });
    registerCoreCommand(H.DeleteWordEndRight, { primary: 0 });
    registerCoreCommand(H.CancelSelection, {
        primary: keyCodes_1.KeyCode.Escape,
        secondary: [keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.Escape]
    }, keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorCore(), keybindingService_1.KbExpr.and(keybindingService_1.KbExpr.has(editorCommon.KEYBINDING_CONTEXT_EDITOR_TEXT_FOCUS), keybindingService_1.KbExpr.has(editorCommon.KEYBINDING_CONTEXT_EDITOR_HAS_NON_EMPTY_SELECTION)));
    registerCoreCommand(H.RemoveSecondaryCursors, {
        primary: keyCodes_1.KeyCode.Escape,
        secondary: [keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.Escape]
    }, keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorCore(1), keybindingService_1.KbExpr.and(keybindingService_1.KbExpr.has(editorCommon.KEYBINDING_CONTEXT_EDITOR_TEXT_FOCUS), keybindingService_1.KbExpr.has(editorCommon.KEYBINDING_CONTEXT_EDITOR_HAS_MULTIPLE_SELECTIONS)));
    registerCoreCommand(H.CursorTop, {
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.Home,
        mac: { primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.UpArrow }
    });
    registerCoreCommand(H.CursorTopSelect, {
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.Home,
        mac: { primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.UpArrow }
    });
    registerCoreCommand(H.CursorBottom, {
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.End,
        mac: { primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.DownArrow }
    });
    registerCoreCommand(H.CursorBottomSelect, {
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.End,
        mac: { primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.DownArrow }
    });
    registerCoreCommand(H.LineBreakInsert, {
        primary: null,
        mac: { primary: keyCodes_1.KeyMod.WinCtrl | keyCodes_1.KeyCode.KEY_O }
    });
    registerCoreCommand(H.Undo, {
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_Z
    });
    registerCoreCommand(H.CursorUndo, {
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_U
    });
    registerCoreCommand(H.Redo, {
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_Y,
        secondary: [keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.KEY_Z],
        mac: { primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyMod.Shift | keyCodes_1.KeyCode.KEY_Z }
    });
    function selectAll(accessor, args) {
        var HANDLER = editorCommon.Handler.SelectAll;
        // If editor text focus
        if (args.context[editorCommon.KEYBINDING_CONTEXT_EDITOR_TEXT_FOCUS]) {
            var focusedEditor = findFocusedEditor(HANDLER, accessor, args, false);
            if (focusedEditor) {
                focusedEditor.trigger('keyboard', HANDLER, args);
                return;
            }
        }
        // Ignore this action when user is focussed on an element that allows for entering text
        var activeElement = document.activeElement;
        if (activeElement && ['input', 'textarea'].indexOf(activeElement.tagName.toLowerCase()) >= 0) {
            activeElement.select();
            return;
        }
        // Redirecting to last active editor
        var activeEditor = getActiveEditor(accessor);
        if (activeEditor) {
            activeEditor.trigger('keyboard', HANDLER, args);
            return;
        }
    }
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandDesc({
        id: 'editor.action.selectAll',
        handler: selectAll,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorCore(),
        context: null,
        primary: keyCodes_1.KeyMod.CtrlCmd | keyCodes_1.KeyCode.KEY_A
    });
});
