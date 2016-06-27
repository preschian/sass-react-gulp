var gulp        = require('gulp');
var processhtml = require('gulp-processhtml');
var sass        = require('gulp-sass');
var sourcemaps  = require('gulp-sourcemaps');
var uglify      = require('gulp-uglify');
var watch       = require('gulp-watch');
var liveServer  = require('live-server');
var path        = require('path');
var run         = require('run-sequence');

// react dependencies
var babelify    = require('babelify');
var browserify  = require('browserify');
var chalk       = require('chalk');
var duration    = require('gulp-duration');
var notify      = require('gulp-notify');
var gutil       = require('gulp-util');
var merge       = require('utils-merge');
var buffer      = require('vinyl-buffer');
var source      = require('vinyl-source-stream');
var watchify    = require('watchify');

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
        OUTPUT: path.join(DIST, 'assets/js'),
        FILENAME : 'script.js'
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

// compile sass
gulp.task('sass', ['sass:compile'], function() {
    watch(PATH.SASS.WATCH, function() {
        run('sass:compile');
    });
});

gulp.task('sass:compile', function() {
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

// compile html
gulp.task('html', ['html:compile'], function () {
    watch(PATH.HTML.WATCH, function() {
        run('html:compile');
    });
});

gulp.task('html:compile', function () {
    return gulp.src(PATH.HTML.BUILD)
        .pipe(processhtml())
        .pipe(gulp.dest(PATH.HTML.OUTPUT));
});

// compile react
/*eslint no-undef: "error"*/
/*eslint-env node*/
function mapError(err) {
    if (err.fileName) {
        gutil.log(chalk.red(err.name)
            + ': ' + chalk.yellow(err.fileName.replace(__dirname + '/build/jsx/', ''))
            + ': ' + 'Line ' + chalk.magenta(err.lineNumber)
            + ' & ' + 'Column ' + chalk.magenta(err.columnNumber || err.column)
            + ': ' + chalk.blue(err.description));
    } else {
        gutil.log(chalk.red(err.name)
            + ': '
            + chalk.yellow(err.message));
    }
}

function bundle(bundler) {
    var bundleTimer = duration('Javascript bundle time');

    bundler
        .bundle()
        .on('error', mapError)
        .pipe(source(PATH.JSX.FILENAME))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(gulp.dest(PATH.JSX.OUTPUT))
        .pipe(bundleTimer)
        .pipe(notify({
            message: 'React JSX recompile...'
        }));
}

gulp.task('react', function() {
    var args = merge(watchify.args, { debug: true });

    var bundler = browserify(PATH.JSX.BUILD, args)
        .plugin(watchify, { ignoreWatch: ['**/node_modules/**', '**/bower_components/**'] })
        .transform(babelify, { presets: ['es2015', 'react'] });

    bundle(bundler);

    bundler.on('update', function() {
        bundle(bundler);
    });
});

gulp.task('react:min', function() {
    return browserify(PATH.JSX.BUILD)
        .transform(babelify, { presets: ['es2015', 'react'] })
        .bundle()
        .pipe(source(PATH.JSX.FILENAME))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest(PATH.JSX.OUTPUT));
});

// running all task
gulp.task('default', function() {
    run('sass', 'html', 'react', 'serve');
});

// minify sass and react
gulp.task('build', function() {
    run('sass:min', 'react:min');
});
