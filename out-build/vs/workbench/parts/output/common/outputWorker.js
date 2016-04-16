var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/platform/markers/common/markers', 'vs/editor/common/services/resourceService', 'vs/base/common/strings', 'vs/base/common/arrays', 'vs/base/common/paths', 'vs/editor/common/core/range', 'vs/platform/workspace/common/workspace'], function (require, exports, winjs_base_1, markers_1, resourceService_1, strings, arrays, paths, range_1, workspace_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /**
     * A base class of text editor worker that helps with detecting links in the text that point to files in the workspace.
     */
    var OutputWorker = (function () {
        function OutputWorker(modeId, resourceService, markerService, contextService) {
            this._modeId = modeId;
            this.resourceService = resourceService;
            this.markerService = markerService;
            this._contextService = contextService;
            var workspace = this._contextService.getWorkspace();
            this.patterns = workspace ? OutputWorker.createPatterns(workspace) : [];
        }
        Object.defineProperty(OutputWorker.prototype, "contextService", {
            get: function () {
                return this._contextService;
            },
            enumerable: true,
            configurable: true
        });
        OutputWorker.prototype.computeLinks = function (resource) {
            var links = [];
            if (!this.patterns.length) {
                return winjs_base_1.TPromise.as(links);
            }
            var model = this.resourceService.get(resource);
            for (var i = 1, lineCount = model.getLineCount(); i <= lineCount; i++) {
                links.push.apply(links, OutputWorker.detectLinks(model.getLineContent(i), i, this.patterns, this._contextService));
            }
            return winjs_base_1.TPromise.as(links);
        };
        OutputWorker.createPatterns = function (workspace) {
            var patterns = [];
            var workspaceRootVariants = arrays.distinct([
                paths.normalize(workspace.resource.fsPath, true),
                paths.normalize(workspace.resource.fsPath, false)
            ]);
            workspaceRootVariants.forEach(function (workspaceRoot) {
                // Example: C:\Users\someone\AppData\Local\Temp\_monacodata_9888\workspaces\express\server.js on line 8, column 13
                patterns.push(new RegExp(strings.escapeRegExpCharacters(workspaceRoot) + '(\\S*) on line ((\\d+)(, column (\\d+))?)', 'gi'));
                // Example: C:\Users\someone\AppData\Local\Temp\_monacodata_9888\workspaces\express\server.js:line 8, column 13
                patterns.push(new RegExp(strings.escapeRegExpCharacters(workspaceRoot) + '(\\S*):line ((\\d+)(, column (\\d+))?)', 'gi'));
                // Example: C:\Users\someone\AppData\Local\Temp\_monacodata_9888\workspaces\mankala\Features.ts(45): error
                // Example: C:\Users\someone\AppData\Local\Temp\_monacodata_9888\workspaces\mankala\Features.ts (45): error
                // Example: C:\Users\someone\AppData\Local\Temp\_monacodata_9888\workspaces\mankala\Features.ts(45,18): error
                // Example: C:\Users\someone\AppData\Local\Temp\_monacodata_9888\workspaces\mankala\Features.ts (45,18): error
                patterns.push(new RegExp(strings.escapeRegExpCharacters(workspaceRoot) + '([^\\s\\(\\)]*)(\\s?\\((\\d+)(,(\\d+))?)\\)', 'gi'));
                // Example: at C:\Users\someone\AppData\Local\Temp\_monacodata_9888\workspaces\mankala\Game.ts
                // Example: at C:\Users\someone\AppData\Local\Temp\_monacodata_9888\workspaces\mankala\Game.ts:336
                // Example: at C:\Users\someone\AppData\Local\Temp\_monacodata_9888\workspaces\mankala\Game.ts:336:9
                patterns.push(new RegExp(strings.escapeRegExpCharacters(workspaceRoot) + '([^:\\s\\(\\)<>\'\"\\[\\]]*)(:(\\d+))?(:(\\d+))?', 'gi'));
            });
            return patterns;
        };
        /**
         * Detect links. Made public static to allow for tests.
         */
        OutputWorker.detectLinks = function (line, lineIndex, patterns, contextService) {
            var links = [];
            patterns.forEach(function (pattern) {
                pattern.lastIndex = 0; // the holy grail of software development
                var match;
                var offset = 0;
                while ((match = pattern.exec(line)) !== null) {
                    // Convert the relative path information to a resource that we can use in links
                    var workspaceRelativePath = strings.rtrim(match[1], '.').replace(/\\/g, '/'); // remove trailing "." that likely indicate end of sentence
                    var resource = void 0;
                    try {
                        resource = contextService.toResource(workspaceRelativePath).toString();
                    }
                    catch (error) {
                        continue; // we might find an invalid URI and then we dont want to loose all other links
                    }
                    // Append line/col information to URI if matching
                    if (match[3]) {
                        var lineNumber = match[3];
                        if (match[5]) {
                            var columnNumber = match[5];
                            resource = strings.format('{0}#{1},{2}', resource, lineNumber, columnNumber);
                        }
                        else {
                            resource = strings.format('{0}#{1}', resource, lineNumber);
                        }
                    }
                    var fullMatch = strings.rtrim(match[0], '.'); // remove trailing "." that likely indicate end of sentence
                    var index = line.indexOf(fullMatch, offset);
                    offset += index + fullMatch.length;
                    var linkRange = {
                        startColumn: index + 1,
                        startLineNumber: lineIndex,
                        endColumn: index + 1 + fullMatch.length,
                        endLineNumber: lineIndex
                    };
                    if (links.some(function (link) { return range_1.Range.areIntersectingOrTouching(link.range, linkRange); })) {
                        return; // Do not detect duplicate links
                    }
                    links.push({
                        range: linkRange,
                        url: resource
                    });
                }
            });
            return links;
        };
        OutputWorker = __decorate([
            __param(1, resourceService_1.IResourceService),
            __param(2, markers_1.IMarkerService),
            __param(3, workspace_1.IWorkspaceContextService)
        ], OutputWorker);
        return OutputWorker;
    }());
    exports.OutputWorker = OutputWorker;
});
//# sourceMappingURL=outputWorker.js.map