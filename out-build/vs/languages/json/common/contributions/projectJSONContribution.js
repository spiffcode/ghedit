var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/strings', 'vs/nls!vs/languages/json/common/contributions/projectJSONContribution', 'vs/platform/request/common/request'], function (require, exports, Strings, nls, request_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var LIMIT = 40;
    var ProjectJSONContribution = (function () {
        function ProjectJSONContribution(requestService) {
            this.requestService = requestService;
        }
        ProjectJSONContribution.prototype.isProjectJSONFile = function (resource) {
            var path = resource.path;
            return Strings.endsWith(path, '/project.json');
        };
        ProjectJSONContribution.prototype.collectDefaultSuggestions = function (resource, result) {
            if (this.isProjectJSONFile(resource)) {
                var defaultValue = {
                    'version': '{{1.0.0-*}}',
                    'dependencies': {},
                    'frameworks': {
                        'dnx451': {},
                        'dnxcore50': {}
                    }
                };
                result.add({ type: 'snippet', label: nls.localize(0, null), codeSnippet: JSON.stringify(defaultValue, null, '\t'), documentationLabel: '' });
            }
            return null;
        };
        ProjectJSONContribution.prototype.collectPropertySuggestions = function (resource, location, currentWord, addValue, isLast, result) {
            if (this.isProjectJSONFile(resource) && (location.matches(['dependencies']) || location.matches(['frameworks', '*', 'dependencies']) || location.matches(['frameworks', '*', 'frameworkAssemblies']))) {
                var queryUrl;
                if (currentWord.length > 0) {
                    queryUrl = 'https://www.nuget.org/api/v2/Packages?'
                        + '$filter=Id%20ge%20\''
                        + encodeURIComponent(currentWord)
                        + '\'%20and%20Id%20lt%20\''
                        + encodeURIComponent(currentWord + 'z')
                        + '\'%20and%20IsAbsoluteLatestVersion%20eq%20true'
                        + '&$select=Id,Version,Description&$format=json&$top=' + LIMIT;
                }
                else {
                    queryUrl = 'https://www.nuget.org/api/v2/Packages?'
                        + '$filter=IsAbsoluteLatestVersion%20eq%20true'
                        + '&$orderby=DownloadCount%20desc&$top=' + LIMIT
                        + '&$select=Id,Version,DownloadCount,Description&$format=json';
                }
                return this.requestService.makeRequest({
                    url: queryUrl
                }).then(function (success) {
                    if (success.status === 200) {
                        try {
                            var obj = JSON.parse(success.responseText);
                            if (Array.isArray(obj.d)) {
                                var results = obj.d;
                                for (var i = 0; i < results.length; i++) {
                                    var curr = results[i];
                                    var name = curr.Id;
                                    var version = curr.Version;
                                    if (name) {
                                        var documentation = curr.Description;
                                        var typeLabel = curr.Version;
                                        var codeSnippet = JSON.stringify(name);
                                        if (addValue) {
                                            codeSnippet += ': "{{' + version + '}}"';
                                            if (!isLast) {
                                                codeSnippet += ',';
                                            }
                                        }
                                        result.add({ type: 'property', label: name, codeSnippet: codeSnippet, typeLabel: typeLabel, documentationLabel: documentation });
                                    }
                                }
                                if (results.length === LIMIT) {
                                    result.setAsIncomplete();
                                }
                            }
                        }
                        catch (e) {
                        }
                    }
                    else {
                        result.error(nls.localize(1, null, success.responseText));
                        return 0;
                    }
                }, function (error) {
                    result.error(nls.localize(2, null, error.responseText));
                    return 0;
                });
            }
            return null;
        };
        ProjectJSONContribution.prototype.collectValueSuggestions = function (resource, location, currentKey, result) {
            if (this.isProjectJSONFile(resource) && (location.matches(['dependencies']) || location.matches(['frameworks', '*', 'dependencies']) || location.matches(['frameworks', '*', 'frameworkAssemblies']))) {
                var queryUrl = 'https://www.myget.org/F/aspnetrelease/api/v2/Packages?'
                    + '$filter=Id%20eq%20\''
                    + encodeURIComponent(currentKey)
                    + '\'&$select=Version,IsAbsoluteLatestVersion&$format=json&$top=' + LIMIT;
                return this.requestService.makeRequest({
                    url: queryUrl
                }).then(function (success) {
                    try {
                        var obj = JSON.parse(success.responseText);
                        if (Array.isArray(obj.d)) {
                            var results = obj.d;
                            for (var i = 0; i < results.length; i++) {
                                var curr = results[i];
                                var version = curr.Version;
                                if (version) {
                                    var name = JSON.stringify(version);
                                    var isLatest = curr.IsAbsoluteLatestVersion === 'true';
                                    var label = name;
                                    var documentationLabel = '';
                                    if (isLatest) {
                                        documentationLabel = nls.localize(3, null);
                                    }
                                    result.add({ type: 'class', label: label, codeSnippet: name, documentationLabel: documentationLabel });
                                }
                            }
                            if (results.length === LIMIT) {
                                result.setAsIncomplete();
                            }
                        }
                    }
                    catch (e) {
                    }
                    return 0;
                }, function (error) {
                    return 0;
                });
            }
            return null;
        };
        ProjectJSONContribution.prototype.getInfoContribution = function (resource, location) {
            if (this.isProjectJSONFile(resource) && (location.matches(['dependencies', '*']) || location.matches(['frameworks', '*', 'dependencies', '*']) || location.matches(['frameworks', '*', 'frameworkAssemblies', '*']))) {
                var pack = location.getSegments()[location.getSegments().length - 1];
                var htmlContent = [];
                htmlContent.push({ className: 'type', text: nls.localize(4, null, pack) });
                var queryUrl = 'https://www.myget.org/F/aspnetrelease/api/v2/Packages?'
                    + '$filter=Id%20eq%20\''
                    + encodeURIComponent(pack)
                    + '\'%20and%20IsAbsoluteLatestVersion%20eq%20true'
                    + '&$select=Version,Description&$format=json&$top=5';
                return this.requestService.makeRequest({
                    url: queryUrl
                }).then(function (success) {
                    var content = success.responseText;
                    if (content) {
                        try {
                            var obj = JSON.parse(content);
                            if (obj.d && obj.d[0]) {
                                var res = obj.d[0];
                                if (res.Description) {
                                    htmlContent.push({ className: 'documentation', text: res.Description });
                                }
                                if (res.Version) {
                                    htmlContent.push({ className: 'documentation', text: nls.localize(5, null, res.Version) });
                                }
                            }
                        }
                        catch (e) {
                        }
                    }
                    return htmlContent;
                }, function (error) {
                    return htmlContent;
                });
            }
            return null;
        };
        ProjectJSONContribution = __decorate([
            __param(0, request_1.IRequestService)
        ], ProjectJSONContribution);
        return ProjectJSONContribution;
    }());
    exports.ProjectJSONContribution = ProjectJSONContribution;
});
//# sourceMappingURL=projectJSONContribution.js.map