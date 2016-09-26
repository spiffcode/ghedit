/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

var gulp = require('gulp');
var shell = require('gulp-shell');
var path = require('path');
var _ = require('underscore');
var buildfile = require('../../src/ghedit/buildfile');
var util = require('./lib/util');
var common = require('./gulpfile.common');

var root = path.dirname(__dirname);
var headerVersion = process.env['BUILD_SOURCEVERSION'] || util.getVersion(root);

// Build

var gheditEntryPoints = _.flatten([
	buildfile.entrypoint('vs/workbench/workbench.main'),
	buildfile.base,
	// buildfile.standaloneLanguages,
	// buildfile.standaloneLanguages2,
	buildfile.languages
]);

var gheditResources = [
	'out-build/ghedit/**/*.{svg,png}',
	// 'out-build/vs/**/*.{svg,png}',
	// '!out-build/vs/base/browser/ui/splitview/**/*',
	// '!out-build/vs/base/browser/ui/toolbar/**/*',
	// '!out-build/vs/base/browser/ui/octiconLabel/**/*',
	'out-build/vs/{base,editor,workbench}/**/*.{svg,png}',
	'out-build/vs/{base,editor,workbench}/**/*.{woff,ttf}',
	'out-build/themes/**/*.*',
	'out-build/vs/base/worker/workerMainCompatibility.html',
	'out-build/vs/base/worker/workerMain.{js,js.map}',
	'out-build/vs/base/common/worker/*.js',
	'out-build/vs/base/common/errors.js',
	// '!out-build/vs/workbench/**',
	'out-build/monaco-*/**/*.*',
	'out-build/vs/workbench/parts/search/**/*.*',
	'!**/test/**',

	// SUPER-HACK: Do this until finding out why
	// base:buildfile entry points aren't being packed.
	'out-build/vs/base/common/**/*.*',
	'out-build/vs/editor/common/**/*.*',
];

var gheditOtherSources = [
	'out-build/vs/css.js',
	'out-build/vs/nls.js'
	// 'out-build/vs/text.js'
];

var BUNDLED_FILE_HEADER = [
	'/*!-----------------------------------------------------------',
	' * Copyright (c) Microsoft Corporation. All rights reserved.',
	' * Version: ' + headerVersion,
	' * Released under the MIT license',
	' * https://github.com/Microsoft/vscode/blob/master/LICENSE.txt',
	' *-----------------------------------------------------------*/',
	''
].join('\n');

function gheditLoaderConfig() {
	var result = common.loaderConfig();

	result.paths.lib = 'out-build/ghedit/lib';
	result.paths.ghedit = 'out-build/ghedit';
	result.paths.githubService = 'out-build/ghedit/githubService';
	result.paths.githubActions = 'out-build/ghedit/githubActions';
	result.paths.githubTreeCache = 'out-build/ghedit/githubTreeCache';
	result.paths.openRepoHandler = 'out-build/ghedit/openRepoHandler';
	result.paths['github.contribution'] = 'out-build/ghedit/github.contribution';
	result.paths.userNavbarItem = 'out-build/ghedit/userNavbarItem';
	result.paths.welcomePart = 'out-build/ghedit/welcomePart';
	result.paths.menusNavbarItem = 'out-build/ghedit/menusNavbarItem';
	result.paths.fakeElectron = 'out-build/ghedit/fakeElectron';

	// TODO: Is this what we want?
	// never ship marked in ghedit
	// result.paths['vs/base/common/marked/marked'] = 'out-build/vs/base/common/marked/marked.mock';

	result['vs/css'] = { inlineResources: true };

	// if (removeAllOSS) {
	// 	result.paths['vs/languages/lib/common/beautify-html'] = 'out-build/vs/languages/lib/common/beautify-html.mock';
	// }

	return result;
}

gulp.task('clean-optimized-ghedit', util.rimraf('out-build-opt'));
gulp.task('optimize-ghedit', ['clean-optimized-ghedit', 'compile-build'], common.optimizeTask({
	entryPoints: gheditEntryPoints,
	otherSources: gheditOtherSources,
	resources: gheditResources,
	loaderConfig: gheditLoaderConfig(),
	header: BUNDLED_FILE_HEADER,
	bundleInfo: true,
	out: 'out-build-opt'
}));
gulp.task('build-opt', ['optimize-ghedit']);

gulp.task('clean-minified-ghedit', util.rimraf('out-build-min'));
gulp.task('minify-ghedit', ['clean-minified-ghedit', 'optimize-ghedit'], common.minifyTask('out-build-opt', 'out-build-min', true));
gulp.task('build-min', ['minify-ghedit'], shell.task([
	'cp index.html out-build-min',
	'cp favicon.* out-build-min',
	'cp documentation.html out-build-min',
	'cp releasenotes.html out-build-min',
	'awk \'/Copyright.*Microsoft/{print " * Copyright (c) Spiffcode, Inc. All rights reserved."}1\' out-build-min/vs/workbench/workbench.main.js > /tmp/workbench.main.js',
	'mv /tmp/workbench.main.js out-build-min/vs/workbench/workbench.main.js',
]));
// Is this below running optimize-ghedit twice?
// gulp.task('ghedit-distro', ['minify-ghedit', 'optimize-ghedit']);
