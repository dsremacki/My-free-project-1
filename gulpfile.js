/* gulp plugins variables */

const gulp         = require('gulp');
const sass         = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const rename       = require('gulp-rename');
const cleanCss     = require('gulp-clean-css');
const htmlMin      = require('gulp-htmlmin');
const uglify       = require('gulp-uglify');
const browserSync  = require('browser-sync');
const sourcemaps   = require('gulp-sourcemaps');
const imagemin     = require('gulp-imagemin');
const babel        = require('gulp-babel');
const plumber      = require('gulp-plumber');
const notify       = require('gulp-notify');
const zip          = require('gulp-zip');
const rm           = require('rimraf');
const gulpif       = require('gulp-if');
const { argv }     = require('yargs');
const eyeglass     = require('eyeglass');
const concat       = require('gulp-concat');
const font2css     = require('gulp-font2css').default;
const webpack      = require('webpack');

/* tasks declaration */
function cssTask() {
    return gulp.src('./src/scss/**/*.{sass,scss}')
        .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
        .pipe(gulpif(!argv.production, sourcemaps.init()))
        .pipe(sass(eyeglass()).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 6 versions'],
            cascade: false,
        }))
        .pipe(cleanCss({
            compatibility: 'ie8',
        }))
        .pipe(rename((path) => { path.basename += '.min'; }))
        .pipe(gulpif(!argv.production, sourcemaps.write('.')))
        .pipe(gulp.dest('./docs/css'));
}

function htmlTask() {
    return gulp.src('src/*.html')
        .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
        .pipe(gulpif(argv.production, htmlMin({ collapseWhitespace: true })))
        .pipe(gulp.dest('docs'));
}

function jsTask() {
    return gulp.src('./src/js/*.js')
        .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
        .pipe(babel({ presets: ['env'] }))
        .pipe(gulpif(argv.production, uglify()))
        .pipe(rename((path) => { path.basename += '.min'; }))
        .pipe(gulp.dest('./docs/js'));
}

function imgTask() {
    return gulp.src('src/images/*.{gif,jpg,png,svg,jpeg}')
        .pipe(imagemin())
        .pipe(gulp.dest('docs/images'));
}
function fontTask(){
    return gulp.src('src/fonts/**/*.{otf,ttf,woff,woff2}')
      .pipe(font2css())
      .pipe(concat('fonts.css'))
      .pipe(gulp.dest('docs/fonts'))
  }

function compress() {
    return gulp.src('docs/**/*')
        .pipe(zip(`${process.env.npm_package_name}.zip`))
        .pipe(gulp.dest('./'));
}

function cleanDist(done) {
    rm('./docs/', done);
}

function refresh(done) {
    browserSync.init({
        server: {
            baseDir: './docs/',
        },
        port: '8080',
    });
    done();
}

/* default task and watch */
gulp.task('watch', gulp.series(cssTask, jsTask, htmlTask, refresh, imgTask,fontTask, () => {
    gulp.watch('./src/scss/**/*.{sass,scss}', gulp.series(cssTask));
    gulp.watch('./src/js/*.js', gulp.series(jsTask));
    gulp.watch('./src/*.html', gulp.series(htmlTask));
    gulp.watch('./docs/*.html').on('change', browserSync.reload);
    gulp.watch('./docs/css/*.css').on('change', browserSync.reload);
    gulp.watch('./docs/js/*.js').on('change', browserSync.reload);
}));

gulp.task('default', gulp.series('watch'));

gulp.task('scripts', function(callback) {
    webpack(require('webpack.config.js'), function(err, stats) {
        if(err) {
            console.log(err.toString())
        }
        console.log(stats.toString());
        callback(); 
    });
});