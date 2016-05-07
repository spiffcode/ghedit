define(["require", "exports", 'vs/nls!vs/workbench/parts/tasks/common/taskTemplates'], function (require, exports, nls) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var gulp = {
        id: 'gulp',
        label: 'Gulp',
        autoDetect: true,
        content: [
            '{',
            '\t// See http://go.microsoft.com/fwlink/?LinkId=733558',
            '\t// for the documentation about the tasks.json format',
            '\t"version": "0.1.0",',
            '\t"command": "gulp",',
            '\t"isShellCommand": true,',
            '\t"args": ["--no-color"],',
            '\t"showOutput": "always"',
            '}'
        ].join('\n')
    };
    var grunt = {
        id: 'grunt',
        label: 'Grunt',
        autoDetect: true,
        content: [
            '{',
            '\t// See http://go.microsoft.com/fwlink/?LinkId=733558',
            '\t// for the documentation about the tasks.json format',
            '\t"version": "0.1.0",',
            '\t"command": "grunt",',
            '\t"isShellCommand": true,',
            '\t"args": ["--no-color"],',
            '\t"showOutput": "always"',
            '}'
        ].join('\n')
    };
    var npm = {
        id: 'npm',
        label: 'npm',
        sort: 'NPM',
        autoDetect: false,
        content: [
            '{',
            '\t// See http://go.microsoft.com/fwlink/?LinkId=733558',
            '\t// for the documentation about the tasks.json format',
            '\t"version": "0.1.0",',
            '\t"command": "npm",',
            '\t"isShellCommand": true,',
            '\t"showOutput": "always",',
            '\t"suppressTaskName": true,',
            '\t"tasks": [',
            '\t\t{',
            '\t\t\t"taskName": "install",',
            '\t\t\t"args": ["install"]',
            '\t\t},',
            '\t\t{',
            '\t\t\t"taskName": "update",',
            '\t\t\t"args": ["update"]',
            '\t\t},',
            '\t\t{',
            '\t\t\t"taskName": "test",',
            '\t\t\t"args": ["run", "test"]',
            '\t\t}',
            '\t]',
            '}'
        ].join('\n')
    };
    var tscConfig = {
        id: 'tsc.config',
        label: 'TypeScript - tsconfig.json',
        autoDetect: false,
        description: nls.localize(0, null),
        content: [
            '{',
            '\t// See http://go.microsoft.com/fwlink/?LinkId=733558',
            '\t// for the documentation about the tasks.json format',
            '\t"version": "0.1.0",',
            '\t"command": "tsc",',
            '\t"isShellCommand": true,',
            '\t"args": ["-p", "."],',
            '\t"showOutput": "silent",',
            '\t"problemMatcher": "$tsc"',
            '}'
        ].join('\n')
    };
    var tscWatch = {
        id: 'tsc.watch',
        label: 'TypeScript - Watch Mode',
        autoDetect: false,
        description: nls.localize(1, null),
        content: [
            '{',
            '\t// See http://go.microsoft.com/fwlink/?LinkId=733558',
            '\t// for the documentation about the tasks.json format',
            '\t"version": "0.1.0",',
            '\t"command": "tsc",',
            '\t"isShellCommand": true,',
            '\t"args": ["-w", "-p", "."],',
            '\t"showOutput": "silent",',
            '\t"isWatching": true,',
            '\t"problemMatcher": "$tsc-watch"',
            '}'
        ].join('\n')
    };
    var dotnetBuild = {
        id: 'dotnetCore',
        label: '.NET Core',
        sort: 'NET Core',
        autoDetect: false,
        description: nls.localize(2, null),
        content: [
            '{',
            '\t// See http://go.microsoft.com/fwlink/?LinkId=733558',
            '\t// for the documentation about the tasks.json format',
            '\t"version": "0.1.0",',
            '\t"command": "dotnet",',
            '\t"isShellCommand": true,',
            '\t"args": [],',
            '\t"tasks": [',
            '\t\t{',
            '\t\t\t"taskName": "build",',
            '\t\t\t"args": [ ],',
            '\t\t\t"isBuildCommand": true,',
            '\t\t\t"showOutput": "silent",',
            '\t\t\t"problemMatcher": "$msCompile"',
            '\t\t}',
            '\t]',
            '}'
        ].join('\n')
    };
    var msbuild = {
        id: 'msbuild',
        label: 'MSBuild',
        autoDetect: false,
        description: nls.localize(3, null),
        content: [
            '{',
            '\t// See http://go.microsoft.com/fwlink/?LinkId=733558',
            '\t// for the documentation about the tasks.json format',
            '\t"version": "0.1.0",',
            '\t"command": "msbuild",',
            '\t"args": [',
            '\t\t// Ask msbuild to generate full paths for file names.',
            '\t\t"/property:GenerateFullPaths=true"',
            '\t],',
            '\t"taskSelector": "/t:",',
            '\t"showOutput": "silent",',
            '\t"tasks": [',
            '\t\t{',
            '\t\t\t"taskName": "build",',
            '\t\t\t// Show the output window only if unrecognized errors occur.',
            '\t\t\t"showOutput": "silent",',
            '\t\t\t// Use the standard MS compiler pattern to detect errors, warnings and infos',
            '\t\t\t"problemMatcher": "$msCompile"',
            '\t\t}',
            '\t]',
            '}'
        ].join('\n')
    };
    var command = {
        id: 'externalCommand',
        label: 'Others',
        autoDetect: false,
        description: nls.localize(4, null),
        content: [
            '{',
            '\t// See http://go.microsoft.com/fwlink/?LinkId=733558',
            '\t// for the documentation about the tasks.json format',
            '\t"version": "0.1.0",',
            '\t"command": "echo",',
            '\t"isShellCommand": true,',
            '\t"args": ["Hello World"],',
            '\t"showOutput": "always"',
            '}'
        ].join('\n')
    };
    exports.templates = [gulp, grunt, tscConfig, tscWatch, dotnetBuild, msbuild, npm].sort(function (a, b) {
        return (a.sort || a.label).localeCompare(b.sort || b.label);
    });
    exports.templates.push(command);
});
//# sourceMappingURL=taskTemplates.js.map