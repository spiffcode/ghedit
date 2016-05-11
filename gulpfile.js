var gulp = require('gulp');
var shell = require('gulp-shell');

gulp.task('clean', shell.task([
    'rsync -a --delete $(cd "$(cd "src/vs" && echo $(pwd -P))"/../../out && echo $PWD)/ out-build'
]));

gulp.task('build', shell.task([
    'cp index.html out-build',
    'mkdir -p out-build/forked && cp src/forked/navbarPart.css out-build/forked',
    'cd src && tsc'
]));

gulp.task('watch', shell.task([
    'cp index.html out-build',
    'mkdir -p out-build/forked && cp src/forked/navbarPart.css out-build/forked',
    'cd src && tsc -w'
]));

gulp.task('push', shell.task([
    'bin/push'
]));
