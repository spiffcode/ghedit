var gulp = require('gulp');
var run = require('gulp-run');

gulp.task('main-build', function() {
    return run('cd src && tsc').exec();
});

gulp.task('build', ['main-build'], function() {
    return run('cp src/navbarPart.css out-build').exec();
});

gulp.task('clean', function() {
    return run('rm -rf out-build').exec(function() {
        return run('cp -R $(cd "$(cd "src/vs" && echo $(pwd -P))"/../../out && echo $PWD) out-build').exec();
    });
});

gulp.task('push', function() {
    return run('bin/push').exec();
});
