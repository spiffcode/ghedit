var gulp = require('gulp');
var shell = require('gulp-shell');

gulp.task('clean', shell.task([
    'rsync -a --delete $(cd "$(cd "src/vs" && echo $(pwd -P))"/../../out && echo $PWD)/ out-build'
]));

gulp.task('build', shell.task([
    'cp index.html out-build',
    'cp src/navbarPart.css out-build',
    'cd src && tsc'
]));

gulp.task('push', shell.task([
    'bin/push'
]));
