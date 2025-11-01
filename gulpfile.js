// @ts-nocheck
import gulp from 'gulp';
const { src, dest, watch, parallel, series } = gulp;
import sass from 'gulp-sass';
import * as dartSass from 'sass';
const scss = sass(dartSass);
import concat from 'gulp-concat';
import gulpUglify from 'gulp-uglify-es';
const uglify = gulpUglify.default;
import browserSync from 'browser-sync';
import autoprefixer from 'gulp-autoprefixer';
import clean from 'gulp-clean';
import avif from 'gulp-avif';
import webp from 'gulp-webp';
import imagemin from 'gulp-imagemin';
import fonter from 'gulp-fonter';
import ttf2woff2 from 'gulp-ttf2woff2';
import newer from 'gulp-newer';
import include from 'gulp-include';

function pages() {
    return src('app/pages/*.html')
        .pipe(include({
            includePaths: 'app/components'
        }))
        .pipe(dest('app'))
        .pipe(browserSync.stream())
}

function fontsConvert() {
    return src('app/fonts/src/*.*')
        .pipe(fonter({
            formats: ['woff', 'ttf']
        }))
        .pipe(dest('app/fonts'))
}

function fontsWoff2() {
    return src('app/fonts/*.ttf')
        .pipe(ttf2woff2())
        .pipe(dest('app/fonts'))
}

const fonts = series(fontsConvert, fontsWoff2);

function images() {
    return src('app/images/src/*.*', { encoding: false })
        .pipe(newer('app/images'))
        .pipe(dest('app/images'))
        .pipe(src(['app/images/src/*.*', '!app/images/src/*.svg'], { encoding: false }))
        .pipe(newer({ dest: 'app/images', ext: '.avif' }))
        .pipe(avif({ quality: 50 }).on('error', function (err) {
            console.log('AVIF Error:', err.message);
            this.emit('end');
        }))
        .pipe(dest('app/images'))
        .pipe(src(['app/images/src/*.*', '!app/images/src/*.svg'], { encoding: false }))
        .pipe(newer({ dest: 'app/images', ext: '.webp' }))
        .pipe(webp().on('error', function (err) {
            console.log('WebP Error:', err.message);
            this.emit('end');
        }))
        .pipe(dest('app/images'))
}

function scripts() {
    return src(['app/js/main.js'])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}

function styles() {
    return src(['app/scss/style.scss'])
        .pipe(autoprefixer({ overrideBrowserslist: ['last 10 version'] }))
        .pipe(concat('style.min.css'))
        .pipe(scss({ outputStyle: 'compressed' }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}

function watching() {
    browserSync.init({
        server: {
            baseDir: "app/"
        }
    });
    watch(['app/scss/**/*.scss'], styles);
    watch(['app/images/src/**/*'], images);
    watch(['app/pages/**/*.html', 'app/components/**/*.html'], pages);
    watch(['app/js/**/*.js', '!app/js/**/*.min.js'], scripts);
    watch(['app/*.html']).on('change', browserSync.reload);
}

function cleanDist() {
    return src('dist', { allowEmpty: true })
        .pipe(clean({ force: true }))
}

function building() {
    return src([
        'app/css/style.min.css',
        'app/images/*.*',
        '!app/images/*.svg',
        'app/images/**/*.svg',
        'app/fonts/*.*',
        'app/js/main.min.js',
        'app/**/*.html',
        '!app/pages/**/*.html',
        '!app/components/**/*.html'
    ], { base: 'app', allowEmpty: true, encoding: false })
        .pipe(dest('dist'))
}

export { styles, images, fonts, pages, scripts, watching, building };
export const build = series(cleanDist, parallel(styles, scripts, images, fonts, pages), building);
export default parallel(styles, images, scripts, pages, watching);