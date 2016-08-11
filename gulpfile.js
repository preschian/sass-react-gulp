var gulp            = require('gulp');
var processhtml     = require('gulp-processhtml');
var sass            = require('gulp-sass');
var sourcemaps      = require('gulp-sourcemaps');
var uglify          = require('gulp-uglify');
var watch           = require('gulp-watch');
var liveServer      = require('live-server');
var path            = require('path');
var run             = require('run-sequence');
var webpack         = require('webpack-stream');

// PATH
var BUILD   = './build';
var DIST    = './dist';
var PATH    = {
    HTML: {
        BUILD: path.join(BUILD, 'html/*.html'),
        WATCH: path.join(BUILD, 'html/**/*.html'),
        OUTPUT: DIST
    },
    SASS: {
        BUILD: path.join(BUILD, 'sass/style.scss'),
        WATCH: path.join(BUILD, 'sass/**/*.scss'),
        OUTPUT: path.join(DIST, 'assets/css')
    },
    JSX: {
        BUILD: path.join(BUILD, 'jsx/script.js'),
        WATCH: path.join(BUILD, 'jsx/**/*.js'),
        OUTPUT: path.join(DIST, 'assets/js')
    }
};

// serve localhost
var CONFIG = {
    port: 8000,
    root: './dist',
    open: true,
    file: 'index.html'
};

gulp.task('serve', function() {
    liveServer.start(CONFIG);
});

// compile html
gulp.task('html', function() {
    return gulp.src(PATH.HTML.BUILD)
        .pipe(processhtml())
        .pipe(gulp.dest(PATH.HTML.OUTPUT));
});

// compile sass
gulp.task('sass', function() {
    return gulp.src(PATH.SASS.BUILD)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(PATH.SASS.OUTPUT));
});

gulp.task('sass:min', function() {
    return gulp.src(PATH.SASS.BUILD)
        .pipe(sass({ outputStyle: 'compressed' }))
        .pipe(gulp.dest(PATH.SASS.OUTPUT));
});

// compile reactjs
gulp.task('react', function() {
    return gulp.src(PATH.JSX.WATCH)
        .pipe(webpack( require('./webpack.config.js') ))
        .pipe(gulp.dest(PATH.JSX.OUTPUT));
});

// watch development files
gulp.task('watch', function() {
    watch(PATH.SASS.WATCH, function() { run('sass') });
    watch(PATH.HTML.WATCH, function() { run('html') });
    watch(PATH.JSX.WATCH, function() { run('react'); });
});

// running all task
gulp.task('default', function() {
    run('html', 'sass', 'react', 'serve', 'watch');
});
