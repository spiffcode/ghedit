/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'vs/base/common/errors', 'vs/base/common/uri', 'vs/workbench/api/node/extHostTypes', 'vs/editor/common/editorCommon', 'vs/editor/common/model/model', './testThreadService', 'vs/platform/instantiation/common/instantiationService', 'vs/platform/markers/common/markerService', 'vs/platform/markers/common/markers', 'vs/platform/thread/common/thread', 'vs/workbench/api/node/extHostLanguageFeatures', 'vs/workbench/api/node/extHostCommands', 'vs/workbench/api/node/extHostDocuments', 'vs/editor/contrib/quickOpen/common/quickOpen', 'vs/editor/common/modes', 'vs/editor/contrib/codelens/common/codelens', 'vs/editor/contrib/goToDeclaration/common/goToDeclaration', 'vs/editor/contrib/hover/common/hover', 'vs/editor/contrib/wordHighlighter/common/wordHighlighter', 'vs/editor/contrib/referenceSearch/common/referenceSearch', 'vs/editor/contrib/quickFix/common/quickFix', 'vs/workbench/parts/search/common/search', 'vs/editor/contrib/rename/common/rename', 'vs/editor/contrib/parameterHints/common/parameterHints', 'vs/editor/contrib/suggest/common/suggest', 'vs/editor/contrib/format/common/format'], function (require, exports, assert, errors_1, uri_1, types, EditorCommon, model_1, testThreadService_1, instantiationService_1, markerService_1, markers_1, thread_1, extHostLanguageFeatures_1, extHostCommands_1, extHostDocuments_1, quickOpen_1, modes_1, codelens_1, goToDeclaration_1, hover_1, wordHighlighter_1, referenceSearch_1, quickFix_1, search_1, rename_1, parameterHints_1, suggest_1, format_1) {
    'use strict';
    var defaultSelector = { scheme: 'far' };
    var model = new model_1.Model([
        'This is the first line',
        'This is the second line',
        'This is the third line',
    ].join('\n'), model_1.Model.DEFAULT_CREATION_OPTIONS, undefined, uri_1.default.parse('far://testing/file.a'));
    var extHost;
    var mainThread;
    var disposables = [];
    var threadService;
    var originalErrorHandler;
    suite('ExtHostLanguageFeatures', function () {
        suiteSetup(function () {
            var instantiationService = instantiationService_1.createInstantiationService();
            threadService = new testThreadService_1.TestThreadService(instantiationService);
            instantiationService.addSingleton(markers_1.IMarkerService, new markerService_1.MainProcessMarkerService(threadService));
            instantiationService.addSingleton(thread_1.IThreadService, threadService);
            originalErrorHandler = errors_1.errorHandler.getUnexpectedErrorHandler();
            errors_1.setUnexpectedErrorHandler(function () { });
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
            threadService.getRemotable(extHostCommands_1.ExtHostCommands);
            threadService.getRemotable(extHostCommands_1.MainThreadCommands);
            mainThread = threadService.getRemotable(extHostLanguageFeatures_1.MainThreadLanguageFeatures);
            extHost = threadService.getRemotable(extHostLanguageFeatures_1.ExtHostLanguageFeatures);
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
        // --- outline
        test('DocumentSymbols, register/deregister', function (done) {
            assert.equal(modes_1.OutlineRegistry.all(model).length, 0);
            var d1 = extHost.registerDocumentSymbolProvider(defaultSelector, {
                provideDocumentSymbols: function () {
                    return [];
                }
            });
            threadService.sync().then(function () {
                assert.equal(modes_1.OutlineRegistry.all(model).length, 1);
                d1.dispose();
                threadService.sync().then(function () {
                    done();
                });
            });
        });
        test('DocumentSymbols, evil provider', function (done) {
            disposables.push(extHost.registerDocumentSymbolProvider(defaultSelector, {
                provideDocumentSymbols: function () {
                    throw new Error('evil document symbol provider');
                }
            }));
            disposables.push(extHost.registerDocumentSymbolProvider(defaultSelector, {
                provideDocumentSymbols: function () {
                    return [new types.SymbolInformation('test', types.SymbolKind.Field, new types.Range(0, 0, 0, 0))];
                }
            }));
            threadService.sync().then(function () {
                quickOpen_1.getOutlineEntries(model).then(function (value) {
                    assert.equal(value.entries.length, 1);
                    done();
                }, function (err) {
                    done(err);
                });
            });
        });
        test('DocumentSymbols, data conversion', function (done) {
            disposables.push(extHost.registerDocumentSymbolProvider(defaultSelector, {
                provideDocumentSymbols: function () {
                    return [new types.SymbolInformation('test', types.SymbolKind.Field, new types.Range(0, 0, 0, 0))];
                }
            }));
            threadService.sync().then(function () {
                quickOpen_1.getOutlineEntries(model).then(function (value) {
                    assert.equal(value.entries.length, 1);
                    var entry = value.entries[0];
                    assert.equal(entry.label, 'test');
                    assert.deepEqual(entry.range, { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 });
                    done();
                }, function (err) {
                    done(err);
                });
            });
        });
        // --- code lens
        test('CodeLens, evil provider', function (done) {
            disposables.push(extHost.registerCodeLensProvider(defaultSelector, {
                provideCodeLenses: function () {
                    throw new Error('evil');
                }
            }));
            disposables.push(extHost.registerCodeLensProvider(defaultSelector, {
                provideCodeLenses: function () {
                    return [new types.CodeLens(new types.Range(0, 0, 0, 0))];
                }
            }));
            threadService.sync().then(function () {
                codelens_1.getCodeLensData(model).then(function (value) {
                    assert.equal(value.length, 1);
                    done();
                });
            });
        });
        test('CodeLens, do not resolve a resolved lens', function (done) {
            disposables.push(extHost.registerCodeLensProvider(defaultSelector, {
                provideCodeLenses: function () {
                    return [new types.CodeLens(new types.Range(0, 0, 0, 0), { command: 'id', title: 'Title' })];
                },
                resolveCodeLens: function () {
                    assert.ok(false, 'do not resolve');
                }
            }));
            threadService.sync().then(function () {
                codelens_1.getCodeLensData(model).then(function (value) {
                    assert.equal(value.length, 1);
                    var data = value[0];
                    data.support.resolveCodeLensSymbol(model.getAssociatedResource(), data.symbol).then(function (symbol) {
                        assert.equal(symbol.command.id, 'id');
                        assert.equal(symbol.command.title, 'Title');
                        done();
                    });
                });
            });
        });
        test('CodeLens, missing command', function (done) {
            disposables.push(extHost.registerCodeLensProvider(defaultSelector, {
                provideCodeLenses: function () {
                    return [new types.CodeLens(new types.Range(0, 0, 0, 0))];
                }
            }));
            threadService.sync().then(function () {
                codelens_1.getCodeLensData(model).then(function (value) {
                    assert.equal(value.length, 1);
                    var data = value[0];
                    data.support.resolveCodeLensSymbol(model.getAssociatedResource(), data.symbol).then(function (symbol) {
                        assert.equal(symbol.command.id, 'missing');
                        assert.equal(symbol.command.title, '<<MISSING COMMAND>>');
                        done();
                    });
                });
            });
        });
        // --- definition
        test('Definition, data conversion', function (done) {
            disposables.push(extHost.registerDefinitionProvider(defaultSelector, {
                provideDefinition: function () {
                    return [new types.Location(model.getAssociatedResource(), new types.Range(1, 2, 3, 4))];
                }
            }));
            threadService.sync().then(function () {
                goToDeclaration_1.getDeclarationsAtPosition(model, { lineNumber: 1, column: 1 }).then(function (value) {
                    assert.equal(value.length, 1);
                    var entry = value[0];
                    assert.deepEqual(entry.range, { startLineNumber: 2, startColumn: 3, endLineNumber: 4, endColumn: 5 });
                    assert.equal(entry.resource.toString(), model.getAssociatedResource().toString());
                    done();
                }, function (err) {
                    done(err);
                });
            });
        });
        test('Definition, one or many', function (done) {
            disposables.push(extHost.registerDefinitionProvider(defaultSelector, {
                provideDefinition: function () {
                    return [new types.Location(model.getAssociatedResource(), new types.Range(1, 1, 1, 1))];
                }
            }));
            disposables.push(extHost.registerDefinitionProvider(defaultSelector, {
                provideDefinition: function () {
                    return new types.Location(model.getAssociatedResource(), new types.Range(1, 1, 1, 1));
                }
            }));
            threadService.sync().then(function () {
                goToDeclaration_1.getDeclarationsAtPosition(model, { lineNumber: 1, column: 1 }).then(function (value) {
                    assert.equal(value.length, 2);
                    done();
                }, function (err) {
                    done(err);
                });
            });
        });
        test('Definition, registration order', function (done) {
            disposables.push(extHost.registerDefinitionProvider(defaultSelector, {
                provideDefinition: function () {
                    return [new types.Location(uri_1.default.parse('far://first'), new types.Range(2, 3, 4, 5))];
                }
            }));
            setTimeout(function () {
                disposables.push(extHost.registerDefinitionProvider(defaultSelector, {
                    provideDefinition: function () {
                        return new types.Location(uri_1.default.parse('far://second'), new types.Range(1, 2, 3, 4));
                    }
                }));
                threadService.sync().then(function () {
                    goToDeclaration_1.getDeclarationsAtPosition(model, { lineNumber: 1, column: 1 }).then(function (value) {
                        assert.equal(value.length, 2);
                        // let [first, second] = value;
                        assert.equal(value[0].resource.authority, 'second');
                        assert.equal(value[1].resource.authority, 'first');
                        done();
                    }, function (err) {
                        done(err);
                    });
                });
            }, 5);
        });
        test('Definition, evil provider', function (done) {
            disposables.push(extHost.registerDefinitionProvider(defaultSelector, {
                provideDefinition: function () {
                    throw new Error('evil provider');
                }
            }));
            disposables.push(extHost.registerDefinitionProvider(defaultSelector, {
                provideDefinition: function () {
                    return new types.Location(model.getAssociatedResource(), new types.Range(1, 1, 1, 1));
                }
            }));
            threadService.sync().then(function () {
                goToDeclaration_1.getDeclarationsAtPosition(model, { lineNumber: 1, column: 1 }).then(function (value) {
                    assert.equal(value.length, 1);
                    done();
                }, function (err) {
                    done(err);
                });
            });
        });
        // --- extra info
        test('ExtraInfo, word range at pos', function (done) {
            disposables.push(extHost.registerHoverProvider(defaultSelector, {
                provideHover: function () {
                    return new types.Hover('Hello');
                }
            }));
            threadService.sync().then(function () {
                hover_1.getExtraInfoAtPosition(model, { lineNumber: 1, column: 1 }).then(function (value) {
                    assert.equal(value.length, 1);
                    var entry = value[0];
                    assert.deepEqual(entry.range, { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 5 });
                    done();
                });
            });
        });
        test('ExtraInfo, given range', function (done) {
            disposables.push(extHost.registerHoverProvider(defaultSelector, {
                provideHover: function () {
                    return new types.Hover('Hello', new types.Range(3, 0, 8, 7));
                }
            }));
            threadService.sync().then(function () {
                hover_1.getExtraInfoAtPosition(model, { lineNumber: 1, column: 1 }).then(function (value) {
                    assert.equal(value.length, 1);
                    var entry = value[0];
                    assert.deepEqual(entry.range, { startLineNumber: 4, startColumn: 1, endLineNumber: 9, endColumn: 8 });
                    done();
                });
            });
        });
        test('ExtraInfo, registration order', function (done) {
            disposables.push(extHost.registerHoverProvider(defaultSelector, {
                provideHover: function () {
                    return new types.Hover('registered first');
                }
            }));
            setTimeout(function () {
                disposables.push(extHost.registerHoverProvider(defaultSelector, {
                    provideHover: function () {
                        return new types.Hover('registered second');
                    }
                }));
                threadService.sync().then(function () {
                    hover_1.getExtraInfoAtPosition(model, { lineNumber: 1, column: 1 }).then(function (value) {
                        assert.equal(value.length, 2);
                        var first = value[0], second = value[1];
                        assert.equal(first.htmlContent[0].markdown, 'registered second');
                        assert.equal(second.htmlContent[0].markdown, 'registered first');
                        done();
                    });
                });
            }, 5);
        });
        test('ExtraInfo, evil provider', function (done) {
            disposables.push(extHost.registerHoverProvider(defaultSelector, {
                provideHover: function () {
                    throw new Error('evil');
                }
            }));
            disposables.push(extHost.registerHoverProvider(defaultSelector, {
                provideHover: function () {
                    return new types.Hover('Hello');
                }
            }));
            threadService.sync().then(function () {
                hover_1.getExtraInfoAtPosition(model, { lineNumber: 1, column: 1 }).then(function (value) {
                    assert.equal(value.length, 1);
                    done();
                });
            });
        });
        // --- occurrences
        test('Occurrences, data conversion', function (done) {
            disposables.push(extHost.registerDocumentHighlightProvider(defaultSelector, {
                provideDocumentHighlights: function () {
                    return [new types.DocumentHighlight(new types.Range(0, 0, 0, 4))];
                }
            }));
            threadService.sync().then(function () {
                wordHighlighter_1.getOccurrencesAtPosition(model, { lineNumber: 1, column: 2 }).then(function (value) {
                    assert.equal(value.length, 1);
                    var entry = value[0];
                    assert.deepEqual(entry.range, { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 5 });
                    assert.equal(entry.kind, 'text');
                    done();
                });
            });
        });
        test('Occurrences, order 1/2', function (done) {
            disposables.push(extHost.registerDocumentHighlightProvider(defaultSelector, {
                provideDocumentHighlights: function () {
                    return [];
                }
            }));
            disposables.push(extHost.registerDocumentHighlightProvider('*', {
                provideDocumentHighlights: function () {
                    return [new types.DocumentHighlight(new types.Range(0, 0, 0, 4))];
                }
            }));
            threadService.sync().then(function () {
                wordHighlighter_1.getOccurrencesAtPosition(model, { lineNumber: 1, column: 2 }).then(function (value) {
                    assert.equal(value.length, 1);
                    var entry = value[0];
                    assert.deepEqual(entry.range, { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 5 });
                    assert.equal(entry.kind, 'text');
                    done();
                });
            });
        });
        test('Occurrences, order 2/2', function (done) {
            disposables.push(extHost.registerDocumentHighlightProvider(defaultSelector, {
                provideDocumentHighlights: function () {
                    return [new types.DocumentHighlight(new types.Range(0, 0, 0, 2))];
                }
            }));
            disposables.push(extHost.registerDocumentHighlightProvider('*', {
                provideDocumentHighlights: function () {
                    return [new types.DocumentHighlight(new types.Range(0, 0, 0, 4))];
                }
            }));
            threadService.sync().then(function () {
                wordHighlighter_1.getOccurrencesAtPosition(model, { lineNumber: 1, column: 2 }).then(function (value) {
                    assert.equal(value.length, 1);
                    var entry = value[0];
                    assert.deepEqual(entry.range, { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 3 });
                    assert.equal(entry.kind, 'text');
                    done();
                });
            });
        });
        test('Occurrences, evil provider', function (done) {
            disposables.push(extHost.registerDocumentHighlightProvider(defaultSelector, {
                provideDocumentHighlights: function () {
                    throw new Error('evil');
                }
            }));
            disposables.push(extHost.registerDocumentHighlightProvider(defaultSelector, {
                provideDocumentHighlights: function () {
                    return [new types.DocumentHighlight(new types.Range(0, 0, 0, 4))];
                }
            }));
            threadService.sync().then(function () {
                wordHighlighter_1.getOccurrencesAtPosition(model, { lineNumber: 1, column: 2 }).then(function (value) {
                    assert.equal(value.length, 1);
                    done();
                });
            });
        });
        // --- references
        test('References, registration order', function (done) {
            disposables.push(extHost.registerReferenceProvider(defaultSelector, {
                provideReferences: function () {
                    return [new types.Location(uri_1.default.parse('far://register/first'), new types.Range(0, 0, 0, 0))];
                }
            }));
            setTimeout(function () {
                disposables.push(extHost.registerReferenceProvider(defaultSelector, {
                    provideReferences: function () {
                        return [new types.Location(uri_1.default.parse('far://register/second'), new types.Range(0, 0, 0, 0))];
                    }
                }));
                threadService.sync().then(function () {
                    referenceSearch_1.findReferences(model, { lineNumber: 1, column: 2 }).then(function (value) {
                        assert.equal(value.length, 2);
                        var first = value[0], second = value[1];
                        assert.equal(first.resource.path, '/second');
                        assert.equal(second.resource.path, '/first');
                        done();
                    });
                });
            }, 5);
        });
        test('References, data conversion', function (done) {
            disposables.push(extHost.registerReferenceProvider(defaultSelector, {
                provideReferences: function () {
                    return [new types.Location(model.getAssociatedResource(), new types.Position(0, 0))];
                }
            }));
            threadService.sync().then(function () {
                referenceSearch_1.findReferences(model, { lineNumber: 1, column: 2 }).then(function (value) {
                    assert.equal(value.length, 1);
                    var item = value[0];
                    assert.deepEqual(item.range, { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 });
                    assert.equal(item.resource.toString(), model.getAssociatedResource().toString());
                    done();
                });
            });
        });
        test('References, evil provider', function (done) {
            disposables.push(extHost.registerReferenceProvider(defaultSelector, {
                provideReferences: function () {
                    throw new Error('evil');
                }
            }));
            disposables.push(extHost.registerReferenceProvider(defaultSelector, {
                provideReferences: function () {
                    return [new types.Location(model.getAssociatedResource(), new types.Range(0, 0, 0, 0))];
                }
            }));
            threadService.sync().then(function () {
                referenceSearch_1.findReferences(model, { lineNumber: 1, column: 2 }).then(function (value) {
                    assert.equal(value.length, 1);
                    done();
                });
            });
        });
        // --- quick fix
        test('Quick Fix, data conversion', function (done) {
            disposables.push(extHost.registerCodeActionProvider(defaultSelector, {
                provideCodeActions: function () {
                    return [
                        { command: 'test1', title: 'Testing1' },
                        { command: 'test2', title: 'Testing2' }
                    ];
                }
            }));
            threadService.sync().then(function () {
                quickFix_1.getQuickFixes(model, model.getFullModelRange()).then(function (value) {
                    assert.equal(value.length, 2);
                    var first = value[0], second = value[1];
                    assert.equal(first.command.title, 'Testing1');
                    assert.equal(first.command.id, 'test1');
                    assert.equal(second.command.title, 'Testing2');
                    assert.equal(second.command.id, 'test2');
                    done();
                });
            });
        });
        test('Quick Fix, invoke command+args', function (done) {
            var actualArgs;
            var commands = threadService.getRemotable(extHostCommands_1.ExtHostCommands);
            disposables.push(commands.registerCommand('test1', function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                actualArgs = args;
            }));
            disposables.push(extHost.registerCodeActionProvider(defaultSelector, {
                provideCodeActions: function () {
                    return [{ command: 'test1', title: 'Testing', arguments: [true, 1, { bar: 'boo', foo: 'far' }, null] }];
                }
            }));
            threadService.sync().then(function () {
                quickFix_1.getQuickFixes(model, model.getFullModelRange()).then(function (value) {
                    assert.equal(value.length, 1);
                    var entry = value[0];
                    entry.support.runQuickFixAction(model.getAssociatedResource(), model.getFullModelRange(), entry).then(function (value) {
                        assert.equal(value, undefined);
                        assert.equal(actualArgs.length, 4);
                        assert.equal(actualArgs[0], true);
                        assert.equal(actualArgs[1], 1);
                        assert.deepEqual(actualArgs[2], { bar: 'boo', foo: 'far' });
                        assert.equal(actualArgs[3], null);
                        done();
                    });
                });
            });
        });
        test('Quick Fix, evil provider', function (done) {
            disposables.push(extHost.registerCodeActionProvider(defaultSelector, {
                provideCodeActions: function () {
                    throw new Error('evil');
                }
            }));
            disposables.push(extHost.registerCodeActionProvider(defaultSelector, {
                provideCodeActions: function () {
                    return [{ command: 'test', title: 'Testing' }];
                }
            }));
            threadService.sync().then(function () {
                quickFix_1.getQuickFixes(model, model.getFullModelRange()).then(function (value) {
                    assert.equal(value.length, 1);
                    done();
                });
            });
        });
        // --- navigate types
        test('Navigate types, evil provider', function (done) {
            disposables.push(extHost.registerWorkspaceSymbolProvider({
                provideWorkspaceSymbols: function () {
                    throw new Error('evil');
                }
            }));
            disposables.push(extHost.registerWorkspaceSymbolProvider({
                provideWorkspaceSymbols: function () {
                    return [new types.SymbolInformation('testing', types.SymbolKind.Array, new types.Range(0, 0, 1, 1))];
                }
            }));
            threadService.sync().then(function () {
                search_1.getNavigateToItems('').then(function (value) {
                    assert.equal(value.length, 1);
                    done();
                });
            });
        });
        // --- rename
        test('Rename, evil provider 1/2', function (done) {
            disposables.push(extHost.registerRenameProvider(defaultSelector, {
                provideRenameEdits: function () {
                    throw Error('evil');
                }
            }));
            threadService.sync().then(function () {
                rename_1.rename(model, { lineNumber: 1, column: 1 }, 'newName').then(function (value) {
                    done(new Error(''));
                }, function (err) {
                    done(); // expected
                });
            });
        });
        test('Rename, evil provider 2/2', function (done) {
            disposables.push(extHost.registerRenameProvider('*', {
                provideRenameEdits: function () {
                    throw Error('evil');
                }
            }));
            disposables.push(extHost.registerRenameProvider(defaultSelector, {
                provideRenameEdits: function () {
                    var edit = new types.WorkspaceEdit();
                    edit.replace(model.getAssociatedResource(), new types.Range(0, 0, 0, 0), 'testing');
                    return edit;
                }
            }));
            threadService.sync().then(function () {
                rename_1.rename(model, { lineNumber: 1, column: 1 }, 'newName').then(function (value) {
                    assert.equal(value.edits.length, 1);
                    done();
                });
            });
        });
        test('Rename, ordering', function (done) {
            disposables.push(extHost.registerRenameProvider('*', {
                provideRenameEdits: function () {
                    var edit = new types.WorkspaceEdit();
                    edit.replace(model.getAssociatedResource(), new types.Range(0, 0, 0, 0), 'testing');
                    edit.replace(model.getAssociatedResource(), new types.Range(1, 0, 1, 0), 'testing');
                    return edit;
                }
            }));
            disposables.push(extHost.registerRenameProvider(defaultSelector, {
                provideRenameEdits: function () {
                    return;
                }
            }));
            threadService.sync().then(function () {
                rename_1.rename(model, { lineNumber: 1, column: 1 }, 'newName').then(function (value) {
                    assert.equal(value.edits.length, 2); // least relevant renamer
                    done();
                });
            });
        });
        // --- parameter hints
        test('Parameter Hints, evil provider', function (done) {
            disposables.push(extHost.registerSignatureHelpProvider(defaultSelector, {
                provideSignatureHelp: function () {
                    throw new Error('evil');
                }
            }, []));
            threadService.sync().then(function () {
                parameterHints_1.getParameterHints(model, { lineNumber: 1, column: 1 }, '(').then(function (value) {
                    done(new Error('error expeted'));
                }, function (err) {
                    assert.equal(err.message, 'evil');
                    done();
                });
            });
        });
        // --- suggestions
        test('Suggest, order 1/3', function (done) {
            disposables.push(extHost.registerCompletionItemProvider('*', {
                provideCompletionItems: function () {
                    return [new types.CompletionItem('testing1')];
                }
            }, []));
            disposables.push(extHost.registerCompletionItemProvider(defaultSelector, {
                provideCompletionItems: function () {
                    return [new types.CompletionItem('testing2')];
                }
            }, []));
            threadService.sync().then(function () {
                suggest_1.suggest(model, { lineNumber: 1, column: 1 }, ',').then(function (value) {
                    assert.ok(value.length >= 1); // check for min because snippets and others contribute
                    var first = value[0];
                    assert.equal(first.suggestions.length, 1);
                    assert.equal(first.suggestions[0].codeSnippet, 'testing2');
                    done();
                });
            });
        });
        test('Suggest, order 2/3', function (done) {
            disposables.push(extHost.registerCompletionItemProvider('*', {
                provideCompletionItems: function () {
                    return [new types.CompletionItem('weak-selector')]; // weaker selector but result
                }
            }, []));
            disposables.push(extHost.registerCompletionItemProvider(defaultSelector, {
                provideCompletionItems: function () {
                    return []; // stronger selector but not a good result;
                }
            }, []));
            threadService.sync().then(function () {
                suggest_1.suggest(model, { lineNumber: 1, column: 1 }, ',').then(function (value) {
                    assert.ok(value.length >= 1);
                    var first = value[0];
                    assert.equal(first.suggestions.length, 1);
                    assert.equal(first.suggestions[0].codeSnippet, 'weak-selector');
                    done();
                });
            });
        });
        test('Suggest, order 2/3', function (done) {
            disposables.push(extHost.registerCompletionItemProvider(defaultSelector, {
                provideCompletionItems: function () {
                    return [new types.CompletionItem('strong-1')];
                }
            }, []));
            setTimeout(function () {
                disposables.push(extHost.registerCompletionItemProvider(defaultSelector, {
                    provideCompletionItems: function () {
                        return [new types.CompletionItem('strong-2')];
                    }
                }, []));
                threadService.sync().then(function () {
                    suggest_1.suggest(model, { lineNumber: 1, column: 1 }, ',').then(function (value) {
                        assert.ok(value.length >= 2);
                        var first = value[0], second = value[1];
                        assert.equal(first.suggestions.length, 1);
                        assert.equal(first.suggestions[0].codeSnippet, 'strong-2'); // last wins
                        assert.equal(second.suggestions[0].codeSnippet, 'strong-1');
                        done();
                    });
                });
            }, 5);
        });
        test('Suggest, evil provider', function (done) {
            disposables.push(extHost.registerCompletionItemProvider(defaultSelector, {
                provideCompletionItems: function () {
                    throw new Error('evil');
                }
            }, []));
            disposables.push(extHost.registerCompletionItemProvider(defaultSelector, {
                provideCompletionItems: function () {
                    return [new types.CompletionItem('testing')];
                }
            }, []));
            threadService.sync().then(function () {
                suggest_1.suggest(model, { lineNumber: 1, column: 1 }, ',').then(function (value) {
                    assert.equal(value[0].incomplete, undefined);
                    done();
                });
            });
        });
        test('Suggest, CompletionList', function () {
            disposables.push(extHost.registerCompletionItemProvider(defaultSelector, {
                provideCompletionItems: function () {
                    return new types.CompletionList([new types.CompletionItem('hello')], true);
                }
            }, []));
            return threadService.sync().then(function () {
                suggest_1.suggest(model, { lineNumber: 1, column: 1 }, ',').then(function (value) {
                    assert.equal(value[0].incomplete, true);
                });
            });
        });
        // --- format
        test('Format Doc, data conversion', function (done) {
            disposables.push(extHost.registerDocumentFormattingEditProvider(defaultSelector, {
                provideDocumentFormattingEdits: function () {
                    return [new types.TextEdit(new types.Range(0, 0, 1, 1), 'testing')];
                }
            }));
            threadService.sync().then(function () {
                format_1.formatDocument(model, { insertSpaces: true, tabSize: 4 }).then(function (value) {
                    assert.equal(value.length, 1);
                    var first = value[0];
                    assert.equal(first.text, 'testing');
                    assert.deepEqual(first.range, { startLineNumber: 1, startColumn: 1, endLineNumber: 2, endColumn: 2 });
                    done();
                });
            });
        });
        test('Format Doc, evil provider', function (done) {
            disposables.push(extHost.registerDocumentFormattingEditProvider(defaultSelector, {
                provideDocumentFormattingEdits: function () {
                    throw new Error('evil');
                }
            }));
            threadService.sync().then(function () {
                format_1.formatDocument(model, { insertSpaces: true, tabSize: 4 }).then(undefined, function (err) { return done(); });
            });
        });
        test('Format Range, data conversion', function (done) {
            disposables.push(extHost.registerDocumentRangeFormattingEditProvider(defaultSelector, {
                provideDocumentRangeFormattingEdits: function () {
                    return [new types.TextEdit(new types.Range(0, 0, 1, 1), 'testing')];
                }
            }));
            threadService.sync().then(function () {
                format_1.formatRange(model, { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 }, { insertSpaces: true, tabSize: 4 }).then(function (value) {
                    assert.equal(value.length, 1);
                    var first = value[0];
                    assert.equal(first.text, 'testing');
                    assert.deepEqual(first.range, { startLineNumber: 1, startColumn: 1, endLineNumber: 2, endColumn: 2 });
                    done();
                });
            });
        });
        test('Format Range, + format_doc', function (done) {
            disposables.push(extHost.registerDocumentRangeFormattingEditProvider(defaultSelector, {
                provideDocumentRangeFormattingEdits: function () {
                    return [new types.TextEdit(new types.Range(0, 0, 1, 1), 'range')];
                }
            }));
            disposables.push(extHost.registerDocumentFormattingEditProvider(defaultSelector, {
                provideDocumentFormattingEdits: function () {
                    return [new types.TextEdit(new types.Range(0, 0, 1, 1), 'doc')];
                }
            }));
            threadService.sync().then(function () {
                format_1.formatRange(model, { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 }, { insertSpaces: true, tabSize: 4 }).then(function (value) {
                    assert.equal(value.length, 1);
                    var first = value[0];
                    assert.equal(first.text, 'range');
                    done();
                });
            });
        });
        test('Format Range, evil provider', function (done) {
            disposables.push(extHost.registerDocumentRangeFormattingEditProvider(defaultSelector, {
                provideDocumentRangeFormattingEdits: function () {
                    throw new Error('evil');
                }
            }));
            threadService.sync().then(function () {
                format_1.formatRange(model, { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 }, { insertSpaces: true, tabSize: 4 }).then(undefined, function (err) { return done(); });
            });
        });
        test('Format on Type, data conversion', function (done) {
            disposables.push(extHost.registerOnTypeFormattingEditProvider(defaultSelector, {
                provideOnTypeFormattingEdits: function () {
                    return [new types.TextEdit(new types.Range(0, 0, 0, 0), arguments[2])];
                }
            }, [';']));
            threadService.sync().then(function () {
                format_1.formatAfterKeystroke(model, { lineNumber: 1, column: 1 }, ';', { insertSpaces: true, tabSize: 2 }).then(function (value) {
                    assert.equal(value.length, 1);
                    var first = value[0];
                    assert.equal(first.text, ';');
                    assert.deepEqual(first.range, { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 });
                    done();
                });
            });
        });
    });
});
//# sourceMappingURL=extHostLanguageFeatures.test.js.map