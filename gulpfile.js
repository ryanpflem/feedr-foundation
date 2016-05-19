var gulp = require('gulp');
var $    = require('gulp-load-plugins')();

var webserver = require('gulp-webserver');
 
gulp.task('webserver', function() {
  gulp.src('./')
    .pipe(webserver({
      port: 3000,
      livereload: true,
      open: true,
      fallback: 'index.html',
      directoryListing: {
        enable: true,
        path: 'root'
      }
    }));
});

var sassPaths = [
  'bower_components/foundation-sites/scss',
  'bower_components/motion-ui/src'
];

gulp.task('sass', function() {
  return gulp.src('scss/app.scss')
    .pipe($.sass({
      includePaths: sassPaths
    })
      .on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', 'ie >= 9']
    }))
    .pipe(gulp.dest('css'));
});

gulp.task('default', ['webserver', 'sass'], function() {
  gulp.watch(['scss/**/*.scss'], ['sass']);
});
