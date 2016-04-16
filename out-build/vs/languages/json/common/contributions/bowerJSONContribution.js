var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/strings', 'vs/nls!vs/languages/json/common/contributions/bowerJSONContribution', 'vs/platform/request/common/request'], function (require, exports, Strings, nls, request_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var BowerJSONContribution = (function () {
        function BowerJSONContribution(requestService) {
            this.topRanked = ['twitter', 'bootstrap', 'angular-1.1.6', 'angular-latest', 'angulerjs', 'd3', 'myjquery', 'jq', 'abcdef1234567890', 'jQuery', 'jquery-1.11.1', 'jquery',
                'sushi-vanilla-x-data', 'font-awsome', 'Font-Awesome', 'font-awesome', 'fontawesome', 'html5-boilerplate', 'impress.js', 'homebrew',
                'backbone', 'moment1', 'momentjs', 'moment', 'linux', 'animate.css', 'animate-css', 'reveal.js', 'jquery-file-upload', 'blueimp-file-upload', 'threejs', 'express', 'chosen',
                'normalize-css', 'normalize.css', 'semantic', 'semantic-ui', 'Semantic-UI', 'modernizr', 'underscore', 'underscore1',
                'material-design-icons', 'ionic', 'chartjs', 'Chart.js', 'nnnick-chartjs', 'select2-ng', 'select2-dist', 'phantom', 'skrollr', 'scrollr', 'less.js', 'leancss', 'parser-lib',
                'hui', 'bootstrap-languages', 'async', 'gulp', 'jquery-pjax', 'coffeescript', 'hammer.js', 'ace', 'leaflet', 'jquery-mobile', 'sweetalert', 'typeahead.js', 'soup', 'typehead.js',
                'sails', 'codeigniter2'];
            this.requestService = requestService;
        }
        BowerJSONContribution.prototype.isBowerFile = function (resource) {
            var path = resource.path;
            return Strings.endsWith(path, '/bower.json') || Strings.endsWith(path, '/.bower.json');
        };
        BowerJSONContribution.prototype.collectDefaultSuggestions = function (resource, result) {
            if (this.isBowerFile(resource)) {
                var defaultValue = {
                    'name': '{{name}}',
                    'description': '{{description}}',
                    'authors': ['{{author}}'],
                    'version': '{{1.0.0}}',
                    'main': '{{pathToMain}}',
                    'dependencies': {}
                };
                result.add({ type: 'snippet', label: nls.localize(0, null), codeSnippet: JSON.stringify(defaultValue, null, '\t'), documentationLabel: '' });
            }
            return null;
        };
        BowerJSONContribution.prototype.collectPropertySuggestions = function (resource, location, currentWord, addValue, isLast, result) {
            if (this.isBowerFile(resource) && (location.matches(['dependencies']) || location.matches(['devDependencies']))) {
                if (currentWord.length > 0) {
                    var queryUrl = 'https://bower.herokuapp.com/packages/search/' + encodeURIComponent(currentWord);
                    return this.requestService.makeRequest({
                        url: queryUrl
                    }).then(function (success) {
                        if (success.status === 200) {
                            try {
                                var obj = JSON.parse(success.responseText);
                                if (Array.isArray(obj)) {
                                    var results = obj;
                                    for (var i = 0; i < results.length; i++) {
                                        var name = results[i].name;
                                        var description = results[i].description || '';
                                        var codeSnippet = JSON.stringify(name);
                                        if (addValue) {
                                            codeSnippet += ': "{{*}}"';
                                            if (!isLast) {
                                                codeSnippet += ',';
                                            }
                                        }
                                        result.add({ type: 'property', label: name, codeSnippet: codeSnippet, documentationLabel: description });
                                    }
                                    result.setAsIncomplete();
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
                else {
                    this.topRanked.forEach(function (name) {
                        var codeSnippet = JSON.stringify(name);
                        if (addValue) {
                            codeSnippet += ': "{{*}}"';
                            if (!isLast) {
                                codeSnippet += ',';
                            }
                        }
                        result.add({ type: 'property', label: name, codeSnippet: codeSnippet, documentationLabel: '' });
                    });
                    result.setAsIncomplete();
                }
            }
            return null;
        };
        BowerJSONContribution.prototype.collectValueSuggestions = function (resource, location, currentKey, result) {
            // not implemented. Could be do done calling the bower command. Waiting for web API: https://github.com/bower/registry/issues/26
            return null;
        };
        BowerJSONContribution.prototype.getInfoContribution = function (resource, location) {
            if (this.isBowerFile(resource) && (location.matches(['dependencies', '*']) || location.matches(['devDependencies', '*']))) {
                var pack = location.getSegments()[location.getSegments().length - 1];
                var htmlContent = [];
                htmlContent.push({ className: 'type', text: nls.localize(3, null, pack) });
                var queryUrl = 'https://bower.herokuapp.com/packages/' + encodeURIComponent(pack);
                return this.requestService.makeRequest({
                    url: queryUrl
                }).then(function (success) {
                    try {
                        var obj = JSON.parse(success.responseText);
                        if (obj && obj.url) {
                            var url = obj.url;
                            if (Strings.startsWith(url, 'git://')) {
                                url = url.substring(6);
                            }
                            if (Strings.endsWith(url, '.git')) {
                                url = url.substring(0, url.length - 4);
                            }
                            htmlContent.push({ className: 'documentation', text: url });
                        }
                    }
                    catch (e) {
                    }
                    return htmlContent;
                }, function (error) {
                    return htmlContent;
                });
            }
            return null;
        };
        BowerJSONContribution = __decorate([
            __param(0, request_1.IRequestService)
        ], BowerJSONContribution);
        return BowerJSONContribution;
    }());
    exports.BowerJSONContribution = BowerJSONContribution;
});
//# sourceMappingURL=bowerJSONContribution.js.map