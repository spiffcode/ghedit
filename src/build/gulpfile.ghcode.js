/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

var gulp = require('gulp');
var path = require('path');
var _ = require('underscore');
var buildfile = require('../forked/buildfile');
var util = require('./lib/util');
var common = require('./gulpfile.common');

var root = path.dirname(__dirname);
var headerVersion = process.env['BUILD_SOURCEVERSION'] || util.getVersion(root);

// Build

var ghcodeEntryPoints = _.flatten([
	buildfile.entrypoint('vs/editor/editor.main'),
	buildfile.base,
	buildfile.standaloneLanguages,
	buildfile.standaloneLanguages2,
	buildfile.editor,
	buildfile.languages
]);

var ghcodeResources = [
	'out-build/vs/{base,editor}/**/*.{svg,png}',
	'out-build/vs/base/worker/workerMainCompatibility.html',
	'out-build/vs/base/worker/workerMain.{js,js.map}',
	'!out-build/vs/workbench/**',
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

	// never ship marked in ghcode
	result.paths['vs/base/common/marked/marked'] = 'out-build/vs/base/common/marked/marked.mock';
	// never ship octicons in ghcode
	result.paths['vs/base/browser/ui/octiconLabel/octiconLabel'] = 'out-build/vs/base/browser/ui/octiconLabel/octiconLabel.mock';

	if (removeAllOSS) {
		result.paths['vs/languages/lib/common/beautify-html'] = 'out-build/vs/languages/lib/common/beautify-html.mock';
	}

	return result;
}

gulp.task('clean-optimized-ghcode', util.rimraf('out-ghcode'));
gulp.task('optimize-ghcode', ['clean-optimized-ghcode', 'compile-build'], common.optimizeTask({
	entryPoints: ghcodeEntryPoints,
	otherSources: ghcodeOtherSources,
	resources: ghcodeResources,
	loaderConfig: ghcodeLoaderConfig(false),
	header: BUNDLED_FILE_HEADER,
	out: 'out-ghcode'
}));

gulp.task('clean-minified-ghcode', util.rimraf('out-ghcode-min'));
gulp.task('minify-ghcode', ['clean-minified-ghcode', 'optimize-ghcode'], common.minifyTask('out-ghcode', true));
gulp.task('ghcode-distro', ['minify-ghcode', 'optimize-ghcode']);
