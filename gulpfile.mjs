import gulp from 'gulp';

gulp.task('copy-json', () => {
    return gulp.src('Javascript/**/*').pipe(gulp.dest('dist/Javascript'));
});

gulp.task('migrate', () => {
    return gulp.src('Migrations/**/*').pipe(gulp.dest('dist/Migrations'));
});

gulp.task('js', gulp.series('copy-json'));
gulp.task('migration', gulp.series('migrate'));
