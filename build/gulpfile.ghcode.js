/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

var gulp = require('gulp');
var shell = require('gulp-shell');
var path = require('path');
var _ = require('underscore');
var buildfile = require('../src/forked/buildfile');
var util = require('./lib/util');
var common = require('./gulpfile.common');

var root = path.dirname(__dirname);
var headerVersion = process.env['BUILD_SOURCEVERSION'] || util.getVersion(root);

// Build

var ghcodeEntryPoints = _.flatten([
	buildfile.entrypoint('forked/workbench.main'),
	// buildfile.base,
	buildfile.standaloneLanguages,
	buildfile.standaloneLanguages2,
	buildfile.languages
]);

var ghcodeResources = [
	'out-build/forked/**/*.{svg,png}',
	// 'out-build/vs/**/*.{svg,png}',
	'out-build/vs/{base,editor,workbench}/**/*.{svg,png}',
	'out-build/vs/{base,editor,workbench}/**/*.{woff,ttf}',
	'out-build/themes/**/*.*',
	// 'out-build/vs/base/worker/workerMainCompatibility.html',
	// 'out-build/vs/base/worker/workerMain.{js,js.map}',
	// '!out-build/vs/workbench/**',
	'!**/test/**'
];

var ghcodeOtherSources = [
	'out-build/vs/css.js',
	'out-build/vs/nls.js',
	'out-build/vs/text.js'
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

function ghcodeLoaderConfig(removeAllOSS) {
	var result = common.loaderConfig();

	result.paths.lib = 'out-build/lib';
	result.paths.forked = 'out-build/forked';
	result.paths.githubService = 'out-build/githubService';
	result.paths.githubActions = 'out-build/githubActions';
	result.paths.githubTreeCache = 'out-build/githubTreeCache';
	result.paths.userNavbarItem = 'out-build/userNavbarItem';
	result.paths.repoNavbarItem = 'out-build/repoNavbarItem';
	result.paths.refNavbarItem = 'out-build/refNavbarItem';
	result.paths.welcomePart = 'out-build/welcomePart';

	// TODO: Is this what we want?
	// never ship marked in ghcode
	result.paths['vs/base/common/marked/marked'] = 'out-build/vs/base/common/marked/marked.mock';

	if (removeAllOSS) {
		result.paths['vs/languages/lib/common/beautify-html'] = 'out-build/vs/languages/lib/common/beautify-html.mock';
	}

	return result;
}

gulp.task('clean-optimized-ghcode', util.rimraf('out-build-opt'));
gulp.task('optimize-ghcode', ['clean-optimized-ghcode', 'compile-build'], common.optimizeTask({
	entryPoints: ghcodeEntryPoints,
	otherSources: ghcodeOtherSources,
	resources: ghcodeResources,
	loaderConfig: ghcodeLoaderConfig(false),
	header: BUNDLED_FILE_HEADER,
	out: 'out-build-opt'
}));
gulp.task('build-opt', ['optimize-ghcode']);

gulp.task('clean-minified-ghcode', util.rimraf('out-build-min'));
gulp.task('minify-ghcode', ['clean-minified-ghcode', 'optimize-ghcode'], common.minifyTask('out-build-opt', 'out-build-min', true));
gulp.task('build-min', ['minify-ghcode'], shell.task([
	'cp index.html out-build-min',
	'awk \'/Copyright.*Microsoft/{print " * Copyright (c) Spiffcode, Inc. All rights reserved."}1\' out-build-min/forked/workbench.main.js > /tmp/workbench.main.js',
	'mv /tmp/workbench.main.js out-build-min/forked/workbench.main.js',
]));
// Is this below running optimize-ghcode twice?
// gulp.task('ghcode-distro', ['minify-ghcode', 'optimize-ghcode']);
