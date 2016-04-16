/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'vs/base/common/errors', 'vs/base/common/uri', 'vs/base/common/winjs.base', 'vs/workbench/api/node/extHostTypes', 'vs/editor/common/editorCommon', 'vs/editor/common/model/model', './testThreadService', 'vs/platform/instantiation/common/instantiationService', 'vs/platform/markers/common/markerService', 'vs/platform/markers/common/markers', 'vs/platform/thread/common/thread', 'vs/platform/keybinding/common/keybindingService', 'vs/platform/keybinding/common/keybindingsRegistry', 'vs/editor/common/services/modelService', 'vs/workbench/api/node/extHostLanguageFeatures', 'vs/workbench/api/node/extHostApiCommands', 'vs/workbench/api/node/extHostCommands', 'vs/workbench/api/node/extHostDocuments'], function (require, exports, assert, errors_1, uri_1, winjs_base_1, types, EditorCommon, model_1, testThreadService_1, instantiationService_1, markerService_1, markers_1, thread_1, keybindingService_1, keybindingsRegistry_1, modelService_1, extHostLanguageFeatures_1, extHostApiCommands_1, extHostCommands_1, extHostDocuments_1) {
    'use strict';
    var defaultSelector = { scheme: 'far' };
    var model = new model_1.Model([
        'This is the first line',
        'This is the second line',
        'This is the third line',
    ].join('\n'), model_1.Model.DEFAULT_CREATION_OPTIONS, undefined, uri_1.default.parse('far://testing/file.b'));
    var threadService;
    var extHost;
    var mainThread;
    var commands;
    var disposables = [];
    var originalErrorHandler;
    suite('ExtHostLanguageFeatureCommands', function () {
        suiteSetup(function (done) {
            originalErrorHandler = errors_1.errorHandler.getUnexpectedErrorHandler();
            errors_1.setUnexpectedErrorHandler(function () { });
            var instantiationService = instantiationService_1.createInstantiationService();
            threadService = new testThreadService_1.TestThreadService(instantiationService);
            instantiationService.addSingleton(keybindingService_1.IKeybindingService, {
                executeCommand: function (id, args) {
                    var handler = keybindingsRegistry_1.KeybindingsRegistry.getCommands()[id];
                    return winjs_base_1.TPromise.as(instantiationService.invokeFunction(handler, args));
                }
            });
            instantiationService.addSingleton(markers_1.IMarkerService, new markerService_1.MainProcessMarkerService(threadService));
            instantiationService.addSingleton(thread_1.IThreadService, threadService);
            instantiationService.addSingleton(modelService_1.IModelService, {
                serviceId: modelService_1.IModelService,
                getModel: function () { return model; },
                createModel: function () { throw new Error(); },
                destroyModel: function () { throw new Error(); },
                getModels: function () { throw new Error(); },
                onModelAdded: undefined,
                onModelModeChanged: undefined,
                onModelRemoved: undefined,
                getCreationOptions: function () { throw new Error(); }
            });
            threadService.getRemotable(extHostDocuments_1.ExtHostModelService)._acceptModelAdd({
                isDirty: false,
                versionId: model.getVersionId(),
                modeId: model.getModeId(),
                url: model.getAssociatedResource(),
                value: {
                    EOL: model.getEOL(),
                    lines: model.getValue().split(model.getEOL()),
                    BOM: '',
                    length: -1,
                    options: {
                        tabSize: 4,
                        insertSpaces: true,
                        defaultEOL: EditorCommon.DefaultEndOfLine.LF
                    }
                },
            });
            threadService.getRemotable(extHostCommands_1.MainThreadCommands);
            commands = threadService.getRemotable(extHostCommands_1.ExtHostCommands);
            extHostApiCommands_1.registerApiCommands(threadService);
            mainThread = threadService.getRemotable(extHostLanguageFeatures_1.MainThreadLanguageFeatures);
            extHost = threadService.getRemotable(extHostLanguageFeatures_1.ExtHostLanguageFeatures);
            threadService.sync().then(done, done);
        });
        suiteTeardown(function () {
            errors_1.setUnexpectedErrorHandler(originalErrorHandler);
            model.dispose();
        });
        teardown(function (done) {
            while (disposables.length) {
                disposables.pop().dispose();
            }
            threadService.sync()
                .then(function () { return done(); }, function (err) { return done(err); });
        });
        // --- workspace symbols
        test('WorkspaceSymbols, invalid arguments', function (done) {
            var promises = [
                commands.executeCommand('vscode.executeWorkspaceSymbolProvider'),
                commands.executeCommand('vscode.executeWorkspaceSymbolProvider', null),
                commands.executeCommand('vscode.executeWorkspaceSymbolProvider', undefined),
                commands.executeCommand('vscode.executeWorkspaceSymbolProvider', true)
            ];
            // threadService.sync().then(() => {
            winjs_base_1.TPromise.join(promises).then(undefined, function (err) {
                assert.equal(err.length, 4);
                done();
                return [];
            });
            // });
        });
        test('WorkspaceSymbols, back and forth', function (done) {
            disposables.push(extHost.registerWorkspaceSymbolProvider({
                provideWorkspaceSymbols: function (query) {
                    return [
                        new types.SymbolInformation(query, types.SymbolKind.Array, new types.Range(0, 0, 1, 1), uri_1.default.parse('far://testing/first')),
                        new types.SymbolInformation(query, types.SymbolKind.Array, new types.Range(0, 0, 1, 1), uri_1.default.parse('far://testing/second'))
                    ];
                }
            }));
            disposables.push(extHost.registerWorkspaceSymbolProvider({
                provideWorkspaceSymbols: function (query) {
                    return [
                        new types.SymbolInformation(query, types.SymbolKind.Array, new types.Range(0, 0, 1, 1), uri_1.default.parse('far://testing/first'))
                    ];
                }
            }));
            threadService.sync().then(function () {
                commands.executeCommand('vscode.executeWorkspaceSymbolProvider', 'testing').then(function (value) {
                    for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
                        var info = value_1[_i];
                        assert.ok(info instanceof types.SymbolInformation);
                        assert.equal(info.name, 'testing');
                        assert.equal(info.kind, types.SymbolKind.Array);
                    }
                    assert.equal(value.length, 3);
                    done();
                }, done);
            }, done);
        });
        // --- definition
        test('Definition, invalid arguments', function (done) {
            var promises = [
                commands.executeCommand('vscode.executeDefinitionProvider'),
                commands.executeCommand('vscode.executeDefinitionProvider', null),
                commands.executeCommand('vscode.executeDefinitionProvider', undefined),
                commands.executeCommand('vscode.executeDefinitionProvider', true, false)
            ];
            // threadService.sync().then(() => {
            winjs_base_1.TPromise.join(promises).then(undefined, function (err) {
                assert.equal(err.length, 4);
                done();
                return [];
            });
            // });
        });
        test('Definition, back and forth', function (done) {
            disposables.push(extHost.registerDefinitionProvider(defaultSelector, {
                provideDefinition: function (doc) {
                    return new types.Location(doc.uri, new types.Range(0, 0, 0, 0));
                }
            }));
            disposables.push(extHost.registerDefinitionProvider(defaultSelector, {
                provideDefinition: function (doc) {
                    return [
                        new types.Location(doc.uri, new types.Range(0, 0, 0, 0)),
                        new types.Location(doc.uri, new types.Range(0, 0, 0, 0)),
                        new types.Location(doc.uri, new types.Range(0, 0, 0, 0)),
                    ];
                }
            }));
            threadService.sync().then(function () {
                commands.executeCommand('vscode.executeDefinitionProvider', model.getAssociatedResource(), new types.Position(0, 0)).then(function (values) {
                    assert.equal(values.length, 4);
                    done();
                }, done);
            }, done);
        });
        // --- outline
        test('Outline, back and forth', function (done) {
            disposables.push(extHost.registerDocumentSymbolProvider(defaultSelector, {
                provideDocumentSymbols: function () {
                    return [
                        new types.SymbolInformation('testing1', types.SymbolKind.Enum, new types.Range(1, 0, 1, 0)),
                        new types.SymbolInformation('testing2', types.SymbolKind.Enum, new types.Range(0, 1, 0, 3)),
                    ];
                }
            }));
            threadService.sync().then(function () {
                commands.executeCommand('vscode.executeDocumentSymbolProvider', model.getAssociatedResource()).then(function (values) {
                    assert.equal(values.length, 2);
                    var first = values[0], second = values[1];
                    assert.equal(first.name, 'testing2');
                    assert.equal(second.name, 'testing1');
                    done();
                }, done);
            }, done);
        });
        // --- suggest
        test('Suggest, back and forth', function (done) {
            disposables.push(extHost.registerCompletionItemProvider(defaultSelector, {
                provideCompletionItems: function (doc, pos) {
                    var a = new types.CompletionItem('item1');
                    var b = new types.CompletionItem('item2');
                    b.textEdit = types.TextEdit.replace(new types.Range(0, 4, 0, 8), 'foo'); // overwite after
                    var c = new types.CompletionItem('item3');
                    c.textEdit = types.TextEdit.replace(new types.Range(0, 1, 0, 6), 'foobar'); // overwite before & after
                    var d = new types.CompletionItem('item4');
                    d.textEdit = types.TextEdit.replace(new types.Range(0, 1, 0, 4), ''); // overwite before
                    return [a, b, c, d];
                }
            }, []));
            threadService.sync().then(function () {
                commands.executeCommand('vscode.executeCompletionItemProvider', model.getAssociatedResource(), new types.Position(0, 4)).then(function (list) {
                    try {
                        assert.ok(list instanceof types.CompletionList);
                        var values = list.items;
                        assert.ok(Array.isArray(values));
                        assert.equal(values.length, 4);
                        var first = values[0], second = values[1], third = values[2], forth = values[3];
                        assert.equal(first.label, 'item1');
                        assert.equal(first.textEdit.newText, 'item1');
                        assert.equal(first.textEdit.range.start.line, 0);
                        assert.equal(first.textEdit.range.start.character, 0);
                        assert.equal(first.textEdit.range.end.line, 0);
                        assert.equal(first.textEdit.range.end.character, 4);
                        assert.equal(second.label, 'item2');
                        assert.equal(second.textEdit.newText, 'foo');
                        assert.equal(second.textEdit.range.start.line, 0);
                        assert.equal(second.textEdit.range.start.character, 4);
                        assert.equal(second.textEdit.range.end.line, 0);
                        assert.equal(second.textEdit.range.end.character, 8);
                        assert.equal(third.label, 'item3');
                        assert.equal(third.textEdit.newText, 'foobar');
                        assert.equal(third.textEdit.range.start.line, 0);
                        assert.equal(third.textEdit.range.start.character, 1);
                        assert.equal(third.textEdit.range.end.line, 0);
                        assert.equal(third.textEdit.range.end.character, 6);
                        assert.equal(forth.label, 'item4');
                        assert.equal(forth.textEdit.newText, '');
                        assert.equal(forth.textEdit.range.start.line, 0);
                        assert.equal(forth.textEdit.range.start.character, 1);
                        assert.equal(forth.textEdit.range.end.line, 0);
                        assert.equal(forth.textEdit.range.end.character, 4);
                        done();
                    }
                    catch (e) {
                        done(e);
                    }
                }, done);
            }, done);
        });
        test('Suggest, return CompletionList !array', function (done) {
            disposables.push(extHost.registerCompletionItemProvider(defaultSelector, {
                provideCompletionItems: function () {
                    var a = new types.CompletionItem('item1');
                    var b = new types.CompletionItem('item2');
                    return new types.CompletionList([a, b], true);
                }
            }, []));
            threadService.sync().then(function () {
                return commands.executeCommand('vscode.executeCompletionItemProvider', model.getAssociatedResource(), new types.Position(0, 4)).then(function (list) {
                    assert.ok(list instanceof types.CompletionList);
                    assert.equal(list.isIncomplete, true);
                    done();
                });
            });
        });
        // --- quickfix
        test('QuickFix, back and forth', function (done) {
            disposables.push(extHost.registerCodeActionProvider(defaultSelector, {
                provideCodeActions: function () {
                    return [{ command: 'testing', title: 'Title', arguments: [1, 2, true] }];
                }
            }));
            threadService.sync().then(function () {
                commands.executeCommand('vscode.executeCodeActionProvider', model.getAssociatedResource(), new types.Range(0, 0, 1, 1)).then(function (value) {
                    assert.equal(value.length, 1);
                    var first = value[0];
                    assert.equal(first.title, 'Title');
                    assert.equal(first.command, 'testing');
                    assert.deepEqual(first.arguments, [1, 2, true]);
                    done();
                }, done);
            });
        });
        // --- code lens
        test('CodeLens, back and forth', function (done) {
            var complexArg = {
                foo: function () { },
                bar: function () { },
                big: extHost
            };
            disposables.push(extHost.registerCodeLensProvider(defaultSelector, {
                provideCodeLenses: function () {
                    return [new types.CodeLens(new types.Range(0, 0, 1, 1), { title: 'Title', command: 'cmd', arguments: [1, true, complexArg] })];
                }
            }));
            threadService.sync().then(function () {
                commands.executeCommand('vscode.executeCodeLensProvider', model.getAssociatedResource()).then(function (value) {
                    assert.equal(value.length, 1);
                    var first = value[0];
                    assert.equal(first.command.title, 'Title');
                    assert.equal(first.command.command, 'cmd');
                    assert.equal(first.command.arguments[0], 1);
                    assert.equal(first.command.arguments[1], true);
                    assert.equal(first.command.arguments[2], complexArg);
                    done();
                }, done);
            });
        });
    });
});
//# sourceMappingURL=extHostApiCommands.test.js.map