const gulp = require('gulp');

gulp.task('copy-json', () => {
    return gulp.src('Javascript/**/*')
        .pipe(
            gulp.dest('dist/Javascript')
        );
});

gulp.task('js', gulp.series('copy-json'));
