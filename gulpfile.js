var gulp = require('gulp');
var shell = require('gulp-shell');

gulp.task('clean', shell.task([
    'rm -rf out-build',
    'cp -R $(cd "$(cd "src/vs" && echo $(pwd -P))"/../../out && echo $PWD) out-build'
]));

gulp.task('build', shell.task([
    'cd src && tsc',
    'cp index.html out-build',
    'cp src/navbarPart.css out-build'
]));

gulp.task('push', shell.task([
    'bin/push'
]));
