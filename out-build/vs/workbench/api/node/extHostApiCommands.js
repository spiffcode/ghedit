define(["require", "exports", 'vs/base/common/uri', 'vs/base/common/winjs.base', 'vs/workbench/api/node/extHostTypeConverters', 'vs/workbench/api/node/extHostTypes', 'vs/workbench/api/node/extHostCommands'], function (require, exports, uri_1, winjs_base_1, typeConverters, types, extHostCommands_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function registerApiCommands(threadService) {
        var commands = threadService.getRemotable(extHostCommands_1.ExtHostCommands);
        new ExtHostApiCommands(commands).registerCommands();
    }
    exports.registerApiCommands = registerApiCommands;
    var ExtHostApiCommands = (function () {
        function ExtHostApiCommands(commands) {
            this._disposables = [];
            this._commands = commands;
        }
        ExtHostApiCommands.prototype.registerCommands = function () {
            var _this = this;
            this._register('vscode.executeWorkspaceSymbolProvider', this._executeWorkspaceSymbolProvider, {
                description: 'Execute all workspace symbol provider.',
                args: [{ name: 'query', description: 'Search string', constraint: String }],
                returns: 'A promise that resolves to an array of SymbolInformation-instances.'
            });
            this._register('vscode.executeDefinitionProvider', this._executeDefinitionProvider, {
                description: 'Execute all definition provider.',
                args: [
                    { name: 'uri', description: 'Uri of a text document', constraint: uri_1.default },
                    { name: 'position', description: 'Position of a symbol', constraint: types.Position }
                ],
                returns: 'A promise that resolves to an array of Location-instances.'
            });
            this._register('vscode.executeHoverProvider', this._executeHoverProvider, {
                description: 'Execute all hover provider.',
                args: [
                    { name: 'uri', description: 'Uri of a text document', constraint: uri_1.default },
                    { name: 'position', description: 'Position of a symbol', constraint: types.Position }
                ],
                returns: 'A promise that resolves to an array of Hover-instances.'
            });
            this._register('vscode.executeDocumentHighlights', this._executeDocumentHighlights, {
                description: 'Execute document highlight provider.',
                args: [
                    { name: 'uri', description: 'Uri of a text document', constraint: uri_1.default },
                    { name: 'position', description: 'Position in a text document', constraint: types.Position }
                ],
                returns: 'A promise that resolves to an array of DocumentHighlight-instances.'
            });
            this._register('vscode.executeReferenceProvider', this._executeReferenceProvider, {
                description: 'Execute reference provider.',
                args: [
                    { name: 'uri', description: 'Uri of a text document', constraint: uri_1.default },
                    { name: 'position', description: 'Position in a text document', constraint: types.Position }
                ],
                returns: 'A promise that resolves to an array of Location-instances.'
            });
            this._register('vscode.executeDocumentRenameProvider', this._executeDocumentRenameProvider, {
                description: 'Execute rename provider.',
                args: [
                    { name: 'uri', description: 'Uri of a text document', constraint: uri_1.default },
                    { name: 'position', description: 'Position in a text document', constraint: types.Position },
                    { name: 'newName', description: 'The new symbol name', constraint: String }
                ],
                returns: 'A promise that resolves to a WorkspaceEdit.'
            });
            this._register('vscode.executeSignatureHelpProvider', this._executeSignatureHelpProvider, {
                description: 'Execute signature help provider.',
                args: [
                    { name: 'uri', description: 'Uri of a text document', constraint: uri_1.default },
                    { name: 'position', description: 'Position in a text document', constraint: types.Position },
                    { name: 'triggerCharacter', description: '(optional) Trigger signature help when the user types the character, like `,` or `(`', constraint: function (value) { return value === void 0 || typeof value === 'string'; } }
                ],
                returns: 'A promise that resolves to SignatureHelp.'
            });
            this._register('vscode.executeDocumentSymbolProvider', this._executeDocumentSymbolProvider, {
                description: 'Execute document symbol provider.',
                args: [
                    { name: 'uri', description: 'Uri of a text document', constraint: uri_1.default }
                ],
                returns: 'A promise that resolves to an array of SymbolInformation-instances.'
            });
            this._register('vscode.executeCompletionItemProvider', this._executeCompletionItemProvider, {
                description: 'Execute completion item provider.',
                args: [
                    { name: 'uri', description: 'Uri of a text document', constraint: uri_1.default },
                    { name: 'position', description: 'Position in a text document', constraint: types.Position },
                    { name: 'triggerCharacter', description: '(optional) Trigger completion when the user types the character, like `,` or `(`', constraint: function (value) { return value === void 0 || typeof value === 'string'; } }
                ],
                returns: 'A promise that resolves to a CompletionList-instance.'
            });
            this._register('vscode.executeCodeActionProvider', this._executeCodeActionProvider, {
                description: 'Execute code action provider.',
                args: [
                    { name: 'uri', description: 'Uri of a text document', constraint: uri_1.default },
                    { name: 'range', description: 'Range in a text document', constraint: types.Range }
                ],
                returns: 'A promise that resolves to an array of Command-instances.'
            });
            this._register('vscode.executeCodeLensProvider', this._executeCodeLensProvider, {
                description: 'Execute completion item provider.',
                args: [
                    { name: 'uri', description: 'Uri of a text document', constraint: uri_1.default }
                ],
                returns: 'A promise that resolves to an array of CodeLens-instances.'
            });
            this._register('vscode.executeFormatDocumentProvider', this._executeFormatDocumentProvider, {
                description: 'Execute document format provider.',
                args: [
                    { name: 'uri', description: 'Uri of a text document', constraint: uri_1.default },
                    { name: 'options', description: 'Formatting options' }
                ],
                returns: 'A promise that resolves to an array of TextEdits.'
            });
            this._register('vscode.executeFormatRangeProvider', this._executeFormatRangeProvider, {
                description: 'Execute range format provider.',
                args: [
                    { name: 'uri', description: 'Uri of a text document', constraint: uri_1.default },
                    { name: 'range', description: 'Range in a text document', constraint: types.Range },
                    { name: 'options', description: 'Formatting options' }
                ],
                returns: 'A promise that resolves to an array of TextEdits.'
            });
            this._register('vscode.executeFormatOnTypeProvider', this._executeFormatOnTypeProvider, {
                description: 'Execute document format provider.',
                args: [
                    { name: 'uri', description: 'Uri of a text document', constraint: uri_1.default },
                    { name: 'position', description: 'Position in a text document', constraint: types.Position },
                    { name: 'ch', description: 'Character that got typed', constraint: String },
                    { name: 'options', description: 'Formatting options' }
                ],
                returns: 'A promise that resolves to an array of TextEdits.'
            });
            this._register('vscode.previewHtml', function (uri, position) {
                return _this._commands.executeCommand('_workbench.previewHtml', uri, typeof position === 'number' ? typeConverters.fromViewColumn(position) : void 0);
            }, {
                description: "\n\t\t\t\t\tRender the html of the resource in an editor view.\n\n\t\t\t\t\tLinks contained in the document will be handled by VS Code whereby it supports file-resources and virtual resources\n\t\t\t\t\tas well as triggering commands using the 'command'-scheme.\n\t\t\t\t",
                args: [
                    { name: 'uri', description: 'Uri of the resource to preview.', constraint: function (value) { return value instanceof uri_1.default || typeof value === 'string'; } },
                    { name: 'column', description: '(optional) Column in which to preview.' },
                ]
            });
            this._register('vscode.openFolder', function (uri, newWindow) {
                if (!uri) {
                    return _this._commands.executeCommand('_workbench.ipc', 'vscode:openFolderPicker', [newWindow]);
                }
                return _this._commands.executeCommand('_workbench.ipc', 'vscode:windowOpen', [[uri.fsPath], newWindow]);
            }, {
                description: 'Open a folder in the current window or new window depending on the newWindow argument. Note that opening in the same window will shutdown the current extension host process and start a new one on the given folder unless the newWindow parameter is set to true.',
                args: [
                    { name: 'uri', description: '(optional) Uri of the folder to open. If not provided, a native dialog will ask the user for the folder', constraint: function (value) { return value === void 0 || value instanceof uri_1.default; } },
                    { name: 'newWindow', description: '(optional) Wether to open the folder in a new window or the same. Defaults to opening in the same window.', constraint: function (value) { return value === void 0 || typeof value === 'boolean'; } }
                ]
            });
        };
        // --- command impl
        ExtHostApiCommands.prototype._register = function (id, handler, description) {
            var disposable = this._commands.registerCommand(id, handler, this, description);
            this._disposables.push(disposable);
        };
        /**
         * Execute workspace symbol provider.
         *
         * @param query Search string to match query symbol names
         * @return A promise that resolves to an array of symbol information.
         */
        ExtHostApiCommands.prototype._executeWorkspaceSymbolProvider = function (query) {
            return this._commands.executeCommand('_executeWorkspaceSymbolProvider', { query: query }).then(function (value) {
                if (Array.isArray(value)) {
                    return value.map(typeConverters.toSymbolInformation);
                }
            });
        };
        ExtHostApiCommands.prototype._executeDefinitionProvider = function (resource, position) {
            var args = {
                resource: resource,
                position: position && typeConverters.fromPosition(position)
            };
            return this._commands.executeCommand('_executeDefinitionProvider', args).then(function (value) {
                if (Array.isArray(value)) {
                    return value.map(typeConverters.location.to);
                }
            });
        };
        ExtHostApiCommands.prototype._executeHoverProvider = function (resource, position) {
            var args = {
                resource: resource,
                position: position && typeConverters.fromPosition(position)
            };
            return this._commands.executeCommand('_executeHoverProvider', args).then(function (value) {
                if (Array.isArray(value)) {
                    return value.map(typeConverters.toHover);
                }
            });
        };
        ExtHostApiCommands.prototype._executeDocumentHighlights = function (resource, position) {
            var args = {
                resource: resource,
                position: position && typeConverters.fromPosition(position)
            };
            return this._commands.executeCommand('_executeDocumentHighlights', args).then(function (value) {
                if (Array.isArray(value)) {
                    return value.map(typeConverters.toDocumentHighlight);
                }
            });
        };
        ExtHostApiCommands.prototype._executeReferenceProvider = function (resource, position) {
            var args = {
                resource: resource,
                position: position && typeConverters.fromPosition(position)
            };
            return this._commands.executeCommand('_executeDocumentHighlights', args).then(function (value) {
                if (Array.isArray(value)) {
                    return value.map(typeConverters.location.to);
                }
            });
        };
        ExtHostApiCommands.prototype._executeDocumentRenameProvider = function (resource, position, newName) {
            var args = {
                resource: resource,
                position: position && typeConverters.fromPosition(position),
                newName: newName
            };
            return this._commands.executeCommand('_executeDocumentRenameProvider', args).then(function (value) {
                if (!value) {
                    return;
                }
                if (value.rejectReason) {
                    return winjs_base_1.TPromise.wrapError(value.rejectReason);
                }
                var workspaceEdit = new types.WorkspaceEdit();
                for (var _i = 0, _a = value.edits; _i < _a.length; _i++) {
                    var edit = _a[_i];
                    workspaceEdit.replace(edit.resource, typeConverters.toRange(edit.range), edit.newText);
                }
                return workspaceEdit;
            });
        };
        ExtHostApiCommands.prototype._executeSignatureHelpProvider = function (resource, position, triggerCharacter) {
            var args = {
                resource: resource,
                position: position && typeConverters.fromPosition(position),
                triggerCharacter: triggerCharacter
            };
            return this._commands.executeCommand('_executeSignatureHelpProvider', args).then(function (value) {
                if (value) {
                    return typeConverters.SignatureHelp.to(value);
                }
            });
        };
        ExtHostApiCommands.prototype._executeCompletionItemProvider = function (resource, position, triggerCharacter) {
            var args = {
                resource: resource,
                position: position && typeConverters.fromPosition(position),
                triggerCharacter: triggerCharacter
            };
            return this._commands.executeCommand('_executeCompletionItemProvider', args).then(function (value) {
                if (value) {
                    var items = [];
                    var incomplete = void 0;
                    for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
                        var suggestions = value_1[_i];
                        incomplete = suggestions.incomplete || incomplete;
                        for (var _a = 0, _b = suggestions.suggestions; _a < _b.length; _a++) {
                            var suggestion = _b[_a];
                            var item = typeConverters.Suggest.to(suggestions, position, suggestion);
                            items.push(item);
                        }
                    }
                    return new types.CompletionList(items, incomplete);
                }
            });
        };
        ExtHostApiCommands.prototype._executeDocumentSymbolProvider = function (resource) {
            var args = {
                resource: resource
            };
            return this._commands.executeCommand('_executeDocumentSymbolProvider', args).then(function (value) {
                if (value && Array.isArray(value.entries)) {
                    return value.entries.map(typeConverters.SymbolInformation.fromOutlineEntry);
                }
            });
        };
        ExtHostApiCommands.prototype._executeCodeActionProvider = function (resource, range) {
            var args = {
                resource: resource,
                range: typeConverters.fromRange(range)
            };
            return this._commands.executeCommand('_executeCodeActionProvider', args).then(function (value) {
                if (!Array.isArray(value)) {
                    return;
                }
                return value.map(function (quickFix) { return typeConverters.Command.to(quickFix.command); });
            });
        };
        ExtHostApiCommands.prototype._executeCodeLensProvider = function (resource) {
            var args = { resource: resource };
            return this._commands.executeCommand('_executeCodeLensProvider', args).then(function (value) {
                if (Array.isArray(value)) {
                    return value.map(function (item) {
                        return new types.CodeLens(typeConverters.toRange(item.symbol.range), typeConverters.Command.to(item.symbol.command));
                    });
                }
            });
        };
        ExtHostApiCommands.prototype._executeFormatDocumentProvider = function (resource, options) {
            var args = {
                resource: resource,
                options: options
            };
            return this._commands.executeCommand('_executeFormatDocumentProvider', args).then(function (value) {
                if (Array.isArray(value)) {
                    return value.map(function (edit) { return new types.TextEdit(typeConverters.toRange(edit.range), edit.text); });
                }
            });
        };
        ExtHostApiCommands.prototype._executeFormatRangeProvider = function (resource, range, options) {
            var args = {
                resource: resource,
                range: typeConverters.fromRange(range),
                options: options
            };
            return this._commands.executeCommand('_executeFormatRangeProvider', args).then(function (value) {
                if (Array.isArray(value)) {
                    return value.map(function (edit) { return new types.TextEdit(typeConverters.toRange(edit.range), edit.text); });
                }
            });
        };
        ExtHostApiCommands.prototype._executeFormatOnTypeProvider = function (resource, position, ch, options) {
            var args = {
                resource: resource,
                position: typeConverters.fromPosition(position),
                ch: ch,
                options: options
            };
            return this._commands.executeCommand('_executeFormatOnTypeProvider', args).then(function (value) {
                if (Array.isArray(value)) {
                    return value.map(function (edit) { return new types.TextEdit(typeConverters.toRange(edit.range), edit.text); });
                }
            });
        };
        return ExtHostApiCommands;
    }());
});
//# sourceMappingURL=extHostApiCommands.js.map