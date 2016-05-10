define(["require", "exports", 'assert', 'vs/workbench/parts/search/common/searchModel', 'vs/editor/common/model/model', 'vs/base/common/event', 'vs/base/common/uri', 'vs/platform/request/common/request', 'vs/platform/workspace/common/workspace', 'vs/editor/common/services/modelService', 'vs/platform/instantiation/common/serviceCollection', 'vs/platform/instantiation/common/instantiationService', 'vs/workbench/test/browser/servicesTestUtils'], function (require, exports, assert, searchModel_1, model, event_1, uri_1, request_1, workspace_1, modelService_1, serviceCollection_1, instantiationService_1, servicesTestUtils_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function toUri(path) {
        return uri_1.default.file('C:\\' + path);
    }
    suite('Search - Model', function () {
        var instantiation;
        var oneModel;
        setup(function () {
            var emitter = new event_1.Emitter();
            oneModel = new model.Model('line1\nline2\nline3', model.Model.DEFAULT_CREATION_OPTIONS, null, uri_1.default.parse('file:///folder/file.txt'));
            var services = new serviceCollection_1.ServiceCollection();
            services.set(workspace_1.IWorkspaceContextService, new servicesTestUtils_1.TestContextService());
            services.set(request_1.IRequestService, {
                getRequestUrl: function () { return 'file:///folder/file.txt'; }
            });
            services.set(modelService_1.IModelService, {
                getModel: function () { return oneModel; },
                onModelAdded: emitter.event
            });
            instantiation = new instantiationService_1.InstantiationService(services);
        });
        teardown(function () {
            oneModel.dispose();
        });
        test('Line Match', function () {
            var fileMatch = new searchModel_1.FileMatch(null, toUri('folder\\file.txt'));
            var lineMatch = new searchModel_1.Match(fileMatch, 'foo bar', 1, 0, 3);
            assert.equal(lineMatch.text(), 'foo bar');
            assert.equal(lineMatch.range().startLineNumber, 2);
            assert.equal(lineMatch.range().endLineNumber, 2);
            assert.equal(lineMatch.range().startColumn, 1);
            assert.equal(lineMatch.range().endColumn, 4);
        });
        test('Line Match - Remove', function () {
            var fileMatch = new searchModel_1.FileMatch(null, toUri('folder\\file.txt'));
            var lineMatch = new searchModel_1.Match(fileMatch, 'foo bar', 1, 0, 3);
            fileMatch.add(lineMatch);
            assert.equal(fileMatch.matches().length, 1);
            fileMatch.remove(lineMatch);
            assert.equal(fileMatch.matches().length, 0);
        });
        test('File Match', function () {
            var fileMatch = new searchModel_1.FileMatch(null, toUri('folder\\file.txt'));
            assert.equal(fileMatch.matches(), 0);
            assert.equal(fileMatch.resource().toString(), 'file:///c%3A/folder/file.txt');
            assert.equal(fileMatch.name(), 'file.txt');
            fileMatch = new searchModel_1.FileMatch(null, toUri('file.txt'));
            assert.equal(fileMatch.matches(), 0);
            assert.equal(fileMatch.resource().toString(), 'file:///c%3A/file.txt');
            assert.equal(fileMatch.name(), 'file.txt');
        });
        test('Search Result', function () {
            var searchResult = instantiation.createInstance(searchModel_1.SearchResult, null);
            assert.equal(searchResult.isEmpty(), true);
            var raw = [];
            for (var i = 0; i < 10; i++) {
                raw.push({
                    resource: uri_1.default.parse('file://c:/' + i),
                    lineMatches: [{
                            preview: String(i),
                            lineNumber: 1,
                            offsetAndLengths: [[0, 1]]
                        }]
                });
            }
            searchResult.append(raw);
            assert.equal(searchResult.isEmpty(), false);
            assert.equal(searchResult.matches().length, 10);
        });
        test('Alle Drei Zusammen', function () {
            var searchResult = instantiation.createInstance(searchModel_1.SearchResult, null);
            var fileMatch = new searchModel_1.FileMatch(searchResult, toUri('far\\boo'));
            var lineMatch = new searchModel_1.Match(fileMatch, 'foo bar', 1, 0, 3);
            assert(lineMatch.parent() === fileMatch);
            assert(fileMatch.parent() === searchResult);
        });
        //// ----- utils
        //function lineHasDecorations(model: editor.IModel, lineNumber: number, decorations: { start: number; end: number; }[]): void {
        //    let lineDecorations:typeof decorations = [];
        //    let decs = model.getLineDecorations(lineNumber);
        //    for (let i = 0, len = decs.length; i < len; i++) {
        //        lineDecorations.push({
        //            start: decs[i].range.startColumn,
        //            end: decs[i].range.endColumn
        //        });
        //    }
        //    assert.deepEqual(lineDecorations, decorations);
        //}
        //
        //function lineHasNoDecoration(model: editor.IModel, lineNumber: number): void {
        //    lineHasDecorations(model, lineNumber, []);
        //}
        //
        //function lineHasDecoration(model: editor.IModel, lineNumber: number, start: number, end: number): void {
        //    lineHasDecorations(model, lineNumber, [{
        //        start: start,
        //        end: end
        //    }]);
        //}
        //// ----- end utils
        //
        //test('Model Highlights', function () {
        //
        //    let fileMatch = instantiation.createInstance(FileMatch, null, toUri('folder\\file.txt'));
        //    fileMatch.add(new Match(fileMatch, 'line2', 1, 0, 2));
        //    fileMatch.connect();
        //    lineHasDecoration(oneModel, 2, 1, 3);
        //});
        //
        //test('Dispose', function () {
        //
        //    let fileMatch = instantiation.createInstance(FileMatch, null, toUri('folder\\file.txt'));
        //    fileMatch.add(new Match(fileMatch, 'line2', 1, 0, 2));
        //    fileMatch.connect();
        //    lineHasDecoration(oneModel, 2, 1, 3);
        //
        //    fileMatch.dispose();
        //    lineHasNoDecoration(oneModel, 2);
        //});
    });
});
//# sourceMappingURL=searchModel.test.js.map