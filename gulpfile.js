const {src, dest, task, series, watch, parallel} = require('gulp');
const rm = require('gulp-rm');
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const svgo = require('gulp-svgo');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const reload      = browserSync.reload;

const styles = [
	'./node_modules/normalize.css/normalize.css',
	'src/css/main.scss'
	];

task('clean', () => {
  return src( 'dist/**/*', { read: false })
    .pipe(rm())
}); 

task('copy:html', () => {
	return src('src/*.html')
		.pipe(dest('dist'))
});

task ('images', () => {
  return src('src/*')
	.pipe(imagemin())
  .pipe(dest('dist/'))
});

task('styles', () => {
	return src(styles)
		.pipe(concat('main.min.scss'))
		.pipe(sassGlob())
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({
			cascade: false
		}))
		.pipe(cleanCSS())
		.pipe(dest('./dist'))
});

task('scripts', () => {
	return src('src/js/*.js')
	.pipe(concat('main.min.js', {newLine: ';'}))
	.pipe(babel({
    presets: ['@babel/env']
}))
  .pipe(uglify())
	.pipe(dest('./dist'))
})

task('icons', () => {
	return src('src/img/*.svg')
		.pipe(svgo({
			plugins: [
				{
					removeAttrs: {
						attrs: "(fill|stroke|style|width|height|data.*)"
					}
				}
			]
		}))
		.pipe(dest('dist/images'));
});

task('browser-sync', () => {
	browserSync.init({
			server: {
					baseDir: "./dist"
			}
	});
	gulp.watch("*.html").on("change", reload);
});

task('watch', () => {
	watch('./src/**/*.scss', series ('styles'));
	watch('./src/*.html', series ('copy:html'));
	watch('./src/**/*.js', series ('scripts'));
})

task('default',
 series('clean', 
 parallel('copy:html', 'styles', 'scripts', 'icons','images'),
 parallel('watch', 'browser-sync')));

task ('build',
 series('clean', 
 parallel ('copy:html', 'styles', 'scripts','images')));