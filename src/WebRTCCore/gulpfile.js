var gulp = require('gulp'),
	cleanCSS = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    webpack = require('webpack-stream'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    bower = require('bower-webpack-plugin'),
    named = require('vinyl-named'),
    wb = require('webpack'),
    rimraf = require('gulp-rimraf'),
    ignore = require('gulp-ignore');

var root = './wwwroot';
var output = root + '/dist';

var js = {
    app: root + '/dev/js',
    bower: root + '/lib',
    outputBundleName: '[name].bundle.js',
    dist: root + '/dist/*.*',
    bundles: [
        root + '/dev/js/app.js'
    ],
    libs: {
        jquery: root + '/lib/jquery/dist/jquery.min.js',
        dist: output + '/libs.bundle.js'
    }
}

/*var css = {
    dist: output + '/bundle.css'
}

gulp.task('css:clear', function (cb) {
    return gulp.src(css.dist, { read: false })
        .pipe(rimraf());
});

gulp.task('css:build', function () {
    return gulp.src([])
            .pipe(concat(css.dist))
            .pipe(cleanCSS())
            .pipe(gulp.dest('.'));
})

gulp.task('css', ['css:clear', 'css:build']);*/

gulp.task('js:clear', function (cb) {
    return gulp.src(js.dist, { read: false })
        .pipe(ignore('bundle.css'))
        .pipe(rimraf());
});

gulp.task('js:build', function () {
    return gulp.src([js.libs.jquery, js.libs.jqueryVal, js.libs.jqueryValUnobtrusive, js.libs.chameleonValidation])
        .pipe(concat(js.libs.dist))
        .pipe(uglify())
        .pipe(gulp.dest('.'));
});

gulp.task('webpack', ['js:clear'], function () {
    return gulp.src(js.bundles)
        .pipe(named())
        .pipe(
        webpack({
            watch: true,
            devtool: 'source-map',
            resolve: {
                'modulesDirectory': [js.bower, js.app]
            },
            output: {
                filename: js.outputBundleName,
            },
            module: {
                loaders: [{
                    test: /\.js$/,
                    loader: 'babel',
                    exclude: [/node_modules/],
                    query: {
                        plugins: ['transform-runtime'],
                        presets: ['es2015']
                    }
                },
                {
                    test: /\.css$/,
                    loader: 'style-loader!css-loader'
                },
                {
                    test: /\.png$/,
                    loader: 'url-loader?limit=100000'
                },
                {
                    test: /\.jpg$/,
                    loader: 'file-loader'
                }]
            },
            plugins: [
                new bower(),
                new wb.optimize.UglifyJsPlugin({ minimize: true })
            ]
        })
        ).pipe(gulp.dest(output));
});

//gulp.task('build', ['webpack', 'css']);