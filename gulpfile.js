var gulp = require('gulp'),
    less = require('gulp-less'),
    prefixer = require('gulp-autoprefixer');

gulp.task('less', function(){
    return gulp.src('./assets/theme/less/main.less')
        .pipe(less())
        .pipe(prefixer({cascade: true}))
        .pipe(gulp.dest('./assets/theme/css'));
});

gulp.task('default', function(){
    gulp.watch('**/*.less', ['less']);
});
