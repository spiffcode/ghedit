var gulp = require('gulp');
var shell = require('gulp-shell');

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
	'bin/push'
]));
