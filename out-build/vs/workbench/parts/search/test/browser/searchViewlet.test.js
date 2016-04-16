define(["require", "exports", 'assert', 'vs/base/common/uri', 'vs/workbench/parts/search/common/searchModel', 'vs/platform/instantiation/common/instantiationService', 'vs/workbench/parts/search/browser/searchViewlet', 'vs/workbench/test/browser/servicesTestUtils'], function (require, exports, assert, uri_1, searchModel_1, instantiationService_1, searchViewlet_1, servicesTestUtils_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    suite('Search - Viewlet', function () {
        var instantiation;
        setup(function () {
            instantiation = instantiationService_1.createInstantiationService({
                modelService: {
                    getModel: function () { return null; }
                },
                requestService: {
                    getRequestUrl: function () { return 'file:///folder/file.txt'; }
                },
                contextService: new servicesTestUtils_1.TestContextService()
            });
        });
        test('Data Source', function () {
            var ds = new searchViewlet_1.SearchDataSource();
            var result = instantiation.createInstance(searchModel_1.SearchResult, null);
            result.append([{
                    resource: uri_1.default.parse('file:///c:/foo'),
                    lineMatches: [{ lineNumber: 1, preview: 'bar', offsetAndLengths: [[0, 1]] }]
                }]);
            var fileMatch = result.matches()[0];
            var lineMatch = fileMatch.matches()[0];
            assert.equal(ds.getId(null, result), 'root');
            assert.equal(ds.getId(null, fileMatch), 'file:///c%3A/foo');
            assert.equal(ds.getId(null, lineMatch), 'file:///c%3A/foo>1>0');
            assert(!ds.hasChildren(null, 'foo'));
            assert(ds.hasChildren(null, result));
            assert(ds.hasChildren(null, fileMatch));
            assert(!ds.hasChildren(null, lineMatch));
        });
        test('Sorter', function () {
            var fileMatch1 = new searchModel_1.FileMatch(null, uri_1.default.file('C:\\foo'));
            var fileMatch2 = new searchModel_1.FileMatch(null, uri_1.default.file('C:\\with\\path'));
            var fileMatch3 = new searchModel_1.FileMatch(null, uri_1.default.file('C:\\with\\path\\foo'));
            var lineMatch1 = new searchModel_1.Match(fileMatch1, 'bar', 1, 1, 1);
            var lineMatch2 = new searchModel_1.Match(fileMatch1, 'bar', 2, 1, 1);
            var lineMatch3 = new searchModel_1.Match(fileMatch1, 'bar', 2, 1, 1);
            var s = new searchViewlet_1.SearchSorter();
            assert(s.compare(null, fileMatch1, fileMatch2) < 0);
            assert(s.compare(null, fileMatch2, fileMatch1) > 0);
            assert(s.compare(null, fileMatch1, fileMatch1) === 0);
            assert(s.compare(null, fileMatch2, fileMatch3) < 0);
            assert(s.compare(null, lineMatch1, lineMatch2) < 0);
            assert(s.compare(null, lineMatch2, lineMatch1) > 0);
            assert(s.compare(null, lineMatch2, lineMatch3) === 0);
        });
    });
});
//# sourceMappingURL=searchViewlet.test.js.map