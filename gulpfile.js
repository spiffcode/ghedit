/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// Increase max listeners for event emitters
require('events').EventEmitter.defaultMaxListeners = 100;

var gulp = require('gulp');
var shell = require('gulp-shell');
var debug = require('gulp-debug');
var tsb = require('gulp-tsb');
var filter = require('gulp-filter');
var es = require('event-stream');
var watch = require('./build/lib/watch');
var nls = require('./build/lib/nls');
var util = require('./build/lib/util');
var reporter = require('./build/lib/reporter')();
var path = require('path');
var bom = require('gulp-bom');
var sourcemaps = require('gulp-sourcemaps');
var _ = require('underscore');
var quiet = false;
// var quiet = !!process.env['VSCODE_BUILD_QUIET'];

var rootDir = path.join(__dirname, 'src');
var tsOptions = {
	target: 'ES5',
	module: 'amd',
	verbose: !quiet,
	preserveConstEnums: true,
	experimentalDecorators: true,
	sourceMap: true,
	rootDir: rootDir,
	sourceRoot: util.toFileUri(rootDir)
};

function createCompile(build, emitError) {
	var opts = _.clone(tsOptions);
	opts.inlineSources = !!build;

	var ts = tsb.create(opts, null, null, quiet ? null : function (err) {
		reporter(err.toString());
	});

	return function (token) {
		var utf8Filter = filter('**/test/**/*utf8*', { restore: true });
		var tsFilter = filter([
			'**/*.ts',
			'!vs/languages/typescript/common/lib/lib.**.ts'
		], { restore: true });

		var input = es.through();
		var output = input
			.pipe(utf8Filter)
			.pipe(bom())
			.pipe(utf8Filter.restore)
			.pipe(tsFilter)
			.pipe(util.loadSourcemaps())
			.pipe(ts(token))
			.pipe(build ? nls() : es.through())
			.pipe(sourcemaps.write('.', {
				addComment: false,
				includeContent: !!build,
				sourceRoot: tsOptions.sourceRoot
			}))
			.pipe(tsFilter.restore)

			.pipe(quiet ? es.through() : reporter.end(emitError));
		console.log('input: ', input)
		console.log('output: ', output)

		return es.duplex(input, output);
	};
}

function compileTask(out, build) {
	var compile = createCompile(build, true);

	return function () {
		var src = gulp.src('src/**', { base: 'src' });

		return src
			.pipe(compile())
			.pipe(gulp.dest(out));
	};
}

function watchTask(out, build) {
	var compile = createCompile(build);

	return function () {
		var src = gulp.src('src/**', { base: 'src' });
		var watchSrc = watch('src/**', { base: 'src' });

		return watchSrc
			.pipe(util.incremental(compile, src, true))
			.pipe(gulp.dest(out));
	};
}

// Fast compile for development time
gulp.task('clean-client', util.rimraf('out'));
gulp.task('compile-client', ['clean-client'], shell.task([
	'cd src && tsc'
]));
// gulp.task('compile-client', ['clean-client'], compileTask('out', false));
gulp.task('watch-client', ['clean-client'], watchTask('out', false));

// Full compile, including nls and inline sources in sourcemaps, for build
// gulp.task('clean-client-build', util.rimraf('out-build'));
gulp.task('clean-client-build', ['pre-build']);
// gulp.task('compile-client-build', ['clean-client-build'], compileTask('out-build', true));
gulp.task('compile-client-build', ['clean-client-build'], shell.task([
	'cd src && tsc'
]));
gulp.task('watch-client-build', ['clean-client-build'], watchTask('out-build', true));

// Default
gulp.task('default', ['compile']);

// All
// gulp.task('clean', ['clean-client']);
gulp.task('compile', ['compile-client']);
// gulp.task('watch', ['watch-client']);
// gulp.task('clean', ['clean-client', 'clean-extensions']);
// gulp.task('compile', ['compile-client', 'compile-extensions']);
// gulp.task('watch', ['watch-client', 'watch-extensions']);

// All Build
gulp.task('clean-build', ['clean-client-build']);
gulp.task('compile-build', ['compile-client-build']);
gulp.task('watch-build', ['watch-client-build']);
// gulp.task('clean-build', ['clean-client-build', 'clean-extensions-build']);
// gulp.task('compile-build', ['compile-client-build', 'compile-extensions-build']);
// gulp.task('watch-build', ['watch-client-build', 'watch-extensions-build']);

// require('./build/gulpfile.hygiene');
// require('./build/gulpfile.vscode');
require('./build/gulpfile.ghcode');
// require('./build/gulpfile.extensions');

/* -------------------------------------------
 * TASKS from original ghcode gulpfile.js
 * ------------------------------------------*/

gulp.task('clean', shell.task([
	'rsync -a --delete $(cd "$(cd "src/vs" && echo $(pwd -P))"/../../out && echo $PWD)/ out-build',
	'find out-build -iname "*exe" | xargs rm -f'
]));

gulp.task('pre-build', shell.task([
	'cp index.html out-build',
	'mkdir -p out-build/forked',
	'cp src/forked/*.css out-build/forked',
	'cp src/*.css out-build',
	'cp src/forked/*.png out-build/forked',
	'mkdir -p out-build/themes',
	'cp src/themes/*.* out-build/themes',
]));

gulp.task('build', ['pre-build'], shell.task([
	'cd src && tsc'
]));

gulp.task('watch', ['pre-build'], shell.task([
	'cd src && tsc -w'
]));

gulp.task('push', shell.task([
	'GIT_DEPLOY_DIR=out-build bin/push'
]));

gulp.task('push-min-nobuild', shell.task([
	'GIT_DEPLOY_DIR=out-build-min bin/push'
]));

gulp.task('push-min', ['build-min'], shell.task([
	'GIT_DEPLOY_DIR=out-build-min bin/push'
]));
