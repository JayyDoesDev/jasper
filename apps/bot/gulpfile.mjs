import gulp from 'gulp';

gulp.task('copy-json', () => {
    return gulp.src('src/javascript/**/*').pipe(gulp.dest('dist/javascript'));
});

gulp.task('migrate', () => {
    return gulp.src('src/migrations/**/*').pipe(gulp.dest('dist/migrations'));
});

gulp.task('js', gulp.series('copy-json'));
gulp.task('migration', gulp.series('migrate'));
